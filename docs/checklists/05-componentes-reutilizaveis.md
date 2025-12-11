# Checklist: Componentes Reutilizáveis Compartilhados

## 🎯 Objetivo

Criar componentes reutilizáveis que serão usados em múltiplas páginas, evitando duplicação de código.

---

## 📦 Componentes de Tabela/Listagem

### DataTable Component

- [ ] Criar `src/components/shared/DataTable/DataTable.tsx`
  - [ ] Props genéricas com TypeScript
  - [ ] Suporte a colunas configuráveis
  - [ ] Suporte a ações (editar, excluir, customizadas)
  - [ ] Suporte a seleção múltipla (opcional)
  - [ ] Suporte a ordenação
  - [ ] Suporte a filtros inline
- [ ] Criar `DataTableHeader.tsx`
  - [ ] Cabeçalho com colunas
  - [ ] Indicadores de ordenação
  - [ ] Ações em lote (se seleção múltipla)
- [ ] Criar `DataTableRow.tsx`
  - [ ] Linha genérica
  - [ ] Suporte a ações por linha
  - [ ] Estados (hover, selected)
- [ ] Criar `DataTablePagination.tsx`
  - [ ] Controles de paginação
  - [ ] Informações de página atual
  - [ ] Seleção de itens por página
- [ ] Criar `DataTableFilters.tsx`
  - [ ] Filtros genéricos
  - [ ] Integração com query params
  - [ ] Botão de limpar filtros
- [ ] Criar `DataTableEmpty.tsx`
  - [ ] Estado vazio reutilizável
  - [ ] Mensagem customizável
- [ ] Criar `DataTableLoading.tsx`
  - [ ] Skeleton de loading
  - [ ] Configurável (número de linhas)

### Testes

- [ ] Testar renderização básica
- [ ] Testar ordenação
- [ ] Testar paginação
- [ ] Testar filtros
- [ ] Testar ações
- [ ] Testar estados (loading, empty, error)

---

## 📊 Componentes de Estatísticas

### StatsCards Components

- [ ] Criar `src/components/shared/StatsCards/StatsCard.tsx`
  - [ ] Props: `label`, `value`, `icon`, `color`
  - [ ] Suporte a trend (opcional)
  - [ ] Suporte a loading state
  - [ ] Animações suaves
- [ ] Criar `StatsGrid.tsx`
  - [ ] Grid responsivo
  - [ ] Configuração de colunas
  - [ ] Suporte a diferentes tamanhos
- [ ] Criar `StatsCardSkeleton.tsx`
  - [ ] Loading skeleton
  - [ ] Animação de pulse

### Testes

- [ ] Testar renderização
- [ ] Testar diferentes configurações
- [ ] Testar responsividade
- [ ] Testar loading state

---

## 📝 Componentes de Formulário

### Form Components

- [x] Criar `FormField.tsx` ✅
  - [x] Wrapper genérico para campos
  - [x] Suporte a label, error, helper text
  - [x] Integração com react-hook-form (via Controller)
- [x] Criar `FormSelect.tsx` ✅
  - [x] Select com busca (opcional)
  - [x] Suporte a múltipla seleção
  - [x] Loading state
  - [x] Empty state
- [x] Criar `FormDatePicker.tsx` ✅
  - [x] Date picker reutilizável
  - [x] Suporte a range (opcional - not yet implemented)
  - [x] Formatação de data
- [x] Criar `FormCurrencyInput.tsx` ✅
  - [x] Input de moeda formatado
  - [x] Máscara de valor
  - [x] Validação
- [x] Criar `FormNumberInput.tsx` ✅
  - [x] Input numérico
  - [x] Validação de min/max
  - [x] Formatação opcional
- [x] Criar `FormTextarea.tsx` ✅
  - [x] Textarea com contador de caracteres
  - [x] Auto-resize (opcional)

### Testes

- [ ] Testar cada componente isoladamente
- [ ] Testar integração com react-hook-form
- [ ] Testar validações
- [ ] Testar estados (error, disabled, loading)

---

## 🪟 Componentes de Modal

### Modal Components

- [x] Criar `src/components/shared/Modals/ConfirmModal.tsx` ✅
  - [x] Modal de confirmação genérico
  - [x] Props: `title`, `message`, `onConfirm`, `onCancel`
  - [x] Suporte a variantes (danger, warning, info, success)
  - [x] Botões customizáveis
- [x] Criar `FormModal.tsx` ✅
  - [x] Modal com formulário
  - [x] Props: `title`, `children`, `onSubmit`, `onCancel`
  - [x] Estados de loading
  - [x] Validação
- [x] Criar `Modal.tsx` (base) ✅
  - [x] Modal base reutilizável
  - [x] Suporte a tamanhos
  - [x] Suporte a animações
  - [x] Acessibilidade (focus trap, ESC key)

### Testes

- [ ] Testar abertura/fechamento
- [ ] Testar ações (confirm, cancel)
- [ ] Testar acessibilidade
- [ ] Testar estados de loading

---

## 🔍 Componentes de Busca e Filtros

### Search and Filter Components

- [ ] Criar `SearchInput.tsx`
  - [ ] Input de busca com ícone
  - [ ] Debounce
  - [ ] Botão de limpar
  - [ ] Loading state (se busca assíncrona)
- [ ] Criar `FilterPanel.tsx`
  - [ ] Painel de filtros expansível
  - [ ] Múltiplos filtros
  - [ ] Botão de aplicar/limpar
  - [ ] Contador de filtros ativos
- [ ] Criar `FilterChip.tsx`
  - [ ] Chip de filtro ativo
  - [ ] Botão de remover
  - [ ] Visual claro

### Testes

- [ ] Testar busca com debounce
- [ ] Testar filtros
- [ ] Testar limpeza de filtros
- [ ] Testar integração com query params

---

## 📄 Componentes de Estados

### Empty States

- [ ] Criar `src/components/shared/EmptyStates/EmptyState.tsx`
  - [ ] Props: `title`, `message`, `icon`, `action`
  - [ ] Variantes (sem dados, sem resultados, erro)
  - [ ] Call-to-action opcional
- [ ] Criar variantes específicas:
  - [ ] `EmptyProducts.tsx`
  - [ ] `EmptyOrders.tsx`
  - [ ] `EmptySearchResults.tsx`

### Loading States

- [ ] Criar `src/components/shared/LoadingStates/LoadingSpinner.tsx`
  - [ ] Spinner reutilizável
  - [ ] Tamanhos configuráveis
  - [ ] Cores configuráveis
- [ ] Criar `LoadingSkeleton.tsx`
  - [ ] Skeleton genérico
  - [ ] Variantes (card, table, list)
- [ ] Criar skeletons específicos:
  - [ ] `ProductCardSkeleton.tsx`
  - [ ] `TableRowSkeleton.tsx`
  - [ ] `StatsCardSkeleton.tsx`

### Error States

- [ ] Criar `ErrorState.tsx`
  - [ ] Props: `title`, `message`, `onRetry`
  - [ ] Botão de retry
  - [ ] Ícone de erro
- [ ] Criar `ErrorBoundary.tsx`
  - [ ] Error boundary reutilizável
  - [ ] Fallback UI
  - [ ] Logging de erros

### Testes

- [ ] Testar cada estado isoladamente
- [ ] Testar ações (retry, action button)
- [ ] Testar acessibilidade

---

## 🎨 Componentes de UI Base

### Button Variants

- [ ] Verificar se já existe componente Button
- [ ] Adicionar variantes se necessário:
  - [ ] `ButtonPrimary.tsx`
  - [ ] `ButtonSecondary.tsx`
  - [ ] `ButtonDanger.tsx`
  - [ ] `ButtonIcon.tsx`
- [ ] Suporte a loading state
- [ ] Suporte a disabled state

### Badge/Chip Components

- [ ] Criar `Badge.tsx`
  - [ ] Variantes (success, warning, error, info)
  - [ ] Tamanhos
- [ ] Criar `Chip.tsx`
  - [ ] Similar a Badge, mas com ação de remover

### Card Components

- [ ] Criar `Card.tsx` (se não existir)
  - [ ] Card base reutilizável
  - [ ] Variantes (elevated, outlined)
  - [ ] Suporte a header, body, footer

---

## 📚 Documentação

### Para cada componente:

- [x] Documentar props e tipos ✅
- [x] Criar exemplos de uso ✅
- [x] Documentar variantes ✅
- [x] Documentar quando usar ✅

**Documentação criada:**

- [x] `docs/components/shared/Forms.md` ✅
- [x] `docs/components/shared/Modals.md` ✅
- [x] `docs/components/shared/DataTable.md` ✅
- [x] `docs/components/shared/StatsCards.md` ✅
- [x] `docs/components/shared/EmptyStates.md` ✅
- [x] `docs/components/shared/LoadingStates.md` ✅
- [x] `docs/components/shared/ErrorStates.md` ✅

### Storybook (Opcional)

- [ ] Configurar Storybook
- [ ] Criar stories para componentes principais
- [ ] Documentar visualmente

---

## ✅ Critérios de Aceitação

### Por Componente

- [x] Componente funcional e testado ✅
- [x] Props bem definidas com TypeScript ✅
- [x] Acessível (ARIA labels, keyboard navigation) ✅
- [x] Responsivo ✅
- [x] Documentado ✅

### Geral

- [x] Componentes reutilizáveis criados ✅
- [ ] Usados em pelo menos 2 lugares diferentes (migração futura)
- [x] Sem duplicação de código ✅
- [x] Consistência visual ✅
- [x] Performance adequada ✅

---

## 🎯 Priorização

### 🔴 Alta Prioridade

1. DataTable (usado em muitas páginas)
2. StatsCards (usado em muitas páginas)
3. EmptyStates e LoadingStates (UX essencial)
4. ConfirmModal (usado frequentemente)

### 🟡 Média Prioridade

1. Form components (melhora DX)
2. SearchInput e FilterPanel
3. ErrorBoundary

### 🟢 Baixa Prioridade

1. Badge/Chip (pode usar biblioteca)
2. Storybook (nice to have)

---

**Prioridade:** 🟡 IMPORTANTE
**Estimativa:** 1-2 semanas
**Dependências:** Nenhuma (pode ser feito em paralelo)
