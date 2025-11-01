import axios from 'axios';
import { PedidoVenda } from '../types/pedido-venda';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Função auxiliar para obter o token de autenticação
const getToken = (): string | null => {
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

export async function listarPedidosVenda(params?: any) {
  const { data } = await axios.get(`${API}/api/pedidos-venda`, { 
    params,
    headers: getAuthHeaders()
  });
  return data;
}

export async function obterPedidoVenda(id: string) {
  const { data } = await axios.get(`${API}/api/pedidos-venda/${id}`, {
    headers: getAuthHeaders()
  });
  return data;
}

export async function criarPedidoVenda(payload: PedidoVenda) {
  try {
    const { data } = await axios.post(`${API}/api/pedidos-venda`, payload, {
      headers: getAuthHeaders()
    });
    return data;
  } catch (error: any) {
    console.error('[PedidosVenda Service] Erro ao criar pedido:', error);
    console.error('[PedidosVenda Service] Resposta do servidor:', error?.response?.data);
    // Re-throw para que o componente possa tratar
    throw error;
  }
}

export async function atualizarPedidoVenda(id: string, payload: Partial<PedidoVenda>) {
  try {
    const { data } = await axios.put(`${API}/api/pedidos-venda/${id}`, payload, {
      headers: getAuthHeaders()
    });
    return data;
  } catch (error: any) {
    console.error('[PedidosVenda Service] Erro ao atualizar pedido:', error);
    console.error('[PedidosVenda Service] Resposta do servidor:', error?.response?.data);
    console.error('[PedidosVenda Service] Payload enviado:', JSON.stringify(payload, null, 2));
    
    // Melhorar mensagem de erro para incluir detalhes do backend
    if (error?.response?.data) {
      const errorMessage = typeof error.response.data === 'string' 
        ? error.response.data 
        : error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).response = error.response;
      throw enhancedError;
    }
    
    // Re-throw para que o componente possa tratar
    throw error;
  }
}

export async function criarPedidoVendaFromOrcamento(orcamentoId: string, ajustes?: any) {
  const { data } = await axios.post(`${API}/api/pedidos-venda/from-orcamento/${orcamentoId}`, ajustes || {}, {
    headers: getAuthHeaders()
  });
  return data;
}

export async function recalcularImpostos(id: string) {
  const { data } = await axios.post(`${API}/api/pedidos-venda/${id}/recalcular-impostos`, {}, {
    headers: getAuthHeaders()
  });
  return data;
}

export async function excluirPedidoVenda(id: string) {
  const { data } = await axios.delete(`${API}/api/pedidos-venda/${id}`, {
    headers: getAuthHeaders()
  });
  return data;
}
