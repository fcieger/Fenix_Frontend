import { PoolClient } from 'pg';

export async function ensureCoreSchema(client: PoolClient) {
  // Tabela de controle de migrações
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Helper para aplicar migração apenas uma vez
  async function applyOnce(id: string, sql: string) {
    const res = await client.query('SELECT 1 FROM _migrations WHERE id = $1', [id]);
    if (res.rowCount && res.rowCount > 0) return; // já aplicada
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO _migrations (id) VALUES ($1)', [id]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
  }

  // Extensões comuns (em managed PG pode já existir)
  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  // Colunas adicionais em movimentações (usadas pelos endpoints)
  await client.query(`
    ALTER TABLE movimentacoes_financeiras
      ADD COLUMN IF NOT EXISTS id_origem UUID,
      ADD COLUMN IF NOT EXISTS tela_origem TEXT,
      ADD COLUMN IF NOT EXISTS parcela_id UUID;
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_mov_parcela ON movimentacoes_financeiras (tela_origem, parcela_id) WHERE parcela_id IS NOT NULL;
  `);

  // Estoque: locais_estoque
  await applyOnce(
    '2025-10-30_estoque_locais',
    `
    CREATE TABLE IF NOT EXISTS locais_estoque (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome TEXT NOT NULL,
      codigo TEXT,
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      "companyId" UUID NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_locais_company ON locais_estoque("companyId");
  `);

  // Estoque: estoque_movimentos (histórico)
  await applyOnce(
    '2025-10-30_estoque_movimentos',
    `
    CREATE TABLE IF NOT EXISTS estoque_movimentos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "produtoId" UUID NOT NULL,
      "localOrigemId" UUID,
      "localDestinoId" UUID,
      tipo TEXT NOT NULL CHECK (tipo IN ('entrada','saida','transferencia','ajuste')),
      qtd NUMERIC(14,3) NOT NULL,
      "custoUnitario" NUMERIC(14,6) NOT NULL DEFAULT 0,
      "custoTotal" NUMERIC(14,2) NOT NULL DEFAULT 0,
      origem TEXT,
      "origemId" UUID,
      "dataMov" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "companyId" UUID NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_mov_produto_data ON estoque_movimentos("produtoId","dataMov");
    CREATE INDEX IF NOT EXISTS idx_mov_origem ON estoque_movimentos(origem,"origemId");
  `);

  // Estoque: colunas auxiliares em companies e produtos (passo 0)
  await applyOnce(
    '2025-10-30_estoque_passo0_cols',
    `
    ALTER TABLE companies
      ADD COLUMN IF NOT EXISTS "defaultLocalEstoqueId" UUID;

    ALTER TABLE produtos
      ADD COLUMN IF NOT EXISTS "controlaEstoque" BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS "estoqueMinimo" NUMERIC(14,3) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "localPadraoId" UUID;

    CREATE INDEX IF NOT EXISTS idx_prod_controla_estoque ON produtos("controlaEstoque");
  `);

  // Inventário: tabelas básicas
  await applyOnce(
    '2025-10-30_estoque_inventario',
    `
    CREATE TABLE IF NOT EXISTS estoque_inventarios (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "localId" UUID NOT NULL,
      status TEXT NOT NULL DEFAULT 'aberto',
      observacao TEXT,
      "companyId" UUID NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_inv_company ON estoque_inventarios("companyId", "createdAt" DESC);

    CREATE TABLE IF NOT EXISTS estoque_inventarios_itens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "inventarioId" UUID NOT NULL REFERENCES estoque_inventarios(id) ON DELETE CASCADE,
      "produtoId" UUID NOT NULL,
      "qtdSistema" NUMERIC(14,3) NOT NULL DEFAULT 0,
      "qtdContada" NUMERIC(14,3) NOT NULL DEFAULT 0,
      diferenca NUMERIC(14,3) NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("inventarioId","produtoId")
    );
    CREATE INDEX IF NOT EXISTS idx_inv_itens_inv ON estoque_inventarios_itens("inventarioId");
  `);

  // Estoque: saldos persistidos + trigger de atualização
  await applyOnce(
    '2025-10-30_estoque_saldos_persist',
    `
    CREATE TABLE IF NOT EXISTS estoque_saldos (
      "produtoId" UUID NOT NULL,
      "localId" UUID NOT NULL,
      "companyId" UUID NOT NULL,
      qtd NUMERIC(14,3) NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY ("produtoId","companyId","localId")
    );
    CREATE INDEX IF NOT EXISTS idx_saldos_company_prod_local ON estoque_saldos("companyId","produtoId","localId");

    CREATE OR REPLACE FUNCTION fn_upsert_estoque_saldo(p_prod uuid, p_local uuid, p_company uuid, p_delta numeric)
    RETURNS void AS $$
    BEGIN
      INSERT INTO estoque_saldos ("produtoId","localId","companyId",qtd,"updatedAt")
      VALUES (p_prod, p_local, p_company, p_delta, now())
      ON CONFLICT ("produtoId","companyId","localId") DO UPDATE
        SET qtd = estoque_saldos.qtd + EXCLUDED.qtd,
            "updatedAt" = now();
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION trg_estoque_movimentos_update_saldo()
    RETURNS trigger AS $$
    DECLARE
      v_delta numeric;
    BEGIN
      -- entradas somam no destino
      IF NEW.tipo = 'entrada' THEN
        IF NEW."localDestinoId" IS NOT NULL THEN
          PERFORM fn_upsert_estoque_saldo(NEW."produtoId", NEW."localDestinoId", NEW."companyId", NEW.qtd);
        END IF;
      ELSIF NEW.tipo = 'saida' THEN
        IF NEW."localOrigemId" IS NOT NULL THEN
          PERFORM fn_upsert_estoque_saldo(NEW."produtoId", NEW."localOrigemId", NEW."companyId", -NEW.qtd);
        END IF;
      ELSIF NEW.tipo = 'transferencia' THEN
        IF NEW."localOrigemId" IS NOT NULL THEN
          PERFORM fn_upsert_estoque_saldo(NEW."produtoId", NEW."localOrigemId", NEW."companyId", -NEW.qtd);
        END IF;
        IF NEW."localDestinoId" IS NOT NULL THEN
          PERFORM fn_upsert_estoque_saldo(NEW."produtoId", NEW."localDestinoId", NEW."companyId", NEW.qtd);
        END IF;
      ELSIF NEW.tipo = 'ajuste' THEN
        -- Ajuste: se destino informado, soma; se origem informado, subtrai; senão usa sinal de qtd
        IF NEW."localDestinoId" IS NOT NULL THEN
          PERFORM fn_upsert_estoque_saldo(NEW."produtoId", NEW."localDestinoId", NEW."companyId", NEW.qtd);
        ELSIF NEW."localOrigemId" IS NOT NULL THEN
          PERFORM fn_upsert_estoque_saldo(NEW."produtoId", NEW."localOrigemId", NEW."companyId", -NEW.qtd);
        ELSE
          v_delta := COALESCE(NEW.qtd,0);
          IF v_delta >= 0 THEN
            -- sem local definido, não há como alocar; ignorar
          ELSE
            -- idem
          END IF;
        END IF;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_mov_update_saldo ON estoque_movimentos;
    CREATE TRIGGER trg_mov_update_saldo
      AFTER INSERT ON estoque_movimentos
      FOR EACH ROW EXECUTE FUNCTION trg_estoque_movimentos_update_saldo();

    -- Backfill saldos a partir dos movimentos existentes
    INSERT INTO estoque_saldos ("produtoId","localId","companyId",qtd,"updatedAt")
    SELECT t."produtoId", t."localId", t."companyId", SUM(t.delta) AS qtd, now()
    FROM (
      SELECT m."produtoId", m."localDestinoId" AS "localId", m."companyId", SUM(m.qtd) AS delta
      FROM estoque_movimentos m
      WHERE m."localDestinoId" IS NOT NULL AND m.tipo IN ('entrada','transferencia','ajuste')
      GROUP BY m."produtoId", m."localDestinoId", m."companyId"
      UNION ALL
      SELECT m."produtoId", m."localOrigemId" AS "localId", m."companyId", SUM(-m.qtd) AS delta
      FROM estoque_movimentos m
      WHERE m."localOrigemId" IS NOT NULL AND m.tipo IN ('saida','transferencia','ajuste')
      GROUP BY m."produtoId", m."localOrigemId", m."companyId"
    ) t
    GROUP BY t."produtoId", t."localId", t."companyId"
    ON CONFLICT ("produtoId","companyId","localId") DO UPDATE SET
      qtd = EXCLUDED.qtd,
      "updatedAt" = now();
    `);

  // Contas a receber
  await applyOnce('cr_core_tables_v1', `
    CREATE TABLE IF NOT EXISTS contas_receber (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      titulo TEXT NOT NULL,
      valor_total DECIMAL(15,2) NOT NULL,
      conta_contabil_id UUID,
      data_emissao DATE NOT NULL,
      data_quitacao DATE,
      competencia TEXT,
      centro_custo_id UUID,
      origem TEXT,
      observacoes TEXT,
      status TEXT NOT NULL DEFAULT 'PENDENTE',
      company_id UUID NOT NULL,
      cadastro_id UUID,
      parcelamento_id UUID,
      bloqueado BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parcelas_contas_receber (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conta_receber_id UUID NOT NULL REFERENCES contas_receber(id) ON DELETE CASCADE,
      titulo_parcela TEXT NOT NULL,
      data_vencimento DATE NOT NULL,
      data_pagamento DATE,
      data_compensacao DATE,
      valor_parcela DECIMAL(15,2) NOT NULL,
      diferenca DECIMAL(15,2) DEFAULT 0,
      valor_total DECIMAL(15,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendente',
      forma_pagamento_id UUID,
      conta_corrente_id UUID,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contas_receber_conta_contabil (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conta_receber_id UUID NOT NULL REFERENCES contas_receber(id) ON DELETE CASCADE,
      conta_contabil_id UUID NOT NULL,
      valor DECIMAL(15,2) NOT NULL,
      percentual DECIMAL(9,4) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contas_receber_conta_contabil_parcela (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conta_receber_id UUID NOT NULL REFERENCES contas_receber(id) ON DELETE CASCADE,
      parcela_id UUID NOT NULL REFERENCES parcelas_contas_receber(id) ON DELETE CASCADE,
      conta_contabil_id UUID NOT NULL,
      valor DECIMAL(15,2) NOT NULL,
      percentual DECIMAL(9,4) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contas_receber_centro_custo (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conta_receber_id UUID NOT NULL REFERENCES contas_receber(id) ON DELETE CASCADE,
      centro_custo_id UUID NOT NULL,
      valor DECIMAL(15,2) NOT NULL,
      percentual DECIMAL(9,4) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contas_receber_centro_custo_parcela (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conta_receber_id UUID NOT NULL REFERENCES contas_receber(id) ON DELETE CASCADE,
      parcela_id UUID NOT NULL REFERENCES parcelas_contas_receber(id) ON DELETE CASCADE,
      centro_custo_id UUID NOT NULL,
      valor DECIMAL(15,2) NOT NULL,
      percentual DECIMAL(9,4) NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_parc_cr_id ON parcelas_contas_receber(conta_receber_id);
  `);
}



