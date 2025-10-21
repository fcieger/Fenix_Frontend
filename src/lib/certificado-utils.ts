/**
 * Utilitários para processamento de certificados digitais no frontend
 */

export interface CertificadoInfo {
  nome: string;
  cnpj: string;
  validade: string;
  tipo: 'A1' | 'A3';
  status: 'ativo' | 'expirado' | 'inativo';
  dataUpload: string;
  ultimaVerificacao: string;
}

export interface CertificadoValidationResult {
  isValid: boolean;
  error?: string;
  info?: CertificadoInfo;
}

export class CertificadoUtils {
  /**
   * Valida se o arquivo é um certificado válido
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Validação de extensão
    if (!file.name.endsWith('.pfx') && !file.name.endsWith('.p12')) {
      return {
        isValid: false,
        error: 'Formato inválido. Use apenas arquivos .pfx ou .p12'
      };
    }

    // Validação de tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        isValid: false,
        error: 'Arquivo muito grande. Máximo 5MB'
      };
    }

    // Validação de tamanho mínimo (pelo menos 1KB)
    if (file.size < 1024) {
      return {
        isValid: false,
        error: 'Arquivo muito pequeno. Verifique se é um certificado válido'
      };
    }

    return { isValid: true };
  }

  /**
   * Valida a senha do certificado (simulação)
   */
  static validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password || password.trim().length === 0) {
      return {
        isValid: false,
        error: 'Digite a senha do certificado'
      };
    }

    if (password.length < 1) {
      return {
        isValid: false,
        error: 'Senha não pode estar vazia'
      };
    }

    return { isValid: true };
  }

  /**
   * Simula a validação do certificado com senha
   * Em um cenário real, isso seria feito no backend
   */
  static async validateCertificado(
    file: File, 
    password: string
  ): Promise<CertificadoValidationResult> {
    try {
      // Validações básicas
      const fileValidation = this.validateFile(file);
      if (!fileValidation.isValid) {
        return { isValid: false, error: fileValidation.error };
      }

      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.isValid) {
        return { isValid: false, error: passwordValidation.error };
      }

      // Simular validação do certificado
      // Em um cenário real, aqui seria feita a validação real do .pfx/.p12
      await this.simulateCertificadoValidation();

      // Simular extração de informações do certificado
      const certInfo = this.extractCertificadoInfo(file, password);

      return {
        isValid: true,
        info: certInfo
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'Erro ao validar certificado. Verifique a senha e tente novamente.'
      };
    }
  }

  /**
   * Simula a validação do certificado (delay para parecer real)
   */
  private static async simulateCertificadoValidation(): Promise<void> {
    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sempre validar com sucesso para teste
    // Em produção, aqui seria feita a validação real do certificado
    return;
  }

  /**
   * Extrai informações do certificado (simulação)
   * Em um cenário real, isso seria feito com bibliotecas de criptografia
   */
  private static extractCertificadoInfo(file: File, password: string): CertificadoInfo {
    const now = new Date();
    const validade = new Date();
    validade.setFullYear(validade.getFullYear() + 1); // Simular validade de 1 ano

    // Simular diferentes tipos de certificado baseado no nome do arquivo
    const isA3 = file.name.toLowerCase().includes('a3') || file.name.toLowerCase().includes('token');
    const tipo = isA3 ? 'A3' : 'A1';

    // Simular informações baseadas no nome do arquivo
    const fileName = file.name.replace(/\.(pfx|p12)$/i, '');
    const nome = this.generateCompanyName(fileName);
    const cnpj = this.generateCNPJ();

    return {
      nome,
      cnpj,
      validade: validade.toISOString().split('T')[0],
      tipo,
      status: 'ativo',
      dataUpload: now.toISOString().split('T')[0],
      ultimaVerificacao: now.toISOString().split('T')[0]
    };
  }

  /**
   * Gera nome de empresa baseado no nome do arquivo
   */
  private static generateCompanyName(fileName: string): string {
    const companies = [
      'EMPRESA EXEMPLO LTDA',
      'TECH SOLUTIONS S.A.',
      'INOVAÇÃO DIGITAL LTDA',
      'SISTEMAS INTEGRADOS S.A.',
      'NEGÓCIOS MODERNOS LTDA',
      'TECNOLOGIA AVANÇADA S.A.',
      'SOLUÇÕES INTELIGENTES LTDA',
      'DIGITAL BUSINESS S.A.'
    ];

    // Usar hash do nome do arquivo para escolher empresa consistente
    let hash = 0;
    for (let i = 0; i < fileName.length; i++) {
      const char = fileName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const index = Math.abs(hash) % companies.length;
    return companies[index];
  }

  /**
   * Gera CNPJ simulado
   */
  private static generateCNPJ(): string {
    // Gerar CNPJ válido (apenas para simulação)
    const cnpj = Math.floor(Math.random() * 90000000000000) + 10000000000000;
    return cnpj.toString().replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Verifica se o certificado está expirado
   */
  static isCertificadoExpired(validade: string): boolean {
    const validadeDate = new Date(validade);
    const now = new Date();
    return validadeDate < now;
  }

  /**
   * Calcula dias restantes para expiração
   */
  static getDaysUntilExpiration(validade: string): number {
    const validadeDate = new Date(validade);
    const now = new Date();
    const diffTime = validadeDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Formata data para exibição
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  /**
   * Gera hash do arquivo para verificação de integridade
   */
  static async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
