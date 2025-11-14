import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';
import { subDays, startOfMonth, endOfMonth, format } from 'date-fns';

/**
 * GET /api/compras/dashboard
 * 
 * Retorna dados do dashboard de compras com informações consolidadas
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

    // Primeiro, verificar se há compras no banco SEM filtro de data
    let comprasExistentesQuery;
    try {
      comprasExistentesQuery = await query(`
        SELECT 
          COUNT(*) as total_compras,
          MIN("dataEmissao") as primeira_compra,
          MAX("dataEmissao") as ultima_compra,
          array_agg(DISTINCT status) as status_disponiveis
        FROM pedidos_compra
        WHERE "companyId" = $1::uuid
      `, [company_id]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao verificar compras existentes:', sqlError);
      comprasExistentesQuery = { rows: [{ total_compras: 0, primeira_compra: null, ultima_compra: null, status_disponiveis: [] }] };
    }

    const comprasExistentes = comprasExistentesQuery.rows[0];
    console.log('[Dashboard Compras] Compras existentes no banco:', {
      total: comprasExistentes.total_compras,
      primeira: comprasExistentes.primeira_compra,
      ultima: comprasExistentes.ultima_compra,
      status: comprasExistentes.status_disponiveis
    });

    // Verificar especificamente o pedido 123 para diagnóstico
    try {
      const pedido123Query = await query(`
        SELECT 
          id, numero, "dataEmissao", status, "totalGeral", "companyId"
        FROM pedidos_compra
        WHERE "companyId" = $1::uuid
          AND (numero = '123' OR numero LIKE '%123%')
        ORDER BY "dataEmissao" DESC
        LIMIT 5
      `, [company_id]);
      console.log('[Dashboard Compras] Pedidos com número 123 encontrados:', pedido123Query.rows);
      
      // Verificar se o pedido 123 está dentro do período que será buscado (depois do cálculo do período)
      if (pedido123Query.rows.length > 0 && comprasExistentes.ultima_compra) {
        const pedido123 = pedido123Query.rows[0];
        console.log('[Dashboard Compras] Pedido 123 detalhes:', {
          numero: pedido123.numero,
          dataEmissao: pedido123.dataEmissao,
          status: pedido123.status,
          totalGeral: pedido123.totalGeral,
          companyId: pedido123.companyId
        });
      }
    } catch (e) {
      console.warn('[Dashboard Compras] Erro ao buscar pedido 123:', e);
    }

    // Calcular períodos baseado nos parâmetros ou usar padrão (90 dias ou desde a primeira compra)
    const hoje = new Date();
    let dataInicioPeriodo: Date;
    let dataFimPeriodo: Date = hoje;

    if (dataInicio && dataFim) {
      // Parse seguro de datas no formato YYYY-MM-DD (evita problemas de timezone)
      const [anoInicio, mesInicio, diaInicio] = dataInicio.split('-').map(Number);
      const [anoFim, mesFim, diaFim] = dataFim.split('-').map(Number);
      
      // Criar datas em UTC para evitar problemas de timezone
      dataInicioPeriodo = new Date(Date.UTC(anoInicio, mesInicio - 1, diaInicio, 0, 0, 0, 0));
      dataFimPeriodo = new Date(Date.UTC(anoFim, mesFim - 1, diaFim, 23, 59, 59, 999));
      
      console.log('[Dashboard Compras] Datas recebidas do frontend:', {
        dataInicioRecebida: dataInicio,
        dataFimRecebida: dataFim,
        dataInicioProcessada: dataInicioPeriodo.toISOString(),
        dataFimProcessada: dataFimPeriodo.toISOString()
      });
    } else {
      // Padrão: últimos 90 dias ou desde a primeira compra (o que for mais antigo)
      const noventaDiasAtras = subDays(hoje, 90);
      noventaDiasAtras.setHours(0, 0, 0, 0);
      
      let primeiraCompra: Date | null = null;
      if (comprasExistentes.primeira_compra) {
        primeiraCompra = new Date(comprasExistentes.primeira_compra);
        primeiraCompra.setHours(0, 0, 0, 0);
      }
      
      // Se houver compras, usar a data mais antiga entre 90 dias atrás e a primeira compra
      // Se não houver compras, usar apenas 90 dias atrás
      if (primeiraCompra) {
        dataInicioPeriodo = primeiraCompra < noventaDiasAtras ? primeiraCompra : noventaDiasAtras;
      } else {
        dataInicioPeriodo = noventaDiasAtras;
      }
      
      // Garantir que a data de início não seja no futuro
      if (dataInicioPeriodo > hoje) {
        dataInicioPeriodo = new Date(hoje);
        dataInicioPeriodo.setHours(0, 0, 0, 0);
      }
      
      // Data fim sempre deve ser hoje (incluindo o dia todo)
      dataFimPeriodo = new Date(hoje);
      dataFimPeriodo.setHours(23, 59, 59, 999);
    }

    console.log('[Dashboard Compras] Período de busca FINAL:', {
      inicio: dataInicioPeriodo.toISOString(),
      fim: dataFimPeriodo.toISOString(),
      inicioFormatado: format(dataInicioPeriodo, 'yyyy-MM-dd'),
      fimFormatado: format(dataFimPeriodo, 'yyyy-MM-dd'),
      diasNoPeriodo: Math.ceil((dataFimPeriodo.getTime() - dataInicioPeriodo.getTime()) / (1000 * 60 * 60 * 24)),
      primeiraCompraEncontrada: comprasExistentes.primeira_compra,
      ultimaCompraEncontrada: comprasExistentes.ultima_compra,
      totalComprasNoBanco: comprasExistentes.total_compras,
      dataInicioRecebida: dataInicio || 'não fornecida',
      dataFimRecebida: dataFim || 'não fornecida'
    });

    // VALIDAÇÃO: Buscar TODOS os pedidos sem filtro de data para comparar
    try {
      const todosPedidosQuery = await query(`
        SELECT 
          COUNT(*) as total,
          array_agg(numero ORDER BY "createdAt" DESC) FILTER (WHERE numero IS NOT NULL) as numeros
        FROM pedidos_compra
        WHERE "companyId" = $1::uuid
      `, [company_id]);
      console.log('[Dashboard Compras] VALIDAÇÃO - Total de pedidos no banco (SEM filtro de data):', {
        total: todosPedidosQuery.rows[0]?.total || 0,
        numeros: todosPedidosQuery.rows[0]?.numeros?.slice(0, 10) || []
      });
    } catch (e) {
      console.warn('[Dashboard Compras] Erro ao validar total de pedidos:', e);
    }

    // Construir filtro de status baseado no parâmetro
    let statusFilter = '';
    if (filtroStatus === 'entregue') {
      statusFilter = "AND status IN ('entregue', 'faturado')";
    } else if (filtroStatus === 'rascunho') {
      statusFilter = "AND status = 'rascunho'";
    } else {
      // 'todos' - excluir apenas cancelados
      statusFilter = "AND status != 'cancelado'";
    }

    // VALIDAÇÃO: Buscar pedidos específicos do período para confirmar
    try {
      const pedidosNoPeriodoQuery = await query(`
        SELECT 
          numero,
          "dataEmissao",
          status,
          "totalGeral",
          "createdAt"
        FROM pedidos_compra
        WHERE "companyId" = $1::uuid
          AND "dataEmissao" >= $2::date
          AND "dataEmissao" <= $3::date
        ORDER BY "dataEmissao" DESC, "createdAt" DESC
        LIMIT 10
      `, [company_id, format(dataInicioPeriodo, 'yyyy-MM-dd'), format(dataFimPeriodo, 'yyyy-MM-dd')]);
      console.log('[Dashboard Compras] VALIDAÇÃO - Pedidos no período (exemplos):', pedidosNoPeriodoQuery.rows);
    } catch (e) {
      console.warn('[Dashboard Compras] Erro ao validar pedidos no período:', e);
    }

    // 1. Total de compras no período - PRIMEIRO verificar SEM filtro de status
    let comprasTotalQuery;
    try {
      comprasTotalQuery = await query(`
        SELECT 
          COUNT(*) as total_todas,
          COUNT(CASE WHEN status NOT IN ('cancelado', 'rascunho') THEN 1 END) as total_validas,
          array_agg(DISTINCT status) as status_disponiveis
        FROM pedidos_compra
        WHERE "companyId" = $1::uuid
          AND "dataEmissao" >= $2::date
          AND "dataEmissao" <= $3::date
      `, [company_id, format(dataInicioPeriodo, 'yyyy-MM-dd'), format(dataFimPeriodo, 'yyyy-MM-dd')]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar total de compras:', sqlError);
      comprasTotalQuery = { rows: [{ total_todas: 0, total_validas: 0, status_disponiveis: [] }] };
    }

    console.log('[Dashboard Compras] Total de compras no período (sem filtro status):', comprasTotalQuery.rows[0]);
    console.log('[Dashboard Compras] Status encontrados:', comprasTotalQuery.rows[0]?.status_disponiveis);
    
    // VALIDAÇÃO: Verificar se o pedido 123 está sendo contado
    if (comprasTotalQuery.rows[0]?.status_disponiveis?.includes('rascunho')) {
      console.log('[Dashboard Compras] ✅ Status rascunho encontrado no período');
    } else {
      console.warn('[Dashboard Compras] ⚠️ Status rascunho NÃO encontrado no período');
    }

    // 1. Total de compras no período - INCLUIR rascunhos também para ver todos os dados
    let comprasPeriodoQuery;
    try {
      comprasPeriodoQuery = await query(`
        SELECT 
          COUNT(*) as total_compras,
          COALESCE(SUM("totalGeral"), 0) as valor_total_compras,
          COALESCE(SUM("totalProdutos"), 0) as valor_produtos,
          COUNT(*) FILTER (WHERE status = 'rascunho') as total_rascunho,
          COUNT(*) FILTER (WHERE status = 'pendente') as total_pendente,
          COUNT(*) FILTER (WHERE status = 'entregue') as total_entregue,
          COUNT(*) FILTER (WHERE status = 'faturado') as total_faturado
        FROM pedidos_compra
        WHERE "companyId" = $1::uuid
          AND "dataEmissao" >= $2::date
          AND "dataEmissao" <= $3::date
          ${statusFilter}
      `, [company_id, format(dataInicioPeriodo, 'yyyy-MM-dd'), format(dataFimPeriodo, 'yyyy-MM-dd')]);
      
      console.log('[Dashboard Compras] Compras no período (com status):', comprasPeriodoQuery.rows[0]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar compras do período:', sqlError);
      comprasPeriodoQuery = { rows: [{ total_compras: 0, valor_total_compras: 0, valor_produtos: 0, total_rascunho: 0, total_pendente: 0, total_entregue: 0, total_faturado: 0 }] };
    }

    // 1b. Estatísticas de compras por status (INCLUIR rascunhos)
    let estatisticasComprasQuery;
    try {
      estatisticasComprasQuery = await query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'rascunho') as compras_rascunho,
          COUNT(*) FILTER (WHERE status = 'pendente') as compras_pendentes,
          COUNT(*) FILTER (WHERE status = 'entregue') as compras_entregues,
          COUNT(*) FILTER (WHERE status = 'faturado') as compras_faturadas,
          COUNT(*) FILTER (WHERE status = 'cancelado') as compras_canceladas,
          COALESCE(SUM("totalGeral") FILTER (WHERE status = 'entregue'), 0) as valor_entregues,
          COALESCE(SUM("totalGeral") FILTER (WHERE status = 'faturado'), 0) as valor_faturadas,
          COALESCE(SUM("totalGeral") FILTER (WHERE status = 'pendente'), 0) as valor_pendentes,
          COALESCE(SUM("totalGeral") FILTER (WHERE status = 'rascunho'), 0) as valor_rascunho
        FROM pedidos_compra
        WHERE "companyId" = $1::uuid
          AND "dataEmissao" >= $2::date
          AND "dataEmissao" <= $3::date
      `, [company_id, format(dataInicioPeriodo, 'yyyy-MM-dd'), format(dataFimPeriodo, 'yyyy-MM-dd')]);
      
      console.log('[Dashboard Compras] Estatísticas por status:', estatisticasComprasQuery.rows[0]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar estatísticas de compras:', sqlError);
      estatisticasComprasQuery = { rows: [{ compras_rascunho: 0, compras_pendentes: 0, compras_entregues: 0, compras_faturadas: 0, compras_canceladas: 0, valor_entregues: 0, valor_faturadas: 0, valor_pendentes: 0, valor_rascunho: 0 }] };
    }

    const comprasPeriodo = comprasPeriodoQuery.rows[0];
    const totalComprasPeriodo = parseInt(comprasPeriodo?.total_compras || '0') || 0;
    const valorTotalComprasPeriodo = parseFloat(comprasPeriodo?.valor_total_compras || '0') || 0;
    const valorProdutosPeriodo = parseFloat(comprasPeriodo?.valor_produtos || '0') || 0;

    const estatisticasCompras = estatisticasComprasQuery.rows[0];
    const comprasRascunho = parseInt(estatisticasCompras?.compras_rascunho || '0') || 0;
    const comprasPendentes = parseInt(estatisticasCompras?.compras_pendentes || '0') || 0;
    const comprasEntregues = parseInt(estatisticasCompras?.compras_entregues || '0') || 0;
    const comprasFaturadas = parseInt(estatisticasCompras?.compras_faturadas || '0') || 0;
    const valorEntregues = parseFloat(estatisticasCompras?.valor_entregues || '0') || 0;
    const valorFaturadas = parseFloat(estatisticasCompras?.valor_faturadas || '0') || 0;
    
    // Compras pendentes incluem rascunhos para o dashboard
    const comprasPendentesComRascunho = comprasPendentes + comprasRascunho;

    console.log('[Dashboard Compras] Total de compras no período:', totalComprasPeriodo);
    console.log('[Dashboard Compras] Valor total de compras:', valorTotalComprasPeriodo);
    console.log('[Dashboard Compras] Período:', dataInicioPeriodo, 'até', dataFimPeriodo);
    console.log('[Dashboard Compras] Pendentes:', comprasPendentes, 'Rascunhos:', comprasRascunho, 'Entregues:', comprasEntregues, 'Faturadas:', comprasFaturadas);
    console.log('[Dashboard Compras] Pendentes (com rascunho):', comprasPendentesComRascunho);

    // Calcular dias no período para média diária
    const diasPeriodo = Math.max(1, Math.ceil((dataFimPeriodo.getTime() - dataInicioPeriodo.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const mediaComprasDiaria = diasPeriodo > 0 ? totalComprasPeriodo / diasPeriodo : 0;

    // 2. Gráfico de compras por status
    let graficoComprasPorStatusQuery;
    try {
      graficoComprasPorStatusQuery = await query(`
        SELECT 
          "dataEmissao" as data,
          COUNT(*) FILTER (WHERE status != 'cancelado') as quantidade,
          COUNT(*) FILTER (WHERE status = 'pendente') as quantidade_pendentes,
          COUNT(*) FILTER (WHERE status = 'entregue') as quantidade_entregues,
          COUNT(*) FILTER (WHERE status = 'faturado') as quantidade_faturadas,
          COUNT(*) FILTER (WHERE status = 'rascunho') as quantidade_rascunho,
          COALESCE(SUM("totalGeral") FILTER (WHERE status != 'cancelado'), 0) as valor_total
        FROM pedidos_compra
        WHERE "companyId" = $1::uuid
          AND "dataEmissao" >= $2::date
          AND "dataEmissao" <= $3::date
          ${statusFilter}
        GROUP BY "dataEmissao"
        ORDER BY "dataEmissao" ASC
      `, [company_id, format(dataInicioPeriodo, 'yyyy-MM-dd'), format(dataFimPeriodo, 'yyyy-MM-dd')]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar gráfico de compras por status:', sqlError);
      graficoComprasPorStatusQuery = { rows: [] };
    }

    const graficoComprasPorStatus = graficoComprasPorStatusQuery.rows.map((row: any) => ({
      data: format(new Date(row.data), 'dd/MM'),
      quantidade: parseInt(row.quantidade || '0') || 0,
      quantidadePendentes: parseInt(row.quantidade_pendentes || '0') || 0,
      quantidadeEntregues: parseInt(row.quantidade_entregues || '0') || 0,
      quantidadeFaturadas: parseInt(row.quantidade_faturadas || '0') || 0,
      quantidadeRascunho: parseInt(row.quantidade_rascunho || '0') || 0,
      valorTotal: parseFloat(row.valor_total || '0') || 0
    }));

    console.log('[Dashboard Compras] Dados do gráfico de compras por status:', graficoComprasPorStatus.length, 'registros');

    // 3. Compras do período (para gráfico)
    let graficoComprasQuery;
    try {
      graficoComprasQuery = await query(`
        SELECT 
          "dataEmissao" as data,
          COUNT(*) as quantidade,
          COALESCE(SUM("totalGeral"), 0) as valor_total
        FROM pedidos_compra
        WHERE "companyId" = $1::uuid
          AND "dataEmissao" >= $2::date
          AND "dataEmissao" <= $3::date
          ${statusFilter}
        GROUP BY "dataEmissao"
        ORDER BY "dataEmissao" ASC
      `, [company_id, format(dataInicioPeriodo, 'yyyy-MM-dd'), format(dataFimPeriodo, 'yyyy-MM-dd')]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar gráfico de compras:', sqlError);
      graficoComprasQuery = { rows: [] };
    }

    const graficoCompras = graficoComprasQuery.rows.map((row: any) => ({
      data: format(new Date(row.data), 'dd/MM'),
      quantidade: parseInt(row.quantidade || '0') || 0,
      valorTotal: parseFloat(row.valor_total || '0') || 0
    }));

    console.log('[Dashboard Compras] Registros no gráfico de compras:', graficoCompras.length);

    // 4. Top fornecedores do período
    let topFornecedoresQuery;
    try {
      topFornecedoresQuery = await query(`
        SELECT 
          c.id,
          COALESCE(c."nomeRazaoSocial", c."nomeFantasia", 'Fornecedor sem nome') as nome,
          COUNT(pc.id) as total_compras,
          COALESCE(SUM(pc."totalGeral"), 0) as valor_total
        FROM pedidos_compra pc
        INNER JOIN cadastros c ON pc."fornecedorId" = c.id
        WHERE pc."companyId" = $1::uuid
          AND pc."dataEmissao" >= $2::date
          AND pc."dataEmissao" <= $3::date
          AND pc.status != 'cancelado'
        GROUP BY c.id, c."nomeRazaoSocial", c."nomeFantasia"
        ORDER BY valor_total DESC
        LIMIT 10
      `, [company_id, format(dataInicioPeriodo, 'yyyy-MM-dd'), format(dataFimPeriodo, 'yyyy-MM-dd')]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar top fornecedores:', sqlError);
      topFornecedoresQuery = { rows: [] };
    }

    const topFornecedores = topFornecedoresQuery.rows.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      totalCompras: parseInt(row.total_compras || 0),
      valorTotal: parseFloat(row.valor_total || 0)
    }));

    // 5. Top produtos comprados do período - agrupa por ID do produto
    let topProdutosQuery;
    try {
      topProdutosQuery = await query(`
        SELECT 
          pvi."produtoId" as id,
          MAX(pvi.codigo) as codigo,
          MAX(pvi.nome) as nome,
          COALESCE(SUM(pvi.quantidade), 0) as quantidade_total,
          COALESCE(SUM(pvi."totalItem"), 0) as valor_total
        FROM pedidos_compra_itens pvi
        INNER JOIN pedidos_compra pv ON pvi."pedidoCompraId" = pv.id
        WHERE pv."companyId" = $1::uuid
          AND pvi."produtoId" IS NOT NULL
          AND pv."dataEmissao" >= $2::date
          AND pv."dataEmissao" <= $3::date
          AND pv.status != 'cancelado'
        GROUP BY pvi."produtoId"
        ORDER BY valor_total DESC
        LIMIT 10
      `, [company_id, format(dataInicioPeriodo, 'yyyy-MM-dd'), format(dataFimPeriodo, 'yyyy-MM-dd')]);
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

    // 6. Compras por comprador do período
    let comprasPorCompradorQuery;
    try {
      comprasPorCompradorQuery = await query(`
        SELECT 
          c.id,
          COALESCE(c."nomeRazaoSocial", c."nomeFantasia", 'Sem comprador') as nome,
          COUNT(pc.id) as total_compras,
          COALESCE(SUM(pc."totalGeral"), 0) as valor_total
        FROM pedidos_compra pc
        LEFT JOIN cadastros c ON pc."compradorId" = c.id
        WHERE pc."companyId" = $1::uuid
          AND pc."dataEmissao" >= $2::date
          AND pc."dataEmissao" <= $3::date
          AND pc.status != 'cancelado'
        GROUP BY c.id, c."nomeRazaoSocial", c."nomeFantasia"
        ORDER BY valor_total DESC
        LIMIT 10
      `, [company_id, format(dataInicioPeriodo, 'yyyy-MM-dd'), format(dataFimPeriodo, 'yyyy-MM-dd')]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar compras por comprador:', sqlError);
      comprasPorCompradorQuery = { rows: [] };
    }

    const comprasPorComprador = comprasPorCompradorQuery.rows.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      totalCompras: parseInt(row.total_compras || 0),
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
            WHEN "dataEmissao" >= $2::date AND "dataEmissao" <= $3::date THEN 'atual'
            WHEN "dataEmissao" >= $4::date AND "dataEmissao" <= $5::date THEN 'anterior'
          END as periodo,
          COUNT(*) as total_compras,
          COALESCE(SUM("totalGeral"), 0) as valor_total
        FROM pedidos_compra
        WHERE "companyId" = $1::uuid
          AND (
            ("dataEmissao" >= $2::date AND "dataEmissao" <= $3::date)
            OR ("dataEmissao" >= $4::date AND "dataEmissao" <= $5::date)
          )
          AND status != 'cancelado'
        GROUP BY periodo
      `, [
        company_id, 
        format(dataInicioPeriodo, 'yyyy-MM-dd'), 
        format(dataFimPeriodo, 'yyyy-MM-dd'), 
        format(periodoAnteriorInicio, 'yyyy-MM-dd'), 
        format(periodoAnteriorFim, 'yyyy-MM-dd')
      ]);
    } catch (sqlError: any) {
      console.error('❌ Erro SQL ao buscar comparativo:', sqlError);
      comparativoQuery = { rows: [] };
    }

    const comparativo = {
      atual: {
        totalCompras: 0,
        valorTotal: 0
      },
      anterior: {
        totalCompras: 0,
        valorTotal: 0
      }
    };

    comparativoQuery.rows.forEach((row: any) => {
      if (row.periodo === 'atual') {
        comparativo.atual.totalCompras = parseInt(row.total_compras || 0);
        comparativo.atual.valorTotal = parseFloat(row.valor_total || 0);
      } else if (row.periodo === 'anterior') {
        comparativo.anterior.totalCompras = parseInt(row.total_compras || 0);
        comparativo.anterior.valorTotal = parseFloat(row.valor_total || 0);
      }
    });

    const variacaoCompras = comparativo.anterior.totalCompras > 0 
      ? ((comparativo.atual.totalCompras - comparativo.anterior.totalCompras) / comparativo.anterior.totalCompras) * 100
      : 0;
    
    const variacaoValor = comparativo.anterior.valorTotal > 0
      ? ((comparativo.atual.valorTotal - comparativo.anterior.valorTotal) / comparativo.anterior.valorTotal) * 100
      : 0;

    // Taxa de entrega (compras entregues / total compras)
    const taxaEntrega = totalComprasPeriodo > 0 
      ? (comprasEntregues / totalComprasPeriodo) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalComprasPeriodo,
          valorTotalComprasPeriodo,
          comprasPendentes: comprasPendentesComRascunho, // Incluir rascunhos como pendentes
          comprasEntregues,
          comprasFaturadas,
          valorEntregues,
          valorFaturadas,
          mediaComprasDiaria: parseFloat(mediaComprasDiaria.toFixed(2)),
          taxaEntrega: parseFloat(taxaEntrega.toFixed(2)),
          variacaoCompras: parseFloat(variacaoCompras.toFixed(2)),
          variacaoValor: parseFloat(variacaoValor.toFixed(2))
        },
        graficoComprasPorStatus,
        graficoCompras,
        topFornecedores,
        topProdutos,
        comprasPorComprador,
        comparativo
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar dashboard de compras:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}
