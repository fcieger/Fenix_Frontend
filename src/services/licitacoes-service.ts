import axios from 'axios';

/**
 * Licitacoes Service
 * Uses Next.js API routes via axios
 *
 * NOTE: This service uses direct API routes because there's no TendersApiClient in the SDK.
 *
 * TODO: Consider adding TendersApiClient to the SDK in the future.
 */

// Usar a URL do próprio Next.js para as rotas da API
const API_URL = typeof window !== 'undefined'
  ? window.location.origin
  : 'http://localhost:3004';

// Helper para obter token e companyId
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('fenix_token') : null;
  const companyId = typeof window !== 'undefined' ? localStorage.getItem('activeCompanyId') : null;

  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    companyId,
  };
}

export interface Licitacao {
  id: string;
  numeroProcesso: string;
  titulo: string;
  descricao: string;
  orgao: string;
  orgaoSigla?: string;
  modalidade: string;
  esfera: string;
  estado: string;
  municipio?: string;
  valorEstimado: number;
  dataAbertura: string;
  dataLimite?: string;
  status: string;
  linkEdital?: string;
  linkSistema?: string;
  fonte: string;
  visualizacoes: number;
  createdAt: string;
}

export interface FiltrosLicitacao {
  estado?: string;
  municipio?: string;
  modalidade?: string;
  modalidades?: string[];
  valorMinimo?: number;
  valorMaximo?: number;
  status?: string;
  busca?: string;
  pagina?: number;
  limite?: number;
}

export interface AlertaLicitacao {
  id?: string;
  nome: string;
  ativo: boolean;
  estados?: string[];
  municipios?: string[];
  modalidades?: string[];
  valorMinimo?: number;
  valorMaximo?: number;
  cnae?: string[];
  palavrasChave?: string[];
  apenasAbertas?: boolean;
  diasAntesEncerramento?: number;
  notificarEmail: boolean;
  notificarPush?: boolean;
  frequencia: 'tempo_real' | 'diaria' | 'semanal';
  horarioNotificacao?: string;
}

export const licitacoesService = {
  async listar(filtros: FiltrosLicitacao = {}) {
    const { headers, companyId } = getAuthHeaders();

    if (!companyId) {
      throw new Error('CompanyId não encontrado. Faça login novamente.');
    }

    const response = await axios.get(`${API_URL}/api/tenders`, {
      params: { ...filtros, companyId },
      headers,
    });
    return response.data;
  },

  async buscarPorId(id: string) {
    const { headers, companyId } = getAuthHeaders();

    const response = await axios.get(`${API_URL}/api/tenders/${id}`, {
      params: { companyId },
      headers,
    });
    return response.data;
  },

  async buscar(filtros: FiltrosLicitacao) {
    const { headers, companyId } = getAuthHeaders();

    const response = await axios.post(`${API_URL}/api/tenders/buscar`,
      { ...filtros, companyId },
      { headers }
    );
    return response.data;
  },

  async estatisticas() {
    const { headers, companyId } = getAuthHeaders();

    if (!companyId) {
      throw new Error('CompanyId não encontrado. Faça login novamente.');
    }

    const response = await axios.get(`${API_URL}/api/tenders/estatisticas`, {
      params: { companyId },
      headers,
    });
    return response.data;
  },

  async buscarMatches(companyId: string) {
    const { headers } = getAuthHeaders();

    const response = await axios.get(`${API_URL}/api/tenders/matches`, {
      params: { companyId },
      headers,
    });
    return response.data;
  },

  async sincronizar(fonte: 'pncp' | 'compras-gov' | 'todas' = 'todas', uf?: string) {
    const { headers, companyId } = getAuthHeaders();

    if (!companyId) {
      throw new Error('CompanyId não encontrado. Faça login novamente.');
    }

    const response = await axios.post(`${API_URL}/api/tenders/sincronizar`,
      { fonte, companyId, uf },
      { headers }
    );
    return response.data;
  },

  async criarAlerta(alerta: AlertaLicitacao, userId: string) {
    const { headers, companyId } = getAuthHeaders();

    const response = await axios.post(`${API_URL}/api/tenders/alertas`,
      alerta,
      {
        params: { userId, companyId },
        headers,
      }
    );
    return response.data;
  },

  async listarAlertas(userId: string) {
    const { headers, companyId } = getAuthHeaders();

    const response = await axios.get(`${API_URL}/api/tenders/alertas`, {
      params: { userId, companyId },
      headers,
    });
    return response.data;
  },

  async atualizarAlerta(id: string, alerta: Partial<AlertaLicitacao>) {
    const { headers } = getAuthHeaders();

    const response = await axios.put(`${API_URL}/api/tenders/alertas/${id}`,
      alerta,
      { headers }
    );
    return response.data;
  },

  async deletarAlerta(id: string) {
    const { headers } = getAuthHeaders();

    const response = await axios.delete(`${API_URL}/api/tenders/alertas/${id}`, {
      headers,
    });
    return response.data;
  },
};

