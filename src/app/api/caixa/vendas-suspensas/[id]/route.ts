import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query } from '@/lib/database';

/**
 * GET /api/caixa/vendas-suspensas/[id]
 * Recupera uma venda suspensa específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    const vendaSuspensaId = params.id;
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    const accessValidation = await validateUserAccess(token, company_id);
    if (!accessValidation.valid) {
      return NextResponse.json(
        { success: false, error: accessValidation.error },
        { status: 401 }
      );
    }

    const result = await query(`
      SELECT 
        id,
        "caixaId",
        "usuarioId",
        nome,
        dados,
        "dataSuspensao"
      FROM vendas_suspensas
      WHERE id = $1::uuid
        AND "companyId" = $2::uuid
    `, [vendaSuspensaId, company_id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Venda suspensa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Erro ao recuperar venda suspensa:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao recuperar venda suspensa' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/caixa/vendas-suspensas/[id]
 * Exclui uma venda suspensa específica
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    const vendaSuspensaId = params.id;
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    const accessValidation = await validateUserAccess(token, company_id);
    if (!accessValidation.valid) {
      return NextResponse.json(
        { success: false, error: accessValidation.error },
        { status: 401 }
      );
    }

    const result = await query(`
      DELETE FROM vendas_suspensas
      WHERE id = $1::uuid
        AND "companyId" = $2::uuid
      RETURNING id
    `, [vendaSuspensaId, company_id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Venda suspensa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Venda suspensa excluída com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao excluir venda suspensa:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao excluir venda suspensa' },
      { status: 500 }
    );
  }
}





