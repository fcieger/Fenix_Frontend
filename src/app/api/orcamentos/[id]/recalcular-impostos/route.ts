import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * POST /api/orcamentos/[id]/recalcular-impostos
 * 
 * Recalcular impostos de um orçamento
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

    // Buscar o orçamento para validar acesso
    const orcamentoResult = await query(`
      SELECT * FROM orcamentos WHERE id = $1::uuid
    `, [id]);

    if (orcamentoResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Orçamento não encontrado' },
        { status: 404 }
      );
    }

    const orcamento = orcamentoResult.rows[0];

    // Validar acesso
    const acesso = await validateUserAccess(token, orcamento.companyId);
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

    // Buscar itens do orçamento
    const itensResult = await query(`
      SELECT * FROM orcamento_itens WHERE "orcamentoId" = $1::uuid
    `, [id]);

    // Calcular impostos (lógica básica - pode ser expandida)
    let totalImpostos = 0;
    
    for (const item of itensResult.rows) {
      const totalItem = parseFloat(item.totalItem || 0);
      // Exemplo: calcular 18% de impostos sobre cada item
      // Esta é uma lógica simplificada - ajuste conforme suas regras de negócio
      const impostoItem = totalItem * 0.18;
      totalImpostos += impostoItem;
    }

    // Atualizar total de impostos e total geral
    const totalProdutos = parseFloat(orcamento.totalProdutos || 0);
    const totalDescontos = parseFloat(orcamento.totalDescontos || 0);
    const totalGeral = totalProdutos - totalDescontos + totalImpostos;

    await query(`
      UPDATE orcamentos
      SET 
        "totalImpostos" = $2,
        "totalGeral" = $3,
        "updatedAt" = NOW()
      WHERE id = $1::uuid
    `, [id, totalImpostos, totalGeral]);

    return NextResponse.json({
      success: true,
      message: 'Impostos recalculados com sucesso',
      totalImpostos,
      totalGeral
    });
  } catch (error: any) {
    console.error('❌ Erro ao recalcular impostos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

