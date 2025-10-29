import { query, transaction } from './database';

export async function recalcularSaldoAtualPorMovimentacoes() {
  console.log('🔄 Recalculando saldos baseado apenas nas movimentações...');
  
  return await transaction(async (client) => {
    // Buscar todas as contas
    const contasResult = await client.query('SELECT id, descricao, saldo_inicial FROM contas_financeiras');
    const contas = contasResult.rows;
    
    console.log(`📊 Encontradas ${contas.length} contas para recalcular`);
    
    for (const conta of contas) {
      console.log(`\n🔍 Processando conta ${conta.descricao} (${conta.id})...`);
      
      // Buscar todas as movimentações da conta ordenadas por data
      const movimentacoesResult = await client.query(
        'SELECT * FROM movimentacoes_financeiras WHERE conta_id = $1 ORDER BY data_movimentacao ASC',
        [conta.id]
      );
      
      const movimentacoes = movimentacoesResult.rows;
      console.log(`  📈 Encontradas ${movimentacoes.length} movimentações`);
      
      // Calcular saldo atual baseado no saldo inicial + movimentações
      let saldoAtual = parseFloat(conta.saldo_inicial) || 0;
      console.log(`  💰 Saldo inicial: R$ ${saldoAtual.toFixed(2)}`);
      
      // Atualizar cada movimentação com saldo correto
      for (let i = 0; i < movimentacoes.length; i++) {
        const mov = movimentacoes[i];
        const saldoAnterior = saldoAtual;
        
        // Calcular novo saldo
        if (mov.tipo_movimentacao === 'entrada') {
          saldoAtual += parseFloat(mov.valor_entrada) || 0;
        } else if (mov.tipo_movimentacao === 'saida') {
          saldoAtual -= parseFloat(mov.valor_saida) || 0;
        } else if (mov.tipo_movimentacao === 'transferencia') {
          if (parseFloat(mov.valor_entrada) > 0) {
            saldoAtual += parseFloat(mov.valor_entrada);
          } else {
            saldoAtual -= parseFloat(mov.valor_saida) || 0;
          }
        }
        
        // Atualizar movimentação com saldos corretos
        await client.query(
          'UPDATE movimentacoes_financeiras SET saldo_anterior = $1, saldo_posterior = $2 WHERE id = $3',
          [saldoAnterior, saldoAtual, mov.id]
        );
        
        console.log(`    ${i + 1}. ${mov.tipo_movimentacao}: R$ ${saldoAnterior.toFixed(2)} → R$ ${saldoAtual.toFixed(2)}`);
      }
      
      // Atualizar saldo atual da conta
      await client.query(
        'UPDATE contas_financeiras SET saldo_atual = $1, data_ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = $2',
        [saldoAtual, conta.id]
      );
      
      console.log(`  ✅ Saldo final da conta: R$ ${saldoAtual.toFixed(2)}`);
    }
    
    console.log('\n🎉 Recálculo de saldos concluído!');
  });
}

// Função para recalcular saldo de uma conta específica
export async function recalcularSaldoContaPorMovimentacoes(contaId: string) {
  console.log(`🔄 Recalculando saldo da conta ${contaId}...`);
  
  return await transaction(async (client) => {
    // Buscar conta
    const contaResult = await client.query('SELECT id, descricao, saldo_inicial FROM contas_financeiras WHERE id = $1', [contaId]);
    if (contaResult.rows.length === 0) {
      throw new Error('Conta não encontrada');
    }
    
    const conta = contaResult.rows[0];
    
    // Buscar todas as movimentações da conta ordenadas por data
    const movimentacoesResult = await client.query(
      'SELECT * FROM movimentacoes_financeiras WHERE conta_id = $1 ORDER BY data_movimentacao ASC',
      [contaId]
    );
    
    const movimentacoes = movimentacoesResult.rows;
    console.log(`📈 Encontradas ${movimentacoes.length} movimentações`);
    
    // Calcular saldo atual baseado no saldo inicial + movimentações
    let saldoAtual = parseFloat(conta.saldo_inicial) || 0;
    console.log(`💰 Saldo inicial: R$ ${saldoAtual.toFixed(2)}`);
    
    // Atualizar cada movimentação com saldo correto
    for (let i = 0; i < movimentacoes.length; i++) {
      const mov = movimentacoes[i];
      const saldoAnterior = saldoAtual;
      
      // Calcular novo saldo
      if (mov.tipo_movimentacao === 'entrada') {
        saldoAtual += parseFloat(mov.valor_entrada) || 0;
      } else if (mov.tipo_movimentacao === 'saida') {
        saldoAtual -= parseFloat(mov.valor_saida) || 0;
      } else if (mov.tipo_movimentacao === 'transferencia') {
        if (parseFloat(mov.valor_entrada) > 0) {
          saldoAtual += parseFloat(mov.valor_entrada);
        } else {
          saldoAtual -= parseFloat(mov.valor_saida) || 0;
        }
      }
      
      // Atualizar movimentação com saldos corretos
      await client.query(
        'UPDATE movimentacoes_financeiras SET saldo_anterior = $1, saldo_posterior = $2 WHERE id = $3',
        [saldoAnterior, saldoAtual, mov.id]
      );
      
      console.log(`${i + 1}. ${mov.tipo_movimentacao}: R$ ${saldoAnterior.toFixed(2)} → R$ ${saldoAtual.toFixed(2)}`);
    }
    
    // Atualizar saldo atual da conta
    await client.query(
      'UPDATE contas_financeiras SET saldo_atual = $1, data_ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = $2',
      [saldoAtual, contaId]
    );
    
    console.log(`✅ Saldo final da conta: R$ ${saldoAtual.toFixed(2)}`);
    
    return saldoAtual;
  });
}

