import { query } from './database';

/**
 * Script para corrigir e manter os saldos das contas sempre corretos
 * baseado nas movimentações financeiras
 */
export async function corrigirSaldosContas() {
  try {
    console.log('🔧 Iniciando correção de saldos...');
    
    // Buscar todas as contas
    const contasResult = await query('SELECT id, descricao FROM contas_financeiras ORDER BY created_at DESC');
    
    let contasCorrigidas = 0;
    let totalDiscrepancia = 0;
    
    for (const conta of contasResult.rows) {
      // Buscar todas as movimentações desta conta
      const movResult = await query(
        'SELECT * FROM movimentacoes_financeiras WHERE conta_id = $1 ORDER BY created_at ASC',
        [conta.id]
      );
      
      if (movResult.rows.length > 0) {
        // Calcular saldo baseado nas movimentações
        let saldoCalculado = 0;
        
        for (const mov of movResult.rows) {
          const entrada = parseFloat(mov.valor_entrada) || 0;
          const saida = parseFloat(mov.valor_saida) || 0;
          saldoCalculado += entrada - saida;
        }
        
        // Buscar saldo atual da conta
        const contaAtualResult = await query(
          'SELECT saldo_atual FROM contas_financeiras WHERE id = $1',
          [conta.id]
        );
        
        const saldoAtual = parseFloat(contaAtualResult.rows[0].saldo_atual);
        const diferenca = Math.abs(saldoAtual - saldoCalculado);
        
        if (diferenca > 0.01) { // Tolerância de 1 centavo
          // Atualizar saldo atual da conta
          await query(
            'UPDATE contas_financeiras SET saldo_atual = $1 WHERE id = $2',
            [saldoCalculado, conta.id]
          );
          
          // Atualizar saldo_apos_movimentacao de todas as movimentações
          let saldoAcumulado = 0;
          for (const mov of movResult.rows) {
            const entrada = parseFloat(mov.valor_entrada) || 0;
            const saida = parseFloat(mov.valor_saida) || 0;
            saldoAcumulado += entrada - saida;
            
            await query(
              'UPDATE movimentacoes_financeiras SET saldo_apos_movimentacao = $1 WHERE id = $2',
              [saldoAcumulado, mov.id]
            );
          }
          
          console.log(`✅ ${conta.descricao} - Corrigido: R$ ${saldoAtual.toFixed(2)} → R$ ${saldoCalculado.toFixed(2)}`);
          contasCorrigidas++;
          totalDiscrepancia += diferenca;
        }
      } else {
        // Se não há movimentações, saldo deve ser 0
        const contaAtualResult = await query(
          'SELECT saldo_atual FROM contas_financeiras WHERE id = $1',
          [conta.id]
        );
        
        const saldoAtual = parseFloat(contaAtualResult.rows[0].saldo_atual);
        
        if (saldoAtual > 0.01) {
          await query(
            'UPDATE contas_financeiras SET saldo_atual = 0 WHERE id = $1',
            [conta.id]
          );
          
          console.log(`✅ ${conta.descricao} - Zerado: R$ ${saldoAtual.toFixed(2)} → R$ 0.00`);
          contasCorrigidas++;
          totalDiscrepancia += saldoAtual;
        }
      }
    }
    
    console.log(`\n📊 Correção concluída:`);
    console.log(`   - Contas corrigidas: ${contasCorrigidas}`);
    console.log(`   - Total de discrepância corrigida: R$ ${totalDiscrepancia.toFixed(2)}`);
    
    return {
      contasCorrigidas,
      totalDiscrepancia
    };
    
  } catch (error) {
    console.error('❌ Erro ao corrigir saldos:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  corrigirSaldosContas()
    .then(() => {
      console.log('✅ Script executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar script:', error);
      process.exit(1);
    });
}

