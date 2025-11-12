const jwt = require('jsonwebtoken');

// Simular o que o login faz (gerar token)
function gerarToken(userId, email, companyId) {
  const jwtSecret = process.env.JWT_SECRET || 'fenix-secret-key';
  const token = jwt.sign(
    { 
      userId: userId, 
      email: email,
      companyId: companyId || null
    },
    jwtSecret,
    { expiresIn: '24h' }
  );
  return token;
}

// Simular o que o endpoint faz (validar token)
function validarToken(token) {
  console.log('🔍 === VALIDAÇÃO DE TOKEN ===');
  console.log('🔍 Token recebido (primeiros 50 chars):', token ? token.substring(0, 50) + '...' : 'NENHUM');
  
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    console.error('❌ Token vazio ou inválido');
    return null;
  }

  const trimmedToken = token.trim();
  console.log('🔍 Token após trim (primeiros 50 chars):', trimmedToken.substring(0, 50) + '...');
  console.log('🔍 Token começa com eyJ?', trimmedToken.startsWith('eyJ'));
  console.log('🔍 Token contém ponto?', trimmedToken.includes('.'));
  console.log('🔍 Número de partes (separadas por ponto):', trimmedToken.split('.').length);
  console.log('🔍 Token completo length:', trimmedToken.length);

  // PRIORIDADE 1: Tentar JWT
  if (trimmedToken.startsWith('eyJ') && trimmedToken.includes('.') && trimmedToken.split('.').length === 3) {
    console.log('🔍 Token parece ser JWT, tentando verificar...');
    try {
      const jwtSecret = process.env.JWT_SECRET || 'fenix-secret-key';
      console.log('🔍 JWT_SECRET usado:', jwtSecret);
      console.log('🔍 JWT_SECRET length:', jwtSecret.length);
      
      // Tentar decodificar SEM verificar primeiro
      const decodedUnverified = jwt.decode(trimmedToken);
      console.log('\n🔍 JWT decodificado (sem verificação):');
      console.log(JSON.stringify(decodedUnverified, null, 2));
      
      if (decodedUnverified) {
        console.log('\n🔍 Análise do payload:');
        console.log('   hasUserId:', !!decodedUnverified.userId);
        console.log('   userId:', decodedUnverified.userId);
        console.log('   email:', decodedUnverified.email);
        console.log('   companyId:', decodedUnverified.companyId);
        console.log('   exp:', decodedUnverified.exp);
        
        if (decodedUnverified.exp) {
          const expDate = new Date(decodedUnverified.exp * 1000);
          const now = new Date();
          console.log('   Data expiração:', expDate.toISOString());
          console.log('   Data atual:', now.toISOString());
          console.log('   Token expirado?', now > expDate);
          console.log('   Diferença (segundos):', Math.floor((expDate - now) / 1000));
        }
      }
      
      // Agora tentar verificar
      console.log('\n🔍 Tentando verificar JWT com secret...');
      try {
        const decoded = jwt.verify(trimmedToken, jwtSecret);
        console.log('✅ JWT VERIFICADO com sucesso!');
        console.log(JSON.stringify(decoded, null, 2));
        
        if (decoded && decoded.userId && typeof decoded.userId === 'string') {
          console.log('\n✅ userId extraído:', decoded.userId);
          return decoded.userId;
        } else {
          console.error('❌ JWT verificado mas sem userId válido:', decoded);
        }
      } catch (verifyError) {
        console.error('\n❌ ERRO ao verificar JWT:');
        console.error('   Nome:', verifyError.name);
        console.error('   Mensagem:', verifyError.message);
        console.error('   ExpiredAt:', verifyError.expiredAt);
        
        if (verifyError.name === 'TokenExpiredError') {
          console.error('\n❌ TOKEN EXPIRADO!');
          console.error('   Data de expiração:', verifyError.expiredAt);
          console.error('   Data atual:', new Date().toISOString());
        } else if (verifyError.name === 'JsonWebTokenError') {
          console.error('\n❌ ERRO DE FORMATO JWT!');
          if (verifyError.message.includes('secret')) {
            console.error('   PROBLEMA COM O SECRET!');
            console.error('   Verifique se JWT_SECRET está correto');
          }
        }
        
        console.error('\n   Stack:', verifyError.stack);
        throw verifyError;
      }
    } catch (jwtError) {
      console.error('\n❌ Erro ao processar JWT:');
      console.error('   Nome:', jwtError.name);
      console.error('   Mensagem:', jwtError.message);
      console.error('   Stack:', jwtError.stack);
    }
  } else {
    console.log('⚠️ Token não parece ser JWT válido (não começa com eyJ ou não tem 3 partes)');
  }

  return null;
}

// TESTE 1: Gerar um token e validar
console.log('🧪 TESTE 1: Gerar token e validar\n');
const testUserId = '876fcdff-e957-4ca7-987f-19b934094f1d';
const testEmail = 'test@test.com';
const testCompanyId = 'eb198f2a-a95b-413a-abb9-464e3b7af303';

console.log('📝 Gerando token...');
const testToken = gerarToken(testUserId, testEmail, testCompanyId);
console.log('✅ Token gerado (primeiros 50 chars):', testToken.substring(0, 50) + '...\n');

console.log('📝 Validando token gerado...');
const extractedUserId = validarToken(testToken);
console.log('\n📊 RESULTADO TESTE 1:');
if (extractedUserId === testUserId) {
  console.log('✅ SUCESSO! Token gerado e validado corretamente');
} else {
  console.log('❌ FALHA! Token não foi validado corretamente');
}

// TESTE 2: Validar token passado como argumento
const tokenArg = process.argv[2];
if (tokenArg) {
  console.log('\n\n🧪 TESTE 2: Validar token fornecido\n');
  console.log('📝 Token fornecido (primeiros 50 chars):', tokenArg.substring(0, 50) + '...\n');
  const extractedUserId2 = validarToken(tokenArg);
  console.log('\n📊 RESULTADO TESTE 2:');
  if (extractedUserId2) {
    console.log('✅ userId extraído:', extractedUserId2);
  } else {
    console.log('❌ Falha ao extrair userId do token fornecido');
  }
} else {
  console.log('\n💡 Para testar um token específico, use:');
  console.log('   node test-token-completo.js "seu-token-jwt-aqui"');
}


