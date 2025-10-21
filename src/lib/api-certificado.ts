import { API_CONFIG } from '@/config/api';

const BASE_URL = API_CONFIG.BASE_URL || 'http://localhost:3001';

export interface CertificadoUploadData {
  arquivo: File;
  senha: string;
}

export interface CertificadoInfo {
  id: string;
  nome: string;
  cnpj: string;
  validade: string;
  tipo: 'A1' | 'A3';
  status: 'ativo' | 'expirado' | 'inativo';
  dataUpload: string;
  ultimaVerificacao: string;
}

export class CertificadoService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('fenix_token') || localStorage.getItem('auth-token') || localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async uploadCertificado(data: CertificadoUploadData): Promise<CertificadoInfo> {
    try {
      const formData = new FormData();
      formData.append('arquivo', data.arquivo);
      formData.append('senha', data.senha);

      const token = localStorage.getItem('fenix_token') || localStorage.getItem('auth-token') || localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/certificado/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar certificado');
      }

      const result = await response.json();
      return {
        id: result.id,
        nome: result.nome,
        cnpj: result.cnpj,
        validade: result.validade,
        tipo: result.tipo,
        status: result.status,
        dataUpload: result.dataUpload,
        ultimaVerificacao: result.ultimaVerificacao
      };
    } catch (error) {
      console.error('Erro ao fazer upload do certificado:', error);
      throw error;
    }
  }

  static async getCertificado(): Promise<CertificadoInfo | null> {
    try {
      const token = localStorage.getItem('fenix_token') || localStorage.getItem('auth-token') || localStorage.getItem('token');
      console.log('🔑 Token para certificado:', token ? token.substring(0, 20) + '...' : 'Nenhum token encontrado');
      
      const response = await fetch(`${BASE_URL}/api/certificado`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao carregar certificado');
      }

      // Verificar se a resposta está vazia
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0' || !response.body) {
        return null;
      }

      const result = await response.json();
      return {
        id: result.id,
        nome: result.nome,
        cnpj: result.cnpj,
        validade: result.validade,
        tipo: result.tipo,
        status: result.status,
        dataUpload: result.dataUpload,
        ultimaVerificacao: result.ultimaVerificacao
      };
    } catch (error) {
      console.error('Erro ao carregar certificado:', error);
      return null;
    }
  }

  static async deleteCertificado(): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/api/certificado`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }

      if (response.status === 404) {
        throw new Error('Certificado não encontrado');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao remover certificado');
      }
    } catch (error) {
      console.error('Erro ao remover certificado:', error);
      throw error;
    }
  }

  static async verificarCertificado(): Promise<CertificadoInfo> {
    try {
      const response = await fetch(`${BASE_URL}/api/certificado/verificar`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }

      if (response.status === 404) {
        throw new Error('Certificado não encontrado');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao verificar certificado');
      }

      const result = await response.json();
      return {
        id: result.id,
        nome: result.nome,
        cnpj: result.cnpj,
        validade: result.validade,
        tipo: result.tipo,
        status: result.status,
        dataUpload: result.dataUpload,
        ultimaVerificacao: result.ultimaVerificacao
      };
    } catch (error) {
      console.error('Erro ao verificar certificado:', error);
      throw error;
    }
  }
}
