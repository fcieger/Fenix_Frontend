# Checklist: Componentização - Página de Produtos

## 📄 Arquivo Alvo
- `src/app/products/page.tsx` - **1.532 linhas** → Meta: **~200 linhas**

---

## 🔍 Análise Inicial

### Identificar Responsabilidades
- [ ] Listar todas as responsabilidades da página
- [ ] Identificar estados locais (useState)
- [ ] Identificar efeitos (useEffect)
- [ ] Identificar lógica de negócio
- [ ] Identificar componentes JSX inline

### Mapear Funcionalidades
- [ ] Listagem de produtos (grid/table)
- [ ] Filtros e busca
- [ ] Estatísticas/cards
- [ ] Modal de criação/edição
- [ ] Modal de confirmação de exclusão
- [ ] Paginação
- [ ] Loading states
- [ ] Empty states
- [ ] Tratamento de erros

---

## 🧩 Componentização

### Componentes de Listagem
- [ ] `ProductsList.tsx` - Componente principal de listagem
  - [ ] Gerenciar view mode (grid/table)
  - [ ] Integrar com `useProducts` hook
  - [ ] Renderizar loading/error/empty states
- [ ] `ProductCard.tsx` - Card individual (grid view)
  - [ ] Props: `product`, `onEdit`, `onDelete`
  - [ ] Memoizar se necessário
- [ ] `ProductTable.tsx` - Tabela (table view)
  - [ ] Colunas configuráveis
  - [ ] Ações (editar, excluir)
  - [ ] Responsivo

### Componentes de Filtros
- [ ] `ProductFilters.tsx`
  - [ ] Campo de busca
  - [ ] Filtros adicionais (categoria, status, etc.)
  - [ ] Botão de limpar filtros
  - [ ] Integrar com query params

### Componentes de Estatísticas
- [ ] `ProductsStats.tsx` - Container de estatísticas
- [ ] `StatsCard.tsx` - Card individual (reutilizável)
  - [ ] Props: `label`, `value`, `icon`, `color`, `trend`
  - [ ] Animações opcionais

### Componentes de Header
- [ ] `ProductsHeader.tsx`
  - [ ] Título da página
  - [ ] Botão de criar novo
  - [ ] Ações em lote (se houver)

### Componentes de Modais
- [ ] `ProductModal.tsx` - Modal de criação/edição
  - [ ] Formulário completo
  - [ ] Validação
  - [ ] Integrar com mutations
- [ ] `ProductDeleteConfirm.tsx` - Confirmação de exclusão
  - [ ] Mostrar informações do produto
  - [ ] Integrar com mutation de delete

### Componentes de Estados
- [ ] `ProductLoadingState.tsx` - Loading skeleton
- [ ] `ProductEmptyState.tsx` - Estado vazio
  - [ ] Mensagem apropriada
  - [ ] Call-to-action
- [ ] `ProductErrorState.tsx` - Estado de erro
  - [ ] Mensagem de erro
  - [ ] Botão de retry

---

## 🎣 Hooks Customizados

### Hooks de Dados
- [ ] Criar/atualizar `useProducts` hook
  - [ ] Suportar paginação
  - [ ] Suportar busca
  - [ ] Suportar filtros
- [ ] Criar `useProduct` hook (item único)
- [ ] Criar `useCreateProduct` mutation
- [ ] Criar `useUpdateProduct` mutation
- [ ] Criar `useDeleteProduct` mutation

### Hooks de UI
- [ ] `useProductFilters` - Gerenciar estado de filtros
- [ ] `useProductViewMode` - Gerenciar grid/table view
- [ ] `useProductModal` - Gerenciar abertura/fechamento de modal

---

## 🔄 Migração para React Query

### Substituir Estados Locais
- [ ] Remover `useState` de lista de produtos
- [ ] Remover `useEffect` de fetch
- [ ] Usar `useProducts` hook
- [ ] Usar `isLoading`, `error`, `data` do React Query

### Substituir Mutations
- [ ] Remover funções de create/update/delete inline
- [ ] Usar hooks de mutations
- [ ] Implementar invalidação de cache
- [ ] Adicionar feedback visual (toast)

---

## 📦 Refatoração da Página Principal

### Estrutura Final
- [ ] Página principal apenas orquestra componentes
- [ ] Máximo 3-5 `useState` (apenas UI state)
- [ ] Sem `useEffect` de fetch
- [ ] JSX limpo e legível (~200 linhas)

### Exemplo de Estrutura
```typescript
export default function ProductsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <ProductsHeader />
        <ProductsStats />
        <ProductsList />
      </div>
    </Layout>
  );
}
```

---

## 🧪 Testes

### Testes de Componentes
- [ ] Testar `ProductsList` isoladamente
- [ ] Testar `ProductCard` com diferentes props
- [ ] Testar `ProductTable` com dados mockados
- [ ] Testar `ProductFilters` com interações
- [ ] Testar modais (abrir/fechar)

### Testes de Integração
- [ ] Testar fluxo completo: listar → criar → editar → excluir
- [ ] Testar filtros e busca
- [ ] Testar paginação
- [ ] Testar estados de loading/error/empty

### Testes de Hooks
- [ ] Testar `useProducts` com diferentes parâmetros
- [ ] Testar mutations e invalidação de cache

---

## 📝 Documentação

- [ ] Documentar cada componente criado
- [ ] Documentar props e interfaces
- [ ] Documentar hooks customizados
- [ ] Atualizar README se necessário

---

## ✅ Critérios de Aceitação

- [ ] Página principal com < 200 linhas
- [ ] Todos os componentes extraídos e funcionando
- [ ] React Query implementado e funcionando
- [ ] Sem `useEffect` de fetch na página principal
- [ ] Máximo 5 `useState` na página principal
- [ ] Todos os testes passando
- [ ] Performance mantida ou melhorada
- [ ] UI/UX idêntica ou melhorada

---

## 🎯 Métricas de Sucesso

### Antes
- ❌ 1.532 linhas
- ❌ 15+ useState
- ❌ 5+ useEffect
- ❌ Sem cache

### Depois
- ✅ < 200 linhas
- ✅ < 5 useState
- ✅ 0 useEffect de fetch
- ✅ Cache com React Query

---

**Prioridade:** 🔴 CRÍTICA
**Estimativa:** 1 semana
**Dependências:** Checklist 01 (React Query)

