import axios from 'axios';
import { PedidoCompra } from '../types/pedido-compra';

// Sempre usar URL relativa porque as rotas de compras estão no Next.js
const getApiUrl = () => {
  // Sempre URL relativa para Next.js API routes
  return typeof window !== 'undefined' ? '' : 'http://localhost:3004';
};

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

export async function listarPedidosCompra(params?: any) {
  try {
    const apiUrl = getApiUrl();
    const url = `${apiUrl}/api/pedidos-compra`;
    console.log('[PedidosCompra Service] Listando pedidos, URL:', url, 'Params:', params);
    
    const { data } = await axios.get(url, { 
      params,
      headers: getAuthHeaders()
    });
    
    console.log('[PedidosCompra Service] Resposta completa:', JSON.stringify(data, null, 2));
    
    // A API Next.js retorna { success: true, data: [...] }
    const resultado = data?.data || data || [];
    console.log('[PedidosCompra Service] Pedidos retornados:', Array.isArray(resultado) ? resultado.length : 'não é array');
    
    return resultado;
  } catch (error: any) {
    console.error('[PedidosCompra Service] Erro ao listar pedidos:', error);
    console.error('[PedidosCompra Service] Resposta do servidor:', error?.response?.data);
    console.error('[PedidosCompra Service] Status:', error?.response?.status);
    console.error('[PedidosCompra Service] Status Text:', error?.response?.statusText);
    
    // Re-throw com mensagem melhorada
    if (error?.response?.data) {
      const errorData = error.response.data;
      const errorMessage = errorData.error || errorData.message || 'Erro ao carregar pedidos de compra';
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).response = error.response;
      (enhancedError as any).details = errorData.details;
      throw enhancedError;
    }
    
    throw error;
  }
}

export async function obterPedidoCompra(id: string, companyId?: string) {
  try {
    const apiUrl = getApiUrl();
    const url = `${apiUrl}/api/pedidos-compra/${id}`;
    
    // Adicionar company_id como query parameter se fornecido
    const params = companyId ? { company_id: companyId } : {};
    
    console.log('[PedidosCompra Service] Obtendo pedido, URL:', url, 'Params:', params);
    
    const { data } = await axios.get(url, {
      params,
      headers: getAuthHeaders()
    });
    
    console.log('[PedidosCompra Service] Resposta completa:', JSON.stringify(data, null, 2));
    
    // A API Next.js retorna { success: true, data: {...} }
    const resultado = data?.data || data;
    console.log('[PedidosCompra Service] Pedido obtido com sucesso');
    
    return resultado;
  } catch (error: any) {
    console.error('[PedidosCompra Service] Erro ao obter pedido:', error);
    console.error('[PedidosCompra Service] Status:', error?.response?.status);
    console.error('[PedidosCompra Service] Status Text:', error?.response?.statusText);
    console.error('[PedidosCompra Service] Resposta do servidor:', error?.response?.data);
    
    // Melhorar mensagem de erro
    if (error?.response?.data) {
      const errorData = error.response.data;
      let errorMessage = errorData.error || errorData.message || 'Erro ao obter pedido de compra';
      
      // Adicionar detalhes se disponíveis
      if (errorData.details && Array.isArray(errorData.details)) {
        errorMessage += '\n\nDetalhes:\n' + errorData.details.join('\n');
      } else if (errorData.details) {
        errorMessage += '\n\nDetalhes: ' + JSON.stringify(errorData.details);
      }
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).response = error.response;
      (enhancedError as any).details = errorData.details;
      (enhancedError as any).status = error?.response?.status;
      throw enhancedError;
    }
    
    throw error;
  }
}

export async function criarPedidoCompra(payload: PedidoCompra) {
  try {
    console.log('[PedidosCompra Service] Criando pedido, payload:', JSON.stringify(payload, null, 2));
    const apiUrl = getApiUrl();
    const url = `${apiUrl}/api/pedidos-compra`;
    console.log('[PedidosCompra Service] URL da requisição:', url);
    
    const { data } = await axios.post(url, payload, {
      headers: getAuthHeaders()
    });
    
    console.log('[PedidosCompra Service] Resposta completa:', JSON.stringify(data, null, 2));
    
    // A API Next.js retorna { success: true, data: {...} }
    const resultado = data?.data || data;
    console.log('[PedidosCompra Service] Resultado extraído:', resultado?.id ? `Pedido ${resultado.numero || resultado.id} criado` : 'Sem ID no resultado');
    
    return resultado;
  } catch (error: any) {
    console.error('[PedidosCompra Service] Erro ao criar pedido:', error);
    console.error('[PedidosCompra Service] Resposta do servidor:', error?.response?.data);
    console.error('[PedidosCompra Service] Status:', error?.response?.status);
    console.error('[PedidosCompra Service] Status Text:', error?.response?.statusText);
    console.error('[PedidosCompra Service] Headers:', error?.response?.headers);
    console.error('[PedidosCompra Service] Payload enviado:', JSON.stringify(payload, null, 2));
    console.error('[PedidosCompra Service] URL:', `${getApiUrl()}/api/pedidos-compra`);
    
    // Melhorar mensagem de erro
    const errorData = error?.response?.data;
    if (errorData) {
      let errorMessage = errorData.error || errorData.message || 'Erro ao criar pedido de compra';
      
      // Adicionar detalhes se disponíveis
      if (errorData.details && Array.isArray(errorData.details)) {
        errorMessage += '\n\nDetalhes:\n' + errorData.details.join('\n');
      } else if (errorData.details) {
        errorMessage += '\n\nDetalhes: ' + JSON.stringify(errorData.details);
      }
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).response = error.response;
      (enhancedError as any).details = errorData.details;
      (enhancedError as any).status = error?.response?.status;
      throw enhancedError;
    }
    
    // Se não houver resposta do servidor, pode ser que a rota não existe
    if (!error?.response) {
      const enhancedError = new Error(`Erro de conexão: Verifique se a rota ${getApiUrl()}/api/pedidos-compra está disponível. ${error?.message || ''}`);
      throw enhancedError;
    }
    
    // Se houver status mas sem data, construir mensagem básica
    if (error?.response?.status && !errorData) {
      const enhancedError = new Error(`Erro HTTP ${error.response.status}: ${error.response.statusText || 'Erro desconhecido'}`);
      (enhancedError as any).response = error.response;
      (enhancedError as any).status = error.response.status;
      throw enhancedError;
    }
    
    // Re-throw para que o componente possa tratar
    throw error;
  }
}

export async function atualizarPedidoCompra(id: string, payload: Partial<PedidoCompra>) {
  try {
    const apiUrl = getApiUrl();
    const url = `${apiUrl}/api/pedidos-compra/${id}`;
    console.log('[PedidosCompra Service] Atualizando pedido, URL:', url);
    console.log('[PedidosCompra Service] Payload:', JSON.stringify(payload, null, 2));
    
    const { data } = await axios.put(url, payload, {
      headers: getAuthHeaders()
    });
    
    console.log('[PedidosCompra Service] Resposta completa:', JSON.stringify(data, null, 2));
    
    // A API Next.js retorna { success: true, data: {...} }
    const resultado = data?.data || data;
    console.log('[PedidosCompra Service] Pedido atualizado com sucesso');
    
    return resultado;
  } catch (error: any) {
    console.error('[PedidosCompra Service] Erro ao atualizar pedido:', error);
    console.error('[PedidosCompra Service] Status:', error?.response?.status);
    console.error('[PedidosCompra Service] Status Text:', error?.response?.statusText);
    console.error('[PedidosCompra Service] Resposta do servidor:', error?.response?.data);
    console.error('[PedidosCompra Service] Payload enviado:', JSON.stringify(payload, null, 2));
    
    // Melhorar mensagem de erro para incluir detalhes do backend
    if (error?.response?.data) {
      const errorData = error.response.data;
      let errorMessage = errorData.error || errorData.message || 'Erro ao atualizar pedido de compra';
      
      // Adicionar detalhes se disponíveis
      if (errorData.details && Array.isArray(errorData.details)) {
        errorMessage += '\n\nDetalhes:\n' + errorData.details.join('\n');
      } else if (errorData.details) {
        errorMessage += '\n\nDetalhes: ' + JSON.stringify(errorData.details);
      }
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).response = error.response;
      (enhancedError as any).details = errorData.details;
      (enhancedError as any).status = error?.response?.status;
      throw enhancedError;
    }
    
    // Se não houver resposta do servidor, pode ser que a rota não existe
    if (!error?.response) {
      const enhancedError = new Error(`Erro de conexão: Verifique se a rota ${getApiUrl()}/api/pedidos-compra/${id} está disponível. ${error?.message || ''}`);
      throw enhancedError;
    }
    
    // Re-throw para que o componente possa tratar
    throw error;
  }
}

export async function recalcularImpostos(id: string) {
  const apiUrl = getApiUrl();
  const { data } = await axios.post(`${apiUrl}/api/pedidos-compra/${id}/recalcular-impostos`, {}, {
    headers: getAuthHeaders()
  });
  // A API Next.js retorna { success: true, data: {...} }
  return data?.data || data;
}

export async function excluirPedidoCompra(id: string) {
  const apiUrl = getApiUrl();
  const { data } = await axios.delete(`${apiUrl}/api/pedidos-compra/${id}`, {
    headers: getAuthHeaders()
  });
  // A API Next.js retorna { success: true, ... }
  return data?.data || data;
}

export async function entregarPedidoCompra(
  pedidoId: string,
  companyId: string,
  localEstoqueId: string,
  naturezaOperacao: any,
  itens: any[],
  status: string
) {
  try {
    // Usar URL relativa porque a rota está no Next.js (frontend), não no backend
    const { data } = await axios.post(`/api/pedidos-compra/entregar`, {
      pedidoId,
      companyId,
      localEstoqueId,
      naturezaOperacao,
      itens,
      status
    }, {
      headers: getAuthHeaders()
    });
    return data;
  } catch (error: any) {
    console.error('[PedidosCompra Service] Erro ao entregar pedido:', error);
    console.error('[PedidosCompra Service] Resposta do servidor:', error?.response?.data);
    console.error('[PedidosCompra Service] Status:', error?.response?.status);
    console.error('[PedidosCompra Service] Erro completo:', JSON.stringify(error?.response?.data, null, 2));
    
    // Melhorar mensagem de erro
    const errorData = error?.response?.data;
    if (errorData) {
      const errorMessage = errorData.error || errorData.message || 'Erro ao entregar pedido';
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).response = error.response;
      throw enhancedError;
    }
    
    throw error;
  }
}
