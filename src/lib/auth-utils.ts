import { UserService, UserCompanyService } from './database-service';
import jwt from 'jsonwebtoken';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Obtém o JWT secret da variável de ambiente
 * Lança erro se não estiver configurado
 */
function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET não configurado. Configure a variável de ambiente JWT_SECRET.');
  }
  return jwtSecret;
}

/**
 * Extrai o userId de um token (JWT ou mock)
 * PRIORIDADE: JWT primeiro (formato padrão do login), depois mock (para compatibilidade)
 */
export function extractUserIdFromToken(token: string): string | null {
  if (isDev) {
    console.log('🔍 extractUserIdFromToken chamada');
    console.log('🔍 Token recebido (primeiros 50 chars):', token ? token.substring(0, 50) + '...' : 'NENHUM');
  }

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    if (isDev) {
      console.error('❌ Token vazio ou inválido');
    }
    return null;
  }

  const trimmedToken = token.trim();
  if (isDev) {
    console.log('🔍 Token após trim (primeiros 50 chars):', trimmedToken.substring(0, 50) + '...');
    console.log('🔍 Token começa com eyJ?', trimmedToken.startsWith('eyJ'));
    console.log('🔍 Token contém ponto?', trimmedToken.includes('.'));
    console.log('🔍 Número de partes (separadas por ponto):', trimmedToken.split('.').length);
  }

  // PRIORIDADE 1: Tentar JWT (formato padrão do login)
  // JWT sempre começa com 'eyJ' e tem pelo menos 2 pontos
  if (trimmedToken.startsWith('eyJ') && trimmedToken.includes('.') && trimmedToken.split('.').length === 3) {
    if (isDev) {
      console.log('🔍 Token parece ser JWT, tentando verificar...');
    }
    try {
      const jwtSecret = getJwtSecret();
      if (isDev) {
        console.log('🔍 JWT_SECRET usado:', jwtSecret.substring(0, 10) + '...');
      }

      // Tentar decodificar SEM verificar primeiro para ver o payload e verificar expiração
      const decodedUnverified = jwt.decode(trimmedToken) as any;

      // Verificar expiração antes de processar
      if (decodedUnverified?.exp) {
        const expirationTime = decodedUnverified.exp * 1000; // Converter para milliseconds
        const now = Date.now();
        if (now > expirationTime) {
          if (isDev) {
            console.error('❌ Token expirado:', {
              expDate: new Date(expirationTime).toISOString(),
              now: new Date(now).toISOString()
            });
          }
          return null;
        }
      }

      if (isDev) {
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
      }

      // Se não tiver userId, tentar outras variações
      if (!decodedUnverified?.userId) {
        if (isDev) {
          console.warn('⚠️ Token não tem campo userId, tentando user_id ou sub...');
        }
        if (decodedUnverified?.user_id) {
          if (isDev) {
            console.log('✅ Campo user_id encontrado:', decodedUnverified.user_id);
          }
          return decodedUnverified.user_id;
        }
        if (decodedUnverified?.sub) {
          if (isDev) {
            console.log('✅ Campo sub encontrado:', decodedUnverified.sub);
          }
          return decodedUnverified.sub;
        }
      }

      // Agora tentar verificar o JWT
      try {
        const decoded = jwt.verify(trimmedToken, jwtSecret) as any;
        if (isDev) {
          console.log('✅ JWT VERIFICADO com sucesso:', {
            hasUserId: !!decoded?.userId,
            userId: decoded?.userId
          });
        }

        // Tentar userId primeiro, depois user_id, depois sub
        const userId = decoded?.userId || decoded?.user_id || decoded?.sub;
        if (userId && typeof userId === 'string') {
          if (isDev) {
            console.log('✅ userId extraído:', userId);
          }
          return userId;
        } else {
          if (isDev) {
            console.error('❌ JWT verificado mas sem userId válido. Campos disponíveis:', Object.keys(decoded || {}));
            console.error('   decoded.userId:', decoded?.userId);
            console.error('   decoded.user_id:', decoded?.user_id);
            console.error('   decoded.sub:', decoded?.sub);
          }
        }
      } catch (verifyError: any) {
        if (isDev) {
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
        }

        throw verifyError;
      }
    } catch (jwtError: any) {
      // Se for erro de JWT_SECRET não configurado, propagar
      if (jwtError.message?.includes('JWT_SECRET não configurado')) {
        throw jwtError;
      }

      if (isDev) {
        console.error('❌ Erro ao processar JWT:', {
          name: jwtError.name,
          message: jwtError.message
        });
      }
      // Continua para tentar formato mock abaixo
    }
  } else {
    if (isDev) {
      console.log('⚠️ Token não parece ser JWT válido (não começa com eyJ ou não tem 3 partes)');
    }
  }

  // PRIORIDADE 2: Tentar formato mock (para compatibilidade com endpoints antigos)
  // Formato: mock-jwt-token-{uuid}-{timestamp}
  if (isDev) {
    console.log('🔍 Tentando formato mock...');
  }
  const tokenMatch = trimmedToken.match(/^mock-jwt-token-(.{36})-\d+$/);
  if (tokenMatch && tokenMatch[1]) {
    if (isDev) {
      console.log('✅ Token mock detectado, userId:', tokenMatch[1]);
    }
    return tokenMatch[1];
  }

  // Se chegou aqui, não é nem JWT válido nem mock
  if (isDev) {
    console.error('❌ NÃO FOI POSSÍVEL EXTRAIR userId DO TOKEN');
  }
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
    if (isDev) {
      console.log('🔍 validateUserAccess iniciada');
      console.log('🔍 company_id solicitado:', company_id);
    }

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      if (isDev) {
        console.error('❌ Token não fornecido ou inválido');
      }
      return { valid: false, error: 'Token não fornecido' };
    }

    const userId = extractUserIdFromToken(token);
    if (isDev) {
      console.log('🔍 userId extraído do token:', userId);
    }

    if (!userId) {
      if (isDev) {
        console.error('❌ Não foi possível extrair userId do token');
      }
      return { valid: false, error: 'Token inválido' };
    }

    // Buscar usuário
    if (isDev) {
      console.log('🔍 Buscando usuário no banco com ID:', userId);
    }
    const user = await UserService.findById(userId);
    if (isDev) {
      console.log('🔍 Usuário encontrado no banco:', user ? { id: user.id, email: user.email, name: user.name } : 'NÃO ENCONTRADO');
    }

    if (!user) {
      if (isDev) {
        console.error('❌ Usuário não encontrado no banco com ID:', userId);
      }
      return { valid: false, error: 'Usuário não encontrado' };
    }

    // Buscar empresas do usuário
    if (isDev) {
      console.log('🔍 Buscando empresas do usuário:', user.id);
    }
    const companies = await UserCompanyService.getUserCompanies(user.id!);
    if (isDev) {
      console.log('🔍 Empresas encontradas:', companies.length);
      console.log('🔍 IDs das empresas:', companies.map(c => c.id));
    }

    // Verificar se company_id pertence ao usuário
    const temAcesso = companies.some(c => c.id === company_id);
    if (isDev) {
      console.log('🔍 Usuário tem acesso à empresa solicitada?', temAcesso);
    }

    if (!temAcesso) {
      if (isDev) {
        console.error('❌ Acesso negado: empresa não pertence ao usuário');
        console.error('   Company ID solicitado:', company_id);
        console.error('   Companies do usuário:', companies.map(c => c.id));
      }
      return { valid: false, error: 'Acesso negado: empresa não pertence ao usuário' };
    }

    if (isDev) {
      console.log('✅ Validação de acesso bem-sucedida');
    }
    return { valid: true, userId };
  } catch (error: any) {
    if (isDev) {
      console.error('❌ Erro ao validar acesso:', error);
    }
    return { valid: false, error: `Erro ao validar acesso: ${error.message || 'Erro desconhecido'}` };
  }
}
