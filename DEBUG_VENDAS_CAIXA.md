# 🔍 DEBUG - Vendas não aparecem no Saldo do Caixa

## ✅ VERIFICAÇÃO 1: Código está correto!

O código está salvando as vendas corretamente:
- ✅ Status: `'concluida'` (linha 290 do route.ts)
- ✅ CaixaId: Associado corretamente
- ✅ Fórmula do saldo: Correta

```javascript
// Fórmula CORRETA sendo usada:
const saldoAtual = valorAbertura + valorTotalVendas - totalSangrias + totalSuprimentos;
```

---

## 🔍 POSSÍVEIS CAUSAS DO PROBLEMA

### 1. Vendas em caixa diferente
As vendas podem estar em um caixa anterior (fechado) ou de outro usuário.

### 2. Status da venda incorreto
Embora improvável, alguma venda pode ter status diferente de 'concluida'.

### 3. Cache/Reload necessário
A tela não recarregou o resumo após as vendas.

---

## 🧪 COMO DEBUGAR

### PASSO 1: Verificar no Console do Navegador

Abra a tela de fechamento: `http://localhost:3004/frente-caixa/fechar`

**No Console (F12), você deve ver:**
```
🔍 Verificando status do caixa: { company_id: "...", usuario_id: "..." }
📦 Dados do caixa: { caixaAberto: true, caixa: { id: "XXX" } }
✅ Caixa aberto encontrado: XXX
```

**Copie o ID do caixa (XXX)**

### PASSO 2: Verificar Vendas no Banco

Execute no PostgreSQL:

```sql
-- Substitua 'SEU_CAIXA_ID' pelo ID copiado acima
SELECT 
  id,
  "dataVenda",
  "clienteNome",
  "valorTotal",
  "meioPagamento",
  status,
  "caixaId"
FROM vendas_caixa
WHERE "caixaId" = 'SEU_CAIXA_ID'
ORDER BY "dataVenda" DESC;
```

**O que verificar:**
- ✅ Vendas aparecem na lista?
- ✅ Status = 'concluida'?
- ✅ CaixaId correto?
- ✅ Valores corretos?

### PASSO 3: Verificar Totais

```sql
-- Substitua 'SEU_CAIXA_ID' pelo ID do seu caixa
SELECT 
  COUNT(*) as total_vendas,
  SUM("valorTotal") as valor_total_vendas
FROM vendas_caixa
WHERE "caixaId" = 'SEU_CAIXA_ID'
  AND status = 'concluida';
```

**Resultado esperado:**
```
total_vendas | valor_total_vendas
-------------+-------------------
      5      |      1500.00
```

### PASSO 4: Verificar Resumo do Caixa

Na API, adicione logs temporários:

1. Abra: `src/app/api/caixa/resumo/route.ts`
2. Adicione após linha 176:

```javascript
console.log('🔍 DEBUG VENDAS:', {
  caixaId: caixa_id,
  valorAbertura,
  vendas: vendasQuery.rows[0],
  valorTotalVendas,
  totalSangrias,
  totalSuprimentos,
  saldoAtual
});
```

3. Acesse `/frente-caixa/fechar` novamente
4. Veja os logs no terminal do servidor

---

## 🛠️ SOLUÇÕES RÁPIDAS

### Solução 1: Recarregar Página
- Pressione **Ctrl+Shift+R** (hard reload)
- Ou feche e abra a aba novamente

### Solução 2: Verificar Caixa Correto
1. Vá para `/frente-caixa`
2. Verifique se o caixa está mesmo aberto
3. Veja o saldo no header (deve mostrar o valor)
4. Faça uma nova venda de teste
5. Volte para `/frente-caixa/fechar`

### Solução 3: Fechar e Reabrir Caixa
Se o caixa está "travado":
1. Force o fechamento (mesmo com diferença)
2. Abra novo caixa
3. Faça venda de teste
4. Verifique se agora aparece

---

## 📊 TESTE COMPLETO PASSO A PASSO

### 1. Limpar Estado
```bash
# No terminal
npm run dev
# ou
yarn dev
```

### 2. Abrir Novo Caixa
- Acesse: `/frente-caixa/abrir`
- Valor: `R$ 100,00`
- Clique em "Abrir Caixa"

### 3. Fazer Venda de Teste
- Na frente de caixa
- Adicione 1 produto de `R$ 50,00`
- Forma de pagamento: Dinheiro
- Valor recebido: `R$ 50,00`
- Finalize a venda

### 4. Verificar Imediatamente
- Vá para `/frente-caixa/fechar`
- **Deve mostrar:**
  ```
  Valor de Abertura:    R$ 100,00
  Total de Vendas:      R$ 50,00
  Sangrias:             R$ 0,00
  Suprimentos:          R$ 0,00
  ─────────────────────────────────
  SALDO ESPERADO:       R$ 150,00
  ```

### 5. Se NÃO aparecer
**Console do navegador deve mostrar:**
```javascript
{
  caixaId: "uuid-do-caixa",
  valorAbertura: 100,
  vendas: { total_vendas: "1", valor_total_vendas: "50" },
  valorTotalVendas: 50,
  saldoAtual: 150
}
```

Se `valor_total_vendas` for `0`, o problema está na query!

---

## 🔧 CORREÇÃO EMERGENCIAL

Se encontrar vendas no banco mas não aparecem no saldo:

### Adicionar Log na API de Resumo

**Arquivo:** `src/app/api/caixa/resumo/route.ts`

**Após linha 106, adicione:**
```javascript
console.log('📊 Query vendas executada:', {
  caixaId: caixa_id,
  resultado: vendasQuery.rows,
  primeiraLinha: vendasQuery.rows[0]
});
```

**Após linha 179, adicione:**
```javascript
console.log('💰 CÁLCULO FINAL:', {
  valorAbertura: valorAbertura,
  valorTotalVendas: valorTotalVendas,
  totalSangrias: totalSangrias,
  totalSuprimentos: totalSuprimentos,
  formula: `${valorAbertura} + ${valorTotalVendas} - ${totalSangrias} + ${totalSuprimentos}`,
  saldoAtual: saldoAtual
});
```

**Reinicie o servidor e teste novamente!**

---

## 📞 INFORMAÇÕES PARA SUPORTE

Se o problema persistir, forneça:

1. **Logs do Console (Navegador):**
   - Abra F12 → Console
   - Copie TODOS os logs que aparecem

2. **Resultado da Query SQL:**
   ```sql
   SELECT * FROM vendas_caixa 
   WHERE "caixaId" = 'SEU_ID'
   ORDER BY "dataVenda" DESC
   LIMIT 5;
   ```

3. **Logs do Servidor:**
   - Terminal onde o Next.js está rodando
   - Copie os logs quando acessar `/frente-caixa/fechar`

4. **Screenshot:**
   - Tela de fechamento mostrando os valores
   - Histórico de vendas

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] Caixa está realmente aberto?
- [ ] Vendas foram finalizadas com sucesso?
- [ ] Vendas estão no banco de dados?
- [ ] Status das vendas = 'concluida'?
- [ ] CaixaId das vendas = ID do caixa aberto?
- [ ] Página foi recarregada após vendas?
- [ ] Console do navegador mostra logs?
- [ ] Terminal do servidor mostra logs?
- [ ] Histórico (`/frente-caixa/historico`) mostra as vendas?

---

**Siga este guia e me informe o resultado!** 🚀





