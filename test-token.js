const jwt = require('jsonwebtoken');

// Simular o que o endpoint faz
function extractUserIdFromToken(token) {
  console.log('🔍 extractUserIdFromToken chamada');
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
      console.log('🔍 JWT_SECRET usado:', jwtSecret.substring(0, 10) + '...');
      console.log('🔍 JWT_SECRET completo:', jwtSecret);
      
      // Tentar decodificar SEM verificar primeiro
      const decodedUnverified = jwt.decode(trimmedToken);
      console.log('🔍 JWT decodificado (sem verificação):', JSON.stringify(decodedUnverified, null, 2));
      
      if (decodedUnverified) {
        console.log('🔍 Expiração:', decodedUnverified.exp ? new Date(decodedUnverified.exp * 1000).toISOString() : 'N/A');
        console.log('🔍 Agora:', new Date().toISOString());
        console.log('🔍 Token expirado?', decodedUnverified.exp ? new Date() > new Date(decodedUnverified.exp * 1000) : 'N/A');
      }
      
      // Agora tentar verificar
      try {
        const decoded = jwt.verify(trimmedToken, jwtSecret);
        console.log('✅ JWT VERIFICADO com sucesso:', JSON.stringify(decoded, null, 2));
        
        if (decoded && decoded.userId && typeof decoded.userId === 'string') {
          console.log('✅ userId extraído:', decoded.userId);
          return decoded.userId;
        } else {
          console.error('❌ JWT verificado mas sem userId válido:', decoded);
        }
      } catch (verifyError) {
        console.error('❌ Erro ao verificar JWT:');
        console.error('   Nome:', verifyError.name);
        console.error('   Mensagem:', verifyError.message);
        console.error('   ExpiredAt:', verifyError.expiredAt);
        console.error('   Stack:', verifyError.stack);
        throw verifyError;
      }
    } catch (jwtError) {
      console.error('❌ Erro ao processar JWT:', {
        name: jwtError.name,
        message: jwtError.message,
        stack: jwtError.stack
      });
    }
  } else {
    console.log('⚠️ Token não parece ser JWT válido (não começa com eyJ ou não tem 3 partes)');
  }

  return null;
}

// Token do usuário (passado como argumento)
const token = process.argv[2];

if (!token) {
  console.log('❌ Por favor, forneça o token como argumento:');
  console.log('   node test-token.js "seu-token-jwt-aqui"');
  process.exit(1);
}

console.log('🧪 TESTANDO TOKEN NO BACKEND...\n');
const userId = extractUserIdFromToken(token);
console.log('\n📊 RESULTADO:');
if (userId) {
  console.log('✅ userId extraído:', userId);
} else {
  console.log('❌ Falha ao extrair userId do token');
}
