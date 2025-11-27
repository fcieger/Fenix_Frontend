/**
 * Helper específico para exportar PDF de pedido de venda
 */

interface ExportPedidoVendaPDFOptions {
  pedidoId: string;
  token: string;
  companyId: string;
}

/**
 * Gera PDF de pedido de venda e retorna o blob URL para exibição em modal
 */
export async function exportPedidoVendaPDF(options: ExportPedidoVendaPDFOptions): Promise<string> {
  const { pedidoId, token, companyId } = options;

  try {
    // 1. Buscar pedido completo
    const response = await fetch(`/api/pedidos-venda/${pedidoId}?company_id=${companyId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar pedido de venda');
    }

    const result = await response.json();
    const pedido = result.data;

    // 2. Gerar PDF
    const pdfResponse = await fetch('/api/reports/export/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tipo: 'vendas',
        subTipo: 'pedido-venda',
        dados: pedido,
        company_id: companyId
      })
    });

    if (!pdfResponse.ok) {
      const error = await pdfResponse.json();
      throw new Error(error.error || 'Erro ao gerar PDF');
    }

    // 3. Criar blob URL para exibição no modal
    const blob = await pdfResponse.blob();
    const url = window.URL.createObjectURL(blob);
    
    return url;
  } catch (error) {
    console.error('Erro ao exportar PDF do pedido de venda:', error);
    throw error;
  }
}

