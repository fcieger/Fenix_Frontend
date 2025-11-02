import { UserService, UserCompanyService } from './database-service';
import jwt from 'jsonwebtoken';

/**
 * Extrai o userId de um token (JWT ou mock)
 * PRIORIDADE: JWT primeiro (formato padrão do login), depois mock (para compatibilidade)
 */
export function extractUserIdFromToken(token: string): string | null {
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

  // PRIORIDADE 1: Tentar JWT (formato padrão do login)
  // JWT sempre começa com 'eyJ' e tem pelo menos 2 pontos
  if (trimmedToken.startsWith('eyJ') && trimmedToken.includes('.') && trimmedToken.split('.').length === 3) {
    console.log('🔍 Token parece ser JWT, tentando verificar...');
    try {
      const jwtSecret = process.env.JWT_SECRET || 'fenix-secret-key';
      console.log('🔍 JWT_SECRET usado:', jwtSecret.substring(0, 10) + '...');
      
      // Tentar decodificar SEM verificar primeiro para ver o payload
      const decodedUnverified = jwt.decode(trimmedToken) as any;
      console.log('🔍 JWT decodificado (sem verificação):', {
        hasUserId: !!decodedUnverified?.userId,
        userId: decodedUnverified?.userId,
        user_id: decodedUnverified?.user_id,
        sub: decodedUnverified?.sub,
        email: decodedUnverified?.email,
        exp: decodedUnverified?.exp,
        expDate: decodedUnverified?.exp ? new Date(decodedUnverified.exp * 1000).toISOString() : null,
        now: new Date().toISOString(),
        expired: decodedUnverified?.exp ? new Date() > new Date(decodedUnverified.exp * 1000) : null
      });
      
      // Se não tiver userId, tentar outras variações
      if (!decodedUnverified?.userId) {
        console.warn('⚠️ Token não tem campo userId, tentando user_id ou sub...');
        if (decodedUnverified?.user_id) {
          console.log('✅ Campo user_id encontrado:', decodedUnverified.user_id);
          return decodedUnverified.user_id;
        }
        if (decodedUnverified?.sub) {
          console.log('✅ Campo sub encontrado:', decodedUnverified.sub);
          return decodedUnverified.sub;
        }
      }
      
      // Agora tentar verificar o JWT
      try {
        const decoded = jwt.verify(trimmedToken, jwtSecret) as any;
        console.log('✅ JWT VERIFICADO com sucesso:', {
          hasUserId: !!decoded?.userId,
          userId: decoded?.userId
        });
        
        // Tentar userId primeiro, depois user_id, depois sub
        const userId = decoded?.userId || decoded?.user_id || decoded?.sub;
        if (userId && typeof userId === 'string') {
          console.log('✅ userId extraído:', userId);
          return userId;
        } else {
          console.error('❌ JWT verificado mas sem userId válido. Campos disponíveis:', Object.keys(decoded || {}));
          console.error('   decoded.userId:', decoded?.userId);
          console.error('   decoded.user_id:', decoded?.user_id);
          console.error('   decoded.sub:', decoded?.sub);
        }
      } catch (verifyError: any) {
        console.error('❌ Erro ao verificar JWT:', {
          name: verifyError.name,
          message: verifyError.message,
          expiredAt: verifyError.expiredAt
        });
        
        if (decodedUnverified && decodedUnverified.userId) {
          console.error('❌ JWT tem userId mas verificação falhou:', {
            error: verifyError.name,
            message: verifyError.message,
            userId: decodedUnverified.userId
          });
        }
        
        throw verifyError;
      }
    } catch (jwtError: any) {
      console.error('❌ Erro ao processar JWT:', {
        name: jwtError.name,
        message: jwtError.message
      });
      // Continua para tentar formato mock abaixo
    }
  } else {
    console.log('⚠️ Token não parece ser JWT válido (não começa com eyJ ou não tem 3 partes)');
  }

  // PRIORIDADE 2: Tentar formato mock (para compatibilidade com endpoints antigos)
  // Formato: mock-jwt-token-{uuid}-{timestamp}
  console.log('🔍 Tentando formato mock...');
  const tokenMatch = trimmedToken.match(/^mock-jwt-token-(.{36})-\d+$/);
  if (tokenMatch && tokenMatch[1]) {
    console.log('✅ Token mock detectado, userId:', tokenMatch[1]);
    return tokenMatch[1];
  }

  // Se chegou aqui, não é nem JWT válido nem mock
  console.error('❌ NÃO FOI POSSÍVEL EXTRAIR userId DO TOKEN');
  return null;
}

/**
 * Valida acesso do usuário à empresa
 */
export async function validateUserAccess(
  token: string,
  company_id: string
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return { valid: false, error: 'Token não fornecido' };
    }

    const userId = extractUserIdFromToken(token);
    
    if (!userId) {
      return { valid: false, error: 'Token inválido' };
    }

    // Buscar usuário
    const user = await UserService.findById(userId);
    if (!user) {
      return { valid: false, error: 'Usuário não encontrado' };
    }

    // Buscar empresas do usuário
    const companies = await UserCompanyService.getUserCompanies(user.id!);
    
    // Verificar se company_id pertence ao usuário
    const temAcesso = companies.some(c => c.id === company_id);
    if (!temAcesso) {
      return { valid: false, error: 'Acesso negado: empresa não pertence ao usuário' };
    }

    return { valid: true, userId };
  } catch (error: any) {
    console.error('❌ Erro ao validar acesso:', error);
    return { valid: false, error: `Erro ao validar acesso: ${error.message || 'Erro desconhecido'}` };
  }
}
