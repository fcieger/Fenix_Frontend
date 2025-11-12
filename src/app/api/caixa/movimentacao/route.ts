import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * POST /api/caixa/movimentacao
 * 
 * Registra sangria ou suprimento de caixa
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
    const { company_id, caixa_id, tipo, valor, descricao, formaPagamentoId } = body;
    
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

    if (!tipo) {
      return NextResponse.json(
        { success: false, error: 'tipo é obrigatório (sangria ou suprimento)' },
        { status: 400 }
      );
    }

    if (!['sangria', 'suprimento'].includes(tipo)) {
      return NextResponse.json(
        { success: false, error: 'tipo deve ser "sangria" ou "suprimento"' },
        { status: 400 }
      );
    }

    if (valor === undefined || valor === null) {
      return NextResponse.json(
        { success: false, error: 'valor é obrigatório' },
        { status: 400 }
      );
    }

    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'valor deve ser um número > 0' },
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

    // Verificar se o caixa existe e está aberto
    const caixaQuery = await query(`
      SELECT id, status
      FROM caixas
      WHERE id = $1::uuid
        AND "companyId" = $2::uuid
    `, [caixa_id, company_id]);

    if (caixaQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Caixa não encontrado' },
        { status: 404 }
      );
    }

    const caixa = caixaQuery.rows[0];
    if (caixa.status !== 'aberto') {
      return NextResponse.json(
        { success: false, error: 'Caixa deve estar aberto para registrar movimentação' },
        { status: 400 }
      );
    }

    // Criar movimentação
    const movimentacaoQuery = await query(`
      INSERT INTO movimentacoes_caixa (
        "caixaId",
        "companyId",
        tipo,
        valor,
        descricao,
        "formaPagamentoId",
        "dataMovimentacao"
      )
      VALUES ($1::uuid, $2::uuid, $3::text, $4::numeric, $5::text, $6::uuid, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        tipo,
        valor,
        descricao,
        "dataMovimentacao",
        "createdAt"
    `, [caixa_id, company_id, tipo, valorNum, descricao || null, formaPagamentoId || null]);

    const movimentacao = movimentacaoQuery.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        id: movimentacao.id,
        tipo: movimentacao.tipo,
        valor: parseFloat(movimentacao.valor || 0),
        descricao: movimentacao.descricao,
        dataMovimentacao: movimentacao.dataMovimentacao,
        createdAt: movimentacao.createdAt
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao registrar movimentação:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}





