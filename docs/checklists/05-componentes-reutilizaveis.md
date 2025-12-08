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
- [ ] Criar `FormField.tsx`
  - [ ] Wrapper genérico para campos
  - [ ] Suporte a label, error, helper text
  - [ ] Integração com react-hook-form
- [ ] Criar `FormSelect.tsx`
  - [ ] Select com busca (opcional)
  - [ ] Suporte a múltipla seleção
  - [ ] Loading state
  - [ ] Empty state
- [ ] Criar `FormDatePicker.tsx`
  - [ ] Date picker reutilizável
  - [ ] Suporte a range (opcional)
  - [ ] Formatação de data
- [ ] Criar `FormCurrencyInput.tsx`
  - [ ] Input de moeda formatado
  - [ ] Máscara de valor
  - [ ] Validação
- [ ] Criar `FormNumberInput.tsx`
  - [ ] Input numérico
  - [ ] Validação de min/max
  - [ ] Formatação opcional
- [ ] Criar `FormTextarea.tsx`
  - [ ] Textarea com contador de caracteres
  - [ ] Auto-resize (opcional)

### Testes
- [ ] Testar cada componente isoladamente
- [ ] Testar integração com react-hook-form
- [ ] Testar validações
- [ ] Testar estados (error, disabled, loading)

---

## 🪟 Componentes de Modal

### Modal Components
- [ ] Criar `src/components/shared/Modals/ConfirmModal.tsx`
  - [ ] Modal de confirmação genérico
  - [ ] Props: `title`, `message`, `onConfirm`, `onCancel`
  - [ ] Suporte a variantes (danger, warning, info)
  - [ ] Botões customizáveis
- [ ] Criar `FormModal.tsx`
  - [ ] Modal com formulário
  - [ ] Props: `title`, `form`, `onSubmit`, `onCancel`
  - [ ] Estados de loading
  - [ ] Validação
- [ ] Criar `Modal.tsx` (base)
  - [ ] Modal base reutilizável
  - [ ] Suporte a tamanhos
  - [ ] Suporte a animações
  - [ ] Acessibilidade (focus trap, ESC key)

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
- [ ] Documentar props e tipos
- [ ] Criar exemplos de uso
- [ ] Documentar variantes
- [ ] Documentar quando usar

### Storybook (Opcional)
- [ ] Configurar Storybook
- [ ] Criar stories para componentes principais
- [ ] Documentar visualmente

---

## ✅ Critérios de Aceitação

### Por Componente
- [ ] Componente funcional e testado
- [ ] Props bem definidas com TypeScript
- [ ] Acessível (ARIA labels, keyboard navigation)
- [ ] Responsivo
- [ ] Documentado

### Geral
- [ ] Componentes reutilizáveis criados
- [ ] Usados em pelo menos 2 lugares diferentes
- [ ] Sem duplicação de código
- [ ] Consistência visual
- [ ] Performance adequada

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

