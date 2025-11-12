// Script para debugar o formato das datas
import { buscarDadosUnificados, processarDadosDiarios, calcularSaldoInicial } from '../src/services/fluxo-caixa-service';

async function debugar() {
  try {
    const companyId = process.env.COMPANY_ID || 'eb198f2a-a95b-413a-abb9-464e3b7af303';
    const hoje = new Date();
    const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    console.log('🔍 === DEBUG: Formato das Datas ===\n');

    // Buscar dados unificados
    const movimentacoes = await buscarDadosUnificados({
      company_id: companyId,
      data_inicio: mesAtual.toISOString().split('T')[0],
      data_fim: fimMesAtual.toISOString().split('T')[0],
      tipo_data: 'pagamento',
      status: 'pendente',
      incluir_historico_pagas: false
    });

    console.log(`📊 Movimentações encontradas: ${movimentacoes.length}\n`);

    // Verificar movimentações do dia 3 de novembro
    const mov03 = movimentacoes.filter(m => {
      const dataMov = typeof m.data === 'string' ? m.data : m.data_timestamp.toISOString().split('T')[0];
      return dataMov === '2025-11-03';
    });

    console.log(`📅 Movimentações do dia 03/11: ${mov03.length}\n`);

    if (mov03.length > 0) {
      console.log('📋 Detalhes das movimentações do dia 03/11:');
      mov03.forEach((mov, i) => {
        console.log(`\n   ${i + 1}. ${mov.descricao}`);
        console.log(`      Data (string): ${mov.data}`);
        console.log(`      Data (tipo): ${typeof mov.data}`);
        console.log(`      Data timestamp: ${mov.data_timestamp.toISOString()}`);
        console.log(`      Data timestamp (split): ${mov.data_timestamp.toISOString().split('T')[0]}`);
        console.log(`      Origem: ${mov.origem_tipo}`);
        console.log(`      Status: ${mov.status}`);
        console.log(`      Valor entrada: R$ ${mov.valor_entrada.toFixed(2)}`);
        console.log(`      Valor saída: R$ ${mov.valor_saida.toFixed(2)}`);
      });
    }

    // Verificar formato de data usado no agrupamento
    console.log('\n🔍 Verificando formato de data no agrupamento...');
    
    // Calcular saldo inicial
    const saldoInicial = await calcularSaldoInicial(companyId, mesAtual, undefined, true);

    // Processar dados diários
    const dadosDiarios = processarDadosDiarios(
      movimentacoes,
      saldoInicial,
      'pendente',
      mesAtual,
      fimMesAtual
    );

    // Encontrar o dia 3 de novembro
    const dia03 = dadosDiarios.find(d => d.data === '2025-11-03');

    console.log(`\n📅 Dados do dia 03/11 no processamento:`);
    if (dia03) {
      console.log(`   Data: ${dia03.data}`);
      console.log(`   Recebimentos: R$ ${dia03.recebimentos.toFixed(2)}`);
      console.log(`   Pagamentos: R$ ${dia03.pagamentos.toFixed(2)}`);
      console.log(`   Saldo do dia: R$ ${dia03.saldo_dia.toFixed(2)}`);
      console.log(`   Total movimentações: ${dia03.total_movimentacoes}`);
    } else {
      console.log(`   ❌ DIA 03/11 NÃO ENCONTRADO!`);
      
      // Verificar quais dias existem
      console.log(`\n📋 Dias disponíveis no processamento:`);
      dadosDiarios.slice(0, 5).forEach(d => {
        console.log(`   ${d.data}: Recebimentos: R$ ${d.recebimentos.toFixed(2)}, Pagamentos: R$ ${d.pagamentos.toFixed(2)}`);
      });
    }

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

debugar();


