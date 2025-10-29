export interface FormaPagamento {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  padrao: boolean;
  companyId: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFormaPagamentoRequest {
  nome: string;
  descricao?: string;
  ativo?: boolean;
  padrao?: boolean;
  company_id: string;
}

export interface UpdateFormaPagamentoRequest {
  id: string;
  nome?: string;
  descricao?: string;
  ativo?: boolean;
  padrao?: boolean;
}

