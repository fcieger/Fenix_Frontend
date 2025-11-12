import { NextRequest, NextResponse } from 'next/server';
import { extractUserIdFromToken, validateUserAccess } from '@/lib/auth-utils';

/**
 * Endpoint de teste para validar token
 * GET /api/test-token
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Token não fornecido',
        steps: {
          step1: 'header_missing',
          step2: null,
          step3: null
        }
      }, { status: 401 });
    }

    const token = authHeader.substring(7).trim();
    
    // Passo 1: Extrair userId do token
    console.log('🔍 TESTE: Extraindo userId do token...');
    const userId = extractUserIdFromToken(token);
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Não foi possível extrair userId do token',
        steps: {
          step1: 'token_received',
          step2: 'extract_failed',
          step3: null
        },
        token_info: {
          length: token.length,
          startsWith_eyJ: token.startsWith('eyJ'),
          parts: token.split('.').length,
          first_50_chars: token.substring(0, 50)
        }
      }, { status: 401 });
    }

    // Passo 2: Validar acesso (precisa de company_id)
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    
    if (!company_id) {
      return NextResponse.json({
        success: true,
        message: 'userId extraído com sucesso',
        userId: userId,
        steps: {
          step1: 'token_received',
          step2: 'extract_success',
          step3: 'company_id_missing'
        },
        token_info: {
          length: token.length,
          startsWith_eyJ: token.startsWith('eyJ'),
          parts: token.split('.').length
        }
      });
    }

    // Passo 3: Validar acesso completo
    console.log('🔍 TESTE: Validando acesso completo...');
    const acesso = await validateUserAccess(token, company_id);
    
    return NextResponse.json({
      success: acesso.valid,
      message: acesso.valid ? 'Acesso validado com sucesso' : acesso.error,
      userId: userId,
      company_id: company_id,
      acesso: acesso,
      steps: {
        step1: 'token_received',
        step2: 'extract_success',
        step3: acesso.valid ? 'validate_success' : 'validate_failed'
      },
      token_info: {
        length: token.length,
        startsWith_eyJ: token.startsWith('eyJ'),
        parts: token.split('.').length
      }
    }, { status: acesso.valid ? 200 : 401 });

  } catch (error: any) {
    console.error('❌ Erro no teste de token:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro desconhecido',
      stack: error.stack
    }, { status: 500 });
  }
}


