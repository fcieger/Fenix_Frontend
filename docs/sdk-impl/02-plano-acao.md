# Plano de Ação: Implementação SDK Fenix

**Data:** 24 de Dezembro de 2025
**Baseado em:** `01-analise-completa.md`
**Objetivo:** Migrar todas as telas e componentes para usar SDK de forma sistemática e inteligente

---

## 🎯 Estratégia de Implementação

### Princípios Norteadores

1. **Prioridade por Impacto** - Migrar primeiro o que afeta mais usuários
2. **Menor Disrupção** - Manter compatibilidade durante migração
3. **Testabilidade** - Cada fase deve ser testável independentemente
4. **Documentação** - Documentar padrões e decisões
5. **Incremental** - Entregas pequenas e frequentes

### Abordagem em 3 Camadas

```
┌─────────────────────────────────────┐
│  Camada 1: SDK Package              │  ← Adicionar novos clients
│  (@fenix/api-sdk)                   │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Camada 2: Services Layer           │  ← Criar/atualizar services
│  (src/services/*.ts)                │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Camada 3: Application Layer        │  ← Atualizar hooks, páginas
│  (hooks, pages, components)         │     e componentes
└─────────────────────────────────────┘
```

---

## 📅 Fases de Implementação

## FASE 1: Preparação e SDK Core [SPRINT 1-2]

### 1.1 Adicionar Módulos SDK Críticos ao Pacote

**Responsável:** Time Backend + SDK
**Duração:** 5-7 dias
**Prioridade:** 🔴 CRÍTICA

#### Módulos a Adicionar

1. **PointOfSaleApiClient** 🔴
   ```typescript
   class PointOfSaleApiClient {
     // Caixas (Registers)
     async listRegisters(params?: ListRegistersParams): Promise<Register[]>
     async getRegister(id: string): Promise<Register>
     async openRegister(data: OpenRegisterRequest): Promise<Register>
     async closeRegister(id: string, data: CloseRegisterRequest): Promise<Register>

     // Vendas (Sales)
     async createSale(data: CreateSaleRequest): Promise<Sale>
     async getSale(id: string): Promise<Sale>
     async cancelSale(id: string, reason: string): Promise<void>
     async suspendSale(data: SuspendSaleRequest): Promise<SuspendedSale>
     async resumeSale(id: string): Promise<Sale>
     async listSuspendedSales(): Promise<SuspendedSale[]>

     // Movimentações (Cash Movements)
     async withdrawal(data: WithdrawalRequest): Promise<CashMovement>
     async deposit(data: DepositRequest): Promise<CashMovement>
     async listMovements(registerId: string): Promise<CashMovement[]>
   }
   ```

2. **MovementsApiClient** 🔴
   ```typescript
   class MovementsApiClient {
     async list(params?: MovementFilters): Promise<PaginatedResponse<Movement>>
     async get(id: string): Promise<Movement>
     async create(data: CreateMovementRequest): Promise<Movement>
     async update(id: string, data: UpdateMovementRequest): Promise<Movement>
     async delete(id: string): Promise<void>
     async getSummary(params?: SummaryParams): Promise<MovementSummary>
   }
   ```

3. **CostCentersApiClient** 🟡
   ```typescript
   class CostCentersApiClient {
     async list(params?: CostCenterFilters): Promise<PaginatedResponse<CostCenter>>
     async get(id: string): Promise<CostCenter>
     async create(data: CreateCostCenterRequest): Promise<CostCenter>
     async update(id: string, data: UpdateCostCenterRequest): Promise<CostCenter>
     async delete(id: string): Promise<DeleteResponse>
     async getStats(): Promise<CostCenterStats>
   }
   ```

4. **ChartOfAccountsApiClient** 🟡
   ```typescript
   class ChartOfAccountsApiClient {
     async list(params?: AccountFilters): Promise<PaginatedResponse<Account>>
     async get(id: string): Promise<Account>
     async create(data: CreateAccountRequest): Promise<Account>
     async update(id: string, data: UpdateAccountRequest): Promise<Account>
     async delete(id: string): Promise<void>
     async getHierarchy(): Promise<AccountHierarchy>
   }
   ```

5. **PaymentMethodsApiClient** 🟡
   ```typescript
   class PaymentMethodsApiClient {
     async list(): Promise<PaymentMethod[]>
     async get(id: string): Promise<PaymentMethod>
     async create(data: CreatePaymentMethodRequest): Promise<PaymentMethod>
     async update(id: string, data: UpdatePaymentMethodRequest): Promise<PaymentMethod>
     async delete(id: string): Promise<void>
   }
   ```

#### Checklist de Implementação

- [ ] Criar interfaces TypeScript para cada client
- [ ] Implementar métodos HTTP (GET, POST, PUT, DELETE)
- [ ] Adicionar tratamento de erros consistente
- [ ] Criar testes unitários para cada client
- [ ] Atualizar documentação do SDK
- [ ] Publicar nova versão do SDK no npm
- [ ] Atualizar `SdkClientFactory` com novos getters

**Deliverable:** SDK v2.x.x publicado com novos clients

---

### 1.2 Atualizar Client Factory

**Responsável:** Time Frontend
**Duração:** 1 dia
**Arquivo:** `src/lib/sdk/client-factory.ts`

```typescript
// Adicionar ao SdkClientFactory

/**
 * Get Point of Sale API client
 */
static getPointOfSaleClient(): any {
  const SdkModule = this.getSdkModule();
  return this.getClient("pointOfSale", SdkModule.PointOfSaleApiClient);
}

/**
 * Get Movements API client
 */
static getMovementsClient(): any {
  const SdkModule = this.getSdkModule();
  return this.getClient("movements", SdkModule.MovementsApiClient);
}

/**
 * Get Cost Centers API client
 */
static getCostCentersClient(): any {
  const SdkModule = this.getSdkModule();
  return this.getClient("costCenters", SdkModule.CostCentersApiClient);
}

/**
 * Get Chart of Accounts API client
 */
static getChartOfAccountsClient(): any {
  const SdkModule = this.getSdkModule();
  return this.getClient("chartOfAccounts", SdkModule.ChartOfAccountsApiClient);
}

/**
 * Get Payment Methods API client
 */
static getPaymentMethodsClient(): any {
  const SdkModule = this.getSdkModule();
  return this.getClient("paymentMethods", SdkModule.PaymentMethodsApiClient);
}
```

**Checklist:**
- [ ] Adicionar getters para novos clients
- [ ] Atualizar testes
- [ ] Verificar singletons funcionando

---

## FASE 2: Migração de Serviços Críticos [SPRINT 2-3]

### 2.1 Atualizar Services para Usar SDK

**Duração:** 3-4 dias

#### Service: Point of Sale

**Arquivo:** `src/services/point-of-sale-service.ts` (CRIAR NOVO)

```typescript
import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Point of Sale Service
 * Uses PointOfSaleApiClient from SDK
 */

// ==================== REGISTERS ====================

export async function listRegisters() {
  try {
    const client = SdkClientFactory.getPointOfSaleClient();
    return await client.listRegisters();
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function openRegister(data: OpenRegisterRequest) {
  try {
    const client = SdkClientFactory.getPointOfSaleClient();
    return await client.openRegister(data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function closeRegister(id: string, data: CloseRegisterRequest) {
  try {
    const client = SdkClientFactory.getPointOfSaleClient();
    return await client.closeRegister(id, data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// ==================== SALES ====================

export async function createSale(data: CreateSaleRequest) {
  try {
    const client = SdkClientFactory.getPointOfSaleClient();
    return await client.createSale(data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function suspendSale(data: SuspendSaleRequest) {
  try {
    const client = SdkClientFactory.getPointOfSaleClient();
    return await client.suspendSale(data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// ==================== MOVEMENTS ====================

export async function createWithdrawal(data: WithdrawalRequest) {
  try {
    const client = SdkClientFactory.getPointOfSaleClient();
    return await client.withdrawal(data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function createDeposit(data: DepositRequest) {
  try {
    const client = SdkClientFactory.getPointOfSaleClient();
    return await client.deposit(data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Backward compatibility aliases
export const listarCaixas = listRegisters;
export const abrirCaixa = openRegister;
export const fecharCaixa = closeRegister;
export const criarVenda = createSale;
export const suspenderVenda = suspendSale;
export const sangria = createWithdrawal;
export const suprimento = createDeposit;
```

**Checklist:**
- [ ] Criar service completo
- [ ] Adicionar todos os métodos do SDK
- [ ] Manter aliases para compatibilidade
- [ ] Adicionar tipos TypeScript
- [ ] Criar testes unitários

---

#### Service: Movements

**Arquivo:** `src/services/movements-service.ts` (ATUALIZAR)

```typescript
import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Financial Movements Service
 * Uses MovementsApiClient from SDK
 *
 * MIGRATED: Now uses SDK instead of API routes
 */

export async function listMovements(params?: MovementFilters) {
  try {
    const client = SdkClientFactory.getMovementsClient();
    return await client.list(params);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function getMovement(id: string) {
  try {
    const client = SdkClientFactory.getMovementsClient();
    return await client.get(id);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function createMovement(data: CreateMovementRequest) {
  try {
    const client = SdkClientFactory.getMovementsClient();
    return await client.create(data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function updateMovement(id: string, data: UpdateMovementRequest) {
  try {
    const client = SdkClientFactory.getMovementsClient();
    return await client.update(id, data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function deleteMovement(id: string) {
  try {
    const client = SdkClientFactory.getMovementsClient();
    return await client.delete(id);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function getMovementSummary(params?: SummaryParams) {
  try {
    const client = SdkClientFactory.getMovementsClient();
    return await client.getSummary(params);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Backward compatibility
export const listarMovimentacoes = listMovements;
export const criarMovimentacao = createMovement;
export const atualizarMovimentacao = updateMovement;
export const deletarMovimentacao = deleteMovement;
export const obterResumo = getMovementSummary;
```

**Checklist:**
- [ ] Substituir todas as chamadas fetch por SDK
- [ ] Remover comentários sobre API routes
- [ ] Adicionar comentário "MIGRATED"
- [ ] Verificar tipos compatíveis
- [ ] Atualizar testes

---

#### Service: Cost Centers

**Arquivo:** `src/services/cost-centers-service.ts` (ATUALIZAR)

```typescript
import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Cost Centers Service
 * Uses CostCentersApiClient from SDK
 *
 * MIGRATED: Now uses SDK instead of API routes
 */

export async function listCostCenters(params?: CostCenterFilters) {
  try {
    const client = SdkClientFactory.getCostCentersClient();
    return await client.list(params);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function getCostCentersStats() {
  try {
    const client = SdkClientFactory.getCostCentersClient();
    return await client.getStats();
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function getCostCenter(id: string) {
  try {
    const client = SdkClientFactory.getCostCentersClient();
    return await client.get(id);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function createCostCenter(data: CreateCostCenterRequest) {
  try {
    const client = SdkClientFactory.getCostCentersClient();
    return await client.create(data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function updateCostCenter(id: string, data: UpdateCostCenterRequest) {
  try {
    const client = SdkClientFactory.getCostCentersClient();
    return await client.update(id, data);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function deleteCostCenter(id: string) {
  try {
    const client = SdkClientFactory.getCostCentersClient();
    return await client.delete(id);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}
```

**Checklist:**
- [ ] Substituir fetch por SDK
- [ ] Atualizar comentários
- [ ] Manter compatibilidade

---

#### Services: Chart of Accounts & Payment Methods

Seguir o mesmo padrão dos services acima.

**Arquivos:**
- `src/services/chart-of-accounts-service.ts` (ATUALIZAR)
- `src/services/payment-methods-service.ts` (ATUALIZAR)

---

## FASE 3: Migração de Páginas Críticas [SPRINT 3-4]

### 3.1 Point of Sale Pages

**Duração:** 3-4 dias
**Prioridade:** 🔴 CRÍTICA

#### Páginas a Migrar

1. `/point-of-sale/page.tsx` - Principal (8 chamadas fetch)
2. `/point-of-sale/abrir/page.tsx` - Abrir caixa
3. `/point-of-sale/fechar/page.tsx` - Fechar caixa (3 chamadas)
4. `/point-of-sale/diagnostico/page.tsx` - Diagnóstico (2 chamadas)
5. `/point-of-sale/historico/page.tsx` - Histórico (2 chamadas)

#### Padrão de Migração

**Antes:**
```typescript
// ❌ PDV page.tsx - linha ~150
const response = await fetch('/api/pdv/caixas', {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await response.json();
```

**Depois:**
```typescript
// ✅ PDV page.tsx
import { listRegisters, createSale } from '@/services/point-of-sale-service';

// ...
const caixas = await listRegisters();
```

#### Checklist por Página

**page.tsx (Principal):**
- [ ] Substituir fetch de caixas por `listRegisters()`
- [ ] Substituir fetch de produtos por `listProducts()` (já existe)
- [ ] Substituir POST venda por `createSale()`
- [ ] Substituir fetch de clientes por `listPartners()` (já existe)
- [ ] Testar fluxo completo de venda
- [ ] Verificar tratamento de erros

**abrir/page.tsx:**
- [ ] Substituir POST por `openRegister()`
- [ ] Adicionar validações
- [ ] Testar abertura de caixa

**fechar/page.tsx:**
- [ ] Substituir POST por `closeRegister()`
- [ ] Substituir GET movimentações por service
- [ ] Testar fechamento com conferência

**diagnostico/page.tsx:**
- [ ] Substituir GET status por service
- [ ] Atualizar UI

**historico/page.tsx:**
- [ ] Substituir GET histórico por service
- [ ] Adicionar filtros

---

### 3.2 Stock Pages

**Duração:** 3-4 dias
**Prioridade:** 🔴 CRÍTICA

#### Páginas a Migrar

1. `/stock/saldos/page.tsx` (5 fetch)
2. `/stock/kardex/page.tsx` (5 fetch)
3. `/stock/lancamento/page.tsx` (2 fetch)
4. `/stock/inventario/page.tsx` (3 fetch)
5. `/stock/inventario/[id]/page.tsx` (6 fetch)
6. `/stock/locais/page.tsx` (7 fetch)

#### Padrão

**Antes:**
```typescript
// ❌ stock/saldos/page.tsx
const response = await fetch('/api/stock/products-with-stock', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Depois:**
```typescript
// ✅ stock/saldos/page.tsx
import { listStockBalances } from '@/services/stock-service';

const balances = await listStockBalances();
```

#### Checklist

- [ ] Verificar `stock-service.ts` tem todos os métodos necessários
- [ ] Migrar página de saldos
- [ ] Migrar página de kardex
- [ ] Migrar página de lançamento
- [ ] Migrar páginas de inventário
- [ ] Migrar página de locais
- [ ] Testar movimentações de estoque
- [ ] Verificar cálculos de saldo

---

### 3.3 Financial Pages

**Duração:** 2-3 dias
**Prioridade:** 🔴 CRÍTICA

#### Páginas a Migrar

1. `/financial/banco/page.tsx` (usa hook)
2. `/financial/banco/lancamentos/[id]/page.tsx` (1 fetch)
3. `/financial/historico/page.tsx` (1 fetch)
4. `/financial/contas-pagar/page.tsx` (3 fetch)
5. `/financial/contas-pagar/nova/page.tsx` (9 fetch)
6. `/financial/contas-receber/page.tsx` (2 fetch)
7. `/financial/contas-receber/nova/page.tsx`

#### Observação
Algumas páginas JÁ usam services, mas os services usam API routes. Após migrar os services (Fase 2), essas páginas automaticamente usarão SDK.

#### Checklist

- [ ] Verificar quais páginas precisam mudança
- [ ] Atualizar imports se necessário
- [ ] Testar contas a pagar
- [ ] Testar contas a receber
- [ ] Validar cálculos financeiros

---

## FASE 4: Migração de Componentes [SPRINT 4-5]

### 4.1 Point of Sale Components

**Duração:** 2-3 dias

#### Componentes a Migrar

1. `ModalSangria.tsx` - Sangria (retirada)
2. `ModalSuprimento.tsx` - Suprimento (entrada)
3. `ModalSuspenderVenda.tsx` - Suspender venda
4. `ModalCancelarVenda.tsx` - Cancelar venda
5. `ListaVendasSuspensas.tsx` - Listar suspensas

#### Padrão

**Antes:**
```typescript
// ❌ ModalSangria.tsx
const response = await fetch('/api/pdv/sangria', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

**Depois:**
```typescript
// ✅ ModalSangria.tsx
import { createWithdrawal } from '@/services/point-of-sale-service';

await createWithdrawal(data);
```

#### Checklist

- [ ] Migrar ModalSangria
- [ ] Migrar ModalSuprimento
- [ ] Migrar ModalSuspenderVenda
- [ ] Migrar ModalCancelarVenda
- [ ] Migrar ListaVendasSuspensas
- [ ] Testar todos os modais
- [ ] Verificar feedback visual

---

### 4.2 Financial Components

**Duração:** 1-2 dias

#### Componentes

1. `NovoLancamentoModal.tsx` - Novo lançamento
2. `ContaContabilFormPage.tsx` - Formulário conta contábil
3. `FormaPagamentoFormPage.tsx` - Formulário forma pagamento

#### Padrão

**Antes:**
```typescript
// ❌ NovoLancamentoModal.tsx
await fetch('/api/movimentacoes', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

**Depois:**
```typescript
// ✅ NovoLancamentoModal.tsx
import { createMovement } from '@/services/movements-service';

await createMovement(data);
```

#### Checklist

- [ ] Migrar NovoLancamentoModal
- [ ] Migrar ContaContabilFormPage
- [ ] Migrar FormaPagamentoFormPage
- [ ] Testar criação de lançamentos
- [ ] Validar formulários

---

### 4.3 Other Components

**Duração:** 1 dia

- `ClienteSearchDialog.tsx` - Busca de clientes (usar partners-service)
- `ModalNovoUsuario.tsx` - Novo usuário (usar companies-users-service)

---

## FASE 5: Settings & Configuration Pages [SPRINT 5]

### 5.1 Settings Pages

**Duração:** 2-3 dias
**Prioridade:** 🟡 MÉDIA

#### Páginas

1. `/settings/prazos-pagamento/page.tsx` - Usa lib/api legacy
2. `/settings/prazos-pagamento/novo/page.tsx` - Usa lib/api legacy
3. `/settings/lista-precos/nova/page.tsx` - Usa lib/api legacy

#### Ação

**Remover imports de lib/api:**
```typescript
// ❌ REMOVER
import { listarPrazosPagamento } from '@/lib/api';

// ✅ USAR
import { listPaymentTerms } from '@/services/payment-terms-service';
```

#### Checklist

- [ ] Migrar página de prazos de pagamento
- [ ] Migrar página de nova tabela de preços
- [ ] Testar configurações
- [ ] Verificar salvamento

---

### 5.2 Tax Pages

**Duração:** 1-2 dias

#### Páginas

1. `/taxes/natureza-operacao/page.tsx`
2. `/taxes/natureza-operacao/novo/page.tsx`
3. `/taxes/natureza-operacao/[id]/configuracao/page.tsx`

#### Ação

```typescript
// ❌ REMOVER
import { getNaturezaOperacao } from '@/lib/api';

// ✅ USAR
import { getOperationNature } from '@/services/operation-nature-service';
```

---

### 5.3 Company Pages

**Duração:** 1 dia

#### Páginas

- `/companies/usuarios/page.tsx`
- `/companies/dados/page.tsx`
- `/companies/marca/page.tsx`
- `/companies/plano/page.tsx`

#### Service

Já existe: `companies-users-service.ts` (usa SDK)

---

## FASE 6: Módulos Secundários [SPRINT 6-7]

### 6.1 Credit Module (Opcional)

**Prioridade:** 🟢 BAIXA
**Duração:** 5-7 dias

#### Estratégia

Como o módulo está em beta e tem poucos usuários, considerar:

**Opção A: Adiar** - Manter usando API routes até ter mais tração
**Opção B: Migrar depois** - Adicionar CreditApiClient ao SDK quando houver demanda
**Opção C: Migrar agora** - Se for prioridade de negócio

#### Se Opção C

1. Adicionar `CreditApiClient` ao SDK package
2. Criar `credit-service.ts` (substituir `credito.ts`)
3. Migrar 11 páginas do módulo
4. Testar fluxo completo de solicitação/aprovação

---

### 6.2 Tenders Module (Opcional)

**Prioridade:** 🟢 BAIXA
**Duração:** 3-4 dias

#### Estratégia Similar ao Credit

**Opção recomendada:** Adiar até validar com usuários

Se migrar:
1. Adicionar `TendersApiClient` ao SDK
2. Atualizar `licitacoes-service.ts`
3. Migrar 4 páginas
4. Migrar 3 componentes

---

## FASE 7: Limpeza e Documentação [SPRINT 7-8]

### 7.1 Deprecar lib/api Legacy

**Duração:** 2 dias

#### Ações

1. Buscar todas as referências a `@/lib/api`
2. Verificar se todas foram substituídas
3. Adicionar deprecation warning
4. Planejar remoção futura

```typescript
// src/lib/api.ts
/**
 * @deprecated This file is deprecated. Use services from @/services instead.
 * This file will be removed in version X.X.X
 */
console.warn('lib/api is deprecated. Use services layer instead.');
```

---

### 7.2 Documentação

**Duração:** 2 dias

#### Criar Documentos

1. **SDK Usage Guide** - Como usar SDK no frontend
2. **Service Layer Pattern** - Padrão de services
3. **Migration Examples** - Exemplos antes/depois
4. **Troubleshooting** - Problemas comuns

#### Atualizar

1. README.md - Adicionar seção SDK
2. CONTRIBUTING.md - Padrões de código
3. Docs do projeto - Arquitetura atualizada

---

### 7.3 Testing & Quality

**Duração:** 3 dias

#### Testes

- [ ] Criar testes e2e para fluxos críticos (PDV, Stock, Financial)
- [ ] Adicionar testes de integração para services
- [ ] Configurar CI/CD para verificar uso de SDK

#### Linting

```javascript
// eslint-custom-rule.js
// Bloquear uso direto de fetch em components/pages
{
  "no-restricted-syntax": [
    "error",
    {
      "selector": "CallExpression[callee.name='fetch']",
      "message": "Direct fetch calls are not allowed. Use services instead."
    }
  ]
}
```

---

## 📊 Cronograma Consolidado

| Sprint | Fase | Duração | Entregas |
|--------|------|---------|----------|
| **1-2** | Fase 1: SDK Core | 5-7 dias | Novos clients no SDK |
| **2-3** | Fase 2: Services | 3-4 dias | 5 services migrados |
| **3-4** | Fase 3: Páginas Críticas | 7-10 dias | PDV, Stock, Financial |
| **4-5** | Fase 4: Componentes | 4-6 dias | Todos componentes core |
| **5** | Fase 5: Settings | 4-6 dias | Configurações migradas |
| **6-7** | Fase 6: Secundários | Opcional | Credit, Tenders |
| **7-8** | Fase 7: Limpeza | 7 dias | Docs, testes, CI/CD |

**Total (sem opcionais):** 30-40 dias
**Total (com opcionais):** 40-54 dias

---

## ✅ Critérios de Sucesso

### Por Fase

**Fase 1:**
- [ ] SDK publicado com 5 novos clients
- [ ] Client Factory atualizado
- [ ] Testes passando

**Fase 2:**
- [ ] 5 services migrados e testados
- [ ] Nenhum fetch em services críticos
- [ ] Documentação atualizada

**Fase 3:**
- [ ] 15+ páginas migradas
- [ ] Zero fetch direto em páginas críticas
- [ ] Testes e2e passando

**Fase 4:**
- [ ] 10+ componentes migrados
- [ ] Componentes testados isoladamente
- [ ] Storybook atualizado (se houver)

**Fase 5:**
- [ ] Todas páginas de settings usando services
- [ ] lib/api não mais usado em settings
- [ ] Validações funcionando

**Fase 7:**
- [ ] Documentação completa
- [ ] CI/CD configurado
- [ ] 90%+ de cobertura SDK

### Global

- [ ] **95%+** das páginas usando SDK (direta ou indiretamente)
- [ ] **Zero** chamadas fetch diretas em componentes críticos
- [ ] **100%** dos services críticos usando SDK
- [ ] **Todos** os testes passando
- [ ] **Documentação** completa e atualizada
- [ ] **Performance** mantida ou melhorada

---

## 🚨 Riscos e Mitigações

### Risco 1: SDK não tem funcionalidade necessária

**Impacto:** Alto
**Probabilidade:** Média

**Mitigação:**
- Fazer análise detalhada antes de cada fase
- Manter fallback para API routes temporariamente
- Priorizar adição de funcionalidades ao SDK

---

### Risco 2: Breaking changes em produção

**Impacto:** Crítico
**Probabilidade:** Baixa

**Mitigação:**
- Feature flags para migração gradual
- Testes extensivos antes de deploy
- Rollback plan documentado
- Deploy em horários de baixo uso

---

### Risco 3: Perda de performance

**Impacto:** Médio
**Probabilidade:** Baixa

**Mitigação:**
- Benchmarks antes/depois
- Monitoramento de performance
- Otimização de cache do SDK
- Lazy loading onde apropriado

---

### Risco 4: Equipe sobrecarregada

**Impacto:** Médio
**Probabilidade:** Média

**Mitigação:**
- Sprints flexíveis
- Priorização clara
- Permitir pausas entre fases
- Distribuir tarefas

---

## 🎯 Quick Wins (Ganhos Rápidos)

Se precisar mostrar progresso rápido, comece por:

### Week 1: Quick Wins
1. Migrar páginas que JÁ usam services (só atualizar imports)
2. Migrar componentes simples (1 fetch apenas)
3. Adicionar apenas 1 client ao SDK (ex: Movements)

**Impacto:** ~10 páginas migradas em 1 semana

---

## 📝 Checklist Geral

### Antes de Começar
- [ ] Equipe alinhada com o plano
- [ ] Ambientes de dev/staging disponíveis
- [ ] Acesso ao repositório do SDK
- [ ] Backups de banco de dados

### Durante
- [ ] Daily syncs sobre progresso
- [ ] Code reviews obrigatórios
- [ ] Testes em staging antes de prod
- [ ] Documentação atualizada incrementalmente

### Depois de Cada Fase
- [ ] Retrospectiva da fase
- [ ] Ajustar cronograma se necessário
- [ ] Comunicar progresso aos stakeholders
- [ ] Celebrar conquistas! 🎉

---

## 📞 Pontos de Contato

### Dúvidas sobre SDK
- Time Backend (API)
- Documentação: `docs/api/sdk.md`

### Dúvidas sobre Frontend
- Time Frontend
- Padrões: `docs/standards/`

### Questões de Negócio
- Product Owner
- Priorização: Este documento

---

## 🎓 Recursos de Apoio

### Documentação Existente
- `docs/api/sdk.md` - Documentação SDK
- `docs/planning/sdk-migration-summary.md` - Resumo migração anterior
- `docs/standards/service-layer-pattern.md` - Padrão de services

### Exemplos de Código
- `src/services/quotes-service.ts` - Exemplo service migrado
- `src/services/sales-orders-service.ts` - Exemplo completo
- `src/hooks/queries/useQuotes.ts` - Exemplo hook com SDK

### Ferramentas
- ESLint - Verificar padrões
- TypeScript - Type checking
- Jest - Testes unitários
- Playwright - Testes e2e

---

## 🔄 Processo de Revisão

### Code Review Checklist

Ao revisar PR de migração SDK:

- [ ] Removeu todos os fetch diretos?
- [ ] Usa service apropriado?
- [ ] Service usa SDK (não API route)?
- [ ] Tratamento de erros implementado?
- [ ] Tipos TypeScript corretos?
- [ ] Testes adicionados/atualizados?
- [ ] Documentação atualizada?
- [ ] Backward compatibility mantida?
- [ ] Performance verificada?

---

## 📈 Métricas de Acompanhamento

### Dashboard de Progresso

Acompanhar semanalmente:

```
┌─────────────────────────────────────┐
│  SDK Migration Progress             │
├─────────────────────────────────────┤
│  Pages Migrated:     45/80 (56%)    │
│  Services Migrated:  28/40 (70%)    │
│  Components:         80/120 (67%)   │
│  Hooks:             20/42 (48%)     │
│                                     │
│  Critical Items:     ████░░ 80%     │
│  Medium Items:       ███░░░ 60%     │
│  Low Priority:       ██░░░░ 40%     │
│                                     │
│  Current Sprint:     3/8            │
│  On Track:           ✅             │
└─────────────────────────────────────┘
```

---

**Próximo Documento:** `03-migration-patterns.md` (padrões detalhados)
**Documento Anterior:** `01-analise-completa.md`

---

*Última atualização: 24/12/2025*
*Versão: 1.0*
*Autor: AI Assistant (Fenix Team)*

