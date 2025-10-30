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


