/**
 * Serviço para integração com a API NFe
 */

export interface ProdutoNFe {
  codigoProduto: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidadeComercial: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  codigoBarras?: string;
  cest?: string;
  informacoesAdicionais?: string;
}

export interface NFeRequest {
  cnpjEmitente: string;
  nomeEmitente: string;
  cnpjDestinatario: string;
  nomeDestinatario: string;
  numeroNFe: number;
  serie: number;
  dataEmissao: string;
  naturezaOperacao: string;
  produtos: ProdutoNFe[];
  valorTotal: number;
  observacoes?: string;
  ambiente: 'HOMOLOGACAO' | 'PRODUCAO';
  estado: string;
}

export interface NFeResponse {
  sucesso: boolean;
  mensagem: string;
  chaveNFe?: string;
  protocolo?: string;
  status?: string;
  xmlNFe?: string;
  xmlProcNFe?: string;
  dataProcessamento: string;
  numeroLote?: string;
  numeroRecibo?: string;
}

class NFeService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_NFE_API_URL || '';
  }

  /**
   * Emite uma NFe através da API
   */
  async emitirNFe(dadosNFe: NFeRequest): Promise<NFeResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/nfe/emitir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosNFe),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao emitir NFe:', error);
      throw error;
    }
  }

  /**
   * Verifica o status da API NFe
   */
  async verificarStatus(): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/nfe/status`);
      return await response.text();
    } catch (error) {
      console.error('Erro ao verificar status da API:', error);
      throw error;
    }
  }

  /**
   * Verifica a saúde da API
   */
  async verificarSaude(): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/nfe/health`);
      return await response.text();
    } catch (error) {
      console.error('Erro ao verificar saúde da API:', error);
      throw error;
    }
  }

  /**
   * Cria uma NFe de exemplo para teste
   */
  criarNFeExemplo(): NFeRequest {
    return {
      cnpjEmitente: '12345678000123',
      nomeEmitente: 'Empresa Teste LTDA',
      cnpjDestinatario: '98765432000123',
      nomeDestinatario: 'Cliente Teste LTDA',
      numeroNFe: Math.floor(Math.random() * 1000) + 1,
      serie: 1,
      dataEmissao: new Date().toISOString(),
      naturezaOperacao: 'Venda de Mercadoria',
      produtos: [
        {
          codigoProduto: '001',
          descricao: 'Produto Teste',
          ncm: '12345678',
          cfop: '5102',
          unidadeComercial: 'UN',
          quantidade: 1,
          valorUnitario: 100.00,
          valorTotal: 100.00,
          codigoBarras: '1234567890123',
          cest: '1234567',
          informacoesAdicionais: 'Produto para teste'
        }
      ],
      valorTotal: 100.00,
      observacoes: 'Nota fiscal de teste',
      ambiente: 'HOMOLOGACAO',
      estado: 'GO'
    };
  }
}

export const nfeService = new NFeService();
export default nfeService;




