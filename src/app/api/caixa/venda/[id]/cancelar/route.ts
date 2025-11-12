import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * POST /api/caixa/venda/[id]/cancelar
 * 
 * Cancela uma venda já finalizada
 */
export async function POST(
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
    const body = await request.json();
    const { company_id, usuario_id, motivo } = body;
    const venda_id = params.id;
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!usuario_id) {
      return NextResponse.json(
        { success: false, error: 'usuario_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!venda_id) {
      return NextResponse.json(
        { success: false, error: 'venda_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!motivo || motivo.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Motivo é obrigatório (mínimo 10 caracteres)' },
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

    // Buscar venda
    const vendaQuery = await query(`
      SELECT 
        v.id,
        v.status,
        v."dataVenda",
        v."caixaId",
        v."valorTotal"
      FROM vendas_caixa v
      WHERE v.id = $1::uuid
        AND v."companyId" = $2::uuid
    `, [venda_id, company_id]);

    if (vendaQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Venda não encontrada' },
        { status: 404 }
      );
    }

    const venda = vendaQuery.rows[0];

    if (venda.status !== 'concluida') {
      return NextResponse.json(
        { success: false, error: 'Apenas vendas concluídas podem ser canceladas' },
        { status: 400 }
      );
    }

    // Verificar se venda foi feita nas últimas 24 horas
    const dataVenda = new Date(venda.dataVenda);
    const agora = new Date();
    const diffHoras = (agora.getTime() - dataVenda.getTime()) / (1000 * 60 * 60);

    if (diffHoras > 24) {
      return NextResponse.json(
        { success: false, error: 'Vendas só podem ser canceladas dentro de 24 horas após a conclusão' },
        { status: 400 }
      );
    }

    console.log('🔄 Cancelando venda:', venda_id);

    // Cancelar em transação
    await transaction(async (client) => {
      // Atualizar status da venda
      await client.query(`
        UPDATE vendas_caixa
        SET 
          status = 'cancelada',
          "motivoCancelamento" = $1::text,
          "dataCancelamento" = CURRENT_TIMESTAMP,
          "canceladoPor" = $4::uuid
        WHERE id = $2::uuid
          AND "companyId" = $3::uuid
      `, [motivo.trim(), venda_id, company_id, usuario_id]);

      console.log('✅ Venda cancelada com sucesso');
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Venda cancelada com sucesso',
        vendaId: venda_id
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao cancelar venda:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}
