import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Buscar resumo das movimentações da conta
    const resumoSql = `
      SELECT 
        COALESCE(SUM(CASE WHEN valor_entrada > 0 AND situacao = 'pendente' THEN valor_entrada ELSE 0 END), 0) as receitas_aberto,
        COALESCE(SUM(CASE WHEN valor_entrada > 0 AND situacao IN ('pago', 'transferido') THEN valor_entrada ELSE 0 END), 0) as receitas_realizadas,
        COALESCE(SUM(CASE WHEN valor_saida > 0 AND situacao = 'pendente' THEN valor_saida ELSE 0 END), 0) as despesas_aberto,
        COALESCE(SUM(CASE WHEN valor_saida > 0 AND situacao IN ('pago', 'transferido') THEN valor_saida ELSE 0 END), 0) as despesas_realizadas,
        COALESCE(SUM(CASE WHEN valor_entrada > 0 THEN valor_entrada ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN valor_saida > 0 THEN valor_saida ELSE 0 END), 0) as total_periodo
      FROM movimentacoes_financeiras 
      WHERE conta_id = $1
    `;
    
    const result = await query(resumoSql, [id]);
    const resumo = result.rows[0];
    
    return NextResponse.json({
      success: true,
      data: {
        receitas_aberto: parseFloat(resumo.receitas_aberto) || 0,
        receitas_realizadas: parseFloat(resumo.receitas_realizadas) || 0,
        despesas_aberto: parseFloat(resumo.despesas_aberto) || 0,
        despesas_realizadas: parseFloat(resumo.despesas_realizadas) || 0,
        total_periodo: parseFloat(resumo.total_periodo) || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

