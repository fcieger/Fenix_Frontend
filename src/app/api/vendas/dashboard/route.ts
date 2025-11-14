import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';
import { subDays, startOfMonth, endOfMonth, format } from 'date-fns';

/**
 * GET /api/vendas/dashboard
 * 
 * Retorna dados do dashboard de vendas com informações consolidadas
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
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const filtroStatus = searchParams.get('filtroStatus') || 'todos';
    
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

    // Calcular períodos baseado nos parâmetros ou usar padrão (30 dias)
    const hoje = new Date();
    let dataInicioPeriodo: Date;
    let dataFimPeriodo: Date = hoje;

    if (dataInicio && dataFim) {
      dataInicioPeriodo = new Date(dataInicio);
      dataFimPeriodo = new Date(dataFim);
    } else {
      // Padrão: últimos 30 dias
      dataInicioPeriodo = subDays(hoje, 30);
      dataFimPeriodo = hoje;
    }

    // Construir filtro de status baseado no parâmetro
    let statusFilter = '';
    if (filtroStatus === 'entregue') {
      statusFilter = "AND status IN ('entregue', 'enviado')";
    } else if (filtroStatus === 'rascunho') {
      statusFilter = "AND status = 'rascunho'";
    } else {
      // 'todos' - excluir apenas cancelados
      statusFilter = "AND status != 'cancelado'";
    }

    // 1. Total de vendas no período
    let vendasPeriodoQuery;
    try {
      vendasPeriodoQuery = await query(`
        SELECT 
          COUNT(*) as total_vendas,
          COALESCE(SUM("totalGeral"), 0) as valor_total_vendas,
          COALESCE(SUM("totalProdutos"), 0) as valor_produtos
        FROM pedidos_venda
        WHERE "companyId" = $1::uuid
          AND DATE("dataEmissao") >= $2::date
          AND DATE("dataEmissao") <= $3::date
          ${statusFilter}
      `, [company_id, dataInicioPeriodo, dataFimPeriodo]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar vendas do período:', sqlError);
      // Se a tabela não existir, retornar valores zerados
      vendasPeriodoQuery = { rows: [{ total_vendas: 0, valor_total_vendas: 0, valor_produtos: 0 }] };
    }

    // 1b. Total de orçamentos no período
    let orcamentosPeriodoQuery;
    try {
      orcamentosPeriodoQuery = await query(`
        SELECT 
          COUNT(*) as total_orcamentos,
          COALESCE(SUM("totalGeral"), 0) as valor_total_orcamentos
        FROM orcamentos
        WHERE "companyId" = $1::uuid
          AND DATE("dataEmissao") >= $2::date
          AND DATE("dataEmissao") <= $3::date
      `, [company_id, dataInicioPeriodo, dataFimPeriodo]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar orçamentos do período:', sqlError);
      // Se a tabela não existir, retornar valores zerados
      orcamentosPeriodoQuery = { rows: [{ total_orcamentos: 0, valor_total_orcamentos: 0 }] };
    }

    const vendasPeriodo = vendasPeriodoQuery.rows[0];
    const totalVendasPeriodo = parseInt(vendasPeriodo?.total_vendas || 0);
    const valorTotalVendasPeriodo = parseFloat(vendasPeriodo?.valor_total_vendas || 0);
    const valorProdutosPeriodo = parseFloat(vendasPeriodo?.valor_produtos || 0);

    const orcamentosPeriodo = orcamentosPeriodoQuery.rows[0];
    const totalOrcamentosPeriodo = parseInt(orcamentosPeriodo?.total_orcamentos || 0);
    const valorTotalOrcamentosPeriodo = parseFloat(orcamentosPeriodo?.valor_total_orcamentos || 0);

    // Calcular dias no período para média diária
    const diasPeriodo = Math.max(1, Math.ceil((dataFimPeriodo.getTime() - dataInicioPeriodo.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const mediaVendasDiaria = diasPeriodo > 0 ? totalVendasPeriodo / diasPeriodo : 0;

    // 2. Orçamentos do período (para gráfico)
    let graficoOrcamentosQuery;
    try {
      graficoOrcamentosQuery = await query(`
        SELECT 
          DATE("dataEmissao") as data,
          COUNT(*) as quantidade,
          COALESCE(SUM("totalGeral"), 0) as valor_total,
          COUNT(CASE WHEN status = 'concluido' THEN 1 END) as quantidade_concluidos,
          COUNT(CASE WHEN status = 'pendente' THEN 1 END) as quantidade_pendentes
        FROM orcamentos
        WHERE "companyId" = $1::uuid
          AND DATE("dataEmissao") >= $2::date
          AND DATE("dataEmissao") <= $3::date
        GROUP BY DATE("dataEmissao")
        ORDER BY DATE("dataEmissao") ASC
      `, [company_id, dataInicioPeriodo, dataFimPeriodo]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar gráfico de orçamentos:', sqlError);
      graficoOrcamentosQuery = { rows: [] };
    }

    const graficoOrcamentos = graficoOrcamentosQuery.rows.map((row: any) => ({
      data: format(new Date(row.data), 'dd/MM'),
      quantidade: parseInt(row.quantidade || 0),
      valorTotal: parseFloat(row.valor_total || 0),
      quantidadeConcluidos: parseInt(row.quantidade_concluidos || 0),
      quantidadePendentes: parseInt(row.quantidade_pendentes || 0)
    }));

    // 3. Vendas do período (para gráfico)
    let graficoVendasQuery;
    try {
      graficoVendasQuery = await query(`
        SELECT 
          DATE("dataEmissao") as data,
          COUNT(*) as quantidade,
          COALESCE(SUM("totalGeral"), 0) as valor_total
        FROM pedidos_venda
        WHERE "companyId" = $1::uuid
          AND DATE("dataEmissao") >= $2::date
          AND DATE("dataEmissao") <= $3::date
          ${statusFilter}
        GROUP BY DATE("dataEmissao")
        ORDER BY DATE("dataEmissao") ASC
      `, [company_id, dataInicioPeriodo, dataFimPeriodo]);
      
      console.log('[Dashboard Vendas] Resultado da query de vendas:', {
        totalRows: graficoVendasQuery.rows.length,
        periodo: { inicio: dataInicioPeriodo, fim: dataFimPeriodo },
        rows: graficoVendasQuery.rows
      });
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar gráfico de vendas:', sqlError);
      graficoVendasQuery = { rows: [] };
    }

    const graficoVendas = graficoVendasQuery.rows.map((row: any) => ({
      data: format(new Date(row.data), 'dd/MM'),
      quantidade: parseInt(row.quantidade || 0),
      valorTotal: parseFloat(row.valor_total || 0)
    }));
    
    console.log('[Dashboard Vendas] Gráfico de vendas final:', graficoVendas);

    // 4. Top clientes do período
    let topClientesQuery;
    try {
      topClientesQuery = await query(`
        SELECT 
          c.id,
          COALESCE(c."nomeRazaoSocial", c."nomeFantasia", 'Cliente sem nome') as nome,
          COUNT(pv.id) as total_vendas,
          COALESCE(SUM(pv."totalGeral"), 0) as valor_total
        FROM pedidos_venda pv
        INNER JOIN cadastros c ON pv."clienteId" = c.id
        WHERE pv."companyId" = $1::uuid
          AND DATE(pv."dataEmissao") >= $2::date
          AND DATE(pv."dataEmissao") <= $3::date
          ${statusFilter}
        GROUP BY c.id, c."nomeRazaoSocial", c."nomeFantasia"
        ORDER BY valor_total DESC
        LIMIT 10
      `, [company_id, dataInicioPeriodo, dataFimPeriodo]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar top clientes:', sqlError);
      topClientesQuery = { rows: [] };
    }

    const topClientes = topClientesQuery.rows.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      totalVendas: parseInt(row.total_vendas || 0),
      valorTotal: parseFloat(row.valor_total || 0)
    }));

    // 5. Top produtos vendidos do período - agrupa por ID do produto
    let topProdutosQuery;
    try {
      topProdutosQuery = await query(`
        SELECT 
          pvi."produtoId" as id,
          MAX(pvi.codigo) as codigo,
          MAX(pvi.nome) as nome,
          COALESCE(SUM(pvi.quantidade), 0) as quantidade_total,
          COALESCE(SUM(pvi."totalItem"), 0) as valor_total
        FROM pedidos_venda_itens pvi
        INNER JOIN pedidos_venda pv ON pvi."pedidoVendaId" = pv.id
        WHERE pv."companyId" = $1::uuid
          AND pvi."produtoId" IS NOT NULL
          AND DATE(pv."dataEmissao") >= $2::date
          AND DATE(pv."dataEmissao") <= $3::date
          ${statusFilter}
        GROUP BY pvi."produtoId"
        ORDER BY valor_total DESC
        LIMIT 10
      `, [company_id, dataInicioPeriodo, dataFimPeriodo]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar top produtos:', sqlError);
      topProdutosQuery = { rows: [] };
    }

    const topProdutos = topProdutosQuery.rows.map((row: any, index: number) => ({
      id: row.id || `produto-${index}`,
      codigo: row.codigo || '',
      nome: row.nome || 'Produto sem nome',
      quantidadeTotal: parseFloat(row.quantidade_total || 0),
      valorTotal: parseFloat(row.valor_total || 0)
    }));

    // 6. Vendas por vendedor do período
    let vendasPorVendedorQuery;
    try {
      vendasPorVendedorQuery = await query(`
        SELECT 
          v.id,
          COALESCE(v."nomeRazaoSocial", v."nomeFantasia", 'Sem vendedor') as nome,
          COUNT(pv.id) as total_vendas,
          COALESCE(SUM(pv."totalGeral"), 0) as valor_total
        FROM pedidos_venda pv
        LEFT JOIN cadastros v ON pv."vendedorId" = v.id
        WHERE pv."companyId" = $1::uuid
          AND DATE(pv."dataEmissao") >= $2::date
          AND DATE(pv."dataEmissao") <= $3::date
          ${statusFilter}
        GROUP BY v.id, v."nomeRazaoSocial", v."nomeFantasia"
        ORDER BY valor_total DESC
        LIMIT 10
      `, [company_id, dataInicioPeriodo, dataFimPeriodo]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar vendas por vendedor:', sqlError);
      vendasPorVendedorQuery = { rows: [] };
    }

    const vendasPorVendedor = vendasPorVendedorQuery.rows.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      totalVendas: parseInt(row.total_vendas || 0),
      valorTotal: parseFloat(row.valor_total || 0)
    }));

    // 7. Comparativo: período atual vs período anterior (mesmo tamanho)
    const periodoAnteriorFim = subDays(dataInicioPeriodo, 1);
    const periodoAnteriorInicio = subDays(periodoAnteriorFim, diasPeriodo - 1);

    let comparativoQuery;
    try {
      comparativoQuery = await query(`
        SELECT 
          CASE 
            WHEN DATE("dataEmissao") >= $2::date AND DATE("dataEmissao") <= $3::date THEN 'atual'
            WHEN DATE("dataEmissao") >= $4::date AND DATE("dataEmissao") <= $5::date THEN 'anterior'
          END as periodo,
          COUNT(*) as total_vendas,
          COALESCE(SUM("totalGeral"), 0) as valor_total
        FROM pedidos_venda
        WHERE "companyId" = $1::uuid
          AND (
            (DATE("dataEmissao") >= $2::date AND DATE("dataEmissao") <= $3::date)
            OR (DATE("dataEmissao") >= $4::date AND DATE("dataEmissao") <= $5::date)
          )
          ${statusFilter}
        GROUP BY periodo
      `, [company_id, dataInicioPeriodo, dataFimPeriodo, periodoAnteriorInicio, periodoAnteriorFim]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar comparativo:', sqlError);
      comparativoQuery = { rows: [] };
    }

    const comparativo = {
      atual: {
        totalVendas: 0,
        valorTotal: 0
      },
      anterior: {
        totalVendas: 0,
        valorTotal: 0
      }
    };

    comparativoQuery.rows.forEach((row: any) => {
      if (row.periodo === 'atual') {
        comparativo.atual.totalVendas = parseInt(row.total_vendas || 0);
        comparativo.atual.valorTotal = parseFloat(row.valor_total || 0);
      } else if (row.periodo === 'anterior') {
        comparativo.anterior.totalVendas = parseInt(row.total_vendas || 0);
        comparativo.anterior.valorTotal = parseFloat(row.valor_total || 0);
      }
    });

    const variacaoVendas = comparativo.anterior.totalVendas > 0 
      ? ((comparativo.atual.totalVendas - comparativo.anterior.totalVendas) / comparativo.anterior.totalVendas) * 100
      : 0;
    
    const variacaoValor = comparativo.anterior.valorTotal > 0
      ? ((comparativo.atual.valorTotal - comparativo.anterior.valorTotal) / comparativo.anterior.valorTotal) * 100
      : 0;

    // Taxa de conversão (vendas / orçamentos)
    const taxaConversao = totalOrcamentosPeriodo > 0 
      ? (totalVendasPeriodo / totalOrcamentosPeriodo) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalVendasPeriodo,
          valorTotalVendasPeriodo,
          totalOrcamentosPeriodo,
          valorTotalOrcamentosPeriodo,
          mediaVendasDiaria: parseFloat(mediaVendasDiaria.toFixed(2)),
          taxaConversao: parseFloat(taxaConversao.toFixed(2)),
          variacaoVendas: parseFloat(variacaoVendas.toFixed(2)),
          variacaoValor: parseFloat(variacaoValor.toFixed(2))
        },
        graficoOrcamentos,
        graficoVendas,
        topClientes,
        topProdutos,
        vendasPorVendedor,
        comparativo
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar dashboard de vendas:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}
