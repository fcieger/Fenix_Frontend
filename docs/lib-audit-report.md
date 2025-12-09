# Relatório de Auditoria - Bibliotecas na Pasta `lib`

## 📋 Resumo Executivo

Este documento apresenta uma análise completa do uso das bibliotecas na pasta `src/lib`, verificando se estão sendo utilizadas de acordo com as melhores práticas e documentação oficial.

---

## 🔍 Bibliotecas Analisadas

### 1. **@tanstack/react-query** (React Query)

#### ✅ Pontos Positivos

- ✅ Uso correto de `QueryClientProvider` com configuração adequada
- ✅ `gcTime` configurado corretamente (renomeado de `cacheTime` no v5)
- ✅ Hooks customizados (`useProducts`, `usePartners`, etc.) seguem padrão correto
- ✅ Invalidação de cache após mutações implementada corretamente
- ✅ Utilitários de cache (`cache-utils.ts`) bem estruturados

#### ⚠️ Problemas Identificados

1. **QueryClient não está sendo reutilizado corretamente**

   - **Arquivo**: `src/providers/query-provider.tsx`
   - **Problema**: O `QueryClient` é criado com `useState`, mas não há garantia de que seja singleton
   - **Recomendação**: Usar `useMemo` ou criar fora do componente

   ```typescript
   // ❌ Atual
   const [queryClient] = useState(() => new QueryClient({...}));

   // ✅ Recomendado
   const queryClient = useMemo(() => new QueryClient({...}), []);
   ```

2. **Falta de tratamento de erro global**

   - **Problema**: Não há `onError` global configurado no `QueryClient`
   - **Recomendação**: Adicionar tratamento de erro global

   ```typescript
   defaultOptions: {
     queries: {
       onError: (error) => {
         // Tratamento global de erros
         console.error('Query error:', error);
       },
     },
     mutations: {
       onError: (error) => {
         // Tratamento global de erros de mutação
         console.error('Mutation error:', error);
       },
     },
   }
   ```

3. **Falta de `retry` configurado adequadamente**

   - **Problema**: `retry: 1` pode ser insuficiente para requisições que falham temporariamente
   - **Recomendação**: Usar função de retry mais inteligente

   ```typescript
   retry: (failureCount, error) => {
     // Não retry em erros 4xx (exceto 408, 429)
     if (error?.response?.status >= 400 && error?.response?.status < 500) {
       if (error?.response?.status === 408 || error?.response?.status === 429) {
         return failureCount < 3;
       }
       return false;
     }
     // Retry até 3 vezes para outros erros
     return failureCount < 3;
   },
   ```

4. **Falta de `refetchOnReconnect` configurado**

   - **Problema**: Não está explícito se deve refetch ao reconectar
   - **Recomendação**: Adicionar explicitamente

   ```typescript
   refetchOnReconnect: true,
   ```

5. **Hooks não estão usando `queryOptions` para reutilização**

   - **Problema**: As opções de query não são reutilizáveis
   - **Recomendação**: Usar `queryOptions` para melhor tipagem e reutilização

   ```typescript
   import { queryOptions } from "@tanstack/react-query";

   export const productQueryOptions = (id: string) =>
     queryOptions({
       queryKey: ["product", id],
       queryFn: () => getProduct(id),
     });
   ```

---

### 2. **axios**

#### ✅ Pontos Positivos

- ✅ Instância customizada criada corretamente
- ✅ Interceptors configurados para autenticação
- ✅ Tratamento de erro 401 implementado
- ✅ Timeout configurado

#### ⚠️ Problemas Identificados

1. **Instância axios marcada como deprecated mas ainda em uso**

   - **Arquivo**: `src/config/api.ts`
   - **Problema**: A instância está marcada como `@deprecated` mas ainda é usada em vários lugares
   - **Recomendação**:
     - Se está migrando para SDK, remover completamente
     - Se ainda precisa, remover a marcação `@deprecated` e documentar o uso

2. **Falta de tratamento de timeout específico**

   - **Problema**: Timeout genérico pode não ser adequado para todas as requisições
   - **Recomendação**: Adicionar tratamento específico para timeout

   ```typescript
   api.interceptors.response.use(
     (response) => response,
     (error) => {
       if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
         // Tratamento específico para timeout
         console.error("Request timeout");
       }
       // ... resto do tratamento
     }
   );
   ```

3. **Falta de cancelamento de requisições**

   - **Problema**: Não há suporte para cancelar requisições em andamento
   - **Recomendação**: Implementar `AbortController` para cancelamento

   ```typescript
   // Exemplo de uso
   const controller = new AbortController();
   api.get("/endpoint", { signal: controller.signal });
   // Para cancelar: controller.abort();
   ```

4. **Uso misto de `fetch` e `axios`**

   - **Problema**: Em `api.ts` há uso direto de `fetch` em alguns métodos
   - **Recomendação**: Padronizar para usar apenas axios ou apenas fetch
   - **Arquivos afetados**: `src/lib/api.ts` (métodos como `login`, `saveConfiguracaoEstados`)

5. **Falta de validação de status HTTP**
   - **Problema**: Não há `validateStatus` configurado
   - **Recomendação**: Adicionar validação explícita
   ```typescript
   validateStatus: (status) => {
     return status >= 200 && status < 500; // Aceitar até 4xx como resposta válida
   },
   ```

---

### 3. **jsonwebtoken**

#### ✅ Pontos Positivos

- ✅ Uso de `jwt.verify` para validação
- ✅ Uso de `jwt.decode` para leitura sem validação
- ✅ Tratamento de diferentes formatos de token (JWT e mock)

#### ⚠️ Problemas Identificados

1. **Secret hardcoded como fallback**

   - **Arquivo**: `src/lib/auth-utils.ts:28`
   - **Problema**: `process.env.JWT_SECRET || 'fenix-jwt-secret-key-2024-super-secure'`
   - **Recomendação**: Nunca usar fallback hardcoded, lançar erro se não houver secret

   ```typescript
   const jwtSecret = process.env.JWT_SECRET;
   if (!jwtSecret) {
     throw new Error("JWT_SECRET não configurado");
   }
   ```

2. **Falta de validação de expiração antes de usar**

   - **Problema**: O código decodifica sem verificar primeiro, depois verifica
   - **Recomendação**: Verificar expiração antes de processar

   ```typescript
   const decoded = jwt.verify(token, secret) as any;
   // Verificar expiração
   if (decoded.exp && decoded.exp < Date.now() / 1000) {
     throw new Error("Token expirado");
   }
   ```

3. **Logs excessivos em produção**
   - **Problema**: Muitos `console.log` que podem vazar informações sensíveis
   - **Recomendação**: Usar logger condicional ou remover logs em produção
   ```typescript
   const isDev = process.env.NODE_ENV === 'development';
   if (isDev) {
     console.log('Token info:', ...);
   }
   ```

---

### 4. **pg** (PostgreSQL)

#### ✅ Pontos Positivos

- ✅ Pool de conexões configurado corretamente
- ✅ Lazy initialization para evitar conexões durante build
- ✅ Suporte a `DATABASE_URL` para produção
- ✅ Transações implementadas corretamente
- ✅ Tratamento de erros de conexão

#### ⚠️ Problemas Identificados

1. **Falta de configuração de SSL adequada**

   - **Arquivo**: `src/lib/database.ts:17-19`
   - **Problema**: SSL configurado apenas para `neon.tech` ou produção
   - **Recomendação**: Melhorar lógica de SSL

   ```typescript
   ssl: process.env.DATABASE_URL?.includes('neon.tech') ||
        process.env.NODE_ENV === 'production'
     ? { rejectUnauthorized: false }
     : undefined,
   // Melhor: verificar variável de ambiente específica
   ssl: process.env.DATABASE_SSL === 'true'
     ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' }
     : undefined,
   ```

2. **Falta de health check periódico**

   - **Problema**: Não há verificação periódica da saúde do pool
   - **Recomendação**: Implementar health check

   ```typescript
   // Adicionar método de health check
   export async function healthCheck(): Promise<boolean> {
     try {
       await query("SELECT 1");
       return true;
     } catch {
       return false;
     }
   }
   ```

3. **Falta de métricas de conexão**

   - **Problema**: Não há logging de métricas do pool (total, idle, waiting)
   - **Recomendação**: Adicionar métricas

   ```typescript
   export function getPoolMetrics() {
     const pool = getPool();
     return {
       totalCount: pool.totalCount,
       idleCount: pool.idleCount,
       waitingCount: pool.waitingCount,
     };
   }
   ```

4. **Falta de cleanup ao encerrar aplicação**

   - **Problema**: Pool não é fechado ao encerrar aplicação
   - **Recomendação**: Adicionar cleanup

   ```typescript
   export async function closePool(): Promise<void> {
     if (pool) {
       await pool.end();
       pool = null;
     }
   }

   // No Next.js, usar em cleanup
   if (typeof process !== "undefined") {
     process.on("SIGTERM", closePool);
     process.on("SIGINT", closePool);
   }
   ```

---

### 5. **clsx** e **tailwind-merge**

#### ✅ Pontos Positivos

- ✅ Função `cn` criada corretamente combinando `clsx` e `tailwind-merge`
- ✅ Uso correto da biblioteca

#### ⚠️ Problemas Identificados

1. **Nenhum problema identificado** - Uso está correto ✅

---

## 📊 Resumo de Problemas por Severidade

### 🔴 Críticos

1. **JWT Secret hardcoded** - Segurança
2. **Falta de cleanup do pool PostgreSQL** - Recursos

### 🟡 Importantes

1. **QueryClient não otimizado** - Performance
2. **Uso misto de fetch/axios** - Consistência
3. **Falta de tratamento de erro global** - UX

### 🟢 Melhorias

1. **Falta de queryOptions** - Manutenibilidade
2. **Falta de cancelamento de requisições** - UX
3. **Logs excessivos** - Performance/Segurança

---

## 🎯 Recomendações Prioritárias

### Prioridade Alta

1. ✅ Remover secret hardcoded do JWT
2. ✅ Implementar cleanup do pool PostgreSQL
3. ✅ Padronizar uso de axios ou fetch
4. ✅ Adicionar tratamento de erro global no React Query

### Prioridade Média

1. ✅ Otimizar criação do QueryClient
2. ✅ Implementar cancelamento de requisições
3. ✅ Adicionar health check do banco
4. ✅ Melhorar configuração de retry no React Query

### Prioridade Baixa

1. ✅ Usar queryOptions para melhor tipagem
2. ✅ Adicionar métricas do pool
3. ✅ Reduzir logs em produção

---

## 📝 Checklist de Implementação

- [ ] Remover JWT secret hardcoded
- [ ] Implementar cleanup do pool PostgreSQL
- [ ] Padronizar uso de axios/fetch
- [ ] Adicionar tratamento de erro global React Query
- [ ] Otimizar criação do QueryClient
- [ ] Implementar cancelamento de requisições
- [ ] Adicionar health check do banco
- [ ] Melhorar configuração de retry
- [ ] Usar queryOptions
- [ ] Adicionar métricas do pool
- [ ] Reduzir logs em produção

---

## 📚 Referências

- [TanStack Query v5 Docs](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [jsonwebtoken Documentation](https://github.com/auth0/node-jsonwebtoken)

---

**Data da Auditoria**: 2024-12-19
**Versão das Bibliotecas Analisadas**:

- @tanstack/react-query: ^5.90.12
- axios: ^1.12.2
- jsonwebtoken: ^9.0.2
- pg: ^8.16.3
