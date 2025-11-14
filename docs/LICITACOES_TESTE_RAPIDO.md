# 🧪 TESTE RÁPIDO - APIs DE LICITAÇÕES

## 🎯 **OBJETIVO**
Testar rapidamente as APIs de licitações disponíveis para validar funcionamento e dados antes da implementação completa.

---

## 1️⃣ **TESTE DA API PNCP (Recomendada)**

### **Informações Básicas**
- **URL Base**: `https://pncp.gov.br/api/v1`
- **Autenticação**: Não requer (dados abertos)
- **Documentação**: https://www.gov.br/pncp/pt-br/acesso-a-informacao/dados-abertos
- **Formato**: JSON

### **Teste 1: Listar Licitações**

```bash
# Listar licitações abertas
curl -X GET "https://pncp.gov.br/api/v1/licitacoes" \
  -H "Accept: application/json"
```

### **Teste 2: Buscar Licitações com Filtros**

```bash
# Licitações de São Paulo
curl -X GET "https://pncp.gov.br/api/v1/licitacoes?uf=SP&pagina=1&limite=10" \
  -H "Accept: application/json"

# Licitações acima de R$ 50.000
curl -X GET "https://pncp.gov.br/api/v1/licitacoes?valor_minimo=50000" \
  -H "Accept: application/json"

# Licitações abertas hoje
curl -X GET "https://pncp.gov.br/api/v1/licitacoes?situacao=Aberta" \
  -H "Accept: application/json"
```

### **Teste 3: Detalhes de uma Licitação**

```bash
# Substituir {id} pelo ID de uma licitação real
curl -X GET "https://pncp.gov.br/api/v1/licitacoes/{id}" \
  -H "Accept: application/json"
```

### **Estrutura de Resposta Esperada (PNCP)**

```json
{
  "data": [
    {
      "numeroControlePNCP": "00001234567890123456",
      "sequencialCompra": 1,
      "anoCompra": 2024,
      "objetoCompra": "Aquisição de materiais de escritório",
      "informacaoComplementar": "Conforme especificações do edital",
      "modalidadeNome": "Pregão Eletrônico",
      "situacaoCompra": "Em andamento",
      "dataPublicacaoPncp": "2024-11-10T10:00:00Z",
      "dataAberturaPropostaNova": "2024-11-20T10:00:00Z",
      "valorTotalEstimado": 50000.00,
      "ufSigla": "SP",
      "municipio": {
        "nome": "São Paulo",
        "codigoIBGE": "3550308"
      },
      "orgaoEntidade": {
        "razaoSocial": "Prefeitura Municipal de São Paulo",
        "cnpj": "12345678000190",
        "sigla": "PMSP"
      },
      "linkSistemaOrigem": "https://...",
      "itensCompra": [
        {
          "numeroItem": 1,
          "descricao": "Papel A4",
          "unidadeMedida": "Resma",
          "quantidade": 1000,
          "valorUnitario": 20.00
        }
      ]
    }
  ],
  "links": {
    "self": "...",
    "first": "...",
    "last": "...",
    "next": "..."
  },
  "meta": {
    "current_page": 1,
    "total": 150,
    "per_page": 10
  }
}
```

---

## 2️⃣ **TESTE DA API COMPRAS.GOV.BR**

### **Informações Básicas**
- **URL Base**: `https://compras.dados.gov.br/api`
- **Autenticação**: Não requer (dados abertos)
- **Documentação**: https://compras.dados.gov.br/docs
- **Formato**: JSON

### **Teste 1: Listar Licitações**

```bash
# Listar licitações
curl -X GET "https://compras.dados.gov.br/api/licitacoes/v1/licitacoes.json" \
  -H "Accept: application/json"
```

### **Teste 2: Buscar Licitação Específica**

```bash
# Detalhes de licitação por ID
curl -X GET "https://compras.dados.gov.br/api/licitacoes/v1/licitacao/{uasg}/{numero_licitacao}.json" \
  -H "Accept: application/json"
```

### **Teste 3: Listar Contratos**

```bash
# Listar contratos
curl -X GET "https://compras.dados.gov.br/api/contratos/v1/contratos.json?limit=10" \
  -H "Accept: application/json"
```

### **Estrutura de Resposta Esperada (Compras.gov.br)**

```json
{
  "_embedded": {
    "licitacoes": [
      {
        "identificador": "123456789",
        "numero_compra": "00001/2024",
        "uasg": {
          "codigo": "123456",
          "nome": "Ministério da Economia"
        },
        "modalidade_licitacao": {
          "codigo": 5,
          "descricao": "Pregão"
        },
        "forma_pregao": {
          "codigo": 1,
          "descricao": "Eletrônico"
        },
        "objeto": "Aquisição de equipamentos de informática",
        "valor_estimado": 150000.00,
        "data_publicacao": "2024-11-10",
        "data_abertura_proposta": "2024-11-20",
        "situacao": "Aberta",
        "uf": "DF",
        "_links": {
          "self": {
            "href": "..."
          }
        }
      }
    ]
  }
}
```

---

## 3️⃣ **TESTE DA API PORTAL DA TRANSPARÊNCIA**

### **Informações Básicas**
- **URL Base**: `https://api.portaldatransparencia.gov.br/api-de-dados`
- **Autenticação**: **REQUER TOKEN** (cadastro gratuito)
- **Documentação**: https://portaldatransparencia.gov.br/api-de-dados
- **Formato**: JSON

### **Passo 1: Obter Token de API**

1. Acesse: https://portaldatransparencia.gov.br/api-de-dados
2. Clique em "Cadastre-se"
3. Informe seu e-mail
4. Receba o token por e-mail

### **Teste 1: Listar Licitações**

```bash
# IMPORTANTE: Substituir SEU_TOKEN_AQUI pelo token recebido
curl -X GET "https://api.portaldatransparencia.gov.br/api-de-dados/licitacoes?pagina=1" \
  -H "chave-api-dados: SEU_TOKEN_AQUI" \
  -H "Accept: application/json"
```

### **Teste 2: Buscar Licitação por Data**

```bash
curl -X GET "https://api.portaldatransparencia.gov.br/api-de-dados/licitacoes?dataInicial=01/11/2024&dataFinal=11/11/2024&pagina=1" \
  -H "chave-api-dados: SEU_TOKEN_AQUI" \
  -H "Accept: application/json"
```

### **Teste 3: Contratos**

```bash
curl -X GET "https://api.portaldatransparencia.gov.br/api-de-dados/contratos?pagina=1" \
  -H "chave-api-dados: SEU_TOKEN_AQUI" \
  -H "Accept: application/json"
```

### **Estrutura de Resposta Esperada (Portal da Transparência)**

```json
[
  {
    "codigoOrgao": "12345",
    "nomeOrgao": "Ministério da Saúde",
    "numeroLicitacao": "00001/2024",
    "modalidadeLicitacao": "Pregão Eletrônico",
    "objeto": "Aquisição de medicamentos",
    "valorEstimado": 500000.00,
    "situacao": "Em andamento",
    "dataAbertura": "10/11/2024",
    "dataPublicacao": "01/11/2024"
  }
]
```

---

## 4️⃣ **TESTE COM NODE.JS / TYPESCRIPT**

### **Script de Teste Completo**

Crie um arquivo `test-licitacoes-api.js`:

```javascript
// test-licitacoes-api.js
const axios = require('axios');

// Cores para console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

// ========================================
// TESTE 1: API PNCP
// ========================================
async function testPNCP() {
  console.log('\n' + '='.repeat(50));
  log.info('TESTANDO API PNCP');
  console.log('='.repeat(50));

  try {
    const response = await axios.get('https://pncp.gov.br/api/v1/licitacoes', {
      params: {
        uf: 'SP',
        pagina: 1,
        limite: 5,
      },
      timeout: 30000,
    });

    if (response.status === 200) {
      const licitacoes = response.data.data || response.data;
      log.success(`PNCP funcionando! Encontradas ${licitacoes.length} licitações`);
      
      if (licitacoes.length > 0) {
        log.info('Exemplo de licitação:');
        const primeira = licitacoes[0];
        console.log(`  - Número: ${primeira.numeroControlePNCP || primeira.numero || 'N/A'}`);
        console.log(`  - Objeto: ${primeira.objetoCompra || primeira.titulo || 'N/A'}`);
        console.log(`  - Valor: R$ ${primeira.valorTotalEstimado || primeira.valor || 0}`);
        console.log(`  - Status: ${primeira.situacaoCompra || primeira.situacao || 'N/A'}`);
      }
      
      return { sucesso: true, total: licitacoes.length };
    }
  } catch (error) {
    log.error(`Erro ao testar PNCP: ${error.message}`);
    if (error.response) {
      log.warning(`Status: ${error.response.status}`);
      log.warning(`Dados: ${JSON.stringify(error.response.data).substring(0, 200)}`);
    }
    return { sucesso: false, erro: error.message };
  }
}

// ========================================
// TESTE 2: API COMPRAS.GOV.BR
// ========================================
async function testComprasGov() {
  console.log('\n' + '='.repeat(50));
  log.info('TESTANDO API COMPRAS.GOV.BR');
  console.log('='.repeat(50));

  try {
    const response = await axios.get(
      'https://compras.dados.gov.br/api/licitacoes/v1/licitacoes.json',
      {
        params: { limit: 5 },
        timeout: 30000,
      }
    );

    if (response.status === 200) {
      const data = response.data;
      const licitacoes = data._embedded?.licitacoes || [];
      
      log.success(`Compras.gov.br funcionando! Encontradas ${licitacoes.length} licitações`);
      
      if (licitacoes.length > 0) {
        log.info('Exemplo de licitação:');
        const primeira = licitacoes[0];
        console.log(`  - Número: ${primeira.numero_compra || 'N/A'}`);
        console.log(`  - Objeto: ${primeira.objeto || 'N/A'}`);
        console.log(`  - Valor: R$ ${primeira.valor_estimado || 0}`);
        console.log(`  - UASG: ${primeira.uasg?.nome || 'N/A'}`);
      }
      
      return { sucesso: true, total: licitacoes.length };
    }
  } catch (error) {
    log.error(`Erro ao testar Compras.gov.br: ${error.message}`);
    if (error.response) {
      log.warning(`Status: ${error.response.status}`);
    }
    return { sucesso: false, erro: error.message };
  }
}

// ========================================
// TESTE 3: API PORTAL DA TRANSPARÊNCIA
// ========================================
async function testPortalTransparencia() {
  console.log('\n' + '='.repeat(50));
  log.info('TESTANDO API PORTAL DA TRANSPARÊNCIA');
  console.log('='.repeat(50));

  // TOKEN - você precisa cadastrar em:
  // https://portaldatransparencia.gov.br/api-de-dados
  const TOKEN = process.env.PORTAL_TRANSPARENCIA_TOKEN || 'SEU_TOKEN_AQUI';

  if (TOKEN === 'SEU_TOKEN_AQUI') {
    log.warning('Token não configurado!');
    log.info('Para testar esta API:');
    log.info('1. Acesse: https://portaldatransparencia.gov.br/api-de-dados');
    log.info('2. Cadastre seu e-mail');
    log.info('3. Receba o token por e-mail');
    log.info('4. Execute: export PORTAL_TRANSPARENCIA_TOKEN="seu_token"');
    return { sucesso: false, erro: 'Token não configurado' };
  }

  try {
    const dataInicial = new Date();
    dataInicial.setDate(dataInicial.getDate() - 30);
    const dataFinal = new Date();

    const response = await axios.get(
      'https://api.portaldatransparencia.gov.br/api-de-dados/licitacoes',
      {
        params: {
          dataInicial: dataInicial.toLocaleDateString('pt-BR'),
          dataFinal: dataFinal.toLocaleDateString('pt-BR'),
          pagina: 1,
        },
        headers: {
          'chave-api-dados': TOKEN,
        },
        timeout: 30000,
      }
    );

    if (response.status === 200) {
      const licitacoes = response.data;
      log.success(`Portal da Transparência funcionando! Encontradas ${licitacoes.length} licitações`);
      
      if (licitacoes.length > 0) {
        log.info('Exemplo de licitação:');
        const primeira = licitacoes[0];
        console.log(`  - Número: ${primeira.numeroLicitacao || 'N/A'}`);
        console.log(`  - Objeto: ${primeira.objeto || 'N/A'}`);
        console.log(`  - Órgão: ${primeira.nomeOrgao || 'N/A'}`);
        console.log(`  - Valor: R$ ${primeira.valorEstimado || 0}`);
      }
      
      return { sucesso: true, total: licitacoes.length };
    }
  } catch (error) {
    log.error(`Erro ao testar Portal da Transparência: ${error.message}`);
    if (error.response) {
      log.warning(`Status: ${error.response.status}`);
      if (error.response.status === 401) {
        log.warning('Token inválido ou expirado!');
      }
    }
    return { sucesso: false, erro: error.message };
  }
}

// ========================================
// EXECUTAR TODOS OS TESTES
// ========================================
async function runAllTests() {
  console.log('\n' + '='.repeat(50));
  log.info('🚀 INICIANDO TESTES DAS APIs DE LICITAÇÕES');
  console.log('='.repeat(50));

  const resultados = {
    pncp: await testPNCP(),
    comprasGov: await testComprasGov(),
    portalTransparencia: await testPortalTransparencia(),
  };

  // Resumo
  console.log('\n' + '='.repeat(50));
  log.info('📊 RESUMO DOS TESTES');
  console.log('='.repeat(50));

  const sucessos = Object.values(resultados).filter(r => r.sucesso).length;
  const total = Object.keys(resultados).length;

  console.log(`\nAPIs testadas: ${total}`);
  console.log(`✅ Sucesso: ${sucessos}`);
  console.log(`❌ Falhas: ${total - sucessos}`);

  console.log('\nDetalhes:');
  console.log(`  PNCP: ${resultados.pncp.sucesso ? '✅' : '❌'}`);
  console.log(`  Compras.gov.br: ${resultados.comprasGov.sucesso ? '✅' : '❌'}`);
  console.log(`  Portal Transparência: ${resultados.portalTransparencia.sucesso ? '✅' : '❌'}`);

  console.log('\n' + '='.repeat(50));
  
  if (sucessos >= 2) {
    log.success('🎉 ÓTIMO! Pelo menos 2 APIs funcionando!');
    log.info('✅ Pronto para implementar o módulo de licitações');
  } else if (sucessos === 1) {
    log.warning('⚠️  Apenas 1 API funcionando - recomendável ter mais de uma');
  } else {
    log.error('❌ Nenhuma API funcionando - verificar conectividade');
  }

  console.log('='.repeat(50) + '\n');
}

// Executar
runAllTests().catch(error => {
  log.error(`Erro fatal: ${error.message}`);
  process.exit(1);
});
```

### **Como Executar o Teste**

```bash
# No diretório do projeto
cd /home/fabio/projetos/fenix

# Instalar axios se não tiver
npm install axios

# Executar teste
node docs/test-licitacoes-api.js

# OU com token do Portal da Transparência
export PORTAL_TRANSPARENCIA_TOKEN="seu_token_aqui"
node docs/test-licitacoes-api.js
```

---

## 5️⃣ **VALIDAÇÃO DOS DADOS**

### **Checklist de Validação**

Ao testar as APIs, verifique se os dados incluem:

- [ ] **Número do processo** (identificação única)
- [ ] **Título/Objeto** (descrição da licitação)
- [ ] **Órgão** (quem está licitando)
- [ ] **Modalidade** (Pregão, Concorrência, etc.)
- [ ] **Valor estimado** (quanto vale)
- [ ] **Datas** (abertura, encerramento)
- [ ] **Status** (aberta, encerrada, etc.)
- [ ] **Localização** (Estado, Município)
- [ ] **Link do edital** (onde baixar)

### **Qualidade dos Dados**

| Campo | PNCP | Compras.gov | Portal Transp. |
|-------|------|-------------|----------------|
| Número Processo | ✅ | ✅ | ✅ |
| Título | ✅ | ✅ | ✅ |
| Órgão | ✅ | ✅ | ✅ |
| Modalidade | ✅ | ✅ | ✅ |
| Valor | ✅ | ✅ | ✅ |
| Datas | ✅ | ✅ | ✅ |
| UF/Município | ✅ | ⚠️ (só UF) | ⚠️ (só UF) |
| Link Edital | ✅ | ✅ | ❌ |
| Itens | ✅ | ❌ | ❌ |

**🏆 VENCEDOR: PNCP (mais completo)**

---

## 6️⃣ **PRÓXIMOS PASSOS**

Após validar as APIs:

1. ✅ **Confirmar funcionamento** - Pelo menos 2 APIs funcionando
2. ✅ **Analisar dados** - Campos disponíveis e úteis
3. ✅ **Escolher API principal** - Recomendação: PNCP
4. ✅ **Planejar integração** - Backend + Frontend
5. ✅ **Iniciar desenvolvimento** - MVP em 2-3 semanas

---

## 📊 **RESULTADOS ESPERADOS**

Se tudo estiver funcionando, você deve ver:

```
==================================================
ℹ️  🚀 INICIANDO TESTES DAS APIs DE LICITAÇÕES
==================================================

==================================================
ℹ️  TESTANDO API PNCP
==================================================
✅ PNCP funcionando! Encontradas 5 licitações
ℹ️  Exemplo de licitação:
  - Número: 00001234567890123456
  - Objeto: Aquisição de materiais de escritório
  - Valor: R$ 50000
  - Status: Em andamento

==================================================
ℹ️  TESTANDO API COMPRAS.GOV.BR
==================================================
✅ Compras.gov.br funcionando! Encontradas 5 licitações

==================================================
ℹ️  📊 RESUMO DOS TESTES
==================================================

APIs testadas: 3
✅ Sucesso: 2
❌ Falhas: 1

Detalhes:
  PNCP: ✅
  Compras.gov.br: ✅
  Portal Transparência: ❌

==================================================
✅ 🎉 ÓTIMO! Pelo menos 2 APIs funcionando!
ℹ️  ✅ Pronto para implementar o módulo de licitações
==================================================
```

---

## ⚠️ **TROUBLESHOOTING**

### **Erro: Timeout / Connection Refused**
```
Causa: API fora do ar ou firewall bloqueando
Solução: Tentar novamente mais tarde ou verificar conexão
```

### **Erro: 401 Unauthorized (Portal Transparência)**
```
Causa: Token inválido ou não configurado
Solução: Cadastrar em portaldatransparencia.gov.br/api-de-dados
```

### **Erro: 404 Not Found**
```
Causa: URL da API mudou
Solução: Verificar documentação atualizada
```

### **Erro: Rate Limit Exceeded**
```
Causa: Muitas requisições em pouco tempo
Solução: Aguardar ou implementar rate limiting
```

---

## ✅ **CHECKLIST FINAL**

Antes de iniciar a implementação:

- [ ] Testei a API do PNCP
- [ ] Testei a API do Compras.gov.br
- [ ] Cadastrei no Portal da Transparência (opcional)
- [ ] Analisei a estrutura dos dados retornados
- [ ] Identifiquei campos úteis para o Fenix ERP
- [ ] Confirmei que as APIs são gratuitas
- [ ] Verifiquei limites de requisição
- [ ] Li a documentação oficial
- [ ] Estou pronto para implementar! 🚀

---

**Data**: 2024-11-11  
**Status**: ✅ Pronto para Testes  
**Próximo Passo**: Executar os testes e validar as APIs



