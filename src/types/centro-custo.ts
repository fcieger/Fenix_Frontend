export interface CentroCusto {
  id: string;
  company_id: string;
  codigo: string;
  descricao: string;
  centro_pai_id?: string;
  ativo: boolean;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
  // Campos calculados
  sub_pastas_count?: number;
  nivel?: number;
  centro_pai?: {
    id: string;
    codigo: string;
    descricao: string;
  };
}

export interface CreateCentroCustoRequest {
  company_id: string;
  codigo: string;
  descricao: string;
  centro_pai_id?: string;
  ativo?: boolean;
  created_by?: string;
}

export interface UpdateCentroCustoRequest {
  codigo?: string;
  descricao?: string;
  centro_pai_id?: string;
  ativo?: boolean;
  updated_by?: string;
}

export interface CentroCustoFilters {
  company_id?: string;
  centro_pai_id?: string | null; // null = apenas nível 1, undefined = todos
  ativo?: boolean;
  search?: string;
}

export interface CentroCustoStats {
  total_centros: number;
  centros_ativos: number;
  centros_inativos: number;
  nivel_1_count: number;
  nivel_2_count: number;
}

