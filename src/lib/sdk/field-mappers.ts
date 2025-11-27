/**
 * Field Mappers
 * Functions to map SDK types to display-friendly formats
 */

import type {
  Product,
  Partner,
  Quote,
  SalesOrder,
  PurchaseOrder,
  RegistrationType,
  PersonType,
} from '@/types/sdk';

/**
 * Display-friendly Product interface
 */
export interface DisplayProduct {
  id: string;
  code: string;
  description: string;
  ncm: string;
  unit: string;
  price: number;
  cest?: string | null;
}

/**
 * Display-friendly Partner interface
 */
export interface DisplayPartner {
  id: string;
  legalName: string;
  tradeName?: string | null;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
  type: string;
}

/**
 * Display-friendly Quote interface
 */
export interface DisplayQuote {
  id: string;
  number: string;
  status: string;
  statusValue: string;
  date: string;
  validityDate?: string | null;
  partnerName?: string;
  total: number;
  totalProducts: number;
  totalDiscounts: number;
  totalTaxes: number;
  itemsCount: number;
}

/**
 * Display-friendly SalesOrder interface
 */
export interface DisplaySalesOrder {
  id: string;
  number: string;
  status: string;
  statusValue: string;
  date: string;
  partnerName?: string;
  total: number;
  totalProducts: number;
  totalDiscounts: number;
  totalTaxes: number;
  itemsCount: number;
}

/**
 * Display-friendly PurchaseOrder interface
 */
export interface DisplayPurchaseOrder {
  id: string;
  number: string;
  status: string;
  statusValue: string;
  date: string;
  partnerName?: string;
  total: number;
  totalProducts: number;
  totalDiscounts: number;
  totalTaxes: number;
  itemsCount: number;
}

/**
 * Map Product to display format
 */
export function mapProductToDisplay(product: Product): DisplayProduct {
  return {
    id: product.id,
    code: product.code,
    description: product.description,
    ncm: product.ncm,
    unit: product.unit,
    price: product.price,
    cest: product.cest || null,
  };
}

/**
 * Map Partner to display format
 */
export function mapPartnerToDisplay(partner: Partner): DisplayPartner {
  // Get primary contact email/phone if available
  const primaryContact = partner.contacts?.find((c) => c.isPrimary);
  const email = partner.email || primaryContact?.email || null;
  const phone = partner.phone || primaryContact?.phone || null;

  return {
    id: partner.id,
    legalName: partner.legalName,
    tradeName: partner.tradeName || null,
    taxId: partner.taxId || null,
    email,
    phone,
    type: partner.type,
  };
}

/**
 * Map Quote to display format
 */
export function mapQuoteToDisplay(
  quote: Quote,
  partner?: Partner | null
): DisplayQuote {
  return {
    id: quote.id,
    number: quote.number,
    status: quote.status, // Will be translated in UI
    statusValue: quote.status,
    date: quote.date,
    validityDate: quote.validityDate || null,
    partnerName: partner?.legalName,
    total: quote.total,
    totalProducts: quote.totalProducts,
    totalDiscounts: quote.totalDiscounts,
    totalTaxes: quote.totalTaxes,
    itemsCount: quote.items?.length || 0,
  };
}

/**
 * Map SalesOrder to display format
 */
export function mapSalesOrderToDisplay(
  order: SalesOrder,
  partner?: Partner | null
): DisplaySalesOrder {
  return {
    id: order.id,
    number: order.number,
    status: order.status, // Will be translated in UI
    statusValue: order.status,
    date: order.date,
    partnerName: partner?.legalName,
    total: order.total,
    totalProducts: order.totalProducts,
    totalDiscounts: order.totalDiscounts,
    totalTaxes: order.totalTaxes,
    itemsCount: order.items?.length || 0,
  };
}

/**
 * Map PurchaseOrder to display format
 */
export function mapPurchaseOrderToDisplay(
  order: PurchaseOrder,
  partner?: Partner | null
): DisplayPurchaseOrder {
  return {
    id: order.id,
    number: order.number,
    status: order.status, // Will be translated in UI
    statusValue: order.status,
    date: order.date,
    partnerName: partner?.legalName,
    total: order.total,
    totalProducts: order.totalProducts,
    totalDiscounts: order.totalDiscounts,
    totalTaxes: order.totalTaxes,
    itemsCount: order.items?.length || 0,
  };
}

/**
 * Form Data Types for Partner Form
 */
export interface PartnerFormData {
  nomeRazaoSocial: string;
  nomeFantasia: string;
  tipoPessoa: 'Pessoa Física' | 'Pessoa Jurídica';
  cpf: string;
  cnpj: string;
  tiposCliente: {
    cliente: boolean;
    vendedor: boolean;
    fornecedor: boolean;
    funcionario: boolean;
    transportadora: boolean;
    prestadorServico: boolean;
  };
  email: string;
  contatos: Array<{
    email: string;
    pessoaContato: string;
    telefoneComercial: string;
    celular: string;
    cargo: string;
    celularContato: string;
    principal: boolean;
  }>;
  optanteSimples: boolean;
  orgaoPublico: boolean;
  ie: string;
  im: string;
  suframa: string;
  enderecos: Array<{
    tipo: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    principal: boolean;
  }>;
  observacoes: string;
}

/**
 * Convert ISO date-time to YYYY-MM-DD format
 */
function isoToDateString(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Map SDK Partner to Partner Form Data
 */
export function mapSdkPartnerToFormData(partner: Partner): PartnerFormData {
  // Determine person type
  const tipoPessoa: 'Pessoa Física' | 'Pessoa Jurídica' =
    partner.personType === 'INDIVIDUAL' ? 'Pessoa Física' : 'Pessoa Jurídica';

  // Split taxId into cpf/cnpj based on personType
  const taxId = partner.taxId || '';
  const cpf = tipoPessoa === 'Pessoa Física' ? taxId : '';
  const cnpj = tipoPessoa === 'Pessoa Jurídica' ? taxId : '';

  // Map registration type to tiposCliente object
  const tiposCliente = {
    cliente: partner.type === 'CUSTOMER' || partner.type === 'BOTH',
    vendedor: false, // Not in SDK
    fornecedor: partner.type === 'SUPPLIER' || partner.type === 'BOTH',
    funcionario: false, // Not in SDK
    transportadora: false, // Not in SDK
    prestadorServico: false, // Not in SDK
  };

  // Get primary contact
  const primaryContact = partner.contacts?.find(c => c.isPrimary) || partner.contacts?.[0];
  const email = (typeof partner.email === 'string' ? partner.email : null) || primaryContact?.email || '';
  const phone = (typeof partner.phone === 'string' ? partner.phone : null) || primaryContact?.phone || '';

  // Map addresses
  const enderecos = partner.addresses?.map((addr, index) => ({
    tipo: 'Comercial', // AddressDto doesn't have type, default to 'Comercial'
    logradouro: addr.street || '',
    numero: addr.number || '',
    bairro: addr.neighborhood || '',
    cidade: addr.city || '',
    estado: addr.state || '',
    cep: addr.zipCode || '',
    principal: index === 0, // First address is primary if no isPrimary flag
  })) || [{
    tipo: 'Comercial',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    principal: true,
  }];

  // Map contacts
  const contatos = partner.contacts?.map(contact => ({
    email: contact.email || '',
    pessoaContato: contact.name || '',
    telefoneComercial: contact.phone || '',
    celular: contact.phone || '',
    cargo: contact.position || '',
    celularContato: contact.phone || '',
    principal: contact.isPrimary || false,
  })) || [{
    email: email,
    pessoaContato: primaryContact?.name || '',
    telefoneComercial: phone,
    celular: phone,
    cargo: primaryContact?.position || '',
    celularContato: phone,
    principal: true,
  }];

  return {
    nomeRazaoSocial: partner.legalName || '',
    nomeFantasia: (typeof partner.tradeName === 'string' ? partner.tradeName : null) || '',
    tipoPessoa,
    cpf,
    cnpj,
    tiposCliente,
    email,
    contatos,
    optanteSimples: partner.simplifiedTaxSystem || false,
    orgaoPublico: false, // Not in SDK
    ie: (typeof partner.stateRegistration === 'string' ? partner.stateRegistration : null) || '',
    im: (typeof partner.municipalRegistration === 'string' ? partner.municipalRegistration : null) || '',
    suframa: '', // Not in SDK
    enderecos,
    observacoes: (typeof partner.notes === 'string' ? partner.notes : null) || '',
  };
}

/**
 * Form Data Types for Quote Form
 */
export interface QuoteFormData {
  cliente: string;
  vendedor: string;
  transportadora: string;
  consumidorFinal: boolean;
  indicadorPresenca: string;
  formaPagamento: string;
  parcelamento: string;
  estoque: string;
  pedido: string;
  nfe: string;
  numeroPedidoCotacao: string;
  dataPrevisao: string;
  dataEmissao: string;
  dataValidade: string;
  status: string;
  motivoPerda: string;
  frete: string;
  valorFrete: number;
  despesas: number;
  incluirFreteTotal: boolean;
  naturezaOperacao: string;
  prazoPagamento: string;
  observacoes: string;
}

/**
 * Map SDK Quote to Quote Form Data
 */
export function mapSdkQuoteToFormData(quote: Quote): QuoteFormData {
  return {
    cliente: quote.partnerId || '',
    vendedor: '', // Not in SDK
    transportadora: '', // Not in SDK
    consumidorFinal: false, // Not in SDK
    indicadorPresenca: '2', // Not in SDK
    formaPagamento: '', // Not in SDK
    parcelamento: '90 dias', // Not in SDK
    estoque: '', // Not in SDK
    pedido: quote.number || '',
    nfe: '', // Not in SDK
    numeroPedidoCotacao: '', // Not in SDK
    dataPrevisao: '', // Not in SDK
    dataEmissao: isoToDateString(quote.date),
    dataValidade: isoToDateString(quote.validityDate),
    status: quote.status === 'OPEN' ? 'pendente' :
            quote.status === 'APPROVED' ? 'aprovado' :
            quote.status === 'REJECTED' ? 'rejeitado' :
            quote.status === 'EXPIRED' ? 'expirado' : 'pendente',
    motivoPerda: '', // Not in SDK
    frete: quote.freightValue ? '1' : '0',
    valorFrete: quote.freightValue || 0,
    despesas: quote.expensesValue || 0,
    incluirFreteTotal: false, // Not in SDK
    naturezaOperacao: quote.operationNatureId || '',
    prazoPagamento: quote.paymentTermId || '',
    observacoes: '', // Not in SDK
  };
}

/**
 * Form Data Types for Sales Order Form
 */
export interface SalesOrderFormData {
  companyId: string;
  cliente: string;
  vendedor: string;
  transportadora: string;
  consumidorFinal: boolean;
  indicadorPresenca: string;
  formaPagamento: string;
  parcelamento: string;
  estoque: string;
  pedido: string;
  nfe: string;
  numeroOrdemCompra: string;
  dataPrevisao: string;
  dataEmissao: string;
  dataEntrega: string;
  status: string;
  frete: string;
  valorFrete: number;
  despesas: number;
  incluirFreteTotal: boolean;
  naturezaOperacao: string;
  prazoPagamento: string;
  observacoes: string;
}

/**
 * Map SDK SalesOrder to Sales Order Form Data
 */
export function mapSdkSalesOrderToFormData(order: SalesOrder, companyId?: string): SalesOrderFormData {
  return {
    companyId: companyId || order.companyId || '',
    cliente: order.partnerId || '',
    vendedor: '', // Not in SDK
    transportadora: '', // Not in SDK
    consumidorFinal: false, // Not in SDK
    indicadorPresenca: '2', // Not in SDK
    formaPagamento: '', // Not in SDK
    parcelamento: '90 dias', // Not in SDK
    estoque: '', // Not in SDK
    pedido: order.number || '',
    nfe: '', // Not in SDK
    numeroOrdemCompra: '', // Not in SDK
    dataPrevisao: '', // Not in SDK (expectedDeliveryDate doesn't exist)
    dataEmissao: isoToDateString(order.date),
    dataEntrega: '', // Not in SDK (deliveryDate doesn't exist)
    status: order.status === 'DRAFT' ? 'rascunho' :
            order.status === 'IN_PROGRESS' ? 'em_andamento' :
            order.status === 'COMPLETED' ? 'finalizado' :
            order.status === 'CANCELLED' ? 'cancelado' : 'rascunho',
    frete: order.freightValue ? '1' : '0',
    valorFrete: order.freightValue || 0,
    despesas: order.expensesValue || 0,
    incluirFreteTotal: false, // Not in SDK
    naturezaOperacao: order.operationNatureId || '',
    prazoPagamento: order.paymentTermId || '',
    observacoes: '', // Not in SDK
  };
}

/**
 * Form Data Types for Purchase Order Form
 */
export interface PurchaseOrderFormData {
  fornecedor: string;
  comprador: string;
  transportadora: string;
  consumidorFinal: boolean;
  indicadorPresenca: string;
  formaPagamento: string;
  parcelamento: string;
  estoque: string;
  pedido: string;
  nfe: string;
  numeroOrdemCompra: string;
  dataPrevisao: string;
  dataEmissao: string;
  dataEntrega: string;
  status: string;
  frete: string;
  valorFrete: number;
  despesas: number;
  incluirFreteTotal: boolean;
  naturezaOperacao: string;
  prazoPagamento: string;
  observacoes: string;
}

/**
 * Map SDK PurchaseOrder to Purchase Order Form Data
 */
export function mapSdkPurchaseOrderToFormData(order: PurchaseOrder): PurchaseOrderFormData {
  return {
    fornecedor: order.partnerId || '',
    comprador: '', // Not in SDK
    transportadora: '', // Not in SDK
    consumidorFinal: false, // Not in SDK
    indicadorPresenca: '2', // Not in SDK
    formaPagamento: '', // Not in SDK
    parcelamento: '90 dias', // Not in SDK
    estoque: '', // Not in SDK
    pedido: order.number || '',
    nfe: '', // Not in SDK
    numeroOrdemCompra: '', // Not in SDK
    dataPrevisao: '', // Not in SDK (expectedDeliveryDate doesn't exist)
    dataEmissao: isoToDateString(order.date),
    dataEntrega: '', // Not in SDK (deliveryDate doesn't exist)
    status: order.status === 'DRAFT' ? 'rascunho' :
            order.status === 'IN_PROGRESS' ? 'em_andamento' :
            order.status === 'COMPLETED' ? 'finalizado' :
            order.status === 'CANCELLED' ? 'cancelado' : 'rascunho',
    frete: order.freightValue ? '1' : '0',
    valorFrete: order.freightValue || 0,
    despesas: order.expensesValue || 0,
    incluirFreteTotal: false, // Not in SDK
    naturezaOperacao: order.operationNatureId || '',
    prazoPagamento: order.paymentTermId || '',
    observacoes: '', // Not in SDK
  };
}

