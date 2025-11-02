const jwt = require('jsonwebtoken');

// Simular o que o login faz
const userId = '876fcdff-e957-4ca7-987f-19b934094f1d';
const email = 'fcieger1982@gmail.com';
const companyId = 'eb198f2a-a95b-413a-abb9-464e3b7af303';

const jwtSecret = process.env.JWT_SECRET || 'fenix-secret-key';

console.log('🔍 === TESTE DE PAYLOAD JWT ===\n');
console.log('📝 Gerando token...');
console.log('   userId:', userId);
console.log('   email:', email);
console.log('   companyId:', companyId);
console.log('   jwtSecret:', jwtSecret);

const token = jwt.sign(
  { 
    userId: userId, 
    email: email,
    companyId: companyId
  },
  jwtSecret,
  { expiresIn: '24h' }
);

console.log('\n✅ Token gerado (primeiros 50 chars):', token.substring(0, 50) + '...');

// Decodificar sem verificar
console.log('\n🔍 Decodificando token (sem verificar)...');
const decodedUnverified = jwt.decode(token);
console.log('Payload decodificado:', JSON.stringify(decodedUnverified, null, 2));

console.log('\n🔍 Verificando campos no payload:');
console.log('   decodedUnverified?.userId:', decodedUnverified?.userId);
console.log('   decodedUnverified?.user_id:', decodedUnverified?.user_id);
console.log('   decodedUnverified?.user?.id:', decodedUnverified?.user?.id);
console.log('   typeof decodedUnverified?.userId:', typeof decodedUnverified?.userId);

// Verificar o token
console.log('\n🔍 Verificando token...');
try {
  const verified = jwt.verify(token, jwtSecret);
  console.log('✅ Token verificado:', JSON.stringify(verified, null, 2));
  console.log('\n✅ userId extraído:', verified.userId);
} catch (error) {
  console.error('❌ Erro ao verificar:', error.message);
}
