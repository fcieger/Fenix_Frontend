# Checklist Geral - Refatoração Massiva

## 📋 Visão Geral

Este é o checklist mestre que organiza todos os outros checklists da refatoração massiva. Use este documento para acompanhar o progresso geral.

---

## 🎯 Fases da Refatoração

### Fase 1: Infraestrutura Base ⚡
**Prioridade:** 🔴 CRÍTICA
**Estimativa:** 2-3 dias
**Checklist:** [01-infraestrutura-react-query.md](./01-infraestrutura-react-query.md)

- [ ] React Query instalado e configurado
- [ ] QueryClientProvider funcionando
- [ ] Hooks base criados (templates)
- [ ] Devtools funcionando
- [ ] Documentação básica

**Status:** ⬜ Não iniciado

---

### Fase 2: Componentização - Produtos 🧩
**Prioridade:** 🔴 CRÍTICA
**Estimativa:** 1 semana
**Checklist:** [02-componentizacao-produtos.md](./02-componentizacao-produtos.md)

- [ ] Página `products/page.tsx` refatorada (< 200 linhas)
- [ ] Componentes extraídos
- [ ] React Query implementado
- [ ] Hooks customizados criados
- [ ] Testes passando

**Status:** ⬜ Não iniciado

---

### Fase 3: Componentização - Pedidos 📦
**Prioridade:** 🔴 CRÍTICA
**Estimativa:** 2-3 semanas
**Checklist:** [03-componentizacao-pedidos.md](./03-componentizacao-pedidos.md)

- [ ] `purchases/[id]/page.tsx` refatorada (< 150 linhas)
- [ ] `sales/[id]/page.tsx` refatorada (< 150 linhas)
- [ ] `quotes/[id]/page.tsx` refatorada (< 150 linhas)
- [ ] Componentes compartilhados criados
- [ ] OrderFormProvider implementado
- [ ] Testes passando

**Status:** ⬜ Não iniciado

---

### Fase 4: Componentes Reutilizáveis 🔄
**Prioridade:** 🟡 IMPORTANTE
**Estimativa:** 1-2 semanas
**Checklist:** [05-componentes-reutilizaveis.md](./05-componentes-reutilizaveis.md)

- [ ] DataTable component
- [ ] StatsCards components
- [ ] Form components
- [ ] Modal components
- [ ] Empty/Loading/Error states
- [ ] Documentação

**Status:** ⬜ Não iniciado

---

### Fase 5: Migração SDK 🔧
**Prioridade:** 🟡 IMPORTANTE
**Estimativa:** 2-3 semanas
**Checklist:** [04-migracao-sdk.md](./04-migracao-sdk.md)

- [ ] `partners-service.ts` migrado
- [ ] `nfe-service.ts` migrado
- [ ] `stock-service.ts` migrado
- [ ] Serviços de orders completados
- [ ] Todos os serviços usando SDK
- [ ] `apiService` removido (ou apenas casos especiais)

**Status:** ⬜ Não iniciado

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
- [ ] `src/app/quotes/[id]/page.tsx` - **3.337 linhas** ⚠️⚠️⚠️
- [ ] `src/app/sales/[id]/page.tsx` - **2.929 linhas** ⚠️⚠️
- [ ] `src/app/purchases/[id]/page.tsx` - **2.798 linhas** ⚠️⚠️
- [ ] `src/app/products/page.tsx` - **1.532 linhas** ⚠️
- [ ] `src/app/nfe/page.tsx` - **1.594 linhas** ⚠️
- [ ] `src/app/financial/titulos-em-aberto/page.tsx` - **1.287 linhas** ⚠️
- [ ] `src/app/products/novo/page.tsx` - **1.180 linhas** ⚠️
- [ ] `src/app/settings/lista-precos/page.tsx` - **843 linhas** ⚠️

---

## 🚀 Plano de Implementação por Sprint

### Sprint 1 (2 semanas) - Infraestrutura
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
- Fase 2 e 3 dependem de Fase 1 (React Query)
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
- [Checklist 01: Infraestrutura React Query](./01-infraestrutura-react-query.md)
- [Checklist 02: Componentização Produtos](./02-componentizacao-produtos.md)
- [Checklist 03: Componentização Pedidos](./03-componentizacao-pedidos.md)
- [Checklist 04: Migração SDK](./04-migracao-sdk.md)
- [Checklist 05: Componentes Reutilizáveis](./05-componentes-reutilizaveis.md)
- [Checklist 06: Otimizações Performance](./06-otimizacoes-performance.md)
- [Checklist 07: UX e Acessibilidade](./07-ux-acessibilidade.md)

---

**Última atualização:** Janeiro 2025
**Versão:** 1.0

