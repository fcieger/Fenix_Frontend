// Tipos e Status
export type StatusSolicitacao = 
  | 'em_analise' 
  | 'aguardando_documentos' 
  | 'documentacao_completa' 
  | 'aprovado' 
  | 'reprovado'
  | 'proposta_enviada';

export type StatusProposta = 
  | 'enviada' 
  | 'visualizada' 
  | 'aceita' 
  | 'recusada' 
  | 'expirada';

export type TipoDocumento = 
  | 'documento_socio'
  | 'documento_socio_1'
  | 'documento_socio_2'
  | 'contrato_social'
  | 'comprovante_faturamento'
  | 'comprovante_endereco'
  | 'comprovante_endereco_empresa'
  | 'comprovante_endereco_socio_1'
  | 'comprovante_endereco_socio_2'
  | 'comprovante_estado_civil'
  | 'fotos_empresa'
  | 'ir_socio_1'
  | 'ir_socio_2'
  | 'declaracao_faturamento'
  | 'extrato_conta_corrente'
  | 'certidao_negativa'
  | 'balanco_patrimonial'
  | 'dre'
  | 'outros';

export type TipoGarantia = 
  | 'imovel' 
  | 'veiculos' 
  | 'recebiveis' 
  | 'aval';

// Interfaces Principais
export interface SolicitacaoCredito {
  id: string;
  empresaId: string;
  usuarioId: string;
  
  // Dados da Solicitação
  valorSolicitado: number;
  finalidade: string;
  tipoGarantia?: string;
  descricaoGarantia?: string;
  
  // Dados Complementares
  faturamentoMedio?: number;
  tempoAtividadeAnos?: number;
  numeroFuncionarios?: number;
  possuiRestricoes: boolean;
  observacoes?: string;
  
  // Status
  status: StatusSolicitacao;
  motivoReprovacao?: string;
  dataAprovacao?: string;
  dataReprovacao?: string;
  aprovadoPor?: string;
  
  // Relacionamentos
  documentos?: DocumentoCredito[];
  analises?: AnaliseCredito[];
  propostas?: PropostaCredito[];
  empresa?: any;
  usuario?: any;
  
  // Auditoria
  createdAt: string;
  updatedAt: string;
}

export interface DocumentoCredito {
  id: string;
  solicitacaoId: string;
  tipoDocumento: TipoDocumento;
  nomeArquivo: string;
  caminhoArquivo: string;
  tamanhoBytes: number;
  mimeType: string;
  status: 'pendente' | 'aprovado' | 'reprovado' | 'substituir';
  observacoes?: string;
  validadoPor?: string;
  dataValidacao?: string;
  createdAt: string;
}

export interface AnaliseCredito {
  id: string;
  solicitacaoId: string;
  analistaId: string;
  scoreCredito?: number;
  riscoClassificacao?: 'baixo' | 'medio' | 'alto';
  parecerTecnico: string;
  valorAprovado?: number;
  taxaJuros?: number;
  prazoMeses?: number;
  condicoesEspeciais?: string;
  garantiasExigidas?: string;
  status: string;
  createdAt: string;
}

export interface PropostaCredito {
  id: string;
  solicitacaoId: string;
  empresaId: string;
  
  // Identificação
  numeroProposta: string;
  
  // Dados da Proposta
  instituicaoFinanceira: string;
  valorAprovado: number;
  taxaJuros: number;
  taxaIntermediacao: number;
  prazoMeses: number;
  
  // Cálculos
  valorParcela?: number;
  cet?: number;
  iof?: number;
  valorTotalPagar?: number;
  
  // Condições
  observacoes?: string;
  condicoesGerais?: string;
  
  // Status
  status: StatusProposta;
  
  // Aceite/Recusa
  dataAceite?: string;
  dataRecusa?: string;
  motivoRecusa?: string;
  ipAceite?: string;
  
  // Validade
  dataEnvio: string;
  dataExpiracao: string;
  
  // Controle
  enviadaPor: string;
  visualizadaEm?: string;
  
  // Relacionamentos
  solicitacao?: SolicitacaoCredito;
  
  // Auditoria
  createdAt: string;
  updatedAt: string;
}

export interface CapitalGiro {
  id: string;
  solicitacaoId: string;
  empresaId: string;
  propostaId?: string;
  
  // Valores
  valorLiberado: number;
  valorUtilizado: number;
  limiteDisponivel: number;
  
  // Condições
  taxaJuros: number;
  prazoMeses: number;
  dataVencimento: string;
  
  // Status
  status: 'ativo' | 'suspenso' | 'encerrado';
  
  // Relacionamentos
  proposta?: PropostaCredito;
  movimentacoes?: MovimentacaoCapitalGiro[];
  
  // Auditoria
  createdAt: string;
  updatedAt: string;
}

export interface MovimentacaoCapitalGiro {
  id: string;
  capitalGiroId: string;
  tipo: 'utilizacao' | 'pagamento' | 'juros';
  valor: number;
  descricao?: string;
  saldoAnterior: number;
  saldoPosterior: number;
  createdAt: string;
}

export interface AntecipacaoRecebiveis {
  id: string;
  empresaId: string;
  solicitacaoId?: string;
  valorTotalRecebiveis: number;
  valorAntecipado: number;
  taxaDesconto: number;
  valorLiquido: number;
  quantidadeTitulos: number;
  dataVencimentoOriginal: string;
  dataAntecipacao: string;
  status: 'pendente' | 'aprovado' | 'liberado' | 'pago';
  createdAt: string;
  updatedAt: string;
}

// Interfaces de Formulários
export interface FormSolicitacaoCredito {
  valorSolicitado: number;
  finalidade: string;
  tipoGarantia: string | string[]; // Permite uma ou múltiplas garantias
  descricaoGarantia?: string;
  faturamentoMedio?: number;
  tempoAtividadeAnos?: number;
  numeroFuncionarios?: number;
  possuiRestricoes: boolean;
  observacoes?: string;
}

export interface FormEnviarProposta {
  solicitacaoId: string;
  instituicaoFinanceira: string;
  valorAprovado: number;
  taxaJuros: number;
  taxaIntermediacao: number;
  prazoMeses: number;
  diasValidade: number;
  observacoes?: string;
  condicoesGerais?: string;
}

export interface FormUtilizarCapital {
  valor: number;
  descricao: string;
}

export interface FormSolicitarAntecipacao {
  titulosIds: string[];
}

export interface AceiteProposta {
  propostaId: string;
  senha: string;
}

export interface RecusaProposta {
  propostaId: string;
  motivo: string;
  comentario?: string;
}

// Interfaces de Resposta/Dashboard
export interface DashboardMetrics {
  totalSolicitacoes: number;
  emAnalise: number;
  aprovadas: number;
  reprovadas: number;
  propostasPendentes: number;
  documentosPendentes: number;
  taxaAprovacao: number;
}

export interface SimulacaoProposta {
  valorParcela: number;
  cet: number;
  iof: number;
  valorTotalPagar: number;
  parcelas: Parcela[];
}

export interface Parcela {
  numero: number;
  valor: number;
  juros: number;
  amortizacao: number;
  saldo: number;
}

