import { api } from '@/config/api';

/**
 * Credit Service
 * Uses Next.js API routes via axios (legacy api instance)
 *
 * NOTE: This service uses direct API routes because there's no CreditApiClient in the SDK.
 *
 * TODO: Consider adding CreditApiClient to the SDK in the future.
 * TODO: Migrate from legacy api instance to fetch or SDK when available.
 */
import {
  SolicitacaoCredito,
  FormSolicitacaoCredito,
  DocumentoCredito,
  PropostaCredito,
  CapitalGiro,
  MovimentacaoCapitalGiro,
  AntecipacaoRecebiveis,
  FormEnviarProposta,
  FormUtilizarCapital,
  FormSolicitarAntecipacao,
  DashboardMetrics,
} from '@/types/credit';

// ============================================
// SOLICITAÇÕES DE CRÉDITO
// ============================================

export const criarSolicitacao = async (data: FormSolicitacaoCredito): Promise<SolicitacaoCredito> => {
  const response = await api.post('/api/credit/solicitacoes', data);
  return response.data;
};

export const listarMinhasSolicitacoes = async (): Promise<SolicitacaoCredito[]> => {
  const response = await api.get('/api/credit/solicitacoes');
  return response.data;
};

export const buscarSolicitacao = async (id: string): Promise<SolicitacaoCredito> => {
  const response = await api.get(`/api/credit/solicitacoes/${id}`);
  return response.data;
};

export const atualizarSolicitacao = async (
  id: string,
  data: Partial<FormSolicitacaoCredito>
): Promise<SolicitacaoCredito> => {
  const response = await api.patch(`/api/credit/solicitacoes/${id}`, data);
  return response.data;
};

export const cancelarSolicitacao = async (id: string): Promise<void> => {
  await api.delete(`/api/credit/solicitacoes/${id}`);
};

// ============================================
// DOCUMENTAÇÃO
// ============================================

export const uploadDocumento = async (
  solicitacaoId: string,
  tipoDocumento: string,
  file: File
): Promise<DocumentoCredito> => {
  const formData = new FormData();
  formData.append('solicitacaoId', solicitacaoId);
  formData.append('tipoDocumento', tipoDocumento);
  formData.append('file', file);

  const response = await api.post('/api/credit/documentos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const listarDocumentos = async (solicitacaoId: string): Promise<DocumentoCredito[]> => {
  const response = await api.get(`/api/credit/documentos/${solicitacaoId}`);
  return response.data;
};

export const downloadDocumento = async (id: string): Promise<Blob> => {
  const response = await api.get(`/api/credit/documentos/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export const excluirDocumento = async (id: string): Promise<void> => {
  await api.delete(`/api/credit/documentos/${id}`);
};

export const visualizarDocumento = async (id: string): Promise<string> => {
  const response = await api.get(`/api/credit/documentos/${id}/view`);
  return response.data.url;
};

// ============================================
// PROPOSTAS (Cliente)
// ============================================

export const listarMinhasPropostas = async (): Promise<PropostaCredito[]> => {
  const response = await api.get('/api/credit/propostas');
  return response.data;
};

export const buscarProposta = async (id: string): Promise<PropostaCredito> => {
  const response = await api.get(`/api/credit/proposta/${id}`);
  return response.data;
};

export const aceitarProposta = async (id: string, senha: string): Promise<PropostaCredito> => {
  const response = await api.post(`/api/credit/proposta/${id}/aceitar`, { senha });
  return response.data;
};

export const recusarProposta = async (
  id: string,
  motivo: string,
  comentario?: string
): Promise<PropostaCredito> => {
  const response = await api.post(`/api/credit/proposta/${id}/recusar`, { motivo, comentario });
  return response.data;
};

// ============================================
// CAPITAL DE GIRO
// ============================================

export const buscarMeuCapitalGiro = async (): Promise<CapitalGiro> => {
  const response = await api.get('/api/credit/capital-giro');
  return response.data;
};

export const utilizarCapital = async (data: FormUtilizarCapital): Promise<MovimentacaoCapitalGiro> => {
  const response = await api.post('/api/credit/capital-giro/utilizar', data);
  return response.data;
};

export const buscarExtrato = async (): Promise<MovimentacaoCapitalGiro[]> => {
  const response = await api.get('/api/credit/capital-giro/extrato');
  return response.data;
};

// ============================================
// ANTECIPAÇÃO DE RECEBÍVEIS
// ============================================

export const listarRecebiveis = async (): Promise<any[]> => {
  const response = await api.get('/api/credit/antecipacao/recebiveis');
  return response.data;
};

export const simularAntecipacao = async (titulosIds: string[]): Promise<any> => {
  const response = await api.post('/api/credit/antecipacao/simular', { titulosIds });
  return response.data;
};

export const solicitarAntecipacao = async (data: FormSolicitarAntecipacao): Promise<AntecipacaoRecebiveis> => {
  const response = await api.post('/api/credit/antecipacao/solicitar', data);
  return response.data;
};

export const buscarHistoricoAntecipacao = async (): Promise<AntecipacaoRecebiveis[]> => {
  const response = await api.get('/api/credit/antecipacao/historico');
  return response.data;
};

// ============================================
// ADMIN - DASHBOARD E MÉTRICAS
// ============================================

export const buscarDashboardAdmin = async (): Promise<DashboardMetrics> => {
  const response = await api.get('/api/credit/admin/dashboard');
  return response.data;
};

export const listarTodasSolicitacoes = async (filtros?: any): Promise<SolicitacaoCredito[]> => {
  const response = await api.get('/api/credit/admin/solicitacoes', { params: filtros });
  return response.data;
};

export const buscarSolicitacaoAdmin = async (id: string): Promise<SolicitacaoCredito> => {
  const response = await api.get(`/api/credit/admin/solicitacoes/${id}`);
  return response.data;
};

export const aprovarSolicitacao = async (id: string, data: any): Promise<SolicitacaoCredito> => {
  const response = await api.post(`/api/credit/admin/solicitacoes/${id}/aprovar`, data);
  return response.data;
};

export const reprovarSolicitacao = async (id: string, motivo: string): Promise<SolicitacaoCredito> => {
  const response = await api.post(`/api/credit/admin/solicitacoes/${id}/reprovar`, { motivoReprovacao: motivo });
  return response.data;
};

// ============================================
// ADMIN - PROPOSTAS
// ============================================

export const listarTodasPropostas = async (filtros?: any): Promise<PropostaCredito[]> => {
  const response = await api.get('/api/credit/admin/propostas', { params: filtros });
  return response.data;
};

export const criarProposta = async (data: FormEnviarProposta): Promise<PropostaCredito> => {
  const response = await api.post('/api/credit/admin/proposta/criar', data);
  return response.data;
};

export const ativarCapitalGiro = async (propostaId: string): Promise<CapitalGiro> => {
  const response = await api.post(`/api/credit/admin/proposta/${propostaId}/ativar-credito`);
  return response.data;
};

// ============================================
// ADMIN - DOCUMENTOS
// ============================================

export const validarDocumento = async (
  id: string,
  status: string,
  observacoes?: string
): Promise<DocumentoCredito> => {
  const response = await api.patch(`/api/credit/admin/documento/${id}/validar`, { status, observacoes });
  return response.data;
};

