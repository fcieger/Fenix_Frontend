// Debug da validação de UF
console.log('🔍 DEBUG - VALIDAÇÃO DE UF');
console.log('='.repeat(60));

// Simular dados de configuração
const configuracoesExemplo = [
  {
    id: 'config-1',
    uf: 'SP',
    habilitado: true,
    ipiAliquota: 10,
    ipiCST: '50',
    ipiClasse: '',
    ipiCodigo: ''
  },
  {
    id: 'config-2',
    uf: 'RJ',
    habilitado: false, // ← PROBLEMA: UF RJ não habilitada
    ipiAliquota: 10,
    ipiCST: '50',
    ipiClasse: '',
    ipiCodigo: ''
  },
  {
    id: 'config-3',
    uf: 'MG',
    habilitado: true,
    ipiAliquota: 10,
    ipiCST: '50',
    ipiClasse: '',
    ipiCodigo: ''
  }
];

// Simular UFs
const ufOrigem = 'SP';
const ufDestino = 'RJ'; // ← Cliente está em RJ

console.log('📋 DADOS DE TESTE:');
console.log(`- UF Origem: ${ufOrigem}`);
console.log(`- UF Destino: ${ufDestino}`);
console.log(`- Configurações disponíveis: ${configuracoesExemplo.length}`);
console.log('');

// Simular validação
console.log('🔍 VALIDAÇÃO UF - Verificando se natureza está habilitada para UF:', ufDestino);

const configuracaoUF = configuracoesExemplo.find((config) => config.uf === ufDestino);

console.log('🔍 Configuração encontrada para UF destino:', configuracaoUF);

if (!configuracaoUF || !configuracaoUF.habilitado) {
  const mensagemErro = `Natureza de operação não configurada para a UF do cliente (${ufDestino})`;
  console.log('❌ VALIDAÇÃO UF - Falha:', mensagemErro);
  console.log('');
  console.log('🎯 PROBLEMA IDENTIFICADO:');
  console.log('1. A configuração para a UF do cliente não está habilitada');
  console.log('2. Isso impede o cálculo de impostos');
  console.log('3. O IPI não é calculado por causa desta validação');
  console.log('');
  console.log('💡 SOLUÇÕES:');
  console.log('1. Habilitar a configuração para a UF do cliente');
  console.log('2. Remover a validação de UF (não recomendado)');
  console.log('3. Usar configuração de fallback para UF não habilitada');
} else {
  console.log('✅ VALIDAÇÃO UF - Natureza habilitada para UF:', ufDestino);
  console.log('✅ Cálculo de impostos pode prosseguir');
}

console.log('');
console.log('🔍 CONFIGURAÇÕES DISPONÍVEIS:');
configuracoesExemplo.forEach((config, index) => {
  console.log(`${index + 1}. UF: ${config.uf} - Habilitado: ${config.habilitado ? '✅' : '❌'}`);
});






