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

  // View para fluxo de caixa - unifica movimentações, contas a receber e contas a pagar
  await applyOnce('2025-11-20_fluxo_caixa_view', `
    -- View unificada para fluxo de caixa
    DROP VIEW IF EXISTS vw_fluxo_caixa CASCADE;
    
    CREATE VIEW vw_fluxo_caixa AS
    SELECT 
      'movimentacao'::text as origem_tipo,
      m.id::text as origem_id,
      DATE(m.data_movimentacao) as data,
      m.data_movimentacao as data_timestamp,
      COALESCE(cf."companyId", NULL) as company_id,
      cf.id::text as conta_id,
      CASE 
        WHEN m.tipo_movimentacao = 'entrada' THEN m.valor_entrada
        WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_entrada > 0 THEN m.valor_entrada
        ELSE 0
      END as valor_entrada,
      CASE 
        WHEN m.tipo_movimentacao = 'saida' THEN m.valor_saida
        WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_saida > 0 THEN m.valor_saida
        ELSE 0
      END as valor_saida,
      COALESCE(m.descricao, 'Movimentação financeira') as descricao,
      COALESCE(m.situacao, 'pago') as status,
      NULL::text as parcela_id
    FROM movimentacoes_financeiras m
    INNER JOIN contas_financeiras cf ON m.conta_id = cf.id
    WHERE COALESCE(m.situacao, 'pago') IN ('pago', 'pendente')
      AND COALESCE(cf."companyId", NULL) IS NOT NULL
    
    UNION ALL
    
    -- Contas a receber (parcelas pagas e pendentes)
    SELECT 
      'conta_receber'::text as origem_tipo,
      p.conta_receber_id::text as origem_id,
      CASE 
        WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN DATE(p.data_pagamento)
        ELSE DATE(p.data_vencimento)
      END as data,
      CASE 
        WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN p.data_pagamento::timestamp
        ELSE p.data_vencimento::timestamp
      END as data_timestamp,
      cr.company_id,
      COALESCE(p.conta_corrente_id::text, NULL) as conta_id,
      p.valor_parcela as valor_entrada,
      0::decimal(15,2) as valor_saida,
      COALESCE('Recebimento: ' || cr.titulo || ' - ' || p.titulo_parcela, '') as descricao,
      p.status as status,
      p.id::text as parcela_id
    FROM parcelas_contas_receber p
    INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
    WHERE p.status IN ('pago', 'pendente')
    
    UNION ALL
    
    -- Contas a pagar (parcelas pagas e pendentes)
    SELECT 
      'conta_pagar'::text as origem_tipo,
      p.conta_pagar_id::text as origem_id,
      CASE 
        WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN DATE(p.data_pagamento)
        ELSE DATE(p.data_vencimento)
      END as data,
      CASE 
        WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN p.data_pagamento::timestamp
        ELSE p.data_vencimento::timestamp
      END as data_timestamp,
      cp.company_id,
      COALESCE(p.conta_corrente_id::text, NULL) as conta_id,
      0::decimal(15,2) as valor_entrada,
      p.valor_parcela as valor_saida,
      COALESCE('Pagamento: ' || cp.titulo || ' - ' || p.titulo_parcela, '') as descricao,
      p.status as status,
      p.id::text as parcela_id
    FROM parcelas_contas_pagar p
    INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
    WHERE p.status IN ('pago', 'pendente');

    -- Comentários na view
    COMMENT ON VIEW vw_fluxo_caixa IS 'View unificada para fluxo de caixa agregando movimentações financeiras, contas a receber e contas a pagar';
  `);

  // Recriar view com correções para incluir pendentes
  await applyOnce('2025-11-21_fluxo_caixa_view_fix', `
    DROP VIEW IF EXISTS vw_fluxo_caixa CASCADE;
    
    CREATE VIEW vw_fluxo_caixa AS
    SELECT 
      'movimentacao'::text as origem_tipo,
      m.id::text as origem_id,
      DATE(m.data_movimentacao) as data,
      m.data_movimentacao as data_timestamp,
      COALESCE(cf."companyId", NULL) as company_id,
      cf.id::text as conta_id,
      CASE 
        WHEN m.tipo_movimentacao = 'entrada' THEN m.valor_entrada
        WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_entrada > 0 THEN m.valor_entrada
        ELSE 0
      END as valor_entrada,
      CASE 
        WHEN m.tipo_movimentacao = 'saida' THEN m.valor_saida
        WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_saida > 0 THEN m.valor_saida
        ELSE 0
      END as valor_saida,
      COALESCE(m.descricao, 'Movimentação financeira') as descricao,
      COALESCE(m.situacao, 'pago') as status,
      NULL::text as parcela_id
    FROM movimentacoes_financeiras m
    INNER JOIN contas_financeiras cf ON m.conta_id = cf.id
    WHERE COALESCE(m.situacao, 'pago') IN ('pago', 'pendente')
      AND COALESCE(cf."companyId", NULL) IS NOT NULL
    
    UNION ALL
    
    SELECT 
      'conta_receber'::text as origem_tipo,
      p.conta_receber_id::text as origem_id,
      CASE 
        WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN DATE(p.data_pagamento)
        ELSE DATE(p.data_vencimento)
      END as data,
      CASE 
        WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN p.data_pagamento::timestamp
        ELSE p.data_vencimento::timestamp
      END as data_timestamp,
      cr.company_id,
      COALESCE(p.conta_corrente_id::text, NULL) as conta_id,
      p.valor_parcela as valor_entrada,
      0::decimal(15,2) as valor_saida,
      COALESCE('Recebimento: ' || cr.titulo || ' - ' || p.titulo_parcela, '') as descricao,
      p.status as status,
      p.id::text as parcela_id
    FROM parcelas_contas_receber p
    INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
    WHERE p.status IN ('pago', 'pendente')
    
    UNION ALL
    
    SELECT 
      'conta_pagar'::text as origem_tipo,
      p.conta_pagar_id::text as origem_id,
      CASE 
        WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN DATE(p.data_pagamento)
        ELSE DATE(p.data_vencimento)
      END as data,
      CASE 
        WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN p.data_pagamento::timestamp
        ELSE p.data_vencimento::timestamp
      END as data_timestamp,
      cp.company_id,
      COALESCE(p.conta_corrente_id::text, NULL) as conta_id,
      0::decimal(15,2) as valor_entrada,
      p.valor_parcela as valor_saida,
      COALESCE('Pagamento: ' || cp.titulo || ' - ' || p.titulo_parcela, '') as descricao,
      p.status as status,
      p.id::text as parcela_id
    FROM parcelas_contas_pagar p
    INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
    WHERE p.status IN ('pago', 'pendente');
  `);

  // Criar índices para otimizar fluxo de caixa
  await applyOnce('2025-11-27_indices_fluxo_caixa', `
    -- Índices em movimentacoes_financeiras
    CREATE INDEX IF NOT EXISTS idx_mov_fluxo_conta_data_situacao 
    ON movimentacoes_financeiras(conta_id, data_movimentacao, situacao)
    WHERE situacao IN ('pago', 'pendente');

    CREATE INDEX IF NOT EXISTS idx_mov_fluxo_tela_origem 
    ON movimentacoes_financeiras(tela_origem, parcela_id)
    WHERE tela_origem IS NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_mov_fluxo_data 
    ON movimentacoes_financeiras(data_movimentacao)
    WHERE data_movimentacao IS NOT NULL;

    -- Índices em parcelas_contas_receber
    CREATE INDEX IF NOT EXISTS idx_parc_cr_fluxo_status_datas 
    ON parcelas_contas_receber(conta_receber_id, status, data_vencimento, data_pagamento, data_compensacao);

    CREATE INDEX IF NOT EXISTS idx_parc_cr_fluxo_conta_corrente 
    ON parcelas_contas_receber(conta_corrente_id)
    WHERE conta_corrente_id IS NOT NULL;

    -- Índices em parcelas_contas_pagar
    CREATE INDEX IF NOT EXISTS idx_parc_cp_fluxo_status_datas 
    ON parcelas_contas_pagar(conta_pagar_id, status, data_vencimento, data_pagamento, data_compensacao);

    CREATE INDEX IF NOT EXISTS idx_parc_cp_fluxo_conta_corrente 
    ON parcelas_contas_pagar(conta_corrente_id)
    WHERE conta_corrente_id IS NOT NULL;

    -- Índices em contas_financeiras
    CREATE INDEX IF NOT EXISTS idx_cf_fluxo_company_status 
    ON contas_financeiras("companyId", status, id)
    WHERE status = 'ativo';

    -- Índices em contas_receber
    CREATE INDEX IF NOT EXISTS idx_cr_fluxo_company 
    ON contas_receber(company_id, id);

    -- Índices em contas_pagar
    CREATE INDEX IF NOT EXISTS idx_cp_fluxo_company 
    ON contas_pagar(company_id, id);
  `);

  // Adicionar coluna saldo_atual se não existir
  await applyOnce(
    '2025-11-27_add_saldo_atual_column',
    `
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'contas_financeiras' 
        AND column_name = 'saldo_atual'
      ) THEN
        ALTER TABLE contas_financeiras 
        ADD COLUMN saldo_atual DECIMAL(15,2) DEFAULT 0.00;
        
        UPDATE contas_financeiras 
        SET saldo_atual = COALESCE(saldo_inicial, 0)
        WHERE saldo_atual IS NULL;
      END IF;
    END $$;
    `
  );

  // Tabelas de Pedidos de Compra
  await applyOnce(
    '2025-11-02_pedidos_compra',
    `
    CREATE TABLE IF NOT EXISTS pedidos_compra (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      numero TEXT NOT NULL,
      serie TEXT,
      "numeroOrdemCompra" TEXT,
      "dataEmissao" DATE NOT NULL DEFAULT CURRENT_DATE,
      "dataPrevisaoEntrega" DATE,
      "dataEntrega" DATE,
      "fornecedorId" UUID NOT NULL REFERENCES cadastros(id),
      "compradorId" UUID REFERENCES cadastros(id),
      "transportadoraId" UUID REFERENCES cadastros(id),
      "prazoPagamentoId" UUID REFERENCES prazos_pagamento(id),
      "naturezaOperacaoPadraoId" UUID REFERENCES natureza_operacao(id),
      "formaPagamentoId" UUID REFERENCES formas_pagamento(id) ON DELETE SET NULL,
      "localEstoqueId" UUID,
      parcelamento TEXT,
      "consumidorFinal" BOOLEAN DEFAULT FALSE,
      "indicadorPresenca" TEXT,
      "listaPreco" TEXT,
      frete TEXT,
      "valorFrete" NUMERIC(14,2) DEFAULT 0,
      despesas NUMERIC(14,2) DEFAULT 0,
      "incluirFreteTotal" BOOLEAN DEFAULT FALSE,
      "placaVeiculo" TEXT,
      "ufPlaca" TEXT,
      rntc TEXT,
      "pesoLiquido" NUMERIC(14,3) DEFAULT 0,
      "pesoBruto" NUMERIC(14,3) DEFAULT 0,
      volume NUMERIC(14,3) DEFAULT 0,
      especie TEXT,
      marca TEXT,
      numeracao TEXT,
      "quantidadeVolumes" INTEGER,
      "totalProdutos" NUMERIC(14,2) NOT NULL DEFAULT 0,
      "totalDescontos" NUMERIC(14,2) NOT NULL DEFAULT 0,
      "totalImpostos" NUMERIC(14,2) NOT NULL DEFAULT 0,
      "totalGeral" NUMERIC(14,2) NOT NULL DEFAULT 0,
      observacoes TEXT,
      status TEXT NOT NULL DEFAULT 'rascunho',
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pedidos_compra_itens (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "pedidoCompraId" UUID NOT NULL REFERENCES pedidos_compra(id) ON DELETE CASCADE,
      "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      "produtoId" UUID REFERENCES produtos(id),
      codigo TEXT NOT NULL,
      nome TEXT NOT NULL,
      unidade TEXT NOT NULL,
      ncm TEXT,
      cest TEXT,
      "naturezaOperacaoId" UUID NOT NULL REFERENCES natureza_operacao(id),
      quantidade NUMERIC(14,6) NOT NULL,
      "precoUnitario" NUMERIC(14,6) NOT NULL,
      "descontoValor" NUMERIC(14,2) DEFAULT 0,
      "descontoPercentual" NUMERIC(5,2) DEFAULT 0,
      "freteRateado" NUMERIC(14,2) DEFAULT 0,
      "seguroRateado" NUMERIC(14,2) DEFAULT 0,
      "outrasDespesasRateado" NUMERIC(14,2) DEFAULT 0,
      "icmsBase" NUMERIC(14,4),
      "icmsAliquota" NUMERIC(7,4),
      "icmsValor" NUMERIC(14,2),
      "icmsStBase" NUMERIC(14,4),
      "icmsStAliquota" NUMERIC(7,4),
      "icmsStValor" NUMERIC(14,2),
      "ipiAliquota" NUMERIC(7,4),
      "ipiValor" NUMERIC(14,2),
      "pisAliquota" NUMERIC(7,4),
      "pisValor" NUMERIC(14,2),
      "cofinsAliquota" NUMERIC(7,4),
      "cofinsValor" NUMERIC(14,2),
      "totalItem" NUMERIC(14,2) NOT NULL,
      "numeroItem" INTEGER,
      observacoes TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_pc_company ON pedidos_compra("companyId");
    CREATE INDEX IF NOT EXISTS idx_pc_fornecedor ON pedidos_compra("fornecedorId");
    CREATE INDEX IF NOT EXISTS idx_pc_data_emissao ON pedidos_compra("dataEmissao");
    CREATE INDEX IF NOT EXISTS idx_pci_pedido ON pedidos_compra_itens("pedidoCompraId");
    CREATE INDEX IF NOT EXISTS idx_pci_company ON pedidos_compra_itens("companyId");
    `
  );
}



