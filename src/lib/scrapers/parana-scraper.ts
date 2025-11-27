/**
 * Web Scraper para Portal de Transparência do Paraná
 * URL: https://www.transparencia.pr.gov.br/pte/purchases/tenders/pesquisar-param
 * 
 * Extrai licitações estaduais do Paraná em tempo real
 */

import axios from 'axios';

export interface LicitacaoParana {
  titulo: string;
  objeto: string;
  numeroProcesso: string;
  orgao: string;
  modalidade: string;
  dataAbertura: string;
  dataLimite?: string;
  valor?: number;
  situacao: string;
  link?: string;
}

export class ParanaScraper {
  private static BASE_URL = 'https://www.transparencia.pr.gov.br';
  
  /**
   * Busca licitações abertas do Paraná
   */
  static async buscarLicitacoes(): Promise<LicitacaoParana[]> {
    try {
      console.log('🕷️ Iniciando scraping do Portal do Paraná...');
      
      const response = await axios.get(
        `${this.BASE_URL}/pte/purchases/tenders/pesquisar-param`,
        {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; FenixERP/1.0; +https://fenixerp.com.br)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        }
      );

      const html = response.data;
      
      // Extrair licitações do HTML usando regex
      // O portal usa JavaScript para carregar dados, então vamos extrair dos elementos visíveis
      const licitacoes = this.extrairLicitacoesDoHTML(html);
      
      console.log(`✅ Scraping concluído: ${licitacoes.length} licitações do PR encontradas`);
      
      return licitacoes;
    } catch (error: any) {
      console.error('❌ Erro ao fazer scraping do Paraná:', error.message);
      return [];
    }
  }

  /**
   * Extrai dados de licitações do HTML
   */
  private static extrairLicitacoesDoHTML(html: string): LicitacaoParana[] {
    const licitacoes: LicitacaoParana[] = [];
    
    try {
      // Extrair textos das licitações (dentro dos overlays)
      const regexObjeto = /<div class="ui-overlaypanel-content">(.*?)<\/div>/g;
      const regexData = /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/g;
      
      const objetos: string[] = [];
      let match;
      
      while ((match = regexObjeto.exec(html)) !== null) {
        const texto = match[1]
          .replace(/&aacute;/g, 'á')
          .replace(/&atilde;/g, 'ã')
          .replace(/&eacute;/g, 'é')
          .replace(/&iacute;/g, 'í')
          .replace(/&oacute;/g, 'ó')
          .replace(/&uacute;/g, 'ú')
          .replace(/&ccedil;/g, 'ç')
          .replace(/&Aacute;/g, 'Á')
          .replace(/&Atilde;/g, 'Ã')
          .replace(/&Eacute;/g, 'É')
          .replace(/&Iacute;/g, 'Í')
          .replace(/&Oacute;/g, 'Ó')
          .replace(/&Uacute;/g, 'Ú')
          .replace(/&Ccedil;/g, 'Ç')
          .trim();
        
        if (texto && texto.length > 10) {
          objetos.push(texto);
        }
      }

      const datas: string[] = [];
      while ((match = regexData.exec(html)) !== null) {
        datas.push(match[1]);
      }

      console.log(`📊 Scraping extraiu: ${objetos.length} objetos, ${datas.length} datas`);

      // Combinar objetos com datas (assumindo ordem)
      for (let i = 0; i < Math.min(objetos.length, datas.length); i++) {
        const objeto = objetos[i];
        const dataLimite = datas[i];
        
        // Determinar modalidade baseado no texto
        let modalidade = 'Pregão Eletrônico';
        if (objeto.toLowerCase().includes('concorrência')) {
          modalidade = 'Concorrência';
        } else if (objeto.toLowerCase().includes('tomada de preço')) {
          modalidade = 'Tomada de Preços';
        } else if (objeto.toLowerCase().includes('dispensa')) {
          modalidade = 'Dispensa de Licitação';
        }

        // Criar entrada da licitação
        licitacoes.push({
          titulo: objeto.substring(0, 150),
          objeto: objeto,
          numeroProcesso: `PR-2024-${String(i + 1).padStart(4, '0')}`,
          orgao: this.extrairOrgaoDoTexto(objeto),
          modalidade,
          dataAbertura: new Date().toISOString(),
          dataLimite: this.converterDataBR(dataLimite),
          situacao: 'Aberta',
          link: `${this.BASE_URL}/pte/purchases/tenders/pesquisar-param`,
        });
      }

      // Limitar a 20 para não sobrecarregar
      return licitacoes.slice(0, 20);
    } catch (error: any) {
      console.error('Erro ao extrair dados do HTML:', error.message);
      return [];
    }
  }

  /**
   * Extrai nome do órgão do texto do objeto
   */
  private static extrairOrgaoDoTexto(texto: string): string {
    // Procurar por nomes comuns de órgãos
    const orgaos = [
      { regex: /pol[ií]cia militar/i, nome: 'Polícia Militar do Paraná' },
      { regex: /secretaria.*educa[çc][ãa]o/i, nome: 'Secretaria de Educação do PR' },
      { regex: /secretaria.*sa[úu]de/i, nome: 'Secretaria de Saúde do PR' },
      { regex: /universidade/i, nome: 'Universidades Estaduais do PR' },
      { regex: /hospital/i, nome: 'Hospital Público do PR' },
      { regex: /tribunal/i, nome: 'Tribunal do PR' },
      { regex: /instituto/i, nome: 'Instituto do PR' },
    ];

    for (const orgao of orgaos) {
      if (orgao.regex.test(texto)) {
        return orgao.nome;
      }
    }

    return 'Governo do Estado do Paraná';
  }

  /**
   * Converte data BR (DD/MM/YYYY HH:MM) para ISO
   */
  private static converterDataBR(dataBR: string): string {
    try {
      const [dataParte, horaParte] = dataBR.split(' ');
      const [dia, mes, ano] = dataParte.split('/');
      return new Date(`${ano}-${mes}-${dia}T${horaParte || '00:00'}:00`).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * Converte licitação do Paraná para formato do PNCP
   */
  static converterParaFormatoPNCP(licitacaoPR: LicitacaoParana): any {
    return {
      numeroControlePNCP: licitacaoPR.numeroProcesso,
      anoCompra: 2024,
      sequencialCompra: parseInt(licitacaoPR.numeroProcesso.split('-').pop() || '1'),
      orgaoEntidade: {
        cnpj: '76416940000171',
        razaoSocial: licitacaoPR.orgao,
        poderId: 'E',
        esferaId: 'E',
      },
      unidadeOrgao: {
        cnpj: '76416940000171',
        nomeUnidade: licitacaoPR.orgao,
      },
      modalidadeId: 1,
      modalidadeNome: licitacaoPR.modalidade,
      objetoCompra: licitacaoPR.objeto,
      valorTotalEstimado: licitacaoPR.valor || 0,
      situacaoCompra: licitacaoPR.situacao,
      dataAberturaProposta: licitacaoPR.dataAbertura,
      dataEncerramentoProposta: licitacaoPR.dataLimite || '',
      linkSistemaOrigem: licitacaoPR.link,
      uf: 'PR',
      municipio: 'Curitiba',
    };
  }
}



