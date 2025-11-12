import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/caixa/vendas
 * 
 * Lista vendas do caixa
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
    const caixa_id = searchParams.get('caixa_id');
    const data_inicio = searchParams.get('data_inicio');
    const data_fim = searchParams.get('data_fim');
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!caixa_id) {
      return NextResponse.json(
        { success: false, error: 'caixa_id é obrigatório' },
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

    // Construir query com filtros
    let whereClause = `
      WHERE v."caixaId" = $1::uuid
        AND v."companyId" = $2::uuid
    `;
    const params: any[] = [caixa_id, company_id];

    if (data_inicio) {
      whereClause += ` AND DATE(v."dataVenda") >= $${params.length + 1}::date`;
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ` AND DATE(v."dataVenda") <= $${params.length + 1}::date`;
      params.push(data_fim);
    }

    // Buscar vendas
    const vendasQuery = await query(`
      SELECT 
        v.id,
        v."clienteNome",
        v."valorTotal",
        v."meioPagamento",
        v."dataVenda",
        v.status,
        v."motivoCancelamento",
        v."canceladoPor",
        v."dataCancelamento"
      FROM vendas_caixa v
      ${whereClause}
      ORDER BY v."dataVenda" DESC
    `, params);

    // Calcular totais
    const totaisQuery = await query(`
      SELECT 
        COUNT(*) as total_vendas,
        COALESCE(SUM("valorTotal"), 0) as valor_total_vendas
      FROM vendas_caixa v
      ${whereClause}
    `, params);

    const totais = totaisQuery.rows[0];

    return NextResponse.json({
      success: true,
      data: vendasQuery.rows.map(venda => ({
        id: venda.id,
        clienteNome: venda.clienteNome || 'Cliente Avulso',
        valorTotal: parseFloat(venda.valorTotal || 0),
        meioPagamento: venda.meioPagamento,
        dataVenda: venda.dataVenda,
        status: venda.status,
        motivoCancelamento: venda.motivoCancelamento,
        canceladoPor: venda.canceladoPor,
        dataCancelamento: venda.dataCancelamento
      }))
    });
  } catch (error: any) {
    console.error('❌ Erro ao listar vendas do caixa:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}



