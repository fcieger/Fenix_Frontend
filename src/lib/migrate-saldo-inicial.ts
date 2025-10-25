import { query, transaction } from './database';

async function migrarSaldoInicial() {
  try {
    console.log('🔄 Iniciando migração de saldo inicial...');
    
    // Buscar contas que têm saldo inicial mas não têm lançamento de saldo inicial
    const contasSql = `
      SELECT c.id, c.descricao, c.saldo_inicial, c.data_saldo, c.created_by
      FROM contas_financeiras c
      LEFT JOIN movimentacoes_financeiras m ON c.id = m.conta_id AND m.descricao = 'Saldo Inicial'
      WHERE c.saldo_inicial > 0 AND m.id IS NULL
    `;
    
    const contasResult = await query(contasSql);
    const contas = contasResult.rows;
    
    console.log(`📊 Encontradas ${contas.length} contas para migrar`);
    
    if (contas.length === 0) {
      console.log('✅ Nenhuma conta precisa de migração');
      return;
    }
    
    // Migrar cada conta
    for (const conta of contas) {
      await transaction(async (client) => {
        // Criar lançamento de saldo inicial
        const movimentacaoSql = `
          INSERT INTO movimentacoes_financeiras (
            conta_id, tipo_movimentacao, valor_entrada, valor_saida, descricao,
            descricao_detalhada, data_movimentacao, saldo_anterior, saldo_posterior,
            situacao, created_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          ) RETURNING *
        `;
        
        const movimentacaoParams = [
          conta.id,
          'entrada',
          conta.saldo_inicial,
          0,
          'Saldo Inicial',
          `Saldo inicial da conta ${conta.descricao}`,
          conta.data_saldo || conta.created_at || new Date().toISOString(),
          0, // saldo anterior é 0
          conta.saldo_inicial, // saldo posterior é o saldo inicial
          'pago', // situacao pago pois é o saldo inicial
          conta.created_by || '123e4567-e89b-12d3-a456-426614174001' // System user
        ];
        
        await client.query(movimentacaoSql, movimentacaoParams);
        
        console.log(`✅ Migrado: ${conta.descricao} - R$ ${conta.saldo_inicial}`);
      });
    }
    
    console.log('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  migrarSaldoInicial()
    .then(() => {
      console.log('✅ Script executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar script:', error);
      process.exit(1);
    });
}

export { migrarSaldoInicial };

