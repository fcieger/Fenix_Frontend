# Fenix NFe API - Documentação da API

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
- [Modelos de Dados](#modelos-de-dados)
- [Códigos de Erro](#códigos-de-erro)
- [Exemplos de Uso](#exemplos-de-uso)
- [Rate Limiting](#rate-limiting)
- [Webhooks](#webhooks)
- [Changelog](#changelog)

## 🔍 Visão Geral

A **Fenix NFe API** é uma API RESTful para emissão, consulta e gerenciamento de Notas Fiscais Eletrônicas (NFe) no Brasil. A API oferece funcionalidades completas para integração com sistemas de terceiros, incluindo emissão, consulta, cancelamento e geração de documentos.

### Características Principais

- ✅ **Emissão de NFe** com validação completa
- ✅ **Consulta de status** e informações
- ✅ **Cancelamento** de NFe
- ✅ **Geração de XML, PDF e DANFE**
- ✅ **Suporte a Simples Nacional** e regime normal
- ✅ **Processamento assíncrono** com filas
- ✅ **Monitoramento** e observabilidade
- ✅ **Segurança** com JWT e RBAC
- ✅ **Escalabilidade** com Kubernetes

### Base URL

```
Produção: https://api.fenix.com.br/nfe
Staging:  https://staging-api.fenix.com.br/nfe
```

### Versão da API

- **Versão Atual**: v1.0.0
- **Formato de Resposta**: JSON
- **Encoding**: UTF-8

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Tokens)** para autenticação. Todas as requisições devem incluir o token no header `Authorization`.

### Obter Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "seu@email.com",
  "password": "sua_senha"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "roles": ["USER"],
    "companyCnpj": "11543862000187"
  }
}
```

### Usar Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🚀 Endpoints

### 1. Emissão de NFe

#### Emitir NFe

```http
POST /api/nfe/emitir
Authorization: Bearer {token}
X-Company-CNPJ: {cnpj}
Content-Type: application/json
```

**Request Body:**
```json
{
  "serie": 32,
  "numero": 1,
  "ambiente": "HOMOLOGACAO",
  "emitente": {
    "cnpj": "11543862000187",
    "nome": "EMPRESA TESTE LTDA",
    "inscricaoEstadual": "9110691308",
    "endereco": {
      "logradouro": "Rua Teste",
      "numero": "123",
      "bairro": "Centro",
      "cidade": "Curitiba",
      "uf": "PR",
      "cep": "80000-000"
    }
  },
  "destinatario": {
    "cnpj": "11543862000187",
    "nome": "DESTINATARIO TESTE LTDA",
    "inscricaoEstadual": "9110691308",
    "endereco": {
      "logradouro": "Rua Destino",
      "numero": "456",
      "bairro": "Centro",
      "cidade": "Curitiba",
      "uf": "PR",
      "cep": "80000-000"
    }
  },
  "itens": [
    {
      "codigo": "001",
      "descricao": "Produto Teste",
      "quantidade": 1.0,
      "valorUnitario": 100.00,
      "valorTotal": 100.00,
      "unidadeComercial": "UN",
      "codigoNCM": "12345678"
    }
  ],
  "imposto": {
    "icmsCst": "102",
    "pisCst": "07",
    "cofinsCst": "07"
  },
  "responsavelTecnico": {
    "cnpj": "17642368000156",
    "nome": "Fabio Ieger",
    "email": "fabio@icertus.com.br",
    "telefone": "4136536993"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "NFe enviada para processamento",
  "data": {
    "nfeId": "nfe-123456789",
    "status": "PENDENTE",
    "chaveAcesso": "41140411543862000187550010000000011234567890",
    "numeroProtocolo": null,
    "dataEmissao": "2024-01-15T10:30:00Z",
    "dataProcessamento": null,
    "urls": {
      "xml": "/api/nfe/nfe-123456789/xml",
      "pdf": "/api/nfe/nfe-123456789/pdf",
      "danfe": "/api/nfe/nfe-123456789/danfe"
    }
  }
}
```

### 2. Consulta de NFe

#### Consultar Status

```http
GET /api/nfe/{nfeId}/status
Authorization: Bearer {token}
X-Company-CNPJ: {cnpj}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "nfeId": "nfe-123456789",
    "status": "AUTORIZADA",
    "chaveAcesso": "41140411543862000187550010000000011234567890",
    "numeroProtocolo": "123456789012345",
    "dataEmissao": "2024-01-15T10:30:00Z",
    "dataProcessamento": "2024-01-15T10:31:00Z",
    "urls": {
      "xml": "/api/nfe/nfe-123456789/xml",
      "pdf": "/api/nfe/nfe-123456789/pdf",
      "danfe": "/api/nfe/nfe-123456789/danfe"
    }
  }
}
```

#### Consultar por Chave de Acesso

```http
POST /api/nfe/consulta
Authorization: Bearer {token}
X-Company-CNPJ: {cnpj}
Content-Type: application/json

{
  "chaveAcesso": "41140411543862000187550010000000011234567890"
}
```

#### Consultar por Número

```http
GET /api/nfe/consulta/numero/{numero}
Authorization: Bearer {token}
X-Company-CNPJ: {cnpj}
```

#### Consultar por Série

```http
GET /api/nfe/consulta/serie/{serie}
Authorization: Bearer {token}
X-Company-CNPJ: {cnpj}
```

### 3. Cancelamento de NFe

#### Cancelar NFe

```http
POST /api/nfe/{nfeId}/cancelar
Authorization: Bearer {token}
X-Company-CNPJ: {cnpj}
Content-Type: application/json

{
  "justificativa": "Erro na emissão da NFe"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "NFe cancelada com sucesso",
  "data": {
    "nfeId": "nfe-123456789",
    "status": "CANCELADA",
    "dataCancelamento": "2024-01-15T11:00:00Z",
    "justificativa": "Erro na emissão da NFe"
  }
}
```

### 4. Geração de Documentos

#### Obter XML

```http
GET /api/nfe/{nfeId}/xml
Authorization: Bearer {token}
X-Company-CNPJ: {cnpj}
```

**Resposta:** Arquivo XML da NFe

#### Obter PDF

```http
GET /api/nfe/{nfeId}/pdf
Authorization: Bearer {token}
X-Company-CNPJ: {cnpj}
```

**Resposta:** Arquivo PDF da NFe

#### Obter DANFE

```http
GET /api/nfe/{nfeId}/danfe
Authorization: Bearer {token}
X-Company-CNPJ: {cnpj}
```

**Resposta:** Arquivo PDF do DANFE

### 5. Listagem de NFe

#### Listar NFe por Empresa

```http
GET /api/nfe?page=0&size=10&sort=dataEmissao,desc
Authorization: Bearer {token}
X-Company-CNPJ: {cnpj}
```

**Query Parameters:**
- `page`: Número da página (padrão: 0)
- `size`: Tamanho da página (padrão: 10)
- `sort`: Campo para ordenação (padrão: dataEmissao,desc)
- `status`: Filtrar por status
- `dataInicio`: Data de início (ISO 8601)
- `dataFim`: Data de fim (ISO 8601)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "nfeId": "nfe-123456789",
        "status": "AUTORIZADA",
        "chaveAcesso": "41140411543862000187550010000000011234567890",
        "numero": 1,
        "serie": 32,
        "dataEmissao": "2024-01-15T10:30:00Z",
        "valorTotal": 100.00
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "sort": {
        "sorted": true,
        "unsorted": false
      }
    },
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  }
}
```

## 📊 Modelos de Dados

### NFeRequest

```json
{
  "serie": 32,
  "numero": 1,
  "ambiente": "HOMOLOGACAO",
  "emitente": {
    "cnpj": "11543862000187",
    "nome": "EMPRESA TESTE LTDA",
    "inscricaoEstadual": "9110691308",
    "endereco": {
      "logradouro": "Rua Teste",
      "numero": "123",
      "bairro": "Centro",
      "cidade": "Curitiba",
      "uf": "PR",
      "cep": "80000-000"
    }
  },
  "destinatario": {
    "cnpj": "11543862000187",
    "nome": "DESTINATARIO TESTE LTDA",
    "inscricaoEstadual": "9110691308",
    "endereco": {
      "logradouro": "Rua Destino",
      "numero": "456",
      "bairro": "Centro",
      "cidade": "Curitiba",
      "uf": "PR",
      "cep": "80000-000"
    }
  },
  "itens": [
    {
      "codigo": "001",
      "descricao": "Produto Teste",
      "quantidade": 1.0,
      "valorUnitario": 100.00,
      "valorTotal": 100.00,
      "unidadeComercial": "UN",
      "codigoNCM": "12345678"
    }
  ],
  "imposto": {
    "icmsCst": "102",
    "pisCst": "07",
    "cofinsCst": "07"
  },
  "responsavelTecnico": {
    "cnpj": "17642368000156",
    "nome": "Fabio Ieger",
    "email": "fabio@icertus.com.br",
    "telefone": "4136536993"
  }
}
```

### NFeResponse

```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": {
    "nfeId": "nfe-123456789",
    "status": "AUTORIZADA",
    "chaveAcesso": "41140411543862000187550010000000011234567890",
    "numeroProtocolo": "123456789012345",
    "dataEmissao": "2024-01-15T10:30:00Z",
    "dataProcessamento": "2024-01-15T10:31:00Z",
    "urls": {
      "xml": "/api/nfe/nfe-123456789/xml",
      "pdf": "/api/nfe/nfe-123456789/pdf",
      "danfe": "/api/nfe/nfe-123456789/danfe"
    }
  }
}
```

### NFeErrorResponse

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos fornecidos",
    "category": "CLIENT_ERROR",
    "details": [
      {
        "field": "emitente.cnpj",
        "message": "CNPJ inválido"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "traceId": "abc123def456"
  }
}
```

## ❌ Códigos de Erro

### Códigos HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Recurso não encontrado |
| 409 | Conflito |
| 422 | Entidade não processável |
| 429 | Muitas requisições |
| 500 | Erro interno do servidor |
| 502 | Bad Gateway |
| 503 | Serviço indisponível |

### Códigos de Erro da API

| Código | Descrição |
|--------|-----------|
| VALIDATION_ERROR | Erro de validação |
| AUTHENTICATION_ERROR | Erro de autenticação |
| AUTHORIZATION_ERROR | Erro de autorização |
| NOT_FOUND | Recurso não encontrado |
| CONFLICT | Conflito de dados |
| RATE_LIMIT_EXCEEDED | Limite de taxa excedido |
| SEFAZ_ERROR | Erro na comunicação com SEFAZ |
| CERTIFICATE_ERROR | Erro no certificado digital |
| QUEUE_ERROR | Erro na fila de processamento |
| INTERNAL_ERROR | Erro interno |

## 📝 Exemplos de Uso

### Exemplo Completo - Emissão de NFe

```bash
# 1. Fazer login
curl -X POST https://api.fenix.com.br/nfe/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "seu@email.com",
    "password": "sua_senha"
  }'

# 2. Emitir NFe
curl -X POST https://api.fenix.com.br/nfe/api/nfe/emitir \
  -H "Authorization: Bearer {token}" \
  -H "X-Company-CNPJ: 11543862000187" \
  -H "Content-Type: application/json" \
  -d '{
    "serie": 32,
    "numero": 1,
    "ambiente": "HOMOLOGACAO",
    "emitente": {
      "cnpj": "11543862000187",
      "nome": "EMPRESA TESTE LTDA",
      "inscricaoEstadual": "9110691308"
    },
    "destinatario": {
      "cnpj": "11543862000187",
      "nome": "DESTINATARIO TESTE LTDA",
      "inscricaoEstadual": "9110691308"
    },
    "itens": [
      {
        "codigo": "001",
        "descricao": "Produto Teste",
        "quantidade": 1.0,
        "valorUnitario": 100.00,
        "valorTotal": 100.00
      }
    ]
  }'

# 3. Consultar status
curl -X GET https://api.fenix.com.br/nfe/api/nfe/{nfeId}/status \
  -H "Authorization: Bearer {token}" \
  -H "X-Company-CNPJ: 11543862000187"

# 4. Obter XML
curl -X GET https://api.fenix.com.br/nfe/api/nfe/{nfeId}/xml \
  -H "Authorization: Bearer {token}" \
  -H "X-Company-CNPJ: 11543862000187"
```

### Exemplo com JavaScript

```javascript
const API_BASE = 'https://api.fenix.com.br/nfe';

// Função para fazer login
async function login(username, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  return data.data.accessToken;
}

// Função para emitir NFe
async function emitirNFe(token, cnpj, nfeData) {
  const response = await fetch(`${API_BASE}/api/nfe/emitir`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Company-CNPJ': cnpj,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nfeData)
  });
  
  return await response.json();
}

// Uso
(async () => {
  try {
    const token = await login('seu@email.com', 'sua_senha');
    
    const nfeData = {
      serie: 32,
      numero: 1,
      ambiente: 'HOMOLOGACAO',
      emitente: {
        cnpj: '11543862000187',
        nome: 'EMPRESA TESTE LTDA',
        inscricaoEstadual: '9110691308'
      },
      destinatario: {
        cnpj: '11543862000187',
        nome: 'DESTINATARIO TESTE LTDA',
        inscricaoEstadual: '9110691308'
      },
      itens: [{
        codigo: '001',
        descricao: 'Produto Teste',
        quantidade: 1.0,
        valorUnitario: 100.00,
        valorTotal: 100.00
      }]
    };
    
    const result = await emitirNFe(token, '11543862000187', nfeData);
    console.log('NFe emitida:', result);
  } catch (error) {
    console.error('Erro:', error);
  }
})();
```

## ⚡ Rate Limiting

A API implementa rate limiting para garantir estabilidade e performance:

- **Limite geral**: 100 requisições por minuto
- **Login**: 5 tentativas por minuto
- **Emissão de NFe**: 20 requisições por minuto
- **Consultas**: 50 requisições por minuto

### Headers de Rate Limiting

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

### Resposta quando limite excedido

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Limite de taxa excedido",
    "category": "CLIENT_ERROR",
    "retryAfter": 60
  }
}
```

## 🔗 Webhooks

A API suporta webhooks para notificações em tempo real:

### Configurar Webhook

```http
POST /api/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://seu-sistema.com/webhook/nfe",
  "events": ["nfe.autorizada", "nfe.cancelada", "nfe.erro"],
  "secret": "seu_secret_aqui"
}
```

### Eventos Disponíveis

- `nfe.autorizada`: NFe autorizada pela SEFAZ
- `nfe.cancelada`: NFe cancelada
- `nfe.erro`: Erro no processamento
- `nfe.processando`: NFe em processamento

### Payload do Webhook

```json
{
  "event": "nfe.autorizada",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "nfeId": "nfe-123456789",
    "status": "AUTORIZADA",
    "chaveAcesso": "41140411543862000187550010000000011234567890",
    "numeroProtocolo": "123456789012345"
  }
}
```

## 📋 Changelog

### v1.0.0 (2024-01-15)

#### ✨ Novas Funcionalidades
- Emissão de NFe com validação completa
- Consulta de status e informações
- Cancelamento de NFe
- Geração de XML, PDF e DANFE
- Suporte a Simples Nacional e regime normal
- Processamento assíncrono com filas
- Monitoramento e observabilidade
- Segurança com JWT e RBAC
- Escalabilidade com Kubernetes

#### 🔧 Melhorias
- Performance otimizada
- Validações aprimoradas
- Logs estruturados
- Métricas detalhadas
- Alertas automáticos

#### 🐛 Correções
- Correção de validações de CNPJ/CPF
- Correção de formatação de documentos
- Correção de timeouts
- Correção de retry logic

---

## 📞 Suporte

- **Email**: suporte@fenix.com.br
- **Documentação**: https://docs.fenix.com.br
- **Status**: https://status.fenix.com.br
- **GitHub**: https://github.com/fenix/nfe-api

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
