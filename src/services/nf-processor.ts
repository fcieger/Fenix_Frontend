import { apiService } from '@/lib/api';
import { CadastroData } from '@/lib/api';
import type { Product } from '@/types/sdk';
import { ParsedNFData } from '@/lib/ocr-parser';
import { criarPedidoCompra } from './pedidos-compra';
import type { PedidoCompra, PedidoCompraItem } from '@/types/pedido-compra';

export interface ProcessingResult {
  success: boolean;
  fornecedor?: {
    id: string;
    nome: string;
    isNew: boolean;
  };
  produtos?: Array<{
    id?: string;
    nome: string;
    codigo: string;
    isNew: boolean;
    notFound?: boolean;
  }>;
  pedidoCompra?: any;
  errors?: string[];
  warnings?: string[];
  needsUserInput?: boolean;
  missingFornecedor?: any;
  missingProdutos?: any[];
}

export class NFProcessor {
  constructor(
    private companyId: string,
    private token: string
  ) {}

  /**
   * Processar nota fiscal completa
   */
  async process(parsedData: ParsedNFData, autoCreate: boolean = true): Promise<ProcessingResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Validações iniciais
      if (!parsedData.fornecedor.cnpj && !parsedData.fornecedor.razaoSocial) {
        errors.push('Não foi possível identificar o fornecedor');
      }

      if (parsedData.itens.length === 0) {
        errors.push('Nenhum produto identificado na nota');
      }

      if (errors.length > 0) {
        return { success: false, errors };
      }

      // 2. Processar fornecedor
      const fornecedor = await this.processarFornecedor(parsedData.fornecedor, autoCreate);
      if (!fornecedor) {
        // Retornar com aviso para usuário selecionar fornecedor
        return {
          success: false,
          errors: ['Fornecedor não encontrado'],
          warnings: [`Fornecedor "${parsedData.fornecedor.razaoSocial || parsedData.fornecedor.cnpj}" não está cadastrado. Selecione um fornecedor existente ou cadastre-o primeiro.`],
          needsUserInput: true,
          missingFornecedor: parsedData.fornecedor
        };
      }

      if (fornecedor.isNew) {
        warnings.push(`Fornecedor encontrado: ${fornecedor.nome}`);
      }

      // 3. Processar produtos
      const produtos = await this.processarProdutos(parsedData.itens, autoCreate);
      const produtosNaoEncontrados = produtos.filter((p: any) => p.notFound);

      if (produtosNaoEncontrados.length > 0) {
        // Retornar com aviso para usuário selecionar produtos
        return {
          success: false,
          errors: [`${produtosNaoEncontrados.length} produto(s) não encontrado(s)`],
          warnings: [
            `Os seguintes produtos não foram encontrados no cadastro:`,
            ...produtosNaoEncontrados.map((p: any) => `- ${p.nome}`)
          ],
          needsUserInput: true,
          missingProdutos: produtosNaoEncontrados,
          fornecedor
        };
      }

      const produtosEncontrados = produtos.filter((p: any) => !p.notFound);
      if (produtosEncontrados.length > 0) {
        warnings.push(`${produtosEncontrados.length} produto(s) encontrado(s) no cadastro`);
      }

      // 4. Montar pedido de compra
      const pedidoPayload = this.montarPedidoCompra(parsedData, fornecedor.id, produtos);

      return {
        success: true,
        fornecedor,
        produtos,
        pedidoCompra: pedidoPayload,
        warnings
      };

    } catch (error: any) {
      errors.push(`Erro no processamento: ${error.message}`);
      return { success: false, errors };
    }
  }

  /**
   * Buscar ou criar fornecedor
   */
  private async processarFornecedor(dadosFornecedor: any, autoCreate: boolean) {
    try {
      // Buscar cadastros
      const cadastros = await apiService.getCadastros(this.companyId);

      // Buscar por CNPJ
      if (dadosFornecedor.cnpj) {
        const existente = cadastros.find(c =>
          c.cnpj === dadosFornecedor.cnpj
        );

        if (existente) {
          return {
            id: existente.id!,
            nome: existente.nomeRazaoSocial,
            isNew: false
          };
        }
      }

      // Buscar por nome (fuzzy)
      if (dadosFornecedor.razaoSocial) {
        const existente = cadastros.find(c =>
          this.similaridade(c.nomeRazaoSocial, dadosFornecedor.razaoSocial) > 0.8
        );

        if (existente) {
          return {
            id: existente.id!,
            nome: existente.nomeRazaoSocial,
            isNew: false
          };
        }
      }

      // NÃO criar automaticamente - retornar null para usuário selecionar
      console.log('⚠️ Fornecedor não encontrado:', {
        cnpj: dadosFornecedor.cnpj,
        razaoSocial: dadosFornecedor.razaoSocial
      });

      return null;
    } catch (error) {
      console.error('Erro ao processar fornecedor:', error);
      throw error;
    }
  }

  /**
   * Buscar ou criar produtos
   */
  private async processarProdutos(itens: any[], autoCreate: boolean) {
    const produtos = await apiService.getProdutos(this.companyId);
    const resultado: any[] = [];

    for (const item of itens) {
      // Buscar produto existente
      let produtoExistente = produtos.find(p =>
        (item.codigo && ((p as any).codigo === item.codigo || p.sku === item.codigo)) ||
        this.similaridade(p.nome, item.descricao) > 0.85
      );

      if (produtoExistente) {
        resultado.push({
          id: produtoExistente.id!,
          nome: produtoExistente.nome,
          codigo: produtoExistente.sku || '',
          isNew: false
        });
      } else {
        // NÃO criar automaticamente - adicionar como não encontrado
        console.log('⚠️ Produto não encontrado:', item.descricao);
        resultado.push({
          id: undefined,
          nome: item.descricao,
          codigo: item.codigo || '',
          isNew: false,
          notFound: true // Flag para indicar que precisa ser selecionado
        });
      }
    }

    return resultado;
  }

  /**
   * Montar payload do pedido de compra
   */
  private montarPedidoCompra(parsedData: ParsedNFData, fornecedorId: string, produtos: any[]): PedidoCompra {
    const itens: PedidoCompraItem[] = parsedData.itens.map((item, index) => {
      const produtoMatch = produtos[index];

      // Validar e corrigir quantidade (não pode ser valor monetário)
      let quantidade = Number(item.quantidade) || 1;
      if (quantidade > 10000 || quantidade < 0.001) {
        console.warn(`⚠️ Quantidade suspeita (${quantidade}), usando 1`);
        quantidade = 1;
      }

      // Validar e corrigir preço unitário
      let precoUnitario = Number(item.valorUnitario) || Number(item.valorTotal) || 0;
      if (precoUnitario < 0) {
        console.warn(`⚠️ Preço unitário negativo (${precoUnitario}), usando 0`);
        precoUnitario = 0;
      }

      // Corrigir nome do item (não pode ser quantidade/unidade)
      let nome = item.descricao || produtoMatch?.nome || `Item ${index + 1}`;
      // Se nome parece ser quantidade/unidade (ex: "1,000 UN"), usar nome do produto
      if (nome.match(/^\d+[,.]?\d*\s*(UN|KG|PC|CX|LT|MT|UN\.)/i)) {
        console.warn(`⚠️ Nome do item parece ser quantidade: "${nome}", usando nome do produto`);
        nome = produtoMatch?.nome || `Produto ${index + 1}`;
      }

      // Calcular total do item
      const totalItem = quantidade * precoUnitario;

      return {
        companyId: this.companyId,
        produtoId: produtoMatch?.id,
        codigo: item.codigo || (produtoMatch as any)?.codigo || produtoMatch?.sku || `ITEM-${index + 1}`,
        nome: nome,
        unidade: item.unidade || 'UN',
        quantidade: quantidade,
        precoUnitario: precoUnitario,
        descontoValor: 0,
        totalItem: totalItem,
        numeroItem: index + 1,
        // Adicionar naturezaOperacaoId padrão (será definido pela API)
        naturezaOperacaoId: (produtoMatch as any)?.naturezaOperacaoId || ''
      };
    });

    // Calcular totais corretamente
    const totalProdutos = itens.reduce((sum, item) => sum + item.totalItem, 0);
    const totalDescontos = 0;
    const totalImpostos = 0;
    const totalGeral = totalProdutos - totalDescontos + totalImpostos;

    console.log('📊 Totais calculados:', { totalProdutos, totalDescontos, totalImpostos, totalGeral });

    return {
      companyId: this.companyId,
      numero: parsedData.nota.numero || `PC-OCR-${Date.now()}`,
      serie: parsedData.nota.serie,
      dataEmissao: this.parseData(parsedData.nota.dataEmissao),
      fornecedorId,
      totalProdutos: totalProdutos,
      totalDescontos: totalDescontos,
      totalImpostos: totalImpostos,
      totalGeral: totalGeral,
      status: 'rascunho',
      observacoes: `Lançamento automático via OCR\nConfiança: ${parsedData.confidence.toFixed(1)}%${parsedData.nota.chaveAcesso ? `\nChave: ${parsedData.nota.chaveAcesso}` : ''}`,
      itens
    };
  }

  /**
   * Calcular similaridade entre strings (Levenshtein simplificado)
   */
  private similaridade(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Converter data DD/MM/YYYY para YYYY-MM-DD
   */
  private parseData(dataStr?: string): string {
    if (!dataStr) return new Date().toISOString().split('T')[0];

    const match = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }

    return new Date().toISOString().split('T')[0];
  }
}

