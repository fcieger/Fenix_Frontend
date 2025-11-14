import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/orcamentos/[id]
 * 
 * Obter um orçamento específico pelo ID
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
    const { id } = await params;

    // Buscar o orçamento para obter o companyId
    const orcamentoResult = await query(`
      SELECT * FROM orcamentos WHERE id = $1::uuid
    `, [id]);

    if (orcamentoResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Orçamento não encontrado' },
        { status: 404 }
      );
    }

    const orcamento = orcamentoResult.rows[0];

    // Validar acesso
    const acesso = await validateUserAccess(token, orcamento.companyId);
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

    // Buscar dados completos do orçamento com relacionamentos
    const orcamentoCompletoResult = await query(`
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
      WHERE o.id = $1::uuid
    `, [id]);

    const orcamentoCompleto = orcamentoCompletoResult.rows[0];

    // Buscar itens do orçamento
    const itensResult = await query(`
      SELECT *
      FROM orcamento_itens
      WHERE "orcamentoId" = $1::uuid
      ORDER BY COALESCE("numeroItem", 999) ASC, "createdAt" ASC
    `, [id]);

    const response = {
      id: orcamentoCompleto.id,
      numero: orcamentoCompleto.numero,
      serie: orcamentoCompleto.serie,
      dataEmissao: orcamentoCompleto.dataEmissao,
      dataPrevisaoEntrega: orcamentoCompleto.dataPrevisaoEntrega,
      clienteId: orcamentoCompleto.clienteId,
      cliente: orcamentoCompleto.cliente_id ? {
        id: orcamentoCompleto.cliente_id,
        nomeRazaoSocial: orcamentoCompleto.cliente_nome_razao,
        nomeFantasia: orcamentoCompleto.cliente_nome_fantasia
      } : null,
      vendedorId: orcamentoCompleto.vendedorId,
      vendedor: orcamentoCompleto.vendedor_id ? {
        id: orcamentoCompleto.vendedor_id,
        nomeRazaoSocial: orcamentoCompleto.vendedor_nome_razao,
        nomeFantasia: orcamentoCompleto.vendedor_nome_fantasia
      } : null,
      totalProdutos: parseFloat(orcamentoCompleto.totalProdutos || 0),
      totalDescontos: parseFloat(orcamentoCompleto.totalDescontos || 0),
      totalImpostos: parseFloat(orcamentoCompleto.totalImpostos || 0),
      totalGeral: parseFloat(orcamentoCompleto.totalGeral || 0),
      status: orcamentoCompleto.status || 'pendente',
      observacoes: orcamentoCompleto.observacoes,
      companyId: orcamentoCompleto.companyId,
      itens: itensResult.rows.map((item: any) => ({
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

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Erro ao obter orçamento:', error);
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
 * PUT /api/orcamentos/[id]
 * 
 * Atualizar um orçamento existente
 */
export async function PUT(
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
    const { id } = await params;
    const body = await request.json();

    // Buscar o orçamento para validar acesso
    const orcamentoResult = await query(`
      SELECT * FROM orcamentos WHERE id = $1::uuid
    `, [id]);

    if (orcamentoResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Orçamento não encontrado' },
        { status: 404 }
      );
    }

    const orcamentoExistente = orcamentoResult.rows[0];

    // Validar acesso
    const acesso = await validateUserAccess(token, orcamentoExistente.companyId);
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

    // Atualizar orçamento em uma transação
    await transaction(async (client) => {
      // Atualizar dados do orçamento
      await client.query(`
        UPDATE orcamentos
        SET
          numero = COALESCE($2, numero),
          serie = COALESCE($3, serie),
          "numeroOrdemCompra" = $4,
          "dataEmissao" = COALESCE($5, "dataEmissao"),
          "dataPrevisaoEntrega" = $6,
          "dataEntrega" = $7,
          "clienteId" = COALESCE($8::uuid, "clienteId"),
          "vendedorId" = $9::uuid,
          "transportadoraId" = $10::uuid,
          "prazoPagamentoId" = $11::uuid,
          "naturezaOperacaoPadraoId" = $12::uuid,
          "formaPagamentoId" = $13::uuid,
          "localEstoqueId" = $14::uuid,
          parcelamento = $15,
          "consumidorFinal" = COALESCE($16, "consumidorFinal"),
          "indicadorPresenca" = $17,
          "listaPreco" = $18,
          frete = $19,
          "valorFrete" = COALESCE($20, "valorFrete"),
          despesas = COALESCE($21, despesas),
          "incluirFreteTotal" = COALESCE($22, "incluirFreteTotal"),
          "placaVeiculo" = $23,
          "ufPlaca" = $24,
          rntc = $25,
          "pesoLiquido" = COALESCE($26, "pesoLiquido"),
          "pesoBruto" = COALESCE($27, "pesoBruto"),
          volume = COALESCE($28, volume),
          especie = $29,
          marca = $30,
          numeracao = $31,
          "quantidadeVolumes" = $32,
          "totalProdutos" = COALESCE($33::decimal, "totalProdutos"),
          "totalDescontos" = COALESCE($34::decimal, "totalDescontos"),
          "totalImpostos" = COALESCE($35::decimal, "totalImpostos"),
          "totalGeral" = COALESCE($36::decimal, "totalGeral"),
          status = COALESCE($37, status),
          observacoes = $38,
          "updatedAt" = NOW()
        WHERE id = $1::uuid
      `, [
        id,
        body.numero,
        body.serie,
        body.numeroPedidoCotacao || body.numeroOrdemCompra || null,
        body.dataEmissao,
        body.dataPrevisaoEntrega || null,
        body.dataEntrega || null,
        body.clienteId,
        body.vendedorId || null,
        body.transportadoraId || null,
        body.prazoPagamentoId || null,
        body.naturezaOperacaoPadraoId || null,
        body.formaPagamentoId || null,
        body.localEstoqueId || null,
        body.parcelamento || null,
        body.consumidorFinal,
        body.indicadorPresenca || null,
        body.listaPreco || null,
        body.frete || null,
        body.valorFrete,
        body.despesas,
        body.incluirFreteTotal,
        body.placaVeiculo || null,
        body.ufPlaca || null,
        body.rntc || null,
        body.pesoLiquido,
        body.pesoBruto,
        body.volume,
        body.especie || null,
        body.marca || null,
        body.numeracao || null,
        body.quantidadeVolumes || null,
        body.totalProdutos,
        body.totalDescontos,
        body.totalImpostos,
        body.totalGeral,
        body.status,
        body.observacoes || null
      ]);

      // Se houver itens, atualizar
      if (body.itens && Array.isArray(body.itens)) {
        // Deletar itens existentes
        await client.query(`
          DELETE FROM orcamento_itens WHERE "orcamentoId" = $1::uuid
        `, [id]);

        // Inserir novos itens
        for (const item of body.itens) {
          // Validar campos obrigatórios do item
          const naturezaId = item.naturezaOperacaoId || body.naturezaOperacaoPadraoId;
          if (!naturezaId) {
            throw new Error('naturezaOperacaoId é obrigatório para todos os itens');
          }
          
          await client.query(`
            INSERT INTO orcamento_itens (
              "orcamentoId",
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
              $1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8, $9::uuid, $10, $11, $12, $13,
              $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
            )
          `, [
            id,
            orcamentoExistente.companyId,
            item.produtoId || null,
            item.codigo || '',
            item.nome || '',
            item.unidade || 'UN',
            item.ncm || null,
            item.cest || null,
            naturezaId,
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
            item.numeroItem || null,
            item.observacoes || null
          ]);
        }
      }
    });

    // Buscar orçamento atualizado
    const orcamentoAtualizadoResult = await query(`
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
      WHERE o.id = $1::uuid
    `, [id]);

    const orcamentoAtualizado = orcamentoAtualizadoResult.rows[0];

    // Buscar itens atualizados
    const itensResult = await query(`
      SELECT *
      FROM orcamento_itens
      WHERE "orcamentoId" = $1::uuid
      ORDER BY COALESCE("numeroItem", 999) ASC, "createdAt" ASC
    `, [id]);

    const response = {
      id: orcamentoAtualizado.id,
      numero: orcamentoAtualizado.numero,
      serie: orcamentoAtualizado.serie,
      dataEmissao: orcamentoAtualizado.dataEmissao,
      dataPrevisaoEntrega: orcamentoAtualizado.dataPrevisaoEntrega,
      clienteId: orcamentoAtualizado.clienteId,
      cliente: orcamentoAtualizado.cliente_id ? {
        id: orcamentoAtualizado.cliente_id,
        nomeRazaoSocial: orcamentoAtualizado.cliente_nome_razao,
        nomeFantasia: orcamentoAtualizado.cliente_nome_fantasia
      } : null,
      vendedorId: orcamentoAtualizado.vendedorId,
      vendedor: orcamentoAtualizado.vendedor_id ? {
        id: orcamentoAtualizado.vendedor_id,
        nomeRazaoSocial: orcamentoAtualizado.vendedor_nome_razao,
        nomeFantasia: orcamentoAtualizado.vendedor_nome_fantasia
      } : null,
      totalProdutos: parseFloat(orcamentoAtualizado.totalProdutos || 0),
      totalDescontos: parseFloat(orcamentoAtualizado.totalDescontos || 0),
      totalImpostos: parseFloat(orcamentoAtualizado.totalImpostos || 0),
      totalGeral: parseFloat(orcamentoAtualizado.totalGeral || 0),
      status: orcamentoAtualizado.status || 'pendente',
      observacoes: orcamentoAtualizado.observacoes,
      companyId: orcamentoAtualizado.companyId,
      itens: itensResult.rows.map((item: any) => ({
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

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar orçamento:', error);
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
 * DELETE /api/orcamentos/[id]
 * 
 * Excluir um orçamento
 */
export async function DELETE(
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
    const { id } = await params;

    // Buscar o orçamento para validar acesso
    const orcamentoResult = await query(`
      SELECT * FROM orcamentos WHERE id = $1::uuid
    `, [id]);

    if (orcamentoResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Orçamento não encontrado' },
        { status: 404 }
      );
    }

    const orcamento = orcamentoResult.rows[0];

    // Validar acesso
    const acesso = await validateUserAccess(token, orcamento.companyId);
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

    // Deletar orçamento e seus itens em uma transação
    await transaction(async (client) => {
      // Deletar itens primeiro
      await client.query(`
        DELETE FROM orcamento_itens WHERE "orcamentoId" = $1::uuid
      `, [id]);

      // Deletar orçamento
      await client.query(`
        DELETE FROM orcamentos WHERE id = $1::uuid
      `, [id]);
    });

    return NextResponse.json({
      success: true,
      message: 'Orçamento excluído com sucesso'
    });
  } catch (error: any) {
    console.error('❌ Erro ao excluir orçamento:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

