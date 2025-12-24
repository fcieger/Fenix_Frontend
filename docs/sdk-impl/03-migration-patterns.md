# Padrões de Migração SDK - Guia Rápido

**Objetivo:** Referência rápida para migrar código para usar SDK

---

## 🎯 Antes de Começar

### Verificar se SDK tem o Client

```bash
# No repositório do SDK
grep -r "class.*ApiClient" src/
```

### Verificar se Service existe

```bash
# No frontend
ls src/services/ | grep "nome"
```

---

## 📋 Padrão 1: Página com Fetch Direto → Service

### ❌ ANTES (Antipadrão)

```typescript
// src/app/(protected)/products/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const token = localStorage.getItem('fenix_token');
        const response = await fetch('/api/products', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <div>
      {loading ? 'Loading...' : products.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  );
}
```

### ✅ DEPOIS (Usando Service)

```typescript
// src/app/(protected)/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { listProducts } from '@/services/products-service';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await listProducts();
        setProducts(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error loading products');
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {loading ? 'Loading...' : products.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  );
}
```

---

## 📋 Padrão 2: Service com API Route → SDK

### ❌ ANTES (Service com fetch)

```typescript
// src/services/products-service.ts

export async function listProducts(filters?: ProductFilters) {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append('search', filters.search);

    const token = localStorage.getItem('fenix_token');
    const response = await fetch(`/api/products?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return data.products || data;
  } catch (error) {
    console.error('Error in listProducts:', error);
    throw error;
  }
}
```

### ✅ DEPOIS (Service com SDK)

```typescript
// src/services/products-service.ts
import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Products Service
 * Uses ProductsApiClient from SDK
 */

export async function listProducts(filters?: ProductFilters) {
  try {
    const client = SdkClientFactory.getProductsClient();
    const response = await client.list(filters);
    return response.data || response;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function getProduct(id: string) {
  try {
    const client = SdkClientFactory.getProductsClient();
    return await client.get(id);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function createProduct(data: CreateProductRequest) {
  try {
    const client = SdkClientFactory.getProductsClient();
    return await client.create(data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function updateProduct(id: string, data: UpdateProductRequest) {
  try {
    const client = SdkClientFactory.getProductsClient();
    return await client.update(id, data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function deleteProduct(id: string) {
  try {
    const client = SdkClientFactory.getProductsClient();
    return await client.delete(id);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Backward compatibility (Portuguese aliases)
export const listarProdutos = listProducts;
export const obterProduto = getProduct;
export const criarProduto = createProduct;
export const atualizarProduto = updateProduct;
export const deletarProduto = deleteProduct;
```

---

## 📋 Padrão 3: Componente com Fetch → Service

### ❌ ANTES (Component com fetch)

```typescript
// src/components/ProductSelector.tsx
'use client';

import { useState, useEffect } from 'react';

interface ProductSelectorProps {
  onSelect: (product: any) => void;
}

export function ProductSelector({ onSelect }: ProductSelectorProps) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <select onChange={(e) => onSelect(products[e.target.value])}>
      {products.map((p, i) => (
        <option key={p.id} value={i}>{p.name}</option>
      ))}
    </select>
  );
}
```

### ✅ DEPOIS (Component com Service)

```typescript
// src/components/ProductSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { listProducts } from '@/services/products-service';

interface ProductSelectorProps {
  onSelect: (product: any) => void;
}

export function ProductSelector({ onSelect }: ProductSelectorProps) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await listProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading products');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <select onChange={(e) => onSelect(products[e.target.value])}>
      {products.map((p, i) => (
        <option key={p.id} value={i}>{p.name}</option>
      ))}
    </select>
  );
}
```

### ✅ MELHOR AINDA (Component com Hook)

```typescript
// src/hooks/queries/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { listProducts } from '@/services/products-service';

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => listProducts(filters),
  });
}
```

```typescript
// src/components/ProductSelector.tsx
'use client';

import { useProducts } from '@/hooks/queries/useProducts';

interface ProductSelectorProps {
  onSelect: (product: any) => void;
}

export function ProductSelector({ onSelect }: ProductSelectorProps) {
  const { data: products = [], isLoading, error } = useProducts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <select onChange={(e) => onSelect(products[e.target.value])}>
      {products.map((p, i) => (
        <option key={p.id} value={i}>{p.name}</option>
      ))}
    </select>
  );
}
```

---

## 📋 Padrão 4: Criar Novo Service (Quando SDK existe)

### Estrutura Completa

```typescript
// src/services/example-service.ts
import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';
import type {
  Example,
  CreateExampleRequest,
  UpdateExampleRequest,
  ExampleFilters,
  PaginatedResponse
} from '@fenix/api-sdk';

/**
 * Example Service
 * Uses ExampleApiClient from SDK
 *
 * This service provides a clean interface for example operations,
 * handling SDK client creation and error management.
 */

// ==================== LIST ====================

/**
 * List examples with optional filters
 * @param filters - Optional filters (search, pagination, etc)
 * @returns Paginated list of examples
 */
export async function listExamples(
  filters?: ExampleFilters
): Promise<PaginatedResponse<Example>> {
  try {
    const client = SdkClientFactory.getExampleClient();
    return await client.list(filters);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// ==================== GET ====================

/**
 * Get a single example by ID
 * @param id - Example ID
 * @returns Example details
 */
export async function getExample(id: string): Promise<Example> {
  try {
    const client = SdkClientFactory.getExampleClient();
    return await client.get(id);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// ==================== CREATE ====================

/**
 * Create a new example
 * @param data - Example data
 * @returns Created example
 */
export async function createExample(
  data: CreateExampleRequest
): Promise<Example> {
  try {
    const client = SdkClientFactory.getExampleClient();
    return await client.create(data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// ==================== UPDATE ====================

/**
 * Update an existing example
 * @param id - Example ID
 * @param data - Updated data
 * @returns Updated example
 */
export async function updateExample(
  id: string,
  data: UpdateExampleRequest
): Promise<Example> {
  try {
    const client = SdkClientFactory.getExampleClient();
    return await client.update(id, data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// ==================== DELETE ====================

/**
 * Delete an example
 * @param id - Example ID
 */
export async function deleteExample(id: string): Promise<void> {
  try {
    const client = SdkClientFactory.getExampleClient();
    await client.delete(id);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// ==================== CUSTOM OPERATIONS ====================

/**
 * Custom operation example
 * @param id - Example ID
 * @param data - Operation data
 */
export async function customOperation(
  id: string,
  data: any
): Promise<void> {
  try {
    const client = SdkClientFactory.getExampleClient();
    await client.customOperation(id, data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// ==================== BACKWARD COMPATIBILITY ====================

/**
 * Portuguese aliases for backward compatibility
 * Keep these until all code is migrated
 */
export const listarExemplos = listExamples;
export const obterExemplo = getExample;
export const criarExemplo = createExample;
export const atualizarExemplo = updateExample;
export const deletarExemplo = deleteExample;
export const operacaoCustomizada = customOperation;
```

### Checklist para Novo Service

- [ ] Importar `SdkClientFactory` e `SdkErrorHandler`
- [ ] Importar tipos do SDK (`@fenix/api-sdk`)
- [ ] Adicionar JSDoc comments
- [ ] Implementar CRUD básico (list, get, create, update, delete)
- [ ] Adicionar operações customizadas se necessário
- [ ] Try-catch com SdkErrorHandler em todas as funções
- [ ] Criar aliases em português para compatibilidade
- [ ] Exportar todas as funções e aliases

---

## 📋 Padrão 5: Service Sem SDK (Temporário)

### Quando SDK NÃO tem o Client

```typescript
// src/services/example-service.ts
import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Example Service
 * Uses Next.js API routes
 *
 * NOTE: This service uses direct API routes because there's no ExampleApiClient in the SDK.
 *
 * TODO: Add ExampleApiClient to the SDK package
 * TODO: Migrate this service to use SDK when available
 */

export async function listExamples(filters?: any) {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append('search', filters.search);

    const response = await fetch(`/api/examples?${queryParams.toString()}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error fetching examples');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// ... outros métodos
```

### Importante

- Documentar CLARAMENTE que usa API routes
- Adicionar TODOs para migração futura
- Usar SdkErrorHandler mesmo assim (consistência)
- Quando SDK ficar disponível, migrar para Padrão 4

---

## 📋 Padrão 6: Adicionar Client ao SDK Package

### No repositório do SDK

```typescript
// packages/sdk/src/clients/ExampleApiClient.ts
import { BaseApiClient } from './BaseApiClient';
import type {
  Example,
  CreateExampleRequest,
  UpdateExampleRequest,
  ExampleFilters,
  PaginatedResponse
} from '../types';

export class ExampleApiClient extends BaseApiClient {
  private readonly basePath = '/examples';

  /**
   * List examples
   */
  async list(filters?: ExampleFilters): Promise<PaginatedResponse<Example>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.get(`${this.basePath}?${params.toString()}`);
  }

  /**
   * Get example by ID
   */
  async get(id: string): Promise<Example> {
    return this.get(`${this.basePath}/${id}`);
  }

  /**
   * Create example
   */
  async create(data: CreateExampleRequest): Promise<Example> {
    return this.post(this.basePath, data);
  }

  /**
   * Update example
   */
  async update(id: string, data: UpdateExampleRequest): Promise<Example> {
    return this.put(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete example
   */
  async delete(id: string): Promise<void> {
    return this.delete(`${this.basePath}/${id}`);
  }

  /**
   * Custom operation
   */
  async customOperation(id: string, data: any): Promise<void> {
    return this.post(`${this.basePath}/${id}/custom`, data);
  }
}
```

### Exportar no Index

```typescript
// packages/sdk/src/index.ts
export { ExampleApiClient } from './clients/ExampleApiClient';
export type { Example, CreateExampleRequest, UpdateExampleRequest } from './types';
```

---

## 📋 Padrão 7: Atualizar Client Factory

### Depois de adicionar client ao SDK

```typescript
// src/lib/sdk/client-factory.ts

/**
 * Get Example API client
 */
static getExampleClient(): any {
  const SdkModule = this.getSdkModule();
  return this.getClient("example", SdkModule.ExampleApiClient);
}
```

---

## 🔍 Encontrar Código para Migrar

### Buscar fetch direto

```bash
# Páginas com fetch
grep -r "fetch\(" src/app/(protected) --include="*.tsx" --include="*.ts"

# Componentes com fetch
grep -r "fetch\(" src/components --include="*.tsx" --include="*.ts"

# Services com fetch
grep -r "fetch\(" src/services --include="*.ts"
```

### Buscar uso de lib/api legacy

```bash
grep -r "from '@/lib/api'" src/ --include="*.tsx" --include="*.ts"
```

### Buscar axios

```bash
grep -r "axios\." src/ --include="*.tsx" --include="*.ts"
```

---

## ✅ Checklist de Migração

### Para cada Página/Componente

- [ ] Identificar todas as chamadas fetch/axios
- [ ] Verificar se service existe
- [ ] Se não existe, criar service primeiro
- [ ] Substituir fetch por import do service
- [ ] Adicionar tratamento de erro apropriado
- [ ] Remover código de autenticação manual (token)
- [ ] Testar funcionalidade
- [ ] Atualizar testes se houver
- [ ] Code review
- [ ] Deploy

### Para cada Service

- [ ] Verificar se SDK tem o client
- [ ] Se não tem, documentar e adicionar TODOs
- [ ] Se tem, importar SdkClientFactory e SdkErrorHandler
- [ ] Substituir fetch por SDK client
- [ ] Manter estrutura de funções igual
- [ ] Adicionar aliases para compatibilidade
- [ ] Atualizar JSDoc
- [ ] Testar todas as operações
- [ ] Atualizar testes

---

## 🚫 Antipadrões Comuns

### ❌ Não fazer

```typescript
// NÃO: Misturar fetch direto com SDK na mesma função
async function getProduct(id: string) {
  const response = await fetch(`/api/products/${id}`);
  return response.json();
}

// NÃO: Ignorar erros
async function getProduct(id: string) {
  const client = SdkClientFactory.getProductsClient();
  return await client.get(id); // Sem try-catch!
}

// NÃO: Acessar token manualmente quando usando SDK
async function getProduct(id: string) {
  const token = localStorage.getItem('fenix_token'); // Desnecessário!
  const client = SdkClientFactory.getProductsClient();
  return await client.get(id);
}

// NÃO: Duplicar lógica de negócio em múltiplos lugares
// Componente 1
async function loadProducts() {
  const response = await fetch('/api/products');
  // ... lógica
}

// Componente 2
async function getProducts() {
  const response = await fetch('/api/products');
  // ... mesma lógica
}
```

### ✅ Fazer

```typescript
// SIM: Usar service em todo lugar
import { getProduct } from '@/services/products-service';

// Service já tem SDK, erro handling, etc
const product = await getProduct(id);

// SIM: Centralizar lógica no service
// Service
export async function getProduct(id: string) {
  try {
    const client = SdkClientFactory.getProductsClient();
    return await client.get(id);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Componente usa service
import { getProduct } from '@/services/products-service';
const product = await getProduct(id);
```

---

## 📚 Exemplos Completos

### Exemplo 1: Migração Completa PDV

**Antes:**
```typescript
// page.tsx - ~150 linhas
const [caixas, setCaixas] = useState([]);

useEffect(() => {
  async function loadCaixas() {
    const token = localStorage.getItem('fenix_token');
    const res = await fetch('/api/pdv/caixas', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setCaixas(data);
  }
  loadCaixas();
}, []);

// ... outros fetches similares
```

**Depois:**
```typescript
// page.tsx
import { listRegisters } from '@/services/point-of-sale-service';

const [caixas, setCaixas] = useState([]);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function loadCaixas() {
    try {
      const data = await listRegisters();
      setCaixas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar caixas');
    }
  }
  loadCaixas();
}, []);
```

---

## 🎓 Dicas Avançadas

### 1. React Query para Caching

```typescript
// Hook com React Query
import { useQuery } from '@tanstack/react-query';
import { listProducts } from '@/services/products-service';

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => listProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
```

### 2. Mutations com React Query

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct } from '@/services/products-service';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidar cache para recarregar lista
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

### 3. Optimistic Updates

```typescript
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ['products', id] });

      // Snapshot do valor anterior
      const previous = queryClient.getQueryData(['products', id]);

      // Atualizar otimisticamente
      queryClient.setQueryData(['products', id], data);

      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Rollback em caso de erro
      if (context?.previous) {
        queryClient.setQueryData(['products', context.id], context.previous);
      }
    },
  });
}
```

---

## 🔗 Links Úteis

- [Documentação SDK](../../api/sdk.md)
- [Service Layer Pattern](../../standards/service-layer-pattern.md)
- [Análise Completa](./01-analise-completa.md)
- [Plano de Ação](./02-plano-acao.md)

---

*Última atualização: 24/12/2025*

