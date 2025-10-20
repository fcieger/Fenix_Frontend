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
    const token = localStorage.getItem('auth-token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  static async uploadCertificado(data: CertificadoUploadData): Promise<CertificadoInfo> {
    try {
      const formData = new FormData();
      formData.append('arquivo', data.arquivo);
      formData.append('senha', data.senha);

      const response = await fetch(`${BASE_URL}/api/certificado/upload`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      if (response.status === 401) {
        throw new Error('API de certificados não implementada ainda');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar certificado');
      }

      return response.json();
    } catch (error) {
      console.warn('API de certificados não disponível:', error);
      throw new Error('API de certificados não implementada ainda');
    }
  }

  static async getCertificado(): Promise<CertificadoInfo | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/certificado`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 404) {
        return null;
      }

      if (response.status === 401) {
        // API não implementada ainda, retorna null silenciosamente
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao carregar certificado');
      }

      return response.json();
    } catch (error) {
      // Se der erro de rede ou API não existir, retorna null silenciosamente
      console.warn('API de certificados não disponível:', error);
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
        throw new Error('API de certificados não implementada ainda');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao remover certificado');
      }
    } catch (error) {
      console.warn('API de certificados não disponível:', error);
      throw new Error('API de certificados não implementada ainda');
    }
  }

  static async verificarCertificado(): Promise<CertificadoInfo> {
    try {
      const response = await fetch(`${BASE_URL}/api/certificado/verificar`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 401) {
        throw new Error('API de certificados não implementada ainda');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao verificar certificado');
      }

      return response.json();
    } catch (error) {
      console.warn('API de certificados não disponível:', error);
      throw new Error('API de certificados não implementada ainda');
    }
  }
}
