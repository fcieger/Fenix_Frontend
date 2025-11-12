import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * PUT /api/licitacoes/alertas/[id]
 * 
 * Atualiza um alerta existente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    const { id } = await params;

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
    
    // Buscar alerta para validar companyId
    const alertaExistente = await query(`
      SELECT "companyId" FROM alertas_licitacoes WHERE id = $1
    `, [id]);

    if (alertaExistente.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Alerta não encontrado' },
        { status: 404 }
      );
    }

    const companyId = alertaExistente.rows[0].companyId;

    // Validar acesso
    const acesso = await validateUserAccess(token, companyId);
    if (!acesso.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: acesso.error || 'Acesso negado'
        },
        { status: acesso.error?.includes('Token') ? 401 : 403 }
      );
    }

    // Atualizar alerta
    const result = await query(`
      UPDATE alertas_licitacoes SET
        nome = COALESCE($1, nome),
        ativo = COALESCE($2, ativo),
        estados = COALESCE($3, estados),
        municipios = COALESCE($4, municipios),
        modalidades = COALESCE($5, modalidades),
        "valorMinimo" = COALESCE($6, "valorMinimo"),
        "valorMaximo" = COALESCE($7, "valorMaximo"),
        cnae = COALESCE($8, cnae),
        "palavrasChave" = COALESCE($9, "palavrasChave"),
        "apenasAbertas" = COALESCE($10, "apenasAbertas"),
        "diasAntesEncerramento" = COALESCE($11, "diasAntesEncerramento"),
        "notificarEmail" = COALESCE($12, "notificarEmail"),
        "notificarPush" = COALESCE($13, "notificarPush"),
        frequencia = COALESCE($14, frequencia),
        "horarioNotificacao" = COALESCE($15, "horarioNotificacao"),
        "updatedAt" = NOW()
      WHERE id = $16
      RETURNING *
    `, [
      body.nome || null,
      body.ativo !== undefined ? body.ativo : null,
      body.estados || null,
      body.municipios || null,
      body.modalidades || null,
      body.valorMinimo !== undefined ? body.valorMinimo : null,
      body.valorMaximo !== undefined ? body.valorMaximo : null,
      body.cnae || null,
      body.palavrasChave || null,
      body.apenasAbertas !== undefined ? body.apenasAbertas : null,
      body.diasAntesEncerramento !== undefined ? body.diasAntesEncerramento : null,
      body.notificarEmail !== undefined ? body.notificarEmail : null,
      body.notificarPush !== undefined ? body.notificarPush : null,
      body.frequencia || null,
      body.horarioNotificacao || null,
      id,
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('❌ Erro ao atualizar alerta:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao atualizar alerta'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/licitacoes/alertas/[id]
 * 
 * Exclui um alerta
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    const { id } = await params;

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
    
    // Buscar alerta para validar companyId
    const alertaExistente = await query(`
      SELECT "companyId" FROM alertas_licitacoes WHERE id = $1
    `, [id]);

    if (alertaExistente.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Alerta não encontrado' },
        { status: 404 }
      );
    }

    const companyId = alertaExistente.rows[0].companyId;

    // Validar acesso
    const acesso = await validateUserAccess(token, companyId);
    if (!acesso.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: acesso.error || 'Acesso negado'
        },
        { status: acesso.error?.includes('Token') ? 401 : 403 }
      );
    }

    // Excluir alerta
    await query(`
      DELETE FROM alertas_licitacoes WHERE id = $1
    `, [id]);

    return NextResponse.json({
      success: true,
      message: 'Alerta excluído com sucesso',
    });
  } catch (error: any) {
    console.error('❌ Erro ao excluir alerta:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao excluir alerta'
      },
      { status: 500 }
    );
  }
}

