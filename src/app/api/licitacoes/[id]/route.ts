import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/licitacoes/[id]
 * 
 * Busca uma licitação específica por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json(
        { success: false, error: 'Licitação não encontrada' },
        { status: 404 }
      );
    }

    // Buscar licitação por ID
    const result = await query(
      `
      SELECT 
        l.id,
        l."numeroProcesso",
        l.titulo,
        l.descricao,
        l.orgao,
        l."orgaoSigla",
        l.modalidade,
        l.esfera,
        l.estado,
        l.municipio,
        l."valorEstimado",
        l."dataAbertura",
        l."dataLimite",
        l.status,
        l."linkEdital",
        l."linkSistema",
        l.fonte,
        l.visualizacoes,
        l."createdAt",
        l."updatedAt"
      FROM licitacoes l
      WHERE l.id = $1::uuid AND l."companyId" = $2::uuid
      `,
      [params.id, companyId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Licitação não encontrada' },
        { status: 404 }
      );
    }

    // Incrementar visualizações
    await query(
      `UPDATE licitacoes SET visualizacoes = visualizacoes + 1 WHERE id = $1::uuid`,
      [params.id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Erro ao buscar licitação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar licitação' },
      { status: 500 }
    );
  }
}




