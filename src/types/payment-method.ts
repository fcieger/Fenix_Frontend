export interface PaymentMethod {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  padrao: boolean;
  companyId: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodRequest {
  nome: string;
  descricao?: string;
  ativo?: boolean;
  padrao?: boolean;
  company_id: string;
}

export interface UpdatePaymentMethodRequest {
  id: string;
  nome?: string;
  descricao?: string;
  ativo?: boolean;
  padrao?: boolean;
}

// Legacy exports for backward compatibility
export interface FormaPagamento extends PaymentMethod {}
export interface CreateFormaPagamentoRequest extends CreatePaymentMethodRequest {}
export interface UpdateFormaPagamentoRequest extends UpdatePaymentMethodRequest {}


