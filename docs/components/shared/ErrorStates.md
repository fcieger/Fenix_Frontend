# ErrorState Component

Componente para exibição de estados de erro.

## Visão Geral

O ErrorState fornece uma interface consistente para exibir erros com mensagens claras e opção de retry.

## Props

```typescript
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  error?: Error | unknown;
}
```

## Exemplo de Uso

```tsx
import { ErrorState } from "@/components/shared/ErrorStates";

// Erro simples
<ErrorState
  title="Erro ao carregar dados"
  message="Não foi possível carregar os produtos. Por favor, tente novamente."
  onRetry={refetch}
/>;

// Com erro do React Query
const { data, error, refetch } = useProducts();

{
  error && <ErrorState error={error} onRetry={refetch} />;
}
```

## Extração Automática de Mensagem

O componente extrai automaticamente a mensagem de erro quando um objeto Error é fornecido:

```tsx
<ErrorState
  error={error} // Error object ou string
  onRetry={handleRetry}
/>
```

## Sem Retry

Quando não há ação de retry disponível:

```tsx
<ErrorState
  title="Erro ao processar"
  message="Ocorreu um erro ao processar sua solicitação. Por favor, entre em contato com o suporte."
/>
```

## Integração com React Query

```tsx
import { useProducts } from "@/hooks/queries/useProducts";
import { ErrorState } from "@/components/shared/ErrorStates";

const { data, error, isLoading, refetch } = useProducts();

if (isLoading) return <LoadingSkeleton />;
if (error) return <ErrorState error={error} onRetry={refetch} />;
if (!data) return <EmptyState ... />;

return <ProductList products={data} />;
```

## Mensagens Customizadas

```tsx
<ErrorState
  title="Falha na Conexão"
  message="Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
  retryLabel="Tentar Novamente"
  onRetry={handleRetry}
/>
```

## Quando Usar

- Use quando uma requisição falha
- Use quando há erro ao carregar dados
- Use quando uma operação falha
- Use para erros que podem ser recuperados (com retry)

## Boas Práticas

1. **Seja específico** - explique o que deu errado
2. **Ofereça solução** - sugira o que o usuário pode fazer
3. **Forneça retry** quando apropriado
4. **Use mensagens amigáveis** - evite jargões técnicos
5. **Log erros** no console para debugging (já feito internamente)
