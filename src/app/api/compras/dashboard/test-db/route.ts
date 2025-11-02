import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

/**
 * GET /api/compras/dashboard/test-db
 * 
 * Testa diretamente as queries do dashboard para verificar dados
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id') || 'eb198f2a-a95b-413a-abb9-464e3b7af303';
    
    // Verificar total de compras SEM filtro de status
    const todasComprasQuery = await query(`
      SELECT 
        COUNT(*) as total_todas,
        COUNT(CASE WHEN status NOT IN ('cancelado', 'rascunho') THEN 1 END) as total_validas,
        array_agg(DISTINCT status) as status_disponiveis,
        MIN("dataEmissao") as primeira_compra,
        MAX("dataEmissao") as ultima_compra
      FROM pedidos_compra
      WHERE "companyId" = $1::uuid
    `, [company_id]);

    // Verificar compras por status
    const comprasPorStatusQuery = await query(`
      SELECT 
        status,
        COUNT(*) as quantidade,
        COALESCE(SUM("totalGeral"), 0) as valor_total
      FROM pedidos_compra
      WHERE "companyId" = $1::uuid
      GROUP BY status
      ORDER BY quantidade DESC
    `, [company_id]);

    // Verificar compras no último mês (sem filtro de status)
    const hoje = new Date();
    const umMesAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dataInicio = umMesAtras.toISOString().split('T')[0];
    const dataFim = hoje.toISOString().split('T')[0];

    const comprasUltimoMesQuery = await query(`
      SELECT 
        COUNT(*) as total_compras,
        COUNT(CASE WHEN status NOT IN ('cancelado', 'rascunho') THEN 1 END) as total_validas,
        COALESCE(SUM(CASE WHEN status NOT IN ('cancelado', 'rascunho') THEN "totalGeral" ELSE 0 END), 0) as valor_total
      FROM pedidos_compra
      WHERE "companyId" = $1::uuid
        AND DATE("dataEmissao") >= $2::date
        AND DATE("dataEmissao") <= $3::date
    `, [company_id, dataInicio, dataFim]);

    // Verificar últimas 5 compras
    const ultimasComprasQuery = await query(`
      SELECT 
        id,
        numero,
        "dataEmissao",
        status,
        "totalGeral",
        "fornecedorId"
      FROM pedidos_compra
      WHERE "companyId" = $1::uuid
      ORDER BY "dataEmissao" DESC
      LIMIT 5
    `, [company_id]);

    return NextResponse.json({
      success: true,
      data: {
        resumo: todasComprasQuery.rows[0],
        porStatus: comprasPorStatusQuery.rows,
        ultimoMes: {
          ...comprasUltimoMesQuery.rows[0],
          periodo: { dataInicio, dataFim }
        },
        ultimasCompras: ultimasComprasQuery.rows
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao testar dashboard:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
