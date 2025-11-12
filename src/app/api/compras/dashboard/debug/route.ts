import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/compras/dashboard/debug
 * 
 * Rota de diagnóstico para verificar pedidos específicos no banco
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
    const company_id = searchParams.get('company_id');
    const numeroPedido = searchParams.get('numero') || '123';
    
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

    // Buscar TODOS os pedidos da empresa para diagnóstico
    const todosPedidosQuery = await query(`
      SELECT 
        id,
        numero,
        serie,
        "dataEmissao",
        status,
        "totalGeral",
        "totalProdutos",
        "totalDescontos",
        "totalImpostos",
        "companyId",
        "fornecedorId",
        "createdAt",
        "updatedAt"
      FROM pedidos_compra
      WHERE "companyId" = $1::uuid
      ORDER BY "dataEmissao" DESC, "createdAt" DESC
      LIMIT 50
    `, [company_id]);

    // Buscar especificamente o pedido 123 (exato e similar)
    const pedido123ExatoQuery = await query(`
      SELECT 
        id,
        numero,
        serie,
        "dataEmissao",
        status,
        "totalGeral",
        "totalProdutos",
        "totalDescontos",
        "totalImpostos",
        "companyId",
        "fornecedorId",
        "compradorId",
        observacoes,
        "createdAt",
        "updatedAt"
      FROM pedidos_compra
      WHERE "companyId" = $1::uuid
        AND (numero = $2 OR numero LIKE '%' || $2 || '%')
      ORDER BY 
        CASE WHEN numero = $2 THEN 0 ELSE 1 END,
        "createdAt" DESC
    `, [company_id, numeroPedido]);

    // Buscar pedidos que contenham "123" no número
    const pedidosCom123Query = await query(`
      SELECT 
        id,
        numero,
        serie,
        "dataEmissao",
        status,
        "totalGeral",
        "companyId",
        "createdAt"
      FROM pedidos_compra
      WHERE "companyId" = $1::uuid
        AND (numero LIKE '%123%' OR numero = '123')
      ORDER BY "dataEmissao" DESC
      LIMIT 10
    `, [company_id]);

    // Verificar estatísticas gerais
    const estatisticasQuery = await query(`
      SELECT 
        COUNT(*) as total_pedidos,
        COUNT(*) FILTER (WHERE status = 'rascunho') as total_rascunho,
        COUNT(*) FILTER (WHERE status = 'pendente') as total_pendente,
        COUNT(*) FILTER (WHERE status = 'entregue') as total_entregue,
        COUNT(*) FILTER (WHERE status = 'faturado') as total_faturado,
        COUNT(*) FILTER (WHERE status = 'cancelado') as total_cancelado,
        MIN("dataEmissao") as primeira_data,
        MAX("dataEmissao") as ultima_data,
        MIN("createdAt") as primeiro_criado,
        MAX("createdAt") as ultimo_criado,
        array_agg(DISTINCT numero ORDER BY numero) FILTER (WHERE numero IS NOT NULL) as numeros_disponiveis
      FROM pedidos_compra
      WHERE "companyId" = $1::uuid
    `, [company_id]);

    return NextResponse.json({
      success: true,
      data: {
        companyId: company_id,
        numeroBuscado: numeroPedido,
        estatisticas: estatisticasQuery.rows[0],
        pedido123Exato: pedido123ExatoQuery.rows,
        pedidosCom123: pedidosCom123Query.rows,
        ultimos50Pedidos: todosPedidosQuery.rows.map((p: any) => ({
          id: p.id,
          numero: p.numero,
          dataEmissao: p.dataEmissao,
          status: p.status,
          totalGeral: parseFloat(p.totalGeral || 0),
          companyId: p.companyId
        })),
        diagnosticos: {
          pedido123Encontrado: pedido123ExatoQuery.rows.length > 0,
          pedido123Exato: pedido123ExatoQuery.rows[0] || null,
          todosPedidos123: pedido123ExatoQuery.rows,
          totalPedidosEmpresa: estatisticasQuery.rows[0]?.total_pedidos || 0,
          primeiroPedidoData: estatisticasQuery.rows[0]?.primeira_data,
          ultimoPedidoData: estatisticasQuery.rows[0]?.ultima_data,
          numerosDisponiveis: estatisticasQuery.rows[0]?.numeros_disponiveis?.slice(0, 20) || [],
          statusDistribuicao: {
            rascunho: estatisticasQuery.rows[0]?.total_rascunho || 0,
            pendente: estatisticasQuery.rows[0]?.total_pendente || 0,
            entregue: estatisticasQuery.rows[0]?.total_entregue || 0,
            faturado: estatisticasQuery.rows[0]?.total_faturado || 0,
            cancelado: estatisticasQuery.rows[0]?.total_cancelado || 0
          },
          mensagem: pedido123ExatoQuery.rows.length > 0 
            ? `Pedido ${numeroPedido} encontrado! Status: ${pedido123ExatoQuery.rows[0].status}, Data: ${pedido123ExatoQuery.rows[0].dataEmissao}`
            : `Pedido ${numeroPedido} NÃO encontrado para company_id: ${company_id}`
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao diagnosticar pedidos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        stack: error.stack
      },
      { status: 500 }
    );
  }
}

