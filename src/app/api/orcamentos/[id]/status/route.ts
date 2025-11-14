import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * PATCH /api/orcamentos/[id]/status
 * 
 * Alterar o status de um orçamento
 */
export async function PATCH(
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
    const body = await request.json();
    const { status } = body;

    // Validar status
    if (!status || !['pendente', 'concluido'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status inválido. Use "pendente" ou "concluido"' },
        { status: 400 }
      );
    }

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

    // Atualizar status
    await query(`
      UPDATE orcamentos
      SET status = $2, "updatedAt" = NOW()
      WHERE id = $1::uuid
    `, [id, status]);

    return NextResponse.json({
      success: true,
      message: 'Status atualizado com sucesso',
      status
    });
  } catch (error: any) {
    console.error('❌ Erro ao atualizar status do orçamento:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

