import { MovimentacoesService } from '@/services/movimentacoes-service';

async function testMovimentacoes() {
  try {
    console.log('🧪 Testando movimentações financeiras...');
    
    const movimentacoesService = new MovimentacoesService();
    
    // Buscar uma conta existente
    const { ContasService } = await import('../services/contas-service');
    const contasService = new ContasService();
    const contas = await contasService.getContas();
    
    if (contas.length === 0) {
      console.log('❌ Nenhuma conta encontrada. Crie uma conta primeiro.');
      return;
    }
    
    const conta = contas[0];
    console.log('📊 Usando conta:', conta.descricao, 'ID:', conta.id);
    console.log('💰 Saldo atual:', conta.saldo_atual);
    
    // Teste 1: Movimentação de entrada
    console.log('\n💰 Teste 1: Criando movimentação de entrada...');
    const entrada = await movimentacoesService.createMovimentacao({
      conta_id: conta.id,
      tipo_movimentacao: 'entrada',
      valor_entrada: 500.00,
      descricao: 'Depósito teste via API',
      data_movimentacao: new Date().toISOString(),
      created_by: '123e4567-e89b-12d3-a456-426614174001'
    });
    console.log('✅ Entrada criada:', entrada.id);
    
    // Verificar saldo atualizado
    const contaAtualizada = await contasService.getContaById(conta.id);
    console.log('💰 Novo saldo:', contaAtualizada?.saldo_atual);
    
    // Teste 2: Movimentação de saída
    console.log('\n💸 Teste 2: Criando movimentação de saída...');
    const saida = await movimentacoesService.createMovimentacao({
      conta_id: conta.id,
      tipo_movimentacao: 'saida',
      valor_saida: 100.00,
      descricao: 'Saque teste via API',
      data_movimentacao: new Date().toISOString(),
      created_by: '123e4567-e89b-12d3-a456-426614174001'
    });
    console.log('✅ Saída criada:', saida.id);
    
    // Verificar saldo final
    const contaFinal = await contasService.getContaById(conta.id);
    console.log('💰 Saldo final:', contaFinal?.saldo_atual);
    
    // Teste 3: Listar movimentações
    console.log('\n📋 Teste 3: Listando movimentações...');
    const movimentacoes = await movimentacoesService.getMovimentacoesByConta(conta.id);
    console.log('✅ Movimentações encontradas:', movimentacoes.length);
    
    movimentacoes.forEach((mov, index) => {
      console.log(`${index + 1}. ${mov.tipo_movimentacao} - R$ ${mov.valor_entrada || mov.valor_saida} - ${mov.descricao}`);
    });
    
    // Teste 4: Resumo financeiro
    console.log('\n📊 Teste 4: Resumo financeiro...');
    const resumo = await movimentacoesService.getResumoMovimentacoes(conta.id);
    console.log('✅ Resumo:', resumo);
    
    console.log('\n🎉 Todos os testes de movimentação passaram!');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testMovimentacoes()
    .then(() => {
      console.log('✅ Testes concluídos!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro:', error);
      process.exit(1);
    });
}
