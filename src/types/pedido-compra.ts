export type StatusPedidoCompra = 'rascunho' | 'pendente' | 'em_preparacao' | 'enviado' | 'entregue' | 'cancelado' | 'faturado';

export interface PedidoCompraItem {
  id?: string;
  pedidoCompraId?: string;
  companyId: string;
  produtoId?: string | null;
  naturezaOperacaoId: string;
  codigo: string;
  nome: string;
  unidade: string;
  ncm?: string;
  cest?: string;
  quantidade: number;
  precoUnitario: number;
  descontoValor?: number;
  descontoPercentual?: number;
  freteRateado?: number;
  seguroRateado?: number;
  outrasDespesasRateado?: number;
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
  totalItem: number;
  observacoes?: string;
  numeroItem?: number;
}

export interface PedidoCompra {
  id?: string;
  numero?: string;
  serie?: string;
  numeroOrdemCompra?: string;
  dataEmissao: string;
  dataPrevisaoEntrega?: string;
  dataEntrega?: string;
  fornecedorId: string;
  compradorId?: string;
  transportadoraId?: string;
  prazoPagamentoId?: string;
  naturezaOperacaoPadraoId?: string;
  formaPagamentoId?: string;
  parcelamento?: string;
  consumidorFinal?: boolean;
  indicadorPresenca?: string;
  localEstoqueId?: string;
  listaPreco?: string;
  frete?: string;
  valorFrete?: number;
  despesas?: number;
  incluirFreteTotal?: boolean;
  placaVeiculo?: string;
  ufPlaca?: string;
  rntc?: string;
  pesoLiquido?: number;
  pesoBruto?: number;
  volume?: number;
  especie?: string;
  marca?: string;
  numeracao?: string;
  quantidadeVolumes?: number;
  totalProdutos?: number;
  totalDescontos?: number;
  totalImpostos?: number;
  totalGeral?: number;
  observacoes?: string;
  status?: StatusPedidoCompra;
  companyId: string;
  itens: PedidoCompraItem[];
}







