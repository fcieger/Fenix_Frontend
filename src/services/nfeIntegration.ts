/**
 * Serviço de integração entre FENIX e API NFe externa
 * Converte dados do FENIX para o formato da API NFe
 */

import { nfeService, NFeRequest, ProdutoNFe } from './nfeService';

export interface FENIXNFeData {
  // Dados do FENIX
  configuracaoNfeId: string;
  naturezaOperacao: string;
  modelo: string;
  serie: string;
  numero: string;
  dataEmissao: string;
  dataSaida: string;
  tipoOperacao: string;
  finalidade: string;
  consumidorFinal: boolean;
  indicadorPresenca: string;
  
  // Destinatário
  destinatario: {
    tipo: 'cnpj' | 'cpf';
    cnpjCpf: string;
    razaoSocial: string;
    nomeFantasia?: string;
    ie?: string;
    im?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    cep?: string;
    telefone?: string;
    email?: string;
  };
  
  // Produtos
  itens: Array<{
    id: string;
    codigo: string;
    descricao: string;
    ncm: string;
    cfop: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    valorDesconto: number;
    valorTotal: number;
  }>;
  
  // Totais
  totais: {
    valorProdutos: number;
    valorDesconto: number;
    valorFrete: number;
    valorSeguro: number;
    valorOutros: number;
    valorTotal: number;
  };
  
  // Ambiente
  ambiente: 'homologacao' | 'producao';
}

export class FENIXNFeIntegration {
  
  /**
   * Converte dados do FENIX para formato da API NFe
   */
  static convertFENIXToNFeAPI(fenixData: FENIXNFeData): NFeRequest {
    return {
      cnpjEmitente: '12345678000123', // TODO: Buscar do contexto da empresa
      nomeEmitente: 'Empresa FENIX', // TODO: Buscar do contexto da empresa
      cnpjDestinatario: fenixData.destinatario.cnpjCpf,
      nomeDestinatario: fenixData.destinatario.razaoSocial,
      numeroNFe: parseInt(fenixData.numero),
      serie: parseInt(fenixData.serie),
      dataEmissao: fenixData.dataEmissao,
      naturezaOperacao: fenixData.naturezaOperacao,
      produtos: fenixData.itens.map(item => this.convertItem(item)),
      valorTotal: fenixData.totais.valorTotal,
      observacoes: `NFe emitida via FENIX - Modelo ${fenixData.modelo}`,
      ambiente: fenixData.ambiente.toUpperCase() as 'HOMOLOGACAO' | 'PRODUCAO',
      estado: fenixData.destinatario.uf || 'GO'
    };
  }
  
  /**
   * Converte item do FENIX para formato da API NFe
   */
  private static convertItem(item: FENIXNFeData['itens'][0]): ProdutoNFe {
    return {
      codigoProduto: item.codigo,
      descricao: item.descricao,
      ncm: item.ncm,
      cfop: item.cfop,
      unidadeComercial: item.unidade,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorTotal: item.valorTotal,
      codigoBarras: item.codigo, // Usar código como código de barras
      cest: '', // TODO: Implementar CEST
      informacoesAdicionais: `Item ${item.codigo}`
    };
  }
  
  /**
   * Emite NFe usando dados do FENIX
   */
  static async emitirNFeFENIX(fenixData: FENIXNFeData) {
    try {
      // Converter dados
      const nfeRequest = this.convertFENIXToNFeAPI(fenixData);
      
      // Emitir via API NFe
      const resultado = await nfeService.emitirNFe(nfeRequest);
      
      return {
        sucesso: resultado.sucesso,
        mensagem: resultado.mensagem,
        chaveNFe: resultado.chaveNFe,
        protocolo: resultado.protocolo,
        xmlProcNFe: resultado.xmlProcNFe,
        dadosOriginais: fenixData
      };
    } catch (error) {
      console.error('Erro ao emitir NFe via integração:', error);
      throw error;
    }
  }
  
  /**
   * Testa a integração com dados de exemplo
   */
  static async testarIntegracao() {
    const dadosExemplo: FENIXNFeData = {
      configuracaoNfeId: 'teste-123',
      naturezaOperacao: 'Venda de Mercadoria',
      modelo: '55',
      serie: '1',
      numero: '1',
      dataEmissao: new Date().toISOString(),
      dataSaida: new Date().toISOString(),
      tipoOperacao: 'SAIDA',
      finalidade: 'NORMAL',
      consumidorFinal: false,
      indicadorPresenca: 'PRESENCIAL',
      destinatario: {
        tipo: 'cnpj',
        cnpjCpf: '98765432000123',
        razaoSocial: 'Cliente Teste LTDA',
        nomeFantasia: 'Cliente Teste',
        ie: '123456789',
        logradouro: 'Rua Teste',
        numero: '123',
        bairro: 'Centro',
        municipio: 'Goiânia',
        uf: 'GO',
        cep: '74000000',
        telefone: '6233333333',
        email: 'teste@cliente.com'
      },
      itens: [
        {
          id: '1',
          codigo: '001',
          descricao: 'Produto Teste FENIX',
          ncm: '12345678',
          cfop: '5102',
          unidade: 'UN',
          quantidade: 1,
          valorUnitario: 100.00,
          valorDesconto: 0,
          valorTotal: 100.00
        }
      ],
      totais: {
        valorProdutos: 100.00,
        valorDesconto: 0,
        valorFrete: 0,
        valorSeguro: 0,
        valorOutros: 0,
        valorTotal: 100.00
      },
      ambiente: 'homologacao'
    };
    
    return await this.emitirNFeFENIX(dadosExemplo);
  }
}

export default FENIXNFeIntegration;




