import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * POST /api/caixa/venda
 * 
 * Cria uma venda no caixa com emissão de NFCe
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
    const {
      company_id,
      caixa_id,
      naturezaOperacaoId,
      clienteId,
      clienteCpfCnpj,
      clienteNome,
      clienteEmail,
      clienteEndereco,
      indicadorPresenca,
      itens,
      valorDesconto,
      formaPagamentoId,
      meioPagamento,
      valorRecebido,
      observacoes
    } = body;

    // Validações obrigatórias
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!caixa_id) {
      return NextResponse.json(
        { success: false, error: 'caixa_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!naturezaOperacaoId) {
      return NextResponse.json(
        { success: false, error: 'naturezaOperacaoId é obrigatório' },
        { status: 400 }
      );
    }

    if (!indicadorPresenca) {
      return NextResponse.json(
        { success: false, error: 'indicadorPresenca é obrigatório' },
        { status: 400 }
      );
    }

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { success: false, error: 'É necessário pelo menos um item na venda' },
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

    // Verificar se o caixa existe e está aberto
    const caixaQuery = await query(`
      SELECT id, status
      FROM caixas
      WHERE id = $1::uuid
        AND "companyId" = $2::uuid
    `, [caixa_id, company_id]);

    if (caixaQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Caixa não encontrado' },
        { status: 404 }
      );
    }

    const caixa = caixaQuery.rows[0];
    if (caixa.status !== 'aberto') {
      return NextResponse.json(
        { success: false, error: 'Caixa deve estar aberto para realizar vendas' },
        { status: 400 }
      );
    }


    // Validar produtos e calcular totais
    let valorTotalProdutos = 0;
    let valorTotalDesconto = parseFloat(valorDesconto || 0);

    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      
      if (!item.codigo || !item.nome || !item.ncm) {
        return NextResponse.json(
          { success: false, error: `Item ${i + 1}: codigo, nome e ncm são obrigatórios` },
          { status: 400 }
        );
      }

      const quantidade = parseFloat(item.quantidade || 0);
      const precoUnitario = parseFloat(item.precoUnitario || 0);
      
      if (quantidade <= 0) {
        return NextResponse.json(
          { success: false, error: `Item ${i + 1}: quantidade deve ser maior que zero` },
          { status: 400 }
        );
      }

      if (precoUnitario <= 0) {
        return NextResponse.json(
          { success: false, error: `Item ${i + 1}: precoUnitario deve ser maior que zero` },
          { status: 400 }
        );
      }

      const valorItemDesconto = parseFloat(item.valorDesconto || 0);
      const valorTotalItem = (quantidade * precoUnitario) - valorItemDesconto;
      
      valorTotalProdutos += (quantidade * precoUnitario);
    }

    // Calcular impostos (chamar API externa)
    let impostosCalculados = null;
    try {
      // Buscar UF da empresa (usar padrão se não disponível)
      const empresaQuery = await query(`
        SELECT 
          COALESCE(
            (SELECT estado FROM companies WHERE id = $1::uuid LIMIT 1),
            'SP'
          ) as uf_origem
      `, [company_id]);

      const ufOrigem = empresaQuery.rows[0]?.uf_origem || 'SP';
      let ufDestino = 'SP';

      // Se houver cliente, buscar UF do cliente
      if (clienteId) {
        const clienteQuery = await query(`
          SELECT 
            enderecos
          FROM cadastros
          WHERE id = $1::uuid
            AND "companyId" = $2::uuid
        `, [clienteId, company_id]);

        if (clienteQuery.rows.length > 0) {
          const enderecos = clienteQuery.rows[0].enderecos;
          if (enderecos && Array.isArray(enderecos) && enderecos.length > 0) {
            const enderecoPrincipal = enderecos.find((e: any) => e.principal) || enderecos[0];
            ufDestino = enderecoPrincipal.estado || 'SP';
          }
        }
      }

      // Preparar payload para cálculo de impostos
      const impostosPayload = {
        companyId: company_id,
        clienteId: clienteId || null,
        naturezaOperacaoId: naturezaOperacaoId,
        ufOrigem: ufOrigem,
        ufDestino: ufDestino,
        incluirFreteTotal: false,
        valorFrete: 0,
        despesas: 0,
        itens: itens.map((item: any) => ({
          codigo: item.codigo,
          nome: item.nome,
          unidadeMedida: item.unidade || 'UN',
          quantidade: parseFloat(item.quantidade || 0),
          valorUnitario: parseFloat(item.precoUnitario || 0),
          valorDesconto: parseFloat(item.valorDesconto || 0)
        }))
      };

      // Chamar API de calcular impostos (URL relativa para Next.js API routes)
      const impostosResponse = await fetch(`/api/impostos/calcular`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(impostosPayload)
      });

      if (impostosResponse.ok) {
        impostosCalculados = await impostosResponse.json();
      } else {
        console.warn('⚠️ Erro ao calcular impostos, continuando sem impostos calculados');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao calcular impostos:', error);
      // Continuar sem impostos calculados (valores serão 0)
    }

    // Calcular valores finais
    const valorImpostos = impostosCalculados?.totais?.totalImpostos || 0;
    const valorTributosAprox = impostosCalculados?.totais?.tributosAprox || 0;
    const valorTotal = valorTotalProdutos - valorTotalDesconto + valorImpostos;
    const valorTroco = parseFloat(valorRecebido || 0) >= valorTotal 
      ? parseFloat(valorRecebido || 0) - valorTotal 
      : 0;

    // Validar valor recebido
    if (valorRecebido && parseFloat(valorRecebido) < valorTotal) {
      return NextResponse.json(
        { success: false, error: `Valor recebido (R$ ${parseFloat(valorRecebido).toFixed(2)}) deve ser maior ou igual ao total (R$ ${valorTotal.toFixed(2)})` },
        { status: 400 }
      );
    }


    console.log('💾 CRIANDO VENDA NO CAIXA:');
    console.log('  📍 Caixa ID:', caixa_id);
    console.log('  🏢 Company ID:', company_id);
    console.log('  💰 Valor Total:', valorTotal);
    console.log('  💳 Meio Pagamento:', meioPagamento);
    console.log('  📦 Itens:', itens.length);

    // Criar venda no caixa (em transação)
    const resultadoVenda = await transaction(async (client) => {
      // Criar registro de venda
      const vendaQuery = await client.query(`
        INSERT INTO vendas_caixa (
          "caixaId",
          "companyId",
          "naturezaOperacaoId",
          "clienteId",
          "clienteCpfCnpj",
          "clienteNome",
          "clienteEmail",
          "clienteEndereco",
          "consumidorFinal",
          "indicadorPresenca",
          "dataVenda",
          "dataEmissao",
          "dataSaida",
          "horaSaida",
          "valorTotal",
          "valorProdutos",
          "valorDesconto",
          "valorFrete",
          "valorImpostos",
          "valorTributosAprox",
          "formaPagamentoId",
          "meioPagamento",
          "valorRecebido",
          "valorTroco",
          status,
          "observacoes"
        )
        VALUES (
          $1::uuid, $2::uuid, $3::uuid, $4::uuid,
          $5::text, $6::text, $7::text, $8::jsonb,
          TRUE, $9::text,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $10::text,
          $11::numeric, $12::numeric, $13::numeric, 0::numeric,
          $14::numeric, $15::numeric,
          $16::uuid, $17::text, $18::numeric, $19::numeric,
          'concluida', $20::text
        )
        RETURNING id
      `, [
        caixa_id,
        company_id,
        naturezaOperacaoId,
        clienteId || null,
        clienteCpfCnpj || null,
        clienteNome || 'Cliente Avulso',
        clienteEmail || null,
        clienteEndereco ? JSON.stringify(clienteEndereco) : null,
        indicadorPresenca,
        new Date().toTimeString().slice(0, 5), // horaSaida
        valorTotal,
        valorTotalProdutos,
        valorTotalDesconto,
        valorImpostos,
        valorTributosAprox,
        formaPagamentoId || null,
        meioPagamento || null,
        valorRecebido ? parseFloat(valorRecebido) : null,
        valorTroco,
        observacoes || null
      ]);

      const vendaId = vendaQuery.rows[0].id;
      console.log('✅ Venda criada com ID:', vendaId);
      console.log('  📊 Status: concluida');
      console.log('  🔗 Associada ao caixa:', caixa_id);

      // Criar itens da venda
      const itensInsertados = [];
      for (let i = 0; i < itens.length; i++) {
        const item = itens[i];
        const quantidade = parseFloat(item.quantidade || 0);
        const precoUnitario = parseFloat(item.precoUnitario || 0);
        const valorItemDesconto = parseFloat(item.valorDesconto || 0);
        const valorTotalItem = (quantidade * precoUnitario) - valorItemDesconto;

        // Buscar impostos do item calculado
        const itemCalculado = impostosCalculados?.itens?.[i];
        
        const itemQuery = await client.query(`
          INSERT INTO vendas_caixa_itens (
            "vendaCaixaId",
            "produtoId",
            "companyId",
            "naturezaOperacaoId",
            codigo,
            nome,
            descricao,
            ncm,
            cfop,
            cest,
            unidade,
            quantidade,
            "precoUnitario",
            "valorDesconto",
            "descontoPercentual",
            "valorTotal",
            "icmsCST",
            "icmsBase",
            "icmsAliquota",
            "icmsValor",
            "ipiCST",
            "ipiBase",
            "ipiAliquota",
            "ipiValor",
            "pisCST",
            "pisBase",
            "pisAliquota",
            "pisValor",
            "cofinsCST",
            "cofinsBase",
            "cofinsAliquota",
            "cofinsValor",
            "numeroItem"
          )
          VALUES (
            $1::uuid, $2::uuid, $3::uuid, $4::uuid,
            $5::text, $6::text, $7::text, $8::text, $9::text, $10::text, $11::text,
            $12::numeric, $13::numeric, $14::numeric, $15::numeric, $16::numeric,
            $17::text, $18::numeric, $19::numeric, $20::numeric,
            $21::text, $22::numeric, $23::numeric, $24::numeric,
            $25::text, $26::numeric, $27::numeric, $28::numeric,
            $29::text, $30::numeric, $31::numeric, $32::numeric,
            $33::integer
          )
          RETURNING id
        `, [
          vendaId,
          item.produtoId || null,
          company_id,
          item.naturezaOperacaoId || naturezaOperacaoId,
          item.codigo,
          item.nome,
          item.descricao || null,
          item.ncm,
          item.cfop || null,
          item.cest || null,
          item.unidade || 'UN',
          quantidade,
          precoUnitario,
          valorItemDesconto,
          item.descontoPercentual || 0,
          valorTotalItem,
          itemCalculado?.icmsCST || null,
          itemCalculado?.icmsBase ? parseFloat(itemCalculado.icmsBase) : null,
          itemCalculado?.icmsAliquota ? parseFloat(itemCalculado.icmsAliquota) : null,
          itemCalculado?.icmsValor ? parseFloat(itemCalculado.icmsValor) : null,
          itemCalculado?.ipiCST || null,
          itemCalculado?.ipiBase ? parseFloat(itemCalculado.ipiBase) : null,
          itemCalculado?.ipiAliquota ? parseFloat(itemCalculado.ipiAliquota) : null,
          itemCalculado?.ipiValor ? parseFloat(itemCalculado.ipiValor) : null,
          itemCalculado?.pisCST || null,
          itemCalculado?.pisBase ? parseFloat(itemCalculado.pisBase) : null,
          itemCalculado?.pisAliquota ? parseFloat(itemCalculado.pisAliquota) : null,
          itemCalculado?.pisValor ? parseFloat(itemCalculado.pisValor) : null,
          itemCalculado?.cofinsCST || null,
          itemCalculado?.cofinsBase ? parseFloat(itemCalculado.cofinsBase) : null,
          itemCalculado?.cofinsAliquota ? parseFloat(itemCalculado.cofinsAliquota) : null,
          itemCalculado?.cofinsValor ? parseFloat(itemCalculado.cofinsValor) : null,
          i + 1
        ]);

        itensInsertados.push({
          id: itemQuery.rows[0].id,
          numeroItem: i + 1,
          ...item
        });
      }

      // Criar movimentação de caixa (entrada)
      await client.query(`
        INSERT INTO movimentacoes_caixa (
          "caixaId",
          "companyId",
          tipo,
          valor,
          descricao,
          "formaPagamentoId"
        )
        VALUES ($1::uuid, $2::uuid, 'entrada', $3::numeric, $4::text, $5::uuid)
      `, [
        caixa_id,
        company_id,
        valorTotal,
        `Venda realizada`,
        formaPagamentoId || null
      ]);

      // VERIFICAÇÃO: Contar vendas do caixa logo após inserir
      const verificacaoQuery = await client.query(`
        SELECT 
          COUNT(*) as total,
          COALESCE(SUM("valorTotal"), 0) as soma
        FROM vendas_caixa
        WHERE "caixaId" = $1::uuid
          AND status = 'concluida'
      `, [caixa_id]);
      
      console.log('🔍 VERIFICAÇÃO PÓS-VENDA:');
      console.log('  📊 Total de vendas no caixa:', verificacaoQuery.rows[0].total);
      console.log('  💰 Soma total das vendas:', verificacaoQuery.rows[0].soma);

      return {
        vendaId,
        itensInsertados
      };
    });

    console.log('✅ VENDA FINALIZADA COM SUCESSO! ID:', resultadoVenda.vendaId);

    // TODO: Atualizar estoque se controla estoque
    // Por enquanto, apenas registrar movimentação manual

    return NextResponse.json({
      success: true,
      data: {
        venda: {
          id: resultadoVenda.vendaId,
          valorTotal: valorTotal,
          valorTroco: valorTroco,
          itens: resultadoVenda.itensInsertados
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar venda no caixa:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}
