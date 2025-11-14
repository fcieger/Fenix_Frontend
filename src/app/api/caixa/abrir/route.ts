import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * POST /api/caixa/abrir
 * 
 * Abre um novo caixa
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
    const { company_id, usuario_id, descricao, valorAbertura, observacoes } = body;
    
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

    if (!descricao) {
      return NextResponse.json(
        { success: false, error: 'descricao é obrigatória' },
        { status: 400 }
      );
    }

    if (valorAbertura === undefined || valorAbertura === null) {
      return NextResponse.json(
        { success: false, error: 'valorAbertura é obrigatório' },
        { status: 400 }
      );
    }

    const valorAberturaNum = parseFloat(valorAbertura);
    if (isNaN(valorAberturaNum) || valorAberturaNum < 0) {
      return NextResponse.json(
        { success: false, error: 'valorAbertura deve ser um número >= 0' },
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

    // Verificar se já existe caixa aberto para este usuário e empresa
    const caixaAbertoQuery = await query(`
      SELECT id
      FROM caixas
      WHERE "companyId" = $1::uuid
        AND "usuarioId" = $2::uuid
        AND status = 'aberto'
      LIMIT 1
    `, [company_id, usuario_id]);

    if (caixaAbertoQuery.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Já existe um caixa aberto para este usuário. Feche o caixa atual antes de abrir outro.'
        },
        { status: 400 }
      );
    }

    // Criar novo caixa
    const novoCaixaQuery = await query(`
      INSERT INTO caixas (
        "companyId",
        "usuarioId",
        descricao,
        "valorAbertura",
        observacoes,
        status,
        "dataAbertura"
      )
      VALUES ($1::uuid, $2::uuid, $3::text, $4::numeric, $5::text, 'aberto', CURRENT_TIMESTAMP)
      RETURNING 
        id,
        descricao,
        "valorAbertura",
        "dataAbertura",
        status,
        observacoes,
        "createdAt"
    `, [company_id, usuario_id, descricao, valorAberturaNum, observacoes || null]);

    const novoCaixa = novoCaixaQuery.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        id: novoCaixa.id,
        descricao: novoCaixa.descricao,
        valorAbertura: parseFloat(novoCaixa.valorAbertura || 0),
        dataAbertura: novoCaixa.dataAbertura,
        status: novoCaixa.status,
        observacoes: novoCaixa.observacoes,
        createdAt: novoCaixa.createdAt
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao abrir caixa:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}






