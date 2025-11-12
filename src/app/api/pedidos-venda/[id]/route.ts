import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/pedidos-venda/[id]
 * 
 * Busca um pedido de venda completo com todos os relacionamentos
 */
export async function GET(
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
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

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

    const { id } = await params;

    // Buscar pedido de venda com relacionamentos
    const pedidoQuery = await query(`
      SELECT 
        pv.*,
        CASE WHEN comp.id IS NOT NULL THEN
          json_build_object(
            'id', comp.id,
            'name', comp.name,
            'cnpj', comp.cnpj,
            'address', COALESCE(comp.address::json, '{}'::json),
            'phones', COALESCE(comp.phones::json, '[]'::json),
            'emails', COALESCE(comp.emails::json, '[]'::json)
          )
        ELSE NULL END as company,
        CASE WHEN c.id IS NOT NULL THEN
          json_build_object(
            'id', c.id,
            'nomeRazaoSocial', c."nomeRazaoSocial",
            'nomeFantasia', c."nomeFantasia",
            'cpf', c.cpf,
            'cnpj', c.cnpj,
            'email', c.email,
            'enderecos', COALESCE(c.enderecos::json, '[]'::json)
          )
        ELSE NULL END as cliente,
        CASE WHEN v.id IS NOT NULL THEN
          json_build_object(
            'id', v.id,
            'nomeRazaoSocial', v."nomeRazaoSocial",
            'nomeFantasia', v."nomeFantasia"
          )
        ELSE NULL END as vendedor,
        CASE WHEN t.id IS NOT NULL THEN
          json_build_object(
            'id', t.id,
            'nomeRazaoSocial', t."nomeRazaoSocial",
            'nomeFantasia', t."nomeFantasia"
          )
        ELSE NULL END as transportadora,
        CASE WHEN fp.id IS NOT NULL THEN
          json_build_object(
            'id', fp.id,
            'nome', fp.nome
          )
        ELSE NULL END as "formaPagamento",
        CASE WHEN pp.id IS NOT NULL THEN
          json_build_object(
            'id', pp.id,
            'nome', pp.nome
          )
        ELSE NULL END as "prazoPagamento",
        (
          SELECT json_agg(
            json_build_object(
              'id', pvi.id,
              'pedidoVendaId', pvi."pedidoVendaId",
              'produtoId', pvi."produtoId",
              'companyId', pvi."companyId",
              'naturezaOperacaoId', pvi."naturezaOperacaoId",
              'codigo', pvi.codigo,
              'nome', pvi.nome,
              'unidade', pvi.unidade,
              'ncm', pvi.ncm,
              'cest', pvi.cest,
              'quantidade', pvi.quantidade,
              'precoUnitario', pvi."precoUnitario",
              'descontoValor', pvi."descontoValor",
              'descontoPercentual', pvi."descontoPercentual",
              'freteRateado', pvi."freteRateado",
              'seguroRateado', pvi."seguroRateado",
              'outrasDespesasRateado', pvi."outrasDespesasRateado",
              'icmsBase', pvi."icmsBase",
              'icmsAliquota', pvi."icmsAliquota",
              'icmsValor', pvi."icmsValor",
              'icmsStBase', pvi."icmsStBase",
              'icmsStAliquota', pvi."icmsStAliquota",
              'icmsStValor', pvi."icmsStValor",
              'ipiAliquota', pvi."ipiAliquota",
              'ipiValor', pvi."ipiValor",
              'pisAliquota', pvi."pisAliquota",
              'pisValor', pvi."pisValor",
              'cofinsAliquota', pvi."cofinsAliquota",
              'cofinsValor', pvi."cofinsValor",
              'totalItem', pvi."totalItem",
              'numeroItem', pvi."numeroItem",
              'observacoes', pvi.observacoes
            ) ORDER BY pvi."numeroItem" ASC NULLS LAST, pvi."createdAt" ASC
          )
          FROM pedidos_venda_itens pvi
          WHERE pvi."pedidoVendaId" = pv.id
        ) as itens
      FROM pedidos_venda pv
      LEFT JOIN companies comp ON pv."companyId" = comp.id
      LEFT JOIN cadastros c ON pv."clienteId" = c.id
      LEFT JOIN cadastros v ON pv."vendedorId" = v.id
      LEFT JOIN cadastros t ON pv."transportadoraId" = t.id
      LEFT JOIN formas_pagamento fp ON pv."formaPagamentoId" = fp.id
      LEFT JOIN prazos_pagamento pp ON pv."prazoPagamentoId" = pp.id
      WHERE pv.id = $1::uuid
        AND pv."companyId" = $2::uuid
    `, [id, company_id]);

    if (pedidoQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pedido de venda não encontrado' },
        { status: 404 }
      );
    }

    const pedido = pedidoQuery.rows[0];

    return NextResponse.json({
      success: true,
      data: pedido
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar pedido de venda:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

