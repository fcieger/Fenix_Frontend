import axios from 'axios';
import { Orcamento } from '../types/orcamento';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Função auxiliar para obter token
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fenix_token');
};

// Função auxiliar para criar headers com autenticação
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export async function listarOrcamentos(params?: any) {
  const { data } = await axios.get(`${API}/api/orcamentos`, { 
    params,
    headers: getAuthHeaders()
  });
  return data;
}

export async function obterOrcamento(id: string) {
  const { data } = await axios.get(`${API}/api/orcamentos/${id}`, {
    headers: getAuthHeaders()
  });
  return data;
}

export async function criarOrcamento(payload: Orcamento) {
  try {
    // Mapear status do frontend para o formato do backend
    // Frontend: 'rascunho' | 'enviado' | 'perdido' | 'ganho'
    // Backend: 'pendente' | 'concluido'
    const statusMap: Record<string, string> = {
      'rascunho': 'pendente',
      'enviado': 'pendente',
      'perdido': 'concluido',
      'ganho': 'concluido',
    };
    
    const payloadToSend = {
      ...payload,
      status: payload.status ? (statusMap[payload.status] || 'pendente') : 'pendente',
    };
    
    console.log('[Orcamentos Service] Criando orçamento, payload original:', JSON.stringify(payload, null, 2));
    console.log('[Orcamentos Service] Payload mapeado para backend:', JSON.stringify(payloadToSend, null, 2));
    
    const { data } = await axios.post(`${API}/api/orcamentos`, payloadToSend, {
      headers: getAuthHeaders()
    });
    console.log('[Orcamentos Service] Orçamento criado com sucesso:', data);
    return data;
  } catch (error: any) {
    console.error('[Orcamentos Service] Erro ao criar orçamento:', error);
    console.error('[Orcamentos Service] Resposta do servidor:', error?.response?.data);
    console.error('[Orcamentos Service] Status:', error?.response?.status);
    console.error('[Orcamentos Service] Payload enviado:', JSON.stringify(payload, null, 2));
    
    // Melhorar mensagem de erro
    const errorData = error?.response?.data;
    if (errorData) {
      const errorMessage = Array.isArray(errorData.message) 
        ? errorData.message.join(', ') 
        : (errorData.message || errorData.error || 'Erro ao criar orçamento');
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).response = error.response;
      throw enhancedError;
    }
    
    throw error;
  }
}

export async function atualizarOrcamento(id: string, payload: Partial<Orcamento>) {
  // Mapear status do frontend para o formato do backend
  const statusMap: Record<string, string> = {
    'rascunho': 'pendente',
    'enviado': 'pendente',
    'perdido': 'concluido',
    'ganho': 'concluido',
  };
  
  const payloadToSend = {
    ...payload,
    ...(payload.status && { status: statusMap[payload.status] || 'pendente' }),
  };
  
  const { data } = await axios.put(`${API}/api/orcamentos/${id}`, payloadToSend, {
    headers: getAuthHeaders()
  });
  return data;
}

export async function alterarStatusOrcamento(id: string, status: 'pendente'|'concluido') {
  const { data } = await axios.patch(`${API}/api/orcamentos/${id}/status`, { status }, {
    headers: getAuthHeaders()
  });
  return data;
}

export async function recalcularImpostos(id: string) {
  const { data } = await axios.post(`${API}/api/orcamentos/${id}/recalcular-impostos`, {}, {
    headers: getAuthHeaders()
  });
  return data;
}

export async function excluirOrcamento(id: string) {
  const { data } = await axios.delete(`${API}/api/orcamentos/${id}`, {
    headers: getAuthHeaders()
  });
  return data;
}



