# 📚 Documentação: Implementação do @fenix/api-sdk

> **Versão:** 1.0.0
> **Última atualização:** 2024
> **Framework:** Next.js 16

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura do Serviço](#-arquitetura-do-serviço)
- [Detecção Automática Client/Server](#-detecção-automática-clientserver)
- [Módulos Disponíveis](#-módulos-disponíveis)
- [Exemplos de Uso](#-exemplos-de-uso)
- [Gerenciamento de Tokens](#-gerenciamento-de-tokens)
- [Configuração](#-configuração)
- [Boas Práticas](#-boas-práticas)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

O projeto utiliza o pacote `@fenix/api-sdk` para comunicação com o backend da aplicação Fenix. A implementação foi projetada para funcionar de forma transparente tanto em **Client Components** quanto em **Server Components** do Next.js 16, utilizando um padrão Singleton que detecta automaticamente o ambiente de execução.

### Características Principais

- ✅ **Detecção automática** de ambiente (client/server)
- ✅ **Gerenciamento centralizado** de tokens de autenticação
- ✅ **Tipagem forte** com TypeScript
- ✅ **Padrão Singleton** para garantir uma única instância
- ✅ **Suporte completo** a todos os módulos do SDK
- ✅ **Lazy loading** de instâncias dos clients

### Estrutura de Arquivos

```
lib/services/fenix/
├── fenix-service.ts          # Serviço singleton principal
├── fenix-service-client.ts   # Implementação para client components
├── fenix-service-server.ts   # Implementação para server components
├── types/
│   └── types.ts              # Tipos TypeScript compartilhados
└── index.ts                  # Exports principais
```

---

## 🏗️ Arquitetura do Serviço

### Padrão Singleton

O `FenixService` utiliza o padrão Singleton para garantir que apenas uma instância seja criada por ambiente (client ou server), otimizando o uso de memória e garantindo consistência na configuração.

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FenixService (Singleton)                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  getInstance(token?: string)                          │ │
│  │  ├─ Detecta ambiente (client/server)                   │ │
│  │  ├─ Client: FenixServiceClient                        │ │
│  │  └─ Server: FenixServiceServer                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Propriedades Estáticas (apenas client)              │ │
│  │  ├─ auth, products, partners, quotes, etc.          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│ FenixServiceClient│          │ FenixServiceServer│
│                  │          │                  │
│ • Lê token do    │          │ • Requer token   │
│   localStorage   │          │   como parâmetro │
│ • Singleton      │          │ • Cache por token│
│ • Lazy loading   │          │ • Stateless      │
└──────────────────┘          └──────────────────┘
```

### Classes Principais

#### 1. `FenixService` (Singleton Principal)

Localização: [`lib/services/fenix/fenix-service.ts`](lib/services/fenix/fenix-service.ts)

Responsabilidades:

- Detecção automática de ambiente (client/server)
- Gerenciamento de instâncias singleton
- Exposição de métodos estáticos para acesso aos módulos
- Atualização dinâmica de tokens

#### 2. `FenixServiceClient`

Localização: [`lib/services/fenix/fenix-service-client.ts`](lib/services/fenix/fenix-service-client.ts)

Responsabilidades:

- Implementação para Client Components
- Leitura automática de token do `localStorage`
- Criação lazy de instâncias dos clients do SDK
- Atualização de token em tempo de execução

#### 3. `FenixServiceServer`

Localização: [`lib/services/fenix/fenix-service-server.ts`](lib/services/fenix/fenix-service-server.ts)

Responsabilidades:

- Implementação para Server Components/Actions
- Requer token como parâmetro obrigatório
- Cache de instâncias por token
- Stateless (cada requisição pode ter token diferente)

---

## 🔄 Detecção Automática Client/Server

O serviço detecta automaticamente o ambiente de execução verificando a existência do objeto `window`:

```typescript
private static isClient(): boolean {
  return typeof window !== "undefined";
}
```

### Comportamento por Ambiente

| Ambiente   | Detecção                        | Token                    | Instância       |
| ---------- | ------------------------------- | ------------------------ | --------------- |
| **Client** | `typeof window !== "undefined"` | Lê do `localStorage`     | Singleton único |
| **Server** | `typeof window === "undefined"` | Requerido como parâmetro | Cache por token |

### Fluxo de Decisão

```
getInstance(token?: string)
    │
    ├─ isClient()?
    │   │
    │   ├─ SIM → FenixServiceClient
    │   │         ├─ Token do localStorage (se não fornecido)
    │   │         └─ Singleton único
    │   │
    │   └─ NÃO → FenixServiceServer
    │             ├─ Token obrigatório
    │             └─ Cache por token
```

---

## 📦 Módulos Disponíveis

O SDK fornece acesso a todos os módulos da API Fenix através de uma interface unificada. Abaixo está a lista completa de módulos disponíveis:

| Módulo                 | Cliente                       | Descrição                                    | Requer Token |
| ---------------------- | ----------------------------- | -------------------------------------------- | ------------ |
| **auth**               | `AuthApiClient`               | Autenticação, login, registro, refresh token | ❌           |
| **products**           | `ProductsApiClient`           | Gestão de produtos                           | ✅           |
| **partners**           | `PartnersApiClient`           | Gestão de clientes e fornecedores            | ✅           |
| **quotes**             | `QuotesApiClient`             | Gestão de orçamentos                         | ✅           |
| **salesOrders**        | `SalesOrdersApiClient`        | Pedidos de venda                             | ✅           |
| **purchaseOrders**     | `PurchaseOrdersApiClient`     | Pedidos de compra                            | ✅           |
| **paymentTerms**       | `PaymentTermsApiClient`       | Condições de pagamento                       | ✅           |
| **financialAccounts**  | `FinancialAccountsApiClient`  | Contas financeiras                           | ✅           |
| **accountsPayable**    | `AccountsPayableApiClient`    | Contas a pagar                               | ✅           |
| **accountsReceivable** | `AccountsReceivableApiClient` | Contas a receber                             | ✅           |
| **stock**              | `StockApiClient`              | Controle de estoque                          | ✅           |
| **taxes**              | `TaxesApiClient`              | Gestão de impostos                           | ✅           |
| **certificates**       | `CertificatesApiClient`       | Certificados digitais                        | ✅           |
| **companiesUsers**     | `CompaniesUsersApiClient`     | Usuários e empresas                          | ✅           |
| **invitations**        | `InvitationsApiClient`        | Convites de usuários                         | ✅           |
| **nfe**                | `NfeApiClient`                | Notas fiscais eletrônicas                    | ✅           |
| **nfeConfig**          | `NfeConfigApiClient`          | Configuração de NFe                          | ✅           |
| **operationNature**    | `OperationNatureApiClient`    | Natureza de operação                         | ✅           |
| **plans**              | `PlansApiClient`              | Planos e assinaturas                         | ❌           |
| **apiKeys**            | `ApiKeysApiClient`            | Chaves de API                                | ✅           |

### Interface TypeScript

Todos os módulos são tipados através da interface `FenixServiceInstance`:

```typescript
export interface FenixServiceInstance {
  auth: AuthApiClient;
  products: ProductsApiClient;
  partners: PartnersApiClient;
  quotes: QuotesApiClient;
  salesOrders: SalesOrdersApiClient;
  purchaseOrders: PurchaseOrdersApiClient;
  paymentTerms: PaymentTermsApiClient;
  financialAccounts: FinancialAccountsApiClient;
  accountsPayable: AccountsPayableApiClient;
  accountsReceivable: AccountsReceivableApiClient;
  stock: StockApiClient;
  taxes: TaxesApiClient;
  certificates: CertificatesApiClient;
  companiesUsers: CompaniesUsersApiClient;
  invitations: InvitationsApiClient;
  nfe: NfeApiClient;
  nfeConfig: NfeConfigApiClient;
  operationNature: OperationNatureApiClient;
  plans: PlansApiClient;
  apiKeys: ApiKeysApiClient;
}
```

---

## 💡 Exemplos de Uso

### 1. Client Components

Em componentes client, o token é lido automaticamente do `localStorage`. Você pode acessar os módulos diretamente através das propriedades estáticas:

```typescript
"use client";

import FenixService from "@/lib/services/fenix";
import { useEffect, useState } from "react";

export function ProductsList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Token é lido automaticamente do localStorage
        const data = await FenixService.products.findAll({
          page: 1,
          limit: 10,
        });
        setProducts(data.data || []);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>{product.description}</div>
      ))}
    </div>
  );
}
```

**Exemplo Real:** [`components/app/products/product-form.tsx`](components/app/products/product-form.tsx)

```typescript
// Buscar produto para edição
const product = await FenixService.products.findOne(id);

// Criar novo produto
await FenixService.products.create(apiData);

// Atualizar produto existente
await FenixService.products.update(id, apiData);
```

### 2. Server Components

Em server components, você deve obter o token dos cookies e passar explicitamente para `getInstance()`:

```typescript
import { cookies } from "next/headers";
import FenixService from "@/lib/services/fenix";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string; limit: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return <div>Não autorizado</div>;
  }

  // Obter instância com token explícito
  const service = FenixService.getInstance(token);

  const resolvedSearchParams = await searchParams;
  const products = await service.products.findAll({
    page: parseInt(resolvedSearchParams.page ?? "1"),
    limit: parseInt(resolvedSearchParams.limit ?? "10"),
  });

  return (
    <div>
      <h1>Produtos</h1>
      {/* Renderizar produtos */}
    </div>
  );
}
```

**Exemplo Real:** [`app/(protected)/dashboard/products/page.tsx`](<app/(protected)/dashboard/products/page.tsx>)

### 3. Server Actions

Em server actions, o padrão é similar aos server components:

```typescript
"use server";

import { cookies } from "next/headers";
import FenixService from "@/lib/services/fenix";

export async function createProduct(data: CreateProductDto) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    throw new Error("Não autorizado");
  }

  const service = FenixService.getInstance(token);
  return await service.products.create(data);
}
```

### 4. Context API (AuthContext)

O `AuthContext` demonstra o uso completo do serviço, incluindo gerenciamento de tokens:

```typescript
"use client";

import FenixService from "@/lib/services/fenix";

export function AuthProvider({ children }: AuthProviderProps) {
  const login = async (email: string, password: string) => {
    // Acessar módulo auth diretamente (não requer token)
    const authClient = FenixService.auth;
    const response = await authClient.login({ email, password });

    if (response?.access_token) {
      // Salvar token no localStorage
      localStorage.setItem("accessToken", response.access_token);

      // Atualizar token no SDK
      FenixService.setToken(response.access_token);
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    const authClient = FenixService.auth;
    const response = await authClient.refresh({
      refresh_token: refreshToken,
    });

    if (response?.access_token) {
      localStorage.setItem("accessToken", response.access_token);
      FenixService.setToken(response.access_token);
      return true;
    }

    return false;
  };

  // ... resto da implementação
}
```

**Exemplo Real:** [`contexts/AuthContext.tsx`](contexts/AuthContext.tsx)

### 5. Uso com Hooks Customizados

Você pode criar hooks customizados para facilitar o uso:

```typescript
"use client";

import { useState, useEffect } from "react";
import FenixService from "@/lib/services/fenix";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await FenixService.products.findAll();
        setProducts(data.data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return { products, loading, error };
}
```

---

## 🔐 Gerenciamento de Tokens

### Client Components

Em client components, o token é gerenciado automaticamente:

1. **Leitura Automática**: O token é lido do `localStorage.getItem("accessToken")` quando necessário
2. **Atualização Manual**: Use `FenixService.setToken(token)` para atualizar o token

```typescript
// Atualizar token após login
localStorage.setItem("accessToken", newToken);
FenixService.setToken(newToken);

// Limpar token no logout
localStorage.removeItem("accessToken");
FenixService.setToken(null);
```

### Server Components

Em server components, o token deve ser obtido dos cookies e passado explicitamente:

```typescript
import { cookies } from "next/headers";

const cookieStore = await cookies();
const token = cookieStore.get("accessToken")?.value;

if (!token) {
  // Tratar caso de não autenticado
}

const service = FenixService.getInstance(token);
```

### Sincronização Client/Server

O projeto mantém sincronização entre `localStorage` (client) e cookies (server) através de rotas API:

```typescript
// Após login/refresh, sincronizar com cookies
await fetch("/api/auth/set-cookies", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    accessToken: token,
    refreshToken: refreshToken,
  }),
});
```

**Arquivos relacionados:**

- [`app/api/auth/set-cookies/route.ts`](app/api/auth/set-cookies/route.ts)
- [`app/api/auth/clear-cookies/route.ts`](app/api/auth/clear-cookies/route.ts)

### Fluxo de Autenticação

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Recebe access_token │
└──────┬──────────────┘
       │
       ├─► localStorage.setItem("accessToken")
       │
       ├─► FenixService.setToken(token)
       │
       └─► POST /api/auth/set-cookies
              │
              └─► Cookie: accessToken
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

O serviço utiliza a variável de ambiente `NEXT_PUBLIC_API_URL` para configurar a URL base da API:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333/
```

**Arquivo de configuração:** [`config/env.ts`](config/env.ts)

```typescript
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/",
  version: process.env.NEXT_PUBLIC_VERSION || "0.0.1",
} as const;
```

### Instalação do Pacote

O SDK é instalado via Git:

```json
{
  "dependencies": {
    "@fenix/api-sdk": "git+https://github.com/imLeonam/fenix-api-sdk.git"
  }
}
```

### Configuração Customizada

Para usar uma URL base diferente, você pode passar como parâmetro:

```typescript
// Client
const client = new FenixServiceClient("https://api.custom.com");

// Server
const server = new FenixServiceServer(token, "https://api.custom.com");
```

---

## ✨ Boas Práticas

### 1. ✅ Use Propriedades Estáticas em Client Components

```typescript
// ✅ BOM - Simples e direto
const products = await FenixService.products.findAll();

// ❌ EVITE - Desnecessário em client
const service = FenixService.getInstance();
const products = await service.products.findAll();
```

### 2. ✅ Sempre Passe Token em Server Components

```typescript
// ✅ BOM - Token explícito
const token = cookies().get("accessToken")?.value;
if (!token) return <div>Não autorizado</div>;
const service = FenixService.getInstance(token);

// ❌ ERRADO - Não funciona em server
const products = await FenixService.products.findAll(); // Erro!
```

### 3. ✅ Trate Erros de Autenticação

```typescript
try {
  const data = await FenixService.products.findAll();
} catch (error: any) {
  if (error?.response?.status === 401) {
    // Token expirado - fazer refresh ou logout
    await refreshAccessToken();
  }
}
```

### 4. ✅ Atualize Token Após Login/Refresh

```typescript
// Após receber novo token
localStorage.setItem("accessToken", newToken);
FenixService.setToken(newToken); // Importante!
```

### 5. ✅ Use Tipos do SDK

```typescript
// ✅ BOM - Tipagem forte
import type { Partner, CreatePartnerDto } from "@fenix/api-sdk";

const partner: Partner = await FenixService.partners.findOne(id);
await FenixService.partners.create(data as CreatePartnerDto);

// ❌ EVITE - any
const partner: any = await FenixService.partners.findOne(id);
```

### 6. ✅ Reutilize Instâncias

O padrão Singleton já garante reutilização, mas evite criar múltiplas instâncias manualmente:

```typescript
// ✅ BOM - Singleton gerencia automaticamente
const service1 = FenixService.getInstance(token);
const service2 = FenixService.getInstance(token); // Reutiliza instância

// ❌ EVITE - Criação manual desnecessária
const client = new FenixServiceClient();
const server = new FenixServiceServer(token);
```

### 7. ✅ Valide Token Antes de Usar em Server

```typescript
const token = cookies().get("accessToken")?.value;

if (!token) {
  redirect("/login");
  return;
}

const service = FenixService.getInstance(token);
```

---

## 🔧 Troubleshooting

### Erro: "Token is required for FenixService in server environment"

**Causa:** Tentativa de usar o serviço em server component sem passar o token.

**Solução:**

```typescript
// ❌ ERRADO
const products = await FenixService.products.findAll();

// ✅ CORRETO
const token = cookies().get("accessToken")?.value;
if (!token) return <div>Não autorizado</div>;
const service = FenixService.getInstance(token);
const products = await service.products.findAll();
```

### Erro: "Cannot access static properties in server environment"

**Causa:** Tentativa de acessar propriedades estáticas (`FenixService.products`) em server component.

**Solução:**

```typescript
// ❌ ERRADO (em server component)
const products = await FenixService.products.findAll();

// ✅ CORRETO
const token = cookies().get("accessToken")?.value;
const service = FenixService.getInstance(token);
const products = await service.products.findAll();
```

### Token Não Atualizado Após Login

**Causa:** Esqueceu de chamar `FenixService.setToken()` após atualizar o token no localStorage.

**Solução:**

```typescript
// Após login/refresh
localStorage.setItem("accessToken", newToken);
FenixService.setToken(newToken); // Não esqueça!
```

### Erro 401 (Unauthorized)

**Causa:** Token expirado ou inválido.

**Solução:**

```typescript
try {
  const data = await FenixService.products.findAll();
} catch (error: any) {
  if (error?.response?.status === 401) {
    // Tentar refresh
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Tentar novamente
      const data = await FenixService.products.findAll();
    } else {
      // Fazer logout
      logout();
    }
  }
}
```

### Módulo Não Encontrado

**Causa:** Tentativa de acessar módulo que não existe ou nome incorreto.

**Solução:** Verifique a tabela de [Módulos Disponíveis](#-módulos-disponíveis) para ver os nomes corretos.

```typescript
// ✅ Módulos válidos
FenixService.products;
FenixService.partners;
FenixService.auth;

// ❌ Módulos inválidos
FenixService.product; // Deve ser "products"
FenixService.partner; // Deve ser "partners"
```

---

## 📚 Referências

### Arquivos Relacionados

- [`lib/services/fenix/fenix-service.ts`](lib/services/fenix/fenix-service.ts) - Serviço singleton principal
- [`lib/services/fenix/fenix-service-client.ts`](lib/services/fenix/fenix-service-client.ts) - Implementação client
- [`lib/services/fenix/fenix-service-server.ts`](lib/services/fenix/fenix-service-server.ts) - Implementação server
- [`lib/services/fenix/types/types.ts`](lib/services/fenix/types/types.ts) - Tipos TypeScript
- [`lib/services/fenix/index.ts`](lib/services/fenix/index.ts) - Exports
- [`config/env.ts`](config/env.ts) - Configuração de ambiente

### Exemplos de Uso

- [`contexts/AuthContext.tsx`](contexts/AuthContext.tsx) - Autenticação completa
- [`app/(protected)/dashboard/products/page.tsx`](<app/(protected)/dashboard/products/page.tsx>) - Server component
- [`components/app/products/product-form.tsx`](components/app/products/product-form.tsx) - Client component
- [`components/app/partners/partner-form.tsx`](components/app/partners/partner-form.tsx) - Formulário com SDK

### SDK Original

- **Repositório:** [@fenix/api-sdk](https://github.com/imLeonam/fenix-api-sdk)
- **Instalação:** `git+https://github.com/imLeonam/fenix-api-sdk.git`

---

## 📝 Notas Adicionais

### Lazy Loading

As instâncias dos clients são criadas de forma lazy (sob demanda), otimizando a inicialização da aplicação:

```typescript
// A instância só é criada quando acessada pela primeira vez
private createInstance(): FenixServiceInstance {
  if (this._instance) {
    return this._instance; // Reutiliza se já existe
  }
  // Cria nova instância apenas quando necessário
  this._instance = { /* ... */ };
  return this._instance;
}
```

### Cache de Instâncias Server

No ambiente server, as instâncias são cacheadas por token para otimizar performance:

```typescript
// Reutiliza instância se já existe para o mesmo token
if (!this.serverInstances.has(token)) {
  this.serverInstances.set(token, new FenixServiceServer(token));
}
return this.serverInstances.get(token)!.clients;
```

### Compatibilidade Next.js 16

Esta implementação foi projetada especificamente para Next.js 16, aproveitando:

- Server Components nativos
- Async Server Components
- Cookies API do Next.js
- App Router

---

**Documentação criada com ❤️ para o projeto Fenix Frontend**
