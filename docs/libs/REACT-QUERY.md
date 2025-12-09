# TanStack Query (React Query)

## Visão Geral

TanStack Query (anteriormente React Query) é uma biblioteca poderosa para gerenciamento de estado assíncrono e busca de dados em React. Ela simplifica o gerenciamento de estado do servidor com recursos como cache automático, sincronização em background e tratamento de erros.

## Instalação

```bash
npm install @tanstack/react-query
# ou
pnpm add @tanstack/react-query
# ou
yarn add @tanstack/react-query
```

## Configuração Inicial

### Setup do QueryClient

```tsx
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  )
}
```

## Conceitos Principais

### useQuery

Hook para buscar dados.

```tsx
import { useQuery } from '@tanstack/react-query'

function Example() {
  const { isPending, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      fetch('https://api.github.com/repos/TanStack/query').then((res) =>
        res.json(),
      ),
  })

  if (isPending) return 'Loading...'

  if (error) return 'An error has occurred: ' + error.message

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{' '}
      <strong>✨ {data.stargazers_count}</strong>{' '}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  )
}
```

### useMutation

Hook para modificar dados.

```tsx
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { postTodo } from '../my-api'

function Todos() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: postTodo,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return (
    <div>
      <button
        onClick={() => {
          mutation.mutate({
            id: Date.now(),
            title: 'Do Laundry',
          })
        }}
      >
        Add Todo
      </button>
    </div>
  )
}
```

### Query Keys

Chaves únicas para identificar queries no cache.

```tsx
// Query key simples
['todos']

// Query key com parâmetros
['todos', todoId]

// Query key aninhada
['posts', { author: 'John' }]
```

### Query Functions

Funções que retornam uma Promise com os dados.

```tsx
const fetchTodos = async () => {
  const response = await fetch('/api/todos')
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}
```

## Estados da Query

```tsx
const {
  data,              // Dados retornados
  error,             // Objeto de erro
  isPending,         // Primeira carga (sem dados em cache)
  isLoading,         // Carregando (inclui background refetch)
  isError,           // Erro ocorreu
  isSuccess,         // Sucesso
  isFetching,        // Fetching em background
  isRefetching,      // Refetching
  refetch,           // Função para refetch manual
} = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
```

## Opções de Configuração

### staleTime

Tempo em que os dados são considerados "frescos".

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  staleTime: 5 * 60 * 1000, // 5 minutos
})
```

### cacheTime (gcTime no v5)

Tempo que os dados inativos permanecem no cache.

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  gcTime: 10 * 60 * 1000, // 10 minutos
})
```

### refetchOnWindowFocus

Refetch automático quando a janela ganha foco.

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  refetchOnWindowFocus: true, // padrão
})
```

### retry

Configuração de tentativas em caso de erro.

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  retry: 3, // tenta 3 vezes
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})
```

## Invalidando Queries

```tsx
const queryClient = useQueryClient()

// Invalidar todas as queries
queryClient.invalidateQueries()

// Invalidar queries específicas
queryClient.invalidateQueries({ queryKey: ['todos'] })

// Invalidar queries que começam com 'posts'
queryClient.invalidateQueries({ queryKey: ['posts'] })
```

## Prefetching

```tsx
const queryClient = useQueryClient()

await queryClient.prefetchQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
})
```

## useInfiniteQuery

Para paginação infinita.

```tsx
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['todos'],
  queryFn: ({ pageParam = 1 }) => fetchTodos(pageParam),
  getNextPageParam: (lastPage, allPages) => lastPage.nextCursor,
  initialPageParam: 1,
})
```

## Hooks Úteis

### useIsFetching

Retorna o número de queries que estão fazendo fetch.

```tsx
import { useIsFetching } from '@tanstack/react-query'

const isFetching = useIsFetching()

return (
  <div>
    {isFetching > 0 && <LoadingSpinner />}
  </div>
)
```

### useIsMutating

Retorna o número de mutations em andamento.

```tsx
import { useIsMutating } from '@tanstack/react-query'

const isMutating = useIsMutating()
```

## DevTools

```bash
npm install @tanstack/react-query-devtools
```

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

## SSR (Server-Side Rendering)

### Com Next.js

```tsx
import { HydrationBoundary } from '@tanstack/react-query'
import { dehydrate, QueryClient } from '@tanstack/react-query'

export default async function Page() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Todos />
    </HydrationBoundary>
  )
}
```

## Versão Utilizada no Projeto

- **@tanstack/react-query**: ^5.90.12
- **@tanstack/react-query-devtools**: ^5.62.0

## Documentação Oficial

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TanStack Query GitHub](https://github.com/tanstack/query)

