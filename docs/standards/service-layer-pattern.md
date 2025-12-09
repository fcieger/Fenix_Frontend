# Service Layer Pattern - Padrão de Camada de Services

> **Versão:** 1.0.0
> **Última atualização:** 2024-12-24
> **Status:** Obrigatório para todos os novos services

---

## Visão Geral

Este documento define o padrão obrigatório para implementação de services no projeto Fenix. Todos os services devem seguir esta arquitetura, que garante:

- **Separação de responsabilidades**: Transformadores isolados dos services
- **Reutilização**: Transformadores comuns compartilhados entre módulos
- **Type-safety**: TypeScript garante tipos em todas as transformações
- **Testabilidade**: Transformadores são funções puras e testáveis
- **Manutenibilidade**: Fácil adicionar/remover formatações
- **Consistência**: Todos os services seguem o mesmo padrão

---

## Arquitetura

### Fluxo de Dados

```
Componente
    ↓
Service (formatRequest)
    ↓
SDK Client
    ↓
API Backend
    ↓
SDK Client
    ↓
Service (formatResponse)
    ↓
Componente
```

### Estrutura de Diretórios

```
src/
├── lib/
│   └── services/
│       ├── base-service.ts          # Classe base abstrata
│       ├── service-types.ts         # Tipos genéricos
│       └── transformers/
│           ├── common-transformers.ts  # Transformadores reutilizáveis
│           └── date-transformers.ts    # Transformadores de data
└── services/
    └── {module}/
        ├── {module}-service.ts      # Service principal
        └── {module}-transformers.ts # Transformadores específicos
```

---

## Regras Obrigatórias

### 1. Estrutura de Diretórios

- ✅ Cada módulo DEVE ter sua pasta: `src/services/{module}/`
- ✅ Service principal: `{module}-service.ts`
- ✅ Transformadores: `{module}-transformers.ts`
- ❌ NÃO criar services na raiz de `src/services/` (exceto durante migração)

### 2. Nomenclatura

#### Transformadores de Request
- Padrão: `format{Action}{Entity}Request()`
- Exemplos:
  - `formatCreateProductRequest()`
  - `formatUpdateProductRequest()`
  - `formatCreateQuoteRequest()`

#### Transformadores de Response
- Padrão: `format{Entity}Response()` ou `format{Entity}ListResponse()`
- Exemplos:
  - `formatProductResponse()`
  - `formatProductsListResponse()`
  - `formatQuoteResponse()`

#### Service Class
- Padrão: `{Entity}Service` (PascalCase)
- Exemplos: `ProductsService`, `QuotesService`, `PartnersService`

#### Instância Exportada
- Padrão: `{entity}Service` (camelCase)
- Exemplos: `productsService`, `quotesService`, `partnersService`

### 3. Obrigações Técnicas

- ✅ Todos os services DEVEM estender `BaseService`
- ✅ Todos os services DEVEM ter arquivo de transformers separado
- ✅ Todos os requests DEVEM passar por `formatRequest()` antes do SDK
- ✅ Todas as responses DEVEM passar por `formatResponse()` antes de retornar
- ✅ Manter exports de funções para compatibilidade retroativa
- ❌ NÃO fazer transformações diretamente no service (usar transformers)

### 4. Boas Práticas

- ✅ Transformadores devem ser **funções puras** (sem side effects)
- ✅ Transformadores devem ser **testáveis isoladamente**
- ✅ Reutilizar transformadores comuns quando possível
- ✅ Documentar transformações complexas com comentários
- ✅ Manter **type-safety** em todas as transformações
- ❌ NÃO fazer chamadas de API dentro de transformers
- ❌ NÃO fazer mutations de estado dentro de transformers

---

## Templates

### Template: Service

```typescript
// src/services/{module}/{module}-service.ts

import { BaseService } from '@/lib/services/base-service';
import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { normalizeListResponse, normalizePaginatedResponse } from '@/lib/sdk/response-normalizer';
import type {
  {Entity},
  Create{Entity}Dto,
  Update{Entity}Dto,
  PaginatedResponse
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
   */
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<{Entity}> | { data: {Entity}[] }> {
    try {
      const client = SdkClientFactory.get{Entity}Client();
      const { company_id, ...cleanParams } = params || {};
      const response = await client.findAll(cleanParams);

      let normalized: PaginatedResponse<{Entity}> | {Entity}[];
      if (params?.page || params?.limit) {
        normalized = normalizePaginatedResponse<{Entity}>(response);
      } else {
        normalized = {
          data: normalizeListResponse<{Entity}>(response),
        } as any;
      }

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
      const {entity} = await client.findOne(id);
      return this.formatResponse({entity}) as {Entity};
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
      const formattedPayload = formatCreate{Entity}Request(payload);
      const {entity} = await client.create(formattedPayload);
      return this.formatResponse({entity}) as {Entity};
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
      const formattedPayload = formatUpdate{Entity}Request(payload);
      const {entity} = await client.update(id, formattedPayload);
      return this.formatResponse({entity}) as {Entity};
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

// Legacy function names (if applicable)
export const listar{Entity}s = list{Entity}s;
export const obter{Entity} = get{Entity};
export const criar{Entity} = create{Entity};
export const atualizar{Entity} = update{Entity};
export const excluir{Entity} = delete{Entity};
```

### Template: Transformers

```typescript
// src/services/{module}/{module}-transformers.ts

import type { Create{Entity}Dto, Update{Entity}Dto, {Entity} } from '@/types/sdk';
import { normalizeString, normalizeNumber, normalizeCode } from '@/lib/services/transformers/common-transformers';
import { normalizeDate } from '@/lib/services/transformers/date-transformers';

/**
 * Formata o payload de criação de {entity} antes de enviar
 */
export function formatCreate{Entity}Request(
  payload: Create{Entity}Dto
): Create{Entity}Dto {
  const formatted = { ...payload };

  // Exemplo: Normalizar strings
  if (formatted.name) {
    formatted.name = normalizeString(formatted.name);
  }

  // Exemplo: Normalizar códigos
  if (formatted.code) {
    formatted.code = normalizeCode(formatted.code);
  }

  // Exemplo: Normalizar números
  if (formatted.price !== undefined) {
    formatted.price = normalizeNumber(formatted.price);
  }

  // Exemplo: Normalizar datas
  if (formatted.date) {
    formatted.date = normalizeDate(formatted.date);
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
export function format{Entity}Response({entity}: {Entity}): {Entity} {
  const formatted = { ...{entity} };

  // Exemplo: Garantir tipos corretos
  if (formatted.price !== undefined) {
    formatted.price = normalizeNumber(formatted.price);
  }

  // Exemplo: Adicionar campos calculados (se necessário)
  // if (formatted.price && formatted.cost) {
  //   (formatted as any).profitMargin =
  //     ((formatted.price - formatted.cost) / formatted.price) * 100;
  // }

  return formatted;
}

/**
 * Formata lista de {entity}s
 */
export function format{Entity}ListResponse({entity}s: {Entity}[]): {Entity}[] {
  return {entity}s.map(format{Entity}Response);
}
```

---

## Checklist de Implementação

Para cada novo service ou migração, seguir este checklist:

### Preparação
- [ ] Criar pasta `src/services/{module}/`
- [ ] Verificar se o SDK tem o cliente correspondente
- [ ] Verificar tipos no `@/types/sdk`
- [ ] Identificar transformações necessárias

### Transformers
- [ ] Criar `{module}-transformers.ts`
- [ ] Implementar `formatCreate{Entity}Request()`
- [ ] Implementar `formatUpdate{Entity}Request()`
- [ ] Implementar `format{Entity}Response()`
- [ ] Implementar `format{Entity}ListResponse()`
- [ ] Reutilizar transformadores comuns quando possível
- [ ] Adicionar comentários para transformações complexas

### Service
- [ ] Criar `{module}-service.ts` estendendo `BaseService`
- [ ] Configurar transformers no construtor
- [ ] Implementar método `list()` com formatação
- [ ] Implementar método `get()` com formatação
- [ ] Implementar método `create()` com formatação
- [ ] Implementar método `update()` com formatação
- [ ] Implementar método `delete()`
- [ ] Exportar instância singleton
- [ ] Exportar funções para compatibilidade
- [ ] Exportar funções legacy (se aplicável)

### Testes
- [ ] Testar `formatRequest` em todos os métodos de escrita
- [ ] Testar `formatResponse` em todos os métodos de leitura
- [ ] Testar tratamento de erros
- [ ] Verificar que não há regressões

### Integração
- [ ] Atualizar imports nos componentes que usam o service
- [ ] Verificar que todos os usos estão funcionando
- [ ] Documentar mudanças se necessário

---

## Exemplos Práticos

### Exemplo 1: Products Service

Ver implementação completa em:
- `src/services/products/products-service.ts`
- `src/services/products/products-transformers.ts`

### Exemplo 2: Uso no Componente

```typescript
// No componente
import { createProduct } from '@/services/products/products-service';

const handleSubmit = async (formData: CreateProductDto) => {
  // O formatRequest será aplicado automaticamente
  // O formatResponse será aplicado automaticamente
  const product = await createProduct(formData);
  console.log(product); // Produto já formatado
};
```

---

## Transformadores Comuns Disponíveis

### Common Transformers
- `removeEmptyFields()` - Remove campos undefined/null
- `normalizeString()` - Normaliza strings (trim, espaços)
- `normalizeNumber()` - Normaliza números
- `normalizeCode()` - Normaliza códigos (uppercase, sem espaços)
- `normalizeEmail()` - Normaliza emails (lowercase, trim)
- `normalizeDocument()` - Normaliza CPF/CNPJ
- `normalizePhone()` - Normaliza telefones
- `normalizeZipCode()` - Normaliza CEPs

### Date Transformers
- `normalizeDate()` - Normaliza datas para ISO string
- `formatDateForDisplay()` - Formata datas para exibição (dd/MM/yyyy)
- `formatDateTimeForDisplay()` - Formata data e hora (dd/MM/yyyy HH:mm)
- `parseDate()` - Converte string ISO para Date object

---

## Migração de Services Existentes

Para migrar um service existente:

1. **Criar estrutura nova**
   - Criar pasta `src/services/{module}/`
   - Criar `{module}-transformers.ts`
   - Criar `{module}-service.ts` usando template

2. **Implementar transformers**
   - Identificar transformações necessárias
   - Implementar funções de formatação
   - Testar isoladamente

3. **Refatorar service**
   - Estender `BaseService`
   - Aplicar `formatRequest` em métodos de escrita
   - Aplicar `formatResponse` em métodos de leitura
   - Manter compatibilidade com exports existentes

4. **Atualizar imports**
   - Atualizar componentes que usam o service
   - Verificar que não há regressões

5. **Remover arquivo antigo**
   - Após validação completa, remover `src/services/{module}-service.ts` antigo

---

## Troubleshooting

### Erro: "Token required for {module} client"
- Verificar se o token está sendo obtido corretamente
- Verificar se `SdkClientFactory.initialize()` foi chamado

### Erro: "Type '{...}' is not assignable to type '{...}'"
- Verificar tipos genéricos do `BaseService`
- Verificar tipos de retorno dos transformers

### Transformações não estão sendo aplicadas
- Verificar se `formatRequest()` está sendo chamado antes do SDK
- Verificar se `formatResponse()` está sendo chamado após receber resposta
- Verificar se transformers estão configurados no construtor

---

## Referências

- [SDK Migration Summary](../planning/sdk-migration-summary.md)
- [SDK Implementation](../planning/fenix-sdk-implementation.md)
- [Checklist: Migração SDK](../checklists/04-migracao-sdk.md)

---

**Última atualização:** 2024-12-24
**Mantenedor:** Equipe de Desenvolvimento Fenix

