import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function buscarCadastros(query: string, tipos?: string[]) {
  const { data } = await axios.get(`${API}/api/cadastros`, { params: { query, tipos: tipos?.join(',') } });
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
  const { data } = await axios.get(`${API}/api/produtos`, { params: { query, companyId } });
  return data;
}



