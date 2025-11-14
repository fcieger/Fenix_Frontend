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

/**
 * POST /api/orcamentos
 * 
 * Criar um novo orçamento
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

    if (!body.companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId é obrigatório' },
        { status: 400 }
      );
    }

    // Validar acesso
    const acesso = await validateUserAccess(token, body.companyId);
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

    // Criar orçamento em uma transação
    let novoOrcamentoId: string;
    
    await transaction(async (client) => {
      // Inserir orçamento
      const orcamentoResult = await client.query(`
        INSERT INTO orcamentos (
          "companyId",
          numero,
          serie,
          "numeroOrdemCompra",
          "dataEmissao",
          "dataPrevisaoEntrega",
          "dataEntrega",
          "clienteId",
          "vendedorId",
          "transportadoraId",
          "prazoPagamentoId",
          "naturezaOperacaoPadraoId",
          "formaPagamentoId",
          "localEstoqueId",
          parcelamento,
          "consumidorFinal",
          "indicadorPresenca",
          "listaPreco",
          frete,
          "valorFrete",
          despesas,
          "incluirFreteTotal",
          "placaVeiculo",
          "ufPlaca",
          rntc,
          "pesoLiquido",
          "pesoBruto",
          volume,
          especie,
          marca,
          numeracao,
          "quantidadeVolumes",
          "totalProdutos",
          "totalDescontos",
          "totalImpostos",
          "totalGeral",
          status,
          observacoes
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8::uuid, $9::uuid, $10::uuid, $11::uuid, $12::uuid, 
          $13::uuid, $14::uuid, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, 
          $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38
        ) RETURNING id
      `, [
        body.companyId,
        body.numero || null,
        body.serie || null,
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
        body.consumidorFinal || false,
        body.indicadorPresenca || null,
        body.listaPreco || null,
        body.frete || null,
        body.valorFrete || 0,
        body.despesas || 0,
        body.incluirFreteTotal || false,
        body.placaVeiculo || null,
        body.ufPlaca || null,
        body.rntc || null,
        body.pesoLiquido || 0,
        body.pesoBruto || 0,
        body.volume || 0,
        body.especie || null,
        body.marca || null,
        body.numeracao || null,
        body.quantidadeVolumes || null,
        body.totalProdutos || 0,
        body.totalDescontos || 0,
        body.totalImpostos || 0,
        body.totalGeral || 0,
        body.status || 'pendente',
        body.observacoes || null
      ]);

      novoOrcamentoId = orcamentoResult.rows[0].id;

      // Inserir itens se houver
      if (body.itens && Array.isArray(body.itens)) {
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
            novoOrcamentoId,
            body.companyId,
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

    // Buscar orçamento criado com relacionamentos
    const orcamentoCriadoResult = await query(`
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
    `, [novoOrcamentoId]);

    const orcamentoCriado = orcamentoCriadoResult.rows[0];

    // Buscar itens criados
    const itensResult = await query(`
      SELECT *
      FROM orcamento_itens
      WHERE "orcamentoId" = $1::uuid
      ORDER BY COALESCE("numeroItem", 999) ASC, "createdAt" ASC
    `, [novoOrcamentoId]);

    const response = {
      id: orcamentoCriado.id,
      numero: orcamentoCriado.numero,
      serie: orcamentoCriado.serie,
      dataEmissao: orcamentoCriado.dataEmissao,
      dataPrevisaoEntrega: orcamentoCriado.dataPrevisaoEntrega,
      clienteId: orcamentoCriado.clienteId,
      cliente: orcamentoCriado.cliente_id ? {
        id: orcamentoCriado.cliente_id,
        nomeRazaoSocial: orcamentoCriado.cliente_nome_razao,
        nomeFantasia: orcamentoCriado.cliente_nome_fantasia
      } : null,
      vendedorId: orcamentoCriado.vendedorId,
      vendedor: orcamentoCriado.vendedor_id ? {
        id: orcamentoCriado.vendedor_id,
        nomeRazaoSocial: orcamentoCriado.vendedor_nome_razao,
        nomeFantasia: orcamentoCriado.vendedor_nome_fantasia
      } : null,
      totalProdutos: parseFloat(orcamentoCriado.totalProdutos || 0),
      totalDescontos: parseFloat(orcamentoCriado.totalDescontos || 0),
      totalImpostos: parseFloat(orcamentoCriado.totalImpostos || 0),
      totalGeral: parseFloat(orcamentoCriado.totalGeral || 0),
      status: orcamentoCriado.status || 'pendente',
      observacoes: orcamentoCriado.observacoes,
      companyId: orcamentoCriado.companyId,
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

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erro ao criar orçamento:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

