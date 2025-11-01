# 🗄️ Como Inicializar o Banco de Dados no Neon

## ✅ Solução Implementada

O sistema agora cria automaticamente as tabelas necessárias quando você faz login ou acessa qualquer endpoint que use o banco.

## 🚀 Opção 1: Inicialização Automática (Recomendado)

As tabelas são criadas automaticamente quando você:
1. Faz login pela primeira vez
2. Acessa qualquer endpoint que use o banco

O sistema verifica se as tabelas existem e as cria se necessário.

## 🔧 Opção 2: Inicialização Manual via API

Você pode chamar o endpoint de inicialização manualmente:

```bash
# Acesse via navegador ou curl:
https://fenixfrontendatual.vercel.app/api/init-db

# Ou via curl:
curl -X POST https://fenixfrontendatual.vercel.app/api/init-db
```

## 📋 Tabelas que serão criadas:

### Tabelas Core (Essenciais):
- ✅ `users` - Usuários do sistema
- ✅ `companies` - Empresas cadastradas
- ✅ `user_companies` - Relacionamento usuário-empresa

### Tabelas Financeiras:
- ✅ `contas_financeiras` - Contas bancárias
- ✅ `movimentacoes_financeiras` - Movimentações financeiras
- ✅ `centros_custos` - Centros de custo

### Tabelas de Estoque:
- ✅ `locais_estoque` - Locais de estoque
- ✅ `estoque_movimentos` - Movimentações de estoque
- ✅ `estoque_saldos` - Saldos de estoque
- ✅ `estoque_inventarios` - Inventários
- ✅ `estoque_inventarios_itens` - Itens de inventário

### Tabelas Fiscais:
- ✅ `contas_receber` - Contas a receber
- ✅ `parcelas_contas_receber` - Parcelas de contas a receber

### Outras:
- ✅ `historico_eventos` - Histórico de eventos
- ✅ `_migrations` - Controle de migrações

## 🐛 Troubleshooting

### Se as tabelas não forem criadas automaticamente:

1. **Verifique os logs da Vercel**:
   - Acesse: https://vercel.com/dashboard
   - Vá em Functions → Logs
   - Procure por erros relacionados ao banco

2. **Chame o endpoint manualmente**:
   ```bash
   curl -X POST https://fenixfrontendatual.vercel.app/api/init-db
   ```

3. **Verifique a conexão com o Neon**:
   - Certifique-se de que `DATABASE_URL` está configurada no Vercel
   - Verifique se o Neon está acessível

### Erro comum: "permission denied for extension"

Se você receber esse erro, não se preocupe! As extensões já devem estar instaladas no Neon. O código trata esse erro graciosamente e continua a criação das tabelas.

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

## 🎯 Próximos Passos

1. ✅ Inicializar o banco (automático ou manual)
2. ✅ Fazer login e criar um usuário
3. ✅ Cadastrar uma empresa
4. ✅ Começar a usar o sistema!

