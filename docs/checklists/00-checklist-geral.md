# Checklist Geral - Refatoração Massiva

## 📋 Visão Geral

Este é o checklist mestre que organiza todos os outros checklists da refatoração massiva. Use este documento para acompanhar o progresso geral.

---

## 🎯 Fases da Refatoração

### Fase 0: Padrão de Módulo 📐

**Prioridade:** 🔴 CRÍTICA
**Estimativa:** Contínua (aplicada em todas as fases)
**Documento:** [Module Pattern](../standards/module-pattern.md)

- [x] Padrão de módulo documentado e compreendido
- [x] Estrutura de diretórios seguindo padrão (`services/{module}/`)
- [x] Service layer implementado corretamente
- [x] Transformers separados e implementados
- [x] Hooks React Query seguindo padrão (`queryOptions`)
- [x] Rotas seguindo padrão (`/{module}/create`, `/{module}/edit/[id]`)
- [x] Formulários unificados (create/update)
- [x] Convenções de nomenclatura seguidas
- [x] Checklist de implementação validado

**Status:** ✅ COMPLETA

---

### Fase 1: Infraestrutura Base ⚡

**Prioridade:** 🔴 CRÍTICA
**Estimativa:** 2-3 dias
**Checklist:** [01-infraestrutura-react-query.md](./01-infraestrutura-react-query.md)

- [x] React Query instalado e configurado
- [x] QueryClientProvider funcionando
- [x] Hooks base criados (templates)
- [x] Devtools funcionando
- [x] Documentação básica

**Status:** ✅ COMPLETA

---

### Fase 2: Componentização - Produtos 🧩

**Prioridade:** 🔴 CRÍTICA
**Estimativa:** 1 semana
**Checklist:** [02-componentizacao-produtos.md](./02-componentizacao-produtos.md)

- [x] Página `products/page.tsx` refatorada (< 200 linhas) - **83 linhas** ✅
- [x] Componentes extraídos (ProductsList, ProductsStats, ProductsHeader, ProductCard, ProductTable, ProductFilters)
- [x] React Query implementado (useProducts com parâmetros de busca e paginação)
- [x] Hooks customizados criados (useProducts, useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct)
- [ ] Testes passando (opcional - pode ser feito em fases posteriores)

**Status:** ✅ COMPLETA (exceto testes)

---

### Fase 3: Componentização - Pedidos 📦

**Prioridade:** 🔴 CRÍTICA
**Estimativa:** 2-3 semanas
**Checklist:** [03-componentizacao-pedidos.md](./03-componentizacao-pedidos.md)

- [x] `purchases/[id]/page.tsx` refatorada (< 150 linhas) - **~40 linhas** ✅
- [x] `sales/[id]/page.tsx` refatorada (< 150 linhas) - **~40 linhas** ✅
- [x] `quotes/[id]/page.tsx` refatorada (< 150 linhas) - **~40 linhas** ✅
- [x] Componentes compartilhados criados ✅ (OrderHeader, OrderItems, OrderTotals, OrderActions, OrderTabs)
- [x] OrderFormProvider implementado ✅
- [x] React Query hooks criados ✅ (useSalesOrders, useQuotes)
- [x] Hooks de lógica criados ✅ (useOrderForm, useOrderItems, useOrderTotals, useOrderTaxes)
- [x] Formulários específicos criados ✅ (PurchaseOrderForm, SalesOrderForm, QuoteForm)
- [ ] Testes passando (opcional - pode ser feito em fases posteriores)

**Status:** ✅ COMPLETA (exceto testes)

---

### Fase 4: Componentes Reutilizáveis 🔄

**Prioridade:** 🟡 IMPORTANTE
**Estimativa:** 1-2 semanas
**Checklist:** [05-componentes-reutilizaveis.md](./05-componentes-reutilizaveis.md)

- [x] DataTable component ✅
- [x] StatsCards components ✅
- [x] EmptyState component ✅
- [x] LoadingSkeleton component ✅
- [x] ErrorState component ✅
- [x] Form components padronizados ✅ (FormField, FormSelect, FormDatePicker, FormCurrencyInput, FormNumberInput, FormTextarea)
- [x] Modal components padronizados ✅ (Modal, ConfirmModal, FormModal)
- [x] Documentação completa ✅

**Status:** ✅ COMPLETA

---

### Fase 5: Migração SDK 🔧

**Prioridade:** 🟡 IMPORTANTE
**Estimativa:** 2-3 semanas
**Checklist:** [04-migracao-sdk.md](./04-migracao-sdk.md)

- [x] `partners-service.ts` migrado ✅
- [x] `nfe-service.ts` migrado ✅
- [x] `stock-service.ts` migrado ✅
- [x] Serviços de orders completados (quotes, sales, purchases) ✅
- [x] Serviços principais usando SDK ✅
- [ ] `apiService` removido (ou apenas casos especiais) - Alguns serviços ainda usam API routes quando não há SDK client

**Status:** ✅ COMPLETA (~95% - serviços principais migrados, alguns casos especiais ainda usam API routes)

---

### Fase 6: Otimizações de Performance ⚡

**Prioridade:** 🟡 IMPORTANTE
**Estimativa:** 1 semana
**Checklist:** [06-otimizacoes-performance.md](./06-otimizacoes-performance.md)

- [ ] Code splitting implementado
- [ ] Memoização aplicada
- [ ] Virtualização (se necessário)
- [ ] Bundle otimizado
- [ ] Lighthouse score > 90

**Status:** ⬜ Não iniciado

---

### Fase 7: UX e Acessibilidade ♿

**Prioridade:** 🟡 IMPORTANTE
**Estimativa:** 1 semana
**Checklist:** [07-ux-acessibilidade.md](./07-ux-acessibilidade.md)

- [ ] Loading states consistentes
- [ ] Error handling centralizado
- [ ] Feedback visual
- [ ] Acessibilidade (WCAG)
- [ ] Responsividade

**Status:** ⬜ Não iniciado

---

## 📊 Páginas Prioritárias para Refatoração

### Páginas Críticas (1.000+ linhas)

- [x] `src/app/quotes/[id]/page.tsx` - **3.337 linhas** → **~40 linhas** ✅
- [x] `src/app/sales/[id]/page.tsx` - **2.929 linhas** → **~40 linhas** ✅
- [x] `src/app/purchases/[id]/page.tsx` - **2.798 linhas** → **~40 linhas** ✅
- [ ] `src/app/products/page.tsx` - **1.532 linhas** ⚠️
- [ ] `src/app/nfe/page.tsx` - **1.594 linhas** ⚠️
- [ ] `src/app/financial/titulos-em-aberto/page.tsx` - **1.287 linhas** ⚠️
- [ ] `src/app/products/novo/page.tsx` - **1.180 linhas** ⚠️
- [ ] `src/app/settings/lista-precos/page.tsx` - **843 linhas** ⚠️

---

## 🚀 Plano de Implementação por Sprint

### Sprint 1 (2 semanas) - Infraestrutura

- [ ] Fase 0: Padrão de Módulo (compreensão e validação)
- [ ] Fase 1: Infraestrutura React Query
- [ ] Fase 4: Componentes Reutilizáveis (parcial - base)
- [ ] Início Fase 2: Produtos (análise)

**Entregáveis:**

- React Query configurado
- Componentes base criados
- Templates de hooks

---

### Sprint 2 (2 semanas) - Componentização Products

- [ ] Fase 2: Componentização Produtos (completo)
- [ ] Fase 4: Componentes Reutilizáveis (completar)

**Entregáveis:**

- Página de produtos refatorada
- Componentes de produtos
- Componentes reutilizáveis base

---

### Sprint 3 (2 semanas) - Componentização Orders

- [ ] Fase 3: Componentização Pedidos (completo)

**Entregáveis:**

- Páginas de pedidos refatoradas
- Componentes compartilhados de orders
- OrderFormProvider

---

### Sprint 4 (2 semanas) - Migração SDK

- [ ] Fase 5: Migração SDK (completo)

**Entregáveis:**

- Todos os serviços migrados
- Hooks atualizados
- `apiService` removido

---

### Sprint 5 (1 semana) - Otimizações

- [ ] Fase 6: Otimizações de Performance

**Entregáveis:**

- Code splitting
- Memoização
- Bundle otimizado
- Métricas de performance

---

### Sprint 6 (1 semana) - Polimento

- [ ] Fase 7: UX e Acessibilidade

**Entregáveis:**

- Loading states
- Error handling
- Acessibilidade
- Responsividade

---

## 📈 Métricas de Sucesso

### Antes da Refatoração

- ❌ Páginas com 1.500+ linhas
- ❌ 15+ useState por componente
- ❌ Sem cache (re-fetch constante)
- ❌ SDK parcialmente implementado
- ❌ Componentes não reutilizáveis
- ❌ Bundle size não otimizado

### Depois da Refatoração

- ✅ Páginas com <200 linhas
- ✅ Máximo 3-5 useState por componente
- ✅ Cache automático com React Query
- ✅ 100% dos serviços usando SDK
- ✅ Componentes reutilizáveis e testáveis
- ✅ Code splitting e bundle otimizado

---

## ✅ Checklist de Validação Final

### Código

- [ ] Todas as páginas grandes refatoradas
- [ ] Componentes reutilizáveis criados
- [ ] React Query implementado em todas as páginas
- [ ] Todos os serviços usando SDK
- [ ] Sem código duplicado significativo
- [ ] Todos os módulos seguindo o [Padrão de Módulo](../standards/module-pattern.md)

### Performance

- [ ] Lighthouse score > 90
- [ ] Bundle size reduzido
- [ ] Tempo de carregamento melhorado
- [ ] Re-renders otimizados

### Qualidade

- [ ] Testes passando
- [ ] Sem erros de lint
- [ ] TypeScript sem erros
- [ ] Documentação atualizada

### UX/Acessibilidade

- [ ] Loading states consistentes
- [ ] Error handling adequado
- [ ] Acessível (WCAG)
- [ ] Responsivo

---

## 📝 Notas e Observações

### Dependências entre Fases

- Fase 0 (Padrão de Módulo) deve ser seguida em TODAS as fases
- Fase 2 e 3 dependem de Fase 1 (React Query)
- Fase 2 e 3 devem seguir Fase 0 (Padrão de Módulo)
- Fase 4 pode ser feita em paralelo
- Fase 5 pode começar após Fase 1
- Fase 6 depende de componentes criados
- Fase 7 depende de componentes criados

### Riscos e Mitigações

- **Risco:** Refatoração quebra funcionalidades existentes
  - **Mitigação:** Testes antes/depois, refatoração incremental
- **Risco:** Tempo de implementação maior que estimado
  - **Mitigação:** Priorizar fases críticas, iterar
- **Risco:** Resistência a mudanças
  - **Mitigação:** Documentação clara, exemplos, treinamento

---

## 🔗 Links Úteis

- [Documento Principal](../refatoracao-massiva.md)
- [Padrão de Módulo](../standards/module-pattern.md) - **OBRIGATÓRIO para todas as fases**
- [Checklist 01: Infraestrutura React Query](./01-infraestrutura-react-query.md)
- [Checklist 02: Componentização Produtos](./02-componentizacao-produtos.md)
- [Checklist 03: Componentização Pedidos](./03-componentizacao-pedidos.md)
- [Checklist 04: Migração SDK](./04-migracao-sdk.md)
- [Checklist 05: Componentes Reutilizáveis](./05-componentes-reutilizaveis.md)
- [Checklist 06: Otimizações Performance](./06-otimizacoes-performance.md)
- [Checklist 07: UX e Acessibilidade](./07-ux-acessibilidade.md)

---

**Última atualização:** Janeiro 2025
**Versão:** 1.2

## 📊 Progresso Atual da Refatoração

### ✅ Fases Completas

- **Fase 0:** Padrão de Módulo - 100% ✅
- **Fase 1:** Infraestrutura React Query - 100% ✅
- **Fase 2:** Componentização Produtos - 100% ✅ (página reduzida de 1.532 para 83 linhas)
- **Fase 3:** Componentização Pedidos - 100% ✅ (páginas reduzidas de 2.798-3.337 para ~40 linhas cada)
- **Fase 4:** Componentes Reutilizáveis - 100% ✅ (componentes principais criados, forms e modals padronizados, documentação completa)
- **Fase 5:** Migração SDK - 95% ✅ (serviços principais migrados)

### ✅ Fases Completas

- **Fase 3:** Componentização Pedidos - 100% ✅ (páginas reduzidas de 2.798-3.337 para ~40 linhas cada)

### ⬜ Fases Não Iniciadas

- **Fase 6:** Otimizações Performance
- **Fase 7:** UX e Acessibilidade

### 🎯 Próximos Passos Recomendados

1. Testar funcionalidades das páginas refatoradas de pedidos
2. Implementar funcionalidades específicas que ainda faltam (configurações, entrega, etc.)
3. Iniciar Fase 6: Otimizações de Performance
4. Iniciar Fase 7: UX e Acessibilidade
