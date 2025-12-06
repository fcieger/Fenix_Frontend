# 🚀 Setup Inicial - FENIX ERP

Este documento contém todas as informações necessárias para configurar e inicializar o banco de dados do sistema Fenix ERP.

---

## 📋 Inicialização do Banco de Dados

### 🚀 Comando Único - Atualização Automática Completa

Execute este comando para criar/atualizar **TODAS** as tabelas do sistema no Neon:

#### Via Navegador:
```
https://fenixfrontendatual.vercel.app/api/init-db
```

#### Via cURL:
```bash
curl -X POST https://fenixfrontendatual.vercel.app/api/init-db
```

#### Via JavaScript/TypeScript:
```javascript
fetch('https://fenixfrontendatual.vercel.app/api/init-db', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(res => res.json())
.then(data => console.log('✅ Tabelas criadas:', data));
```

---

## 📋 Tabelas que serão criadas:

### 1. Tabelas Core (Essenciais):
- ✅ `users` - Usuários do sistema
- ✅ `companies` - Empresas cadastradas
- ✅ `user_companies` - Relacionamento usuário-empresa

### 2. Cadastros:
- ✅ `cadastros` - Clientes, fornecedores, transportadoras

### 3. Produtos:
- ✅ `produtos` - Produtos cadastrados

### 4. Fiscal:
- ✅ `natureza_operacao` - Naturezas de operação
- ✅ `formas_pagamento` - Formas de pagamento
- ✅ `prazos_pagamento` - Prazos de pagamento
- ✅ `configuracoes_nfe` - Configurações de NFe
- ✅ `certificados` - Certificados digitais
- ✅ `nfe` - Notas fiscais eletrônicas

### 5. Orçamentos:
- ✅ `orcamentos` - Cabeçalho de orçamentos
- ✅ `orcamento_itens` - Itens de orçamentos

### 6. Pedidos de Venda:
- ✅ `pedidos_venda` - Cabeçalho de pedidos
- ✅ `pedidos_venda_itens` - Itens de pedidos

### 7. Financeiro:
- ✅ `contas_financeiras` - Contas bancárias
- ✅ `movimentacoes_financeiras` - Movimentações financeiras
- ✅ `centros_custos` - Centros de custo
- ✅ `contas_receber` - Contas a receber
- ✅ `parcelas_contas_receber` - Parcelas de contas a receber

### 8. Estoque:
- ✅ `locais_estoque` - Locais de estoque
- ✅ `estoque_movimentos` - Movimentações de estoque
- ✅ `estoque_saldos` - Saldos de estoque
- ✅ `estoque_inventarios` - Inventários
- ✅ `estoque_inventarios_itens` - Itens de inventário

### 9. Outros:
- ✅ `historico_eventos` - Histórico de eventos
- ✅ `_migrations` - Controle de migrações

---

## ✅ Resposta Esperada:

```json
{
  "success": true,
  "message": "Banco de dados inicializado COMPLETAMENTE com sucesso!",
  "tablesCreated": 30,
  "tables": [
    "_migrations",
    "cadastros",
    "certificados",
    "companies",
    "configuracoes_nfe",
    "contas_financeiras",
    "contas_receber",
    "estoque_inventarios",
    "estoque_inventarios_itens",
    "estoque_movimentos",
    "estoque_saldos",
    "formas_pagamento",
    "historico_eventos",
    "locais_estoque",
    "movimentacoes_financeiras",
    "natureza_operacao",
    "nfe",
    "orcamento_itens",
    "orcamentos",
    "parcelas_contas_receber",
    "pedidos_venda",
    "pedidos_venda_itens",
    "prazos_pagamento",
    "produtos",
    "user_companies",
    "users"
  ]
}
```

---

## 🔄 Inicialização Automática no Neon

O sistema agora cria automaticamente as tabelas necessárias quando você faz login ou acessa qualquer endpoint que use o banco.

### Opção 1: Inicialização Automática (Recomendado)

As tabelas são criadas automaticamente quando você:
1. Faz login pela primeira vez
2. Acessa qualquer endpoint que use o banco

O sistema verifica se as tabelas existem e as cria se necessário.

### Opção 2: Inicialização Manual via API

Você pode chamar o endpoint de inicialização manualmente (veja comandos acima).

---

## ⚙️ Configuração do DATABASE_URL no Frontend Vercel

### ⚠️ IMPORTANTE: Configurar DATABASE_URL no Frontend Vercel

O endpoint `/api/init-db` precisa da variável `DATABASE_URL` configurada no painel da Vercel para o projeto **Frontend**.

### Passos:

1. **Acesse o painel da Vercel**: https://vercel.com/dashboard

2. **Selecione o projeto**: `fenixfrontendatual` (ou o nome do seu projeto frontend)

3. **Vá em Settings → Environment Variables**

4. **Adicione a variável**:
   ```
   Key: DATABASE_URL
   Value: postgresql://neondb_owner:npg_YjvLSX3d8JNM@ep-silent-mouse-ahjow0rn-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   Environment: Production, Preview, Development
   ```

5. **Salve** e aguarde o redeploy automático (2-3 minutos)

### ✅ Verificar se está configurado:

Após configurar, teste novamente:

```bash
curl -X POST https://fenixfrontendatual.vercel.app/api/init-db
```

Agora deve conectar ao Neon corretamente!

### 📝 Nota

- O **Backend** já tem a `DATABASE_URL` configurada ✅
- O **Frontend** também precisa ter para o endpoint `/api/init-db` funcionar ✅

Após configurar, ambos os endpoints funcionarão:
- Frontend: `https://fenixfrontendatual.vercel.app/api/init-db`
- Backend: `https://fenix-backend.vercel.app/api/init-db`

---

## 🐛 Troubleshooting

### Se o comando falhar:

1. **Verifique os logs da Vercel**:
   - https://vercel.com/dashboard → Functions → Logs

2. **Verifique a conexão com o Neon**:
   - Certifique-se de que `DATABASE_URL` está configurada
   - Verifique se o Neon está acessível

3. **Erros comuns**:
   - "already exists" - Tabela já existe (ignorado automaticamente)
   - "permission denied" - Verifique permissões no Neon
   - "connection refused" - Verifique DATABASE_URL

### Erro comum: "permission denied for extension"

Se você receber esse erro, não se preocupe! As extensões já devem estar instaladas no Neon. O código trata esse erro graciosamente e continua a criação das tabelas.

---

## ✅ Verificação

Após inicializar, você pode verificar se as tabelas foram criadas:

```sql
-- No console do Neon (https://console.neon.tech)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver todas as tabelas listadas acima.

---

## 🎯 Próximos Passos

1. ✅ Inicializar o banco (automático ou manual)
2. ✅ Fazer login e criar um usuário
3. ✅ Cadastrar uma empresa
4. ✅ Começar a usar o sistema!

---

## 📝 Nota

Este comando é **idempotente** - pode ser executado múltiplas vezes sem problemas. Ele ignora erros de tabelas já existentes e apenas cria as que faltam.

---

**Última atualização**: 2024-12-24
**Status**: ✅ Funcional



