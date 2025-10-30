const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:fenix123@localhost:5432/fenix' });
  const client = await pool.connect();
  try {
    const term = process.argv[2] || 'teste1';
    const cpRes = await client.query(
      'SELECT id, titulo, valor_total, created_at FROM contas_pagar WHERE LOWER(titulo) LIKE LOWER($1) ORDER BY created_at DESC LIMIT 1',
      ['%'+term+'%']
    );
    if (cpRes.rows.length === 0) {
      console.log('❌ Nenhum título encontrado com:', term);
      return;
    }
    const cp = cpRes.rows[0];
    console.log('\n✅ Título:', cp.id, '-', cp.titulo, 'valor_total=', cp.valor_total);

    const parcelas = await client.query(
      'SELECT id, titulo_parcela, status, valor_parcela, valor_total, data_vencimento, data_pagamento, conta_corrente_id FROM parcelas_contas_pagar WHERE conta_pagar_id = $1 ORDER BY data_vencimento ASC',
      [cp.id]
    );

    const rc = await client.query(
      'SELECT cpc.id, cpc.conta_contabil_id, cc.descricao AS conta_contabil_descricao, cpc.valor, cpc.percentual FROM contas_pagar_conta_contabil cpc LEFT JOIN contas_contabeis cc ON cc.id = cpc.conta_contabil_id WHERE cpc.conta_pagar_id = $1 ORDER BY cpc.created_at ASC',
      [cp.id]
    );

    const rcc = await client.query(
      'SELECT ccc.id, ccc.centro_custo_id, cc.descricao AS centro_custo_descricao, ccc.valor, ccc.percentual FROM contas_pagar_centro_custo ccc LEFT JOIN centros_custos cc ON cc.id = ccc.centro_custo_id WHERE ccc.conta_pagar_id = $1 ORDER BY ccc.created_at ASC',
      [cp.id]
    );

    const movs = await client.query(
      'SELECT id, conta_id, tipo_movimentacao, valor_entrada, valor_saida, descricao, parcela_id, tela_origem, data_movimentacao FROM movimentacoes_financeiras WHERE id_origem = $1 OR parcela_id IN (SELECT id FROM parcelas_contas_pagar WHERE conta_pagar_id = $1) ORDER BY data_movimentacao ASC, created_at ASC',
      [cp.id]
    );

    console.log('\n📦 Parcelas (', parcelas.rows.length, '):');
    console.table(parcelas.rows);
    console.log('\n📘 Rateio Conta Contábil (', rc.rows.length, '):');
    console.table(rc.rows);
    console.log('\n📗 Rateio Centro de Custo (', rcc.rows.length, '):');
    console.table(rcc.rows);
    console.log('\n🏦 Movimentações (', movs.rows.length, '):');
    console.table(movs.rows);
  } catch (e) {
    console.error('Erro:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
})();



