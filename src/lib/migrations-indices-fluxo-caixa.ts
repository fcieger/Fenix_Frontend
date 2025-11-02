import { PoolClient } from 'pg';

/**
 * Cria índices para otimizar queries do fluxo de caixa
 */
export async function criarIndicesFluxoCaixa(client: PoolClient) {
  console.log('🔧 Criando índices para fluxo de caixa...');

  // Índices em movimentacoes_financeiras
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_mov_fluxo_conta_data_situacao 
    ON movimentacoes_financeiras(conta_id, data_movimentacao, situacao)
    WHERE situacao IN ('pago', 'pendente');
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_mov_fluxo_tela_origem 
    ON movimentacoes_financeiras(tela_origem, parcela_id)
    WHERE tela_origem IS NOT NULL;
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_mov_fluxo_data 
    ON movimentacoes_financeiras(data_movimentacao)
    WHERE data_movimentacao IS NOT NULL;
  `);

  // Índices em parcelas_contas_receber
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_parc_cr_fluxo_status_datas 
    ON parcelas_contas_receber(conta_receber_id, status, data_vencimento, data_pagamento, data_compensacao);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_parc_cr_fluxo_conta_corrente 
    ON parcelas_contas_receber(conta_corrente_id)
    WHERE conta_corrente_id IS NOT NULL;
  `);

  // Índices em parcelas_contas_pagar
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_parc_cp_fluxo_status_datas 
    ON parcelas_contas_pagar(conta_pagar_id, status, data_vencimento, data_pagamento, data_compensacao);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_parc_cp_fluxo_conta_corrente 
    ON parcelas_contas_pagar(conta_corrente_id)
    WHERE conta_corrente_id IS NOT NULL;
  `);

  // Índices em contas_financeiras
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_cf_fluxo_company_status 
    ON contas_financeiras("companyId", status, id)
    WHERE status = 'ativo';
  `);

  // Índices em contas_receber
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_cr_fluxo_company 
    ON contas_receber(company_id, id);
  `);

  // Índices em contas_pagar
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_cp_fluxo_company 
    ON contas_pagar(company_id, id);
  `);

  console.log('✅ Índices criados com sucesso');
}

