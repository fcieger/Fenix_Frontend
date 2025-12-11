# LoadingStates Components

Componentes para exibição de estados de carregamento.

## Visão Geral

Os componentes LoadingStates fornecem uma interface consistente para exibir estados de carregamento com skeletons e spinners.

## Componentes

### LoadingSkeleton

Skeleton genérico de carregamento.

#### Props

```typescript
interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}
```

#### Exemplo de Uso

```tsx
import { LoadingSkeleton } from "@/components/shared/LoadingStates";

// Skeleton simples
<LoadingSkeleton />

// Múltiplos skeletons
<LoadingSkeleton count={5} />

// Skeleton customizado
<LoadingSkeleton className="h-32 w-full rounded-lg" />
```

---

### ProductListSkeleton

Skeleton específico para lista de produtos.

#### Exemplo de Uso

```tsx
import { ProductListSkeleton } from "@/components/shared/LoadingStates";

<ProductListSkeleton />;
```

---

### StatsCardsSkeleton

Skeleton específico para grid de estatísticas.

#### Exemplo de Uso

```tsx
import { StatsCardsSkeleton } from "@/components/shared/LoadingStates";

<StatsCardsSkeleton />;
```

## Uso em Componentes

### Com DataTable

```tsx
import { DataTable } from "@/components/shared/DataTable";

<DataTable
  data={data}
  columns={columns}
  loading={isLoading} // Exibe spinner automaticamente
/>;
```

### Com Listas Customizadas

```tsx
import { LoadingSkeleton } from "@/components/shared/LoadingStates";

{
  isLoading ? (
    <div className="space-y-4">
      <LoadingSkeleton count={5} className="h-20" />
    </div>
  ) : (
    <ProductList products={products} />
  );
}
```

## Variantes

### Skeleton de Card

```tsx
<LoadingSkeleton className="h-48 w-full rounded-xl" />
```

### Skeleton de Tabela

```tsx
<div className="space-y-2">
  {Array.from({ length: 5 }).map((_, i) => (
    <LoadingSkeleton key={i} className="h-16 w-full" />
  ))}
</div>
```

### Skeleton de Texto

```tsx
<div className="space-y-2">
  <LoadingSkeleton className="h-4 w-3/4" />
  <LoadingSkeleton className="h-4 w-1/2" />
  <LoadingSkeleton className="h-4 w-5/6" />
</div>
```

## Quando Usar

- Use LoadingSkeleton para estados de carregamento genéricos
- Use ProductListSkeleton para listas de produtos
- Use StatsCardsSkeleton para grids de estatísticas
- Use quando o carregamento demora mais de 200ms

## Boas Práticas

1. **Use skeletons** em vez de spinners para carregamentos mais longos
2. **Mantenha o layout** similar ao conteúdo final
3. **Use skeletons específicos** quando disponíveis
4. **Evite skeletons** para carregamentos muito rápidos (< 200ms)
5. **Forneça feedback** durante operações assíncronas
