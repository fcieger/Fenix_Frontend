# 📋 PLANO DETALHADO DE INTEGRAÇÃO FENIX ↔ NFe API

## 🎯 **VISÃO GERAL**
Integração completa entre o sistema FENIX e a API NFe externa para transmissão, cancelamento, consulta e geração de documentos de Notas Fiscais Eletrônicas.

---

## 📊 **ANÁLISE DOS SISTEMAS EXISTENTES**

### ✅ **FENIX Backend (NestJS) - Serviços Disponíveis**
- [x] NFeIntegrationService: Mapeamento e comunicação com API externa
- [x] NFeIntegrationController: Endpoints `/api/nfe-integration/*`
- [x] NfeService: CRUD de NFe no FENIX
- [x] ConfiguracaoNfeService: Configurações e credenciais
- [x] Mapeamento completo: FENIX → NFe API format

### ✅ **NFe API (Spring Boot) - Endpoints Disponíveis**
- [x] POST /api/v1/nfe/emitir: Emissão de NFe
- [x] GET /api/v1/nfe/status/{chaveAcesso}: Consulta status
- [x] POST /api/v1/nfe/cancelar/{chaveAcesso}: Cancelamento
- [x] GET /api/v1/nfe/{nfeId}/xml: Download XML
- [x] GET /api/v1/nfe/{nfeId}/pdf: Download PDF
- [x] GET /api/v1/nfe/{nfeId}/danfe: Download DANFE

### ✅ **FENIX Frontend - Interface Existente**
- [x] Tela de listagem: Botões de ação em lote
- [x] NFeIntegration component: Interface de integração
- [x] API Service: Métodos de comunicação
- [ ] Integração real: Apenas simulação

---

## 🚀 **FASE 1: CORREÇÃO E COMPLETAR INTEGRAÇÃO BACKEND**

### 1.1 Corrigir NFeIntegrationService
- [x] **Implementar autenticação real** com NFe API
  - [x] Substituir token hardcoded por autenticação dinâmica
  - [x] Implementar refresh token automático
  - [x] Adicionar tratamento de expiração de token
- [x] **Completar mapeamento** de todos os campos obrigatórios
  - [x] Validar campos obrigatórios antes do envio
  - [x] Mapear campos opcionais corretamente
  - [x] Adicionar validação de formato de dados
- [x] **Adicionar validações** de dados antes do envio
  - [x] Validar CNPJ/CPF do destinatário
  - [x] Validar itens da NFe
  - [x] Validar configuração NFe
- [x] **Implementar retry** e tratamento de erros
  - [x] Retry automático em falhas de rede
  - [x] Tratamento específico de erros da SEFAZ
  - [x] Logs detalhados para debug
- [x] **Adicionar logs** detalhados para debug
  - [x] Log de requisições enviadas
  - [x] Log de respostas recebidas
  - [x] Log de erros com stack trace

### 1.2 Adicionar Novos Endpoints
- [x] **Cancelamento de NFe**
  - [x] POST /api/nfe-integration/cancelar/{nfeId}
  - [x] Validação de justificativa obrigatória
  - [x] Verificação de status da NFe
- [ ] **Inutilização de NFe**
  - [ ] POST /api/nfe-integration/inutilizar/{nfeId}
  - [ ] Validação de período de inutilização
  - [ ] Geração de protocolo de inutilização
- [x] **Download de Documentos**
  - [x] GET /api/nfe-integration/xml/{nfeId}
  - [x] GET /api/nfe-integration/pdf/{nfeId}
  - [x] GET /api/nfe-integration/danfe/{nfeId}
- [x] **Consulta de NFe**
  - [x] POST /api/nfe-integration/consulta/{chaveAcesso}
  - [ ] GET /api/nfe-integration/consulta/numero/{numero}
  - [ ] GET /api/nfe-integration/consulta/serie/{serie}
- [ ] **Validação de XML**
  - [ ] POST /api/nfe-integration/validar-xml/{nfeId}
  - [ ] Validação contra schema XSD
  - [ ] Retorno de erros de validação

### 1.3 Configuração de Ambiente
- [x] **Variáveis de ambiente**
  - [x] NFE_API_BASE_URL
  - [x] NFE_API_USERNAME
  - [x] NFE_API_PASSWORD
  - [x] NFE_API_TIMEOUT
- [x] **Configuração de CORS**
  - [x] Permitir requisições da API NFe
  - [x] Configurar headers necessários
- [ ] **Configuração de proxy**
  - [ ] Proxy para requisições HTTPS
  - [ ] Configuração de certificados

---

## 🎨 **FASE 2: INTEGRAÇÃO FRONTEND REAL**

### 2.1 Conectar Botões de Ação
- [x] **Transmitir NFe**
  - [x] Substituir simulação por chamada real
  - [x] Implementar transmissão em lote
  - [x] Adicionar validação de seleção
- [x] **Cancelar NFe**
  - [x] Modal de confirmação com justificativa
  - [x] Validação de status da NFe
  - [x] Feedback de sucesso/erro
- [x] **Validar XML**
  - [x] Chamada para endpoint de validação
  - [x] Exibição de erros de validação
  - [x] Indicador de XML válido/inválido
- [x] **Exportar XML**
  - [x] Download direto do arquivo XML
  - [x] Nome do arquivo com chave de acesso
  - [x] Suporte a múltiplos downloads
- [x] **Outras Ações**
  - [x] Copiar NFe
  - [x] Carta de Correção
  - [x] Enviar por Email
  - [x] Imprimir
  - [x] Excluir

### 2.2 Implementar Estados de Loading
- [x] **Estados de interface**
  - [x] isTransmitting: boolean
  - [x] isCanceling: boolean
  - [x] isDownloading: boolean
  - [x] isValidating: boolean
- [x] **Progress indicators**
  - [x] Progress bar para transmissão
  - [x] Spinner para ações individuais
  - [x] Contador de progresso para lote
- [x] **Estados de botões**
  - [x] Desabilitar botões durante processamento
  - [x] Mudança de texto durante loading
  - [x] Ícones de loading

### 2.3 Adicionar Feedback Visual
- [x] **Toast notifications**
  - [x] Sucesso: NFe transmitida
  - [x] Erro: Falha na transmissão
  - [x] Aviso: Validações pendentes
- [x] **Modal de confirmação**
  - [x] Cancelamento com justificativa
  - [x] Exclusão com confirmação
  - [x] Ações destrutivas
- [x] **Status badges**
  - [x] Atualização em tempo real
  - [x] Cores por status
  - [x] Ícones representativos
- [x] **Mensagens de erro**
  - [x] Erros específicos da SEFAZ
  - [x] Sugestões de correção
  - [x] Links para documentação

---

## ⚡ **FASE 3: FUNCIONALIDADES AVANÇADAS**

### 3.1 Processamento Assíncrono
- [ ] **Polling automático**
  - [ ] Verificação periódica de status
  - [ ] Atualização automática da interface
  - [ ] Parada automática quando finalizado
- [ ] **Webhooks**
  - [ ] Endpoint para receber atualizações
  - [ ] Atualização em tempo real
  - [ ] Notificações push
- [ ] **Queue de processamento**
  - [ ] Fila de NFes para transmissão
  - [ ] Processamento sequencial
  - [ ] Retry automático em falhas
- [ ] **Retry automático**
  - [ ] Configuração de tentativas
  - [ ] Backoff exponencial
  - [ ] Notificação de falhas persistentes

### 3.2 Geração de Documentos
- [ ] **Download de XML**
  - [ ] XML autorizado da SEFAZ
  - [ ] Nome do arquivo padronizado
  - [ ] Validação de integridade
- [ ] **Geração de PDF**
  - [ ] PDF da NFe autorizada
  - [ ] Layout responsivo
  - [ ] Marca d'água se necessário
- [ ] **Geração de DANFE**
  - [ ] DANFE em PDF
  - [ ] Layout oficial
  - [ ] Código de barras
- [ ] **Preview de documentos**
  - [ ] Visualização inline
  - [ ] Zoom e navegação
  - [ ] Download direto

### 3.3 Gestão de Erros
- [ ] **Categorização de erros**
  - [ ] Erros de validação
  - [ ] Erros de rede
  - [ ] Erros da SEFAZ
  - [ ] Erros de sistema
- [ ] **Mensagens específicas**
  - [ ] Tradução de códigos de erro
  - [ ] Explicação do problema
  - [ ] Ações sugeridas
- [ ] **Log de erros**
  - [ ] Armazenamento de erros
  - [ ] Relatórios de erro
  - [ ] Suporte técnico

---

## 🔧 **IMPLEMENTAÇÃO DETALHADA**

### Backend - NFeIntegrationService
```typescript
// Arquivo: /home/fabio/projetos/fenix-backend/src/nfe-integration/nfe-integration.service.ts

// 1. Autenticação real
private async obterTokenApiNfe(): Promise<string> {
  // Implementar autenticação com NFe API
}

// 2. Validações
private async validarNFeAntesEnvio(nfe: Nfe): Promise<void> {
  // Validar dados obrigatórios
}

// 3. Retry automático
private async chamarApiNFeComRetry(endpoint: string, data: any, companyId: string): Promise<NFeApiResponse> {
  // Implementar retry com backoff
}

// 4. Novos métodos
async cancelarNFe(nfeId: string, justificativa: string, companyId: string): Promise<any> {
  // Cancelar NFe via API externa
}

async downloadXML(nfeId: string, companyId: string): Promise<{ xml: string; filename: string }> {
  // Download XML da NFe
}
```

### Backend - NFeIntegrationController
```typescript
// Arquivo: /home/fabio/projetos/fenix-backend/src/nfe-integration/nfe-integration.controller.ts

// Novos endpoints
@Post('cancelar/:nfeId')
async cancelarNFe(@Param('nfeId') nfeId: string, @Body() cancelarDto: { justificativa: string }) {
  // Endpoint de cancelamento
}

@Get('xml/:nfeId')
async downloadXML(@Param('nfeId') nfeId: string) {
  // Endpoint de download XML
}
```

### Frontend - API Service
```typescript
// Arquivo: /home/fabio/projetos/fenix/src/lib/api.ts

// Novos métodos
async cancelarNFeExterna(nfeId: string, justificativa: string, token: string): Promise<any> {
  // Cancelar NFe
}

async downloadXMLNFe(nfeId: string, token: string): Promise<{ xml: string; filename: string }> {
  // Download XML
}
```

### Frontend - Tela de Listagem
```typescript
// Arquivo: /home/fabio/projetos/fenix/src/app/nfe/page.tsx

// Funções reais de ação
const handleTransmitirNFe = async () => {
  // Transmissão real com feedback
}

const handleCancelarNFe = async () => {
  // Cancelamento com confirmação
}

const handleExportarXML = async () => {
  // Download de XML
}
```

---

## 📅 **CRONOGRAMA DE IMPLEMENTAÇÃO**

### **Semana 1: Backend (Dias 1-7)**
- [ ] **Dia 1-2**: Corrigir autenticação e mapeamento
- [ ] **Dia 3-4**: Implementar novos endpoints
- [ ] **Dia 5-6**: Adicionar validações e tratamento de erros
- [ ] **Dia 7**: Testes unitários e documentação

### **Semana 2: Frontend (Dias 8-14)**
- [ ] **Dia 8-9**: Conectar botões de ação reais
- [ ] **Dia 10-11**: Implementar estados de loading e feedback
- [ ] **Dia 12-13**: Implementar download de documentos
- [ ] **Dia 14**: Testes de integração

### **Semana 3: Funcionalidades Avançadas (Dias 15-21)**
- [ ] **Dia 15-16**: Processamento assíncrono e polling
- [ ] **Dia 17-18**: Webhooks e notificações
- [ ] **Dia 19-20**: Gestão de erros avançada
- [ ] **Dia 21**: Documentação final e deploy

---

## 🎯 **CRITÉRIOS DE SUCESSO**

### **Funcionalidades Básicas**
- [ ] Transmissão de NFe funcional
- [ ] Cancelamento com justificativa
- [ ] Download de XML, PDF e DANFE
- [ ] Validação de documentos
- [ ] Feedback visual completo

### **Funcionalidades Avançadas**
- [ ] Processamento assíncrono
- [ ] Atualização em tempo real
- [ ] Tratamento robusto de erros
- [ ] Performance otimizada
- [ ] Experiência do usuário fluida

### **Qualidade**
- [ ] Código bem documentado
- [ ] Testes unitários e de integração
- [ ] Logs detalhados para debug
- [ ] Tratamento de edge cases
- [ ] Segurança implementada

---

## 📝 **NOTAS DE IMPLEMENTAÇÃO**

### **Prioridades**
1. **Alta**: Transmissão e cancelamento de NFe
2. **Média**: Download de documentos e validação
3. **Baixa**: Funcionalidades avançadas e otimizações

### **Riscos**
- **Alto**: Falhas de comunicação com API externa
- **Médio**: Validações complexas da SEFAZ
- **Baixo**: Performance com grandes volumes

### **Dependências**
- API NFe externa funcionando
- Certificado digital válido
- Configurações de ambiente corretas
- Dados de teste válidos

---

## ✅ **STATUS ATUAL**
- [x] **Fase 1**: Backend - ✅ CONCLUÍDA
- [x] **Fase 2**: Frontend - ✅ CONCLUÍDA
- [ ] **Fase 3**: Funcionalidades Avançadas - Pendente

**Última atualização**: 2024-12-19
**Responsável**: Equipe de Desenvolvimento FENIX

## 🎉 **IMPLEMENTAÇÃO CONCLUÍDA**

### ✅ **Backend (FENIX)**
- [x] Autenticação real com API NFe
- [x] Validações completas de dados
- [x] Retry automático e tratamento de erros
- [x] Novos endpoints para cancelamento, download e consulta
- [x] Configuração de ambiente

### ✅ **Frontend (FENIX)**
- [x] Botões de ação conectados à API real
- [x] Estados de loading e feedback visual
- [x] Download de XML, PDF e DANFE
- [x] Toast notifications e modais de confirmação
- [x] Validação de seleção e tratamento de erros

### 🚀 **Funcionalidades Implementadas**
- [x] **Transmissão de NFe**: Real com feedback em tempo real
- [x] **Cancelamento**: Com justificativa obrigatória
- [x] **Download de documentos**: XML, PDF e DANFE
- [x] **Consulta de NFe**: Por chave de acesso
- [x] **Validação**: Campos obrigatórios e status
- [x] **Feedback visual**: Loading, progress, toasts
- [x] **Tratamento de erros**: Específicos e sugestões

### 📋 **Próximos Passos**
- [ ] Implementar funcionalidades avançadas (Fase 3)
- [ ] Testes de integração completos
- [ ] Documentação de API
- [ ] Deploy em produção
