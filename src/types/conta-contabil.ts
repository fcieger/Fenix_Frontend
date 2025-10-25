export interface ContaContabil {
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
  // Relacionamentos
  conta_pai?: ContaContabil;
  contas_filhas?: ContaContabil[];
}

export interface CreateContaContabilRequest {
  codigo: string;
  descricao: string;
  tipo: 'RECEITA' | 'DESPESA_FIXA' | 'DESPESA_VARIAVEL' | 'PATRIMONIO';
  conta_pai_id?: string;
  nivel: number;
  ativo: boolean;
  company_id: string;
}

export interface UpdateContaContabilRequest {
  codigo?: string;
  descricao?: string;
  tipo?: 'RECEITA' | 'DESPESA_FIXA' | 'DESPESA_VARIAVEL' | 'PATRIMONIO';
  conta_pai_id?: string;
  nivel?: number;
  ativo?: boolean;
}

export interface ContaContabilStats {
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
