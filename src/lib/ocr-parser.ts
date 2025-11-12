export interface ParsedNFData {
  fornecedor: {
    cnpj?: string;
    razaoSocial?: string;
    endereco?: string;
    telefone?: string;
  };
  nota: {
    numero?: string;
    serie?: string;
    dataEmissao?: string;
    chaveAcesso?: string;
    valorTotal?: number;
    valorProdutos?: number;
  };
  itens: Array<{
    codigo?: string;
    descricao: string;
    quantidade?: number;
    unidade?: string;
    valorUnitario?: number;
    valorTotal?: number;
  }>;
  confidence: number;
  rawText: string;
}

export class OCRParser {
  /**
   * Parse completo do texto OCR
   */
  static parseNotaFiscal(text: string, confidence: number): ParsedNFData {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    return {
      fornecedor: this.extractFornecedor(text, lines),
      nota: this.extractNotaInfo(text, lines),
      itens: this.extractItens(text, lines),
      confidence,
      rawText: text
    };
  }

  /**
   * Extrair dados do fornecedor
   */
  private static extractFornecedor(text: string, lines: string[]) {
    const fornecedor: any = {};

    // CNPJ
    const cnpjMatch = text.match(/CNPJ[:\s]*(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/i);
    if (cnpjMatch) {
      fornecedor.cnpj = cnpjMatch[1].replace(/\D/g, '');
    }

    // Razão Social (geralmente após "CNPJ" ou no início)
    const cnpjLineIndex = lines.findIndex(l => /CNPJ/i.test(l));
    if (cnpjLineIndex >= 0) {
      // Procurar nome nas linhas acima do CNPJ
      for (let i = Math.max(0, cnpjLineIndex - 3); i < cnpjLineIndex; i++) {
        const line = lines[i];
        // Nome geralmente tem mais de 5 caracteres e não é número
        if (line.length > 5 && !/^\d+$/.test(line) && !/DANFE|NOTA|FISCAL/i.test(line)) {
          fornecedor.razaoSocial = line;
          break;
        }
      }
    }

    // Telefone
    const telefoneMatch = text.match(/(?:Tel|Fone)[:\s]*(\(?\d{2}\)?\s?\d{4,5}-?\d{4})/i);
    if (telefoneMatch) {
      fornecedor.telefone = telefoneMatch[1].replace(/\D/g, '');
    }

    // Endereço (procurar por CEP para identificar)
    const cepMatch = text.match(/CEP[:\s]*(\d{5}-?\d{3})/i);
    if (cepMatch) {
      const cepLineIndex = lines.findIndex(l => l.includes(cepMatch[0]));
      if (cepLineIndex > 0) {
        fornecedor.endereco = lines[cepLineIndex - 1];
      }
    }

    return fornecedor;
  }

  /**
   * Extrair informações da nota
   */
  private static extractNotaInfo(text: string, lines: string[]) {
    const nota: any = {};

    // Número da NF
    const numeroMatch = text.match(/N[°º\s]*NF[:\s-]*(\d+)/i) || 
                       text.match(/N[úu]mero[:\s]*(\d+)/i) ||
                       text.match(/NF[eE][:\s-]*(\d+)/i);
    if (numeroMatch) {
      nota.numero = numeroMatch[1];
    }

    // Série
    const serieMatch = text.match(/S[ée]rie[:\s]*(\d+)/i);
    if (serieMatch) {
      nota.serie = serieMatch[1];
    }

    // Data de Emissão
    const dataMatch = text.match(/(?:Data|Emiss[ãa]o)[:\s]*(\d{2}\/\d{2}\/\d{4})/i) ||
                     text.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (dataMatch) {
      nota.dataEmissao = dataMatch[1];
    }

    // Chave de Acesso
    const chaveMatch = text.match(/(?:Chave|Acesso)[:\s]*(\d{44})/i) ||
                      text.match(/(\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4})/);
    if (chaveMatch) {
      nota.chaveAcesso = chaveMatch[1].replace(/\s/g, '');
    }

    // Valor Total
    const valorTotalMatch = text.match(/(?:Total|Valor\s+Total)[:\s]*R?\$?\s*([0-9.,]+)/i);
    if (valorTotalMatch) {
      nota.valorTotal = this.parseValor(valorTotalMatch[1]);
    }

    // Valor dos Produtos
    const valorProdutosMatch = text.match(/(?:Produtos|Mercadorias)[:\s]*R?\$?\s*([0-9.,]+)/i);
    if (valorProdutosMatch) {
      nota.valorProdutos = this.parseValor(valorProdutosMatch[1]);
    }

    return nota;
  }

  /**
   * Extrair itens da nota
   */
  private static extractItens(text: string, lines: string[]) {
    const itens: any[] = [];

    // Encontrar início da tabela de produtos
    const tabelaStartIndex = lines.findIndex(l => 
      /produto|item|descri[çc][ãa]o|c[óo]digo/i.test(l)
    );

    if (tabelaStartIndex < 0) {
      // Se não encontrou cabeçalho, tentar extrair produtos de forma genérica
      return this.extractItensGenerico(text, lines);
    }

    // Processar linhas após o cabeçalho
    for (let i = tabelaStartIndex + 1; i < lines.length; i++) {
      const line = lines[i];

      // Parar se encontrar totalizadores
      if (/total|subtotal|frete|desconto|nota/i.test(line)) {
        break;
      }

      // Tentar extrair dados estruturados
      // Padrão comum: [CODIGO] [DESCRIÇÃO] [QTD] [UN] [VL.UNIT] [VL.TOTAL]
      const patterns = [
        // Padrão 1: codigo desc qtd un vlunit vltotal
        /^(\S+)\s+(.+?)\s+(\d+[,.]?\d*)\s+(\w+)\s+([0-9.,]+)\s+([0-9.,]+)$/,
        // Padrão 2: desc qtd vlunit vltotal
        /^(.+?)\s+(\d+[,.]?\d*)\s+([0-9.,]+)\s+([0-9.,]+)$/,
        // Padrão 3: desc qtd vltotal
        /^(.+?)\s+(\d+[,.]?\d*)\s+([0-9.,]+)$/
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const item: any = {};

          if (pattern === patterns[0]) {
            item.codigo = match[1];
            item.descricao = match[2].trim();
            item.quantidade = parseFloat(match[3].replace(',', '.'));
            item.unidade = match[4];
            item.valorUnitario = this.parseValor(match[5]);
            item.valorTotal = this.parseValor(match[6]);
          } else if (pattern === patterns[1]) {
            item.descricao = match[1].trim();
            item.quantidade = parseFloat(match[2].replace(',', '.'));
            item.valorUnitario = this.parseValor(match[3]);
            item.valorTotal = this.parseValor(match[4]);
          } else {
            item.descricao = match[1].trim();
            item.quantidade = parseFloat(match[2].replace(',', '.'));
            item.valorTotal = this.parseValor(match[3]);
            item.valorUnitario = item.valorTotal / item.quantidade;
          }

          itens.push(item);
          break;
        }
      }
    }

    return itens;
  }

  /**
   * Extrair itens de forma genérica (quando não encontra tabela estruturada)
   */
  private static extractItensGenerico(text: string, lines: string[]): any[] {
    const itens: any[] = [];
    
    // Procurar por linhas que parecem produtos (tem número e valor)
    for (const line of lines) {
      // Pular linhas muito curtas ou muito longas
      if (line.length < 5 || line.length > 150) continue;
      
      // Procurar padrão: texto seguido de números
      const match = line.match(/^(.+?)\s+(\d+[,.]?\d*)\s+.*?([0-9.,]+)$/);
      if (match) {
        itens.push({
          descricao: match[1].trim(),
          quantidade: parseFloat(match[2].replace(',', '.')),
          valorTotal: this.parseValor(match[3])
        });
      }
    }

    return itens;
  }

  /**
   * Converter string de valor para número
   */
  private static parseValor(valorStr: string): number {
    // Remove espaços e converte , para .
    const cleaned = valorStr.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  /**
   * Calcular score de confiança baseado nos dados extraídos
   */
  static calculateConfidenceScore(parsed: ParsedNFData): number {
    let score = parsed.confidence;

    // Bonus por dados encontrados
    if (parsed.fornecedor.cnpj) score += 10;
    if (parsed.fornecedor.razaoSocial) score += 5;
    if (parsed.nota.numero) score += 10;
    if (parsed.nota.valorTotal) score += 10;
    if (parsed.itens.length > 0) score += 15;

    return Math.min(100, score);
  }
}


