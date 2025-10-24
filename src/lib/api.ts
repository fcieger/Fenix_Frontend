import { API_CONFIG } from '@/config/api'

const BASE_URL = API_CONFIG.BASE_URL || 'http://localhost:3000'


export interface RegisterData {
  user: {
    name: string
    email: string
    phone: string
    password: string
  }
  company: {
    name: string
    cnpj: string
    founded?: string
    nature?: string
    size?: string
    status?: string
    address?: any
    mainActivity?: string
    phones?: any[]
    emails?: any[]
    members?: any[]
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
      simplesNacional?: boolean
    }>
  }
}

export interface ApiError {
  message: string
  statusCode: number
}

export interface NaturezaOperacaoData {
  nome: string
  cfop: string
  tipo?: 'compras' | 'vendas' | 'servicos' | 'cupom_fiscal' | 'ecommerce' | 'devolucao_vendas' | 'devolucao_compras' | 'outras_movimentacoes'
  movimentaEstoque?: boolean
  habilitado?: boolean
  considerarOperacaoComoFaturamento?: boolean
  destacarTotalImpostosIBPT?: boolean
  gerarContasReceberPagar?: boolean
  tipoDataContasReceberPagar?: 'data_emissao' | 'data_vencimento'
  informacoesAdicionaisFisco?: string
  informacoesAdicionaisContribuinte?: string
}

export interface NaturezaOperacao extends NaturezaOperacaoData {
  id: string
  companyId: string
  createdAt: string
  updatedAt: string
}

export interface ConfiguracaoNfeData {
  descricaoModelo: string
  tipoModelo: 'nfe-produto' | 'nfse-servico' | 'nf-entrada' | 'nfce-consumidor' | 'mdfe'
  modelo: string
  serie: string
  numeroAtual: number
  ambiente: 'producao' | 'homologacao'
  rpsNaturezaOperacao?: string
  rpsRegimeTributario?: string
  rpsRegimeEspecialTributacao?: string
  rpsNumeroLoteAtual?: number
  rpsSerieLoteAtual?: number
  rpsLoginPrefeitura?: string
  rpsSenhaPrefeitura?: string
  rpsAliquotaISS?: number
  rpsEnviarNotificacaoCliente?: boolean
  rpsReceberNotificacao?: boolean
  rpsEmailNotificacao?: string
  nfceIdToken?: string
  nfceCscToken?: string
}

export interface ConfiguracaoNfeResponse {
  id: string
  companyId: string
  descricaoModelo: string
  tipoModelo: string
  modelo: string
  serie: string
  numeroAtual: number
  ambiente: string
  ativo: boolean
  rpsNaturezaOperacao?: string
  rpsRegimeTributario?: string
  rpsRegimeEspecialTributacao?: string
  rpsNumeroLoteAtual: number
  rpsSerieLoteAtual: number
  rpsLoginPrefeitura?: string
  rpsAliquotaISS: string
  rpsEnviarNotificacaoCliente: boolean
  rpsReceberNotificacao: boolean
  rpsEmailNotificacao?: string
  nfceIdToken?: string
  createdAt: string
  updatedAt: string
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
  contatos?: Array<{
    email?: string
    pessoaContato?: string
    telefoneComercial?: string
    celular?: string
    cargo?: string
    celularContato?: string
    principal?: boolean
  }>
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

export interface PrazoPagamentoData {
  id?: string
  nome: string
  descricao?: string
  tipo: 'dias' | 'parcelas' | 'personalizado'
  configuracoes: {
    // Para tipo 'dias'
    dias?: number
    percentualEntrada?: number
    percentualRestante?: number
    
    // Para tipo 'parcelas'
    numeroParcelas?: number
    intervaloDias?: number
    percentualParcelas?: number
    
    // Para tipo 'personalizado'
    parcelas?: Array<{
      numero: number
      dias: number
      percentual: number
      descricao?: string
    }>
  }
  ativo: boolean
  padrao: boolean
  observacoes?: string
  companyId?: string
  createdAt?: string
  updatedAt?: string
}

export interface PrazoPagamento extends PrazoPagamentoData {
  id: string
}

class ApiService {
  private baseURL = BASE_URL;

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('fenix_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Sistema mock removido - agora usa API real para todas as requisições

    // Sistema mock removido para register - agora usa API real

    // Removido mock para cadastros - agora usa backend real

    // Removido mock para produtos - agora usa backend real

    // Para outras requisições, fazer chamada real para o backend
    const url = `${BASE_URL}${endpoint}`
    const token = this.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Erro desconhecido',
          statusCode: response.status,
        }))
        throw new Error(errorData.message || `Erro ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error making request:', error)
      throw error
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    // Fazer chamada direta para o backend real (igual ao login)
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Erro ${response.status}`)
    }

    return await response.json()
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erro ${response.status}`)
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async getProfile(token: string): Promise<AuthResponse['user']> {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      throw error;
    }
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

  async getCadastros(): Promise<any[]> {
    return this.request<any[]>('/api/cadastros', {
      method: 'GET',
    })
  }

  async getCadastro(id: string, token: string): Promise<any> {
    return this.request<any>(`/api/companies/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async updateCadastro(id: string, data: Partial<CadastroData>, token: string): Promise<any> {
    return this.request<any>(`/api/companies/${id}`, {
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

  async getProdutos(): Promise<ProdutoData[]> {
    try {
      console.log('🔄 API getProdutos iniciado');
      const token = this.getToken();
      console.log('🔑 Token para produtos:', token ? 'presente' : 'ausente');
      
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

  // ===== EMPRESAS =====
  async getCompany(id: string, token: string): Promise<any> {
    try {
      console.log('🔄 API getCompany iniciado:', { id, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/companies/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getCompany sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getCompany erro:', error);
      throw error;
    }
  }

  async updateCompany(id: string, companyData: any, token: string): Promise<any> {
    try {
      console.log('🔄 API updateCompany iniciado:', { id, companyData, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(companyData),
      });
      console.log('✅ API updateCompany sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API updateCompany erro:', error);
      throw error;
    }
  }

  // ===== NATUREZA DE OPERAÇÃO =====
  async getNaturezasOperacao(): Promise<NaturezaOperacao[]> {
    try {
      console.log('🔄 API getNaturezasOperacao iniciado');
      const result = await this.request<NaturezaOperacao[]>(`/api/natureza-operacao`, {
        method: 'GET',
      });
      console.log('✅ API getNaturezasOperacao sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getNaturezasOperacao erro:', error);
      throw error;
    }
  }

  async createNaturezaOperacao(naturezaData: NaturezaOperacaoData, token: string): Promise<NaturezaOperacao> {
    try {
      console.log('🔄 API createNaturezaOperacao iniciado:', { naturezaData, token: token ? 'presente' : 'ausente' });
      const result = await this.request<NaturezaOperacao>(`/api/natureza-operacao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(naturezaData),
      });
      console.log('✅ API createNaturezaOperacao sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API createNaturezaOperacao erro:', error);
      throw error;
    }
  }

  async updateNaturezaOperacao(id: string, naturezaData: Partial<NaturezaOperacaoData>, token: string): Promise<NaturezaOperacao> {
    try {
      console.log('🔄 API updateNaturezaOperacao iniciado:', { id, naturezaData, token: token ? 'presente' : 'ausente' });
      const result = await this.request<NaturezaOperacao>(`/api/natureza-operacao/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(naturezaData),
      });
      console.log('✅ API updateNaturezaOperacao sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API updateNaturezaOperacao erro:', error);
      throw error;
    }
  }

  async deleteNaturezaOperacao(id: string, token: string): Promise<void> {
    try {
      console.log('🔄 API deleteNaturezaOperacao iniciado:', { id, token: token ? 'presente' : 'ausente' });
      await this.request<void>(`/api/natureza-operacao/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API deleteNaturezaOperacao sucesso');
    } catch (error) {
      console.error('❌ API deleteNaturezaOperacao erro:', error);
      throw error;
    }
  }

  async getConfiguracaoEstados(naturezaId: string, token: string): Promise<any[]> {
    try {
      console.log('🔄 API getConfiguracaoEstados iniciado:', { naturezaId, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any[]>(`/api/natureza-operacao/${naturezaId}/configuracao-estados`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getConfiguracaoEstados sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getConfiguracaoEstados erro:', error);
      throw error;
    }
  }

  async saveConfiguracaoEstados(naturezaId: string, configuracoes: any[], token: string): Promise<void> {
    try {
      console.log('🔄 API saveConfiguracaoEstados iniciado:', { naturezaId, configuracoes, token: token ? 'presente' : 'ausente' });
      console.log('🔗 URL completa:', `${this.baseURL}/api/natureza-operacao/${naturezaId}/configuracao-estados`);
      console.log('🔑 Token:', token);
      console.log('📦 Dados sendo enviados:', JSON.stringify(configuracoes, null, 2));
      console.log('🌐 Base URL:', this.baseURL);
      
      // Verificar se o token está válido
      if (!token) {
        throw new Error('Token de autenticação não fornecido');
      }
      
      // Verificar se há configurações para salvar
      if (!configuracoes || configuracoes.length === 0) {
        throw new Error('Nenhuma configuração fornecida para salvar');
      }
      
      // Testar conectividade com o backend primeiro
      try {
        const healthCheck = await fetch(`${this.baseURL}/health`, { method: 'GET' });
        console.log('🏥 Health check status:', healthCheck.status);
      } catch (healthError) {
        console.log('⚠️ Health check falhou, mas continuando...', healthError);
      }
      
      const response = await fetch(`${this.baseURL}/api/natureza-operacao/${naturezaId}/configuracao-estados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(configuracoes),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response statusText:', response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Tentar obter o texto da resposta primeiro
        const responseText = await response.text();
        console.log('📡 Response text (raw):', responseText);
        console.log('📡 Response text length:', responseText.length);
        
        let errorData = {};
        try {
          if (responseText && responseText.trim()) {
            errorData = JSON.parse(responseText);
            console.log('📡 Response parsed as JSON:', errorData);
          } else {
            console.log('📡 Response is empty or whitespace only');
            errorData = { message: `Erro ${response.status}: ${response.statusText}` };
          }
        } catch (parseError) {
          console.log('📡 Erro ao fazer parse do JSON:', parseError);
          console.log('📡 Tentando parse como texto simples');
          errorData = { 
            message: responseText || `Erro ${response.status}: ${response.statusText}`,
            rawResponse: responseText
          };
        }
        
        console.error('❌ Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorData,
          url: `${this.baseURL}/api/natureza-operacao/${naturezaId}/configuracao-estados`
        });
        
        throw new Error((errorData as any).message || `Erro ${response.status}: ${response.statusText}`);
      }

      // Verificar se há conteúdo na resposta antes de tentar fazer parse JSON
      const text = await response.text();
      if (text) {
        try {
          return JSON.parse(text);
        } catch {
          // Se não conseguir fazer parse, retorna undefined (resposta vazia é OK)
          return;
        }
      }
      
      console.log('✅ API saveConfiguracaoEstados sucesso');
    } catch (error) {
      console.error('❌ API saveConfiguracaoEstados erro:', error);
      throw error;
    }
  }

  async getNaturezaOperacao(id: string, token: string): Promise<NaturezaOperacao> {
    try {
      console.log('🔄 API getNaturezaOperacao iniciado:', { id, token: token ? 'presente' : 'ausente' });
      const result = await this.request<NaturezaOperacao>(`/api/natureza-operacao/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getNaturezaOperacao sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getNaturezaOperacao erro:', error);
      throw error;
    }
  }

  // ===== PEDIDOS DE VENDA =====
  async createPedidoVenda(pedidoData: any, token: string): Promise<any> {
    try {
      console.log('🔄 API createPedidoVenda iniciado:', { pedidoData, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>('/api/pedidos-venda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pedidoData),
      });
      console.log('✅ API createPedidoVenda sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API createPedidoVenda erro:', error);
      throw error;
    }
  }

  async getPedidosVenda(token: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      console.log('🔄 API getPedidosVenda iniciado:', { token: token ? 'presente' : 'ausente', page, limit });
      const result = await this.request<any>(`/api/pedidos-venda?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getPedidosVenda sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getPedidosVenda erro:', error);
      throw error;
    }
  }

  async getPedidoVenda(id: string, token: string): Promise<any> {
    try {
      console.log('🔄 API getPedidoVenda iniciado:', { id, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/pedidos-venda/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getPedidoVenda sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getPedidoVenda erro:', error);
      throw error;
    }
  }

  // ===== IMPOSTOS =====
  async calcularImpostos(payload: any, token: string): Promise<any> {
    try {
      return await this.request<any>(`/api/impostos/calcular`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error('❌ API calcularImpostos erro:', error)
      throw error
    }
  }

  async updatePedidoVenda(id: string, pedidoData: any, token: string): Promise<any> {
    try {
      console.log('🔄 API updatePedidoVenda iniciado:', { id, pedidoData, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/pedidos-venda/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pedidoData),
      });
      console.log('✅ API updatePedidoVenda sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API updatePedidoVenda erro:', error);
      throw error;
    }
  }

  async deletePedidoVenda(id: string, token: string): Promise<void> {
    try {
      console.log('🔄 API deletePedidoVenda iniciado:', { id, token: token ? 'presente' : 'ausente' });
      await this.request<void>(`/api/pedidos-venda/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API deletePedidoVenda sucesso');
    } catch (error) {
      console.error('❌ API deletePedidoVenda erro:', error);
      throw error;
    }
  }

  // ===== PRAZOS DE PAGAMENTO =====
  async getPrazosPagamento(token: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      console.log('🔄 API getPrazosPagamento iniciado:', { token: token ? 'presente' : 'ausente', page, limit });
      const result = await this.request<any>(`/api/prazos-pagamento?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getPrazosPagamento sucesso:', result);
      console.log('✅ API getPrazosPagamento data:', result?.data);
      console.log('✅ API getPrazosPagamento total:', result?.total);
      return result;
    } catch (error) {
      console.error('❌ API getPrazosPagamento erro:', error);
      throw error;
    }
  }

  async getPrazoPagamento(id: string, token: string): Promise<any> {
    try {
      console.log('🔄 API getPrazoPagamento iniciado:', { id, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/prazos-pagamento/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getPrazoPagamento sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getPrazoPagamento erro:', error);
      throw error;
    }
  }

  async createPrazoPagamento(data: PrazoPagamentoData, token: string): Promise<any> {
    try {
      console.log('🔄 API createPrazoPagamento iniciado:', { data, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>('/api/prazos-pagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      console.log('✅ API createPrazoPagamento sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API createPrazoPagamento erro:', error);
      throw error;
    }
  }

  async updatePrazoPagamento(id: string, data: PrazoPagamentoData, token: string): Promise<any> {
    try {
      console.log('🔄 API updatePrazoPagamento iniciado:', { id, data, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/prazos-pagamento/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      console.log('✅ API updatePrazoPagamento sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API updatePrazoPagamento erro:', error);
      throw error;
    }
  }

  async deletePrazoPagamento(id: string, token: string): Promise<void> {
    try {
      console.log('🔄 API deletePrazoPagamento iniciado:', { id, token: token ? 'presente' : 'ausente' });
      await this.request<void>(`/api/prazos-pagamento/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API deletePrazoPagamento sucesso');
    } catch (error) {
      console.error('❌ API deletePrazoPagamento erro:', error);
      throw error;
    }
  }

  async setPrazoPadrao(id: string, token: string): Promise<any> {
    try {
      console.log('🔄 API setPrazoPadrao iniciado:', { id, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/prazos-pagamento/${id}/padrao`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API setPrazoPadrao sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API setPrazoPadrao erro:', error);
      throw error;
    }
  }

  // Configurações NFe
  async getConfiguracoesNfe(token: string, apenasAtivas: boolean = false): Promise<ConfiguracaoNfeResponse[]> {
    try {
      console.log('🔄 API getConfiguracoesNfe iniciado:', { token: token ? 'presente' : 'ausente', apenasAtivas });
      const result = await this.request<ConfiguracaoNfeResponse[]>(`/api/configuracao-nfe?apenasAtivas=${apenasAtivas}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getConfiguracoesNfe sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getConfiguracoesNfe erro:', error);
      throw error;
    }
  }

  async createConfiguracaoNfe(data: ConfiguracaoNfeData, token: string): Promise<ConfiguracaoNfeResponse> {
    try {
      console.log('🔄 API createConfiguracaoNfe iniciado:', { data, token: token ? 'presente' : 'ausente' });
      const result = await this.request<ConfiguracaoNfeResponse>('/api/configuracao-nfe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      console.log('✅ API createConfiguracaoNfe sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API createConfiguracaoNfe erro:', error);
      throw error;
    }
  }

  async getConfiguracaoNfe(id: string, token: string): Promise<ConfiguracaoNfeResponse> {
    try {
      console.log('🔄 API getConfiguracaoNfe iniciado:', { id, token: token ? 'presente' : 'ausente' });
      const result = await this.request<ConfiguracaoNfeResponse>(`/api/configuracao-nfe/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getConfiguracaoNfe sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getConfiguracaoNfe erro:', error);
      throw error;
    }
  }

  async updateConfiguracaoNfe(id: string, data: Partial<ConfiguracaoNfeData>, token: string): Promise<ConfiguracaoNfeResponse> {
    try {
      console.log('🔄 API updateConfiguracaoNfe iniciado:', { id, data, token: token ? 'presente' : 'ausente' });
      const result = await this.request<ConfiguracaoNfeResponse>(`/api/configuracao-nfe/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      console.log('✅ API updateConfiguracaoNfe sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API updateConfiguracaoNfe erro:', error);
      throw error;
    }
  }

  async deleteConfiguracaoNfe(id: string, token: string): Promise<void> {
    try {
      console.log('🔄 API deleteConfiguracaoNfe iniciado:', { id, token: token ? 'presente' : 'ausente' });
      await this.request<void>(`/api/configuracao-nfe/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API deleteConfiguracaoNfe sucesso');
    } catch (error) {
      console.error('❌ API deleteConfiguracaoNfe erro:', error);
      throw error;
    }
  }

  async getProximoNumeroNfe(configuracaoId: string, token: string): Promise<{ numeroAtual: number }> {
    try {
      console.log('🔄 API getProximoNumeroNfe iniciado:', { configuracaoId, token: token ? 'presente' : 'ausente' });
      const result = await this.request<{ numeroAtual: number }>(`/api/configuracao-nfe/${configuracaoId}/incrementar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getProximoNumeroNfe sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getProximoNumeroNfe erro:', error);
      throw error;
    }
  }

  // ===== MÉTODOS NFE =====

  /**
   * Buscar todas as NFes
   */
  async getNfes(token: string, status?: string): Promise<any[]> {
    try {
      console.log('🔄 API getNfes iniciado:', { token: token ? 'presente' : 'ausente', status });
      const url = status ? `/api/nfe?status=${status}` : '/api/nfe';
      const result = await this.request<any[]>(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getNfes sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getNfes erro:', error);
      throw error;
    }
  }

  /**
   * Buscar NFe por ID
   */
  async getNfe(id: string, token: string): Promise<any> {
    try {
      console.log('🔄 API getNfe iniciado:', { id, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/nfe/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getNfe sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getNfe erro:', error);
      throw error;
    }
  }

  /**
   * Criar nova NFe
   */
  async createNfe(data: any, token: string): Promise<any> {
    try {
      console.log('🔄 API createNfe iniciado:', { data, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>('/api/nfe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      console.log('✅ API createNfe sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API createNfe erro:', error);
      throw error;
    }
  }

  /**
   * Atualizar NFe
   */
  async updateNfe(id: string, data: any, token: string): Promise<any> {
    try {
      console.log('🔄 API updateNfe iniciado:', { id, data, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/nfe/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      console.log('✅ API updateNfe sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API updateNfe erro:', error);
      throw error;
    }
  }

  /**
   * Excluir NFe
   */
  async deleteNfe(id: string, token: string): Promise<void> {
    try {
      console.log('🔄 API deleteNfe iniciado:', { id, token: token ? 'presente' : 'ausente' });
      await this.request<void>(`/api/nfe/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API deleteNfe sucesso');
    } catch (error) {
      console.error('❌ API deleteNfe erro:', error);
      throw error;
    }
  }

  /**
   * Calcular impostos da NFe
   */
  async calcularImpostosNfe(data: any, token: string): Promise<any> {
    try {
      console.log('🔄 API calcularImpostosNfe iniciado:', { data, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>('/api/nfe/calcular-impostos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      console.log('✅ API calcularImpostosNfe sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API calcularImpostosNfe erro:', error);
      throw error;
    }
  }

  // ===== MÉTODOS DE INTEGRAÇÃO NFe =====

  /**
   * Emitir NFe via API externa
   */
  async emitirNFeExterna(nfeId: string, token: string): Promise<any> {
    try {
      console.log('🔄 API emitirNFeExterna iniciado:', { nfeId, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/nfe-integration/emitir/${nfeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API emitirNFeExterna sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API emitirNFeExterna erro:', error);
      throw error;
    }
  }

  /**
   * Sincronizar NFe com API externa
   */
  async sincronizarNFe(nfeId: string, token: string): Promise<any> {
    try {
      console.log('🔄 API sincronizarNFe iniciado:', { nfeId, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/nfe-integration/sincronizar/${nfeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API sincronizarNFe sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API sincronizarNFe erro:', error);
      throw error;
    }
  }

  /**
   * Obter status de integração da NFe
   */
  async getStatusIntegracaoNFe(nfeId: string, token: string): Promise<any> {
    try {
      console.log('🔄 API getStatusIntegracaoNFe iniciado:', { nfeId, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/nfe-integration/status/${nfeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API getStatusIntegracaoNFe sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API getStatusIntegracaoNFe erro:', error);
      throw error;
    }
  }

  /**
   * Cancelar NFe via API externa
   */
  async cancelarNFeExterna(nfeId: string, justificativa: string, token: string): Promise<any> {
    try {
      console.log('🔄 API cancelarNFeExterna iniciado:', { nfeId, justificativa: justificativa ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/nfe-integration/cancelar/${nfeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ justificativa })
      });
      console.log('✅ API cancelarNFeExterna sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API cancelarNFeExterna erro:', error);
      throw error;
    }
  }

  /**
   * Download XML da NFe
   */
  async downloadXMLNFe(nfeId: string, token: string): Promise<{ xml: string; filename: string }> {
    try {
      console.log('🔄 API downloadXMLNFe iniciado:', { nfeId, token: token ? 'presente' : 'ausente' });
      const result = await this.request<{ xml: string; filename: string }>(`/api/nfe-integration/xml/${nfeId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API downloadXMLNFe sucesso:', { filename: result.filename, xmlLength: result.xml?.length });
      return result;
    } catch (error) {
      console.error('❌ API downloadXMLNFe erro:', error);
      throw error;
    }
  }

  /**
   * Download PDF da NFe
   */
  async downloadPDFNFe(nfeId: string, token: string): Promise<{ pdf: string; filename: string }> {
    try {
      console.log('🔄 API downloadPDFNFe iniciado:', { nfeId, token: token ? 'presente' : 'ausente' });
      const result = await this.request<{ pdf: string; filename: string }>(`/api/nfe-integration/pdf/${nfeId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API downloadPDFNFe sucesso:', { filename: result.filename, pdfLength: result.pdf?.length });
      return result;
    } catch (error) {
      console.error('❌ API downloadPDFNFe erro:', error);
      throw error;
    }
  }

  /**
   * Download DANFE da NFe
   */
  async downloadDANFENFe(nfeId: string, token: string): Promise<{ danfe: string; filename: string }> {
    try {
      console.log('🔄 API downloadDANFENFe iniciado:', { nfeId, token: token ? 'presente' : 'ausente' });
      const result = await this.request<{ danfe: string; filename: string }>(`/api/nfe-integration/danfe/${nfeId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API downloadDANFENFe sucesso:', { filename: result.filename, danfeLength: result.danfe?.length });
      return result;
    } catch (error) {
      console.error('❌ API downloadDANFENFe erro:', error);
      throw error;
    }
  }

  /**
   * Consultar NFe por chave de acesso
   */
  async consultarNFeExterna(chaveAcesso: string, token: string): Promise<any> {
    try {
      console.log('🔄 API consultarNFeExterna iniciado:', { chaveAcesso, token: token ? 'presente' : 'ausente' });
      const result = await this.request<any>(`/api/nfe-integration/consulta/${chaveAcesso}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ API consultarNFeExterna sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ API consultarNFeExterna erro:', error);
      throw error;
    }
  }

}

export const apiService = new ApiService()
