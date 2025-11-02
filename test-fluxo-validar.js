// Script para testar o endpoint de validação do fluxo de caixa
const http = require('http');

const companyId = process.argv[2] || 'eb198f2a-a95b-413a-abb9-464e3b7af303'; // Exemplo de company_id
const token = process.argv[3] || 'test-token'; // Token de teste

const dataInicio = process.argv[4] || '2025-11-01';
const dataFim = process.argv[5] || '2025-11-30';

const url = `http://localhost:3004/api/fluxo-caixa/validar?company_id=${companyId}&data_inicio=${dataInicio}&data_fim=${dataFim}&tipo_data=vencimento&status=todos`;

console.log('🔍 Testando endpoint de validação...');
console.log('URL:', url);
console.log('');

const options = {
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

http.get(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ Resposta recebida:');
      console.log(JSON.stringify(json, null, 2));
      
      if (json.contas_receber) {
        console.log('');
        console.log('📊 RESUMO - CONTAS A RECEBER:');
        console.log(`   No banco (total): ${json.contas_receber.no_banco.pendentes_total}`);
        console.log(`   No banco (período): ${json.contas_receber.no_banco.pendentes_no_periodo}`);
        console.log(`   No fluxo de caixa: ${json.contas_receber.no_fluxo_caixa.pendentes}`);
        console.log(`   Diferença: ${json.contas_receber.comparacao.diferenca}`);
        console.log(`   Status: ${json.contas_receber.comparacao.status}`);
        console.log(`   Cobertura: ${json.contas_receber.comparacao.percentual_cobertura}`);
        
        if (json.contas_receber.comparacao.titulos_faltando && json.contas_receber.comparacao.titulos_faltando.length > 0) {
          console.log('');
          console.log('⚠️ TÍTULOS FALTANDO NO FLUXO:');
          json.contas_receber.comparacao.titulos_faltando.forEach((titulo, index) => {
            console.log(`   ${index + 1}. ${titulo.titulo} - ${titulo.titulo_parcela}`);
            console.log(`      Data vencimento: ${titulo.data_vencimento}`);
            console.log(`      Valor: R$ ${titulo.valor.toFixed(2)}`);
          });
        }
      }
    } catch (e) {
      console.log('❌ Erro ao parsear JSON:');
      console.log(data);
    }
  });
}).on('error', (err) => {
  console.error('❌ Erro na requisição:', err.message);
});

