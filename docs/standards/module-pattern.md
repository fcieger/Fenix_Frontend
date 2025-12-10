# Regras de Módulo - Padrão Products

## Objetivo

Este documento define as regras e padrões obrigatórios para criar novos módulos seguindo o padrão estabelecido pelo módulo de **products**. Este padrão garante consistência, manutenibilidade e escalabilidade em todo o projeto.

## Estrutura Completa do Módulo

### Diretórios Obrigatórios

```
src/
├── services/
│   └── {module}/                    # Pasta do módulo
│       ├── {module}-service.ts      # Service principal
│       └── {module}-transformers.ts # Transformadores
├── hooks/
│   └── queries/
│       └── use{Entity}s.ts          # Hooks React Query
└── types/
    └── sdk.ts                        # Tipos do SDK (já existente)
```

### Exemplo: Products

```
src/
├── services/
│   └── products/
│       ├── products-service.ts
│       └── products-transformers.ts
├── hooks/
│   └── queries/
│       └── useProducts.ts
```

---

## 1. Service Layer

### Referência

Ver documento completo: `docs/standards/service-layer-pattern.md`

### Regras Obrigatórias

1. **Estrutura de Diretórios**

   - ✅ Cada módulo DEVE ter sua pasta: `src/services/{module}/`
   - ✅ Service principal: `{module}-service.ts`
   - ✅ Transformers: `{module}-transformers.ts`

2. **Service Class**

   - ✅ DEVE estender `BaseService`
   - ✅ DEVE usar `SdkClientFactory` para obter o cliente SDK
   - ✅ DEVE implementar métodos: `list()`, `get()`, `create()`, `update()`, `delete()`
   - ✅ DEVE exportar instância singleton: `export const {entity}Service = new {Entity}Service()`
   - ✅ DEVE exportar funções para compatibilidade: `list{Entity}s`, `get{Entity}`, etc.

3. **Transformers**
   - ✅ DEVE ter arquivo separado: `{module}-transformers.ts`
   - ✅ DEVE implementar: `formatCreate{Entity}Request()`, `formatUpdate{Entity}Request()`, `format{Entity}Response()`, `format{Entity}ListResponse()`
   - ✅ DEVE usar transformadores comuns de `@/lib/services/transformers/common-transformers`

### Template de Service

```typescript
// src/services/{module}/{module}-service.ts
import { BaseService } from '@/lib/services/base-service';
import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { normalizeListResponse, normalizePaginatedResponse } from '@/lib/sdk/response-normalizer';
import type {
  {Entity},
  Create{Entity}Dto,
  Update{Entity}Dto,
  PaginatedResponse,
} from '@/types/sdk';
import {
  formatCreate{Entity}Request,
  formatUpdate{Entity}Request,
  format{Entity}Response,
  format{Entity}ListResponse,
} from './{module}-transformers';

/**
 * {Entity} Service
 * Uses SDK {Entity}ApiClient with request/response formatting
 */
class {Entity}Service extends BaseService<
  Create{Entity}Dto | Update{Entity}Dto,
  {Entity} | {Entity}[] | PaginatedResponse<{Entity}>,
  Create{Entity}Dto | Update{Entity}Dto,
  {Entity} | {Entity}[] | PaginatedResponse<{Entity}>
> {
  constructor() {
    super({
      formatResponse: (data) => {
        if (Array.isArray(data)) {
          return format{Entity}ListResponse(data) as any;
        }
        if ('data' in data && Array.isArray(data.data)) {
          return {
            ...data,
            data: format{Entity}ListResponse(data.data),
          } as any;
        }
        return format{Entity}Response(data as {Entity}) as any;
      },
    });
  }

  /**
   * List {entity}s with pagination and filters
   *
   * NOTE: company_id is handled automatically by JWT token (multi-tenant).
   * Do not pass company_id in params as it's extracted from the token.
   */
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<{Entity}> | { data: {Entity}[] }> {
    try {
      const client = SdkClientFactory.get{Entity}Client();
      // Remove company_id from params if present (handled by JWT)
      const { company_id, ...cleanParams } = params || {};
      const response = await client.findAll(cleanParams);

      // Normalizar resposta
      let normalized: PaginatedResponse<{Entity}> | {Entity}[];
      if (params?.page || params?.limit) {
        normalized = normalizePaginatedResponse<{Entity}>(response);
      } else {
        normalized = {
          data: normalizeListResponse<{Entity}>(response),
        } as any;
      }

      // Aplicar formatResponse
      return this.formatResponse(normalized) as PaginatedResponse<{Entity}> | { data: {Entity}[] };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get a single {entity} by ID
   */
  async get(id: string): Promise<{Entity}> {
    try {
      const client = SdkClientFactory.get{Entity}Client();
      const entity = await client.findOne(id);
      return this.formatResponse(entity) as {Entity};
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Create a new {entity}
   */
  async create(payload: Create{Entity}Dto): Promise<{Entity}> {
    try {
      const client = SdkClientFactory.get{Entity}Client();
      // Formatar request antes de enviar
      const formattedPayload = formatCreate{Entity}Request(payload);
      const entity = await client.create(formattedPayload);
      // Formatar response antes de retornar
      return this.formatResponse(entity) as {Entity};
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update an existing {entity}
   */
  async update(id: string, payload: Update{Entity}Dto): Promise<{Entity}> {
    try {
      const client = SdkClientFactory.get{Entity}Client();
      // Formatar request antes de enviar
      const formattedPayload = formatUpdate{Entity}Request(payload);
      const entity = await client.update(id, formattedPayload);
      // Formatar response antes de retornar
      return this.formatResponse(entity) as {Entity};
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete a {entity}
   */
  async delete(id: string) {
    try {
      const client = SdkClientFactory.get{Entity}Client();
      await client.delete(id);
      return { success: true };
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Export singleton instance
export const {entity}Service = new {Entity}Service();

// Export functions for backward compatibility
export const list{Entity}s = (params?: Parameters<{Entity}Service['list']>[0]) =>
  {entity}Service.list(params);
export const get{Entity} = (id: string) => {entity}Service.get(id);
export const create{Entity} = (payload: Create{Entity}Dto) => {entity}Service.create(payload);
export const update{Entity} = (id: string, payload: Update{Entity}Dto) =>
  {entity}Service.update(id, payload);
export const delete{Entity} = (id: string) => {entity}Service.delete(id);

// Legacy function names for backward compatibility (if applicable)
export const listar{Entity}s = list{Entity}s;
export const obter{Entity} = get{Entity};
export const criar{Entity} = create{Entity};
export const atualizar{Entity} = update{Entity};
export const excluir{Entity} = delete{Entity};
```

---

## 2. Hooks React Query

### Localização

`src/hooks/queries/use{Entity}s.ts`

### Regras Obrigatórias

1. **Query Options Pattern**

   - ✅ DEVE usar `queryOptions()` do React Query v5
   - ✅ DEVE exportar `{entity}sQueryOptions()` e `{entity}QueryOptions()`
   - ✅ DEVE usar `staleTime: 2 * 60 * 1000` (2 minutos) para listas

2. **Hooks de Query**

   - ✅ `use{Entity}s(params?)` - Lista
   - ✅ `use{Entity}(id, options?)` - Item único

3. **Hooks de Mutation**

   - ✅ `useCreate{Entity}()` - Criar
   - ✅ `useUpdate{Entity}()` - Atualizar
   - ✅ `useDelete{Entity}()` - Deletar

4. **Invalidação de Cache**
   - ✅ Create: invalida `["{entities}"]`
   - ✅ Update: invalida `["{entities}"]` e `["{entity}", id]`
   - ✅ Delete: invalida `["{entities}"]`

### Template de Hooks

```typescript
// src/hooks/queries/use{Entity}s.ts
import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import {
  list{Entity}s,
  get{Entity},
  create{Entity},
  update{Entity},
  delete{Entity},
} from "@/services/{module}/{module}-service";
import type {
  {Entity},
  Create{Entity}Dto,
  Update{Entity}Dto,
  {Entity}QueryParams,
  PaginatedResponse,
} from "@/types/sdk";

export type {Entity}QueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

/**
 * Query options for {entity}s list
 * Reutilizável e com melhor tipagem
 */
export const {entity}sQueryOptions = (params?: {Entity}QueryParams) =>
  queryOptions({
    queryKey: ["{entities}", params],
    queryFn: () => list{Entity}s(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

/**
 * Query options for a single {entity}
 * Reutilizável e com melhor tipagem
 */
export const {entity}QueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["{entity}", id],
    queryFn: () => get{Entity}(id),
  });

/**
 * Hook to fetch list of {entity}s
 */
export const use{Entity}s = (params?: {Entity}QueryParams) => {
  return useQuery({entity}sQueryOptions(params));
};

/**
 * Hook to fetch a single {entity} by ID
 */
export const use{Entity} = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    ...{entity}QueryOptions(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};

/**
 * Hook to create a new {entity}
 */
export const useCreate{Entity} = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Create{Entity}Dto) => create{Entity}(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["{entities}"] });
    },
  });
};

/**
 * Hook to update an existing {entity}
 */
export const useUpdate{Entity} = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Update{Entity}Dto }) =>
      update{Entity}(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["{entities}"] });
      queryClient.invalidateQueries({ queryKey: ["{entity}", variables.id] });
    },
  });
};

/**
 * Hook to delete a {entity}
 */
export const useDelete{Entity} = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => delete{Entity}(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["{entities}"] });
    },
  });
};
```

### Exportação no Index

```typescript
// src/hooks/queries/index.ts
export * from "./use{Entity}s";
```

### Nota sobre Imports

**Import correto (padrão):**

```typescript
import { listProducts } from "@/services/products/products-service";
```

**Re-export para compatibilidade (opcional):**
Se necessário manter compatibilidade com código antigo, pode-se criar um arquivo `src/services/{module}-service.ts` que re-exporta do novo caminho:

```typescript
// src/services/{module}-service.ts
/**
 * @deprecated Use @/services/{module}/{module}-service instead
 */
export * from "./{module}/{module}-service";
```

---

## 3. Transformers

### Localização

`src/services/{module}/{module}-transformers.ts`

### Regras Obrigatórias

1. **Funções Obrigatórias**

   - ✅ `formatCreate{Entity}Request(payload: Create{Entity}Dto): Create{Entity}Dto`
   - ✅ `formatUpdate{Entity}Request(payload: Update{Entity}Dto): Update{Entity}Dto`
   - ✅ `format{Entity}Response(entity: {Entity}): {Entity}`
   - ✅ `format{Entity}ListResponse(entities: {Entity}[]): {Entity}[]`

2. **Boas Práticas**
   - ✅ Usar transformadores comuns: `normalizeString()`, `normalizeNumber()`, `normalizeCode()`
   - ✅ Funções devem ser puras (sem side effects)
   - ✅ Reutilizar `formatCreate{Entity}Request` em `formatUpdate{Entity}Request` quando possível

### Template de Transformers

```typescript
// src/services/{module}/{module}-transformers.ts
import type { Create{Entity}Dto, Update{Entity}Dto, {Entity} } from '@/types/sdk';
import {
  normalizeString,
  normalizeNumber,
  normalizeCode,
} from '@/lib/services/transformers/common-transformers';

/**
 * Formata o payload de criação de {entity} antes de enviar
 */
export function formatCreate{Entity}Request(
  payload: Create{Entity}Dto
): Create{Entity}Dto {
  const formatted = { ...payload };

  // Normalizar strings
  if (formatted.name) {
    formatted.name = normalizeString(formatted.name);
  }

  // Normalizar códigos
  if (formatted.code) {
    formatted.code = normalizeCode(formatted.code);
  }

  // Normalizar números
  if (formatted.price !== undefined) {
    formatted.price = normalizeNumber(formatted.price);
  }

  return formatted;
}

/**
 * Formata o payload de atualização de {entity}
 */
export function formatUpdate{Entity}Request(
  payload: Update{Entity}Dto
): Update{Entity}Dto {
  // Reutilizar formatação de criação se aplicável
  return formatCreate{Entity}Request(payload as Create{Entity}Dto) as Update{Entity}Dto;
}

/**
 * Formata a resposta do {entity} após receber da API
 */
export function format{Entity}Response(entity: {Entity}): {Entity} {
  const formatted = { ...entity };

  // Garantir tipos corretos
  if (formatted.price !== undefined) {
    formatted.price = normalizeNumber(formatted.price);
  }

  return formatted;
}

/**
 * Formata lista de {entity}s
 */
export function format{Entity}ListResponse(entities: {Entity}[]): {Entity}[] {
  return entities.map(format{Entity}Response);
}
```

---

## 4. Estrutura de Rotas (Next.js App Router)

### Padrão de Rotas Obrigatório

```
src/app/{module}/
├── page.tsx              # Lista de {entities}
├── create/
│   └── page.tsx          # Criar novo {entity}
└── edit/
    └── [id]/
        └── page.tsx      # Editar {entity} existente
```

### Regras Obrigatórias

1. **Rota de Listagem**

   - ✅ DEVE estar em `src/app/{module}/page.tsx`
   - ✅ URL: `/{module}`

2. **Rota de Criação**

   - ✅ DEVE estar em `src/app/{module}/create/page.tsx`
   - ✅ URL: `/{module}/create`

3. **Rota de Edição**
   - ✅ DEVE estar em `src/app/{module}/edit/[id]/page.tsx`
   - ✅ URL: `/{module}/edit/{id}`
   - ✅ DEVE usar `useParams()` para obter o `id`
   - ✅ DEVE validar autenticação antes de renderizar

### Template de Rota de Edição

```typescript
// src/app/{module}/edit/[id]/page.tsx
"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import { {Entity}FormPage } from "@/components/{module}/{Entity}FormPage";

function {Entity}EditPageContent() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600">ID do {entity} não encontrado</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <{Entity}FormPage {entity}Id={id} />
    </Layout>
  );
}

export default function {Entity}EditPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando...</p>
            </div>
          </div>
        </Layout>
      }
    >
      <{Entity}EditPageContent />
    </Suspense>
  );
}
```

### Exemplo: Products

```
src/app/products/
├── page.tsx              # /products
├── create/
│   └── page.tsx          # /products/create
└── edit/
    └── [id]/
        └── page.tsx     # /products/edit/{id}
```

### ❌ Padrão Antigo (NÃO usar)

- ❌ `/{module}/[id]/edit` - ID antes de edit
- ❌ `/{module}/novo?edit=true&id={id}` - Query params para edição
- ❌ `/{module}/editar?id={id}` - Rota separada com query params

### ✅ Padrão Novo (Obrigatório)

- ✅ `/{module}/edit/{id}` - Edit antes do ID (padrão RESTful)
- ✅ Rota dedicada para edição
- ✅ ID como parâmetro de rota, não query param

---

## 4.1. Padrão de Formulário Unificado (Create/Update)

### Princípio Fundamental

**Um único componente de formulário DEVE ser responsável tanto pela criação quanto pela atualização de entidades.** Este padrão elimina duplicação de código, facilita manutenção e garante consistência entre os fluxos de criação e edição.

### Regras Obrigatórias

1. **Componente Unificado**

   - ✅ DEVE existir um componente `{Entity}FormPage` em `src/components/{module}/{Entity}FormPage.tsx`
   - ✅ DEVE aceitar um prop opcional `{entity}Id?: string`
   - ✅ DEVE detectar automaticamente o modo (criação ou edição) baseado na presença do `{entity}Id`
   - ✅ DEVE usar hooks diferentes para create e update (`useCreate{Entity}`, `useUpdate{Entity}`)

2. **Rotas Simplificadas**

   - ✅ Rota de criação: apenas renderiza `<{Entity}FormPage />` sem props
   - ✅ Rota de edição: renderiza `<{Entity}FormPage {entity}Id={id} />` com o ID
   - ✅ Rotas NÃO devem conter lógica de formulário, apenas passar props

3. **Lógica do Componente**
   - ✅ DEVE usar `const isEditMode = !!{entity}Id` para determinar o modo
   - ✅ DEVE carregar dados apenas quando `isEditMode === true`
   - ✅ DEVE usar `use{Entity}({entity}Id)` com `enabled: isEditMode && !!{entity}Id`
   - ✅ DEVE preencher formulário via `useEffect` quando dados carregarem (modo edição)
   - ✅ DEVE usar mutation apropriada baseado no modo (`create` ou `update`)

### Template de Componente de Formulário

```typescript
// src/components/{module}/{Entity}FormPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use{Entity}, useCreate{Entity}, useUpdate{Entity} } from "@/hooks/queries/use{Entity}s";
import type { Create{Entity}Dto, Update{Entity}Dto } from "@/types/sdk";

interface {Entity}FormPageProps {
  {entity}Id?: string;
}

export function {Entity}FormPage({ {entity}Id }: {Entity}FormPageProps) {
  const router = useRouter();
  const isEditMode = !!{entity}Id;

  // Hooks React Query
  const { data: {entity}, isLoading: isLoading{Entity}, error: {entity}Error } = use{Entity}({entity}Id || "", {
    enabled: isEditMode && !!{entity}Id,
  });
  const create{Entity}Mutation = useCreate{Entity}();
  const update{Entity}Mutation = useUpdate{Entity}();

  const [formData, setFormData] = useState({
    // Campos iniciais vazios
  });

  // Preencher formulário quando {entity} carregar (modo edição)
  useEffect(() => {
    if (isEditMode && {entity}) {
      setFormData({
        // Mapear dados do {entity} para formData
      });
    }
  }, [{entity}, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && {entity}Id) {
      // Modo edição
      update{Entity}Mutation.mutate(
        { id: {entity}Id, data: formData as Update{Entity}Dto },
        {
          onSuccess: () => {
            router.push("/{module}");
          },
        }
      );
    } else {
      // Modo criação
      create{Entity}Mutation.mutate(formData as Create{Entity}Dto, {
        onSuccess: () => {
          router.push("/{module}");
        },
      });
    }
  };

  // Loading state (apenas no modo edição)
  if (isEditMode && isLoading{Entity}) {
    return <LoadingState />;
  }

  // Error state (apenas no modo edição)
  if (isEditMode && {entity}Error) {
    return <ErrorState error={entity}Error} />;
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
      <button type="submit">
        {isEditMode ? "Atualizar" : "Criar"} {Entity}
      </button>
    </form>
  );
}
```

### Template de Rota de Criação

```typescript
// src/app/{module}/create/page.tsx
"use client";

import { Suspense } from "react";
import Layout from "@/components/Layout";
import { {Entity}FormPage } from "@/components/{module}/{Entity}FormPage";

function Create{Entity}PageContent() {
  return (
    <Layout>
      <{Entity}FormPage />
    </Layout>
  );
}

export default function Create{Entity}Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Create{Entity}PageContent />
    </Suspense>
  );
}
```

### Template de Rota de Edição

```typescript
// src/app/{module}/edit/[id]/page.tsx
"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import { {Entity}FormPage } from "@/components/{module}/{Entity}FormPage";

function {Entity}EditPageContent() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600">ID do {entity} não encontrado</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <{Entity}FormPage {entity}Id={id} />
    </Layout>
  );
}

export default function {Entity}EditPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <{Entity}EditPageContent />
    </Suspense>
  );
}
```

### Exemplo Real: Products

**Componente Unificado:**

- `src/components/products/ProductFormPage.tsx` - Aceita `productId?: string`
- Detecta modo: `const isEditMode = !!productId`
- Carrega dados apenas quando `isEditMode === true`

**Rotas:**

- `src/app/products/create/page.tsx` - Renderiza `<ProductFormPage />`
- `src/app/products/edit/[id]/page.tsx` - Renderiza `<ProductFormPage productId={id} />`

### ❌ Padrão Antigo (NÃO usar)

- ❌ Lógica de formulário dentro das rotas (`create/page.tsx` e `edit/[id]/page.tsx`)
- ❌ Componentes separados para create e edit (`Create{Entity}Form.tsx` e `Edit{Entity}Form.tsx`)
- ❌ Query params para determinar modo (`?edit=true&id={id}`)
- ❌ Duplicação de código entre criação e edição

### ✅ Padrão Novo (Obrigatório)

- ✅ Componente único `{Entity}FormPage` que funciona para ambos os casos
- ✅ Rotas apenas passam props (sem lógica de formulário)
- ✅ Detecção automática de modo baseado em props
- ✅ Reutilização completa de lógica e UI

### Benefícios

1. **DRY (Don't Repeat Yourself)**: Uma única fonte de verdade para o formulário
2. **Manutenibilidade**: Mudanças em um lugar afetam ambos os fluxos
3. **Consistência**: Garante que criação e edição tenham o mesmo comportamento
4. **Testabilidade**: Mais fácil testar um único componente
5. **Simplicidade**: Rotas mais simples e focadas apenas em roteamento

---

## 5. Convenções de Nomenclatura

### Service

- Classe: `{Entity}Service` (PascalCase)
- Instância: `{entity}Service` (camelCase)
- Funções: `list{Entity}s`, `get{Entity}`, `create{Entity}`, `update{Entity}`, `delete{Entity}`

### Hooks

- Lista: `use{Entity}s` (plural)
- Item: `use{Entity}` (singular)
- Mutations: `useCreate{Entity}`, `useUpdate{Entity}`, `useDelete{Entity}`
- Query Options: `{entity}sQueryOptions`, `{entity}QueryOptions`

### Transformers

- Request: `formatCreate{Entity}Request`, `formatUpdate{Entity}Request`
- Response: `format{Entity}Response`, `format{Entity}ListResponse`

### Query Keys

- Lista: `["{entities}"]` (plural, lowercase)
- Item: `["{entity}", id]` (singular, lowercase)

---

## 6. Checklist de Implementação

### Preparação

- [ ] Verificar se o SDK tem o cliente correspondente (`SdkClientFactory.get{Entity}Client()`)
- [ ] Verificar tipos no `@/types/sdk` (`{Entity}`, `Create{Entity}Dto`, `Update{Entity}Dto`)
- [ ] Criar pasta `src/services/{module}/`

### Service

- [ ] Criar `{module}-service.ts` estendendo `BaseService`
- [ ] Implementar método `list()` com normalização e formatação
- [ ] Implementar método `get()` com formatação
- [ ] Implementar método `create()` com `formatRequest` e `formatResponse`
- [ ] Implementar método `update()` com `formatRequest` e `formatResponse`
- [ ] Implementar método `delete()`
- [ ] Exportar instância singleton
- [ ] Exportar funções para compatibilidade

### Transformers

- [ ] Criar `{module}-transformers.ts`
- [ ] Implementar `formatCreate{Entity}Request()`
- [ ] Implementar `formatUpdate{Entity}Request()`
- [ ] Implementar `format{Entity}Response()`
- [ ] Implementar `format{Entity}ListResponse()`
- [ ] Reutilizar transformadores comuns quando possível

### Hooks

- [ ] Criar `src/hooks/queries/use{Entity}s.ts`
- [ ] Implementar `{entity}sQueryOptions()` com `queryOptions()`
- [ ] Implementar `{entity}QueryOptions()` com `queryOptions()`
- [ ] Implementar `use{Entity}s()` hook
- [ ] Implementar `use{Entity}()` hook
- [ ] Implementar `useCreate{Entity}()` com invalidação
- [ ] Implementar `useUpdate{Entity}()` com invalidação
- [ ] Implementar `useDelete{Entity}()` com invalidação
- [ ] Exportar no `src/hooks/queries/index.ts`

### Rotas (Next.js App Router)

- [ ] Criar `src/app/{module}/page.tsx` (lista)
- [ ] Criar `src/app/{module}/create/page.tsx` (criação)
- [ ] Criar `src/app/{module}/edit/[id]/page.tsx` (edição)
- [ ] Implementar validação de autenticação nas rotas
- [ ] Implementar tratamento de erros nas rotas
- [ ] Atualizar links/navegação para usar rotas corretas

### Validação

- [ ] Testar listagem com parâmetros
- [ ] Testar busca por ID
- [ ] Testar criação
- [ ] Testar atualização
- [ ] Testar deleção
- [ ] Verificar invalidação de cache
- [ ] Verificar formatação de requests
- [ ] Verificar formatação de responses

---

## 7. Exemplo Completo: Products

### Estrutura

```
src/
├── services/
│   └── products/
│       ├── products-service.ts
│       └── products-transformers.ts
└── hooks/
    └── queries/
        └── useProducts.ts
```

### Referências

- Service: `src/services/products/products-service.ts`
- Transformers: `src/services/products/products-transformers.ts`
- Hooks: `src/hooks/queries/useProducts.ts`

---

## 8. Diferenças com Módulos Antigos

### ❌ Padrão Antigo (NÃO usar)

- Service na raiz: `src/services/{module}-service.ts`
- Sem transformers separados
- Sem queryOptions pattern
- Hooks sem tipagem adequada

### ✅ Padrão Novo (Obrigatório)

- Service em pasta: `src/services/{module}/{module}-service.ts`
- Transformers separados: `{module}-transformers.ts`
- QueryOptions pattern para reutilização
- Tipagem completa com TypeScript

---

## Referências

- [Service Layer Pattern](./service-layer-pattern.md)
- [React Query Guide](../react-query-guide.md)
- [SDK Migration Summary](../planning/sdk-migration-summary.md)

---

**Última atualização:** 2024-12-24
**Mantenedor:** Equipe de Desenvolvimento Fenix
**Versão:** 1.0.0
