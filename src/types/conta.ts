export interface ContaFinanceira {
  id: string;
  company_id: string;
  tipo_conta: 'conta_corrente' | 'caixinha' | 'cartao_credito' | 'poupanca' | 'investimento' | 'aplicacao_automatica' | 'outro_tipo';
  descricao: string;
  banco_id: string;
  banco_nome: string;
  banco_codigo: string;
  numero_agencia?: string;
  numero_conta?: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  ultimos_4_digitos?: string;
  bandeira_cartao?: string;
  emissor_cartao?: string;
  conta_padrao_pagamento?: string;
  dia_fechamento?: number;
  dia_vencimento?: number;
  modalidade?: 'pf' | 'pj';
  conta_corrente_vinculada?: string;
  saldo_inicial: number;
  saldo_atual: number;
  data_saldo: string;
  data_abertura: string;
  data_ultima_atualizacao: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateContaFinanceiraRequest {
  company_id: string;
  tipo_conta: string;
  descricao: string;
  banco_id: string;
  banco_nome: string;
  banco_codigo: string;
  numero_agencia?: string;
  numero_conta?: string;
  tipo_pessoa?: string;
  ultimos_4_digitos?: string;
  bandeira_cartao?: string;
  emissor_cartao?: string;
  conta_padrao_pagamento?: string;
  dia_fechamento?: number;
  dia_vencimento?: number;
  modalidade?: string;
  conta_corrente_vinculada?: string;
  saldo_inicial: number;
  data_saldo: string;
  created_by?: string;
}

export interface UpdateContaFinanceiraRequest {
  descricao?: string;
  numero_agencia?: string;
  numero_conta?: string;
  tipo_pessoa?: string;
  ultimos_4_digitos?: string;
  bandeira_cartao?: string;
  emissor_cartao?: string;
  conta_padrao_pagamento?: string;
  dia_fechamento?: number;
  dia_vencimento?: number;
  modalidade?: string;
  conta_corrente_vinculada?: string;
  status?: string;
  updated_by?: string;
}

export interface ContaFinanceiraFilters {
  company_id?: string;
  tipo_conta?: string;
  status?: string;
  banco_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

