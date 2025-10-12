import { API_CONFIG } from '@/config/api'

const API_BASE_URL = API_CONFIG.BASE_URL

export interface RegisterData {
  user: {
    name: string
    email: string
    phone: string
    password: string
  }
  company: {
    cnpj: string
    name: string
  }
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: string
    email: string
    name: string
    phone: string
    companies: Array<{
      id: string
      cnpj: string
      name: string
      token: string
    }>
  }
}

export interface ApiError {
  message: string
  statusCode: number
}

export interface CadastroData {
  nomeRazaoSocial: string
  nomeFantasia?: string
  tipoPessoa: 'Pessoa Física' | 'Pessoa Jurídica'
  cpf?: string
  cnpj?: string
  tiposCliente?: {
    cliente: boolean
    vendedor: boolean
    fornecedor: boolean
    funcionario: boolean
    transportadora: boolean
    prestadorServico: boolean
  }
  email?: string
  pessoaContato?: string
  telefoneComercial?: string
  celular?: string
  cargo?: string
  celularContato?: string
  optanteSimples?: boolean
  orgaoPublico?: boolean
  ie?: string
  im?: string
  suframa?: string
  enderecos?: Array<{
    tipo: string
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
    principal: boolean
  }>
  observacoes?: string
  userId?: string
  companyId?: string
}

export interface ProdutoData {
  id?: string
  nome: string
  apelido?: string
  sku?: string
  descricao?: string
  ativo?: boolean
  tipoProduto?: string
  unidadeMedida?: string
  marca?: string
  referencia?: string
  codigoBarras?: string
  ncm?: string
  cest?: string
  tipoProdutoSped?: string
  origemProdutoSped?: string
  categoria?: string
  categoriaProduto?: string
  custo?: number
  preco?: number
  precoCusto?: number
  precoVenda?: number
  produtoInativo?: boolean
  usarApelidoComoNomePrincipal?: boolean
  integracaoMarketplace?: boolean
  
  // Dimensões e Peso
  peso?: number
  altura?: number
  largura?: number
  comprimento?: number
  profundidade?: number
  pesoLiquido?: number
  pesoBruto?: number
  
  // Embalagem
  alturaEmbalagem?: number
  larguraEmbalagem?: number
  profundidadeEmbalagem?: number
  pesoEmbalagem?: number
  quantidadePorEmbalagem?: number
  tipoEmbalagem?: string
  
  // Características Físicas
  cor?: string
  tamanho?: string
  material?: string
  modelo?: string
  voltagem?: string
  potencia?: string
  capacidade?: string
  textura?: string
  
  // Classificação Tributária
  origem?: string
  
  // Garantia e Certificações
  garantia?: string
  garantiaMeses?: number
  certificacoes?: string
  normasTecnicas?: string
  
  // Informações Adicionais
  fabricante?: string
  fornecedorPrincipal?: string
  paisOrigem?: string
  linkFichaTecnica?: string
  observacoes?: string
  observacoesTecnicas?: string
  
  companyId?: string
  createdAt?: string
  updatedAt?: string
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Erro na requisição',
          statusCode: response.status,
        }))
        throw new Error(errorData.message || `Erro ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erro de conexão com a API')
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProfile(token: string): Promise<AuthResponse['user']> {
    return this.request<AuthResponse['user']>('/api/users/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async validateToken(token: string): Promise<{ valid: boolean }> {
    return this.request<{ valid: boolean }>('/api/auth/validate-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  // Cadastros
  async createCadastro(data: CadastroData, token: string): Promise<any> {
    console.log('=== API SERVICE - CREATE CADASTRO ===');
    console.log('Data being sent:', JSON.stringify(data, null, 2));
    console.log('Token being used:', token?.substring(0, 20) + '...');
    
    return this.request<any>('/api/cadastros', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  async getCadastros(token: string): Promise<any[]> {
    return this.request<any[]>('/api/cadastros', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async getCadastro(id: string, token: string): Promise<any> {
    return this.request<any>(`/api/cadastros/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async updateCadastro(id: string, data: Partial<CadastroData>, token: string): Promise<any> {
    return this.request<any>(`/api/cadastros/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  async deleteCadastro(id: string, token: string): Promise<void> {
    console.log('🔍 API deleteCadastro chamada:', { id, token: token.substring(0, 20) + '...' });
    try {
      const result = await this.request<void>(`/api/cadastros/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API deleteCadastro sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API deleteCadastro erro:', error);
      throw error;
    }
  }

  // ===== PRODUTOS =====
  async createProduto(produtoData: ProdutoData, token: string): Promise<ProdutoData> {
    try {
      console.log('🔄 API createProduto iniciado:', { produtoData, token: token ? 'presente' : 'ausente' });
      const result = await this.request<ProdutoData>('/api/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(produtoData),
      });
      console.log('✅ API createProduto sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API createProduto erro:', error);
      throw error;
    }
  }

  async getProdutos(token: string): Promise<ProdutoData[]> {
    try {
      console.log('🔄 API getProdutos iniciado:', { token: token ? 'presente' : 'ausente' });
      const result = await this.request<ProdutoData[]>('/api/produtos', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getProdutos sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getProdutos erro:', error);
      throw error;
    }
  }

  async getProduto(id: string, token: string): Promise<ProdutoData> {
    try {
      console.log('🔄 API getProduto iniciado:', { id, token: token ? 'presente' : 'ausente' });
      const result = await this.request<ProdutoData>(`/api/produtos/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getProduto sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getProduto erro:', error);
      throw error;
    }
  }

  async updateProduto(id: string, produtoData: Partial<ProdutoData>, token: string): Promise<ProdutoData> {
    try {
      console.log('🔄 API updateProduto iniciado:', { id, produtoData, token: token ? 'presente' : 'ausente' });
      const result = await this.request<ProdutoData>(`/api/produtos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(produtoData),
      });
      console.log('✅ API updateProduto sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API updateProduto erro:', error);
      throw error;
    }
  }

  async deleteProduto(id: string, token: string): Promise<{ message: string }> {
    try {
      console.log('🔄 API deleteProduto iniciado:', { id, token: token ? 'presente' : 'ausente' });
      const result = await this.request<{ message: string }>(`/api/produtos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API deleteProduto sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API deleteProduto erro:', error);
      throw error;
    }
  }

}

export const apiService = new ApiService()
