import { ContasService } from '@/services/contas-service';
import { MovimentacoesService } from '@/services/movimentacoes-service';
import { initializeTables } from './database';

export async function testIntegration() {
  try {
    console.log('🧪 Iniciando testes de integração...');
    
    // Inicializar banco
    await initializeTables();
    
    const contasService = new ContasService();
    const movimentacoesService = new MovimentacoesService();
    
    // Teste 1: Criar conta
    console.log('📝 Teste 1: Criando conta corrente...');
    const contaData = {
      company_id: '123e4567-e89b-12d3-a456-426614174000',
      tipo_conta: 'conta_corrente',
      descricao: 'Conta Corrente Teste',
      banco_id: '001',
      banco_nome: 'Banco do Brasil',
      banco_codigo: '001',
      numero_agencia: '1234',
      numero_conta: '12345-6',
      tipo_pessoa: 'fisica',
      saldo_inicial: 1000.00,
      data_saldo: '2024-01-01',
      created_by: '123e4567-e89b-12d3-a456-426614174001'
    };
    
    const conta = await contasService.createConta(contaData);
    console.log('✅ Conta criada:', conta.id);
    
    // Teste 2: Criar movimentação de entrada
    console.log('💰 Teste 2: Criando movimentação de entrada...');
    const movimentacaoEntrada = await movimentacoesService.createMovimentacao({
      conta_id: conta.id,
      tipo_movimentacao: 'entrada',
      valor_entrada: 500.00,
      descricao: 'Depósito teste',
      data_movimentacao: new Date().toISOString(),
      created_by: '123e4567-e89b-12d3-a456-426614174001'
    });
    console.log('✅ Movimentação de entrada criada:', movimentacaoEntrada.id);
    
    // Teste 3: Criar movimentação de saída
    console.log('💸 Teste 3: Criando movimentação de saída...');
    const movimentacaoSaida = await movimentacoesService.createMovimentacao({
      conta_id: conta.id,
      tipo_movimentacao: 'saida',
      valor_saida: 100.00, // Valor menor para não dar erro de saldo
      descricao: 'Saque teste',
      data_movimentacao: new Date().toISOString(),
      created_by: '123e4567-e89b-12d3-a456-426614174001'
    });
    console.log('✅ Movimentação de saída criada:', movimentacaoSaida.id);
    
    // Teste 4: Verificar saldo atual
    console.log('📊 Teste 4: Verificando saldo atual...');
    const contaAtualizada = await contasService.getContaById(conta.id);
    console.log('✅ Saldo atual:', contaAtualizada?.saldo_atual);
    
    // Teste 5: Listar movimentações
    console.log('📋 Teste 5: Listando movimentações...');
    const movimentacoes = await movimentacoesService.getMovimentacoesByConta(conta.id);
    console.log('✅ Movimentações encontradas:', movimentacoes.length);
    
    // Teste 6: Resumo financeiro
    console.log('📈 Teste 6: Calculando resumo financeiro...');
    const resumo = await movimentacoesService.getResumoMovimentacoes(conta.id);
    console.log('✅ Resumo:', resumo);
    
    console.log('🎉 Todos os testes passaram com sucesso!');
    
    return {
      success: true,
      conta: conta,
      movimentacoes: [movimentacaoEntrada, movimentacaoSaida],
      resumo: resumo
    };
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testIntegration()
    .then(() => {
      console.log('✅ Testes concluídos com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro nos testes:', error);
      process.exit(1);
    });
}
