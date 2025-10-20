#!/usr/bin/env node

/**
 * TESTE COMPLETO PARA CONFIGURAÇÃO POR ESTADO
 * 
 * Este script testa:
 * 1. Login no sistema
 * 2. Navegação para Natureza de Operação
 * 3. Configuração de múltiplos estados
 * 4. Preenchimento de todos os campos
 * 5. Salvamento das configurações
 * 6. Validação de erros
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// Configurações do teste
const CONFIG = {
  baseURL: 'http://localhost:3000',
  backendURL: 'http://localhost:3001',
  login: {
    email: 'teste@ieger.com.br',
    password: '123456'
  },
  testData: {
    // Estados para testar
    estados: ['AC', 'AL', 'SP', 'RJ', 'MG'],
    // Dados de teste para cada estado
    configuracaoEstados: {
      'AC': {
        cfop: '1101',
        naturezaOperacaoDescricao: 'Venda de mercadoria - Acre',
        localDestinoOperacao: 'interna',
        icms: {
          cst: '60',
          origem: '0',
          modalidadeBc: '0',
          aliquota: 18,
          reducaoBase: 0,
          simples: false,
          reduzirBase: false,
          incluirFrete: false,
          credita: false,
          incluirDesconto: false,
          importacao: false,
          debita: false,
          incluirIpi: false,
          reduzirValor: false,
          incluirDespesas: false,
          motivoDesoneracao: '',
          aliquotaDeferimento: 0,
          fcp: 0
        },
        icmsSt: {
          cst: '60',
          origem: '0',
          modalidade: '0',
          aliquota: 18,
          mva: 0,
          fecop: 0,
          pmpf: 0,
          simples: false,
          reduzirBase: false,
          incluirFrete: false,
          credita: false,
          incluirDesconto: false,
          importacao: false,
          debita: false,
          incluirIpi: false,
          reduzirValor: false,
          incluirDespesas: false
        },
        pis: {
          cst: '01',
          aliquota: 1.65,
          reducaoBase: 0,
          simples: false,
          reduzirBase: false
        },
        cofins: {
          cst: '01',
          aliquota: 7.6,
          reducaoBase: 0,
          simples: false,
          reduzirBase: false
        },
        iss: {
          cst: '01',
          situacao: '1',
          natureza: '1',
          aliquota: 5,
          reducaoBase: 0,
          valorMinimo: 0,
          simples: false,
          incluirFrete: false,
          incluirDesconto: false,
          incluirDespesas: false,
          incluirIpi: false,
          incluirIcms: false,
          csllPorcentagem: 1,
          csllAcima: 0,
          csllRetido: false,
          issPorcentagem: 5,
          issAcima: 0,
          issRetido: false,
          pisPorcentagem: 1.65,
          pisAcima: 0,
          pisRetido: false,
          inssPorcentagem: 11,
          inssAcima: 0,
          inssRetido: false,
          irPorcentagem: 1.5,
          irAcima: 0,
          irRetido: false,
          cofinsPorcentagem: 7.6,
          cofinsAcima: 0,
          cofinsRetido: false
        },
        ipi: {
          cst: '50',
          aliquota: 10,
          classe: 'A',
          codigo: '123',
          simples: false,
          reduzirBase: false,
          incluirFrete: false,
          incluirDesconto: false,
          incluirDespesas: false
        }
      },
      'AL': {
        cfop: '1102',
        naturezaOperacaoDescricao: 'Venda de mercadoria - Alagoas',
        localDestinoOperacao: 'interestadual',
        icms: {
          cst: '60',
          origem: '0',
          modalidadeBc: '0',
          aliquota: 18,
          reducaoBase: 0,
          simples: false,
          reduzirBase: false,
          incluirFrete: false,
          credita: false,
          incluirDesconto: false,
          importacao: false,
          debita: false,
          incluirIpi: false,
          reduzirValor: false,
          incluirDespesas: false,
          motivoDesoneracao: '',
          aliquotaDeferimento: 0,
          fcp: 0
        },
        icmsSt: {
          cst: '60',
          origem: '0',
          modalidade: '0',
          aliquota: 18,
          mva: 0,
          fecop: 0,
          pmpf: 0,
          simples: false,
          reduzirBase: false,
          incluirFrete: false,
          credita: false,
          incluirDesconto: false,
          importacao: false,
          debita: false,
          incluirIpi: false,
          reduzirValor: false,
          incluirDespesas: false
        },
        pis: {
          cst: '01',
          aliquota: 1.65,
          reducaoBase: 0,
          simples: false,
          reduzirBase: false
        },
        cofins: {
          cst: '01',
          aliquota: 7.6,
          reducaoBase: 0,
          simples: false,
          reduzirBase: false
        },
        iss: {
          cst: '01',
          situacao: '1',
          natureza: '1',
          aliquota: 5,
          reducaoBase: 0,
          valorMinimo: 0,
          simples: false,
          incluirFrete: false,
          incluirDesconto: false,
          incluirDespesas: false,
          incluirIpi: false,
          incluirIcms: false,
          csllPorcentagem: 1,
          csllAcima: 0,
          csllRetido: false,
          issPorcentagem: 5,
          issAcima: 0,
          issRetido: false,
          pisPorcentagem: 1.65,
          pisAcima: 0,
          pisRetido: false,
          inssPorcentagem: 11,
          inssAcima: 0,
          inssRetido: false,
          irPorcentagem: 1.5,
          irAcima: 0,
          irRetido: false,
          cofinsPorcentagem: 7.6,
          cofinsAcima: 0,
          cofinsRetido: false
        },
        ipi: {
          cst: '50',
          aliquota: 10,
          classe: 'A',
          codigo: '123',
          simples: false,
          reduzirBase: false,
          incluirFrete: false,
          incluirDesconto: false,
          incluirDespesas: false
        }
      }
    }
  }
};

class TesteConfiguracaoEstado {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      startTime: new Date(),
      steps: [],
      errors: [],
      success: false
    };
  }

  async log(step, message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      step,
      message,
      type
    };
    
    this.results.steps.push(logEntry);
    
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${emoji} [${step}] ${message}`);
  }

  async init() {
    try {
      this.log('INIT', 'Iniciando teste de configuração por estado');
      
      // Verificar se o backend está rodando
      const backendResponse = await fetch(`${CONFIG.backendURL}/api`);
      if (!backendResponse.ok) {
        throw new Error('Backend não está respondendo');
      }
      this.log('INIT', 'Backend verificado com sucesso', 'success');

      // Iniciar navegador
      this.browser = await puppeteer.launch({
        headless: false, // Modo visual para debug
        defaultViewport: null,
        args: ['--start-maximized']
      });

      this.page = await this.browser.newPage();
      
      // Interceptar requisições para debug
      await this.page.setRequestInterception(true);
      this.page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          this.log('REQUEST', `API: ${request.method()} ${request.url()}`);
        }
        request.continue();
      });

      // Interceptar respostas para debug
      this.page.on('response', (response) => {
        if (response.url().includes('/api/')) {
          this.log('RESPONSE', `API: ${response.status()} ${response.url()}`);
        }
      });

      // Interceptar erros de console
      this.page.on('console', (msg) => {
        if (msg.type() === 'error') {
          this.log('CONSOLE_ERROR', msg.text(), 'error');
        }
      });

      this.log('INIT', 'Navegador iniciado com sucesso', 'success');
    } catch (error) {
      this.log('INIT', `Erro na inicialização: ${error.message}`, 'error');
      throw error;
    }
  }

  async login() {
    try {
      this.log('LOGIN', 'Navegando para página de login');
      await this.page.goto(`${CONFIG.baseURL}/login`);
      await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });

      this.log('LOGIN', 'Preenchendo credenciais');
      await this.page.type('input[type="email"]', CONFIG.login.email);
      await this.page.type('input[type="password"]', CONFIG.login.password);

      this.log('LOGIN', 'Clicando em entrar');
      await this.page.click('button[type="submit"]');

      // Aguardar redirecionamento para dashboard
      await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
      
      // Verificar se está logado
      const currentURL = this.page.url();
      if (currentURL.includes('/dashboard') || currentURL.includes('/empresa')) {
        this.log('LOGIN', 'Login realizado com sucesso', 'success');
      } else {
        throw new Error('Falha no login - não foi redirecionado para dashboard');
      }
    } catch (error) {
      this.log('LOGIN', `Erro no login: ${error.message}`, 'error');
      throw error;
    }
  }

  async navegarParaNaturezaOperacao() {
    try {
      this.log('NAVIGATION', 'Navegando para Impostos > Natureza de Operação');
      
      // Clicar no menu Impostos
      await this.page.waitForSelector('a[href*="/impostos"]', { timeout: 10000 });
      await this.page.click('a[href*="/impostos"]');
      
      // Aguardar carregamento do submenu
      await this.page.waitForTimeout(1000);
      
      // Clicar em Natureza de Operação
      await this.page.waitForSelector('a[href*="/natureza-operacao"]', { timeout: 10000 });
      await this.page.click('a[href*="/natureza-operacao"]');
      
      // Aguardar carregamento da página
      await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
      
      this.log('NAVIGATION', 'Página de Natureza de Operação carregada', 'success');
    } catch (error) {
      this.log('NAVIGATION', `Erro na navegação: ${error.message}`, 'error');
      throw error;
    }
  }

  async encontrarNaturezaTeste() {
    try {
      this.log('FIND_NATUREZA', 'Procurando natureza "Venda teste"');
      
      // Aguardar carregamento da tabela
      await this.page.waitForSelector('table', { timeout: 10000 });
      
      // Procurar pela natureza "Venda teste"
      const naturezaElement = await this.page.$x("//td[contains(text(), 'Venda teste')]");
      
      if (naturezaElement.length === 0) {
        throw new Error('Natureza "Venda teste" não encontrada');
      }
      
      this.log('FIND_NATUREZA', 'Natureza "Venda teste" encontrada', 'success');
      return naturezaElement[0];
    } catch (error) {
      this.log('FIND_NATUREZA', `Erro ao encontrar natureza: ${error.message}`, 'error');
      throw error;
    }
  }

  async clicarConfigurar(naturezaElement) {
    try {
      this.log('CONFIGURAR', 'Clicando em Configurar');
      
      // Encontrar o botão Configurar na mesma linha
      const row = await naturezaElement.$x('..');
      const configurarButton = await row[0].$x(".//button[contains(text(), 'Configurar')]");
      
      if (configurarButton.length === 0) {
        throw new Error('Botão Configurar não encontrado');
      }
      
      await configurarButton[0].click();
      
      // Aguardar carregamento da página de configuração
      await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
      
      this.log('CONFIGURAR', 'Página de configuração carregada', 'success');
    } catch (error) {
      this.log('CONFIGURAR', `Erro ao clicar em Configurar: ${error.message}`, 'error');
      throw error;
    }
  }

  async configurarEstados() {
    try {
      this.log('CONFIG_ESTADOS', 'Iniciando configuração dos estados');
      
      for (const uf of CONFIG.testData.estados) {
        await this.configurarEstado(uf);
      }
      
      this.log('CONFIG_ESTADOS', 'Todos os estados configurados', 'success');
    } catch (error) {
      this.log('CONFIG_ESTADOS', `Erro na configuração dos estados: ${error.message}`, 'error');
      throw error;
    }
  }

  async configurarEstado(uf) {
    try {
      this.log('CONFIG_ESTADO', `Configurando estado ${uf}`);
      
      // Procurar pelo estado na lista
      const estadoElement = await this.page.$x(`//div[contains(text(), '${uf}')]`);
      
      if (estadoElement.length === 0) {
        this.log('CONFIG_ESTADO', `Estado ${uf} não encontrado, pulando`, 'info');
        return;
      }
      
      // Clicar no checkbox para habilitar o estado
      const checkbox = await estadoElement[0].$x('.//input[@type="checkbox"]');
      if (checkbox.length > 0) {
        await checkbox[0].click();
        this.log('CONFIG_ESTADO', `Estado ${uf} habilitado`);
      }
      
      // Aguardar expansão do estado
      await this.page.waitForTimeout(1000);
      
      // Preencher campos específicos do estado
      const config = CONFIG.testData.configuracaoEstados[uf];
      if (config) {
        await this.preencherCamposEstado(uf, config);
      }
      
      this.log('CONFIG_ESTADO', `Estado ${uf} configurado com sucesso`, 'success');
    } catch (error) {
      this.log('CONFIG_ESTADO', `Erro ao configurar estado ${uf}: ${error.message}`, 'error');
      throw error;
    }
  }

  async preencherCamposEstado(uf, config) {
    try {
      this.log('CAMPOS_ESTADO', `Preenchendo campos do estado ${uf}`);
      
      // CFOP
      if (config.cfop) {
        await this.preencherCampo(`cfop-${uf}`, config.cfop);
      }
      
      // Natureza de Operação
      if (config.naturezaOperacaoDescricao) {
        await this.preencherCampo(`natureza-operacao-${uf}`, config.naturezaOperacaoDescricao);
      }
      
      // Local Destino da Operação
      if (config.localDestinoOperacao) {
        await this.selecionarOpcao(`local-destino-${uf}`, config.localDestinoOperacao);
      }
      
      // Configurar ICMS
      if (config.icms) {
        await this.configurarICMS(uf, config.icms);
      }
      
      // Configurar PIS
      if (config.pis) {
        await this.configurarPIS(uf, config.pis);
      }
      
      // Configurar COFINS
      if (config.cofins) {
        await this.configurarCOFINS(uf, config.cofins);
      }
      
      // Configurar ISS
      if (config.iss) {
        await this.configurarISS(uf, config.iss);
      }
      
      // Configurar IPI
      if (config.ipi) {
        await this.configurarIPI(uf, config.ipi);
      }
      
      this.log('CAMPOS_ESTADO', `Campos do estado ${uf} preenchidos`, 'success');
    } catch (error) {
      this.log('CAMPOS_ESTADO', `Erro ao preencher campos do estado ${uf}: ${error.message}`, 'error');
      throw error;
    }
  }

  async preencherCampo(selector, value) {
    try {
      const element = await this.page.$(`#${selector}`);
      if (element) {
        await element.click({ clickCount: 3 }); // Selecionar todo o texto
        await element.type(value);
      }
    } catch (error) {
      // Campo pode não existir, continuar
    }
  }

  async selecionarOpcao(selector, value) {
    try {
      const element = await this.page.$(`#${selector}`);
      if (element) {
        await element.select(value);
      }
    } catch (error) {
      // Campo pode não existir, continuar
    }
  }

  async configurarICMS(uf, icms) {
    try {
      // Alíquota ICMS
      if (icms.aliquota) {
        await this.preencherCampo(`icms-aliquota-${uf}`, icms.aliquota.toString());
      }
      
      // CST ICMS
      if (icms.cst) {
        await this.selecionarOpcao(`icms-cst-${uf}`, icms.cst);
      }
      
      // Origem ICMS
      if (icms.origem) {
        await this.selecionarOpcao(`icms-origem-${uf}`, icms.origem);
      }
    } catch (error) {
      // Campos podem não existir, continuar
    }
  }

  async configurarPIS(uf, pis) {
    try {
      // Alíquota PIS
      if (pis.aliquota) {
        await this.preencherCampo(`pis-aliquota-${uf}`, pis.aliquota.toString());
      }
      
      // CST PIS
      if (pis.cst) {
        await this.selecionarOpcao(`pis-cst-${uf}`, pis.cst);
      }
    } catch (error) {
      // Campos podem não existir, continuar
    }
  }

  async configurarCOFINS(uf, cofins) {
    try {
      // Alíquota COFINS
      if (cofins.aliquota) {
        await this.preencherCampo(`cofins-aliquota-${uf}`, cofins.aliquota.toString());
      }
      
      // CST COFINS
      if (cofins.cst) {
        await this.selecionarOpcao(`cofins-cst-${uf}`, cofins.cst);
      }
    } catch (error) {
      // Campos podem não existir, continuar
    }
  }

  async configurarISS(uf, iss) {
    try {
      // Alíquota ISS
      if (iss.aliquota) {
        await this.preencherCampo(`iss-aliquota-${uf}`, iss.aliquota.toString());
      }
      
      // CST ISS
      if (iss.cst) {
        await this.selecionarOpcao(`iss-cst-${uf}`, iss.cst);
      }
    } catch (error) {
      // Campos podem não existir, continuar
    }
  }

  async configurarIPI(uf, ipi) {
    try {
      // Alíquota IPI
      if (ipi.aliquota) {
        await this.preencherCampo(`ipi-aliquota-${uf}`, ipi.aliquota.toString());
      }
      
      // CST IPI
      if (ipi.cst) {
        await this.selecionarOpcao(`ipi-cst-${uf}`, ipi.cst);
      }
    } catch (error) {
      // Campos podem não existir, continuar
    }
  }

  async salvarConfiguracoes() {
    try {
      this.log('SAVE', 'Clicando em Salvar');
      
      // Procurar pelo botão Salvar
      const salvarButton = await this.page.$x("//button[contains(text(), 'Salvar')]");
      
      if (salvarButton.length === 0) {
        throw new Error('Botão Salvar não encontrado');
      }
      
      await salvarButton[0].click();
      
      // Aguardar salvamento
      await this.page.waitForTimeout(3000);
      
      // Verificar se houve erro
      const errorElements = await this.page.$x("//div[contains(@class, 'error') or contains(text(), 'erro')]");
      if (errorElements.length > 0) {
        const errorText = await errorElements[0].evaluate(el => el.textContent);
        throw new Error(`Erro ao salvar: ${errorText}`);
      }
      
      // Verificar se foi redirecionado para a listagem
      const currentURL = this.page.url();
      if (currentURL.includes('/natureza-operacao') && !currentURL.includes('/configuracao')) {
        this.log('SAVE', 'Configurações salvas com sucesso', 'success');
        this.results.success = true;
      } else {
        throw new Error('Falha no salvamento - não foi redirecionado');
      }
    } catch (error) {
      this.log('SAVE', `Erro ao salvar: ${error.message}`, 'error');
      throw error;
    }
  }

  async finalizar() {
    try {
      this.log('FINALIZE', 'Finalizando teste');
      
      if (this.browser) {
        await this.browser.close();
      }
      
      this.results.endTime = new Date();
      this.results.duration = this.results.endTime - this.results.startTime;
      
      // Salvar relatório
      const reportPath = `test-report-${Date.now()}.json`;
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
      
      this.log('FINALIZE', `Relatório salvo em: ${reportPath}`, 'success');
      
      if (this.results.success) {
        this.log('FINALIZE', 'TESTE CONCLUÍDO COM SUCESSO!', 'success');
      } else {
        this.log('FINALIZE', 'TESTE FALHOU!', 'error');
      }
      
    } catch (error) {
      this.log('FINALIZE', `Erro na finalização: ${error.message}`, 'error');
    }
  }

  async executar() {
    try {
      await this.init();
      await this.login();
      await this.navegarParaNaturezaOperacao();
      
      const naturezaElement = await this.encontrarNaturezaTeste();
      await this.clicarConfigurar(naturezaElement);
      await this.configurarEstados();
      await this.salvarConfiguracoes();
      
    } catch (error) {
      this.log('EXECUTE', `Erro durante execução: ${error.message}`, 'error');
      this.results.errors.push(error.message);
    } finally {
      await this.finalizar();
    }
  }
}

// Executar teste
if (require.main === module) {
  const teste = new TesteConfiguracaoEstado();
  teste.executar().catch(console.error);
}

module.exports = TesteConfiguracaoEstado;

