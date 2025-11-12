import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/licitacoes
 * 
 * Lista licitações com filtros
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
      console.warn('⚠️ Tabela licitacoes não encontrada, retornando array vazio');
      return NextResponse.json({
        data: [],
        total: 0,
        pagina: 1,
        limite: 20,
      });
    }

    // Obter filtros
    const estado = searchParams.get('estado');
    const modalidade = searchParams.get('modalidade');
    const status = searchParams.get('status');
    const valorMinimo = searchParams.get('valorMinimo');
    const valorMaximo = searchParams.get('valorMaximo');
    const busca = searchParams.get('busca');
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const limite = parseInt(searchParams.get('limite') || '20');

    // Construir query com filtros
    let conditions = ['l."companyId" = $1::uuid'];
    let params: any[] = [companyId];
    let paramIndex = 2;

    if (estado) {
      conditions.push(`l.estado = $${paramIndex}`);
      params.push(estado);
      paramIndex++;
    }

    if (modalidade) {
      conditions.push(`l.modalidade = $${paramIndex}`);
      params.push(modalidade);
      paramIndex++;
    }

    if (status) {
      conditions.push(`l.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (valorMinimo) {
      conditions.push(`l."valorEstimado" >= $${paramIndex}`);
      params.push(parseFloat(valorMinimo));
      paramIndex++;
    }

    if (valorMaximo) {
      conditions.push(`l."valorEstimado" <= $${paramIndex}`);
      params.push(parseFloat(valorMaximo));
      paramIndex++;
    }

    if (busca) {
      conditions.push(`(
        l.titulo ILIKE $${paramIndex} OR
        l.descricao ILIKE $${paramIndex} OR
        l.orgao ILIKE $${paramIndex} OR
        l."numeroProcesso" ILIKE $${paramIndex}
      )`);
      params.push(`%${busca}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Buscar total de registros
    const countResult = await query(
      `SELECT COUNT(*) as total FROM licitacoes l WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Buscar licitações com paginação
    const offset = (pagina - 1) * limite;
    params.push(limite, offset);

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
        l."createdAt"
      FROM licitacoes l
      WHERE ${whereClause}
      ORDER BY l."dataAbertura" DESC, l."createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `,
      params
    );

    return NextResponse.json({
      data: result.rows,
      total,
      pagina,
      limite,
    });
  } catch (error: any) {
    console.error('Erro ao listar licitações:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar licitações' },
      { status: 500 }
    );
  }
}


