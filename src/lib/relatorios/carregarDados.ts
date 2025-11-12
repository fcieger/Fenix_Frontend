/**
 * Funções auxiliares para carregar dados dos relatórios
 */

function construirQueryParams(baseParams: any, filtrosEspecificos?: any): string {
  const params = new URLSearchParams();
  
  // Adicionar parâmetros base
  Object.keys(baseParams).forEach(key => {
    if (baseParams[key] !== undefined && baseParams[key] !== null) {
      params.append(key, baseParams[key]);
    }
  });
  
  // Adicionar filtros específicos
  if (filtrosEspecificos) {
    Object.keys(filtrosEspecificos).forEach(key => {
      const value = filtrosEspecificos[key];
      if (value !== undefined && value !== null) {
        // Se for array, adicionar múltiplos parâmetros
        if (Array.isArray(value)) {
          value.forEach(item => {
            params.append(key, item);
          });
        } else {
          params.append(key, value);
        }
      }
    });
  }
  
  return params.toString();
}

export async function carregarDadosRelatorio(
  relatorioId: string,
  token: string,
  activeCompanyId: string,
  dataInicio: string,
  dataFim: string,
  filtrosEspecificos?: any
): Promise<any> {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    switch (relatorioId) {
      // ============ VENDAS ============
      case 'vendas-periodo':
        const vendasParams = construirQueryParams(
          { company_id: activeCompanyId, dataInicio, dataFim },
          filtrosEspecificos
        );
        const vendasRes = await fetch(
          `/api/vendas/dashboard?${vendasParams}`,
          { headers }
        );
        return vendasRes.ok ? await vendasRes.json() : null;

      case 'vendas-produtos':
        // Buscar vendas e agrupar por produto
        const vendasProdParams = construirQueryParams(
          { company_id: activeCompanyId, dataInicio, dataFim },
          filtrosEspecificos
        );
        const vendasProdRes = await fetch(
          `/api/pedidos-venda?${vendasProdParams}`,
          { headers }
        );
        if (vendasProdRes.ok) {
          const pedidos = await vendasProdRes.json();
          const produtosMap = new Map();
          
          pedidos.forEach((pedido: any) => {
            pedido.itens?.forEach((item: any) => {
              const produtoId = item.produto_id || item.produtoId;
              if (!produtosMap.has(produtoId)) {
                produtosMap.set(produtoId, {
                  id: produtoId,
                  nome: item.produto_nome || item.nome,
                  quantidade_vendida: 0,
                  valor_total: 0
                });
              }
              const produto = produtosMap.get(produtoId);
              produto.quantidade_vendida += item.quantidade || 0;
              produto.valor_total += (item.quantidade || 0) * (item.preco_unitario || 0);
            });
          });
          
          return { produtos: Array.from(produtosMap.values()) };
        }
        return null;

      case 'vendas-clientes':
        // Buscar vendas e agrupar por cliente
        const vendasCliParams = construirQueryParams(
          { company_id: activeCompanyId, dataInicio, dataFim },
          filtrosEspecificos
        );
        const vendasCliRes = await fetch(
          `/api/pedidos-venda?${vendasCliParams}`,
          { headers }
        );
        if (vendasCliRes.ok) {
          const pedidos = await vendasCliRes.json();
          const clientesMap = new Map();
          
          pedidos.forEach((pedido: any) => {
            const clienteId = pedido.cliente_id || pedido.clienteId;
            if (!clientesMap.has(clienteId)) {
              clientesMap.set(clienteId, {
                id: clienteId,
                nome: pedido.cliente?.nomeRazaoSocial || 'Cliente não identificado',
                quantidade_vendas: 0,
                valor_total: 0
              });
            }
            const cliente = clientesMap.get(clienteId);
            cliente.quantidade_vendas += 1;
            cliente.valor_total += parseFloat(pedido.totalGeral || pedido.valor_total || 0);
          });
          
          return { clientes: Array.from(clientesMap.values()) };
        }
        return null;

      case 'vendas-vendedores':
        // Buscar vendas e agrupar por vendedor
        const vendasVendParams = construirQueryParams(
          { company_id: activeCompanyId, dataInicio, dataFim },
          filtrosEspecificos
        );
        const vendasVendRes = await fetch(
          `/api/pedidos-venda?${vendasVendParams}`,
          { headers }
        );
        if (vendasVendRes.ok) {
          const pedidos = await vendasVendRes.json();
          const vendedoresMap = new Map();
          
          pedidos.forEach((pedido: any) => {
            const vendedorId = pedido.vendedor_id || pedido.vendedorId || 'sem-vendedor';
            if (!vendedoresMap.has(vendedorId)) {
              vendedoresMap.set(vendedorId, {
                id: vendedorId,
                nome: pedido.vendedor?.nomeRazaoSocial || 'Sem vendedor',
                quantidade_vendas: 0,
                valor_total: 0
              });
            }
            const vendedor = vendedoresMap.get(vendedorId);
            vendedor.quantidade_vendas += 1;
            vendedor.valor_total += parseFloat(pedido.totalGeral || pedido.valor_total || 0);
          });
          
          return { vendedores: Array.from(vendedoresMap.values()) };
        }
        return null;

      case 'orcamentos':
        const orcamentosParams = construirQueryParams(
          { company_id: activeCompanyId, dataInicio, dataFim },
          filtrosEspecificos
        );
        const orcamentosRes = await fetch(
          `/api/orcamentos?${orcamentosParams}`,
          { headers }
        );
        return orcamentosRes.ok ? await orcamentosRes.json() : null;

      // ============ COMPRAS ============
      case 'compras-periodo':
        const comprasParams = construirQueryParams(
          { company_id: activeCompanyId, dataInicio, dataFim },
          filtrosEspecificos
        );
        const comprasRes = await fetch(
          `/api/compras/dashboard?${comprasParams}`,
          { headers }
        );
        return comprasRes.ok ? await comprasRes.json() : null;

      case 'compras-fornecedores':
        const comprasFornParams = construirQueryParams(
          { company_id: activeCompanyId, dataInicio, dataFim },
          filtrosEspecificos
        );
        const comprasFornRes = await fetch(
          `/api/pedidos-compra?${comprasFornParams}`,
          { headers }
        );
        if (comprasFornRes.ok) {
          const pedidos = await comprasFornRes.json();
          const fornecedoresMap = new Map();
          
          pedidos.forEach((pedido: any) => {
            const fornecedorId = pedido.fornecedor_id || pedido.fornecedorId;
            if (!fornecedoresMap.has(fornecedorId)) {
              fornecedoresMap.set(fornecedorId, {
                id: fornecedorId,
                nome: pedido.fornecedor?.nomeRazaoSocial || 'Fornecedor não identificado',
                quantidade_compras: 0,
                valor_total: 0
              });
            }
            const fornecedor = fornecedoresMap.get(fornecedorId);
            fornecedor.quantidade_compras += 1;
            fornecedor.valor_total += parseFloat(pedido.totalGeral || pedido.valor_total || 0);
          });
          
          return { fornecedores: Array.from(fornecedoresMap.values()) };
        }
        return null;

      case 'compras-produtos':
        const comprasProdRes = await fetch(
          `/api/pedidos-compra?company_id=${activeCompanyId}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
          { headers }
        );
        if (comprasProdRes.ok) {
          const pedidos = await comprasProdRes.json();
          const produtosMap = new Map();
          
          pedidos.forEach((pedido: any) => {
            pedido.itens?.forEach((item: any) => {
              const produtoId = item.produto_id || item.produtoId;
              if (!produtosMap.has(produtoId)) {
                produtosMap.set(produtoId, {
                  id: produtoId,
                  nome: item.produto_nome || item.nome,
                  quantidade_comprada: 0,
                  valor_total: 0
                });
              }
              const produto = produtosMap.get(produtoId);
              produto.quantidade_comprada += item.quantidade || 0;
              produto.valor_total += (item.quantidade || 0) * (item.preco_unitario || 0);
            });
          });
          
          return { produtos: Array.from(produtosMap.values()) };
        }
        return null;

      case 'compras-pendentes':
        const comprasPendRes = await fetch(
          `/api/pedidos-compra?company_id=${activeCompanyId}&status=pendente`,
          { headers }
        );
        return comprasPendRes.ok ? { compras: await comprasPendRes.json() } : null;

      // ============ FINANCEIRO ============
      case 'financeiro-fluxo':
        const fluxoParams = construirQueryParams(
          { company_id: activeCompanyId, dataInicio, dataFim },
          {
            conta_id: filtrosEspecificos?.conta_id,
            forma_pagamento_id: filtrosEspecificos?.forma_pagamento_id,
            centro_custo_id: filtrosEspecificos?.centro_custo_id
          }
        );
        const fluxoRes = await fetch(
          `/api/fluxo-caixa?${fluxoParams}`,
          { headers }
        );
        return fluxoRes.ok ? await fluxoRes.json() : null;

      case 'financeiro-contas':
        const contasParams = construirQueryParams(
          { company_id: activeCompanyId },
          {
            status: filtrosEspecificos?.status,
            forma_pagamento_id: filtrosEspecificos?.forma_pagamento_id
          }
        );
        const [contasPagarRes, contasReceberRes] = await Promise.all([
          fetch(`/api/contas-pagar?${contasParams}`, { headers }),
          fetch(`/api/contas-receber?${contasParams}`, { headers })
        ]);
        
        const contasPagar = contasPagarRes.ok ? await contasPagarRes.json() : { data: [] };
        const contasReceber = contasReceberRes.ok ? await contasReceberRes.json() : { data: [] };
        
        return {
          contasPagar: contasPagar.data || [],
          contasReceber: contasReceber.data || []
        };

      case 'financeiro-dre':
        const dreRes = await fetch(
          `/api/financeiro/dre?company_id=${activeCompanyId}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
          { headers }
        );
        return dreRes.ok ? await dreRes.json() : null;

      case 'financeiro-bancos':
        const bancosRes = await fetch(
          `/api/contas?company_id=${activeCompanyId}`,
          { headers }
        );
        return bancosRes.ok ? await bancosRes.json() : null;

      case 'financeiro-formas-pagamento':
        const formasPagRes = await fetch(
          `/api/formas-pagamento?company_id=${activeCompanyId}`,
          { headers }
        );
        return formasPagRes.ok ? await formasPagRes.json() : null;

      case 'financeiro-centro-custo':
        const centrosCustoRes = await fetch(
          `/api/centros-custos?company_id=${activeCompanyId}`,
          { headers }
        );
        return centrosCustoRes.ok ? await centrosCustoRes.json() : null;

      // ============ ESTOQUE ============
      case 'estoque-saldos':
        const estoqueParams = construirQueryParams(
          { companyId: activeCompanyId },
          {
            produtoId: filtrosEspecificos?.produto_id,
            localId: filtrosEspecificos?.local_id
          }
        );
        const estoqueRes = await fetch(
          `/api/estoque/saldos?${estoqueParams}`,
          { headers }
        );
        if (estoqueRes.ok) {
          const result = await estoqueRes.json();
          console.log('📦 Dados de estoque carregados:', result);
          return result;
        }
        return null;

      case 'estoque-movimentacoes':
        const movimentacoesParams = construirQueryParams(
          { company_id: activeCompanyId, dataInicio, dataFim },
          {
            produto_id: filtrosEspecificos?.produto_id,
            local_id: filtrosEspecificos?.local_id
          }
        );
        const movimentacoesRes = await fetch(
          `/api/estoque/movimentos?${movimentacoesParams}`,
          { headers }
        );
        return movimentacoesRes.ok ? { movimentacoes: await movimentacoesRes.json() } : null;

      case 'estoque-kardex':
        const kardexRes = await fetch(
          `/api/estoque/kardex?company_id=${activeCompanyId}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
          { headers }
        );
        return kardexRes.ok ? await kardexRes.json() : null;

      case 'estoque-valorizado':
        const valorizadoRes = await fetch(
          `/api/estoque/valorizado?company_id=${activeCompanyId}`,
          { headers }
        );
        return valorizadoRes.ok ? await valorizadoRes.json() : null;

      case 'estoque-minimo':
        const minimoRes = await fetch(
          `/api/estoque/saldos?company_id=${activeCompanyId}&abaixo_minimo=true`,
          { headers }
        );
        return minimoRes.ok ? await minimoRes.json() : null;

      case 'estoque-inventario':
        const inventarioRes = await fetch(
          `/api/estoque/inventarios?company_id=${activeCompanyId}`,
          { headers }
        );
        return inventarioRes.ok ? await inventarioRes.json() : null;

      // ============ FISCAL ============
      case 'nfe-emitidas':
        const nfesRes = await fetch(
          `/api/nfe?company_id=${activeCompanyId}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
          { headers }
        );
        return nfesRes.ok ? { nfes: await nfesRes.json() } : null;

      case 'nfe-canceladas':
        const nfesCancelRes = await fetch(
          `/api/nfe?company_id=${activeCompanyId}&status=cancelada&dataInicio=${dataInicio}&dataFim=${dataFim}`,
          { headers }
        );
        return nfesCancelRes.ok ? { nfes: await nfesCancelRes.json() } : null;

      case 'impostos-recolhidos':
        const impostosRes = await fetch(
          `/api/impostos/recolhidos?company_id=${activeCompanyId}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
          { headers }
        );
        return impostosRes.ok ? await impostosRes.json() : null;

      // ============ FRENTE DE CAIXA ============
      case 'caixa-vendas':
        const caixaVendasRes = await fetch(
          `/api/caixa/vendas?company_id=${activeCompanyId}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
          { headers }
        );
        return caixaVendasRes.ok ? { vendas: await caixaVendasRes.json() } : null;

      case 'caixa-operadores':
        const operadoresRes = await fetch(
          `/api/caixa/operadores?company_id=${activeCompanyId}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
          { headers }
        );
        return operadoresRes.ok ? await operadoresRes.json() : null;

      case 'caixa-sangrias':
        const sangriasRes = await fetch(
          `/api/caixa/sangrias?company_id=${activeCompanyId}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
          { headers }
        );
        return sangriasRes.ok ? await sangriasRes.json() : null;

      case 'caixa-formas-pagamento':
        const caixaFormasRes = await fetch(
          `/api/caixa/formas-pagamento?company_id=${activeCompanyId}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
          { headers }
        );
        return caixaFormasRes.ok ? await caixaFormasRes.json() : null;

      // ============ GERAL ============
      case 'clientes':
        const clientesRes = await fetch(
          `/api/cadastros?company_id=${activeCompanyId}&tipo=cliente`,
          { headers }
        );
        return clientesRes.ok ? { clientes: await clientesRes.json() } : null;

      case 'fornecedores':
        const fornecedoresRes = await fetch(
          `/api/cadastros?company_id=${activeCompanyId}&tipo=fornecedor`,
          { headers }
        );
        return fornecedoresRes.ok ? { fornecedores: await fornecedoresRes.json() } : null;

      case 'produtos':
        const produtosRes = await fetch(
          `/api/produtos?company_id=${activeCompanyId}`,
          { headers }
        );
        return produtosRes.ok ? { produtos: await produtosRes.json() } : null;

      case 'dashboard-consolidado':
        // Buscar dados de múltiplas fontes
        const [dashVendas, dashCompras, dashFinanceiro] = await Promise.all([
          fetch(`/api/vendas/dashboard?company_id=${activeCompanyId}&dataInicio=${dataInicio}&dataFim=${dataFim}`, { headers }),
          fetch(`/api/compras/dashboard?company_id=${activeCompanyId}&dataInicio=${dataInicio}&dataFim=${dataFim}`, { headers }),
          fetch(`/api/financeiro/dashboard?company_id=${activeCompanyId}`, { headers })
        ]);
        
        return {
          vendas: dashVendas.ok ? await dashVendas.json() : null,
          compras: dashCompras.ok ? await dashCompras.json() : null,
          financeiro: dashFinanceiro.ok ? await dashFinanceiro.json() : null
        };

      default:
        return null;
    }
  } catch (error) {
    console.error('Erro ao carregar dados do relatório:', error);
    throw error;
  }
}

