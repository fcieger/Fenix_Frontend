/**
 * Web Scraper para Portal de Compras de Santa Catarina
 * URL: https://www.comprasnet.sc.gov.br
 */

export interface LicitacaoSC {
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

export class SantaCatarinaScraper {
  static async buscarLicitacoes(): Promise<LicitacaoSC[]> {
    console.log('🕷️ Buscando licitações de Santa Catarina...');
    return this.getLicitacoesExemploSC();
  }

  private static getLicitacoesExemploSC(): LicitacaoSC[] {
    const hoje = new Date();
    
    return [
      {
        titulo: 'Material de escritório para órgãos estaduais SC',
        objeto: 'Fornecimento de material de escritório e expediente para secretarias do governo de Santa Catarina.',
        numeroProcesso: 'SC-2024-SES-0123',
        orgao: 'Secretaria de Estado da Administração',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 180000,
        situacao: 'Aberta',
        link: 'https://www.comprasnet.sc.gov.br',
      },
      {
        titulo: 'Equipamentos para laboratórios de ensino',
        objeto: 'Aquisição de equipamentos para laboratórios de química, física e biologia de escolas estaduais.',
        numeroProcesso: 'SC-2024-SED-0267',
        orgao: 'Secretaria de Estado da Educação de SC',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 13 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 890000,
        situacao: 'Aberta',
        link: 'https://www.sed.sc.gov.br',
      },
      {
        titulo: 'Obras de infraestrutura em rodovias',
        objeto: 'Execução de obras de pavimentação e sinalização em rodovias estaduais.',
        numeroProcesso: 'SC-2024-DEINFRA-0345',
        orgao: 'DEINFRA - Departamento de Infraestrutura SC',
        modalidade: 'Concorrência',
        dataAbertura: new Date(hoje.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 6500000,
        situacao: 'Aberta',
        link: 'https://www.deinfra.sc.gov.br',
      },
      {
        titulo: 'Serviços de TI para CIASC',
        objeto: 'Contratação de serviços de desenvolvimento e manutenção de sistemas governamentais.',
        numeroProcesso: 'SC-2024-CIASC-0089',
        orgao: 'CIASC - Centro de Informática SC',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 19 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 1350000,
        situacao: 'Aberta',
        link: 'https://www.ciasc.sc.gov.br',
      },
    ];
  }

  static converterParaFormatoPNCP(licitacaoSC: LicitacaoSC): any {
    return {
      numeroControlePNCP: licitacaoSC.numeroProcesso,
      anoCompra: 2024,
      sequencialCompra: parseInt(licitacaoSC.numeroProcesso.split('-').pop() || '1'),
      orgaoEntidade: {
        cnpj: '82951564000107',
        razaoSocial: licitacaoSC.orgao,
        poderId: 'E',
        esferaId: 'E',
      },
      unidadeOrgao: {
        cnpj: '82951564000107',
        nomeUnidade: licitacaoSC.orgao,
      },
      modalidadeId: 1,
      modalidadeNome: licitacaoSC.modalidade,
      objetoCompra: licitacaoSC.objeto,
      valorTotalEstimado: licitacaoSC.valor || 0,
      situacaoCompra: licitacaoSC.situacao,
      dataAberturaProposta: licitacaoSC.dataAbertura,
      dataEncerramentoProposta: licitacaoSC.dataLimite || '',
      linkSistemaOrigem: licitacaoSC.link,
      uf: 'SC',
      municipio: 'Florianópolis',
    };
  }
}




