/**
 * EXEMPLO DE USO - Como usar a exportação de PDF
 * 
 * Este arquivo é apenas um exemplo de como usar a funcionalidade de exportação de PDF.
 * Você pode copiar este código para suas telas de relatórios.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { exportPDF } from '@/lib/pdf/exportPDF';
import { toast } from 'sonner';
import { Download, Loader2 } from 'lucide-react';

export function ExemploUsoPDF() {
  const { token, activeCompanyId } = useAuth();
  const [exportando, setExportando] = useState(false);

  // Exemplo: Exportar relatório de vendas por período
  const handleExportarVendasPeriodo = async () => {
    if (!token || !activeCompanyId) {
      toast.error('Token ou empresa não encontrado');
      return;
    }

    setExportando(true);

    try {
      // 1. Buscar dados do relatório (exemplo)
      const dados = await buscarDadosRelatorioVendas();

      // 2. Exportar PDF
      await exportPDF({
        tipo: 'vendas',
        subTipo: 'vendas-periodo',
        dados: {
          periodo: {
            dataInicio: '2024-01-01',
            dataFim: '2024-01-31'
          },
          resumo: {
            totalVendas: dados.totalVendas,
            valorTotal: dados.valorTotal,
            ticketMedio: dados.ticketMedio,
            mediaDiaria: dados.mediaDiaria
          },
          detalhes: dados.detalhes
        },
        filtros: {
          dataInicio: '2024-01-01',
          dataFim: '2024-01-31'
        },
        token,
        companyId: activeCompanyId
      });

      toast.success('PDF gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao exportar PDF:', error);
      toast.error(error.message || 'Erro ao gerar PDF');
    } finally {
      setExportando(false);
    }
  };

  // Função exemplo para buscar dados
  const buscarDadosRelatorioVendas = async () => {
    // Aqui você faria a chamada real para sua API
    // const response = await fetch('/api/sales/dashboard?...');
    // return response.json();
    
    // Exemplo de retorno
    return {
      totalVendas: 150,
      valorTotal: 450000.00,
      ticketMedio: 3000.00,
      mediaDiaria: 4.84,
      detalhes: [
        {
          id: '1',
          numero: '001',
          dataEmissao: '2024-01-01',
          cliente: 'Cliente ABC',
          valorTotal: 5000.00,
          status: 'faturado'
        }
        // ... mais vendas
      ]
    };
  };

  return (
    <div>
      <button
        onClick={handleExportarVendasPeriodo}
        disabled={exportando}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {exportando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Gerando PDF...</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span>Exportar PDF</span>
          </>
        )}
      </button>
    </div>
  );
}

/**
 * EXEMPLO SIMPLIFICADO - Uso direto em uma tela
 * 
 * import { useAuth } from '@/contexts/auth-context';
 * import { exportPDF } from '@/lib/pdf/exportPDF';
 * 
 * const { token, activeCompanyId } = useAuth();
 * 
 * const handleExport = async () => {
 *   await exportPDF({
 *     tipo: 'vendas',
 *     subTipo: 'vendas-periodo',
 *     dados: { /* seus dados */ },
 *     filtros: { /* seus filtros */ },
 *     token,
 *     companyId: activeCompanyId
 *   });
 * };
 */






