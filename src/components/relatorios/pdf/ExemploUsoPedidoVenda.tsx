/**
 * EXEMPLO DE USO - Como exportar PDF de Pedido de Venda
 * 
 * Este arquivo mostra como usar a funcionalidade de exportação de PDF de pedido de venda.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { exportPedidoVendaPDF } from '@/lib/pdf/exportPedidoVendaPDF';
import { toast } from 'sonner';
import { Download, Loader2, FileText } from 'lucide-react';

interface ExemploUsoPedidoVendaProps {
  pedidoId: string;
}

export function ExemploUsoPedidoVenda({ pedidoId }: ExemploUsoPedidoVendaProps) {
  const { token, activeCompanyId } = useAuth();
  const [exportando, setExportando] = useState(false);

  const handleExportarPDF = async () => {
    if (!token || !activeCompanyId) {
      toast.error('Token ou empresa não encontrado');
      return;
    }

    if (!pedidoId) {
      toast.error('ID do pedido não informado');
      return;
    }

    setExportando(true);

    try {
      await exportPedidoVendaPDF({
        pedidoId,
        token,
        companyId: activeCompanyId
      });

      toast.success('PDF do pedido de venda gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao exportar PDF:', error);
      toast.error(error.message || 'Erro ao gerar PDF do pedido de venda');
    } finally {
      setExportando(false);
    }
  };

  return (
    <button
      onClick={handleExportarPDF}
      disabled={exportando || !token || !activeCompanyId}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {exportando ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Gerando PDF...</span>
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          <span>Exportar PDF</span>
        </>
      )}
    </button>
  );
}

/**
 * EXEMPLO SIMPLIFICADO - Uso direto em uma tela
 * 
 * import { useAuth } from '@/contexts/auth-context';
 * import { exportPedidoVendaPDF } from '@/lib/pdf/exportPedidoVendaPDF';
 * 
 * const { token, activeCompanyId } = useAuth();
 * 
 * const handleExport = async () => {
 *   await exportPedidoVendaPDF({
 *     pedidoId: 'uuid-do-pedido',
 *     token,
 *     companyId: activeCompanyId
 *   });
 * };
 */






