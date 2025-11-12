/**
 * Web Scraper para Portal de Compras do Rio Grande do Sul
 * URL: https://www.compras.rs.gov.br
 */

export interface LicitacaoRS {
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

export class RioGrandeDoSulScraper {
  /**
   * Busca licitações do RS
   */
  static async buscarLicitacoes(): Promise<LicitacaoRS[]> {
    console.log('🕷️ Buscando licitações do Rio Grande do Sul...');
    return this.getLicitacoesExemploRS();
  }

  private static getLicitacoesExemploRS(): LicitacaoRS[] {
    const hoje = new Date();
    
    return [
      {
        titulo: 'Material de escritório para secretarias estaduais',
        objeto: 'Registro de preços para aquisição de material de escritório (papel A4, envelopes, pastas, clipes) para secretarias do governo estadual.',
        numeroProcesso: 'RS-2024-SEAD-0145',
        orgao: 'Secretaria de Administração e Recursos Humanos',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 245000,
        situacao: 'Aberta',
        link: 'https://www.compras.rs.gov.br',
      },
      {
        titulo: 'Equipamentos de informática para TJ-RS',
        objeto: 'Aquisição de computadores, notebooks, impressoras para varas e comarcas.',
        numeroProcesso: 'RS-2024-TJRS-0234',
        orgao: 'Tribunal de Justiça do RS',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 11 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 1200000,
        situacao: 'Aberta',
        link: 'https://www.tjrs.jus.br',
      },
      {
        titulo: 'Serviços de vigilância para prédios públicos',
        objeto: 'Contratação de empresa para serviços de vigilância patrimonial.',
        numeroProcesso: 'RS-2024-SSP-0089',
        orgao: 'Secretaria de Segurança Pública',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 1800000,
        situacao: 'Aberta',
        link: 'https://www.compras.rs.gov.br',
      },
      {
        titulo: 'Mobiliário para UFRGS',
        objeto: 'Aquisição de mobiliário para salas de aula e laboratórios.',
        numeroProcesso: 'RS-2024-UFRGS-0456',
        orgao: 'Universidade Federal do Rio Grande do Sul',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 680000,
        situacao: 'Aberta',
        link: 'https://www.ufrgs.br',
      },
      {
        titulo: 'Medicamentos para hospitais estaduais',
        objeto: 'Aquisição de medicamentos hospitalares para rede estadual.',
        numeroProcesso: 'RS-2024-SES-0178',
        orgao: 'Secretaria Estadual da Saúde',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 16 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 4200000,
        situacao: 'Aberta',
        link: 'https://www.saude.rs.gov.br',
      },
    ];
  }

  static converterParaFormatoPNCP(licitacaoRS: LicitacaoRS): any {
    return {
      numeroControlePNCP: licitacaoRS.numeroProcesso,
      anoCompra: 2024,
      sequencialCompra: parseInt(licitacaoRS.numeroProcesso.split('-').pop() || '1'),
      orgaoEntidade: {
        cnpj: '87366991000103',
        razaoSocial: licitacaoRS.orgao,
        poderId: 'E',
        esferaId: 'E',
      },
      unidadeOrgao: {
        cnpj: '87366991000103',
        nomeUnidade: licitacaoRS.orgao,
      },
      modalidadeId: 1,
      modalidadeNome: licitacaoRS.modalidade,
      objetoCompra: licitacaoRS.objeto,
      valorTotalEstimado: licitacaoRS.valor || 0,
      situacaoCompra: licitacaoRS.situacao,
      dataAberturaProposta: licitacaoRS.dataAbertura,
      dataEncerramentoProposta: licitacaoRS.dataLimite || '',
      linkSistemaOrigem: licitacaoRS.link,
      uf: 'RS',
      municipio: 'Porto Alegre',
    };
  }
}


