// Script para testar especificamente pendentes com tipo_data=pagamento
import { buscarDadosUnificados } from '../src/services/fluxo-caixa-service';

async function testar() {
  try {
    const companyId = process.env.COMPANY_ID || 'eb198f2a-a95b-413a-abb9-464e3b7af303';
    const hoje = new Date();
    const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    console.log('🔍 === TESTE: Pendentes com tipo_data=pagamento ===\n');
    console.log('Período:', mesAtual.toISOString().split('T')[0], 'a', fimMesAtual.toISOString().split('T')[0]);
    console.log('');

    // Teste 1: tipo_data=pagamento, status=pendente
    console.log('1️⃣ Teste: tipo_data=pagamento, status=pendente');
    const dados1 = await buscarDadosUnificados({
      company_id: companyId,
      data_inicio: mesAtual.toISOString().split('T')[0],
      data_fim: fimMesAtual.toISOString().split('T')[0],
      tipo_data: 'pagamento',
      status: 'pendente',
      incluir_historico_pagas: false
    });

    const cr1 = dados1.filter(d => d.origem_tipo === 'conta_receber');
    const cp1 = dados1.filter(d => d.origem_tipo === 'conta_pagar');
    
    console.log(`   Contas a Receber: ${cr1.length} títulos`);
    console.log(`   Contas a Pagar: ${cp1.length} títulos`);
    if (cr1.length > 0) {
      console.log(`   Exemplo CR: ${cr1[0].descricao}, Data: ${cr1[0].data}, Status: ${cr1[0].status}`);
    }
    if (cp1.length > 0) {
      console.log(`   Exemplo CP: ${cp1[0].descricao}, Data: ${cp1[0].data}, Status: ${cp1[0].status}`);
    }
    console.log('');

    // Teste 2: tipo_data=vencimento, status=pendente
    console.log('2️⃣ Teste: tipo_data=vencimento, status=pendente');
    const dados2 = await buscarDadosUnificados({
      company_id: companyId,
      data_inicio: mesAtual.toISOString().split('T')[0],
      data_fim: fimMesAtual.toISOString().split('T')[0],
      tipo_data: 'vencimento',
      status: 'pendente',
      incluir_historico_pagas: false
    });

    const cr2 = dados2.filter(d => d.origem_tipo === 'conta_receber');
    const cp2 = dados2.filter(d => d.origem_tipo === 'conta_pagar');
    
    console.log(`   Contas a Receber: ${cr2.length} títulos`);
    console.log(`   Contas a Pagar: ${cp2.length} títulos`);
    if (cr2.length > 0) {
      console.log(`   Exemplo CR: ${cr2[0].descricao}, Data: ${cr2[0].data}, Status: ${cr2[0].status}`);
    }
    if (cp2.length > 0) {
      console.log(`   Exemplo CP: ${cp2[0].descricao}, Data: ${cp2[0].data}, Status: ${cp2[0].status}`);
    }
    console.log('');

    // Comparação
    console.log('3️⃣ Comparação:');
    console.log(`   tipo_data=pagamento: ${dados1.length} títulos`);
    console.log(`   tipo_data=vencimento: ${dados2.length} títulos`);
    console.log(`   Diferença: ${dados2.length - dados1.length} ${dados2.length !== dados1.length ? '⚠️ DIFERENTE' : '✅ IGUAL'}`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testar();

