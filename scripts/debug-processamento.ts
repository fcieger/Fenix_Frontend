// Script para debugar o processamento dos dados diários
import { query } from '../src/lib/database';
import { buscarDadosUnificados, processarDadosDiarios, calcularSaldoInicial } from '../src/services/fluxo-caixa-service';

async function debugar() {
  try {
    const companyId = process.env.COMPANY_ID || 'eb198f2a-a95b-413a-abb9-464e3b7af303';
    const hoje = new Date();
    const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    console.log('🔍 === DEBUG: Processamento de Dados Diários ===\n');
    console.log('Período:', mesAtual.toISOString().split('T')[0], 'a', fimMesAtual.toISOString().split('T')[0]);
    console.log('');

    // Buscar dados unificados
    const movimentacoes = await buscarDadosUnificados({
      company_id: companyId,
      data_inicio: mesAtual.toISOString().split('T')[0],
      data_fim: fimMesAtual.toISOString().split('T')[0],
      tipo_data: 'pagamento',
      status: 'pendente',
      incluir_historico_pagas: false
    });

    console.log(`📊 Movimentações encontradas: ${movimentacoes.length}`);
    console.log('');
    
    const crMov = movimentacoes.filter(m => m.origem_tipo === 'conta_receber');
    const cpMov = movimentacoes.filter(m => m.origem_tipo === 'conta_pagar');
    
    console.log(`   Contas a Receber: ${crMov.length}`);
    console.log(`   Contas a Pagar: ${cpMov.length}`);
    console.log('');

    // Calcular saldo inicial
    const saldoInicial = await calcularSaldoInicial(companyId, mesAtual, undefined, true);
    console.log(`💰 Saldo inicial: ${saldoInicial.toFixed(2)}`);
    console.log('');

    // Processar dados diários
    const dadosDiarios = processarDadosDiarios(
      movimentacoes,
      saldoInicial,
      'pendente',
      mesAtual,
      fimMesAtual
    );

    console.log(`📅 Dados diários processados: ${dadosDiarios.length} dias`);
    console.log('');

    // Verificar dias com movimentações
    const diasComMovimentacoes = dadosDiarios.filter(d => 
      d.recebimentos > 0 || d.pagamentos > 0 || d.transferencias_entrada > 0 || d.transferencias_saida > 0
    );

    console.log(`📊 Dias com movimentações: ${diasComMovimentacoes.length} dias`);
    console.log('');

    if (diasComMovimentacoes.length > 0) {
      console.log('📋 Primeiros 5 dias com movimentações:');
      diasComMovimentacoes.slice(0, 5).forEach((dia, i) => {
        console.log(`\n   ${i + 1}. ${dia.data}:`);
        console.log(`      Recebimentos: R$ ${dia.recebimentos.toFixed(2)}`);
        console.log(`      Pagamentos: R$ ${dia.pagamentos.toFixed(2)}`);
        console.log(`      Saldo do dia: R$ ${dia.saldo_dia.toFixed(2)}`);
        console.log(`      Total movimentações: ${dia.total_movimentacoes}`);
      });
    } else {
      console.log('⚠️ NENHUM DIA COM MOVIMENTAÇÕES!');
      console.log('\n📝 Verificando dados de entrada...');
      if (movimentacoes.length > 0) {
        console.log('\n   Primeiras 5 movimentações:');
        movimentacoes.slice(0, 5).forEach((mov, i) => {
          console.log(`   ${i + 1}. ${mov.descricao}`);
          console.log(`      Data: ${mov.data}`);
          console.log(`      Status: ${mov.status}`);
          console.log(`      Origem: ${mov.origem_tipo}`);
          console.log(`      Valor entrada: R$ ${mov.valor_entrada.toFixed(2)}`);
          console.log(`      Valor saída: R$ ${mov.valor_saida.toFixed(2)}`);
          console.log('');
        });
      }
    }

    // Verificar total de recebimentos e pagamentos
    const totalRecebimentos = dadosDiarios.reduce((sum, d) => sum + d.recebimentos, 0);
    const totalPagamentos = dadosDiarios.reduce((sum, d) => sum + d.pagamentos, 0);

    console.log('\n💰 Totais:');
    console.log(`   Recebimentos: R$ ${totalRecebimentos.toFixed(2)}`);
    console.log(`   Pagamentos: R$ ${totalPagamentos.toFixed(2)}`);
    console.log(`   Saldo final: R$ ${dadosDiarios[dadosDiarios.length - 1]?.saldo_dia.toFixed(2) || '0.00'}`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

debugar();


