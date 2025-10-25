import { query } from './database';

async function checkContas() {
  try {
    console.log('🔍 Verificando contas no banco de dados...');
    
    // Buscar todas as contas
    const contasResult = await query('SELECT * FROM contas_financeiras ORDER BY created_at DESC');
    console.log('📊 Total de contas encontradas:', contasResult.rows.length);
    
    contasResult.rows.forEach((conta, index) => {
      console.log(`\n${index + 1}. Conta ID: ${conta.id}`);
      console.log(`   Descrição: ${conta.descricao}`);
      console.log(`   Tipo: ${conta.tipo_conta}`);
      console.log(`   Banco: ${conta.banco_nome} (${conta.banco_codigo})`);
      console.log(`   Saldo Inicial: R$ ${conta.saldo_inicial}`);
      console.log(`   Saldo Atual: R$ ${conta.saldo_atual}`);
      console.log(`   Status: ${conta.status}`);
      console.log(`   Criada em: ${conta.created_at}`);
    });
    
    // Buscar movimentações
    const movimentacoesResult = await query('SELECT * FROM movimentacoes_financeiras ORDER BY created_at DESC LIMIT 10');
    console.log('\n💰 Total de movimentações encontradas:', movimentacoesResult.rows.length);
    
    movimentacoesResult.rows.forEach((mov, index) => {
      console.log(`\n${index + 1}. Movimentação ID: ${mov.id}`);
      console.log(`   Conta: ${mov.conta_id}`);
      console.log(`   Tipo: ${mov.tipo_movimentacao}`);
      console.log(`   Entrada: R$ ${mov.valor_entrada}`);
      console.log(`   Saída: R$ ${mov.valor_saida}`);
      console.log(`   Descrição: ${mov.descricao}`);
      console.log(`   Saldo Anterior: R$ ${mov.saldo_anterior}`);
      console.log(`   Saldo Posterior: R$ ${mov.saldo_posterior}`);
      console.log(`   Data: ${mov.data_movimentacao}`);
    });
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar contas:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkContas()
    .then(() => {
      console.log('✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no script:', error);
      process.exit(1);
    });
}
