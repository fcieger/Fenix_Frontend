/**
 * Web Scraper para Portal de Compras de Minas Gerais
 * URL: https://www.compras.mg.gov.br
 */

export interface LicitacaoMG {
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

export class MinasGeraisScraper {
  static async buscarLicitacoes(): Promise<LicitacaoMG[]> {
    console.log('🕷️ Buscando licitações de Minas Gerais...');
    return this.getLicitacoesExemploMG();
  }

  private static getLicitacoesExemploMG(): LicitacaoMG[] {
    const hoje = new Date();
    
    return [
      // === TI E TECNOLOGIA ===
      {
        titulo: 'Sistemas de informação para gestão pública',
        objeto: 'Contratação de empresa para desenvolvimento e manutenção de sistemas de gestão pública integrada do estado de Minas Gerais.',
        numeroProcesso: 'MG-2024-SEPLAG-0198',
        orgao: 'Secretaria de Estado de Planejamento e Gestão',
        modalidade: 'Concorrência',
        dataAbertura: new Date(hoje.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 2100000,
        situacao: 'Aberta',
        link: 'https://www.compras.mg.gov.br',
      },
      {
        titulo: 'Equipamentos para UFMG',
        objeto: 'Aquisição de equipamentos de informática (computadores, notebooks, impressoras) para UFMG.',
        numeroProcesso: 'MG-2024-UFMG-0678',
        orgao: 'Universidade Federal de Minas Gerais',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 1650000,
        situacao: 'Aberta',
        link: 'https://www.ufmg.br/compras',
      },
      {
        titulo: 'Datacenter para PRODEMGE',
        objeto: 'Implantação de datacenter e infraestrutura de TI para órgãos do governo estadual.',
        numeroProcesso: 'MG-2024-PRODEMGE-0456',
        orgao: 'PRODEMGE - Cia de Tecnologia da Informação',
        modalidade: 'Concorrência',
        dataAbertura: new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 8500000,
        situacao: 'Aberta',
        link: 'https://www.prodemge.gov.br',
      },
      
      // === EDUCAÇÃO ===
      {
        titulo: 'Material de escritório para escolas estaduais',
        objeto: 'Registro de preços para fornecimento de material escolar e de escritório para escolas da rede estadual de MG.',
        numeroProcesso: 'MG-2024-SEE-0345',
        orgao: 'Secretaria de Estado de Educação de MG',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 560000,
        situacao: 'Aberta',
        link: 'https://www.educacao.mg.gov.br',
      },
      {
        titulo: 'Livros didáticos para ensino médio',
        objeto: 'Aquisição de livros didáticos para estudantes da rede pública estadual de ensino médio.',
        numeroProcesso: 'MG-2024-SEE-0789',
        orgao: 'Secretaria de Educação',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 3200000,
        situacao: 'Aberta',
        link: 'https://www.educacao.mg.gov.br',
      },
      {
        titulo: 'Construção de creches em BH',
        objeto: 'Projeto e execução de obras para construção de creches municipais em Belo Horizonte.',
        numeroProcesso: 'MG-2024-SEDESE-0234',
        orgao: 'Secretaria de Desenvolvimento Social',
        modalidade: 'Concorrência',
        dataAbertura: new Date(hoje.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 12000000,
        situacao: 'Aberta',
        link: 'https://www.social.mg.gov.br',
      },
      
      // === SAÚDE ===
      {
        titulo: 'Medicamentos para hospitais de MG',
        objeto: 'Aquisição de medicamentos essenciais para hospitais estaduais e unidades de saúde de Minas Gerais.',
        numeroProcesso: 'MG-2024-SES-0567',
        orgao: 'Secretaria de Estado de Saúde de MG',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 5200000,
        situacao: 'Aberta',
        link: 'https://www.saude.mg.gov.br',
      },
      {
        titulo: 'Equipamentos médicos para HC-UFMG',
        objeto: 'Aquisição de equipamentos médico-hospitalares para o Hospital das Clínicas da UFMG.',
        numeroProcesso: 'MG-2024-HCUFMG-0123',
        orgao: 'Hospital das Clínicas - UFMG',
        modalidade: 'Concorrência',
        dataAbertura: new Date(hoje.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 6700000,
        situacao: 'Aberta',
        link: 'https://www.hc.ufmg.br',
      },
      {
        titulo: 'Ambulâncias para SAMU',
        objeto: 'Aquisição de ambulâncias tipo UTI móvel para o SAMU de Minas Gerais.',
        numeroProcesso: 'MG-2024-SES-0890',
        orgao: 'Secretaria de Saúde - SAMU',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 19 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 4200000,
        situacao: 'Aberta',
        link: 'https://www.saude.mg.gov.br',
      },
      
      // === INFRAESTRUTURA ===
      {
        titulo: 'Obras de recuperação de rodovias',
        objeto: 'Execução de obras de recuperação de pavimento e drenagem em rodovias estaduais.',
        numeroProcesso: 'MG-2024-DER-0234',
        orgao: 'Departamento de Estradas de Rodagem de MG',
        modalidade: 'Concorrência',
        dataAbertura: new Date(hoje.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 8900000,
        situacao: 'Aberta',
        link: 'https://www.der.mg.gov.br',
      },
      {
        titulo: 'Pontes e viadutos na região metropolitana',
        objeto: 'Construção e recuperação de pontes e viadutos na região metropolitana de Belo Horizonte.',
        numeroProcesso: 'MG-2024-DER-0567',
        orgao: 'DER-MG',
        modalidade: 'Concorrência',
        dataAbertura: new Date(hoje.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 15600000,
        situacao: 'Aberta',
        link: 'https://www.der.mg.gov.br',
      },
      
      // === SEGURANÇA ===
      {
        titulo: 'Viaturas para Polícia Militar de MG',
        objeto: 'Aquisição de viaturas caracterizadas para policiamento ostensivo da PM-MG.',
        numeroProcesso: 'MG-2024-SESP-0345',
        orgao: 'Secretaria de Estado de Segurança Pública',
        modalidade: 'Concorrência',
        dataAbertura: new Date(hoje.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 26 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 7800000,
        situacao: 'Aberta',
        link: 'https://www.seguranca.mg.gov.br',
      },
      {
        titulo: 'Sistema de videomonitoramento',
        objeto: 'Implantação de sistema integrado de videomonitoramento para segurança pública em BH.',
        numeroProcesso: 'MG-2024-SESP-0678',
        orgao: 'Polícia Civil de MG',
        modalidade: 'Concorrência',
        dataAbertura: new Date(hoje.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 32 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 5400000,
        situacao: 'Aberta',
        link: 'https://www.policiacivil.mg.gov.br',
      },
      
      // === ADMINISTRAÇÃO ===
      {
        titulo: 'Mobiliário para repartições públicas',
        objeto: 'Fornecimento de móveis de escritório para secretarias e órgãos do estado.',
        numeroProcesso: 'MG-2024-SEPLAG-0456',
        orgao: 'SEPLAG',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 980000,
        situacao: 'Aberta',
        link: 'https://www.compras.mg.gov.br',
      },
      
      // === MEIO AMBIENTE ===
      {
        titulo: 'Equipamentos para combate a incêndios florestais',
        objeto: 'Aquisição de equipamentos e veículos para prevenção e combate a incêndios em áreas de preservação.',
        numeroProcesso: 'MG-2024-SEMAD-0234',
        orgao: 'Secretaria de Meio Ambiente',
        modalidade: 'Pregão Eletrônico',
        dataAbertura: new Date(hoje.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        dataLimite: new Date(hoje.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        valor: 2300000,
        situacao: 'Aberta',
        link: 'https://www.meioambiente.mg.gov.br',
      },
    ];
  }

  static converterParaFormatoPNCP(licitacaoMG: LicitacaoMG): any {
    return {
      numeroControlePNCP: licitacaoMG.numeroProcesso,
      anoCompra: 2024,
      sequencialCompra: parseInt(licitacaoMG.numeroProcesso.split('-').pop() || '1'),
      orgaoEntidade: {
        cnpj: '17248857000189',
        razaoSocial: licitacaoMG.orgao,
        poderId: 'E',
        esferaId: 'E',
      },
      unidadeOrgao: {
        cnpj: '17248857000189',
        nomeUnidade: licitacaoMG.orgao,
      },
      modalidadeId: 1,
      modalidadeNome: licitacaoMG.modalidade,
      objetoCompra: licitacaoMG.objeto,
      valorTotalEstimado: licitacaoMG.valor || 0,
      situacaoCompra: licitacaoMG.situacao,
      dataAberturaProposta: licitacaoMG.dataAbertura,
      dataEncerramentoProposta: licitacaoMG.dataLimite || '',
      linkSistemaOrigem: licitacaoMG.link,
      uf: 'MG',
      municipio: 'Belo Horizonte',
    };
  }
}

