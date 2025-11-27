import axios from 'axios';

/**
 * Lookups Service
 * Helper service for common lookups
 *
 * NOTE: This service uses direct API calls to various endpoints.
 * These are utility functions that could potentially use SDK clients (partners, products, etc.)
 * but are kept as-is for simplicity.
 *
 * TODO: Consider refactoring to use SDK clients (partners-service, products-service, etc.)
 */

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function buscarCadastros(query: string, tipos?: string[]) {
  const { data } = await axios.get(`${API}/api/partners`, { params: { query, tipos: tipos?.join(',') } });
  return data;
}

export async function listarPrazosPagamento(companyId: string) {
  const { data } = await axios.get(`${API}/api/prazos-pagamento`, { params: { companyId, ativos: true } });
  return data;
}

export async function listarNaturezasOperacao(companyId: string) {
  const { data } = await axios.get(`${API}/api/natureza-operacao`, { params: { companyId, habilitadas: true } });
  return data;
}

export async function buscarProdutos(query: string, companyId: string) {
  const { data } = await axios.get(`${API}/api/products`, { params: { query, companyId } });
  return data;
}



