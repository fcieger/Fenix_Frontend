# React Query Guide - Fenix Frontend

Este guia documenta os padrões e convenções para usar React Query no projeto Fenix.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Criando Hooks de Query](#criando-hooks-de-query)
4. [Criando Hooks de Mutation](#criando-hooks-de-mutation)
5. [Convenções de Query Keys](#convenções-de-query-keys)
6. [Prefetching](#prefetching)
7. [Optimistic Updates](#optimistic-updates)
8. [Manipulação de Cache](#manipulação-de-cache)
9. [Tratamento de Erros](#tratamento-de-erros)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral

React Query é usado para:

- ✅ Cache automático de dados
- ✅ Invalidação inteligente de cache
- ✅ Estados de loading/error centralizados
- ✅ Prefetching de dados
- ✅ Optimistic updates
- ✅ Sincronização automática

### Estrutura de Diretórios

```
src/
  hooks/
    queries/          # Hooks de queries e mutations
      useProducts.ts
      usePartners.ts
      usePurchaseOrders.ts
      index.ts
  lib/
    react-query/      # Utilitários do React Query
      prefetch.ts
      optimistic-updates.ts
      cache-utils.ts
  providers/
    query-provider.tsx  # QueryClientProvider
```

---

## Configuração

### QueryClient

O `QueryClient` está configurado em `src/providers/query-provider.tsx` com as seguintes configurações padrão:

```typescript
{
  staleTime: 5 * 60 * 1000,      // 5 minutos
  gcTime: 10 * 60 * 1000,        // 10 minutos (antigo cacheTime)
  refetchOnWindowFocus: false,
  retry: 1,
}
```

### Provider

O `QueryProvider` está configurado no `layout.tsx` e envolve toda a aplicação.

---

## Criando Hooks de Query

### Template para Listagem

```typescript
// src/hooks/queries/use[Entity]s.ts
import { useQuery } from "@tanstack/react-query";
import { list[Entity]s } from "@/services/[entity]-service";
import type { [Entity], [Entity]QueryParams } from "@/types/sdk";

export const use[Entity]s = (params?: [Entity]QueryParams) => {
  return useQuery({
    queryKey: ["[entities]", params],
    queryFn: () => list[Entity]s(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
```

### Template para Item Único

```typescript
export const use[Entity] = (
  id: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["[entity]", id],
    queryFn: () => get[Entity](id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};
```

### Exemplo Real: Products

```typescript
// src/hooks/queries/useProducts.ts
import { useQuery } from "@tanstack/react-query";
import { listProducts, getProduct } from "@/services/products-service";
import type { Product } from "@/types/sdk";

export const useProducts = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => listProducts(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useProduct = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};
```

### Uso em Componentes

```typescript
function ProductsList() {
  const { data, isLoading, error } = useProducts({ page: 1, limit: 10 });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {data?.data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## Criando Hooks de Mutation

### Template para Create

```typescript
export const useCreate[Entity] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Create[Entity]Dto) => create[Entity](data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["[entities]"] });
    },
  });
};
```

### Template para Update

```typescript
export const useUpdate[Entity] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Update[Entity]Dto }) =>
      update[Entity](id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["[entities]"] });
      queryClient.invalidateQueries({ queryKey: ["[entity]", variables.id] });
    },
  });
};
```

### Template para Delete

```typescript
export const useDelete[Entity] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => delete[Entity](id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["[entities]"] });
    },
  });
};
```

### Exemplo Real: Products

```typescript
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
  });
};
```

### Uso em Componentes

```typescript
function CreateProductForm() {
  const createProduct = useCreateProduct();
  const { toast } = useToast();

  const handleSubmit = async (data: CreateProductDto) => {
    try {
      await createProduct.mutateAsync(data);
      toast.success("Produto criado com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar produto");
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

---

## Convenções de Query Keys

### Estrutura

Query keys seguem o padrão:

```typescript
// Lista
["products", params?]
["partners", params?]
["purchase-orders", params?]

// Item único
["product", id]
["partner", id]
["purchase-order", id]
```

### Regras

1. **Sempre use arrays** para query keys
2. **Use nomes no plural** para listas: `["products"]`
3. **Use nomes no singular** para itens: `["product", id]`
4. **Inclua parâmetros** na query key quando relevante: `["products", { page: 1, search: "..." }]`
5. **Seja consistente** - use os mesmos nomes em todos os lugares

### Exemplos

```typescript
// ✅ Correto
queryKey: ["products", { page: 1, search: "laptop" }];
queryKey: ["product", "123"];
queryKey: ["purchase-orders", { status: "pending" }];

// ❌ Incorreto
queryKey: "products"; // Deve ser array
queryKey: ["products", 1]; // Parâmetros devem ser objetos
```

---

## Prefetching

### Quando Usar

- Ao passar o mouse sobre links (hover)
- Antes de navegação programática
- Para pré-carregar dados que provavelmente serão visualizados

### Utilitários Disponíveis

```typescript
import { useQueryClient } from "@tanstack/react-query";
import {
  prefetchProduct,
  prefetchPartner,
  prefetchPurchaseOrder,
} from "@/lib/react-query/prefetch";

function ProductLink({ id }: { id: string }) {
  const queryClient = useQueryClient();

  return (
    <Link
      href={`/products/${id}`}
      onMouseEnter={() => prefetchProduct(queryClient, id)}
    >
      View Product
    </Link>
  );
}
```

### Prefetch Múltiplos Itens

```typescript
import { prefetchProducts } from "@/lib/react-query/prefetch";

// Prefetch primeiros 10 produtos
useEffect(() => {
  const productIds = products.slice(0, 10).map((p) => p.id);
  prefetchProducts(queryClient, productIds);
}, []);
```

---

## Optimistic Updates

### Quando Usar

- Para atualizações que devem aparecer instantaneamente
- Quando a API é confiável e rápida
- Para melhorar a percepção de performance

### Utilitário

```typescript
import { useOptimisticMutationWithKey } from "@/lib/react-query/optimistic-updates";
import { useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "@/services/products-service";

function useOptimisticUpdateProduct() {
  const queryClient = useQueryClient();

  return useOptimisticMutationWithKey(
    ({ id, data }) => updateProduct(id, data),
    {
      getQueryKey: ({ id }) => ["product", id],
      getCurrentData: ({ id }) => {
        return queryClient.getQueryData(["product", id]);
      },
      applyOptimisticUpdate: (current, { data }) => {
        return current ? { ...current, ...data } : current;
      },
      invalidateQueries: [["products"]],
    }
  );
}
```

### Uso

```typescript
function ProductForm({ productId }: { productId: string }) {
  const updateProduct = useOptimisticUpdateProduct();

  const handleSubmit = async (data: UpdateProductDto) => {
    await updateProduct.mutateAsync({ id: productId, data });
  };

  // A UI atualiza instantaneamente, mesmo antes da resposta da API
}
```

---

## Manipulação de Cache

### Utilitários Disponíveis

```typescript
import { useQueryClient } from "@tanstack/react-query";
import {
  invalidateEntityList,
  invalidateEntity,
  updateEntityCache,
  removeEntityFromCache,
  getEntityFromCache,
} from "@/lib/react-query/cache-utils";
```

### Invalidar Cache

```typescript
// Invalidar lista (vai refetch)
invalidateEntityList(queryClient, "products");

// Invalidar item específico
invalidateEntity(queryClient, "product", productId);
```

### Atualizar Cache Diretamente

```typescript
// Atualizar sem refetch (quando você já tem os dados)
updateEntityCache(queryClient, "product", productId, (old) => ({
  ...old,
  name: "Novo Nome",
}));
```

### Remover do Cache

```typescript
// Remover item do cache (útil após delete)
removeEntityFromCache(queryClient, "product", productId);
invalidateEntityList(queryClient, "products");
```

### Ler do Cache

```typescript
// Ler sem triggerar fetch
const product = getEntityFromCache<Product>(queryClient, "product", productId);
```

### Quando Usar setQueryData vs invalidateQueries

**Use `setQueryData` (updateEntityCache) quando:**

- Você tem os dados atualizados e quer atualizar o cache imediatamente
- Você está fazendo optimistic updates
- Você quer evitar um refetch (ex: após mutation que retorna os dados atualizados)

**Use `invalidateQueries` (invalidateEntity) quando:**

- Você quer marcar dados como stale e triggerar um refetch
- Você não tem os dados atualizados
- Você quer garantir que os dados estão frescos do servidor
- Após mutations que não retornam a entidade completa atualizada

---

## Tratamento de Erros

### Em Queries

```typescript
function ProductsList() {
  const { data, error, isLoading } = useProducts();

  if (error) {
    return (
      <div>
        <p>Erro ao carregar produtos: {error.message}</p>
        <button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["products"] })
          }
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // ...
}
```

### Em Mutations

```typescript
function CreateProductForm() {
  const createProduct = useCreateProduct();
  const { toast } = useToast();

  const handleSubmit = async (data: CreateProductDto) => {
    try {
      await createProduct.mutateAsync(data);
      toast.success("Produto criado!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar produto"
      );
    }
  };

  // ...
}
```

### Error Boundaries

Para erros não tratados, considere usar Error Boundaries do React.

---

## Troubleshooting

### Problema: Cache não está sendo invalidado

**Solução:**

- Verifique se a query key está correta
- Use `queryClient.invalidateQueries` com a query key exata
- Verifique se está usando o mesmo `QueryClient` instance

```typescript
// ✅ Correto
queryClient.invalidateQueries({ queryKey: ["products"] });

// ❌ Incorreto - não vai invalidar
queryClient.invalidateQueries({ queryKey: ["product"] });
```

### Problema: Dados não estão sendo atualizados

**Solução:**

- Verifique se a mutation está invalidando as queries corretas
- Use React Query Devtools para inspecionar o cache
- Verifique se `staleTime` não está muito alto

### Problema: Múltiplos fetches desnecessários

**Solução:**

- Verifique se as query keys estão consistentes
- Use `staleTime` apropriado
- Considere usar `refetchOnWindowFocus: false` (já configurado)

### Problema: Optimistic update não está funcionando

**Solução:**

- Verifique se `getQueryKey` retorna a query key correta
- Verifique se `applyOptimisticUpdate` está retornando os dados corretos
- Use React Query Devtools para ver o estado do cache

### Debugging com Devtools

O React Query Devtools está habilitado em desenvolvimento. Use-o para:

- Ver todas as queries ativas
- Inspecionar o cache
- Ver estados de loading/error
- Testar invalidações manualmente

---

## Exemplos Completos

### Exemplo 1: Lista com Paginação

```typescript
function ProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProducts({ page, limit: 10 });

  return (
    <div>
      {isLoading && <Loading />}
      {data?.data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### Exemplo 2: Formulário com Mutation

```typescript
function EditProductForm({ productId }: { productId: string }) {
  const { data: product, isLoading } = useProduct(productId);
  const updateProduct = useUpdateProduct();
  const { toast } = useToast();

  const handleSubmit = async (data: UpdateProductDto) => {
    try {
      await updateProduct.mutateAsync({ id: productId, data });
      toast.success("Produto atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar produto");
    }
  };

  if (isLoading) return <Loading />;
  if (!product) return <NotFound />;

  return <ProductForm initialData={product} onSubmit={handleSubmit} />;
}
```

### Exemplo 3: Prefetch em Hover

```typescript
function ProductListItem({ product }: { product: Product }) {
  const queryClient = useQueryClient();

  return (
    <Link
      href={`/products/${product.id}`}
      onMouseEnter={() => prefetchProduct(queryClient, product.id)}
    >
      {product.name}
    </Link>
  );
}
```

---

## Próximos Passos

1. **Migrar páginas existentes** para usar React Query hooks
2. **Criar hooks adicionais** conforme necessário
3. **Implementar optimistic updates** em mutations críticas
4. **Adicionar prefetching** em navegação e hover
5. **Documentar padrões específicos** do projeto

---

## Referências

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Query Devtools](https://tanstack.com/query/latest/docs/react/devtools)
- [Query Keys Best Practices](https://tkdodo.eu/blog/effective-react-query-keys)

---

**Última atualização:** Janeiro 2025
