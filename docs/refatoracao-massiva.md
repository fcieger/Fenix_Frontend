# Refatoração Massiva - Plano de Ação para Frontend Escalável

## 📋 Sumário Executivo

Este documento apresenta uma análise completa do sistema frontend e um plano de ação para refatoração massiva, focando em:

- Componentização de telas gigantescas
- Implementação de cache e gerenciamento de estado
- Migração completa para SDK
- Arquitetura escalável e manutenível

---

## 🔍 Análise do Estado Atual

### Problemas Identificados

#### 1. **Páginas Monolíticas e Gigantescas**

**Arquivos problemáticos identificados:**

- `src/app/products/page.tsx` - **1.532 linhas** ⚠️
- `src/app/purchases/[id]/page.tsx` - **2.798 linhas** ⚠️⚠️
- `src/app/sales/[id]/page.tsx` - **2.929 linhas** ⚠️⚠️
- `src/app/quotes/[id]/page.tsx` - **3.337 linhas** ⚠️⚠️⚠️
- `src/app/nfe/page.tsx` - **1.594 linhas** ⚠️
- `src/app/financial/titulos-em-aberto/page.tsx` - **1.287 linhas** ⚠️
- `src/app/settings/lista-precos/page.tsx` - **843 linhas** ⚠️
- `src/app/products/novo/page.tsx` - **1.180 linhas** ⚠️

**Problemas específicos:**

- Múltiplos `useState` e `useEffect` (15+ em alguns arquivos)
- Lógica de negócio misturada com apresentação
- Componentes JSX gigantescos inline
- Duplicação de código entre páginas similares
- Difícil manutenção e testes

#### 2. **Ausência de Cache e Gerenciamento de Estado**

**Problemas identificados:**

- ❌ **Nenhuma biblioteca de cache** (React Query, SWR, etc.)
- ❌ Fetch direto com `fetch()` sem cache
- ❌ Estados locais duplicados em múltiplos componentes
- ❌ Re-fetch desnecessário de dados já carregados
- ❌ Cache manual inconsistente (ex: `partnersCache` em `quotes/page.tsx`)
- ❌ Sem invalidação de cache após mutations

**Exemplos problemáticos:**

```typescript
// src/app/products/page.tsx - Sem cache, sempre refaz fetch
useEffect(() => {
  const fetchproducts = async () => {
    const response = await listProducts();
    setproducts(data);
  };
  fetchproducts();
}, [isAuthenticated, token, activeCompanyId]);

// src/app/quotes/page.tsx - Cache manual inconsistente
const [partnersCache, setPartnersCache] = useState<Map<string, Partner>>(
  new Map()
);
```

#### 3. **Uso Inconsistente do SDK**

**Estado atual:**

- ✅ SDK parcialmente implementado (`@fenix/api-sdk`)
- ✅ Alguns serviços usando SDK (`products-service.ts`, `financial-accounts-service.ts`)
- ❌ Muitos serviços ainda usando `apiService` direto
- ❌ Falta padronização de uso do SDK
- ❌ Mistura de padrões (SDK + fetch direto + apiService)

**Serviços que precisam migrar para SDK:**

- `purchase-orders-service.ts` - Parcialmente migrado
- `sales-orders-service.ts` - Parcialmente migrado
- `quotes-service.ts` - Parcialmente migrado
- `partners-service.ts` - Não migrado
- `nfe-service.ts` - Não migrado
- `stock-service.ts` - Não migrado
- E muitos outros...

#### 4. **Falta de Componentização**

**Componentes que deveriam existir mas estão inline:**

- Cards de estatísticas (repetido em múltiplas páginas)
- Tabelas de listagem (grid/table view)
- Modais de confirmação
- Formulários complexos
- Filtros e busca
- Paginação
- Loading states
- Empty states

#### 5. **Problemas de Performance**

- Re-renders desnecessários
- Sem memoização de componentes pesados
- Fetch de dados em cada render
- Sem code splitting adequado
- Bundle size não otimizado

---

## 🎯 Plano de Refatoração

### Fase 1: Infraestrutura Base (Prioridade ALTA)

#### 1.1 Implementar React Query (@tanstack/react-query)

**Objetivo:** Cache automático, invalidação inteligente, loading states centralizados

**Ações:**

1. **Instalar dependências:**

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

2. **Configurar QueryClient no layout:**

```typescript
// src/app/layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <FeedbackProvider>
              {children}
              <ReactQueryDevtools initialIsOpen={false} />
            </FeedbackProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

3. **Criar hooks customizados para queries:**

```typescript
// src/hooks/queries/useProducts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/products-service";
import type { Product, CreateProductDto, UpdateProductDto } from "@/types/sdk";

export const useProducts = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => listProducts(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
};

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

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
```

#### 1.2 Criar Sistema de Cache Centralizado

**Estrutura proposta:**

```
src/
  hooks/
    queries/
      useProducts.ts
      usePartners.ts
      usePurchaseOrders.ts
      useSalesOrders.ts
      useQuotes.ts
      useStock.ts
      useFinancialAccounts.ts
      ...
    mutations/
      useProductMutations.ts
      useOrderMutations.ts
      ...
```

#### 1.3 Configurar Prefetching e Otimistic Updates

```typescript
// Exemplo de prefetching
const queryClient = useQueryClient();

const prefetchProduct = (id: string) => {
  queryClient.prefetchQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  });
};

// Exemplo de optimistic update
const updateProductMutation = useMutation({
  mutationFn: updateProduct,
  onMutate: async (newProduct) => {
    await queryClient.cancelQueries({ queryKey: ["products"] });
    const previousProducts = queryClient.getQueryData(["products"]);

    queryClient.setQueryData(["products"], (old: any) => {
      return old?.map((p: Product) =>
        p.id === newProduct.id ? { ...p, ...newProduct } : p
      );
    });

    return { previousProducts };
  },
  onError: (err, newProduct, context) => {
    queryClient.setQueryData(["products"], context?.previousProducts);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});
```

---

### Fase 2: Componentização Massiva (Prioridade ALTA)

#### 2.1 Extrair Componentes de Páginas Gigantescas

**Estrutura proposta para componentes:**

```
src/
  components/
    products/
      ProductsList.tsx          # Lista principal
      ProductCard.tsx            # Card individual
      ProductTable.tsx           # Tabela
      ProductFilters.tsx        # Filtros
      ProductStats.tsx          # Estatísticas
      ProductModal.tsx          # Modal de criação/edição
      ProductDeleteConfirm.tsx  # Confirmação de exclusão
      ProductEmptyState.tsx     # Estado vazio
      ProductLoadingState.tsx   # Loading

    orders/
      OrderForm/
        OrderHeader.tsx
        OrderItems.tsx
        OrderTotals.tsx
        OrderActions.tsx
        OrderTabs.tsx
      OrderList/
        OrderCard.tsx
        OrderTable.tsx
        OrderFilters.tsx
        OrderStats.tsx

    shared/
      DataTable/
        DataTable.tsx
        DataTableHeader.tsx
        DataTableRow.tsx
        DataTablePagination.tsx
        DataTableFilters.tsx
      StatsCards/
        StatsCard.tsx
        StatsGrid.tsx
      Forms/
        FormField.tsx
        FormSelect.tsx
        FormDatePicker.tsx
        FormCurrencyInput.tsx
      Modals/
        ConfirmModal.tsx
        FormModal.tsx
      EmptyStates/
        EmptyState.tsx
      LoadingStates/
        LoadingSpinner.tsx
        LoadingSkeleton.tsx
```

#### 2.2 Refatorar `products/page.tsx` (1.532 linhas → ~200 linhas)

**Antes:**

```typescript
// 1.532 linhas com tudo inline
export default function productsPage() {
  // 15+ useState
  // 5+ useEffect
  // Lógica de negócio
  // JSX gigantesco
  return <Layout>{/* 1.400+ linhas de JSX */}</Layout>;
}
```

**Depois:**

```typescript
// src/app/products/page.tsx (~200 linhas)
"use client";

import { ProductsList } from "@/components/products/ProductsList";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { ProductsStats } from "@/components/products/ProductsStats";
import Layout from "@/components/Layout";

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

**Componentes extraídos:**

```typescript
// src/components/products/ProductsList.tsx
"use client";

import { useProducts } from "@/hooks/queries/useProducts";
import { ProductCard } from "./ProductCard";
import { ProductTable } from "./ProductTable";
import { ProductFilters } from "./ProductFilters";
import { ProductEmptyState } from "./ProductEmptyState";
import { ProductLoadingState } from "./ProductLoadingState";

export function ProductsList() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data, isLoading, error } = useProducts({
    page,
    limit: itemsPerPage,
    search: searchTerm,
  });

  if (isLoading) return <ProductLoadingState />;
  if (error) return <div>Erro ao carregar produtos</div>;
  if (!data?.data?.length) return <ProductEmptyState />;

  return (
    <>
      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {viewMode === "grid" ? (
        <ProductCard products={data.data} />
      ) : (
        <ProductTable products={data.data} />
      )}
    </>
  );
}
```

#### 2.3 Criar Componentes Reutilizáveis

**DataTable Component:**

```typescript
// src/components/shared/DataTable/DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({ data, columns, ...props }: DataTableProps<T>) {
  // Implementação reutilizável
}
```

**StatsCards Component:**

```typescript
// src/components/shared/StatsCards/StatsGrid.tsx
interface Stat {
  label: string;
  value: string | number;
  icon: React.ComponentType;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
```

---

### Fase 3: Migração Completa para SDK (Prioridade MÉDIA-ALTA)

#### 3.1 Auditar e Migrar Todos os Serviços

**Checklist de migração:**

- [ ] `partners-service.ts` → SDK PartnersApiClient
- [ ] `nfe-service.ts` → SDK NFeApiClient
- [ ] `stock-service.ts` → SDK StockApiClient
- [ ] `purchase-orders-service.ts` → Completar migração
- [ ] `sales-orders-service.ts` → Completar migração
- [ ] `quotes-service.ts` → Completar migração
- [ ] `financial-accounts-service.ts` → Completar migração
- [ ] Remover `apiService` onde possível

**Template de migração:**

```typescript
// ANTES: src/services/partners-service.ts
import { apiService } from "@/lib/api";

export async function listPartners() {
  return apiService.get("/partners");
}

// DEPOIS: src/services/partners-service.ts
import { SdkClientFactory } from "@/lib/sdk/client-factory";
import { SdkErrorHandler } from "@/lib/sdk/error-handler";
import { normalizeListResponse } from "@/lib/sdk/response-normalizer";
import type { Partner, CreatePartnerDto, UpdatePartnerDto } from "@/types/sdk";

export async function listPartners(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ data: Partner[] }> {
  try {
    const partnersClient = SdkClientFactory.getPartnersClient();
    const { company_id, ...cleanParams } = params || {};
    const response = await partnersClient.findAll(cleanParams);

    return {
      data: normalizeListResponse<Partner>(response),
    };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function getPartner(id: string): Promise<Partner> {
  try {
    const partnersClient = SdkClientFactory.getPartnersClient();
    return await partnersClient.findOne(id);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function createPartner(
  payload: CreatePartnerDto
): Promise<Partner> {
  try {
    const partnersClient = SdkClientFactory.getPartnersClient();
    return await partnersClient.create(payload);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function updatePartner(
  id: string,
  payload: UpdatePartnerDto
): Promise<Partner> {
  try {
    const partnersClient = SdkClientFactory.getPartnersClient();
    return await partnersClient.update(id, payload);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function deletePartner(id: string) {
  try {
    const partnersClient = SdkClientFactory.getPartnersClient();
    await partnersClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}
```

#### 3.2 Criar Hooks React Query para Todos os Serviços

```typescript
// src/hooks/queries/usePartners.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
} from "@/services/partners-service";
import type { Partner, CreatePartnerDto, UpdatePartnerDto } from "@/types/sdk";

export const usePartners = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["partners", params],
    queryFn: () => listPartners(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePartner = (id: string) => {
  return useQuery({
    queryKey: ["partner", id],
    queryFn: () => getPartner(id),
    enabled: !!id,
  });
};

export const useCreatePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePartnerDto) => createPartner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
};

export const useUpdatePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerDto }) =>
      updatePartner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partner", variables.id] });
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
};
```

---

### Fase 4: Refatoração de Páginas Complexas (Prioridade ALTA)

#### 4.1 Refatorar Páginas de Pedidos (Compras/Vendas/Orçamentos)

**Estrutura proposta:**

```
src/
  app/
    purchases/
      [id]/
        page.tsx              # ~100 linhas (orquestração)
    components/
      orders/
        OrderForm/
          OrderFormProvider.tsx    # Context para estado do formulário
          OrderHeader.tsx
          OrderItems/
            OrderItemsList.tsx
            OrderItemRow.tsx
            OrderItemModal.tsx
          OrderTotals/
            OrderTotalsCard.tsx
            OrderTaxesCard.tsx
          OrderShipping/
            ShippingForm.tsx
            VehicleForm.tsx
          OrderActions.tsx
          OrderTabs.tsx
```

**Exemplo de refatoração:**

```typescript
// src/app/purchases/[id]/page.tsx (~100 linhas)
"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import { OrderFormProvider } from "@/components/orders/OrderForm/OrderFormProvider";
import { OrderForm } from "@/components/orders/OrderForm/OrderForm";
import { OrderLoadingState } from "@/components/orders/OrderLoadingState";

export default function PurchaseOrderPage() {
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === "novo";

  return (
    <Layout>
      <Suspense fallback={<OrderLoadingState />}>
        <OrderFormProvider orderId={isNew ? undefined : id}>
          <OrderForm type="purchase" />
        </OrderFormProvider>
      </Suspense>
    </Layout>
  );
}
```

```typescript
// src/components/orders/OrderForm/OrderFormProvider.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePurchaseOrder } from "@/hooks/queries/usePurchaseOrders";
import { useForm } from "react-hook-form";

interface OrderFormContextType {
  order: PurchaseOrder | null;
  isLoading: boolean;
  form: ReturnType<typeof useForm>;
  // ... outros estados
}

const OrderFormContext = createContext<OrderFormContextType | null>(null);

export function OrderFormProvider({
  orderId,
  children,
}: {
  orderId?: string;
  children: ReactNode;
}) {
  const { data: order, isLoading } = usePurchaseOrder(orderId || "");
  const form = useForm();

  // Lógica centralizada do formulário

  return (
    <OrderFormContext.Provider value={{ order, isLoading, form }}>
      {children}
    </OrderFormContext.Provider>
  );
}

export const useOrderForm = () => {
  const context = useContext(OrderFormContext);
  if (!context)
    throw new Error("useOrderForm must be used within OrderFormProvider");
  return context;
};
```

#### 4.2 Extrair Lógica de Negócio para Hooks Customizados

```typescript
// src/hooks/useOrderForm.ts
export function useOrderForm(orderId?: string) {
  const { data: order, isLoading } = usePurchaseOrder(orderId || "");
  const form = useForm();
  const { mutate: saveOrder } = useUpdatePurchaseOrder();
  const { mutate: createOrder } = useCreatePurchaseOrder();

  const handleSubmit = async (data: FormData) => {
    if (orderId) {
      saveOrder({ id: orderId, data });
    } else {
      createOrder(data);
    }
  };

  // Lógica de cálculo de totais
  const calculateTotals = useCallback((items: OrderItem[]) => {
    // ...
  }, []);

  // Lógica de impostos
  const calculateTaxes = useCallback(async (items: OrderItem[]) => {
    // ...
  }, []);

  return {
    order,
    isLoading,
    form,
    handleSubmit,
    calculateTotals,
    calculateTaxes,
  };
}
```

---

### Fase 5: Otimizações de Performance (Prioridade MÉDIA)

#### 5.1 Implementar Code Splitting

```typescript
// src/app/products/page.tsx
import dynamic from "next/dynamic";

const ProductsList = dynamic(
  () => import("@/components/products/ProductsList"),
  {
    loading: () => <ProductLoadingState />,
    ssr: false,
  }
);

const ProductsStats = dynamic(
  () => import("@/components/products/ProductsStats"),
  {
    loading: () => <StatsLoadingSkeleton />,
  }
);
```

#### 5.2 Memoização de Componentes

```typescript
// src/components/products/ProductCard.tsx
import { memo } from "react";

export const ProductCard = memo(
  ({ product, onEdit, onDelete }: ProductCardProps) => {
    // ...
  },
  (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.updatedAt === nextProps.product.updatedAt
    );
  }
);
```

#### 5.3 Virtualização de Listas Grandes

```typescript
// Para listas com muitos itens
import { useVirtualizer } from "@tanstack/react-virtual";

export function VirtualizedProductList({ products }: { products: Product[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ProductCard product={products[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Fase 6: Melhorias de UX e Acessibilidade (Prioridade MÉDIA)

#### 6.1 Estados de Loading Consistentes

```typescript
// src/components/shared/LoadingStates/LoadingSkeleton.tsx
export function ProductListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
```

#### 6.2 Tratamento de Erros Centralizado

```typescript
// src/components/shared/ErrorBoundary/ErrorBoundary.tsx
"use client";

import { Component, ReactNode } from "react";
import { ErrorFallback } from "./ErrorFallback";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

#### 6.3 Feedback Visual Consistente

```typescript
// src/hooks/useOptimisticMutation.ts
export function useOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    queryKey: QueryKey;
    onOptimisticUpdate: (variables: TVariables) => (old: any) => any;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: options.queryKey });
      const previousData = queryClient.getQueryData(options.queryKey);

      queryClient.setQueryData(
        options.queryKey,
        options.onOptimisticUpdate(variables)
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(options.queryKey, context?.previousData);
      toast.error("Erro ao salvar. Tente novamente.");
    },
    onSuccess: () => {
      toast.success("Salvo com sucesso!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    },
  });
}
```

---

## 📦 Estrutura de Arquivos Proposta

```
src/
  app/
    [rotas simplificadas]
      page.tsx              # Apenas orquestração (~50-200 linhas)

  components/
    [feature]/
      [ComponentName].tsx   # Componentes específicos da feature
    shared/
      DataTable/            # Componentes reutilizáveis
      Forms/
      Modals/
      LoadingStates/
      EmptyStates/
      StatsCards/

  hooks/
    queries/                # Hooks React Query
      useProducts.ts
      usePartners.ts
      useOrders.ts
      ...
    mutations/              # Hooks de mutations
      useProductMutations.ts
      ...
    [feature]/              # Hooks específicos de features
      useOrderForm.ts
      useProductFilters.ts
      ...

  services/                 # Serviços usando SDK
    products-service.ts
    partners-service.ts
    ...

  lib/
    sdk/                    # SDK wrapper (já existe)
    utils/
      cache.ts              # Utilitários de cache
      validation.ts
      ...

  types/
    [feature].ts            # Types específicos
    sdk.ts                  # Types do SDK
```

---

## 🚀 Plano de Implementação

### Sprint 1 (2 semanas) - Infraestrutura

- [ ] Instalar e configurar React Query
- [ ] Criar hooks base para queries
- [ ] Migrar 3-5 serviços para SDK
- [ ] Criar componentes base (DataTable, StatsCards, etc.)

### Sprint 2 (2 semanas) - Componentização Products

- [ ] Refatorar `products/page.tsx`
- [ ] Extrair todos os componentes de produtos
- [ ] Implementar hooks React Query para produtos
- [ ] Testes dos componentes

### Sprint 3 (2 semanas) - Componentização Orders

- [ ] Refatorar `purchases/[id]/page.tsx`
- [ ] Refatorar `sales/[id]/page.tsx`
- [ ] Refatorar `quotes/[id]/page.tsx`
- [ ] Extrair componentes comuns de orders

### Sprint 4 (2 semanas) - Migração SDK

- [ ] Migrar todos os serviços restantes para SDK
- [ ] Remover `apiService` onde possível
- [ ] Atualizar todos os hooks para usar SDK
- [ ] Testes de integração

### Sprint 5 (1 semana) - Otimizações

- [ ] Code splitting
- [ ] Memoização
- [ ] Virtualização onde necessário
- [ ] Performance audit

### Sprint 6 (1 semana) - Polimento

- [ ] Estados de loading consistentes
- [ ] Tratamento de erros
- [ ] Acessibilidade
- [ ] Documentação

---

## 📊 Métricas de Sucesso

### Antes da Refatoração

- ❌ Páginas com 1.500+ linhas
- ❌ 15+ useState por componente
- ❌ Sem cache (re-fetch constante)
- ❌ SDK parcialmente implementado
- ❌ Componentes não reutilizáveis
- ❌ Bundle size não otimizado

### Depois da Refatoração

- ✅ Páginas com <200 linhas
- ✅ Máximo 3-5 useState por componente
- ✅ Cache automático com React Query
- ✅ 100% dos serviços usando SDK
- ✅ Componentes reutilizáveis e testáveis
- ✅ Code splitting e bundle otimizado

---

## 🔧 Ferramentas e Bibliotecas Necessárias

### Dependências a Adicionar

```json
{
  "@tanstack/react-query": "^5.x",
  "@tanstack/react-query-devtools": "^5.x",
  "@tanstack/react-virtual": "^3.x",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",
  "zod": "^3.x" // Já existe, mas atualizar para v3
}
```

### Dependências Opcionais (Recomendadas)

```json
{
  "react-error-boundary": "^4.x",
  "@radix-ui/react-toast": "^1.x", // Se não estiver usando sonner
  "date-fns": "^3.x" // Já existe, atualizar
}
```

---

## 📝 Checklist de Refatoração por Página

Para cada página grande, seguir este checklist:

- [ ] **Análise**

  - [ ] Identificar responsabilidades
  - [ ] Listar estados e efeitos
  - [ ] Identificar componentes extraíveis

- [ ] **Componentização**

  - [ ] Extrair componentes de UI
  - [ ] Extrair lógica para hooks
  - [ ] Criar componentes reutilizáveis

- [ ] **Cache**

  - [ ] Criar hooks React Query
  - [ ] Substituir useState/useEffect por queries
  - [ ] Implementar mutations com invalidação

- [ ] **SDK**

  - [ ] Migrar serviços para SDK
  - [ ] Atualizar tipos
  - [ ] Remover chamadas diretas à API

- [ ] **Testes**

  - [ ] Testar componentes isolados
  - [ ] Testar hooks
  - [ ] Testar integração

- [ ] **Documentação**
  - [ ] Documentar componentes
  - [ ] Documentar hooks
  - [ ] Atualizar README

---

## 🎯 Prioridades de Implementação

### 🔴 CRÍTICO (Fazer Primeiro)

1. Implementar React Query
2. Refatorar `products/page.tsx` (exemplo)
3. Migrar serviços principais para SDK
4. Criar componentes base reutilizáveis

### 🟡 IMPORTANTE (Fazer Depois)

1. Refatorar páginas de orders
2. Migrar todos os serviços para SDK
3. Implementar code splitting
4. Otimizações de performance

### 🟢 DESEJÁVEL (Fazer Por Último)

1. Virtualização de listas
2. Melhorias de acessibilidade
3. Documentação completa
4. Testes E2E

---

## 📚 Referências e Boas Práticas

### React Query

- [Documentação Oficial](https://tanstack.com/query/latest)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)

### Componentização

- [React Component Patterns](https://reactpatterns.com/)
- [Composition vs Inheritance](https://react.dev/learn/composition-vs-inheritance)

### Performance

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Code Splitting in Next.js](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading)

---

## ✅ Conclusão

Esta refatoração massiva transformará o frontend em uma aplicação:

- **Escalável**: Componentes reutilizáveis e arquitetura limpa
- **Performática**: Cache inteligente e otimizações
- **Manutenível**: Código organizado e testável
- **Moderno**: Uso completo do SDK e React Query
- **Produtivo**: Desenvolvimento mais rápido com componentes prontos

**Próximos Passos:**

1. Revisar este documento com a equipe
2. Priorizar sprints baseado em necessidades de negócio
3. Começar pela Fase 1 (Infraestrutura)
4. Iterar e melhorar continuamente

---

**Documento criado em:** Janeiro 2025
**Versão:** 1.0
**Autor:** Análise Automatizada do Sistema
