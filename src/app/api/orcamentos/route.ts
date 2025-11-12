import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/orcamentos
 * 
 * Lista todos os orçamentos da empresa
 */
export async function GET(request: NextRequest) {
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
    const company_id = searchParams.get('companyId') || searchParams.get('company_id');
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
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

    // Verificar se as tabelas existem, se não existirem, criar
    try {
      await query(`
        SELECT 1 FROM orcamentos LIMIT 1
      `);
    } catch (e: any) {
      // Se a tabela não existir, criar usando o schema completo
      console.warn('⚠️ Tabela orcamentos não encontrada, criando...');
      // As tabelas devem ser criadas via schema completo
      // Por enquanto, apenas retornar array vazio
      return NextResponse.json([]);
    }

    // Buscar orçamentos
    let orcamentosQuery;
    try {
      orcamentosQuery = await query(`
        SELECT 
          o.*,
          c.id as cliente_id,
          c."nomeRazaoSocial" as cliente_nome_razao,
          c."nomeFantasia" as cliente_nome_fantasia,
          v.id as vendedor_id,
          v."nomeRazaoSocial" as vendedor_nome_razao,
          v."nomeFantasia" as vendedor_nome_fantasia
        FROM orcamentos o
        LEFT JOIN cadastros c ON o."clienteId" = c.id
        LEFT JOIN cadastros v ON o."vendedorId" = v.id
        WHERE o."companyId" = $1::uuid
        ORDER BY o."dataEmissao" DESC, o."createdAt" DESC
      `, [company_id]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar orçamentos:', sqlError);
      // Se a tabela não existir, retornar array vazio
      if (sqlError.message && sqlError.message.includes('does not exist')) {
        console.warn('⚠️ Tabela orcamentos não existe ainda');
        return NextResponse.json([]);
      }
      throw sqlError;
    }

    // Buscar itens de cada orçamento
    const orcamentosComItens = await Promise.all(
      orcamentosQuery.rows.map(async (orcamento: any) => {
        let itensQuery;
        try {
          itensQuery = await query(`
            SELECT *
            FROM orcamento_itens
            WHERE "orcamentoId" = $1::uuid
            ORDER BY COALESCE("numeroItem", 999) ASC, "createdAt" ASC
          `, [orcamento.id]);
        } catch (sqlError: any) {
          console.error('❌ Erro SQL ao buscar itens do orçamento:', sqlError);
          // Se a tabela não existir, retornar array vazio de itens
          itensQuery = { rows: [] };
        }

        return {
          id: orcamento.id,
          numero: orcamento.numero,
          serie: orcamento.serie,
          dataEmissao: orcamento.dataEmissao,
          dataPrevisaoEntrega: orcamento.dataPrevisaoEntrega,
          clienteId: orcamento.clienteId,
          cliente: orcamento.cliente_id ? {
            id: orcamento.cliente_id,
            nomeRazaoSocial: orcamento.cliente_nome_razao,
            nomeFantasia: orcamento.cliente_nome_fantasia
          } : null,
          vendedorId: orcamento.vendedorId,
          vendedor: orcamento.vendedor_id ? {
            id: orcamento.vendedor_id,
            nomeRazaoSocial: orcamento.vendedor_nome_razao,
            nomeFantasia: orcamento.vendedor_nome_fantasia
          } : null,
          totalProdutos: parseFloat(orcamento.totalProdutos || 0),
          totalDescontos: parseFloat(orcamento.totalDescontos || 0),
          totalImpostos: parseFloat(orcamento.totalImpostos || 0),
          totalGeral: parseFloat(orcamento.totalGeral || 0),
          status: orcamento.status || 'pendente',
          observacoes: orcamento.observacoes,
          itens: (itensQuery.rows || []).map((item: any) => ({
            id: item.id,
            produtoId: item.produtoId,
            codigo: item.codigo,
            nome: item.nome,
            unidade: item.unidade,
            quantidade: parseFloat(item.quantidade || 0),
            precoUnitario: parseFloat(item.precoUnitario || 0),
            descontoValor: parseFloat(item.descontoValor || 0),
            descontoPercentual: parseFloat(item.descontoPercentual || 0),
            totalItem: parseFloat(item.totalItem || 0),
            numeroItem: item.numeroItem
          }))
        };
      })
    );

    return NextResponse.json(orcamentosComItens);
  } catch (error: any) {
    console.error('❌ Erro ao listar orçamentos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

