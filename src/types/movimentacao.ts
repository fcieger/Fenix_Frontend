export interface MovimentacaoFinanceira {
  id: string;
  conta_id: string;
  tipo_movimentacao: 'entrada' | 'saida' | 'transferencia';
  valor_entrada: number;
  valor_saida: number;
  descricao?: string;
  descricao_detalhada?: string;
  data_movimentacao: string;
  saldo_anterior: number;
  saldo_posterior: number;
  saldo_apos_movimentacao?: number;
  situacao?: 'pendente' | 'pago' | 'transferido' | 'cancelado';
  conta_destino_id?: string;
  categoria_id?: string;
  created_at: string;
  created_by?: string;
}

export interface CreateMovimentacaoRequest {
  conta_id: string;
  tipo_movimentacao: string;
  valor_entrada?: number;
  valor_saida?: number;
  descricao?: string;
  descricao_detalhada?: string;
  data_movimentacao: string;
  situacao?: 'pendente' | 'pago' | 'transferido' | 'cancelado';
  conta_destino_id?: string;
  categoria_id?: string;
  created_by?: string;
}

export interface UpdateMovimentacaoRequest {
  descricao?: string;
  data_movimentacao?: string;
  categoria_id?: string;
  updated_by?: string;
}

export interface MovimentacaoFilters {
  conta_id?: string;
  tipo_movimentacao?: string;
  data_inicio?: string;
  data_fim?: string;
  valor_min?: number;
  valor_max?: number;
  limit?: number;
  offset?: number;
}

export interface ResumoFinanceiro {
  total_entradas: number;
  total_saidas: number;
  saldo_atual: number;
  total_contas: number;
  contas_ativas: number;
  movimentacoes_mes: number;
}
