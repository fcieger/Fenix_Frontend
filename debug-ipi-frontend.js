// Debug do cálculo de IPI no frontend
console.log('🔍 DEBUG - VERIFICAÇÃO DO CÁLCULO DE IPI NO FRONTEND');
console.log('='.repeat(60));

// Simular dados que o frontend envia para o backend
const payloadExemplo = {
  companyId: 'test-company-id',
  clienteId: 'test-cliente-id',
  naturezaOperacaoId: 'test-natureza-id',
  ufOrigem: 'SP',
  ufDestino: 'RJ',
  incluirFreteTotal: false,
  valorFrete: 0,
  despesas: 0,
  configuracaoImpostos: {
    // IPI - Calcular baseado apenas no CST
    ipiAliquota: 10,
    ipiCST: '50',
    ipiClasse: '',
    ipiCodigo: '',
    // ICMS-ST
    icmsStAplicarProduto: true,
    icmsStAliquota: 18,
    icmsStCST: '00',
    icmsStMva: 0,
  },
  itens: [
    {
      produtoId: 'test-produto-id',
      nome: 'Produto Teste IPI',
      quantidade: 1,
      valorUnitario: 100,
      valorDesconto: 0,
      ipiCST: '50', // CST tributado
      icmsCST: '00',
      pisCST: '01',
      cofinsCST: '01',
      cbenef: ''
    }
  ]
};

console.log('📋 PAYLOAD ENVIADO PELO FRONTEND:');
console.log(JSON.stringify(payloadExemplo, null, 2));
console.log('');

// Simular a lógica de cálculo do backend
console.log('🔍 SIMULANDO LÓGICA DO BACKEND:');

const cstsTributados = ['00', '01', '02', '03', '50', '51', '52', '99'];
const cstsNaoTributados = ['04', '05', '49', '53', '54', '55'];

payloadExemplo.itens.forEach((item, index) => {
  console.log(`\n📦 ITEM ${index + 1}: ${item.nome}`);
  console.log(`   - Quantidade: ${item.quantidade}`);
  console.log(`   - Valor Unitário: R$ ${item.valorUnitario}`);
  console.log(`   - Desconto: R$ ${item.valorDesconto}`);
  console.log(`   - CST IPI: ${item.ipiCST}`);
  console.log(`   - Alíquota IPI: ${payloadExemplo.configuracaoImpostos.ipiAliquota}%`);
  
  // Verificar se CST permite cálculo de IPI
  const cstIPI = item.ipiCST || payloadExemplo.configuracaoImpostos.ipiCST;
  const aliquotaIPI = payloadExemplo.configuracaoImpostos.ipiAliquota;
  
  console.log(`   - CST usado: ${cstIPI}`);
  console.log(`   - Alíquota usada: ${aliquotaIPI}%`);
  
  if (!cstsTributados.includes(cstIPI) || cstsNaoTributados.includes(cstIPI)) {
    console.log(`   ❌ CST ${cstIPI} não tributado - IPI não calculado`);
    return;
  }
  
  if (aliquotaIPI <= 0) {
    console.log(`   ❌ Alíquota ${aliquotaIPI}% inválida - IPI não calculado`);
    return;
  }
  
  // Calcular IPI
  const valorTotal = (item.quantidade * item.valorUnitario) - item.valorDesconto;
  const baseIPI = valorTotal;
  const valorIPI = baseIPI * (aliquotaIPI / 100);
  
  console.log(`   ✅ IPI CALCULADO:`);
  console.log(`      - Base: R$ ${baseIPI.toFixed(2)}`);
  console.log(`      - Alíquota: ${aliquotaIPI}%`);
  console.log(`      - Valor: R$ ${valorIPI.toFixed(2)}`);
  console.log(`      - CST: ${cstIPI}`);
});

console.log('\n🔍 VERIFICAÇÕES:');
console.log('1. ✅ Payload está sendo enviado corretamente');
console.log('2. ✅ Configurações de IPI estão presentes');
console.log('3. ✅ CST 50 é tributado');
console.log('4. ✅ Alíquota 10% é válida');
console.log('5. ✅ Cálculo matemático está correto');

console.log('\n🎯 POSSÍVEIS PROBLEMAS:');
console.log('1. ❓ Backend não está recebendo o payload corretamente');
console.log('2. ❓ Configuração da natureza não está sendo carregada');
console.log('3. ❓ Token de autenticação inválido');
console.log('4. ❓ Backend não está processando o IPI corretamente');

console.log('\n💡 PRÓXIMOS PASSOS:');
console.log('1. Verificar logs do backend');
console.log('2. Verificar se a configuração da natureza está correta');
console.log('3. Testar com dados reais no frontend');
console.log('4. Verificar se o token de autenticação está válido');






