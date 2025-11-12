'use client';

import React from 'react';
import { PDFLayout } from './PDFLayout';
import { formatCurrency, formatDate, formatPercent } from '@/lib/pdf/utils';

interface VendasPeriodoData {
  periodo: {
    dataInicio: string;
    dataFim: string;
  };
  resumo: {
    totalVendas: number;
    valorTotal: number;
    ticketMedio: number;
    mediaDiaria: number;
  };
  grafico?: Array<{
    data: string;
    quantidade: number;
    valor: number;
  }>;
  detalhes: Array<{
    id: string;
    numero: string;
    dataEmissao: string;
    cliente: string;
    valorTotal: number;
    status: string;
  }>;
}

interface VendasPeriodoPDFProps {
  dados: VendasPeriodoData;
  filtros?: any;
}

export function VendasPeriodoPDF({ dados, filtros }: VendasPeriodoPDFProps) {
  const subtitle = `${formatDate(dados.periodo.dataInicio)} a ${formatDate(dados.periodo.dataFim)}`;

  return (
    <PDFLayout 
      title="Relatório de Vendas por Período"
      subtitle={subtitle}
    >
      {/* Seção: Resumo */}
      <div className="pdf-section">
        <div className="pdf-section-title">Resumo</div>
        <div className="pdf-metrics">
          <div className="pdf-metric-card">
            <div className="pdf-metric-label">Total de Vendas</div>
            <div className="pdf-metric-value">{dados.resumo.totalVendas}</div>
          </div>
          <div className="pdf-metric-card">
            <div className="pdf-metric-label">Valor Total</div>
            <div className="pdf-metric-value">{formatCurrency(dados.resumo.valorTotal)}</div>
          </div>
          <div className="pdf-metric-card">
            <div className="pdf-metric-label">Ticket Médio</div>
            <div className="pdf-metric-value">{formatCurrency(dados.resumo.ticketMedio)}</div>
          </div>
        </div>
      </div>

      {/* Seção: Detalhes */}
      {dados.detalhes && dados.detalhes.length > 0 && (
        <div className="pdf-section">
          <div className="pdf-section-title">Detalhamento de Vendas</div>
          <table className="pdf-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Data</th>
                <th>Cliente</th>
                <th className="text-right">Valor Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dados.detalhes.map((venda) => (
                <tr key={venda.id}>
                  <td>{venda.numero}</td>
                  <td>{formatDate(venda.dataEmissao)}</td>
                  <td>{venda.cliente}</td>
                  <td className="text-right font-bold">{formatCurrency(venda.valorTotal)}</td>
                  <td>
                    <span className={venda.status === 'faturado' ? 'text-green' : 'text-red'}>
                      {venda.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Seção: Resumo por Status */}
      {dados.detalhes && dados.detalhes.length > 0 && (
        <div className="pdf-section">
          <div className="pdf-section-title">Resumo por Status</div>
          <table className="pdf-table">
            <thead>
              <tr>
                <th>Status</th>
                <th className="text-right">Quantidade</th>
                <th className="text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const statusMap = new Map<string, { count: number; total: number }>();
                
                dados.detalhes.forEach((venda) => {
                  const status = venda.status;
                  const current = statusMap.get(status) || { count: 0, total: 0 };
                  statusMap.set(status, {
                    count: current.count + 1,
                    total: current.total + venda.valorTotal
                  });
                });

                return Array.from(statusMap.entries()).map(([status, data]) => (
                  <tr key={status}>
                    <td>{status}</td>
                    <td className="text-right">{data.count}</td>
                    <td className="text-right font-bold">{formatCurrency(data.total)}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}
    </PDFLayout>
  );
}





