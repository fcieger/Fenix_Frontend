# 🚨 INSTRUÇÕES URGENTES DE DEBUG - Saldo Zerado

## ⚡ PROBLEMA:
- Abertura: R$ 100,00 ✓
- Venda: R$ 60,00 ✓
- **Esperado: R$ 0,00** ❌ (deveria ser R$ 160,00)

---

## 📋 PASSO A PASSO PARA DEBUG:

### **1️⃣ ACESSE O DIAGNÓSTICO:**

```
http://localhost:3004/frente-caixa/diagnostico
```

**Tire um PRINT completo da tela** e me envie.

---

### **2️⃣ COPIE OS LOGS DO SERVIDOR:**

No terminal onde o Next.js está rodando:

1. **Role até o início** dos logs
2. **Copie TUDO** desde quando você:
   - Abriu o caixa
   - Fez a venda
   - Acessou a tela de fechamento
3. **Cole em um arquivo de texto** e me envie

**Procure especialmente por:**
```
💾 CRIANDO VENDA NO CAIXA:
✅ Venda criada com ID:
🔍 VERIFICAÇÃO PÓS-VENDA:
💰 CÁLCULO DO SALDO:
```

---

### **3️⃣ EXECUTE ESTAS QUERIES NO BANCO:**

Conecte no PostgreSQL e execute:

```sql
-- 1. Ver TODOS os caixas (para confirmar qual está aberto)
SELECT 
  id,
  descricao,
  "valorAbertura",
  status,
  "dataAbertura",
  "companyId",
  "usuarioId"
FROM caixas
ORDER BY "dataAbertura" DESC
LIMIT 3;
```

**Copie o ID do caixa que está com status = 'aberto'**

```sql
-- 2. Ver TODAS as vendas (substituir XXX pelo ID do caixa)
SELECT 
  id,
  "caixaId",
  "companyId",
  "valorTotal",
  "valorProdutos",
  "meioPagamento",
  status,
  "dataVenda"
FROM vendas_caixa
WHERE "caixaId" = 'XXX'::uuid;
```

```sql
-- 3. Contar e somar vendas
SELECT 
  COUNT(*) as total,
  SUM("valorTotal") as soma,
  status
FROM vendas_caixa
WHERE "caixaId" = 'XXX'::uuid
GROUP BY status;
```

```sql
-- 4. Verificar tipos de colunas
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'vendas_caixa'
  AND column_name IN ('caixaId', 'valorTotal', 'status');
```

**Me envie o resultado dessas 4 queries!**

---

### **4️⃣ TESTE ALTERNATIVO:**

Se não conseguir acessar o banco, faça:

1. **Abra o Console do Navegador** (F12)
2. **Vá para a aba Console**
3. **Acesse:**
   ```
   http://localhost:3004/frente-caixa/fechar
   ```
4. **Copie TODOS os logs** que aparecem no console
5. **Me envie**

---

## 🎯 INFORMAÇÕES CRÍTICAS NECESSÁRIAS:

Para resolver, preciso de **PELO MENOS UMA** dessas opções:

### **Opção 1: Logs do Servidor**
Copie TODO o conteúdo do terminal desde que você iniciou o servidor.

### **Opção 2: Página de Diagnóstico**
Screenshot de `http://localhost:3004/frente-caixa/diagnostico`

### **Opção 3: Queries SQL**
Resultado das 4 queries acima executadas no PostgreSQL.

---

## ⏱️ ENQUANTO ISSO:

### **Teste este workaround temporário:**

1. **Feche o Next.js** (Ctrl+C no terminal)
2. **Reinicie:**
   ```bash
   npm run dev
   ```
3. **Abra NOVO caixa** com R$ 100,00
4. **Faça UMA venda** de R$ 50,00 em DINHEIRO
5. **Imediatamente vá para fechamento**
6. **Tire print** mostrando o saldo

---

## 🔍 CHECKLIST DE VERIFICAÇÃO:

Marque o que você conseguir fazer:

- [ ] Acessou `/frente-caixa/diagnostico`
- [ ] Tirou print da tela de diagnóstico
- [ ] Copiou logs do terminal do servidor
- [ ] Executou queries SQL no banco
- [ ] Reiniciou o servidor e testou novamente

---

## 📞 RESPONDA COM:

```
1. LOGS DO SERVIDOR:
[cole aqui]

2. PRINT DO DIAGNÓSTICO:
[anexe aqui]

3. RESULTADO DAS QUERIES SQL:
[cole aqui]

4. COMPORTAMENTO APÓS REINICIAR:
[descreva aqui]
```

---

**Com essas informações conseguirei identificar EXATAMENTE onde está o problema!** 🎯




