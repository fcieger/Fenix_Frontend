import { API_CONFIG, api } from "@/config/api";
import type { Product, CreateProductDto, UpdateProductDto } from "@/types/sdk";

const BASE_URL = API_CONFIG.BASE_URL;

export interface RegisterData {
  user: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  company: {
    name: string;
    cnpj: string;
    founded?: string;
    nature?: string;
    size?: string;
    status?: string;
    address?: any;
    mainActivity?: string;
    phones?: any[];
    emails?: any[];
    members?: any[];
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    companies: Array<{
      id: string;
      cnpj: string;
      name: string;
      token: string;
      simplesNacional?: boolean;
    }>;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface NaturezaOperacaoData {
  nome: string;
  cfop: string;
  tipo?:
    | "compras"
    | "vendas"
    | "servicos"
    | "cupom_fiscal"
    | "ecommerce"
    | "devolucao_vendas"
    | "devolucao_compras"
    | "outras_movimentacoes";
  movimentaEstoque?: boolean;
  habilitado?: boolean;
  considerarOperacaoComoFaturamento?: boolean;
  destacarTotalImpostosIBPT?: boolean;
  gerarContasReceberPagar?: boolean;
  tipoDataContasReceberPagar?: "data_emissao" | "data_vencimento";
  informacoesAdicionaisFisco?: string;
  informacoesAdicionaisContribuinte?: string;
}

export interface NaturezaOperacao extends NaturezaOperacaoData {
  id: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfiguracaoNfeData {
  descricaoModelo: string;
  tipoModelo:
    | "nfe-produto"
    | "nfse-servico"
    | "nf-entrada"
    | "nfce-consumidor"
    | "mdfe";
  modelo: string;
  serie: string;
  numeroAtual: number;
  ambiente: "producao" | "homologacao";
  rpsNaturezaOperacao?: string;
  rpsRegimeTributario?: string;
  rpsRegimeEspecialTributacao?: string;
  rpsNumeroLoteAtual?: number;
  rpsSerieLoteAtual?: number;
  rpsLoginPrefeitura?: string;
  rpsSenhaPrefeitura?: string;
  rpsAliquotaISS?: number;
  rpsEnviarNotificacaoCliente?: boolean;
  rpsReceberNotificacao?: boolean;
  rpsEmailNotificacao?: string;
  nfceIdToken?: string;
  nfceCscToken?: string;
}

export interface ConfiguracaoNfeResponse {
  id: string;
  companyId: string;
  descricaoModelo: string;
  tipoModelo: string;
  modelo: string;
  serie: string;
  numeroAtual: number;
  ambiente: string;
  ativo: boolean;
  rpsNaturezaOperacao?: string;
  rpsRegimeTributario?: string;
  rpsRegimeEspecialTributacao?: string;
  rpsNumeroLoteAtual: number;
  rpsSerieLoteAtual: number;
  rpsLoginPrefeitura?: string;
  rpsAliquotaISS: string;
  rpsEnviarNotificacaoCliente: boolean;
  rpsReceberNotificacao: boolean;
  rpsEmailNotificacao?: string;
  nfceIdToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CadastroData {
  nomeRazaoSocial: string;
  nomeFantasia?: string;
  tipoPessoa: "Pessoa Física" | "Pessoa Jurídica";
  cpf?: string;
  cnpj?: string;
  tiposCliente?: {
    cliente: boolean;
    vendedor: boolean;
    fornecedor: boolean;
    funcionario: boolean;
    transportadora: boolean;
    prestadorServico: boolean;
  };
  email?: string;
  pessoaContato?: string;
  telefoneComercial?: string;
  celular?: string;
  cargo?: string;
  celularContato?: string;
  contatos?: Array<{
    email?: string;
    pessoaContato?: string;
    telefoneComercial?: string;
    celular?: string;
    cargo?: string;
    celularContato?: string;
    principal?: boolean;
  }>;
  optanteSimples?: boolean;
  orgaoPublico?: boolean;
  ie?: string;
  im?: string;
  suframa?: string;
  enderecos?: Array<{
    tipo: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    principal: boolean;
  }>;
  observacoes?: string;
  userId?: string;
  companyId?: string;
}

// ProdutoData removed - use Product from @fenix/api-sdk instead
// Import: import type { Product, CreateProductDto, UpdateProductDto } from '@/types/sdk';

export interface PrazoPagamentoData {
  id?: string;
  nome: string;
  descricao?: string;
  tipo: "dias" | "parcelas" | "personalizado";
  configuracoes: {
    // Para tipo 'dias'
    dias?: number;
    percentualEntrada?: number;
    percentualRestante?: number;

    // Para tipo 'parcelas'
    numeroParcelas?: number;
    intervaloDias?: number;
    percentualParcelas?: number;

    // Para tipo 'personalizado'
    parcelas?: Array<{
      numero: number;
      dias: number;
      percentual: number;
      descricao?: string;
    }>;
  };
  ativo: boolean;
  padrao: boolean;
  observacoes?: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrazoPagamento extends PrazoPagamentoData {
  id: string;
}

class ApiService {
  private baseURL = BASE_URL;

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("fenix_token");
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
    const url = `${BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let message = `Erro ${response.status}: ${response.statusText}`;
        try {
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const json = await response.json();
            message = json.message || json.error || JSON.stringify(json);
          } else {
            const text = await response.text();
            message = text || message;
          }
        } catch {}
        const err = new Error(message);
        (err as any).status = response.status;
        throw err;
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.error("Error making request:", error);
      throw error;
    }
  }

  // NOTE: register method removed - use SDK via auth-context instead
  // The register functionality is now handled by SdkClientFactory.getAuthClient().register()

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/api/auth/login", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Verificar se a resposta está OK
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }

      // Tratar erros de resposta
      const errorData = response.data as any;
      const errorMessage = errorData?.message || `Erro ${response.status}`;

      console.error("❌ Erro no login:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      throw new Error(errorMessage);
    } catch (error: any) {
      console.error("❌ Erro no login:", error);

      // Se o erro já é uma string, propagar
      if (error instanceof Error) {
        throw error;
      }

      // Caso contrário, criar um novo erro
      throw new Error(error?.response?.data?.message || "Erro desconhecido ao fazer login");
    }
  }

  async getProfile(token: string): Promise<AuthResponse["user"]> {
    try {
      // Usar URL relativa para Next.js API routes
      const apiUrl =
        typeof window !== "undefined"
          ? ""
          : BASE_URL || "http://localhost:3004";

      // Usar axios para consistência
      const response = await api.get<AuthResponse["user"]>(`${apiUrl}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }

      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error("Erro ao obter perfil:", error);
      throw error;
    }
  }

  // NOTE: validateToken method removed - use SDK via auth-context instead
  // The validateToken functionality is now handled by SdkClientFactory.getAuthClient().validateToken()

  // Cadastros
  async createCadastro(data: CadastroData, token: string): Promise<any> {
    console.log("=== API SERVICE - CREATE CADASTRO ===");
    console.log("Data being sent:", JSON.stringify(data, null, 2));
    console.log("Token being used:", token?.substring(0, 20) + "...");

    return this.request<any>("/api/partners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async getCadastros(companyId?: string): Promise<any[]> {
    const queryParam = companyId ? `?company_id=${companyId}` : "";
    const response = await this.request<any>(`/api/partners${queryParam}`, {
      method: "GET",
    });
    // Se a resposta tem estrutura { success, data }, retornar apenas data
    // Senão, retornar a resposta direta (para compatibilidade com backend NestJS)
    return response?.data || response || [];
  }

  async getCadastro(id: string, token: string): Promise<any> {
    const result = await this.request<any>(`/api/partners/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Retornar data se estiver no formato { success: true, data: ... }
    return result.data || result;
  }

  async updateCadastro(
    id: string,
    data: Partial<CadastroData>,
    token: string
  ): Promise<any> {
    return this.request<any>(`/api/companies/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async deleteCadastro(id: string, token: string): Promise<void> {
    console.log("🔍 API deleteCadastro chamada:", {
      id,
      token: token.substring(0, 20) + "...",
    });
    try {
      const result = await this.request<void>(`/api/partners/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ API deleteCadastro sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API deleteCadastro erro:", error);
      throw error;
    }
  }

  // ===== PRODUTOS =====
  // NOTE: These methods are legacy. Use products-service.ts with SDK instead.
  async createProduto(
    produtoData: CreateProductDto,
    token: string
  ): Promise<Product> {
    try {
      console.log("🔄 API createProduto iniciado:", {
        produtoData,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<Product>("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(produtoData),
      });
      console.log("✅ API createProduto sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API createProduto erro:", error);
      throw error;
    }
  }

  async getProdutos(companyId?: string): Promise<Product[]> {
    try {
      console.log("🔄 API getProdutos iniciado", { companyId });
      const token = this.getToken();
      console.log("🔑 Token para produtos:", token ? "presente" : "ausente");

      const queryParam = companyId ? `?company_id=${companyId}` : "";
      const result = await this.request<Product[]>(
        `/api/products${queryParam}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API getProdutos sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getProdutos erro:", error);
      throw error;
    }
  }

  async getProduto(id: string, token: string): Promise<Product> {
    try {
      console.log("🔄 API getProduto iniciado:", {
        id,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<Product>(`/api/products/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ API getProduto sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getProduto erro:", error);
      throw error;
    }
  }

  async updateProduto(
    id: string,
    produtoData: UpdateProductDto,
    token: string
  ): Promise<Product> {
    try {
      console.log("🔄 API updateProduto iniciado:", {
        id,
        produtoData,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<Product>(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(produtoData),
      });
      console.log("✅ API updateProduto sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API updateProduto erro:", error);
      throw error;
    }
  }

  async deleteProduto(id: string, token: string): Promise<{ message: string }> {
    try {
      console.log("🔄 API deleteProduto iniciado:", {
        id,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<{ message: string }>(
        `/api/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API deleteProduto sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API deleteProduto erro:", error);
      throw error;
    }
  }

  // ===== EMPRESAS =====
  async getCompany(id: string, token: string): Promise<any> {
    try {
      console.log("🔄 API getCompany iniciado:", {
        id,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>(`/api/companies/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ API getCompany sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getCompany erro:", error);
      throw error;
    }
  }

  async updateCompany(
    id: string,
    companyData: any,
    token: string
  ): Promise<any> {
    try {
      console.log("🔄 API updateCompany iniciado:", {
        id,
        companyData,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>(`/api/companies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(companyData),
      });
      console.log("✅ API updateCompany sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API updateCompany erro:", error);
      throw error;
    }
  }

  // ===== NATUREZA DE OPERAÇÃO =====
  async getNaturezasOperacao(companyId?: string): Promise<NaturezaOperacao[]> {
    try {
      const queryParam = companyId ? `?company_id=${companyId}` : "";
      console.log("🔄 API getNaturezasOperacao iniciado", { companyId });
      const result = await this.request<NaturezaOperacao[]>(
        `/api/natureza-operacao${queryParam}`,
        {
          method: "GET",
        }
      );
      console.log("✅ API getNaturezasOperacao sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getNaturezasOperacao erro:", error);
      throw error;
    }
  }

  async createNaturezaOperacao(
    naturezaData: NaturezaOperacaoData,
    token: string
  ): Promise<NaturezaOperacao> {
    try {
      console.log("🔄 API createNaturezaOperacao iniciado:", {
        naturezaData,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<NaturezaOperacao>(
        `/api/natureza-operacao`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(naturezaData),
        }
      );
      console.log("✅ API createNaturezaOperacao sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API createNaturezaOperacao erro:", error);
      throw error;
    }
  }

  async updateNaturezaOperacao(
    id: string,
    naturezaData: Partial<NaturezaOperacaoData>,
    token: string
  ): Promise<NaturezaOperacao> {
    try {
      console.log("🔄 API updateNaturezaOperacao iniciado:", {
        id,
        naturezaData,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<NaturezaOperacao>(
        `/api/natureza-operacao/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(naturezaData),
        }
      );
      console.log("✅ API updateNaturezaOperacao sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API updateNaturezaOperacao erro:", error);
      throw error;
    }
  }

  async deleteNaturezaOperacao(id: string, token: string): Promise<void> {
    try {
      console.log("🔄 API deleteNaturezaOperacao iniciado:", {
        id,
        token: token ? "presente" : "ausente",
      });
      await this.request<void>(`/api/natureza-operacao/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ API deleteNaturezaOperacao sucesso");
    } catch (error) {
      console.error("❌ API deleteNaturezaOperacao erro:", error);
      throw error;
    }
  }

  async getConfiguracaoEstados(
    naturezaId: string,
    token: string
  ): Promise<any[]> {
    try {
      console.log("🔄 API getConfiguracaoEstados iniciado:", {
        naturezaId,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any[]>(
        `/api/natureza-operacao/${naturezaId}/configuracao-estados`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API getConfiguracaoEstados sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getConfiguracaoEstados erro:", error);
      throw error;
    }
  }

  async saveConfiguracaoEstados(
    naturezaId: string,
    configuracoes: any[],
    token: string
  ): Promise<void> {
    try {
      console.log("🔄 API saveConfiguracaoEstados iniciado:", {
        naturezaId,
        configuracoes,
        token: token ? "presente" : "ausente",
      });
      console.log(
        "🔗 URL completa:",
        `${this.baseURL}/api/natureza-operacao/${naturezaId}/configuracao-estados`
      );
      console.log("🔑 Token:", token);
      console.log(
        "📦 Dados sendo enviados:",
        JSON.stringify(configuracoes, null, 2)
      );
      console.log("🌐 Base URL:", this.baseURL);

      // Verificar se o token está válido
      if (!token) {
        throw new Error("Token de autenticação não fornecido");
      }

      // Verificar se há configurações para salvar
      if (!configuracoes || configuracoes.length === 0) {
        throw new Error("Nenhuma configuração fornecida para salvar");
      }

      // Testar conectividade com o backend primeiro
      try {
        const healthCheck = await api.get(`${this.baseURL}/health`);
        console.log("🏥 Health check status:", healthCheck.status);
      } catch (healthError) {
        console.log("⚠️ Health check falhou, mas continuando...", healthError);
      }

      const response = await api.post(
        `${this.baseURL}/api/natureza-operacao/${naturezaId}/configuracao-estados`,
        configuracoes,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("📡 Response status:", response.status);
      console.log("📡 Response statusText:", response.statusText);

      if (response.status >= 200 && response.status < 300) {
        console.log("✅ API saveConfiguracaoEstados sucesso");
        // Retornar dados se houver, caso contrário undefined (resposta vazia é OK)
        return response.data;
      }

      // Tratar erros de resposta
      const errorData = response.data as any;
      const errorMessage = errorData?.message || `Erro ${response.status}: ${response.statusText}`;

      console.error("❌ Erro na resposta:", {
        status: response.status,
        statusText: response.statusText,
        body: errorData,
        url: `${this.baseURL}/api/natureza-operacao/${naturezaId}/configuracao-estados`,
      });

      throw new Error(errorMessage);
    } catch (error) {
      console.error("❌ API saveConfiguracaoEstados erro:", error);
      throw error;
    }
  }

  async getNaturezaOperacao(
    id: string,
    token: string,
    companyId?: string
  ): Promise<NaturezaOperacao> {
    try {
      const queryParam = companyId ? `?company_id=${companyId}` : "";
      console.log("🔄 API getNaturezaOperacao iniciado:", {
        id,
        companyId,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<NaturezaOperacao>(
        `/api/natureza-operacao/${id}${queryParam}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API getNaturezaOperacao sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getNaturezaOperacao erro:", error);
      throw error;
    }
  }

  // ===== PEDIDOS DE VENDA =====
  async createPedidoVenda(pedidoData: any, token: string): Promise<any> {
    return this.request<any>("/api/pedidos-venda", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pedidoData),
    });
  }

  async getPedidosVenda(
    token: string,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    try {
      console.log("🔄 API getPedidosVenda iniciado:", {
        token: token ? "presente" : "ausente",
        page,
        limit,
      });
      const result = await this.request<any>(
        `/api/pedidos-venda?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API getPedidosVenda sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getPedidosVenda erro:", error);
      throw error;
    }
  }

  async getPedidoVenda(id: string, token: string): Promise<any> {
    try {
      console.log("🔄 API getPedidoVenda iniciado:", {
        id,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>(`/api/pedidos-venda/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ API getPedidoVenda sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getPedidoVenda erro:", error);
      throw error;
    }
  }

  // ===== IMPOSTOS =====
  async calcularImpostos(payload: any, token: string): Promise<any> {
    try {
      return await this.request<any>(`/api/taxes/calcular`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("❌ API calcularImpostos erro:", error);
      throw error;
    }
  }

  async updatePedidoVenda(
    id: string,
    pedidoData: any,
    token: string
  ): Promise<any> {
    return this.request<any>(`/api/pedidos-venda/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pedidoData),
    });
  }

  async deletePedidoVenda(id: string, token: string): Promise<void> {
    return this.request<void>(`/api/pedidos-venda/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // ===== PRAZOS DE PAGAMENTO =====
  async getPrazosPagamento(
    token: string,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    try {
      console.log("🔄 API getPrazosPagamento iniciado:", {
        token: token ? "presente" : "ausente",
        page,
        limit,
      });
      const result = await this.request<any>(
        `/api/prazos-pagamento?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API getPrazosPagamento sucesso:", result);
      console.log("✅ API getPrazosPagamento data:", result?.data);
      console.log("✅ API getPrazosPagamento total:", result?.total);
      return result;
    } catch (error) {
      console.error("❌ API getPrazosPagamento erro:", error);
      throw error;
    }
  }

  async getPrazoPagamento(id: string, token: string): Promise<any> {
    try {
      console.log("🔄 API getPrazoPagamento iniciado:", {
        id,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>(`/api/prazos-pagamento/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ API getPrazoPagamento sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getPrazoPagamento erro:", error);
      throw error;
    }
  }

  async createPrazoPagamento(
    data: PrazoPagamentoData,
    token: string
  ): Promise<any> {
    try {
      console.log("🔄 API createPrazoPagamento iniciado:", {
        data,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>("/api/prazos-pagamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      console.log("✅ API createPrazoPagamento sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API createPrazoPagamento erro:", error);
      throw error;
    }
  }

  async updatePrazoPagamento(
    id: string,
    data: PrazoPagamentoData,
    token: string
  ): Promise<any> {
    try {
      console.log("🔄 API updatePrazoPagamento iniciado:", {
        id,
        data,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>(`/api/prazos-pagamento/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      console.log("✅ API updatePrazoPagamento sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API updatePrazoPagamento erro:", error);
      throw error;
    }
  }

  async deletePrazoPagamento(id: string, token: string): Promise<void> {
    try {
      console.log("🔄 API deletePrazoPagamento iniciado:", {
        id,
        token: token ? "presente" : "ausente",
      });
      await this.request<void>(`/api/prazos-pagamento/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ API deletePrazoPagamento sucesso");
    } catch (error) {
      console.error("❌ API deletePrazoPagamento erro:", error);
      throw error;
    }
  }

  async setPrazoPadrao(id: string, token: string): Promise<any> {
    try {
      console.log("🔄 API setPrazoPadrao iniciado:", {
        id,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>(
        `/api/prazos-pagamento/${id}/padrao`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API setPrazoPadrao sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API setPrazoPadrao erro:", error);
      throw error;
    }
  }

  // Configurações NFe
  async getConfiguracoesNfe(
    token: string,
    apenasAtivas: boolean = false
  ): Promise<ConfiguracaoNfeResponse[]> {
    try {
      console.log("🔄 API getConfiguracoesNfe iniciado:", {
        token: token ? "presente" : "ausente",
        apenasAtivas,
      });
      const result = await this.request<ConfiguracaoNfeResponse[]>(
        `/api/configuracao-nfe?apenasAtivas=${apenasAtivas}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API getConfiguracoesNfe sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getConfiguracoesNfe erro:", error);
      throw error;
    }
  }

  async createConfiguracaoNfe(
    data: ConfiguracaoNfeData,
    token: string
  ): Promise<ConfiguracaoNfeResponse> {
    try {
      console.log("🔄 API createConfiguracaoNfe iniciado:", {
        data,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<ConfiguracaoNfeResponse>(
        "/api/configuracao-nfe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      console.log("✅ API createConfiguracaoNfe sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API createConfiguracaoNfe erro:", error);
      throw error;
    }
  }

  async getConfiguracaoNfe(
    id: string,
    token: string
  ): Promise<ConfiguracaoNfeResponse> {
    try {
      console.log("🔄 API getConfiguracaoNfe iniciado:", {
        id,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<ConfiguracaoNfeResponse>(
        `/api/configuracao-nfe/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API getConfiguracaoNfe sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getConfiguracaoNfe erro:", error);
      throw error;
    }
  }

  async updateConfiguracaoNfe(
    id: string,
    data: Partial<ConfiguracaoNfeData>,
    token: string
  ): Promise<ConfiguracaoNfeResponse> {
    try {
      console.log("🔄 API updateConfiguracaoNfe iniciado:", {
        id,
        data,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<ConfiguracaoNfeResponse>(
        `/api/configuracao-nfe/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      console.log("✅ API updateConfiguracaoNfe sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API updateConfiguracaoNfe erro:", error);
      throw error;
    }
  }

  async deleteConfiguracaoNfe(id: string, token: string): Promise<void> {
    try {
      console.log("🔄 API deleteConfiguracaoNfe iniciado:", {
        id,
        token: token ? "presente" : "ausente",
      });
      await this.request<void>(`/api/configuracao-nfe/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ API deleteConfiguracaoNfe sucesso");
    } catch (error) {
      console.error("❌ API deleteConfiguracaoNfe erro:", error);
      throw error;
    }
  }

  async getProximoNumeroNfe(
    configuracaoId: string,
    token: string
  ): Promise<{ numeroAtual: number }> {
    try {
      console.log("🔄 API getProximoNumeroNfe iniciado:", {
        configuracaoId,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<{ numeroAtual: number }>(
        `/api/configuracao-nfe/${configuracaoId}/incrementar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API getProximoNumeroNfe sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getProximoNumeroNfe erro:", error);
      throw error;
    }
  }

  // ===== MÉTODOS NFE =====

  /**
   * Buscar todas as NFes
   */
  async getNfes(token: string, status?: string): Promise<any[]> {
    try {
      console.log("🔄 API getNfes iniciado:", {
        token: token ? "presente" : "ausente",
        status,
      });
      const url = status ? `/api/nfe?status=${status}` : "/api/nfe";
      const result = await this.request<any[]>(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ API getNfes sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getNfes erro:", error);
      throw error;
    }
  }

  /**
   * Buscar NFe por ID
   */
  async getNfe(id: string, token: string): Promise<any> {
    try {
      console.log("🔄 API getNfe iniciado:", {
        id,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>(`/api/nfe/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ API getNfe sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getNfe erro:", error);
      throw error;
    }
  }

  /**
   * Criar nova NFe
   */
  async createNfe(data: any, token: string): Promise<any> {
    try {
      console.log("🔄 API createNfe iniciado:", {
        data,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>("/api/nfe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      console.log("✅ API createNfe sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API createNfe erro:", error);
      throw error;
    }
  }

  /**
   * Atualizar NFe
   */
  async updateNfe(id: string, data: any, token: string): Promise<any> {
    try {
      console.log("🔄 API updateNfe iniciado:", {
        id,
        data,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>(`/api/nfe/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      console.log("✅ API updateNfe sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API updateNfe erro:", error);
      throw error;
    }
  }

  /**
   * Excluir NFe
   */
  async deleteNfe(id: string, token: string): Promise<void> {
    try {
      console.log("🔄 API deleteNfe iniciado:", {
        id,
        token: token ? "presente" : "ausente",
      });
      await this.request<void>(`/api/nfe/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ API deleteNfe sucesso");
    } catch (error) {
      console.error("❌ API deleteNfe erro:", error);
      throw error;
    }
  }

  /**
   * Calcular impostos da NFe
   */
  async calcularImpostosNfe(data: any, token: string): Promise<any> {
    try {
      console.log("🔄 API calcularImpostosNfe iniciado:", {
        data,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>("/api/nfe/calcular-impostos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      console.log("✅ API calcularImpostosNfe sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API calcularImpostosNfe erro:", error);
      throw error;
    }
  }

  // ===== MÉTODOS DE INTEGRAÇÃO NFe =====

  /**
   * Emitir NFe via API externa
   */
  async emitirNFeExterna(nfeId: string, token: string): Promise<any> {
    try {
      console.log("🔄 API emitirNFeExterna iniciado:", {
        nfeId,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>(
        `/api/nfe-integration/emitir/${nfeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API emitirNFeExterna sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API emitirNFeExterna erro:", error);
      throw error;
    }
  }

  /**
   * Sincronizar NFe com API externa
   */
  async sincronizarNFe(nfeId: string, token: string): Promise<any> {
    try {
      console.log("🔄 API sincronizarNFe iniciado:", {
        nfeId,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>(
        `/api/nfe-integration/sincronizar/${nfeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API sincronizarNFe sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API sincronizarNFe erro:", error);
      throw error;
    }
  }

  /**
   * Obter status de integração da NFe
   */
  async getStatusIntegracaoNFe(nfeId: string, token: string): Promise<any> {
    try {
      console.log("🔄 API getStatusIntegracaoNFe iniciado:", {
        nfeId,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>(
        `/api/nfe-integration/status/${nfeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API getStatusIntegracaoNFe sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API getStatusIntegracaoNFe erro:", error);
      throw error;
    }
  }

  /**
   * Cancelar NFe via API externa
   */
  async cancelarNFeExterna(
    nfeId: string,
    justificativa: string,
    token: string
  ): Promise<any> {
    try {
      console.log("🔄 API cancelarNFeExterna iniciado:", {
        nfeId,
        justificativa: justificativa ? "presente" : "ausente",
      });
      const result = await this.request<any>(
        `/api/nfe-integration/cancelar/${nfeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ justificativa }),
        }
      );
      console.log("✅ API cancelarNFeExterna sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API cancelarNFeExterna erro:", error);
      throw error;
    }
  }

  /**
   * Download XML da NFe
   */
  async downloadXMLNFe(
    nfeId: string,
    token: string
  ): Promise<{ xml: string; filename: string }> {
    try {
      console.log("🔄 API downloadXMLNFe iniciado:", {
        nfeId,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<{ xml: string; filename: string }>(
        `/api/nfe-integration/xml/${nfeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API downloadXMLNFe sucesso:", {
        filename: result.filename,
        xmlLength: result.xml?.length,
      });
      return result;
    } catch (error) {
      console.error("❌ API downloadXMLNFe erro:", error);
      throw error;
    }
  }

  /**
   * Download PDF da NFe
   */
  async downloadPDFNFe(
    nfeId: string,
    token: string
  ): Promise<{ pdf: string; filename: string }> {
    try {
      console.log("🔄 API downloadPDFNFe iniciado:", {
        nfeId,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<{ pdf: string; filename: string }>(
        `/api/nfe-integration/pdf/${nfeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API downloadPDFNFe sucesso:", {
        filename: result.filename,
        pdfLength: result.pdf?.length,
      });
      return result;
    } catch (error) {
      console.error("❌ API downloadPDFNFe erro:", error);
      throw error;
    }
  }

  /**
   * Download DANFE da NFe
   */
  async downloadDANFENFe(
    nfeId: string,
    token: string
  ): Promise<{ danfe: string; filename: string }> {
    try {
      console.log("🔄 API downloadDANFENFe iniciado:", {
        nfeId,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<{ danfe: string; filename: string }>(
        `/api/nfe-integration/danfe/${nfeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API downloadDANFENFe sucesso:", {
        filename: result.filename,
        danfeLength: result.danfe?.length,
      });
      return result;
    } catch (error) {
      console.error("❌ API downloadDANFENFe erro:", error);
      throw error;
    }
  }

  /**
   * Consultar NFe por chave de acesso
   */
  async consultarNFeExterna(chaveAcesso: string, token: string): Promise<any> {
    try {
      console.log("🔄 API consultarNFeExterna iniciado:", {
        chaveAcesso,
        token: token ? "presente" : "ausente",
      });
      const result = await this.request<any>(
        `/api/nfe-integration/consulta/${chaveAcesso}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API consultarNFeExterna sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ API consultarNFeExterna erro:", error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
