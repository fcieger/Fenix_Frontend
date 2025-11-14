/**
 * Helper para exportar PDF de relatórios
 */

interface ExportPDFOptions {
  tipo: string;
  subTipo: string;
  dados: any;
  filtros?: any;
  token: string;
  companyId: string;
}

/**
 * Exporta PDF de relatório
 */
export async function exportPDF(options: ExportPDFOptions): Promise<void> {
  const { tipo, subTipo, dados, filtros, token, companyId } = options;

  try {
    // Gerar PDF
    const response = await fetch('/api/relatorios/export/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tipo,
        subTipo,
        dados,
        filtros,
        company_id: companyId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao gerar PDF');
    }

    // Download do PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Nome do arquivo
    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `relatorio-${subTipo}-${timestamp}.pdf`;
    
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw error;
  }
}






