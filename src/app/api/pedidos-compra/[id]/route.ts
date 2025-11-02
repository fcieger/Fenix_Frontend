import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/pedidos-compra/[id]
 * 
 * Retorna um pedido de compra específico com relacionamentos
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
    let company_id = searchParams.get('company_id');
    const id = params?.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do pedido é obrigatório' },
        { status: 400 }
      );
    }

    // Se não houver company_id nos params, buscar do pedido primeiro
    if (!company_id) {
      try {
        const pedidoCheckQuery = await query(`
          SELECT "companyId" FROM pedidos_compra WHERE id = $1::uuid LIMIT 1
        `, [id]);
        
        if (pedidoCheckQuery.rows.length > 0) {
          company_id = pedidoCheckQuery.rows[0].companyId;
        }
      } catch (err) {
        console.error('[API Pedidos Compra] Erro ao buscar companyId do pedido:', err);
      }
    }

    // Se ainda não houver company_id, retornar erro
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório. Passe como query parameter: ?company_id=...' },
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

    // Buscar pedido de compra com relacionamentos
    const pedidoQuery = await query(`
      SELECT 
        pc.*,
        CASE WHEN f.id IS NOT NULL THEN
          json_build_object(
            'id', f.id,
            'nomeRazaoSocial', f."nomeRazaoSocial",
            'nomeFantasia', f."nomeFantasia",
            'cpf', f.cpf,
            'cnpj', f.cnpj,
            'email', f.email
          )
        ELSE NULL END as fornecedor,
        json_build_object(
          'id', c.id,
          'nomeRazaoSocial', c."nomeRazaoSocial",
          'nomeFantasia', c."nomeFantasia"
        ) as comprador,
        json_build_object(
          'id', t.id,
          'nomeRazaoSocial', t."nomeRazaoSocial",
          'nomeFantasia', t."nomeFantasia"
        ) as transportadora,
        (
          SELECT json_agg(
            json_build_object(
              'id', pci.id,
              'pedidoCompraId', pci."pedidoCompraId",
              'produtoId', pci."produtoId",
              'codigo', pci.codigo,
              'nome', pci.nome,
              'unidade', pci.unidade,
              'ncm', pci.ncm,
              'cest', pci.cest,
              'naturezaOperacaoId', pci."naturezaOperacaoId",
              'quantidade', pci.quantidade,
              'precoUnitario', pci."precoUnitario",
              'descontoValor', pci."descontoValor",
              'descontoPercentual', pci."descontoPercentual",
              'freteRateado', pci."freteRateado",
              'seguroRateado', pci."seguroRateado",
              'outrasDespesasRateado', pci."outrasDespesasRateado",
              'icmsBase', pci."icmsBase",
              'icmsAliquota', pci."icmsAliquota",
              'icmsValor', pci."icmsValor",
              'icmsStBase', pci."icmsStBase",
              'icmsStAliquota', pci."icmsStAliquota",
              'icmsStValor', pci."icmsStValor",
              'ipiAliquota', pci."ipiAliquota",
              'ipiValor', pci."ipiValor",
              'pisAliquota', pci."pisAliquota",
              'pisValor', pci."pisValor",
              'cofinsAliquota', pci."cofinsAliquota",
              'cofinsValor', pci."cofinsValor",
              'totalItem', pci."totalItem",
              'numeroItem', pci."numeroItem",
              'observacoes', pci.observacoes
            ) ORDER BY pci."numeroItem" ASC
          )
          FROM pedidos_compra_itens pci
          WHERE pci."pedidoCompraId" = pc.id
        ) as itens
      FROM pedidos_compra pc
      LEFT JOIN cadastros f ON pc."fornecedorId" = f.id
      LEFT JOIN cadastros c ON pc."compradorId" = c.id
      LEFT JOIN cadastros t ON pc."transportadoraId" = t.id
      WHERE pc.id = $1::uuid
        AND pc."companyId" = $2::uuid
    `, [id, company_id]);

    if (pedidoQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pedido de compra não encontrado' },
        { status: 404 }
      );
    }

    const pedido = {
      ...pedidoQuery.rows[0],
      fornecedor: pedidoQuery.rows[0].fornecedor || null,
      comprador: pedidoQuery.rows[0].comprador || null,
      transportadora: pedidoQuery.rows[0].transportadora || null,
      itens: pedidoQuery.rows[0].itens || []
    };

    return NextResponse.json({
      success: true,
      data: pedido
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar pedido de compra:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pedidos-compra/[id]
 * 
 * Atualiza um pedido de compra
 */
export async function PUT(
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
    const { companyId, itens: itensPayload, ...pedidoData } = body;
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do pedido é obrigatório' },
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

    // Atualizar pedido de compra
    await query(`
      UPDATE pedidos_compra SET
        numero = COALESCE($2, numero),
        serie = COALESCE($3, serie),
        "numeroOrdemCompra" = COALESCE($4, "numeroOrdemCompra"),
        "dataEmissao" = COALESCE($5::date, "dataEmissao"),
        "dataPrevisaoEntrega" = COALESCE($6::date, "dataPrevisaoEntrega"),
        "dataEntrega" = COALESCE($7::date, "dataEntrega"),
        "fornecedorId" = COALESCE($8::uuid, "fornecedorId"),
        "compradorId" = COALESCE($9::uuid, "compradorId"),
        "transportadoraId" = COALESCE($10::uuid, "transportadoraId"),
        "prazoPagamentoId" = COALESCE($11::uuid, "prazoPagamentoId"),
        "naturezaOperacaoPadraoId" = COALESCE($12::uuid, "naturezaOperacaoPadraoId"),
        "formaPagamentoId" = COALESCE($13::uuid, "formaPagamentoId"),
        "localEstoqueId" = COALESCE($14::uuid, "localEstoqueId"),
        parcelamento = COALESCE($15, parcelamento),
        "consumidorFinal" = COALESCE($16, "consumidorFinal"),
        "indicadorPresenca" = COALESCE($17, "indicadorPresenca"),
        "listaPreco" = COALESCE($18, "listaPreco"),
        frete = COALESCE($19, frete),
        "valorFrete" = COALESCE($20, "valorFrete"),
        despesas = COALESCE($21, despesas),
        "incluirFreteTotal" = COALESCE($22, "incluirFreteTotal"),
        "placaVeiculo" = COALESCE($23, "placaVeiculo"),
        "ufPlaca" = COALESCE($24, "ufPlaca"),
        rntc = COALESCE($25, rntc),
        "pesoLiquido" = COALESCE($26, "pesoLiquido"),
        "pesoBruto" = COALESCE($27, "pesoBruto"),
        volume = COALESCE($28, volume),
        especie = COALESCE($29, especie),
        marca = COALESCE($30, marca),
        numeracao = COALESCE($31, numeracao),
        "quantidadeVolumes" = COALESCE($32, "quantidadeVolumes"),
        "totalProdutos" = COALESCE($33, "totalProdutos"),
        "totalDescontos" = COALESCE($34, "totalDescontos"),
        "totalImpostos" = COALESCE($35, "totalImpostos"),
        "totalGeral" = COALESCE($36, "totalGeral"),
        observacoes = COALESCE($37, observacoes),
        status = COALESCE($38, status),
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $1::uuid
        AND "companyId" = $39::uuid
    `, [
      id,
      pedidoData.numero,
      pedidoData.serie,
      pedidoData.numeroOrdemCompra,
      pedidoData.dataEmissao,
      pedidoData.dataPrevisaoEntrega,
      pedidoData.dataEntrega,
      pedidoData.fornecedorId,
      pedidoData.compradorId,
      pedidoData.transportadoraId,
      pedidoData.prazoPagamentoId,
      pedidoData.naturezaOperacaoPadraoId,
      pedidoData.formaPagamentoId,
      pedidoData.localEstoqueId,
      pedidoData.parcelamento,
      pedidoData.consumidorFinal,
      pedidoData.indicadorPresenca,
      pedidoData.listaPreco,
      pedidoData.frete,
      pedidoData.valorFrete,
      pedidoData.despesas,
      pedidoData.incluirFreteTotal,
      pedidoData.placaVeiculo,
      pedidoData.ufPlaca,
      pedidoData.rntc,
      pedidoData.pesoLiquido,
      pedidoData.pesoBruto,
      pedidoData.volume,
      pedidoData.especie,
      pedidoData.marca,
      pedidoData.numeracao,
      pedidoData.quantidadeVolumes,
      pedidoData.totalProdutos,
      pedidoData.totalDescontos,
      pedidoData.totalImpostos,
      pedidoData.totalGeral,
      pedidoData.observacoes,
      pedidoData.status,
      companyId
    ]);

    // Atualizar itens se fornecidos
    if (itensPayload && Array.isArray(itensPayload)) {
      // Deletar itens existentes
      await query(`
        DELETE FROM pedidos_compra_itens
        WHERE "pedidoCompraId" = $1::uuid
      `, [id]);

      // Inserir novos itens
      for (let i = 0; i < itensPayload.length; i++) {
        const item = itensPayload[i];
        await query(`
          INSERT INTO pedidos_compra_itens (
            "pedidoCompraId",
            "companyId",
            "produtoId",
            codigo,
            nome,
            unidade,
            ncm,
            cest,
            "naturezaOperacaoId",
            quantidade,
            "precoUnitario",
            "descontoValor",
            "descontoPercentual",
            "freteRateado",
            "seguroRateado",
            "outrasDespesasRateado",
            "icmsBase",
            "icmsAliquota",
            "icmsValor",
            "icmsStBase",
            "icmsStAliquota",
            "icmsStValor",
            "ipiAliquota",
            "ipiValor",
            "pisAliquota",
            "pisValor",
            "cofinsAliquota",
            "cofinsValor",
            "totalItem",
            "numeroItem",
            observacoes
          ) VALUES (
            $1::uuid, $2::uuid, $3::uuid,
            $4, $5, $6, $7, $8, $9::uuid,
            $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
            $29, $30, $31
          )
        `, [
          id,
          companyId,
          item.produtoId || null,
          item.codigo || '',
          item.nome || '',
          item.unidade || 'UN',
          item.ncm || null,
          item.cest || null,
          item.naturezaOperacaoId || null,
          item.quantidade || 0,
          item.precoUnitario || 0,
          item.descontoValor || 0,
          item.descontoPercentual || 0,
          item.freteRateado || 0,
          item.seguroRateado || 0,
          item.outrasDespesasRateado || 0,
          item.icmsBase || null,
          item.icmsAliquota || null,
          item.icmsValor || null,
          item.icmsStBase || null,
          item.icmsStAliquota || null,
          item.icmsStValor || null,
          item.ipiAliquota || null,
          item.ipiValor || null,
          item.pisAliquota || null,
          item.pisValor || null,
          item.cofinsAliquota || null,
          item.cofinsValor || null,
          item.totalItem || 0,
          item.numeroItem || (i + 1),
          item.observacoes || null
        ]);
      }
    }

    // Buscar pedido atualizado de forma mais robusta (similar ao GET)
    const pedidoBaseQuery = await query(`
      SELECT pc.*
      FROM pedidos_compra pc
      WHERE pc.id = $1::uuid
        AND pc."companyId" = $2::uuid
    `, [id, companyId]);

    if (pedidoBaseQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pedido de compra não encontrado' },
        { status: 404 }
      );
    }

    const pc = pedidoBaseQuery.rows[0];

    // Buscar fornecedor
    let fornecedor = null;
    if (pc.fornecedorId) {
      try {
        const fornecedorQuery = await query(`
          SELECT id, "nomeRazaoSocial", "nomeFantasia", cpf, cnpj, email
          FROM cadastros
          WHERE id = $1::uuid
          LIMIT 1
        `, [pc.fornecedorId]);
        if (fornecedorQuery.rows.length > 0) {
          const f = fornecedorQuery.rows[0];
          fornecedor = {
            id: f.id,
            nomeRazaoSocial: f.nomeRazaoSocial,
            nomeFantasia: f.nomeFantasia,
            cpf: f.cpf,
            cnpj: f.cnpj,
            email: f.email
          };
        }
      } catch (err) {
        console.error('[API Pedidos Compra] Erro ao buscar fornecedor:', err);
      }
    }

    // Buscar comprador
    let comprador = null;
    if (pc.compradorId) {
      try {
        const compradorQuery = await query(`
          SELECT id, "nomeRazaoSocial", "nomeFantasia"
          FROM cadastros
          WHERE id = $1::uuid
          LIMIT 1
        `, [pc.compradorId]);
        if (compradorQuery.rows.length > 0) {
          const c = compradorQuery.rows[0];
          comprador = {
            id: c.id,
            nomeRazaoSocial: c.nomeRazaoSocial,
            nomeFantasia: c.nomeFantasia
          };
        }
      } catch (err) {
        console.error('[API Pedidos Compra] Erro ao buscar comprador:', err);
      }
    }

    // Buscar itens atualizados
    const itensQuery = await query(`
      SELECT 
        id,
        "produtoId",
        codigo,
        nome,
        unidade,
        quantidade,
        "precoUnitario",
        "totalItem",
        "numeroItem"
      FROM pedidos_compra_itens
      WHERE "pedidoCompraId" = $1::uuid
      ORDER BY "numeroItem" ASC
    `, [id]);

    const itensAtualizados = itensQuery.rows.map((pci: any) => ({
      id: pci.id,
      produtoId: pci.produtoId,
      codigo: pci.codigo,
      nome: pci.nome,
      unidade: pci.unidade,
      quantidade: pci.quantidade,
      precoUnitario: pci.precoUnitario,
      totalItem: pci.totalItem,
      numeroItem: pci.numeroItem
    }));

    const pedidoAtualizado = {
      ...pc,
      fornecedor,
      comprador,
      itens: itensAtualizados
    };

    return NextResponse.json({
      success: true,
      data: pedidoAtualizado
    });
  } catch (error: any) {
    console.error('❌ Erro ao atualizar pedido de compra:', error);
    console.error('❌ Mensagem:', error.message);
    console.error('❌ Código:', error.code);
    console.error('❌ Detalhe:', error.detail);
    console.error('❌ Stack:', error.stack);
    
    // Retornar mensagem de erro mais detalhada
    let errorMessage = 'Erro interno do servidor ao atualizar pedido de compra';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    if (error.detail) {
      errorMessage += `: ${error.detail}`;
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.detail || error.message
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pedidos-compra/[id]
 * 
 * Deleta um pedido de compra
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
    const company_id = searchParams.get('company_id');
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do pedido é obrigatório' },
        { status: 400 }
      );
    }

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

    // Deletar pedido (itens serão deletados automaticamente por CASCADE)
    await query(`
      DELETE FROM pedidos_compra
      WHERE id = $1::uuid
        AND "companyId" = $2::uuid
    `, [id, company_id]);

    return NextResponse.json({
      success: true,
      message: 'Pedido de compra deletado com sucesso'
    });
  } catch (error: any) {
    console.error('❌ Erro ao deletar pedido de compra:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

