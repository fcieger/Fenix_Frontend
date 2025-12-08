# Checklist: Infraestrutura React Query

## 📦 Instalação e Configuração

### Dependências
- [ ] Instalar `@tanstack/react-query`
- [ ] Instalar `@tanstack/react-query-devtools`
- [ ] Verificar versão compatível com Next.js atual
- [ ] Atualizar `package.json`

### Configuração do QueryClient
- [ ] Criar `QueryClient` com configurações padrão
  - [ ] `staleTime: 5 * 60 * 1000` (5 minutos)
  - [ ] `cacheTime: 10 * 60 * 1000` (10 minutos)
  - [ ] `refetchOnWindowFocus: false`
  - [ ] `retry: 1`
- [ ] Configurar `QueryClientProvider` no `layout.tsx`
- [ ] Adicionar `ReactQueryDevtools` (apenas em desenvolvimento)
- [ ] Testar se o provider está funcionando

### Estrutura de Diretórios
- [ ] Criar `src/hooks/queries/`
- [ ] Criar `src/hooks/mutations/` (opcional, pode ficar junto)
- [ ] Documentar padrão de nomenclatura

---

## 🎣 Hooks Base para Queries

### Template de Hook de Listagem
- [ ] Criar template para `use[Entity]s` (ex: `useProducts`)
- [ ] Implementar suporte a parâmetros (page, limit, search)
- [ ] Configurar `queryKey` adequadamente
- [ ] Configurar `staleTime` específico por entidade
- [ ] Implementar tratamento de erro

### Template de Hook de Item Único
- [ ] Criar template para `use[Entity]` (ex: `useProduct`)
- [ ] Implementar `enabled: !!id` para evitar fetch desnecessário
- [ ] Configurar `queryKey` com ID

### Template de Hooks de Mutations
- [ ] Criar `useCreate[Entity]`
  - [ ] Implementar `onSuccess` com invalidação
  - [ ] Adicionar feedback de sucesso
- [ ] Criar `useUpdate[Entity]`
  - [ ] Implementar invalidação de lista e item
  - [ ] Adicionar feedback de sucesso
- [ ] Criar `useDelete[Entity]`
  - [ ] Implementar invalidação de lista
  - [ ] Adicionar feedback de sucesso/erro

---

## 🔄 Funcionalidades Avançadas

### Prefetching
- [ ] Implementar função de prefetch para itens individuais
- [ ] Usar em links hover (ex: prefetch ao passar mouse)
- [ ] Usar em navegação programática

### Optimistic Updates
- [ ] Criar hook genérico `useOptimisticMutation`
- [ ] Implementar `onMutate` para atualização otimista
- [ ] Implementar `onError` para rollback
- [ ] Implementar `onSettled` para invalidação final

### Cache Manual
- [ ] Documentar quando usar `queryClient.setQueryData`
- [ ] Documentar quando usar `queryClient.invalidateQueries`
- [ ] Criar utilitários para manipulação de cache

---

## 📝 Documentação

- [ ] Documentar padrões de uso do React Query
- [ ] Criar exemplos de uso para cada tipo de hook
- [ ] Documentar convenções de `queryKey`
- [ ] Criar guia de troubleshooting

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

- [ ] React Query instalado e configurado
- [ ] QueryClientProvider funcionando em toda aplicação
- [ ] Pelo menos 3 hooks de exemplo criados (list, item, mutations)
- [ ] Devtools funcionando em desenvolvimento
- [ ] Documentação básica criada
- [ ] Testes básicos passando

---

**Prioridade:** 🔴 CRÍTICA
**Estimativa:** 2-3 dias
**Dependências:** Nenhuma

