import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/natureza-operacao/[id]/configuracao-estados
 * 
 * Busca configurações de impostos por estado para uma natureza de operação
 */
export async function GET(
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

    // Buscar configurações de estados para a natureza de operação
    const configQuery = await query(`
      SELECT 
        ce.id,
        ce."naturezaOperacaoId",
        ce.uf,
        ce.habilitado,
        ce."icmsStAliquota",
        ce."icmsStCST",
        ce."icmsStMva",
        ce."ipiAliquota",
        ce."ipiCST",
        ce."ipiClasse",
        ce."ipiCodigo",
        ce."createdAt",
        ce."updatedAt"
      FROM configuracao_estado ce
      WHERE ce."naturezaOperacaoId" = $1::uuid
      ORDER BY ce.uf ASC
    `, [id]);

    const configuracoes = configQuery.rows.map((row: any) => ({
      id: row.id,
      naturezaOperacaoId: row.naturezaOperacaoId,
      uf: row.uf,
      habilitado: row.habilitado !== false, // Default true
      icmsStAliquota: row.icmsStAliquota ? Number(row.icmsStAliquota) : 0,
      icmsStCST: row.icmsStCST || '',
      icmsStMva: row.icmsStMva ? Number(row.icmsStMva) : 0,
      ipiAliquota: row.ipiAliquota ? Number(row.ipiAliquota) : 0,
      ipiCST: row.ipiCST || '',
      ipiClasse: row.ipiClasse || '',
      ipiCodigo: row.ipiCodigo || '',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));

    return NextResponse.json(configuracoes);

  } catch (error: any) {
    console.error('❌ Erro ao buscar configurações de estados:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno ao buscar configurações'
      },
      { status: 500 }
    );
  }
}







