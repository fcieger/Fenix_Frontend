import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/caixa/vendas-suspensas
 * Lista vendas suspensas do caixa
 */
export async function GET(request: NextRequest) {
  try {
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

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
    const caixa_id = searchParams.get('caixa_id');
    
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

    let whereClause = 'WHERE vs."companyId" = $1::uuid';
    const params: any[] = [company_id];

    if (caixa_id) {
      whereClause += ` AND vs."caixaId" = $${params.length + 1}::uuid`;
      params.push(caixa_id);
    }

    const result = await query(`
      SELECT 
        vs.id,
        vs."caixaId",
        vs."usuarioId",
        vs.nome,
        vs.dados,
        vs."dataSuspensao",
        u.name as usuario_nome
      FROM vendas_suspensas vs
      LEFT JOIN users u ON u.id = vs."usuarioId"
      ${whereClause}
      ORDER BY vs."dataSuspensao" DESC
    `, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error: any) {
    console.error('Erro ao listar vendas suspensas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar vendas suspensas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/caixa/vendas-suspensas
 * Suspende uma venda em andamento
 */
export async function POST(request: NextRequest) {
  try {
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const body = await request.json();
    const { company_id, caixa_id, usuario_id, nome, dados } = body;
    
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

    if (!nome || nome.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório (mínimo 3 caracteres)' },
        { status: 400 }
      );
    }

    if (!dados) {
      return NextResponse.json(
        { success: false, error: 'Dados da venda são obrigatórios' },
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

    const userId = usuario_id || accessValidation.userId;

    const result = await query(`
      INSERT INTO vendas_suspensas (
        "caixaId",
        "usuarioId",
        "companyId",
        nome,
        dados,
        "dataSuspensao",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        $1::uuid,
        $2::uuid,
        $3::uuid,
        $4,
        $5::jsonb,
        NOW(),
        NOW(),
        NOW()
      )
      RETURNING id, nome, "dataSuspensao"
    `, [caixa_id, userId, company_id, nome.trim(), JSON.stringify(dados)]);

    return NextResponse.json({
      success: true,
      message: 'Venda suspensa com sucesso',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Erro ao suspender venda:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao suspender venda' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/caixa/vendas-suspensas
 * Exclui uma venda suspensa
 */
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');
    
    if (!company_id || !id) {
      return NextResponse.json(
        { success: false, error: 'company_id e id são obrigatórios' },
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

    await query(`
      DELETE FROM vendas_suspensas
      WHERE id = $1::uuid
        AND "companyId" = $2::uuid
    `, [id, company_id]);

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



