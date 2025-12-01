import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/caixa/status
 * 
 * Verifica se existe caixa aberto para o usuário/empresa atual
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
    const company_id = searchParams.get('company_id');
    const usuario_id = searchParams.get('usuario_id');
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    // Validar acesso
    const acesso = await validateUserAccess(token, company_id);
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

    // Se não tiver usuario_id, tentar pegar do token
    let usuarioId = usuario_id;
    if (!usuarioId && acesso.userId) {
      usuarioId = acesso.userId;
    }

    if (!usuarioId) {
      return NextResponse.json(
        { success: false, error: 'usuario_id é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar caixa aberto para o usuário e empresa
    const caixaQuery = await query(`
      SELECT 
        id,
        descricao,
        "valorAbertura",
        "dataAbertura",
        status,
        observacoes,
        "createdAt"
      FROM caixas
      WHERE "companyId" = $1::uuid
        AND "usuarioId" = $2::uuid
        AND status = 'aberto'
      ORDER BY "dataAbertura" DESC
      LIMIT 1
    `, [company_id, usuarioId]);

    const caixa = caixaQuery.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        caixaAberto: !!caixa,
        caixa: caixa ? {
          id: caixa.id,
          descricao: caixa.descricao,
          valorAbertura: parseFloat(caixa.valorAbertura || 0),
          dataAbertura: caixa.dataAbertura,
          status: caixa.status,
          observacoes: caixa.observacoes,
          createdAt: caixa.createdAt
        } : null
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao verificar status do caixa:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}







