import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/natureza-operacao/[id]
 * 
 * Busca uma natureza de operação específica por ID
 */
export async function GET(
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

    // Buscar natureza de operação
    const result = await query(`
      SELECT 
        id,
        "companyId",
        nome,
        cfop,
        COALESCE(tipo, 'vendas') as tipo,
        COALESCE("movimentaEstoque", true) as "movimentaEstoque",
        COALESCE(habilitado, true) as habilitado,
        "considerarOperacaoComoFaturamento",
        "destacarTotalImpostosIBPT",
        "gerarContasReceberPagar",
        "tipoDataContasReceberPagar",
        "informacoesAdicionaisFisco",
        "informacoesAdicionaisContribuinte",
        "createdAt",
        "updatedAt"
      FROM natureza_operacao
      WHERE id = $1::uuid
        AND "companyId" = $2::uuid
    `, [params.id, companyId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Natureza de operação não encontrada' },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    
    const natureza = {
      id: row.id,
      companyId: row.companyId,
      codigo: row.cfop || null,
      cfop: row.cfop || null,
      nome: row.nome,
      descricao: row.nome,
      tipo: row.tipo || 'vendas',
      movimentaEstoque: row.movimentaEstoque !== false,
      habilitada: row.habilitado !== false,
      habilitado: row.habilitado !== false,
      considerarOperacaoComoFaturamento: row.considerarOperacaoComoFaturamento === true,
      destacarTotalImpostosIBPT: row.destacarTotalImpostosIBPT === true,
      gerarContasReceberPagar: row.gerarContasReceberPagar === true,
      tipoDataContasReceberPagar: row.tipoDataContasReceberPagar || null,
      informacoesAdicionaisFisco: row.informacoesAdicionaisFisco || null,
      informacoesAdicionaisContribuinte: row.informacoesAdicionaisContribuinte || null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };

    return NextResponse.json(natureza);
  } catch (error: any) {
    console.error('❌ Erro ao buscar natureza de operação:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/natureza-operacao/[id]
 * 
 * Atualiza uma natureza de operação
 */
export async function PATCH(
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
    console.log('📦 PATCH body recebido:', JSON.stringify(body, null, 2));
    console.log('🔍 TIPO recebido:', {
      valor: body.tipo,
      tipo: typeof body.tipo,
      presente: 'tipo' in body,
      undefined: body.tipo === undefined
    });
    const companyId = body.companyId || body.company_id;
    
    // Validar tipo se fornecido
    const tiposValidos = ['compras', 'vendas', 'servicos', 'cupom_fiscal', 'ecommerce', 'devolucao_vendas', 'devolucao_compras', 'outras_movimentacoes'];
    if (body.tipo && !tiposValidos.includes(body.tipo)) {
      console.error('❌ Tipo inválido recebido:', body.tipo, 'Tipos válidos:', tiposValidos);
      return NextResponse.json(
        { 
          success: false, 
          error: `tipo deve ser um dos seguintes valores: ${tiposValidos.join(', ')}. Recebido: '${body.tipo}'`
        },
        { status: 400 }
      );
    }
    
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

    // Verificar se a natureza existe e pertence à empresa
    const checkResult = await query(`
      SELECT id FROM natureza_operacao
      WHERE id = $1::uuid AND "companyId" = $2::uuid
    `, [params.id, companyId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Natureza de operação não encontrada' },
        { status: 404 }
      );
    }

    // Construir query de atualização dinamicamente
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.nome !== undefined) {
      updates.push(`nome = $${paramIndex}`);
      values.push(body.nome);
      paramIndex++;
    }

    if (body.cfop !== undefined) {
      updates.push(`cfop = $${paramIndex}`);
      values.push(body.cfop);
      paramIndex++;
    }

    if (body.tipo !== undefined) {
      updates.push(`tipo = $${paramIndex}`);
      values.push(body.tipo);
      paramIndex++;
    }

    if (body.movimentaEstoque !== undefined) {
      updates.push(`"movimentaEstoque" = $${paramIndex}`);
      values.push(body.movimentaEstoque);
      paramIndex++;
    }

    if (body.habilitado !== undefined) {
      updates.push(`habilitado = $${paramIndex}`);
      values.push(body.habilitado);
      paramIndex++;
    }


    if (body.considerarOperacaoComoFaturamento !== undefined) {
      updates.push(`"considerarOperacaoComoFaturamento" = $${paramIndex}`);
      values.push(body.considerarOperacaoComoFaturamento === true || body.considerarOperacaoComoFaturamento === 'true');
      paramIndex++;
    }

    if (body.destacarTotalImpostosIBPT !== undefined) {
      updates.push(`"destacarTotalImpostosIBPT" = $${paramIndex}`);
      values.push(body.destacarTotalImpostosIBPT === true || body.destacarTotalImpostosIBPT === 'true');
      paramIndex++;
    }

    if (body.gerarContasReceberPagar !== undefined) {
      updates.push(`"gerarContasReceberPagar" = $${paramIndex}`);
      values.push(body.gerarContasReceberPagar === true || body.gerarContasReceberPagar === 'true');
      paramIndex++;
    }

    if (body.tipoDataContasReceberPagar !== undefined) {
      updates.push(`"tipoDataContasReceberPagar" = $${paramIndex}`);
      values.push(body.tipoDataContasReceberPagar);
      paramIndex++;
    }

    if (body.informacoesAdicionaisFisco !== undefined) {
      updates.push(`"informacoesAdicionaisFisco" = $${paramIndex}`);
      values.push(body.informacoesAdicionaisFisco || null);
      paramIndex++;
    }

    if (body.informacoesAdicionaisContribuinte !== undefined) {
      updates.push(`"informacoesAdicionaisContribuinte" = $${paramIndex}`);
      values.push(body.informacoesAdicionaisContribuinte || null);
      paramIndex++;
    }

    updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);

    // IDs da natureza e empresa
    values.push(params.id);
    values.push(companyId);

    const updateQuery = `
      UPDATE natureza_operacao
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}::uuid
        AND "companyId" = $${paramIndex + 1}::uuid
      RETURNING *
    `;

    console.log('📝 Query de atualização:', updateQuery);
    console.log('📝 Valores:', values);
    console.log('📝 Updates array:', updates);
    
    const result = await query(updateQuery, values);

    const row = result.rows[0];
    
    const natureza = {
      id: row.id,
      companyId: row.companyId,
      codigo: row.cfop || null,
      cfop: row.cfop || null,
      nome: row.nome,
      descricao: row.nome,
      tipo: row.tipo || 'vendas',
      movimentaEstoque: row.movimentaEstoque !== false,
      habilitada: row.habilitado !== false,
      habilitado: row.habilitado !== false,
      considerarOperacaoComoFaturamento: row.considerarOperacaoComoFaturamento === true,
      destacarTotalImpostosIBPT: row.destacarTotalImpostosIBPT === true,
      gerarContasReceberPagar: row.gerarContasReceberPagar === true,
      tipoDataContasReceberPagar: row.tipoDataContasReceberPagar || null,
      informacoesAdicionaisFisco: row.informacoesAdicionaisFisco || null,
      informacoesAdicionaisContribuinte: row.informacoesAdicionaisContribuinte || null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };

    return NextResponse.json(natureza);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar natureza de operação:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/natureza-operacao/[id]
 * 
 * Remove uma natureza de operação
 */
export async function DELETE(
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

    // Verificar se a natureza existe e pertence à empresa
    const checkResult = await query(`
      SELECT id FROM natureza_operacao
      WHERE id = $1::uuid AND "companyId" = $2::uuid
    `, [params.id, companyId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Natureza de operação não encontrada' },
        { status: 404 }
      );
    }

    // Deletar natureza
    await query(`
      DELETE FROM natureza_operacao
      WHERE id = $1::uuid AND "companyId" = $2::uuid
    `, [params.id, companyId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Erro ao deletar natureza de operação:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

