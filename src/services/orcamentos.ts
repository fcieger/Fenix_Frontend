import axios from 'axios';
import { Orcamento } from '../types/orcamento';

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
  const { data } = await axios.get(`/api/orcamentos`, { 
    params,
    headers: getAuthHeaders()
  });
  return data;
}

export async function obterOrcamento(id: string) {
  const { data } = await axios.get(`/api/orcamentos/${id}`, {
    headers: getAuthHeaders()
  });
  return data;
}

export async function criarOrcamento(payload: Orcamento) {
  const { data } = await axios.post(`/api/orcamentos`, payload, {
    headers: getAuthHeaders()
  });
  return data;
}

export async function atualizarOrcamento(id: string, payload: Partial<Orcamento>) {
  const { data } = await axios.put(`/api/orcamentos/${id}`, payload, {
    headers: getAuthHeaders()
  });
  return data;
}

export async function alterarStatusOrcamento(id: string, status: 'pendente'|'concluido') {
  const { data } = await axios.patch(`/api/orcamentos/${id}/status`, { status }, {
    headers: getAuthHeaders()
  });
  return data;
}

export async function recalcularImpostos(id: string) {
  const { data } = await axios.post(`/api/orcamentos/${id}/recalcular-impostos`, {}, {
    headers: getAuthHeaders()
  });
  return data;
}

export async function excluirOrcamento(id: string) {
  const { data } = await axios.delete(`/api/orcamentos/${id}`, {
    headers: getAuthHeaders()
  });
  return data;
}



