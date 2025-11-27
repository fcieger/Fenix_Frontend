'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Printer, Filter } from 'lucide-react';
import { buscarExtrato } from '@/services/credit';
import { MovimentacaoCapitalGiro } from '@/types/credit';

export default function ExtratoCapitalGiroPage() {
  const [extrato, setExtrato] = useState<MovimentacaoCapitalGiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  useEffect(() => {
    carregarExtrato();
  }, []);

  const carregarExtrato = async () => {
    try {
      setLoading(true);
      const data = await buscarExtrato();
      setExtrato(data);
    } catch (error) {
      console.error('Erro ao carregar extrato:', error);
    } finally {
      setLoading(false);
    }
  };

  const extratoFiltrado = extrato.filter((mov) => {
    if (filtroTipo === 'todos') return true;
    return mov.tipo === filtroTipo;
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTipoLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      utilizacao: 'Utilização',
      pagamento: 'Pagamento',
      juros: 'Juros',
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors: { [key: string]: string } = {
      utilizacao: 'text-red-600',
      pagamento: 'text-green-600',
      juros: 'text-blue-600',
    };
    return colors[tipo] || 'text-gray-600';
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleExportar = () => {
    // Criar CSV
    const headers = ['Data', 'Tipo', 'Descrição', 'Valor', 'Saldo Anterior', 'Saldo Posterior'];
    const rows = extratoFiltrado.map(mov => [
      formatDate(mov.createdAt),
      getTipoLabel(mov.tipo),
      mov.descricao || '-',
      formatCurrency(mov.valor),
      formatCurrency(mov.saldoAnterior),
      formatCurrency(mov.saldoPosterior),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `extrato-capital-giro-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 print:mb-4">
        <Link href="/credit/capital-giro" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 print:hidden">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">Extrato - Capital de Giro</h1>
            <p className="text-gray-600 mt-2 print:text-sm">
              Histórico completo de movimentações
            </p>
          </div>
          <div className="flex space-x-2 print:hidden">
            <button
              onClick={handleExportar}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </button>
            <button
              onClick={handleImprimir}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {extrato.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 print:hidden">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 mr-4">Filtrar por tipo:</span>
            <div className="flex space-x-2">
              {[
                { value: 'todos', label: 'Todos' },
                { value: 'utilizacao', label: 'Utilizações' },
                { value: 'pagamento', label: 'Pagamentos' },
                { value: 'juros', label: 'Juros' },
              ].map((filtro) => (
                <button
                  key={filtro.value}
                  onClick={() => setFiltroTipo(filtro.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroTipo === filtro.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      {extratoFiltrado.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo Anterior
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo Posterior
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {extratoFiltrado.map((mov) => (
                <tr key={mov.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(mov.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      mov.tipo === 'utilizacao'
                        ? 'bg-red-100 text-red-800'
                        : mov.tipo === 'pagamento'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getTipoLabel(mov.tipo)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {mov.descricao || '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${getTipoColor(mov.tipo)}`}>
                    {mov.tipo === 'utilizacao' ? '-' : '+'}{formatCurrency(mov.valor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(mov.saldoAnterior)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    {formatCurrency(mov.saldoPosterior)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : extrato.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhuma movimentação encontrada com o filtro selecionado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhuma movimentação registrada ainda.</p>
        </div>
      )}

      {/* Resumo (apenas na impressão) */}
      <div className="hidden print:block mt-8">
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            Extrato gerado em: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}




