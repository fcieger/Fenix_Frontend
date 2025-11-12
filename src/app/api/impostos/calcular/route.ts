import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * POST /api/impostos/calcular
 * 
 * Calcula impostos para itens de pedidos/orçamentos
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
    const { companyId, clienteId, naturezaOperacaoId, ufOrigem, ufDestino, incluirFreteTotal, valorFrete, despesas, configuracaoImpostos, itens } = body;

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

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Itens são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar configuração da natureza de operação se não fornecida
    let configNatureza = configuracaoImpostos;
    if (!configNatureza && naturezaOperacaoId) {
      const naturezaQuery = await query(`
        SELECT 
          no.id,
          no.codigo,
          no.descricao,
          cn."ipiAliquota",
          cn."ipiCST",
          cn."ipiClasse",
          cn."ipiCodigo",
          cn."icmsStAliquota",
          cn."icmsStCST",
          cn."icmsStMva",
          cn."icmsStAplicarProduto"
        FROM natureza_operacao no
        LEFT JOIN configuracao_natureza cn ON no."configuracaoNaturezaId" = cn.id
        WHERE no.id = $1::uuid
          AND no."companyId" = $2::uuid
      `, [naturezaOperacaoId, companyId]);

      if (naturezaQuery.rows.length > 0) {
        const natureza = naturezaQuery.rows[0];
        configNatureza = {
          ipiAliquota: Number(natureza.ipiAliquota || 0),
          ipiCST: natureza.ipiCST || '',
          ipiClasse: natureza.ipiClasse || '',
          ipiCodigo: natureza.ipiCodigo || '',
          icmsStAplicarProduto: natureza.icmsStAplicarProduto !== false,
          icmsStAliquota: Number(natureza.icmsStAliquota || 0),
          icmsStCST: natureza.icmsStCST || '',
          icmsStMva: Number(natureza.icmsStMva || 0),
        };
      }
    }

    // Calcular impostos para cada item
    const itensCalculados = itens.map((item: any) => {
      const quantidade = Number(item.quantidade || 0);
      const valorUnitario = Number(item.valorUnitario || 0);
      const valorDesconto = Number(item.valorDesconto || 0);
      
      // Valor total do item (antes dos impostos)
      const valorTotalItem = (quantidade * valorUnitario) - valorDesconto;
      
      // Calcular ICMS
      const icmsBase = valorTotalItem;
      const icmsAliquota = 0; // Será calculado baseado no produto/NCM
      const icmsValor = 0; // Será calculado baseado no produto/NCM
      
      // Calcular ICMS ST se configurado
      let icmsStBase = 0;
      let icmsStAliquota = 0;
      let icmsStValor = 0;
      
      if (configNatureza?.icmsStAplicarProduto && ufOrigem !== ufDestino) {
        const mva = configNatureza.icmsStMva || 0;
        icmsStBase = valorTotalItem * (1 + mva / 100);
        icmsStAliquota = configNatureza.icmsStAliquota || 0;
        icmsStValor = icmsStBase * (icmsStAliquota / 100);
      }
      
      // Calcular IPI
      let ipiAliquota = 0;
      let ipiValor = 0;
      
      if (configNatureza?.ipiAliquota) {
        ipiAliquota = configNatureza.ipiAliquota;
        ipiValor = valorTotalItem * (ipiAliquota / 100);
      }
      
      // Calcular PIS
      const pisAliquota = 0; // Será calculado baseado no produto/NCM
      const pisValor = 0; // Será calculado baseado no produto/NCM
      
      // Calcular COFINS
      const cofinsAliquota = 0; // Será calculado baseado no produto/NCM
      const cofinsValor = 0; // Será calculado baseado no produto/NCM
      
      return {
        produtoId: item.produtoId || null,
        codigo: item.codigo || '',
        nome: item.nome || '',
        quantidade,
        valorUnitario,
        valorDesconto,
        valorTotal: valorTotalItem,
        icms: {
          base: icmsBase,
          aliquota: icmsAliquota,
          valor: icmsValor,
          cst: item.icmsCST || ''
        },
        icmsSt: {
          base: icmsStBase,
          aliquota: icmsStAliquota,
          valor: icmsStValor,
          cst: configNatureza?.icmsStCST || '',
          mva: configNatureza?.icmsStMva || 0
        },
        ipi: {
          aliquota: ipiAliquota,
          valor: ipiValor,
          cst: configNatureza?.ipiCST || '',
          classe: configNatureza?.ipiClasse || '',
          codigo: configNatureza?.ipiCodigo || ''
        },
        pis: {
          aliquota: pisAliquota,
          valor: pisValor,
          cst: item.pisCST || ''
        },
        cofins: {
          aliquota: cofinsAliquota,
          valor: cofinsValor,
          cst: item.cofinsCST || ''
        },
        cbenef: item.cbenef || null
      };
    });

    // Calcular totais
    const totalProdutos = itensCalculados.reduce((sum: number, item: any) => 
      sum + (item.quantidade * item.valorUnitario), 0
    );
    
    const totalDescontos = itensCalculados.reduce((sum: number, item: any) => 
      sum + item.valorDesconto, 0
    );
    
    const totalImpostos = itensCalculados.reduce((sum: number, item: any) => 
      sum + item.icms.valor + item.icmsSt.valor + item.ipi.valor + item.pis.valor + item.cofins.valor, 0
    );

    // Calcular total geral
    let totalGeral = totalProdutos - totalDescontos + totalImpostos;
    
    // Adicionar despesas
    if (despesas) {
      totalGeral += Number(despesas);
    }
    
    // Adicionar frete se incluído
    if (incluirFreteTotal && valorFrete) {
      totalGeral += Number(valorFrete);
    }

    return NextResponse.json({
      success: true,
      itens: itensCalculados,
      totais: {
        totalProdutos,
        totalDescontos,
        totalImpostos,
        totalGeral
      },
      configuracao: configNatureza || null
    });

  } catch (error: any) {
    console.error('❌ Erro ao calcular impostos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno ao calcular impostos'
      },
      { status: 500 }
    );
  }
}





