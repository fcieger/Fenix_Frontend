# EmptyState Component

Componente para exibição de estados vazios (sem dados, sem resultados, etc.).

## Visão Geral

O EmptyState fornece uma interface consistente para exibir estados vazios com ícones, mensagens e ações opcionais.

## Props

```typescript
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}
```

## Exemplo de Uso

```tsx
import { EmptyState } from "@/components/shared/EmptyStates";
import { Package, Plus } from "lucide-react";

// Estado vazio simples
<EmptyState
  icon={Package}
  title="Nenhum produto encontrado"
  description="Comece adicionando seu primeiro produto"
  actionLabel="Adicionar Produto"
  onAction={() => router.push("/products/novo")}
/>;
```

## Variantes de Uso

### Sem Dados

```tsx
<EmptyState
  icon={Package}
  title="Nenhum produto cadastrado"
  description="Você ainda não possui produtos cadastrados. Comece adicionando seu primeiro produto."
  actionLabel="Criar Produto"
  onAction={handleCreateProduct}
/>
```

### Sem Resultados de Busca

```tsx
<EmptyState
  icon={Search}
  title="Nenhum resultado encontrado"
  description={`Não encontramos resultados para "${searchTerm}". Tente ajustar seus filtros.`}
/>
```

### Sem Permissão

```tsx
<EmptyState
  icon={Lock}
  title="Acesso Restrito"
  description="Você não tem permissão para visualizar este conteúdo."
/>
```

## Sem Ação

Quando não há ação disponível, simplesmente omita `actionLabel` e `onAction`:

```tsx
<EmptyState
  icon={Inbox}
  title="Nenhum item"
  description="Não há itens para exibir no momento."
/>
```

## Quando Usar

- Use quando uma lista está vazia
- Use quando uma busca não retorna resultados
- Use quando o usuário não tem permissão
- Use para guiar o usuário a criar seu primeiro item

## Boas Práticas

1. **Seja específico** - explique por que está vazio
2. **Forneça contexto** - explique o que o usuário pode fazer
3. **Use ícones apropriados** - que representem o estado
4. **Ofereça ações** quando possível - guie o usuário
5. **Mantenha mensagens claras** e amigáveis
