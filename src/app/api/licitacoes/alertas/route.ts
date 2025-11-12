import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/licitacoes/alertas
 * 
 * Lista alertas de licitações da empresa
 */
export async function GET(request: NextRequest) {
  try {
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de autenticação necessário'
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || searchParams.get('company_id') || searchParams.get('userId');
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId é obrigatório' },
        { status: 400 }
      );
    }

    // Validar acesso
    const acesso = await validateUserAccess(token, companyId);
    if (!acesso.valid) {
      const statusCode = acesso.error?.includes('Token') || acesso.error?.includes('não fornecido') ? 401 : 403;
      return NextResponse.json(
        { 
          success: false, 
          error: acesso.error || 'Acesso negado'
        },
        { status: statusCode }
      );
    }

    // Verificar se a tabela existe
    try {
      await query(`SELECT 1 FROM alertas_licitacoes LIMIT 1`);
    } catch (e: any) {
      console.warn('⚠️ Tabela alertas_licitacoes não encontrada');
      return NextResponse.json([]);
    }

    // Buscar alertas
    const alertas = await query(`
      SELECT 
        id,
        nome,
        ativo,
        estados,
        municipios,
        modalidades,
        "valorMinimo",
        "valorMaximo",
        cnae,
        "palavrasChave",
        "apenasAbertas",
        "diasAntesEncerramento",
        "notificarEmail",
        "notificarPush",
        frequencia,
        "horarioNotificacao",
        "createdAt",
        "updatedAt"
      FROM alertas_licitacoes
      WHERE "companyId" = $1
      ORDER BY "createdAt" DESC
    `, [companyId]);

    return NextResponse.json(alertas.rows || []);
  } catch (error: any) {
    console.error('❌ Erro ao buscar alertas:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao buscar alertas'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/licitacoes/alertas
 * 
 * Cria um novo alerta
 */
export async function POST(request: NextRequest) {
  try {
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de autenticação necessário'
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const body = await request.json();
    const companyId = body.companyId || body.company_id || body.userId;
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId é obrigatório' },
        { status: 400 }
      );
    }

    // Validar acesso
    const acesso = await validateUserAccess(token, companyId);
    if (!acesso.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: acesso.error || 'Acesso negado'
        },
        { status: acesso.error?.includes('Token') ? 401 : 403 }
      );
    }

    // Buscar userId do token (simplificado - em produção usar validateUserAccess)
    const userResult = await query(`
      SELECT id FROM users WHERE id IN (
        SELECT user_id FROM user_companies WHERE company_id = $1 LIMIT 1
      ) LIMIT 1
    `, [companyId]);
    
    const userId = userResult.rows[0]?.id || companyId; // Fallback

    // Inserir alerta
    const result = await query(`
      INSERT INTO alertas_licitacoes (
        "userId",
        "companyId",
        nome,
        ativo,
        estados,
        municipios,
        modalidades,
        "valorMinimo",
        "valorMaximo",
        cnae,
        "palavrasChave",
        "apenasAbertas",
        "diasAntesEncerramento",
        "notificarEmail",
        "notificarPush",
        frequencia,
        "horarioNotificacao"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *
    `, [
      userId,
      companyId,
      body.nome,
      body.ativo ?? true,
      body.estados || [],
      body.municipios || [],
      body.modalidades || [],
      body.valorMinimo || null,
      body.valorMaximo || null,
      body.cnae || [],
      body.palavrasChave || [],
      body.apenasAbertas ?? true,
      body.diasAntesEncerramento || null,
      body.notificarEmail ?? true,
      body.notificarPush ?? false,
      body.frequencia || 'diaria',
      body.horarioNotificacao || '09:00',
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar alerta:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao criar alerta'
      },
      { status: 500 }
    );
  }
}

