# 🤖 CHAT IA - ASSISTENTE INTELIGENTE FENIX ERP

## 📋 **VISÃO GERAL**

O **Chat IA** é um assistente inteligente integrado ao Fenix ERP que usa a **OpenAI GPT-4** para ajudar empresários com dúvidas, análises e orientações sobre o negócio.

---

## ✨ **FUNCIONALIDADES**

### **1. Conversação Natural**
- 💬 Chat em tempo real com IA
- 🧠 Contexto de conversas anteriores
- 📝 Histórico salvo no banco de dados
- 🔄 Interface moderna e responsiva

### **2. Assistência Especializada**
O Chat IA pode ajudar com:
- 💰 **Finanças**: fluxo de caixa, contas, análises
- 📦 **Estoque**: produtos em falta, movimentações
- 💼 **Vendas**: relatórios, desempenho, oportunidades
- 🧾 **Fiscal**: NFe, impostos, obrigações
- 🎯 **Licitações**: matches, oportunidades
- 💳 **Crédito**: análises, propostas
- 📊 **Relatórios**: análise de dados

### **3. Recursos Técnicos**
- ✅ Integração com OpenAI GPT-4o-mini (rápido e econômico)
- ✅ Histórico persistente por usuário
- ✅ Contexto das últimas 5 mensagens
- ✅ Contador de tokens usado
- ✅ Sugestões de perguntas
- ✅ Limpeza de histórico

---

## 🚀 **INSTALAÇÃO**

### **1. Obter API Key da OpenAI**

1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em **"Create new secret key"**
4. Copie a chave (começa com `sk-`)
5. **IMPORTANTE**: Guarde em local seguro, não será mostrada novamente

### **2. Configurar no Backend**

**Opção A - Arquivo `.env` (Desenvolvimento):**
```bash
# Backend: /home/fabio/projetos/fenix-backend/.env
OPENAI_API_KEY=sk-sua-chave-aqui
```

**Opção B - Export no terminal (Temporário):**
```bash
export OPENAI_API_KEY="sk-sua-chave-aqui"
```

**Opção C - Script de inicialização (Recomendado):**
Edite o script `start-backend-native.sh`:
```bash
export OPENAI_API_KEY="sk-sua-chave-aqui"
npm run start:dev
```

### **3. Verificar Configuração**

Ao iniciar o backend, você deve ver:
```
✅ OpenAI inicializada com sucesso
```

Se não configurada, verá:
```
⚠️ OPENAI_API_KEY não configurada. Chat IA não funcionará.
```

---

## 📂 **ESTRUTURA DE ARQUIVOS**

### **Backend (NestJS)**
```
src/chat/
├── chat.module.ts              # Módulo do chat
├── chat.controller.ts          # Endpoints da API
├── chat.service.ts             # Lógica de integração OpenAI
├── dto/
│   └── send-message.dto.ts     # DTOs de requisição
└── entities/
    └── chat-message.entity.ts  # Entidade do banco de dados
```

### **Frontend (Next.js)**
```
src/
├── app/chat/
│   └── page.tsx                # Página do chat
└── services/
    └── chat-service.ts         # Service de comunicação com API
```

---

## 🗄️ **BANCO DE DADOS**

### **Tabela: chat_messages**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL,
  companyId UUID,
  userMessage TEXT NOT NULL,
  aiResponse TEXT NOT NULL,
  context JSONB,
  model VARCHAR(50) DEFAULT 'gpt-4o-mini',
  tokensUsed INTEGER,
  createdAt TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (companyId) REFERENCES companies(id)
);

-- Índices para performance
CREATE INDEX idx_chat_messages_userId ON chat_messages(userId);
CREATE INDEX idx_chat_messages_companyId ON chat_messages(companyId);
CREATE INDEX idx_chat_messages_createdAt ON chat_messages(createdAt DESC);
```

---

## 🌐 **API ENDPOINTS**

### **1. POST /api/chat/message**
Envia mensagem e recebe resposta da IA

**Request:**
```json
{
  "message": "Como está meu fluxo de caixa?",
  "context": [
    { "role": "user", "content": "Olá" },
    { "role": "assistant", "content": "Olá! Como posso ajudar?" }
  ],
  "companyId": "uuid-da-empresa"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Seu fluxo de caixa está...",
    "tokensUsed": 234
  }
}
```

### **2. GET /api/chat/history**
Busca histórico de conversas

**Query Params:**
- `companyId` (opcional)
- `limit` (opcional, padrão: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userMessage": "Como está meu estoque?",
      "aiResponse": "Seu estoque tem...",
      "createdAt": "2024-11-12T10:30:00Z",
      "tokensUsed": 156
    }
  ]
}
```

### **3. DELETE /api/chat/history**
Limpa histórico de conversas

**Query Params:**
- `companyId` (opcional)

**Response:**
```json
{
  "success": true,
  "message": "Histórico limpo com sucesso"
}
```

---

## 💡 **EXEMPLOS DE USO**

### **Perguntas Sugeridas:**

**Financeiro:**
- "Como está meu fluxo de caixa este mês?"
- "Quais contas vou pagar esta semana?"
- "Mostre um resumo financeiro"

**Vendas:**
- "Quais foram minhas vendas hoje?"
- "Qual meu produto mais vendido?"
- "Como está meu desempenho de vendas?"

**Estoque:**
- "Quais produtos estão em falta?"
- "Preciso repor algum estoque?"
- "Mostre movimentações de hoje"

**NFe:**
- "Como emitir uma nota fiscal?"
- "Quantas NFe emiti este mês?"
- "Tenho NFe com erro?"

**Licitações:**
- "Tem novas licitações para mim?"
- "Quais licitações combinam com meu negócio?"
- "Como participar de licitações?"

**Crédito:**
- "Tenho crédito pré-aprovado?"
- "Como solicitar crédito?"
- "Qual melhor opção de crédito?"

---

## 💰 **CUSTOS E OTIMIZAÇÕES**

### **Modelo Usado: gpt-4o-mini**
- ✅ Mais rápido que GPT-4
- ✅ 60% mais barato
- ✅ Excelente qualidade
- ✅ Ideal para chat

### **Preços Aproximados (OpenAI):**
- **Input**: $0.15 por 1M tokens
- **Output**: $0.60 por 1M tokens
- **Média por mensagem**: ~500 tokens = $0.0004 (menos de 1 centavo)

### **Otimizações Implementadas:**
1. ✅ Contexto limitado às últimas 5 mensagens
2. ✅ Max tokens: 1000 (respostas concisas)
3. ✅ Temperature: 0.7 (equilíbrio)
4. ✅ Modelo econômico (gpt-4o-mini)

### **Estimativa de Uso:**
- 100 mensagens/dia = ~$0.04/dia = ~$1.20/mês
- 1000 mensagens/dia = ~$0.40/dia = ~$12/mês

---

## 🔒 **SEGURANÇA**

### **Boas Práticas:**
1. ✅ API Key nunca no frontend
2. ✅ Autenticação JWT obrigatória
3. ✅ Histórico isolado por usuário
4. ✅ Rate limiting (implementar no futuro)
5. ✅ Logs de uso

### **Dados Enviados:**
- ❌ **NÃO** enviamos dados sensíveis para OpenAI
- ✅ Apenas contexto textual necessário
- ✅ Sem senhas, tokens, ou informações bancárias
- ✅ Histórico armazenado localmente (PostgreSQL)

---

## 🐛 **TROUBLESHOOTING**

### **Erro: "OpenAI não configurada"**
**Solução:** Configure a variável `OPENAI_API_KEY`

### **Erro: "Chave da OpenAI inválida"**
**Solução:** Verifique se a chave está correta (começa com `sk-`)

### **Erro: "Rate limit exceeded"**
**Solução:** Aguarde alguns minutos. Você atingiu o limite da API.

### **Erro: "Insufficient quota"**
**Solução:** Sua conta OpenAI está sem créditos. Adicione saldo.

### **Chat lento:**
**Solução:** Normal. GPT-4o-mini leva 2-5 segundos. Para melhorar:
- Use gpt-3.5-turbo (mais rápido, menos preciso)
- Reduza max_tokens

---

## 📊 **MONITORAMENTO**

### **Logs no Backend:**
```bash
💬 Chat: usuário abc-123 - tokens: 456
🗑️ Histórico limpo para usuário abc-123
❌ Erro ao enviar mensagem para OpenAI: ...
```

### **Métricas para Acompanhar:**
- Total de mensagens enviadas
- Tokens consumidos por dia/mês
- Usuários mais ativos
- Erros de API
- Tempo de resposta médio

---

## 📝 **CHANGELOG**

### **v1.0.0 - 2024-11-12**
- ✅ Implementação inicial
- ✅ Integração com OpenAI GPT-4o-mini
- ✅ Histórico persistente
- ✅ Interface de chat moderna
- ✅ Endpoints RESTful
- ✅ Contexto de conversas
- ✅ Menu no Sidebar

---

## 📞 **SUPORTE**

Para dúvidas ou problemas:
1. Verifique os logs do backend
2. Confirme a configuração da API Key
3. Teste com curl:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

**Desenvolvido com ❤️ para Fenix ERP**
**Versão:** 1.0.0
**Data:** 2024-11-12






