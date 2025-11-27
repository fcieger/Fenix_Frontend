import { api } from '@/config/api';

export interface NFeItem {
  id?: string;
  codigoProduto: string;
  descricao: string;
  ncm?: string;
  cfop?: string;
  unidadeComercial?: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal?: number;
  valorDesconto?: number;
  aliquotaIcms?: number;
  valorIcms?: number;
  aliquotaIpi?: number;
  valorIpi?: number;
  aliquotaPis?: number;
  valorPis?: number;
  aliquotaCofins?: number;
  valorCofins?: number;
  observacoes?: string;
}

export interface NFe {
  id: string;
  companyId: string;
  numeroNfe: string;
  serie: string;
  chaveAcesso: string;
  status: string;
  xmlNfe?: string;
  xmlRetorno?: string;
  dataEmissao: string;
  dataAutorizacao?: string;
  valorTotal: number;
  valorIcms?: number;
  valorIpi?: number;
  valorPis?: number;
  valorCofins?: number;
  naturezaOperacao: string;
  destinatarioCnpj: string;
  destinatarioNome: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  itens: NFeItem[];
}

export interface NFeRequest {
  companyId: string;
  naturezaOperacao: string;
  destinatarioCnpj: string;
  destinatarioNome: string;
  observacoes?: string;
  itens: NFeItem[];
}

export interface NFeStatus {
  chaveAcesso: string;
  status: string;
  dataAutorizacao?: string;
  numeroNfe: string;
  serie: string;
}

export interface NFeXml {
  chaveAcesso: string;
  xmlNfe: string;
  xmlRetorno: string;
}

export class NFeService {
  private static baseUrl = '/nfe';

  /**
   * Emitir nova NFe
   */
  static async emitirNFe(data: NFeRequest): Promise<NFe> {
    try {
      const response = await api.post(`${this.baseUrl}/emitir`, data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao emitir NFe:', error);
      throw new Error(error.response?.data?.message || 'Erro ao emitir NFe');
    }
  }

  /**
   * Consultar NFe por chave de acesso
   */
  static async consultarNFe(chaveAcesso: string): Promise<NFe> {
    try {
      const response = await api.get(`${this.baseUrl}/${chaveAcesso}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao consultar NFe:', error);
      throw new Error(error.response?.data?.message || 'Erro ao consultar NFe');
    }
  }

  /**
   * Listar NFes por empresa
   */
  static async listarNFes(companyId: string): Promise<NFe[]> {
    try {
      const response = await api.get(`${this.baseUrl}/companies/${companyId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar NFes:', error);
      throw new Error(error.response?.data?.message || 'Erro ao listar NFes');
    }
  }

  /**
   * Cancelar NFe
   */
  static async cancelarNFe(chaveAcesso: string, justificativa: string): Promise<NFe> {
    try {
      const response = await api.post(`${this.baseUrl}/${chaveAcesso}/cancelar`, {
        justificativa
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao cancelar NFe:', error);
      throw new Error(error.response?.data?.message || 'Erro ao cancelar NFe');
    }
  }

  /**
   * Consultar status da NFe
   */
  static async consultarStatus(chaveAcesso: string): Promise<NFeStatus> {
    try {
      const response = await api.get(`${this.baseUrl}/${chaveAcesso}/status`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao consultar status:', error);
      throw new Error(error.response?.data?.message || 'Erro ao consultar status');
    }
  }

  /**
   * Download do XML da NFe
   */
  static async downloadXml(chaveAcesso: string): Promise<NFeXml> {
    try {
      const response = await api.get(`${this.baseUrl}/${chaveAcesso}/xml`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao baixar XML:', error);
      throw new Error(error.response?.data?.message || 'Erro ao baixar XML');
    }
  }

  /**
   * Testar conectividade do serviço NFe
   */
  static async testarConectividade(): Promise<{ message: string; timestamp: string; version: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/test`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao testar conectividade:', error);
      throw new Error(error.response?.data?.message || 'Erro ao testar conectividade');
    }
  }
}

















