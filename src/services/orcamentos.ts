import axios from 'axios';
import { Orcamento } from '../types/orcamento';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function listarOrcamentos(params?: any) {
  const { data } = await axios.get(`${API}/api/orcamentos`, { params });
  return data;
}

export async function obterOrcamento(id: string) {
  const { data } = await axios.get(`${API}/api/orcamentos/${id}`);
  return data;
}

export async function criarOrcamento(payload: Orcamento) {
  const { data } = await axios.post(`${API}/api/orcamentos`, payload);
  return data;
}

export async function atualizarOrcamento(id: string, payload: Partial<Orcamento>) {
  const { data } = await axios.put(`${API}/api/orcamentos/${id}`, payload);
  return data;
}

export async function alterarStatusOrcamento(id: string, status: 'pendente'|'concluido') {
  const { data } = await axios.patch(`${API}/api/orcamentos/${id}/status`, { status });
  return data;
}

export async function recalcularImpostos(id: string) {
  const { data } = await axios.post(`${API}/api/orcamentos/${id}/recalcular-impostos`);
  return data;
}

export async function excluirOrcamento(id: string) {
  const { data } = await axios.delete(`${API}/api/orcamentos/${id}`);
  return data;
}



