/**
 * Template HTML para PDF de Pedido de Venda
 * Gera HTML diretamente sem usar React
 */

import { formatCurrency, formatDate, formatNumber } from '../utils';

/**
 * Escapa caracteres HTML para evitar problemas de segurança
 */
function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface PedidoVendaDados {
  numero?: string;
  serie?: string;
  numeroOrdemCompra?: string;
  dataEmissao: string;
  dataPrevisaoEntrega?: string;
  dataEntrega?: string;
  status?: string;
  company?: {
    id: string;
    name?: string;
    cnpj?: string;
    address?: any;
    phones?: any[];
    emails?: any[];
  };
  cliente?: {
    id: string;
    nomeRazaoSocial?: string;
    nomeFantasia?: string;
    cpf?: string;
    cnpj?: string;
    email?: string;
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
    email?: string;
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
  formaPagamento?: {
    id: string;
    nome?: string;
  };
  prazoPagamento?: {
    id: string;
    nome?: string;
  };
  frete?: string;
  valorFrete?: number;
  despesas?: number;
  placaVeiculo?: string;
  ufPlaca?: string;
  rntc?: string;
  pesoLiquido?: number;
  pesoBruto?: number;
  volume?: number;
  especie?: string;
  marca?: string;
  quantidadeVolumes?: number;
  totalProdutos?: number;
  totalDescontos?: number;
  totalImpostos?: number;
  totalGeral?: number;
  observacoes?: string;
  itens?: Array<{
    id?: string;
    numeroItem?: number;
    codigo: string;
    nome: string;
    unidade: string;
    quantidade: number;
    precoUnitario: number;
    descontoValor?: number;
    descontoPercentual?: number;
    totalItem: number;
    icmsBase?: number;
    icmsAliquota?: number;
    icmsValor?: number;
    icmsStBase?: number;
    icmsStAliquota?: number;
    icmsStValor?: number;
    ipiAliquota?: number;
    ipiValor?: number;
    pisAliquota?: number;
    pisValor?: number;
    cofinsAliquota?: number;
    cofinsValor?: number;
  }>;
}

const statusColors: Record<string, string> = {
  'faturado': '#10b981',
  'entregue': '#10b981',
  'enviado': '#3b82f6',
  'em_preparacao': '#3b82f6',
  'pendente': '#f59e0b',
  'cancelado': '#ef4444',
  'rascunho': '#6b7280'
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

export function generatePedidoVendaPDFHTML(dados: PedidoVendaDados): string {
  const company = dados.company;
  const cliente = dados.cliente;
  const transportadora = dados.transportadora;
  const enderecoCliente = cliente?.enderecos?.[0];
  const enderecoTransportadora = transportadora?.enderecos?.[0];
  const enderecoCompany = company?.address;
  
  const nomeCliente = cliente?.nomeFantasia || cliente?.nomeRazaoSocial || 'Cliente não informado';
  const documentoCliente = cliente?.cnpj || cliente?.cpf || '';
  const nomeTransportadora = transportadora?.nomeFantasia || transportadora?.nomeRazaoSocial || '';
  const statusColor = statusColors[dados.status || 'rascunho'] || '#6b7280';
  const statusLabel = statusLabels[dados.status || 'rascunho'] || dados.status || 'Rascunho';

  const enderecoClienteCompleto = enderecoCliente ? [
    enderecoCliente.logradouro,
    enderecoCliente.numero,
    enderecoCliente.complemento,
    enderecoCliente.bairro,
    enderecoCliente.cidade,
    enderecoCliente.estado,
    enderecoCliente.cep
  ].filter(Boolean).join(', ') : '';

  const enderecoCompanyCompleto = enderecoCompany ? [
    enderecoCompany.logradouro,
    enderecoCompany.numero,
    enderecoCompany.complemento,
    enderecoCompany.bairro,
    enderecoCompany.cidade,
    enderecoCompany.estado,
    enderecoCompany.cep
  ].filter(Boolean).join(', ') : '';

  const enderecoTransportadoraCompleto = enderecoTransportadora ? [
    enderecoTransportadora.logradouro,
    enderecoTransportadora.numero,
    enderecoTransportadora.complemento,
    enderecoTransportadora.bairro,
    enderecoTransportadora.cidade,
    enderecoTransportadora.estado,
    enderecoTransportadora.cep
  ].filter(Boolean).join(', ') : '';

  // Formatar telefones da empresa
  const telefonesCompany = company?.phones ? 
    (Array.isArray(company.phones) ? company.phones : [company.phones])
      .map((p: any) => p.numero || p).filter(Boolean).join(', ') : '';

  // Formatar emails da empresa
  const emailsCompany = company?.emails ? 
    (Array.isArray(company.emails) ? company.emails : [company.emails])
      .map((e: any) => e.email || e).filter(Boolean).join(', ') : '';

  let html = `
    <div class="pdf-container">
      <!-- Cabeçalho com Logo e Informações da Empresa -->
      <div class="pdf-header-modern">
        <div class="header-content">
          <div class="company-info">
            <h1 class="company-name">${escapeHtml(company?.name || 'Empresa')}</h1>
            ${company?.cnpj ? `<p class="company-cnpj">CNPJ: ${escapeHtml(company.cnpj)}</p>` : ''}
            ${enderecoCompanyCompleto ? `<p class="company-address">${escapeHtml(enderecoCompanyCompleto)}</p>` : ''}
            ${telefonesCompany ? `<p class="company-contact">Tel: ${escapeHtml(telefonesCompany)}</p>` : ''}
            ${emailsCompany ? `<p class="company-contact">Email: ${escapeHtml(emailsCompany)}</p>` : ''}
          </div>
          <div class="document-info">
            <div class="document-title">PEDIDO DE VENDA</div>
            <div class="document-number">Nº ${escapeHtml(dados.numero || '')}</div>
            <div class="document-status" style="background-color: ${statusColor}20; color: ${statusColor};">
              ${statusLabel}
            </div>
          </div>
        </div>
      </div>

      <!-- Informações do Pedido em Cards -->
      <div class="info-cards">
        <div class="info-card">
          <div class="info-label">Data de Emissão</div>
          <div class="info-value">${formatDate(dados.dataEmissao)}</div>
        </div>
        ${dados.dataPrevisaoEntrega ? `
        <div class="info-card">
          <div class="info-label">Previsão de Entrega</div>
          <div class="info-value">${formatDate(dados.dataPrevisaoEntrega)}</div>
        </div>
        ` : ''}
        ${dados.serie ? `
        <div class="info-card">
          <div class="info-label">Série</div>
          <div class="info-value">${escapeHtml(dados.serie)}</div>
        </div>
        ` : ''}
        ${dados.numeroOrdemCompra ? `
        <div class="info-card">
          <div class="info-label">Ordem de Compra</div>
          <div class="info-value">${escapeHtml(dados.numeroOrdemCompra)}</div>
        </div>
        ` : ''}
      </div>

      <!-- Empresa e Cliente lado a lado -->
      <div class="two-columns">
        <!-- Coluna Esquerda: Empresa -->
        <div class="column">
          <div class="section-header">EMPRESA</div>
          <div class="section-content">
            <p class="field-label">Razão Social:</p>
            <p class="field-value">${escapeHtml(company?.name || '-')}</p>
            
            ${company?.cnpj ? `
            <p class="field-label">CNPJ:</p>
            <p class="field-value">${escapeHtml(company.cnpj)}</p>
            ` : ''}
            
            ${enderecoCompanyCompleto ? `
            <p class="field-label">Endereço:</p>
            <p class="field-value">${escapeHtml(enderecoCompanyCompleto)}</p>
            ` : ''}
            
            ${telefonesCompany ? `
            <p class="field-label">Telefone:</p>
            <p class="field-value">${escapeHtml(telefonesCompany)}</p>
            ` : ''}
            
            ${emailsCompany ? `
            <p class="field-label">Email:</p>
            <p class="field-value">${escapeHtml(emailsCompany)}</p>
            ` : ''}
          </div>
        </div>

        <!-- Coluna Direita: Cliente -->
        <div class="column">
          <div class="section-header">CLIENTE</div>
          <div class="section-content">
            <p class="field-label">Nome/Razão Social:</p>
            <p class="field-value">${escapeHtml(nomeCliente)}</p>
            
            ${documentoCliente ? `
            <p class="field-label">${cliente?.cnpj ? 'CNPJ' : 'CPF'}:</p>
            <p class="field-value">${escapeHtml(documentoCliente)}</p>
            ` : ''}
            
            ${cliente?.email ? `
            <p class="field-label">Email:</p>
            <p class="field-value">${escapeHtml(cliente.email)}</p>
            ` : ''}
            
            ${enderecoClienteCompleto ? `
            <p class="field-label">Endereço:</p>
            <p class="field-value">${escapeHtml(enderecoClienteCompleto)}</p>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Informações Adicionais -->
      <div class="additional-info">
        ${dados.vendedor ? `
        <div class="info-item">
          <span class="info-label">Vendedor:</span>
          <span class="info-text">${escapeHtml(dados.vendedor.nomeFantasia || dados.vendedor.nomeRazaoSocial || '-')}</span>
        </div>
        ` : ''}
        ${dados.formaPagamento ? `
        <div class="info-item">
          <span class="info-label">Forma de Pagamento:</span>
          <span class="info-text">${escapeHtml(dados.formaPagamento.nome || '-')}</span>
        </div>
        ` : ''}
        ${dados.prazoPagamento ? `
        <div class="info-item">
          <span class="info-label">Prazo de Pagamento:</span>
          <span class="info-text">${escapeHtml(dados.prazoPagamento.nome || '-')}</span>
        </div>
        ` : ''}
      </div>

      <!-- Transportadora -->
      ${nomeTransportadora || dados.placaVeiculo || dados.pesoBruto ? `
      <div class="transport-section">
        <div class="section-header">TRANSPORTADORA E DADOS DE TRANSPORTE</div>
        <div class="transport-grid">
          ${nomeTransportadora ? `
          <div class="transport-item">
            <p class="field-label">Transportadora:</p>
            <p class="field-value">${escapeHtml(nomeTransportadora)}</p>
            ${enderecoTransportadoraCompleto ? `
            <p class="field-value-small">${escapeHtml(enderecoTransportadoraCompleto)}</p>
            ` : ''}
            ${transportadora?.email ? `
            <p class="field-value-small">Email: ${escapeHtml(transportadora.email)}</p>
            ` : ''}
          </div>
          ` : ''}
          
          ${dados.frete ? `
          <div class="transport-item">
            <p class="field-label">Tipo de Frete:</p>
            <p class="field-value">${escapeHtml(dados.frete)}</p>
            ${dados.valorFrete && dados.valorFrete > 0 ? `
            <p class="field-value-small">Valor: ${formatCurrency(dados.valorFrete)}</p>
            ` : ''}
          </div>
          ` : ''}
          
          ${dados.placaVeiculo ? `
          <div class="transport-item">
            <p class="field-label">Veículo:</p>
            <p class="field-value">${escapeHtml(dados.placaVeiculo)} ${dados.ufPlaca ? `- ${escapeHtml(dados.ufPlaca)}` : ''}</p>
            ${dados.rntc ? `<p class="field-value-small">RNTC: ${escapeHtml(dados.rntc)}</p>` : ''}
          </div>
          ` : ''}
          
          ${(dados.pesoBruto || dados.pesoLiquido) ? `
          <div class="transport-item">
            <p class="field-label">Peso:</p>
            ${dados.pesoBruto ? `<p class="field-value-small">Bruto: ${formatNumber(dados.pesoBruto, 3)} kg</p>` : ''}
            ${dados.pesoLiquido ? `<p class="field-value-small">Líquido: ${formatNumber(dados.pesoLiquido, 3)} kg</p>` : ''}
          </div>
          ` : ''}
          
          ${(dados.volume || dados.quantidadeVolumes) ? `
          <div class="transport-item">
            <p class="field-label">Volume:</p>
            ${dados.volume ? `<p class="field-value-small">${formatNumber(dados.volume, 3)} m³</p>` : ''}
            ${dados.quantidadeVolumes ? `<p class="field-value-small">Quantidade: ${dados.quantidadeVolumes} volumes</p>` : ''}
          </div>
          ` : ''}
          
          ${(dados.especie || dados.marca) ? `
          <div class="transport-item">
            <p class="field-label">Embalagem:</p>
            ${dados.especie ? `<p class="field-value-small">Espécie: ${escapeHtml(dados.especie)}</p>` : ''}
            ${dados.marca ? `<p class="field-value-small">Marca: ${escapeHtml(dados.marca)}</p>` : ''}
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Itens do Pedido -->
      <div class="pdf-section">
        <div class="section-header">ITENS DO PEDIDO</div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 4%;">Item</th>
              <th style="width: 12%;">Código</th>
              <th style="width: 30%;">Descrição</th>
              <th style="width: 6%;">Un.</th>
              <th style="width: 8%; text-align: right;">Quantidade</th>
              <th style="width: 10%; text-align: right;">Preço Unit.</th>
              <th style="width: 10%; text-align: right;">Desconto</th>
              <th style="width: 10%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
  `;

  if (dados.itens && dados.itens.length > 0) {
    dados.itens.forEach((item, index) => {
      const descontoTotal = (item.descontoValor || 0) + 
        ((item.precoUnitario * item.quantidade) * (item.descontoPercentual || 0) / 100);
      const subtotal = (item.precoUnitario * item.quantidade) - descontoTotal;

      html += `
            <tr>
              <td>${item.numeroItem || index + 1}</td>
              <td>${escapeHtml(item.codigo) || ''}</td>
              <td>${escapeHtml(item.nome) || ''}</td>
              <td>${escapeHtml(item.unidade) || ''}</td>
              <td style="text-align: right;">${formatNumber(item.quantidade, 2)}</td>
              <td style="text-align: right;">${formatCurrency(item.precoUnitario)}</td>
              <td style="text-align: right;">${descontoTotal > 0 ? formatCurrency(descontoTotal) : '-'}</td>
              <td style="text-align: right; font-weight: 600;">${formatCurrency(item.totalItem || subtotal)}</td>
            </tr>
      `;
    });
  } else {
    html += `
            <tr>
              <td colspan="8" style="text-align: center; padding: 20px;">Nenhum item encontrado</td>
            </tr>
    `;
  }

  html += `
          </tbody>
        </table>
      </div>
  `;

  // Impostos Detalhados por Item
  const temImpostos = dados.itens && dados.itens.some(item => item.icmsValor || item.ipiValor || item.pisValor || item.cofinsValor);
  
  if (temImpostos) {
    html += `
      <div class="pdf-section">
        <div class="section-header">IMPOSTOS DETALHADOS POR ITEM</div>
        <table class="taxes-table">
          <thead>
            <tr>
              <th style="width: 15%;">Item</th>
              <th style="width: 25%;">Produto</th>
              <th style="width: 12%; text-align: right;">ICMS Base</th>
              <th style="width: 8%; text-align: right;">ICMS %</th>
              <th style="width: 10%; text-align: right;">ICMS Valor</th>
              <th style="width: 12%; text-align: right;">ICMS ST Base</th>
              <th style="width: 10%; text-align: right;">ICMS ST Valor</th>
              <th style="width: 8%; text-align: right;">IPI %</th>
              <th style="width: 10%; text-align: right;">IPI Valor</th>
              <th style="width: 8%; text-align: right;">PIS %</th>
              <th style="width: 10%; text-align: right;">PIS Valor</th>
              <th style="width: 8%; text-align: right;">COFINS %</th>
              <th style="width: 10%; text-align: right;">COFINS Valor</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    dados.itens?.forEach((item, index) => {
      if (item.icmsValor || item.ipiValor || item.pisValor || item.cofinsValor) {
        html += `
            <tr>
              <td>${item.numeroItem || index + 1}</td>
              <td>${escapeHtml(item.nome || '')}</td>
              <td style="text-align: right;">${item.icmsBase ? formatCurrency(item.icmsBase) : '-'}</td>
              <td style="text-align: right;">${item.icmsAliquota ? `${formatNumber(item.icmsAliquota, 2)}%` : '-'}</td>
              <td style="text-align: right;">${item.icmsValor ? formatCurrency(item.icmsValor) : '-'}</td>
              <td style="text-align: right;">${item.icmsStBase ? formatCurrency(item.icmsStBase) : '-'}</td>
              <td style="text-align: right;">${item.icmsStValor ? formatCurrency(item.icmsStValor) : '-'}</td>
              <td style="text-align: right;">${item.ipiAliquota ? `${formatNumber(item.ipiAliquota, 2)}%` : '-'}</td>
              <td style="text-align: right;">${item.ipiValor ? formatCurrency(item.ipiValor) : '-'}</td>
              <td style="text-align: right;">${item.pisAliquota ? `${formatNumber(item.pisAliquota, 2)}%` : '-'}</td>
              <td style="text-align: right;">${item.pisValor ? formatCurrency(item.pisValor) : '-'}</td>
              <td style="text-align: right;">${item.cofinsAliquota ? `${formatNumber(item.cofinsAliquota, 2)}%` : '-'}</td>
              <td style="text-align: right;">${item.cofinsValor ? formatCurrency(item.cofinsValor) : '-'}</td>
            </tr>
        `;
      }
    });

    html += `
          </tbody>
        </table>
      </div>
    `;
  }

  // Totais
  html += `
      <div class="totals-section">
        <div class="section-header">TOTAIS</div>
        <table class="totals-table">
          <tbody>
            <tr>
              <td class="total-label">Total de Produtos:</td>
              <td class="total-value">${formatCurrency(dados.totalProdutos || 0)}</td>
            </tr>
  `;

  if ((dados.totalDescontos || 0) > 0) {
    html += `
            <tr>
              <td class="total-label">Total de Descontos:</td>
              <td class="total-value discount">- ${formatCurrency(dados.totalDescontos || 0)}</td>
            </tr>
    `;
  }

  if ((dados.valorFrete || 0) > 0) {
    html += `
            <tr>
              <td class="total-label">Frete:</td>
              <td class="total-value">${formatCurrency(dados.valorFrete || 0)}</td>
            </tr>
    `;
  }

  if ((dados.despesas || 0) > 0) {
    html += `
            <tr>
              <td class="total-label">Outras Despesas:</td>
              <td class="total-value">${formatCurrency(dados.despesas || 0)}</td>
            </tr>
    `;
  }

  if ((dados.totalImpostos || 0) > 0) {
    html += `
            <tr>
              <td class="total-label">Total de Impostos:</td>
              <td class="total-value">${formatCurrency(dados.totalImpostos || 0)}</td>
            </tr>
    `;
  }

  html += `
            <tr class="total-final">
              <td class="total-label-final">TOTAL GERAL:</td>
              <td class="total-value-final">${formatCurrency(dados.totalGeral || 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
  `;

  // Observações
  if (dados.observacoes) {
    html += `
      <div class="observations-section">
        <div class="section-header">OBSERVAÇÕES</div>
        <div class="observations-content">
          ${escapeHtml(dados.observacoes).replace(/\n/g, '<br>')}
        </div>
      </div>
    `;
  }

  html += `
    </div>
  `;

  return html;
}
