# 🚀 INSTALAÇÃO DO CHAT IA - PASSO A PASSO

## 📦 **DEPENDÊNCIAS NECESSÁRIAS**

### **Backend (NestJS)**

O Chat IA precisa do SDK oficial da OpenAI:

```bash
cd /home/fabio/projetos/fenix-backend
npm install openai
```

**Versão recomendada:** `openai@^4.0.0`

---

## 🔑 **CONFIGURAÇÃO DA API KEY**

### **1. Obter Chave da OpenAI**

1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em **"Create new secret key"**
4. **Nome:** "Fenix ERP Chat"
5. Copie a chave (formato: `sk-proj-...`)
6. **⚠️ IMPORTANTE:** Salve em local seguro! Não será mostrada novamente

### **2. Configurar no Backend**

**Opção 1 - Variável de Ambiente (Recomendado):**

Edite o arquivo de inicialização do backend:

```bash
nano /home/fabio/projetos/fenix-backend/start-backend-native.sh
```

Adicione a linha:
```bash
export OPENAI_API_KEY="sk-proj-sua-chave-aqui"
```

**Opção 2 - Arquivo .env:**

Crie ou edite `.env` no backend:
```bash
cd /home/fabio/projetos/fenix-backend
nano .env
```

Adicione:
```bash
OPENAI_API_KEY=sk-proj-sua-chave-aqui
```

**Opção 3 - Export temporário (teste):**
```bash
export OPENAI_API_KEY="sk-proj-sua-chave-aqui"
cd /home/fabio/projetos/fenix-backend
npm run start:dev
```

---

## 🗄️ **CRIAR TABELA NO BANCO DE DADOS**

Execute o SQL no PostgreSQL para criar a tabela de mensagens:

```sql
-- Conectar ao banco
psql -U postgres -d fenix

-- Criar tabela
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "companyId" UUID,
  "userMessage" TEXT NOT NULL,
  "aiResponse" TEXT NOT NULL,
  context JSONB,
  model VARCHAR(50) DEFAULT 'gpt-4o-mini',
  "tokensUsed" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_chat_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_company FOREIGN KEY ("companyId") REFERENCES companies(id) ON DELETE SET NULL
);

-- Criar índices para performance
CREATE INDEX idx_chat_messages_userId ON chat_messages("userId");
CREATE INDEX idx_chat_messages_companyId ON chat_messages("companyId");
CREATE INDEX idx_chat_messages_createdAt ON chat_messages("createdAt" DESC);

-- Verificar se foi criada
\dt chat_messages
```

**Ou usando Docker:**
```bash
docker exec -i fenix-db psql -U postgres -d fenix << EOF
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "companyId" UUID,
  "userMessage" TEXT NOT NULL,
  "aiResponse" TEXT NOT NULL,
  context JSONB,
  model VARCHAR(50) DEFAULT 'gpt-4o-mini',
  "tokensUsed" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_chat_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_company FOREIGN KEY ("companyId") REFERENCES companies(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_userId ON chat_messages("userId");
CREATE INDEX IF NOT EXISTS idx_chat_messages_companyId ON chat_messages("companyId");
CREATE INDEX IF NOT EXISTS idx_chat_messages_createdAt ON chat_messages("createdAt" DESC);
EOF
```

---

## ✅ **INICIAR O SISTEMA**

### **1. Iniciar Backend**

```bash
cd /home/fabio/projetos/fenix-backend
npm run start:dev
```

**Verificar logs:**
- ✅ Sucesso: `✅ OpenAI inicializada com sucesso`
- ❌ Erro: `⚠️ OPENAI_API_KEY não configurada. Chat IA não funcionará.`

### **2. Iniciar Frontend**

```bash
cd /home/fabio/projetos/fenix
npm run dev:3004
```

### **3. Acessar o Chat**

Abra o navegador em: http://localhost:3004/chat

---

## 🧪 **TESTAR INSTALAÇÃO**

### **Teste 1 - Verificar API Key**

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-proj-sua-chave-aqui"
```

**Resposta esperada:** Lista de modelos disponíveis

### **Teste 2 - Testar Endpoint do Chat**

```bash
# 1. Fazer login e pegar token
TOKEN="seu-jwt-token-aqui"

# 2. Enviar mensagem teste
curl -X POST http://localhost:3001/api/chat/message \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá! Você está funcionando?"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "message": "Olá! Sim, estou funcionando...",
    "tokensUsed": 50
  }
}
```

### **Teste 3 - Interface do Chat**

1. Acesse: http://localhost:3004/chat
2. Digite: "Olá, tudo bem?"
3. Aguarde resposta (2-5 segundos)
4. Verifique histórico

---

## 🐛 **TROUBLESHOOTING**

### **Erro: "Module 'openai' not found"**

**Solução:**
```bash
cd /home/fabio/projetos/fenix-backend
npm install openai
npm run start:dev
```

### **Erro: "OPENAI_API_KEY não configurada"**

**Solução:**
1. Verifique se exportou a variável
2. Reinicie o backend
3. Confirme com: `echo $OPENAI_API_KEY`

### **Erro: "Invalid API key"**

**Solução:**
1. Verifique se a chave está correta
2. Confirme que começa com `sk-proj-` ou `sk-`
3. Gere nova chave em: https://platform.openai.com/api-keys

### **Erro: "Tabela chat_messages não existe"**

**Solução:**
```bash
# Execute o SQL de criação da tabela
psql -U postgres -d fenix -f criar-tabela-chat.sql
```

### **Erro: "Rate limit exceeded"**

**Solução:**
- Aguarde 1 minuto
- Você atingiu o limite de requisições
- Upgrade do plano OpenAI se necessário

### **Erro: "Insufficient quota"**

**Solução:**
- Sua conta OpenAI está sem créditos
- Adicione saldo em: https://platform.openai.com/settings/organization/billing

---

## 💰 **CUSTOS ESTIMADOS**

### **Modelo: gpt-4o-mini**
- Input: $0.15 por 1M tokens
- Output: $0.60 por 1M tokens

### **Estimativa de uso:**
- 1 mensagem = ~500 tokens = $0.0004
- 100 mensagens/dia = ~$0.04/dia = ~$1.20/mês
- 1000 mensagens/dia = ~$0.40/dia = ~$12/mês

### **Créditos iniciais:**
- Novas contas recebem $5 de crédito grátis
- Válido por 3 meses
- Suficiente para ~12.500 mensagens

---

## 📊 **MONITORAMENTO DE USO**

### **Dashboard OpenAI:**
- Acesse: https://platform.openai.com/usage
- Veja consumo diário
- Configure alertas de gastos
- Defina limites mensais

### **Logs do Backend:**
```bash
# Ver logs do chat
grep "💬 Chat:" logs/app.log

# Ver tokens consumidos
grep "tokens:" logs/app.log

# Ver erros
grep "❌ Erro" logs/app.log
```

---

## 🔒 **SEGURANÇA**

### **Boas Práticas:**

1. **Nunca commite a API Key**
```bash
# Adicione no .gitignore
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
```

2. **Use variáveis de ambiente**
```bash
# Não hardcode no código
# ❌ const apiKey = "sk-proj-123..."
# ✅ const apiKey = process.env.OPENAI_API_KEY
```

3. **Limite de gastos**
- Configure em: https://platform.openai.com/settings/organization/limits
- Recomendado: $50/mês para início

4. **Rotação de chaves**
- Troque a API key a cada 3 meses
- Desative chaves antigas

---

## 🎯 **CHECKLIST DE INSTALAÇÃO**

- [ ] Instalado pacote `openai` no backend
- [ ] Obtida API Key da OpenAI
- [ ] Configurada variável `OPENAI_API_KEY`
- [ ] Criada tabela `chat_messages` no banco
- [ ] Backend iniciado com sucesso
- [ ] Frontend iniciado
- [ ] Testada mensagem no chat
- [ ] Verificado histórico salvando
- [ ] Configurado limite de gastos na OpenAI

---

## 📚 **RECURSOS ADICIONAIS**

- [Documentação OpenAI](https://platform.openai.com/docs)
- [Pricing OpenAI](https://openai.com/api/pricing/)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

---

## 🆘 **SUPORTE**

Se precisar de ajuda:

1. Verifique os logs: `npm run start:dev`
2. Teste a API Key: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`
3. Confirme a tabela: `psql -U postgres -d fenix -c "\dt chat_messages"`

---

**Última atualização:** 2024-11-12  
**Versão do Chat IA:** 1.0.0  
**OpenAI SDK:** 4.x


