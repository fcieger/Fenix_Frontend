import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/pedidos-compra
 * 
 * Retorna lista de pedidos de compra com relacionamentos
 */
export async function GET(request: NextRequest) {
  try {
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });
    
    // Verificar se as tabelas existem
    try {
      const tableCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'pedidos_compra'
        );
      `);
      
      if (!tableCheck.rows[0]?.exists) {
        console.error('❌ Tabela pedidos_compra não existe!');
        return NextResponse.json(
          {
            success: false,
            error: 'Tabelas de compras não foram criadas. Execute a inicialização do banco de dados.'
          },
          { status: 500 }
        );
      }

      // Verificar se tabela cadastros existe (necessária para JOINs)
      const cadastrosCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'cadastros'
        );
      `);
      
      if (!cadastrosCheck.rows[0]?.exists) {
        console.error('❌ Tabela cadastros não existe!');
        return NextResponse.json(
          {
            success: false,
            error: 'Tabela cadastros não existe. Execute a inicialização do banco de dados.'
          },
          { status: 500 }
        );
      }
    } catch (checkError: any) {
      console.error('❌ Erro ao verificar tabelas:', checkError);
      throw checkError;
    }

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
    
    // Se não houver company_id nos params, tentar extrair do token via validateUserAccess
    if (!company_id) {
      // Tentar validar o token e extrair o company_id
      // Por enquanto, vamos buscar de outra forma ou tornar opcional
      // Vamos buscar o company_id do token JWT ou torná-lo opcional
      // Por segurança, vamos exigir, mas vamos melhorar a mensagem de erro
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

    // Buscar pedidos de compra com relacionamentos
    try {
      console.log('[API Pedidos Compra] Buscando pedidos para companyId:', company_id);
      
      // Primeiro, buscar apenas os pedidos (sem JOINs complexos)
      const pedidosBaseQuery = await query(`
        SELECT pc.*
        FROM pedidos_compra pc
        WHERE pc."companyId" = $1::uuid
        ORDER BY pc."dataEmissao" DESC, pc."createdAt" DESC
      `, [company_id]);
      
      console.log('[API Pedidos Compra] Pedidos base encontrados:', pedidosBaseQuery.rows.length);
      
      // Buscar relacionamentos para cada pedido separadamente
      const pedidos = await Promise.all(
        pedidosBaseQuery.rows.map(async (pc: any) => {
          try {
            // Buscar fornecedor
            let fornecedor = null;
            if (pc.fornecedorId) {
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
            }
            
            // Buscar comprador
            let comprador = null;
            if (pc.compradorId) {
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
            }
            
            // Buscar transportadora
            let transportadora = null;
            if (pc.transportadoraId) {
              const transportadoraQuery = await query(`
                SELECT id, "nomeRazaoSocial", "nomeFantasia"
                FROM cadastros
                WHERE id = $1::uuid
                LIMIT 1
              `, [pc.transportadoraId]);
              if (transportadoraQuery.rows.length > 0) {
                const t = transportadoraQuery.rows[0];
                transportadora = {
                  id: t.id,
                  nomeRazaoSocial: t.nomeRazaoSocial,
                  nomeFantasia: t.nomeFantasia
                };
              }
            }
            
            // Buscar itens
            const itensQuery = await query(`
              SELECT 
                id,
                "produtoId",
                codigo,
                nome,
                unidade,
                quantidade,
                "precoUnitario",
                "descontoValor",
                "descontoPercentual",
                "totalItem"
              FROM pedidos_compra_itens
              WHERE "pedidoCompraId" = $1::uuid
              ORDER BY "numeroItem" ASC
            `, [pc.id]);
            
            const itens = itensQuery.rows.map((pci: any) => ({
              id: pci.id,
              produtoId: pci.produtoId,
              codigo: pci.codigo,
              nome: pci.nome,
              unidade: pci.unidade,
              quantidade: pci.quantidade,
              precoUnitario: pci.precoUnitario,
              descontoValor: pci.descontoValor,
              descontoPercentual: pci.descontoPercentual,
              totalItem: pci.totalItem
            }));
            
            return {
              ...pc,
              fornecedor,
              comprador,
              transportadora,
              itens
            };
          } catch (itemError: any) {
            console.error(`[API Pedidos Compra] Erro ao buscar relacionamentos para pedido ${pc.id}:`, itemError);
            // Retornar pedido mesmo com erro nos relacionamentos
            return {
              ...pc,
              fornecedor: null,
              comprador: null,
              transportadora: null,
              itens: []
            };
          }
        })
      );
      
      console.log('[API Pedidos Compra] ✅ Retornando', pedidos.length, 'pedidos');

      return NextResponse.json({
        success: true,
        data: pedidos
      });
    } catch (queryError: any) {
      console.error('❌ Erro na query SQL:', queryError);
      console.error('❌ Mensagem:', queryError.message);
      console.error('❌ Código:', queryError.code);
      console.error('❌ Detalhe:', queryError.detail);
      console.error('❌ Query:', `
        SELECT pc.* FROM pedidos_compra pc WHERE pc."companyId" = $1::uuid
      `);
      throw queryError; // Re-throw para ser capturado pelo catch externo
    }

  } catch (error: any) {
    console.error('❌ Erro ao buscar pedidos de compra:', error);
    console.error('❌ Stack:', error?.stack);
    console.error('❌ Detalhes:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      constraint: error?.constraint
    });
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          code: error?.code,
          detail: error?.detail,
          constraint: error?.constraint,
          stack: error?.stack?.substring(0, 500) // Limitar stack trace
        } : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pedidos-compra
 * 
 * Cria um novo pedido de compra
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
    const { companyId, ...pedidoData } = body;

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

    // Extrair itens do pedido
    const { itens, ...pedidoSemItens } = pedidoData;

    // ============================================
    // VALIDAÇÕES OBRIGATÓRIAS
    // ============================================
    const erros: string[] = [];

    // Validar campos obrigatórios do pedido
    if (!pedidoSemItens.fornecedorId) {
      erros.push('fornecedorId é obrigatório');
    }
    if (!pedidoSemItens.dataEmissao) {
      erros.push('dataEmissao é obrigatória');
    }

    // Validar itens
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      erros.push('É necessário ter pelo menos um item no pedido');
    } else {
      itens.forEach((item, index) => {
        const numItem = index + 1;
        // naturezaOperacaoId é opcional para pedidos via OCR (será definida depois)
        // if (!item.naturezaOperacaoId) {
        //   erros.push(`Item ${numItem}: naturezaOperacaoId é obrigatório`);
        // }
        if (!item.nome || item.nome.trim() === '') {
          erros.push(`Item ${numItem}: nome é obrigatório`);
        }
        if (!item.unidade || item.unidade.trim() === '') {
          erros.push(`Item ${numItem}: unidade é obrigatória`);
        }
        if (!item.quantidade || Number(item.quantidade) <= 0) {
          erros.push(`Item ${numItem}: quantidade deve ser maior que zero (atual: ${item.quantidade})`);
        }
        if (item.precoUnitario !== undefined && item.precoUnitario !== null && Number(item.precoUnitario) < 0) {
          erros.push(`Item ${numItem}: precoUnitario não pode ser negativo (atual: ${item.precoUnitario})`);
        }
      });
    }

    if (erros.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos obrigatórios não preenchidos',
          details: erros
        },
        { status: 400 }
      );
    }

    // ============================================
    // GERAR/CALCULAR VALORES AUTOMÁTICOS
    // ============================================

    // Gerar número do pedido se não fornecido
    if (!pedidoSemItens.numero) {
      const ultimoNumeroQuery = await query(`
        SELECT MAX(numero::integer) as ultimo_numero
        FROM pedidos_compra
        WHERE "companyId" = $1::uuid
          AND numero ~ '^[0-9]+$'
      `, [companyId]);
      
      const ultimoNumero = ultimoNumeroQuery.rows[0]?.ultimo_numero || 0;
      pedidoSemItens.numero = String(ultimoNumero + 1);
    }

    // Calcular totais baseado nos itens se não fornecidos
    let totalProdutos = pedidoSemItens.totalProdutos || 0;
    let totalDescontos = pedidoSemItens.totalDescontos || 0;
    let totalImpostos = pedidoSemItens.totalImpostos || 0;
    let totalGeral = pedidoSemItens.totalGeral || 0;

    // Se não foram fornecidos, calcular automaticamente
    if (!pedidoSemItens.totalProdutos || !pedidoSemItens.totalDescontos || 
        !pedidoSemItens.totalImpostos || !pedidoSemItens.totalGeral) {
      
      totalProdutos = 0;
      totalDescontos = 0;
      totalImpostos = 0;

      itens.forEach((item: any) => {
        const quantidade = Number(item.quantidade || 0);
        const precoUnitario = Number(item.precoUnitario || 0);
        const descontoValor = Number(item.descontoValor || 0);
        
        // Total do item = quantidade * preço - desconto
        const subtotalItem = quantidade * precoUnitario;
        const totalItem = subtotalItem - descontoValor;

        // Somar ao total de produtos (antes dos descontos)
        totalProdutos += subtotalItem;
        // Somar descontos
        totalDescontos += descontoValor;
        // Somar impostos do item
        totalImpostos += Number(item.icmsValor || 0) + 
                        Number(item.ipiValor || 0) + 
                        Number(item.pisValor || 0) + 
                        Number(item.cofinsValor || 0) + 
                        Number(item.icmsStValor || 0);
      });

      // Calcular total geral
      totalGeral = totalProdutos - totalDescontos + totalImpostos;
      
      // Adicionar despesas
      totalGeral += Number(pedidoSemItens.despesas || 0);
      
      // Adicionar frete se incluído
      if (pedidoSemItens.incluirFreteTotal) {
        totalGeral += Number(pedidoSemItens.valorFrete || 0);
      }
    }

    // Log para debug
    console.log('[API Pedidos Compra] Criando pedido:', {
      companyId,
      fornecedorId: pedidoSemItens.fornecedorId,
      numero: pedidoSemItens.numero,
      dataEmissao: pedidoSemItens.dataEmissao,
      totalItens: itens?.length || 0,
      totalProdutos,
      totalDescontos,
      totalImpostos,
      totalGeral
    });

    // Criar pedido de compra
    const insertPedidoQuery = await query(`
      INSERT INTO pedidos_compra (
        "companyId",
        numero,
        serie,
        "numeroOrdemCompra",
        "dataEmissao",
        "dataPrevisaoEntrega",
        "dataEntrega",
        "fornecedorId",
        "compradorId",
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
        observacoes,
        status
      ) VALUES (
        $1::uuid,
        $2, $3, $4, $5::date, $6::date, $7::date,
        $8::uuid, $9::uuid, $10::uuid, $11::uuid, $12::uuid, $13::uuid, $14::uuid,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27,
        $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38
      ) RETURNING *
    `, [
      companyId,
      pedidoSemItens.numero, // Já garantido que existe (gerado automaticamente se necessário)
      pedidoSemItens.serie || null,
      pedidoSemItens.numeroOrdemCompra || null,
      pedidoSemItens.dataEmissao, // Já validado que existe
      pedidoSemItens.dataPrevisaoEntrega || null,
      pedidoSemItens.dataEntrega || null,
      pedidoSemItens.fornecedorId, // Já validado que existe
      pedidoSemItens.compradorId || null,
      pedidoSemItens.transportadoraId || null,
      pedidoSemItens.prazoPagamentoId || null,
      pedidoSemItens.naturezaOperacaoPadraoId || null,
      pedidoSemItens.formaPagamentoId || null,
      pedidoSemItens.localEstoqueId || null,
      pedidoSemItens.parcelamento || null,
      pedidoSemItens.consumidorFinal || false,
      pedidoSemItens.indicadorPresenca || null,
      pedidoSemItens.listaPreco || null,
      pedidoSemItens.frete || null,
      pedidoSemItens.valorFrete || 0,
      pedidoSemItens.despesas || 0,
      pedidoSemItens.incluirFreteTotal || false,
      pedidoSemItens.placaVeiculo || null,
      pedidoSemItens.ufPlaca || null,
      pedidoSemItens.rntc || null,
      pedidoSemItens.pesoLiquido || 0,
      pedidoSemItens.pesoBruto || 0,
      pedidoSemItens.volume || 0,
      pedidoSemItens.especie || null,
      pedidoSemItens.marca || null,
      pedidoSemItens.numeracao || null,
      pedidoSemItens.quantidadeVolumes || null,
      totalProdutos, // Usar valor calculado
      totalDescontos, // Usar valor calculado
      totalImpostos, // Usar valor calculado
      totalGeral, // Usar valor calculado
      pedidoSemItens.observacoes || null,
      pedidoSemItens.status || 'rascunho'
    ]);

    const pedidoCriado = insertPedidoQuery.rows[0];
    const pedidoId = pedidoCriado.id;

    console.log('[API Pedidos Compra] ✅ Pedido criado com sucesso:', {
      id: pedidoId,
      numero: pedidoCriado.numero,
      dataEmissao: pedidoCriado.dataEmissao,
      status: pedidoCriado.status,
      totalGeral: pedidoCriado.totalGeral,
      companyId: pedidoCriado.companyId
    });

    // Buscar ou criar natureza de operação padrão para itens sem naturezaOperacaoId
    let naturezaOperacaoPadraoId = null;
    const itensComNaturezaFaltante = itens.filter(item => !item.naturezaOperacaoId);
    
    if (itensComNaturezaFaltante.length > 0) {
      console.log(`⚠️ ${itensComNaturezaFaltante.length} itens sem naturezaOperacaoId, buscando padrão...`);
      
      // Buscar natureza de operação padrão
      const naturezaPadrao = await query(`
        SELECT id FROM naturezas_operacao
        WHERE "companyId" = $1
        AND tipo = 'compras'
        AND habilitado = true
        LIMIT 1
      `, [companyId]);
      
      if (naturezaPadrao.rows.length > 0) {
        naturezaOperacaoPadraoId = naturezaPadrao.rows[0].id;
        console.log(`✅ Usando natureza padrão: ${naturezaOperacaoPadraoId}`);
      } else {
        // Criar natureza de operação padrão
        console.log('📝 Criando natureza de operação padrão para compras...');
        const novaNatureza = await query(`
          INSERT INTO naturezas_operacao (
            "companyId",
            nome,
            cfop,
            tipo,
            "movimentaEstoque",
            habilitado
          ) VALUES (
            $1, 'Compra de Mercadorias', '1102', 'compras', true, true
          ) RETURNING id
        `, [companyId]);
        naturezaOperacaoPadraoId = novaNatureza.rows[0].id;
        console.log(`✅ Natureza padrão criada: ${naturezaOperacaoPadraoId}`);
      }
    }

    // Inserir itens se houver
    if (itens && Array.isArray(itens) && itens.length > 0) {
      for (let i = 0; i < itens.length; i++) {
        const item = itens[i];
        
        // Calcular totalItem automaticamente (já validado acima)
        const quantidade = Number(item.quantidade || 0);
        const precoUnitario = Number(item.precoUnitario || 0);
        const descontoValor = Number(item.descontoValor || 0);
        const totalItem = item.totalItem ? Number(item.totalItem) : ((quantidade * precoUnitario) - descontoValor);
        
        // Validar que totalItem não é negativo
        if (totalItem < 0) {
          return NextResponse.json(
            { success: false, error: `Item ${i + 1}: totalItem não pode ser negativo` },
            { status: 400 }
          );
        }
        
        try {
          console.log(`[API Pedidos Compra] Inserindo item ${i + 1}:`, {
            pedidoId,
            companyId,
            produtoId: item.produtoId || null,
            codigo: item.codigo || '',
            nome: item.nome || '',
            unidade: item.unidade || 'UN',
            naturezaOperacaoId: item.naturezaOperacaoId,
            quantidade,
            precoUnitario,
            totalItem
          });

          // Usar naturezaOperacaoId do item ou o padrão
          const naturezaOperacaoIdFinal = item.naturezaOperacaoId || naturezaOperacaoPadraoId;
          
          if (!naturezaOperacaoIdFinal) {
            console.error(`❌ Item ${i + 1}: naturezaOperacaoId não encontrada`);
            return NextResponse.json(
              { success: false, error: `Item ${i + 1}: naturezaOperacaoId não encontrada e não foi possível criar padrão` },
              { status: 400 }
            );
          }
          
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
            pedidoId,
            companyId,
            item.produtoId || null,
            item.codigo || '',
            item.nome || '',
            item.unidade || 'UN',
            item.ncm || null,
            item.cest || null,
            naturezaOperacaoIdFinal, // Usa o do item ou o padrão
            quantidade, // Já convertido e validado
            precoUnitario, // Já convertido e validado
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
            totalItem, // Usar o valor calculado
            item.numeroItem || (i + 1),
            item.observacoes || null
          ]);
          console.log(`[API Pedidos Compra] ✅ Item ${i + 1} inserido com sucesso`);
        } catch (itemError: any) {
          console.error(`[API Pedidos Compra] ❌ Erro ao inserir item ${i + 1}:`, itemError);
          console.error(`[API Pedidos Compra] Item data:`, JSON.stringify(item, null, 2));
          throw new Error(`Erro ao inserir item ${i + 1}: ${itemError.message || itemError.detail || 'Erro desconhecido'}`);
        }
      }
    }

    // Buscar pedido completo com relacionamentos
    console.log('[API Pedidos Compra] Buscando pedido criado:', pedidoId);
    const pedidoCompletoQuery = await query(`
      SELECT 
        pc.*,
        json_build_object(
          'id', f.id,
          'nomeRazaoSocial', f."nomeRazaoSocial",
          'nomeFantasia', f."nomeFantasia"
        ) as fornecedor,
        json_build_object(
          'id', c.id,
          'nomeRazaoSocial', c."nomeRazaoSocial",
          'nomeFantasia', c."nomeFantasia"
        ) as comprador,
        (
          SELECT json_agg(
            json_build_object(
              'id', pci.id,
              'produtoId', pci."produtoId",
              'codigo', pci.codigo,
              'nome', pci.nome,
              'unidade', pci.unidade,
              'quantidade', pci.quantidade,
              'precoUnitario', pci."precoUnitario",
              'totalItem', pci."totalItem"
            )
          )
          FROM pedidos_compra_itens pci
          WHERE pci."pedidoCompraId" = pc.id
        ) as itens
      FROM pedidos_compra pc
      LEFT JOIN cadastros f ON pc."fornecedorId" = f.id
      LEFT JOIN cadastros c ON pc."compradorId" = c.id
      WHERE pc.id = $1::uuid
    `, [pedidoId]);

    const pedidoRetornado = pedidoCompletoQuery.rows[0];
    console.log('[API Pedidos Compra] ✅ Pedido criado com sucesso:', {
      id: pedidoRetornado?.id,
      numero: pedidoRetornado?.numero,
      fornecedorId: pedidoRetornado?.fornecedorId,
      totalItens: pedidoRetornado?.itens?.length || 0
    });

    return NextResponse.json({
      success: true,
      data: pedidoRetornado
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erro ao criar pedido de compra:', error);
    console.error('❌ Stack:', error?.stack);
    console.error('❌ Detalhes:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      constraint: error?.constraint
    });
    
    // Retornar erro mais detalhado
    const errorMessage = error?.detail || error?.message || 'Erro interno do servidor';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          code: error?.code,
          detail: error?.detail,
          constraint: error?.constraint,
          stack: error?.stack
        } : undefined
      },
      { status: 500 }
    );
  }
}

