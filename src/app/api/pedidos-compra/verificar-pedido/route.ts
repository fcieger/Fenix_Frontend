import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pedidoId = searchParams.get('id') || searchParams.get('pedidoId') || '123';

    // Buscar pedido - tentar como UUID primeiro, depois como número
    let pedidoQuery;
    try {
      // Tentar como UUID
      pedidoQuery = await query(`
        SELECT pc.*
        FROM pedidos_compra pc
        WHERE pc.id = $1::uuid
        LIMIT 1
      `, [pedidoId]);
      
      if (pedidoQuery.rows.length === 0) {
        // Tentar como número ou parte do ID
        pedidoQuery = await query(`
          SELECT pc.*
          FROM pedidos_compra pc
          WHERE pc.id::text LIKE '%' || $1 || '%' 
             OR pc.numero LIKE '%' || $1 || '%'
          ORDER BY pc."createdAt" DESC
          LIMIT 1
        `, [pedidoId]);
      }
    } catch (err) {
      // Tentar busca mais ampla
      pedidoQuery = await query(`
        SELECT pc.*
        FROM pedidos_compra pc
        WHERE pc.id::text LIKE '%' || $1 || '%' 
           OR pc.numero LIKE '%' || $1 || '%'
        ORDER BY pc."createdAt" DESC
        LIMIT 1
      `, [pedidoId]);
    }

    if (pedidoQuery.rows.length === 0) {
      // Listar últimos pedidos para referência
      const ultimosPedidos = await query(`
        SELECT id, numero, "dataEmissao", status, "createdAt"
        FROM pedidos_compra
        ORDER BY "createdAt" DESC
        LIMIT 10
      `);

      return NextResponse.json({
        success: false,
        error: `Nenhum pedido encontrado com ID ou número contendo "${pedidoId}"`,
        ultimosPedidos: ultimosPedidos.rows
      }, { status: 404 });
    }

    const pedido = pedidoQuery.rows[0];
    const pedidoIdReal = pedido.id;

    // Buscar itens
    const itensQuery = await query(`
      SELECT pci.*
      FROM pedidos_compra_itens pci
      WHERE pci."pedidoCompraId" = $1::uuid
      ORDER BY pci."numeroItem" ASC
    `, [pedidoIdReal]);

    // Buscar fornecedor se houver
    let fornecedor = null;
    if (pedido.fornecedorId) {
      try {
        const fornecedorQuery = await query(`
          SELECT id, "nomeRazaoSocial", "nomeFantasia"
          FROM cadastros
          WHERE id = $1::uuid
          LIMIT 1
        `, [pedido.fornecedorId]);
        if (fornecedorQuery.rows.length > 0) {
          fornecedor = fornecedorQuery.rows[0];
        }
      } catch (err) {
        console.error('Erro ao buscar fornecedor:', err);
      }
    }

    return NextResponse.json({
      success: true,
      pedido: {
        ...pedido,
        fornecedor
      },
      itens: itensQuery.rows,
      totalItens: itensQuery.rows.length
    });
  } catch (error: any) {
    console.error('❌ Erro ao verificar pedido:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao verificar pedido',
        stack: error.stack
      },
      { status: 500 }
    );
  }
}





