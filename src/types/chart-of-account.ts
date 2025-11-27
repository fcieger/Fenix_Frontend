export interface ChartOfAccount {
  id: string;
  codigo: string;
  descricao: string;
  tipo: 'RECEITA' | 'DESPESA_FIXA' | 'DESPESA_VARIAVEL' | 'PATRIMONIO';
  conta_pai_id?: string;
  nivel: number;
  ativo: boolean;
  company_id: string;
  created_at: string;
  updated_at: string;
  conta_pai?: ChartOfAccount;
  contas_filhas?: ChartOfAccount[];
}

export interface CreateChartOfAccountRequest {
  codigo: string;
  descricao: string;
  tipo: 'RECEITA' | 'DESPESA_FIXA' | 'DESPESA_VARIAVEL' | 'PATRIMONIO';
  conta_pai_id?: string;
  nivel: number;
  ativo: boolean;
  company_id: string;
}

export interface UpdateChartOfAccountRequest {
  codigo?: string;
  descricao?: string;
  tipo?: 'RECEITA' | 'DESPESA_FIXA' | 'DESPESA_VARIAVEL' | 'PATRIMONIO';
  conta_pai_id?: string;
  nivel?: number;
  ativo?: boolean;
}

export interface ChartOfAccountStats {
  total: number;
  ativos: number;
  inativos: number;
  por_tipo: {
    receita: number;
    despesa_fixa: number;
    despesa_variavel: number;
    patrimonio: number;
  };
}

// Legacy exports for backward compatibility
export interface ContaContabil extends ChartOfAccount {}
export interface CreateContaContabilRequest extends CreateChartOfAccountRequest {}
export interface UpdateContaContabilRequest extends UpdateChartOfAccountRequest {}
export interface ContaContabilStats extends ChartOfAccountStats {}


