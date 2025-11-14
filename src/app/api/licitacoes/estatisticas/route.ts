import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/licitacoes/estatisticas
 * 
 * Retorna estatísticas das licitações
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
    const companyId = searchParams.get('companyId') || searchParams.get('company_id');
    
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
      await query(`SELECT 1 FROM licitacoes LIMIT 1`);
    } catch (e: any) {
      console.warn('⚠️ Tabela licitacoes não encontrada');
      return NextResponse.json({
        total: 0,
        abertas: 0,
        encerrandoEmBreve: 0,
        matches: 0,
      });
    }

    // Buscar estatísticas
    const result = await query(
      `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Aberta') as abertas,
        COUNT(*) FILTER (
          WHERE status = 'Aberta' 
          AND "dataLimite" IS NOT NULL 
          AND "dataLimite" <= NOW() + INTERVAL '7 days'
        ) as "encerrandoEmBreve",
        0 as matches
      FROM licitacoes
      WHERE "companyId" = $1::uuid
      `,
      [companyId]
    );

    const stats = result.rows[0] || {
      total: 0,
      abertas: 0,
      encerrandoEmBreve: 0,
      matches: 0,
    };

    return NextResponse.json({
      total: parseInt(stats.total),
      abertas: parseInt(stats.abertas),
      encerrandoEmBreve: parseInt(stats.encerrandoEmBreve),
      matches: parseInt(stats.matches),
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}



