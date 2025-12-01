'use client';

import React from 'react';
import { PDFLayout } from './PDFLayout';
import { formatCurrency, formatDate, formatNumber } from '@/lib/pdf/utils';
import { PedidoVenda, PedidoVendaItem } from '@/types/pedido-venda';

interface PedidoVendaCompleto extends PedidoVenda {
  cliente?: {
    id: string;
    nomeRazaoSocial?: string;
    nomeFantasia?: string;
    cpf?: string;
    cnpj?: string;
    email?: string;
    telefone?: string;
    enderecos?: Array<{
      logradouro?: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
    }>;
  };
  vendedor?: {
    id: string;
    nomeRazaoSocial?: string;
    nomeFantasia?: string;
  };
  transportadora?: {
    id: string;
    nomeRazaoSocial?: string;
    nomeFantasia?: string;
  };
  formaPagamento?: {
    id: string;
    nome?: string;
  };
  prazoPagamento?: {
    id: string;
    nome?: string;
  };
}

interface PedidoVendaPDFProps {
  dados: PedidoVendaCompleto;
}

export function PedidoVendaPDF({ dados }: PedidoVendaPDFProps) {
  const cliente = dados.cliente;
  const endereco = cliente?.enderecos?.[0];
  const nomeCliente = cliente?.nomeFantasia || cliente?.nomeRazaoSocial || 'Cliente não informado';
  const documento = cliente?.cnpj || cliente?.cpf || '';
  const statusColors: Record<string, string> = {
    'faturado': 'text-green',
    'entregue': 'text-green',
    'enviado': 'text-blue',
    'em_preparacao': 'text-blue',
    'pendente': 'text-yellow',
    'cancelado': 'text-red',
    'rascunho': 'text-gray'
  };

  const statusLabels: Record<string, string> = {
    'faturado': 'Faturado',
    'entregue': 'Entregue',
    'enviado': 'Enviado',
    'em_preparacao': 'Em Preparação',
    'pendente': 'Pendente',
    'cancelado': 'Cancelado',
    'rascunho': 'Rascunho'
  };

  return (
    <PDFLayout 
      title={`PEDIDO DE VENDA ${dados.numero || ''}`}
      subtitle={`Emitido em ${formatDate(dados.dataEmissao)}`}
    >
      {/* Informações do Pedido */}
      <div className="pdf-section">
        <div className="pdf-section-title">Informações do Pedido</div>
        <table className="pdf-table" style={{ marginBottom: '16px' }}>
          <tbody>
            <tr>
              <td style={{ width: '30%', fontWeight: '600' }}>Número:</td>
              <td>{dados.numero || '-'}</td>
              <td style={{ width: '30%', fontWeight: '600' }}>Série:</td>
              <td>{dados.serie || '-'}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Data de Emissão:</td>
              <td>{formatDate(dados.dataEmissao)}</td>
              <td style={{ fontWeight: '600' }}>Status:</td>
              <td>
                <span className={statusColors[dados.status || 'rascunho'] || 'text-gray'}>
                  {statusLabels[dados.status || 'rascunho'] || dados.status || 'Rascunho'}
                </span>
              </td>
            </tr>
            {dados.dataPrevisaoEntrega && (
              <tr>
                <td style={{ fontWeight: '600' }}>Previsão de Entrega:</td>
                <td>{formatDate(dados.dataPrevisaoEntrega)}</td>
                <td style={{ fontWeight: '600' }}>Data de Entrega:</td>
                <td>{dados.dataEntrega ? formatDate(dados.dataEntrega) : '-'}</td>
              </tr>
            )}
            {dados.numeroOrdemCompra && (
              <tr>
                <td style={{ fontWeight: '600' }}>Ordem de Compra:</td>
                <td colSpan={3}>{dados.numeroOrdemCompra}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Informações do Cliente */}
      <div className="pdf-section">
        <div className="pdf-section-title">Cliente</div>
        <table className="pdf-table" style={{ marginBottom: '16px' }}>
          <tbody>
            <tr>
              <td style={{ width: '30%', fontWeight: '600' }}>Nome/Razão Social:</td>
              <td colSpan={3}>{nomeCliente}</td>
            </tr>
            {documento && (
              <tr>
                <td style={{ fontWeight: '600' }}>{cliente?.cnpj ? 'CNPJ:' : 'CPF:'}</td>
                <td>{documento}</td>
                {cliente?.email && (
                  <>
                    <td style={{ fontWeight: '600' }}>Email:</td>
                    <td>{cliente.email}</td>
                  </>
                )}
              </tr>
            )}
            {endereco && (
              <tr>
                <td style={{ fontWeight: '600' }}>Endereço:</td>
                <td colSpan={3}>
                  {[
                    endereco.logradouro,
                    endereco.numero,
                    endereco.complemento,
                    endereco.bairro,
                    endereco.cidade,
                    endereco.estado,
                    endereco.cep
                  ].filter(Boolean).join(', ')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Informações Adicionais */}
      {(dados.vendedor || dados.transportadora || dados.formaPagamento || dados.prazoPagamento) && (
        <div className="pdf-section">
          <div className="pdf-section-title">Informações Adicionais</div>
          <table className="pdf-table" style={{ marginBottom: '16px' }}>
            <tbody>
              {dados.vendedor && (
                <tr>
                  <td style={{ width: '30%', fontWeight: '600' }}>Vendedor:</td>
                  <td>{dados.vendedor.nomeFantasia || dados.vendedor.nomeRazaoSocial || '-'}</td>
                  {dados.transportadora && (
                    <>
                      <td style={{ fontWeight: '600' }}>Transportadora:</td>
                      <td>{dados.transportadora.nomeFantasia || dados.transportadora.nomeRazaoSocial || '-'}</td>
                    </>
                  )}
                </tr>
              )}
              {dados.formaPagamento && (
                <tr>
                  <td style={{ fontWeight: '600' }}>Forma de Pagamento:</td>
                  <td>{dados.formaPagamento.nome || '-'}</td>
                  {dados.prazoPagamento && (
                    <>
                      <td style={{ fontWeight: '600' }}>Prazo de Pagamento:</td>
                      <td>{dados.prazoPagamento.nome || '-'}</td>
                    </>
                  )}
                </tr>
              )}
              {dados.frete && (
                <tr>
                  <td style={{ fontWeight: '600' }}>Frete:</td>
                  <td>{dados.frete}</td>
                  {dados.valorFrete && dados.valorFrete > 0 && (
                    <>
                      <td style={{ fontWeight: '600' }}>Valor do Frete:</td>
                      <td>{formatCurrency(dados.valorFrete)}</td>
                    </>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Itens do Pedido */}
      <div className="pdf-section">
        <div className="pdf-section-title">Itens do Pedido</div>
        <table className="pdf-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>Item</th>
              <th style={{ width: '15%' }}>Código</th>
              <th style={{ width: '35%' }}>Descrição</th>
              <th style={{ width: '8%' }}>Un.</th>
              <th style={{ width: '10%', textAlign: 'right' }}>Quantidade</th>
              <th style={{ width: '12%', textAlign: 'right' }}>Preço Unit.</th>
              <th style={{ width: '10%', textAlign: 'right' }}>Desconto</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {dados.itens && dados.itens.length > 0 ? (
              dados.itens.map((item: PedidoVendaItem, index: number) => {
                const descontoTotal = (item.descontoValor || 0) + 
                  ((item.precoUnitario * item.quantidade) * (item.descontoPercentual || 0) / 100);
                const subtotal = (item.precoUnitario * item.quantidade) - descontoTotal;

                return (
                  <tr key={item.id || index}>
                    <td>{item.numeroItem || index + 1}</td>
                    <td>{item.codigo}</td>
                    <td>{item.nome}</td>
                    <td>{item.unidade}</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(item.quantidade, 2)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.precoUnitario)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {descontoTotal > 0 ? formatCurrency(descontoTotal) : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(item.totalItem || subtotal)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                  Nenhum item encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totais */}
      <div className="pdf-section">
        <div className="pdf-section-title">Totais</div>
        <table className="pdf-table" style={{ width: '50%', marginLeft: 'auto' }}>
          <tbody>
            <tr>
              <td style={{ width: '60%', fontWeight: '600', textAlign: 'right' }}>Total de Produtos:</td>
              <td style={{ textAlign: 'right', fontWeight: '600' }}>
                {formatCurrency(dados.totalProdutos || 0)}
              </td>
            </tr>
            {(dados.totalDescontos || 0) > 0 && (
              <tr>
                <td style={{ fontWeight: '600', textAlign: 'right' }}>Total de Descontos:</td>
                <td style={{ textAlign: 'right', color: '#ef4444' }}>
                  - {formatCurrency(dados.totalDescontos || 0)}
                </td>
              </tr>
            )}
            {(dados.valorFrete || 0) > 0 && (
              <tr>
                <td style={{ fontWeight: '600', textAlign: 'right' }}>Frete:</td>
                <td style={{ textAlign: 'right' }}>
                  {formatCurrency(dados.valorFrete || 0)}
                </td>
              </tr>
            )}
            {(dados.despesas || 0) > 0 && (
              <tr>
                <td style={{ fontWeight: '600', textAlign: 'right' }}>Outras Despesas:</td>
                <td style={{ textAlign: 'right' }}>
                  {formatCurrency(dados.despesas || 0)}
                </td>
              </tr>
            )}
            {(dados.totalImpostos || 0) > 0 && (
              <tr>
                <td style={{ fontWeight: '600', textAlign: 'right' }}>Total de Impostos:</td>
                <td style={{ textAlign: 'right' }}>
                  {formatCurrency(dados.totalImpostos || 0)}
                </td>
              </tr>
            )}
            <tr style={{ borderTop: '2px solid #3b82f6', backgroundColor: '#f3f4f6' }}>
              <td style={{ fontWeight: '700', fontSize: '14px', textAlign: 'right', padding: '12px' }}>
                Total Geral:
              </td>
              <td style={{ fontWeight: '700', fontSize: '16px', textAlign: 'right', padding: '12px', color: '#3b82f6' }}>
                {formatCurrency(dados.totalGeral || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Observações */}
      {dados.observacoes && (
        <div className="pdf-section">
          <div className="pdf-section-title">Observações</div>
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#f9fafb', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6'
          }}>
            {dados.observacoes}
          </div>
        </div>
      )}

      {/* Informações de Transporte */}
      {(dados.pesoBruto || dados.pesoLiquido || dados.volume || dados.especie || dados.marca) && (
        <div className="pdf-section">
          <div className="pdf-section-title">Informações de Transporte</div>
          <table className="pdf-table">
            <tbody>
              <tr>
                {dados.pesoBruto && (
                  <>
                    <td style={{ width: '25%', fontWeight: '600' }}>Peso Bruto:</td>
                    <td style={{ width: '25%' }}>{formatNumber(dados.pesoBruto, 3)} kg</td>
                  </>
                )}
                {dados.pesoLiquido && (
                  <>
                    <td style={{ width: '25%', fontWeight: '600' }}>Peso Líquido:</td>
                    <td style={{ width: '25%' }}>{formatNumber(dados.pesoLiquido, 3)} kg</td>
                  </>
                )}
              </tr>
              <tr>
                {dados.volume && (
                  <>
                    <td style={{ fontWeight: '600' }}>Volume:</td>
                    <td>{formatNumber(dados.volume, 3)} m³</td>
                  </>
                )}
                {dados.quantidadeVolumes && (
                  <>
                    <td style={{ fontWeight: '600' }}>Quantidade de Volumes:</td>
                    <td>{dados.quantidadeVolumes}</td>
                  </>
                )}
              </tr>
              {(dados.especie || dados.marca) && (
                <tr>
                  {dados.especie && (
                    <>
                      <td style={{ fontWeight: '600' }}>Espécie:</td>
                      <td>{dados.especie}</td>
                    </>
                  )}
                  {dados.marca && (
                    <>
                      <td style={{ fontWeight: '600' }}>Marca:</td>
                      <td>{dados.marca}</td>
                    </>
                  )}
                </tr>
              )}
              {(dados.placaVeiculo || dados.ufPlaca) && (
                <tr>
                  <td style={{ fontWeight: '600' }}>Placa do Veículo:</td>
                  <td>{dados.placaVeiculo || '-'} {dados.ufPlaca ? `- ${dados.ufPlaca}` : ''}</td>
                  {dados.rntc && (
                    <>
                      <td style={{ fontWeight: '600' }}>RNTC:</td>
                      <td>{dados.rntc}</td>
                    </>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </PDFLayout>
  );
}







