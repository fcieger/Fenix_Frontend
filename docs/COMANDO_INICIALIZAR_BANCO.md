# 🗄️ Comando para Atualizar TODAS as Tabelas no Neon

## 🚀 Comando Único - Atualização Automática Completa

Execute este comando para criar/atualizar **TODAS** as tabelas do sistema no Neon:

### Via Navegador:
```
https://fenixfrontendatual.vercel.app/api/init-db
```

### Via cURL:
```bash
curl -X POST https://fenixfrontendatual.vercel.app/api/init-db
```

### Via JavaScript/TypeScript:
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

## 📋 O que o comando faz:

1. ✅ **Tabelas Core**:
   - `users` - Usuários
   - `companies` - Empresas
   - `user_companies` - Relacionamento usuário-empresa

2. ✅ **Cadastros**:
   - `cadastros` - Clientes, fornecedores, transportadoras

3. ✅ **Produtos**:
   - `produtos` - Produtos cadastrados

4. ✅ **Fiscal**:
   - `natureza_operacao` - Naturezas de operação
   - `formas_pagamento` - Formas de pagamento
   - `prazos_pagamento` - Prazos de pagamento
   - `configuracoes_nfe` - Configurações de NFe
   - `certificados` - Certificados digitais
   - `nfe` - Notas fiscais eletrônicas

5. ✅ **Orçamentos**:
   - `orcamentos` - Cabeçalho de orçamentos
   - `orcamento_itens` - Itens de orçamentos

6. ✅ **Pedidos de Venda**:
   - `pedidos_venda` - Cabeçalho de pedidos
   - `pedidos_venda_itens` - Itens de pedidos

7. ✅ **Financeiro**:
   - `contas_financeiras` - Contas bancárias
   - `movimentacoes_financeiras` - Movimentações
   - `centros_custos` - Centros de custo
   - `contas_receber` - Contas a receber
   - `parcelas_contas_receber` - Parcelas

8. ✅ **Estoque**:
   - `locais_estoque` - Locais de estoque
   - `estoque_movimentos` - Movimentações
   - `estoque_saldos` - Saldos
   - `estoque_inventarios` - Inventários
   - `estoque_inventarios_itens` - Itens de inventário

9. ✅ **Outros**:
   - `historico_eventos` - Histórico de eventos
   - `_migrations` - Controle de migrações

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

## 🔄 Atualização Automática

O sistema também atualiza automaticamente quando você:
- Faz login pela primeira vez
- Acessa qualquer endpoint que use o banco

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

## 🎯 Próximos Passos

Após executar o comando:

1. ✅ Verifique se todas as tabelas foram criadas
2. ✅ Faça login e crie um usuário
3. ✅ Cadastre uma empresa
4. ✅ Comece a usar o sistema!

## 📝 Nota

Este comando é **idempotente** - pode ser executado múltiplas vezes sem problemas. Ele ignora erros de tabelas já existentes e apenas cria as que faltam.

