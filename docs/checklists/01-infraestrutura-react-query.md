# Checklist: Infraestrutura React Query

## 📦 Instalação e Configuração

### Dependências
- [x] Instalar `@tanstack/react-query`
- [x] Instalar `@tanstack/react-query-devtools`
- [x] Verificar versão compatível com Next.js atual
- [x] Atualizar `package.json`

### Configuração do QueryClient
- [x] Criar `QueryClient` com configurações padrão
  - [x] `staleTime: 5 * 60 * 1000` (5 minutos)
  - [x] `gcTime: 10 * 60 * 1000` (10 minutos - cacheTime renomeado para gcTime no v5)
  - [x] `refetchOnWindowFocus: false`
  - [x] `retry: 1`
- [x] Configurar `QueryClientProvider` no `layout.tsx`
- [x] Adicionar `ReactQueryDevtools` (apenas em desenvolvimento)
- [x] Testar se o provider está funcionando

### Estrutura de Diretórios
- [x] Criar `src/hooks/queries/`
- [x] Criar `src/hooks/mutations/` (opcional, pode ficar junto)
- [x] Documentar padrão de nomenclatura

---

## 🎣 Hooks Base para Queries

### Template de Hook de Listagem
- [x] Criar template para `use[Entity]s` (ex: `useProducts`)
- [x] Implementar suporte a parâmetros (page, limit, search)
- [x] Configurar `queryKey` adequadamente
- [x] Configurar `staleTime` específico por entidade
- [x] Implementar tratamento de erro

**Hooks criados:**
- `useProducts` ✅
- `usePartners` ✅
- `usePurchaseOrders` ✅

### Template de Hook de Item Único
- [x] Criar template para `use[Entity]` (ex: `useProduct`)
- [x] Implementar `enabled: !!id` para evitar fetch desnecessário
- [x] Configurar `queryKey` com ID

**Hooks criados:**
- `useProduct` ✅
- `usePartner` ✅
- `usePurchaseOrder` ✅

### Template de Hooks de Mutations
- [x] Criar `useCreate[Entity]`
  - [x] Implementar `onSuccess` com invalidação
  - [x] Adicionar feedback de sucesso
- [x] Criar `useUpdate[Entity]`
  - [x] Implementar invalidação de lista e item
  - [x] Adicionar feedback de sucesso
- [x] Criar `useDelete[Entity]`
  - [x] Implementar invalidação de lista
  - [x] Adicionar feedback de sucesso/erro

**Mutations criadas:**
- Products: `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct` ✅
- Partners: `useCreatePartner`, `useUpdatePartner`, `useDeletePartner` ✅
- Purchase Orders: `useCreatePurchaseOrder`, `useUpdatePurchaseOrder`, `useDeletePurchaseOrder`, `useRecalculatePurchaseOrderTaxes` ✅

---

## 🔄 Funcionalidades Avançadas

### Prefetching
- [x] Implementar função de prefetch para itens individuais
- [x] Usar em links hover (ex: prefetch ao passar mouse)
- [x] Usar em navegação programática

**Arquivo criado:** `src/lib/react-query/prefetch.ts`
- `prefetchEntity` (genérico)
- `prefetchProduct`
- `prefetchPartner`
- `prefetchPurchaseOrder`
- `prefetchProducts`, `prefetchPartners`, `prefetchPurchaseOrders` (múltiplos)

### Optimistic Updates
- [x] Criar hook genérico `useOptimisticMutation`
- [x] Implementar `onMutate` para atualização otimista
- [x] Implementar `onError` para rollback
- [x] Implementar `onSettled` para invalidação final

**Arquivo criado:** `src/lib/react-query/optimistic-updates.ts`
- `useOptimisticMutation` (genérico)
- `useOptimisticMutationWithKey` (com query key explícita)

### Cache Manual
- [x] Documentar quando usar `queryClient.setQueryData`
- [x] Documentar quando usar `queryClient.invalidateQueries`
- [x] Criar utilitários para manipulação de cache

**Arquivo criado:** `src/lib/react-query/cache-utils.ts`
- `invalidateEntityList`
- `invalidateEntity`
- `updateEntityCache`
- `updateEntityListCache`
- `removeEntityFromCache`
- `getEntityFromCache`
- `getEntityListFromCache`

---

## 📝 Documentação

- [x] Documentar padrões de uso do React Query
- [x] Criar exemplos de uso para cada tipo de hook
- [x] Documentar convenções de `queryKey`
- [x] Criar guia de troubleshooting

**Arquivo criado:** `docs/react-query-guide.md`
- Visão geral e configuração
- Templates para criar hooks
- Convenções de query keys
- Guia de prefetching
- Guia de optimistic updates
- Guia de manipulação de cache
- Tratamento de erros
- Troubleshooting
- Exemplos completos

---

## ✅ Testes

- [ ] Testar configuração básica do QueryClient
- [ ] Testar hooks de queries
- [ ] Testar hooks de mutations
- [ ] Testar invalidação de cache
- [ ] Testar optimistic updates
- [ ] Verificar se devtools está funcionando

---

## 🎯 Critérios de Aceitação

- [x] React Query instalado e configurado
- [x] QueryClientProvider funcionando em toda aplicação
- [x] Pelo menos 3 hooks de exemplo criados (list, item, mutations)
  - Products ✅
  - Partners ✅
  - Purchase Orders ✅
- [x] Devtools funcionando em desenvolvimento
- [x] Documentação básica criada
- [ ] Testes básicos passando (opcional - pode ser feito em fases posteriores)

---

**Prioridade:** 🔴 CRÍTICA
**Estimativa:** 2-3 dias
**Dependências:** Nenhuma

