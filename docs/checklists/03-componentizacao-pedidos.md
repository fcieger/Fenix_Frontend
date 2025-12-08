# Checklist: Componentização - Páginas de Pedidos

## 📄 Arquivos Alvo
- `src/app/purchases/[id]/page.tsx` - **2.798 linhas** → Meta: **~100 linhas**
- `src/app/sales/[id]/page.tsx` - **2.929 linhas** → Meta: **~100 linhas**
- `src/app/quotes/[id]/page.tsx` - **3.337 linhas** → Meta: **~100 linhas**

---

## 🔍 Análise Inicial

### Identificar Responsabilidades Comuns
- [ ] Formulário de pedido (header, items, totais)
- [ ] Gerenciamento de itens (adicionar, editar, remover)
- [ ] Cálculo de totais e impostos
- [ ] Informações de entrega/frete
- [ ] Tabs/seções (itens, impostos, entrega, etc.)
- [ ] Ações (salvar, cancelar, duplicar, etc.)

### Identificar Diferenças por Tipo
- [ ] Diferenças entre Purchase/Sales/Quote
- [ ] Campos específicos de cada tipo
- [ ] Validações específicas
- [ ] Fluxos específicos

---

## 🏗️ Arquitetura Proposta

### Estrutura de Componentes
```
src/components/orders/
  OrderForm/
    OrderFormProvider.tsx      # Context para estado
    OrderForm.tsx              # Componente principal
    OrderHeader.tsx            # Cabeçalho do pedido
    OrderItems/
      OrderItemsList.tsx       # Lista de itens
      OrderItemRow.tsx         # Linha de item
      OrderItemModal.tsx       # Modal de adicionar/editar item
    OrderTotals/
      OrderTotalsCard.tsx      # Card de totais
      OrderTaxesCard.tsx       # Card de impostos
    OrderShipping/
      ShippingForm.tsx         # Formulário de entrega
      VehicleForm.tsx          # Formulário de veículo (se aplicável)
    OrderActions.tsx           # Botões de ação
    OrderTabs.tsx              # Tabs/seções
```

---

## 🧩 Componentização - Pedidos de Compra

### Context Provider
- [ ] Criar `OrderFormProvider` (ou `PurchaseOrderFormProvider`)
  - [ ] Gerenciar estado do formulário
  - [ ] Gerenciar estado dos itens
  - [ ] Gerenciar estado de loading
  - [ ] Expor métodos via context

### Componentes de Formulário
- [ ] `PurchaseOrderHeader.tsx`
  - [ ] Campos: fornecedor, data, número, etc.
  - [ ] Validações básicas
- [ ] `PurchaseOrderItems.tsx`
  - [ ] Lista de itens
  - [ ] Botão de adicionar item
  - [ ] Ações por item (editar, remover)
- [ ] `PurchaseOrderItemRow.tsx`
  - [ ] Campos: produto, quantidade, preço, etc.
  - [ ] Cálculo de subtotal
  - [ ] Validações
- [ ] `PurchaseOrderItemModal.tsx`
  - [ ] Formulário completo de item
  - [ ] Busca de produtos
  - [ ] Validações
- [ ] `PurchaseOrderTotals.tsx`
  - [ ] Cálculo de subtotal
  - [ ] Cálculo de impostos
  - [ ] Cálculo de total
  - [ ] Atualização automática
- [ ] `PurchaseOrderShipping.tsx`
  - [ ] Campos de entrega
  - [ ] Campos de veículo (se aplicável)
- [ ] `PurchaseOrderActions.tsx`
  - [ ] Botão salvar
  - [ ] Botão cancelar
  - [ ] Botão duplicar (se aplicável)
  - [ ] Estados de loading

### Componentes Compartilhados
- [ ] `OrderTabs.tsx` - Tabs reutilizáveis
- [ ] `OrderFormLayout.tsx` - Layout base

---

## 🧩 Componentização - Pedidos de Venda

### Componentes Específicos
- [ ] `SalesOrderHeader.tsx`
  - [ ] Campos: cliente, data, número, etc.
- [ ] `SalesOrderItems.tsx`
  - [ ] Similar a Purchase, mas com campos específicos
- [ ] `SalesOrderTotals.tsx`
  - [ ] Cálculos específicos de venda
- [ ] `SalesOrderShipping.tsx`
  - [ ] Campos específicos de entrega de venda

### Reutilizar Componentes Comuns
- [ ] `OrderItemRow.tsx` - Versão genérica
- [ ] `OrderItemModal.tsx` - Versão genérica com props

---

## 🧩 Componentização - Orçamentos

### Componentes Específicos
- [ ] `QuoteHeader.tsx`
- [ ] `QuoteItems.tsx`
- [ ] `QuoteTotals.tsx`
- [ ] `QuoteActions.tsx`
  - [ ] Botão de converter em pedido

---

## 🎣 Hooks Customizados

### Hooks de Dados
- [ ] `usePurchaseOrder(id)` - Buscar pedido
- [ ] `useCreatePurchaseOrder()` - Criar pedido
- [ ] `useUpdatePurchaseOrder()` - Atualizar pedido
- [ ] `useSalesOrder(id)` - Buscar pedido de venda
- [ ] `useCreateSalesOrder()` - Criar pedido de venda
- [ ] `useUpdateSalesOrder()` - Atualizar pedido de venda
- [ ] `useQuote(id)` - Buscar orçamento
- [ ] `useCreateQuote()` - Criar orçamento
- [ ] `useUpdateQuote()` - Atualizar orçamento

### Hooks de Lógica de Negócio
- [ ] `useOrderForm(orderId, type)` - Hook principal
  - [ ] Gerenciar formulário
  - [ ] Gerenciar itens
  - [ ] Cálculos de totais
  - [ ] Validações
- [ ] `useOrderItems()` - Gerenciar lista de itens
  - [ ] Adicionar item
  - [ ] Editar item
  - [ ] Remover item
  - [ ] Reordenar itens
- [ ] `useOrderTotals(items)` - Calcular totais
  - [ ] Subtotal
  - [ ] Impostos
  - [ ] Descontos
  - [ ] Total
- [ ] `useOrderTaxes(items)` - Calcular impostos
  - [ ] ICMS, IPI, PIS, COFINS, etc.
  - [ ] Integração com API de impostos (se houver)

---

## 🔄 Migração para React Query

### Substituir Estados Locais
- [ ] Remover `useState` de dados do pedido
- [ ] Remover `useEffect` de fetch
- [ ] Usar hooks de queries
- [ ] Usar hooks de mutations

### Implementar Cache
- [ ] Cache de pedidos
- [ ] Cache de produtos (para busca em itens)
- [ ] Cache de parceiros (fornecedores/clientes)
- [ ] Invalidação após mutations

---

## 📦 Refatoração das Páginas

### Página de Compra
- [ ] `src/app/purchases/[id]/page.tsx` → ~100 linhas
  - [ ] Apenas orquestração
  - [ ] Usar `OrderFormProvider`
  - [ ] Renderizar `PurchaseOrderForm`

### Página de Venda
- [ ] `src/app/sales/[id]/page.tsx` → ~100 linhas
  - [ ] Apenas orquestração
  - [ ] Usar `OrderFormProvider`
  - [ ] Renderizar `SalesOrderForm`

### Página de Orçamento
- [ ] `src/app/quotes/[id]/page.tsx` → ~100 linhas
  - [ ] Apenas orquestração
  - [ ] Usar `OrderFormProvider`
  - [ ] Renderizar `QuoteForm`

---

## 🧪 Testes

### Testes de Componentes
- [ ] Testar `OrderFormProvider` isoladamente
- [ ] Testar cada componente de formulário
- [ ] Testar adição/edição/remoção de itens
- [ ] Testar cálculos de totais
- [ ] Testar validações

### Testes de Integração
- [ ] Testar fluxo completo: criar → editar → salvar
- [ ] Testar com dados existentes (edição)
- [ ] Testar com dados novos (criação)
- [ ] Testar diferentes tipos de pedido

### Testes de Hooks
- [ ] Testar `useOrderForm`
- [ ] Testar `useOrderItems`
- [ ] Testar `useOrderTotals`
- [ ] Testar mutations e cache

---

## 📝 Documentação

- [ ] Documentar arquitetura de componentes
- [ ] Documentar `OrderFormProvider` e context
- [ ] Documentar hooks customizados
- [ ] Documentar diferenças entre tipos de pedido
- [ ] Criar diagrama de fluxo

---

## ✅ Critérios de Aceitação

### Por Página
- [ ] Página com < 150 linhas
- [ ] Componentes extraídos e funcionando
- [ ] React Query implementado
- [ ] Sem `useEffect` de fetch
- [ ] Máximo 3 `useState` (apenas UI state)
- [ ] Testes passando

### Funcionalidades
- [ ] Criar pedido funcionando
- [ ] Editar pedido funcionando
- [ ] Cálculos corretos
- [ ] Validações funcionando
- [ ] Performance mantida ou melhorada

---

## 🎯 Métricas de Sucesso

### Antes
- ❌ 2.798 linhas (purchases)
- ❌ 2.929 linhas (sales)
- ❌ 3.337 linhas (quotes)
- ❌ 20+ useState por página
- ❌ 10+ useEffect por página

### Depois
- ✅ < 150 linhas por página
- ✅ < 5 useState por página
- ✅ 0 useEffect de fetch
- ✅ Componentes reutilizáveis

---

**Prioridade:** 🔴 CRÍTICA
**Estimativa:** 2-3 semanas
**Dependências:** Checklist 01 (React Query), Checklist 02 (Produtos como exemplo)

