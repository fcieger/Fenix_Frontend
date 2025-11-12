import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query } from '@/lib/database';

/**
 * GET /api/licitacoes/matches
 * 
 * Retorna licitações com melhor match para a empresa
 * Por enquanto, retorna licitações abertas ordenadas por relevância
 * TODO: Implementar algoritmo de match real baseado em:
 * - CNAE da empresa
 * - Produtos cadastrados
 * - Localização
 * - Histórico de participação
 */
export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json([]);
    }

    // Buscar licitações abertas ordenadas por relevância
    // Por enquanto, ordena por data de abertura (mais recentes primeiro)
    // TODO: Implementar algoritmo de match real
    const licitacoes = await query(`
      SELECT 
        id,
        "numeroProcesso",
        titulo,
        descricao,
        orgao,
        modalidade,
        status,
        esfera,
        estado,
        municipio,
        "valorEstimado",
        "dataAbertura",
        "dataLimite",
        "linkEdital",
        fonte,
        visualizacoes,
        "createdAt",
        "updatedAt"
      FROM licitacoes
      WHERE status = 'Aberta'
        AND "companyId" = $1
      ORDER BY 
        "dataAbertura" DESC,
        "valorEstimado" DESC
      LIMIT 20
    `, [companyId]);

    return NextResponse.json(licitacoes.rows || []);
  } catch (error: any) {
    console.error('❌ Erro ao buscar matches:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao buscar matches'
      },
      { status: 500 }
    );
  }
}


