import { PoolClient } from 'pg';

export type HistoryEvent = {
  company_id: string;
  user_id?: string | null;
  user_name?: string | null;
  action: string;               // e.g. 'create','update','delete','parcela_paga','parcela_estornada'
  entity: string;               // e.g. 'contas_pagar','contas_receber','parcela_contas_pagar','parcela_contas_receber'
  entity_id?: string | null;
  description: string;
  metadata?: any;               // arbitrary JSON
};

export async function ensureHistorySchema(client: PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS historico_eventos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL,
      user_id UUID,
      user_name TEXT,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      description TEXT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_hist_company_created ON historico_eventos(company_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_hist_entity ON historico_eventos(entity);
    CREATE INDEX IF NOT EXISTS idx_hist_action ON historico_eventos(action);
  `);
}

export async function logHistory(client: PoolClient, evt: HistoryEvent) {
  await ensureHistorySchema(client);
  await client.query(
    `INSERT INTO historico_eventos (company_id, user_id, user_name, action, entity, entity_id, description, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [evt.company_id, evt.user_id || null, evt.user_name || null, evt.action, evt.entity, evt.entity_id || null, evt.description, evt.metadata || null]
  );
}



