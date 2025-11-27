export interface CostCenter {
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
  sub_pastas_count?: number;
  nivel?: number;
  centro_pai?: {
    id: string;
    codigo: string;
    descricao: string;
  };
}

export interface CreateCostCenterRequest {
  company_id: string;
  codigo: string;
  descricao: string;
  centro_pai_id?: string;
  ativo?: boolean;
  created_by?: string;
}

export interface UpdateCostCenterRequest {
  codigo?: string;
  descricao?: string;
  centro_pai_id?: string;
  ativo?: boolean;
  updated_by?: string;
}

export interface CostCenterFilters {
  company_id?: string;
  centro_pai_id?: string | null;
  ativo?: boolean;
  search?: string;
}

export interface CostCenterStats {
  total_centros: number;
  centros_ativos: number;
  centros_inativos: number;
  nivel_1_count: number;
  nivel_2_count: number;
}

// Legacy exports for backward compatibility
export interface CentroCusto extends CostCenter {}
export interface CreateCentroCustoRequest extends CreateCostCenterRequest {}
export interface UpdateCentroCustoRequest extends UpdateCostCenterRequest {}
export interface CentroCustoFilters extends CostCenterFilters {}
export interface CentroCustoStats extends CostCenterStats {}


