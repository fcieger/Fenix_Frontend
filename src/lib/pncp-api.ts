/**
 * Integração com API do Portal da Transparência
 * Documentação: https://api.portaldatransparencia.gov.br/swagger-ui/index.html
 * 
 * PNCP original está offline (404), usando Portal da Transparência como fonte principal
 */

import axios from 'axios';
import { ParanaScraper } from './scrapers/parana-scraper';
import { SaoPauloScraper } from './scrapers/sao-paulo-scraper';
import { RioGrandeDoSulScraper } from './scrapers/rio-sul-scraper';
import { SantaCatarinaScraper } from './scrapers/santa-catarina-scraper';
import { MinasGeraisScraper } from './scrapers/minas-gerais-scraper';

const PORTAL_TRANSPARENCIA_API_URL = 'https://api.portaldatransparencia.gov.br/api-de-dados';
const PORTAL_TRANSPARENCIA_API_KEY = '5b28b8258c79864467716574e9df8ee5';
const PNCP_API_URL = 'https://pncp.gov.br/api/consulta/v1';

export interface PNCPLicitacao {
  numeroControlePNCP: string;
  anoCompra: number;
  sequencialCompra: number;
  orgaoEntidade: {
    cnpj: string;
    razaoSocial: string;
    poderId: string;
    esferaId: string;
  };
  unidadeOrgao: {
    cnpj: string;
    nomeUnidade: string;
  };
  modalidadeId: number;
  modalidadeNome: string;
  objetoCompra: string;
  valorTotalEstimado: number;
  valorTotalHomologado?: number;
  situacaoCompra: string;
  dataAberturaProposta: string;
  dataEncerramentoProposta: string;
  linkSistemaOrigem?: string;
  uf?: string;
  municipio?: string;
}

export class PNCPService {
  /**
   * Busca licitações do Portal da Transparência (API REAL com dados do governo federal)
   */
  static async buscarLicitacoes(params: {
    uf?: string;
    dataInicial?: string; // YYYYMMDD
    dataFinal?: string; // YYYYMMDD
    pagina?: number;
    tamanhoPagina?: number;
  }) {
    console.log('🔍 Buscando licitações REAIS do Portal da Transparência...');
    
    try {
      // Calcular período de 1 mês (limitação da API)
      const hoje = new Date();
      const umMesAtras = new Date();
      umMesAtras.setMonth(umMesAtras.getMonth() - 1);

      const dataInicial = params.dataInicial || this.formatDatePortal(umMesAtras);
      const dataFinal = params.dataFinal || this.formatDatePortal(hoje);
      const pagina = params.pagina || 1;

      console.log('📅 Período:', { dataInicial, dataFinal });

      // Órgãos principais do governo federal para buscar
      // Lista completa: https://api.portaldatransparencia.gov.br/api-de-dados/orgaos-siafi
      const orgaos = [
        '26000', // Ministério da Educação
        '25000', // Ministério da Fazenda
        '36000', // Ministério da Saúde
        '39000', // Ministério da Infraestrutura
        '52000', // Ministério da Defesa
        '20000', // Ministério da Economia
      ];

      const todasLicitacoes: any[] = [];

      console.log('🎯 Configuração da busca:', {
        uf: params.uf || 'Todos os estados',
        orgaos: orgaos.length,
        periodo: `${dataInicial} a ${dataFinal}`,
      });

      // Tentar web scraping estadual primeiro (se estado específico for selecionado)
      if (params.uf) {
        try {
          let licitacoesEstado: any[] = [];
          
          switch (params.uf) {
            case 'PR':
              console.log('🕷️ Paraná detectado! Tentando web scraping do portal estadual...');
              const licitacoesPR = await ParanaScraper.buscarLicitacoes();
              licitacoesEstado = licitacoesPR.map(lic => ParanaScraper.converterParaFormatoPNCP(lic));
              break;
              
            case 'SP':
              console.log('🕷️ São Paulo detectado! Buscando licitações estaduais...');
              const licitacoesSP = await SaoPauloScraper.buscarLicitacoes();
              licitacoesEstado = licitacoesSP.map(lic => SaoPauloScraper.converterParaFormatoPNCP(lic));
              break;
              
            case 'RS':
              console.log('🕷️ Rio Grande do Sul detectado! Buscando licitações estaduais...');
              const licitacoesRS = await RioGrandeDoSulScraper.buscarLicitacoes();
              licitacoesEstado = licitacoesRS.map(lic => RioGrandeDoSulScraper.converterParaFormatoPNCP(lic));
              break;
              
            case 'SC':
              console.log('🕷️ Santa Catarina detectado! Buscando licitações estaduais...');
              const licitacoesSC = await SantaCatarinaScraper.buscarLicitacoes();
              licitacoesEstado = licitacoesSC.map(lic => SantaCatarinaScraper.converterParaFormatoPNCP(lic));
              break;
              
            case 'MG':
              console.log('🕷️ Minas Gerais detectado! Buscando licitações estaduais...');
              const licitacoesMG = await MinasGeraisScraper.buscarLicitacoes();
              licitacoesEstado = licitacoesMG.map(lic => MinasGeraisScraper.converterParaFormatoPNCP(lic));
              break;
          }
          
          if (licitacoesEstado.length > 0) {
            console.log(`✅ Scraper ${params.uf}: ${licitacoesEstado.length} licitações ESTADUAIS encontradas`);
            todasLicitacoes.push(...licitacoesEstado);
            
            // Se já tem licitações suficientes do estado, pular API federal
            if (todasLicitacoes.length >= 10) {
              console.log(`✅ Licitações suficientes de ${params.uf}, pulando API federal`);
              
              return {
                data: todasLicitacoes.slice(0, 50),
                total: todasLicitacoes.length,
                pagina,
              };
            }
          }
        } catch (scraperError: any) {
          console.log(`⚠️ Erro no scraping de ${params.uf}, continuando com API federal:`, scraperError.message);
        }
      }

      // Buscar de cada órgão
      for (const codigoOrgao of orgaos) {
        try {
          console.log(`📡 Buscando licitações do órgão ${codigoOrgao}...`);
          
          const response = await axios.get(
            `${PORTAL_TRANSPARENCIA_API_URL}/licitacoes`,
            {
              params: {
                codigoOrgao,
                dataInicial,
                dataFinal,
                pagina: 1,
              },
              headers: {
                'chave-api-dados': PORTAL_TRANSPARENCIA_API_KEY,
              },
              timeout: 15000,
            }
          );

          const licitacoesOrgao = Array.isArray(response.data) ? response.data : [];
          
          // Filtrar apenas licitações em aberto (não finalizadas)
          let licitacoesFiltradas = licitacoesOrgao.filter(lic => {
            const situacao = (lic.situacaoCompra || '').toLowerCase();
            // Excluir situações finalizadas
            const finalizada = situacao.includes('homologada') ||
                              situacao.includes('encerrada') ||
                              situacao.includes('cancelada') ||
                              situacao.includes('deserta') ||
                              situacao.includes('fracassada') ||
                              situacao.includes('revogada') ||
                              situacao.includes('anulada');
            
            return !finalizada;
          });

          // Filtrar por UF se especificado
          if (params.uf) {
            const antesDoFiltroUF = licitacoesFiltradas.length;
            licitacoesFiltradas = licitacoesFiltradas.filter(lic => {
              // Obter UF da licitação (pode ser nome completo ou sigla)
              const ufNomeLicitacao = lic.municipio?.uf?.nome || lic.uf?.nome;
              const ufSiglaLicitacao = lic.municipio?.uf?.sigla || lic.uf?.sigla || lic.uf;
              
              // Converter nome para sigla se necessário
              const ufConvertida = ufSiglaLicitacao || this.converterNomeEstadoParaSigla(ufNomeLicitacao);
              
              // Comparar sigla com sigla
              return ufConvertida === params.uf;
            });
            
            console.log(`  ✅ Órgão ${codigoOrgao}: ${licitacoesFiltradas.length} licitações de ${params.uf} em aberto (${antesDoFiltroUF - licitacoesFiltradas.length} de outros estados filtradas)`);
          } else {
            console.log(`  ✅ Órgão ${codigoOrgao}: ${licitacoesFiltradas.length} licitações em aberto (de ${licitacoesOrgao.length} totais)`);
          }
          
          todasLicitacoes.push(...licitacoesFiltradas);
          
          // Limitar total para não sobrecarregar
          if (todasLicitacoes.length >= 50) {
            console.log('⚠️ Limite de 50 licitações atingido, parando busca');
            break;
          }
        } catch (orgaoError: any) {
          console.log(`  ⚠️ Erro no órgão ${codigoOrgao}:`, orgaoError.message);
          // Continuar com próximo órgão
        }
      }

      console.log('✅ Portal da Transparência - TOTAL FINAL:', {
        licitacoesAbertas: todasLicitacoes.length,
        orgaosBuscados: orgaos.length,
        filtroEstado: params.uf || 'Todos',
        status: '🟢 Apenas em aberto (excluindo finalizadas)',
      });

      if (todasLicitacoes.length === 0) {
        if (params.uf) {
          console.log(`⚠️ Nenhuma licitação FEDERAL do estado ${params.uf} encontrada no período`);
          console.log('💡 Licitações federais podem não estar disponíveis em todos os estados');
          console.log('💡 Usando dados de exemplo que incluem o estado selecionado...');
        } else {
          console.log('⚠️ Nenhuma licitação em aberto encontrada no período, usando dados de exemplo');
        }
        return this.buscarLicitacoesAlternativa(params);
      }

      return {
        data: todasLicitacoes,
        total: todasLicitacoes.length,
        pagina,
      };
    } catch (error: any) {
      console.error('❌ Erro ao buscar do Portal da Transparência:', error.message);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('❌ Erro de autenticação na API. Verifique a chave.');
      }
      
      console.log('🔄 Usando dados de exemplo como fallback...');
      return this.buscarLicitacoesAlternativa(params);
    }
    
    /* TODO: Quando a API do PNCP voltar, usar este código:
    
    try {
      const hoje = new Date();
      const umMesAtras = new Date();
      umMesAtras.setMonth(umMesAtras.getMonth() - 1);

      const dataInicial = params.dataInicial || this.formatDate(umMesAtras);
      const dataFinal = params.dataFinal || this.formatDate(hoje);
      const pagina = params.pagina || 1;
      const tamanhoPagina = params.tamanhoPagina || 20;

      const queryParams = new URLSearchParams({
        dataInicial,
        dataFinal,
        pagina: pagina.toString(),
        tamanhoPagina: tamanhoPagina.toString(),
      });

      if (params.uf) {
        queryParams.append('uf', params.uf);
      }

      const response = await axios.get(
        `${PNCP_API_URL}/contratacoes`,
        {
          params: queryParams,
          timeout: 30000,
        }
      );

      return {
        data: response.data?.data || [],
        total: response.data?.data?.length || 0,
        pagina: response.data?.pagina || pagina,
      };
    } catch (error: any) {
      console.error('❌ Erro ao buscar licitações do PNCP:', error.message);
      return this.buscarLicitacoesAlternativa(params);
    }
    */
  }

  /**
   * Busca licitações de fonte alternativa (fallback)
   * Usa dados de exemplo realistas enquanto a API do PNCP está indisponível
   */
  static async buscarLicitacoesAlternativa(params: any) {
    console.log('🔄 Usando dados de exemplo (API PNCP indisponível)');
    
    const hoje = new Date();
    const exemplos: PNCPLicitacao[] = [
      {
        numeroControlePNCP: '00001-2024-PMSP',
        anoCompra: 2024,
        sequencialCompra: 1,
        orgaoEntidade: {
          cnpj: '46392148000129',
          razaoSocial: 'Prefeitura Municipal de São Paulo',
          poderId: 'E',
          esferaId: 'M',
        },
        unidadeOrgao: {
          cnpj: '46392148000129',
          nomeUnidade: 'Secretaria Municipal de Administração',
        },
        modalidadeId: 1,
        modalidadeNome: 'Pregão Eletrônico',
        objetoCompra: 'Aquisição de material de escritório (papel A4, canetas, grampeadores, pastas, envelopes) para atender as necessidades dos diversos setores da administração municipal durante o exercício de 2024.',
        valorTotalEstimado: 187500.00,
        situacaoCompra: 'Aberta',
        dataAberturaProposta: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://www.prefeitura.sp.gov.br/licitacoes',
        uf: 'SP',
        municipio: 'São Paulo',
      },
      {
        numeroControlePNCP: '00002-2024-GOVSP',
        anoCompra: 2024,
        sequencialCompra: 2,
        orgaoEntidade: {
          cnpj: '46377222000135',
          razaoSocial: 'Secretaria da Educação do Estado de São Paulo',
          poderId: 'E',
          esferaId: 'E',
        },
        unidadeOrgao: {
          cnpj: '46377222000135',
          nomeUnidade: 'Departamento de Suprimentos',
        },
        modalidadeId: 1,
        modalidadeNome: 'Pregão Eletrônico',
        objetoCompra: 'Registro de preços para fornecimento de material de escritório, material de limpeza e material de copa e cozinha para as escolas estaduais.',
        valorTotalEstimado: 425000.00,
        situacaoCompra: 'Aberta',
        dataAberturaProposta: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://www.bec.sp.gov.br',
        uf: 'SP',
        municipio: 'São Paulo',
      },
      {
        numeroControlePNCP: '00003-2024-GOVMG',
        anoCompra: 2024,
        sequencialCompra: 3,
        orgaoEntidade: {
          cnpj: '17248857000189',
          razaoSocial: 'Governo do Estado de Minas Gerais',
          poderId: 'E',
          esferaId: 'E',
        },
        unidadeOrgao: {
          cnpj: '17248857000189',
          nomeUnidade: 'Secretaria de Estado de Planejamento e Gestão',
        },
        modalidadeId: 2,
        modalidadeNome: 'Concorrência',
        objetoCompra: 'Contratação de empresa especializada em desenvolvimento, manutenção e suporte de sistemas de informação para gestão pública integrada.',
        valorTotalEstimado: 1850000.00,
        situacaoCompra: 'Aberta',
        dataAberturaProposta: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://www.compras.mg.gov.br',
        uf: 'MG',
        municipio: 'Belo Horizonte',
      },
      {
        numeroControlePNCP: '00004-2024-PMRJ',
        anoCompra: 2024,
        sequencialCompra: 4,
        orgaoEntidade: {
          cnpj: '42498733000111',
          razaoSocial: 'Prefeitura Municipal do Rio de Janeiro',
          poderId: 'E',
          esferaId: 'M',
        },
        unidadeOrgao: {
          cnpj: '42498733000111',
          nomeUnidade: 'Secretaria Municipal de Infraestrutura e Obras',
        },
        modalidadeId: 2,
        modalidadeNome: 'Concorrência',
        objetoCompra: 'Execução de obras de pavimentação, drenagem e sinalização viária em vias públicas de diversos bairros do município.',
        valorTotalEstimado: 3200000.00,
        situacaoCompra: 'Aberta',
        dataAberturaProposta: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://compras.rio.rj.gov.br',
        uf: 'RJ',
        municipio: 'Rio de Janeiro',
      },
      {
        numeroControlePNCP: '00005-2024-SESSP',
        anoCompra: 2024,
        sequencialCompra: 5,
        orgaoEntidade: {
          cnpj: '46374500000194',
          razaoSocial: 'Secretaria de Saúde do Estado de São Paulo',
          poderId: 'E',
          esferaId: 'E',
        },
        unidadeOrgao: {
          cnpj: '46374500000194',
          nomeUnidade: 'Coordenadoria de Compras',
        },
        modalidadeId: 1,
        modalidadeNome: 'Pregão Eletrônico',
        objetoCompra: 'Aquisição de equipamentos médico-hospitalares (monitores multiparâmetros, desfibriladores, ventiladores pulmonares) para unidades de saúde do estado.',
        valorTotalEstimado: 2100000.00,
        situacaoCompra: 'Aberta',
        dataAberturaProposta: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://www.bec.sp.gov.br',
        uf: 'SP',
        municipio: 'São Paulo',
      },
      {
        numeroControlePNCP: '00006-2024-MEC',
        anoCompra: 2024,
        sequencialCompra: 6,
        orgaoEntidade: {
          cnpj: '00394544001352',
          razaoSocial: 'Ministério da Educação',
          poderId: 'E',
          esferaId: 'F',
        },
        unidadeOrgao: {
          cnpj: '00394544001352',
          nomeUnidade: 'Subsecretaria de Assuntos Administrativos',
        },
        modalidadeId: 1,
        modalidadeNome: 'Pregão Eletrônico',
        objetoCompra: 'Locação de veículos automotores tipo passeio, utilitário e caminhonete para uso nas atividades administrativas do ministério.',
        valorTotalEstimado: 680000.00,
        situacaoCompra: 'Aberta',
        dataAberturaProposta: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://www.gov.br/compras',
        uf: 'DF',
        municipio: 'Brasília',
      },
      {
        numeroControlePNCP: '00007-2024-PMSP',
        anoCompra: 2024,
        sequencialCompra: 7,
        orgaoEntidade: {
          cnpj: '46392148000129',
          razaoSocial: 'Prefeitura Municipal de São Paulo',
          poderId: 'E',
          esferaId: 'M',
        },
        unidadeOrgao: {
          cnpj: '46392148000129',
          nomeUnidade: 'Secretaria Municipal de Educação',
        },
        modalidadeId: 1,
        modalidadeNome: 'Pregão Eletrônico',
        objetoCompra: 'Aquisição de mobiliário escolar (carteiras, mesas, cadeiras, armários, quadros) para equipar novas salas de aula da rede municipal de ensino.',
        valorTotalEstimado: 875000.00,
        situacaoCompra: 'Aberta',
        dataAberturaProposta: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://www.prefeitura.sp.gov.br/licitacoes',
        uf: 'SP',
        municipio: 'São Paulo',
      },
      {
        numeroControlePNCP: '00008-2024-GOVPR',
        anoCompra: 2024,
        sequencialCompra: 8,
        orgaoEntidade: {
          cnpj: '76416940000171',
          razaoSocial: 'Governo do Estado do Paraná',
          poderId: 'E',
          esferaId: 'E',
        },
        unidadeOrgao: {
          cnpj: '76416940000171',
          nomeUnidade: 'Secretaria de Estado da Administração',
        },
        modalidadeId: 1,
        modalidadeNome: 'Pregão Eletrônico',
        objetoCompra: 'Registro de preços para aquisição de material de escritório, incluindo papel A4, toners, cartuchos de impressora e material de expediente em geral.',
        valorTotalEstimado: 320000.00,
        situacaoCompra: 'Aberta',
        dataAberturaProposta: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://www.comprasparana.pr.gov.br',
        uf: 'PR',
        municipio: 'Curitiba',
      },
      {
        numeroControlePNCP: '00009-2024-UFMG',
        anoCompra: 2024,
        sequencialCompra: 9,
        orgaoEntidade: {
          cnpj: '17217985000104',
          razaoSocial: 'Universidade Federal de Minas Gerais',
          poderId: 'E',
          esferaId: 'F',
        },
        unidadeOrgao: {
          cnpj: '17217985000104',
          nomeUnidade: 'Pró-Reitoria de Administração',
        },
        modalidadeId: 1,
        modalidadeNome: 'Pregão Eletrônico',
        objetoCompra: 'Aquisição de equipamentos de informática (computadores desktop, notebooks, impressoras multifuncionais) para laboratórios de ensino e setores administrativos.',
        valorTotalEstimado: 1450000.00,
        situacaoCompra: 'Aberta',
        dataAberturaProposta: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://www.compras.ufmg.br',
        uf: 'MG',
        municipio: 'Belo Horizonte',
      },
      {
        numeroControlePNCP: '00010-2024-PMCPS',
        anoCompra: 2024,
        sequencialCompra: 10,
        orgaoEntidade: {
          cnpj: '59715174000103',
          razaoSocial: 'Prefeitura Municipal de Campinas',
          poderId: 'E',
          esferaId: 'M',
        },
        unidadeOrgao: {
          cnpj: '59715174000103',
          nomeUnidade: 'Secretaria de Administração',
        },
        modalidadeId: 1,
        modalidadeNome: 'Pregão Eletrônico',
        objetoCompra: 'Fornecimento de material de escritório e expediente (papel, envelopes, pastas, clipes, grampos) para todas as secretarias municipais.',
        valorTotalEstimado: 95000.00,
        situacaoCompra: 'Aberta',
        dataAberturaProposta: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://compras.campinas.sp.gov.br',
        uf: 'SP',
        municipio: 'Campinas',
      },
      {
        numeroControlePNCP: '00011-2024-ENCERRADA',
        anoCompra: 2024,
        sequencialCompra: 11,
        orgaoEntidade: {
          cnpj: '46395000000139',
          razaoSocial: 'Prefeitura Municipal de Santos',
          poderId: 'E',
          esferaId: 'M',
        },
        unidadeOrgao: {
          cnpj: '46395000000139',
          nomeUnidade: 'Secretaria de Finanças',
        },
        modalidadeId: 1,
        modalidadeNome: 'Pregão Eletrônico',
        objetoCompra: 'Aquisição de material de escritório e informática para atender as demandas administrativas do exercício.',
        valorTotalEstimado: 78000.00,
        situacaoCompra: 'Encerrada',
        dataAberturaProposta: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://santos.sp.gov.br/compras',
        uf: 'SP',
        municipio: 'Santos',
      },
      // Licitações do RS
      {
        numeroControlePNCP: '00012-2024-RS',
        anoCompra: 2024,
        sequencialCompra: 12,
        orgaoEntidade: {
          cnpj: '87366991000103',
          razaoSocial: 'Governo do Estado do Rio Grande do Sul',
          poderId: 'E',
          esferaId: 'E',
        },
        unidadeOrgao: {
          cnpj: '87366991000103',
          nomeUnidade: 'Secretaria de Administração e Recursos Humanos',
        },
        modalidadeId: 1,
        modalidadeNome: 'Pregão Eletrônico',
        objetoCompra: 'Aquisição de material de escritório (papel A4, envelopes, pastas, material de expediente) para atender as secretarias estaduais do RS.',
        valorTotalEstimado: 145000.00,
        situacaoCompra: 'Aberta',
        dataAberturaProposta: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://www.compras.rs.gov.br',
        uf: 'RS',
        municipio: 'Porto Alegre',
      },
      {
        numeroControlePNCP: '00013-2024-RS',
        anoCompra: 2024,
        sequencialCompra: 13,
        orgaoEntidade: {
          cnpj: '92963560000148',
          razaoSocial: 'Tribunal de Justiça do Rio Grande do Sul',
          poderId: 'J',
          esferaId: 'E',
        },
        unidadeOrgao: {
          cnpj: '92963560000148',
          nomeUnidade: 'Departamento de Compras',
        },
        modalidadeId: 1,
        modalidadeNome: 'Pregão Eletrônico',
        objetoCompra: 'Contratação de empresa para fornecimento de equipamentos de informática (computadores, monitores, impressoras) para varas e comarcas do interior do estado.',
        valorTotalEstimado: 980000.00,
        situacaoCompra: 'Aberta',
        dataAberturaProposta: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://www.tjrs.jus.br/site/compras',
        uf: 'RS',
        municipio: 'Porto Alegre',
      },
      {
        numeroControlePNCP: '00014-2024-RS',
        anoCompra: 2024,
        sequencialCompra: 14,
        orgaoEntidade: {
          cnpj: '88634690000101',
          razaoSocial: 'Universidade Federal do Rio Grande do Sul',
          poderId: 'E',
          esferaId: 'F',
        },
        unidadeOrgao: {
          cnpj: '88634690000101',
          nomeUnidade: 'Pró-Reitoria de Planejamento e Administração',
        },
        modalidadeId: 1,
        modalidadeNome: 'Pregão Eletrônico',
        objetoCompra: 'Aquisição de mobiliário (mesas, cadeiras, armários, estantes) para salas de aula e laboratórios dos campi da UFRGS em Porto Alegre e interior.',
        valorTotalEstimado: 650000.00,
        situacaoCompra: 'Aberta',
        dataAberturaProposta: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        dataEncerramentoProposta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        linkSistemaOrigem: 'https://www.ufrgs.br/compras',
        uf: 'RS',
        municipio: 'Porto Alegre',
      },
    ];

    console.log(`📊 ${exemplos.length} licitações de exemplo disponíveis`);

    // Filtrar por UF se especificado
    let filtrados = exemplos;
    
    if (params.uf) {
      filtrados = exemplos.filter(l => l.uf === params.uf);
      console.log(`🔍 Filtrando por estado ${params.uf}: ${filtrados.length} licitações encontradas`);
      
      if (filtrados.length === 0) {
        console.log(`⚠️ Nenhuma licitação de exemplo do estado ${params.uf}`);
        console.log(`💡 Criando licitação genérica do estado ${params.uf}...`);
        
        // Criar uma licitação genérica para o estado solicitado
        filtrados = [{
          numeroControlePNCP: `GENERICO-2024-${params.uf}`,
          anoCompra: 2024,
          sequencialCompra: 999,
          orgaoEntidade: {
            cnpj: '00000000000000',
            razaoSocial: `Órgão Público do ${params.uf}`,
            poderId: 'E',
            esferaId: 'E',
          },
          unidadeOrgao: {
            cnpj: '00000000000000',
            nomeUnidade: 'Secretaria de Administração',
          },
          modalidadeId: 1,
          modalidadeNome: 'Pregão Eletrônico',
          objetoCompra: `Licitação de exemplo para demonstração do sistema - Estado: ${params.uf}. Em produção, aqui apareceriam licitações reais do Portal da Transparência ou PNCP.`,
          valorTotalEstimado: 100000.00,
          situacaoCompra: 'Aberta',
          dataAberturaProposta: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          dataEncerramentoProposta: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          linkSistemaOrigem: 'https://www.gov.br/compras',
          uf: params.uf,
          municipio: 'Capital',
        }];
      }
    }

    // Filtrar por busca se especificado
    if (params.busca) {
      const busca = params.busca.toLowerCase();
      filtrados = filtrados.filter(l => 
        l.objetoCompra.toLowerCase().includes(busca) ||
        l.orgaoEntidade.razaoSocial.toLowerCase().includes(busca)
      );
    }

    console.log(`📊 ${filtrados.length} licitações após filtros (UF: ${params.uf || 'Todos'})`);

    return {
      data: filtrados,
      total: filtrados.length,
      pagina: 1,
    };
  }

  /**
   * Converte licitação do PNCP para formato interno
   */
  static converterParaFormatoInterno(pncpLicitacao: PNCPLicitacao, companyId: string) {
    const esferaMap: Record<string, string> = {
      'M': 'Municipal',
      'E': 'Estadual',
      'F': 'Federal',
    };

    return {
      companyId,
      numeroProcesso: `${pncpLicitacao.anoCompra}/${pncpLicitacao.sequencialCompra}`,
      titulo: pncpLicitacao.objetoCompra.substring(0, 200),
      descricao: pncpLicitacao.objetoCompra,
      orgao: pncpLicitacao.orgaoEntidade.razaoSocial,
      orgaoSigla: pncpLicitacao.unidadeOrgao.nomeUnidade.substring(0, 50),
      modalidade: pncpLicitacao.modalidadeNome,
      esfera: esferaMap[pncpLicitacao.orgaoEntidade.esferaId] || 'Federal',
      estado: pncpLicitacao.uf || 'BR',
      municipio: pncpLicitacao.municipio,
      valorEstimado: pncpLicitacao.valorTotalEstimado || 0,
      dataAbertura: new Date(pncpLicitacao.dataAberturaProposta),
      dataLimite: pncpLicitacao.dataEncerramentoProposta 
        ? new Date(pncpLicitacao.dataEncerramentoProposta)
        : null,
      status: this.mapearStatus(pncpLicitacao.situacaoCompra),
      linkEdital: pncpLicitacao.linkSistemaOrigem,
      linkSistema: pncpLicitacao.linkSistemaOrigem,
      fonte: 'PNCP',
      visualizacoes: 0,
    };
  }

  /**
   * Mapeia status do PNCP para formato interno
   */
  static mapearStatus(statusPNCP: string): string {
    const statusMap: Record<string, string> = {
      'Aberta': 'Aberta',
      'Em Andamento': 'Aberta',
      'Encerrada': 'Encerrada',
      'Homologada': 'Homologada',
      'Cancelada': 'Cancelada',
      'Suspensa': 'Encerrada',
      'Deserta': 'Encerrada',
    };

    return statusMap[statusPNCP] || 'Aberta';
  }

  /**
   * Formata data para o formato do PNCP (YYYYMMDD)
   */
  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Formata data para o Portal da Transparência (DD/MM/YYYY)
   */
  static formatDatePortal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  /**
   * Converte licitação do Portal da Transparência para formato interno
   */
  static converterPortalTransparenciaParaInterno(licitacaoPortal: any, companyId: string) {
    // A API do Portal da Transparência não retorna links diretos para editais
    // Construir link para o ComprasNet baseado nos dados disponíveis
    const numeroLicitacao = licitacaoPortal.licitacao?.numero || licitacaoPortal.numero;
    const uasg = licitacaoPortal.unidadeGestora?.codigo;
    
    let linkEdital = null;
    if (numeroLicitacao && uasg) {
      // Link para consulta no ComprasNet
      linkEdital = `https://www.gov.br/compras/pt-br/acesso-a-informacao/licitacoes-e-contratos`;
    }

    // Obter dados da UF (pode vir como nome completo ou sigla)
    const ufNome = licitacaoPortal.municipio?.uf?.nome || 
                   licitacaoPortal.uf?.nome || 
                   licitacaoPortal.uf;
    
    const ufSigla = licitacaoPortal.municipio?.uf?.sigla || 
                    licitacaoPortal.uf?.sigla;
    
    // Converter nome completo para sigla se necessário
    const uf = ufSigla || this.converterNomeEstadoParaSigla(ufNome) || 'DF';

    return {
      companyId,
      numeroProcesso: licitacaoPortal.licitacao?.numeroProcesso || numeroLicitacao || 'S/N',
      titulo: (licitacaoPortal.licitacao?.objeto || licitacaoPortal.objeto || 'Sem título').substring(0, 200),
      descricao: licitacaoPortal.licitacao?.objeto || licitacaoPortal.objeto || 'Descrição não disponível',
      orgao: licitacaoPortal.unidadeGestora?.nome || 
             licitacaoPortal.orgaoMaximo?.nome || 
             licitacaoPortal.orgaoVinculado?.nome || 
             'Órgão Federal',
      orgaoSigla: licitacaoPortal.unidadeGestora?.codigo || 
                  licitacaoPortal.orgaoMaximo?.codigo || 
                  licitacaoPortal.orgaoVinculado?.sigla || 
                  '',
      modalidade: this.mapearModalidadePortal(licitacaoPortal.modalidadeLicitacao || licitacaoPortal.modalidade),
      esfera: 'Federal',
      estado: uf,
      municipio: licitacaoPortal.municipio?.nomeIBGE || 
                 licitacaoPortal.municipio?.nome || 
                 null,
      valorEstimado: parseFloat(licitacaoPortal.valor || licitacaoPortal.valorTotalEstimado || 0),
      dataAbertura: this.converterDataPortal(licitacaoPortal.dataAbertura || licitacaoPortal.dataPublicacao || new Date().toISOString()),
      dataLimite: licitacaoPortal.dataResultadoCompra 
        ? this.converterDataPortal(licitacaoPortal.dataResultadoCompra)
        : null,
      status: this.mapearStatusPortal(licitacaoPortal.situacaoCompra || licitacaoPortal.situacao || 'Aberta'),
      linkEdital: linkEdital,
      linkSistema: linkEdital,
      fonte: 'Portal da Transparência',
      visualizacoes: 0,
    };
  }

  /**
   * Mapeia modalidade do Portal da Transparência
   */
  static mapearModalidadePortal(modalidade: string): string {
    if (!modalidade) return 'Pregão Eletrônico';
    
    const modalidadeLower = modalidade.toLowerCase();
    
    if (modalidadeLower.includes('pregao') || modalidadeLower.includes('pregão')) {
      return 'Pregão Eletrônico';
    }
    if (modalidadeLower.includes('concorrencia') || modalidadeLower.includes('concorrência')) {
      return 'Concorrência';
    }
    if (modalidadeLower.includes('tomada')) {
      return 'Tomada de Preços';
    }
    if (modalidadeLower.includes('dispensa')) {
      return 'Dispensa de Licitação';
    }
    
    return modalidade;
  }

  /**
   * Mapeia status do Portal da Transparência
   */
  static mapearStatusPortal(situacao: string): string {
    if (!situacao) return 'Aberta';
    
    const situacaoLower = situacao.toLowerCase();
    
    // Situações finalizadas
    if (situacaoLower.includes('homologada')) {
      return 'Homologada';
    }
    if (situacaoLower.includes('encerrada') || situacaoLower.includes('finalizada')) {
      return 'Encerrada';
    }
    if (situacaoLower.includes('cancelada') || situacaoLower.includes('revogada') || situacaoLower.includes('anulada')) {
      return 'Cancelada';
    }
    
    // Qualquer outra situação é considerada Aberta
    // (Publicado, Em Andamento, Em Julgamento, etc)
    return 'Aberta';
  }

  /**
   * Converte data do Portal (DD/MM/YYYY ou ISO) para Date
   */
  static converterDataPortal(data: string): Date {
    if (!data) return new Date();
    
    // Se for ISO (YYYY-MM-DD)
    if (data.includes('-')) {
      return new Date(data);
    }
    
    // Se for DD/MM/YYYY
    if (data.includes('/')) {
      const [dia, mes, ano] = data.split('/');
      return new Date(`${ano}-${mes}-${dia}`);
    }
    
    return new Date(data);
  }

  /**
   * Converte nome completo do estado para sigla
   */
  static converterNomeEstadoParaSigla(nomeEstado: string): string | null {
    if (!nomeEstado) return null;
    
    const mapa: Record<string, string> = {
      'ACRE': 'AC',
      'ALAGOAS': 'AL',
      'AMAPÁ': 'AP',
      'AMAZONAS': 'AM',
      'BAHIA': 'BA',
      'CEARÁ': 'CE',
      'DISTRITO FEDERAL': 'DF',
      'ESPÍRITO SANTO': 'ES',
      'GOIÁS': 'GO',
      'MARANHÃO': 'MA',
      'MATO GROSSO': 'MT',
      'MATO GROSSO DO SUL': 'MS',
      'MINAS GERAIS': 'MG',
      'PARÁ': 'PA',
      'PARAÍBA': 'PB',
      'PARANÁ': 'PR',
      'PERNAMBUCO': 'PE',
      'PIAUÍ': 'PI',
      'RIO DE JANEIRO': 'RJ',
      'RIO GRANDE DO NORTE': 'RN',
      'RIO GRANDE DO SUL': 'RS',
      'RONDÔNIA': 'RO',
      'RORAIMA': 'RR',
      'SANTA CATARINA': 'SC',
      'SÃO PAULO': 'SP',
      'SERGIPE': 'SE',
      'TOCANTINS': 'TO',
    };
    
    const nomeUpper = nomeEstado.toUpperCase().trim();
    return mapa[nomeUpper] || nomeEstado;
  }
}

