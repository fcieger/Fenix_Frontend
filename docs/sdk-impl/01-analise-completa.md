# Análise Completa: Status da Implementação do SDK

**Data da Análise:** 24 de Dezembro de 2025
**Objetivo:** Identificar telas, componentes e serviços que ainda não utilizam o SDK do Fenix

---

## 📊 Resumo Executivo

### Status Geral

| Categoria | Total | Com SDK | Sem SDK | % Implementado |
|-----------|-------|---------|---------|----------------|
| **Páginas Protegidas** | ~80 | ~30 | ~50 | 37.5% |
| **Serviços** | 40 | 23 | 17 | 57.5% |
| **Componentes** | ~120 | ~75 | ~45 | 62.5% |
| **Hooks** | 42 | 15 | 27 | 35.7% |

### Prioridade de Implementação

🔴 **ALTA** - Funcionalidades core que afetam múltiplos usuários
🟡 **MÉDIA** - Funcionalidades importantes mas com workarounds
🟢 **BAIXA** - Funcionalidades específicas ou em beta

---

## 🎯 Páginas Sem SDK

### 🔴 ALTA PRIORIDADE

#### 1. Financial Module (Contas a Pagar/Receber)
**Status:** Usando serviços, mas serviços usam API routes
**Localização:**
- `/financial/contas-pagar/page.tsx`
- `/financial/contas-pagar/nova/page.tsx`
- `/financial/contas-receber/page.tsx`
- `/financial/contas-receber/nova/page.tsx`

**Problema:**
```typescript
// Atualmente usa serviços que fazem chamadas diretas
const { data } = await fetch('/api/contas-pagar');
```

**Impacto:** Alto - Módulo financeiro é crítico

---

#### 2. Stock Module (Estoque)
**Status:** Chamadas fetch diretas nas páginas
**Localização:**
- `/stock/inventario/page.tsx` (3 chamadas fetch)
- `/stock/inventario/[id]/page.tsx` (6 chamadas fetch)
- `/stock/kardex/page.tsx` (5 chamadas fetch)
- `/stock/lancamento/page.tsx` (2 chamadas fetch)
- `/stock/locais/page.tsx` (7 chamadas fetch)
- `/stock/saldos/page.tsx` (5 chamadas fetch)

**Problema:**
```typescript
// Exemplo de stock/saldos/page.tsx
const response = await fetch('/api/stock/products-with-stock', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Impacto:** Alto - Controle de estoque é funcionalidade essencial

---

#### 3. Point of Sale (PDV)
**Status:** Múltiplas chamadas fetch diretas
**Localização:**
- `/point-of-sale/page.tsx` (8 chamadas fetch)
- `/point-of-sale/abrir/page.tsx` (1 chamada fetch)
- `/point-of-sale/fechar/page.tsx` (3 chamadas fetch)
- `/point-of-sale/diagnostico/page.tsx` (2 chamadas fetch)
- `/point-of-sale/historico/page.tsx` (2 chamadas fetch)

**Problema:**
```typescript
// Chamadas diretas para múltiplos endpoints
fetch('/api/pdv/caixas')
fetch('/api/pdv/vendas')
fetch('/api/pdv/movimentacoes')
```

**Impacto:** Alto - PDV em uso ativo em produção

---

#### 4. Financial Accounts & Movements
**Status:** Serviços implementados mas precisam de endpoints SDK
**Localização:**
- `/financial/banco/page.tsx` (1 chamada fetch)
- `/financial/banco/lancamentos/[id]/page.tsx` (1 chamada fetch)
- `/financial/historico/page.tsx` (1 chamada fetch)

**Problema:**
```typescript
// Services usam API routes porque SDK não tem MovementsApiClient
// src/services/movements-service.ts
await fetch('/api/movimentacoes')
```

**Impacto:** Alto - Movimentações financeiras são críticas

---

### 🟡 MÉDIA PRIORIDADE

#### 5. Settings Pages (Configurações)
**Status:** Uso misto de SDK e API routes
**Localização:**
- `/settings/nfe/page.tsx` (usa SDK via service)
- `/settings/nfe/nova/page.tsx` (7 chamadas fetch + SDK)
- `/settings/prazos-pagamento/page.tsx` (usa lib/api legacy)
- `/settings/prazos-pagamento/novo/page.tsx` (usa lib/api legacy)
- `/settings/lista-precos/nova/page.tsx` (usa lib/api legacy)
- `/settings/certificado/page.tsx`

**Problema:**
```typescript
// Algumas páginas ainda usam o antigo lib/api
import { listarPrazosPagamento } from '@/lib/api';
```

**Impacto:** Médio - Configurações são importantes mas menos frequentes

---

#### 6. Tax Management (Impostos)
**Status:** Usando lib/api legacy
**Localização:**
- `/taxes/natureza-operacao/page.tsx`
- `/taxes/natureza-operacao/novo/page.tsx`
- `/taxes/natureza-operacao/[id]/configuracao/page.tsx`

**Problema:**
```typescript
// Usa API antiga ao invés de operation-nature-service
import { getNaturezaOperacao } from '@/lib/api';
```

**Impacto:** Médio - Importante para emissão de notas

---

#### 7. Company Management (Empresas)
**Status:** Fetch direto
**Localização:**
- `/companies/usuarios/page.tsx` (1 chamada fetch)
- `/companies/dados/page.tsx`
- `/companies/marca/page.tsx`
- `/companies/plano/page.tsx`

**Problema:**
```typescript
// Busca usuários diretamente
await fetch('/api/companies-users')
```

**Impacto:** Médio - Gestão de usuários é importante

---

#### 8. Payment Methods & Cost Centers
**Status:** Serviços usam API routes (sem módulo SDK)
**Localização:**
- `/financial/forma-pagamento/page.tsx` (3 chamadas fetch)
- `/financial/forma-pagamento/create/page.tsx`
- `/financial/forma-pagamento/edit/[id]/page.tsx`
- `/financial/centro-custo/page.tsx` (usa hook)

**Problema:**
```typescript
// SDK não tem PaymentMethodsApiClient ou CostCentersApiClient
// Serviços fazem chamadas diretas para API routes do Next.js
```

**Impacto:** Médio - Funcionalidades financeiras auxiliares

---

### 🟢 BAIXA PRIORIDADE

#### 9. Credit Module (Crédito)
**Status:** Usa API routes via axios (legacy)
**Localização:**
- `/credit/*` (todas as páginas)
  - `/credit/page.tsx`
  - `/credit/solicitar/page.tsx`
  - `/credit/propostas/page.tsx`
  - `/credit/minhas-solicitacoes/page.tsx`
  - `/credit/documentacao/page.tsx`
  - `/credit/capital-giro/page.tsx`
  - `/credit/antecipacao/page.tsx`
  - `/credit/admin/*` (todas)

**Problema:**
```typescript
// Usa serviço credito.ts que usa axios com api instance legacy
import { criarSolicitacao } from '@/services/credito';
// Internamente: await api.post('/api/credit/solicitacoes', data);
```

**Impacto:** Baixo - Módulo em beta, poucos usuários

---

#### 10. Tenders (Licitações)
**Status:** Usa axios direto
**Localização:**
- `/tenders/page.tsx`
- `/tenders/[id]/page.tsx`
- `/tenders/alertas/page.tsx`
- `/tenders/matches/page.tsx`
- `/tenders/components/*`

**Problema:**
```typescript
// licitacoes-service.ts usa axios direto
const response = await axios.get(`${API_URL}/api/licitacoes`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Impacto:** Baixo - Funcionalidade específica

---

#### 11. Reports (Relatórios)
**Status:** Maioria usa componentes que podem ter fetch direto
**Localização:**
- `/reports/*` (todas as subpáginas)
- `/reports/vendas/page.tsx`
- `/reports/compras/page.tsx`
- `/reports/financeiro/page.tsx`
- `/reports/estoque/page.tsx`
- `/reports/fiscal/page.tsx`
- `/reports/caixa/page.tsx`

**Problema:**
```typescript
// Componentes de relatório podem ter chamadas diretas
// Ex: RelatorioAreaBase.tsx
```

**Impacto:** Baixo - Relatórios são consultas, não modificam dados

---

#### 12. Miscellaneous Pages
**Status:** Variado
**Localização:**
- `/assistants/page.tsx`
- `/chat/page.tsx` (usa chat-service com API routes)
- `/sebrae-courses/page.tsx`
- `/notifications/page.tsx`

**Impacto:** Baixo - Funcionalidades auxiliares

---

## 🔧 Serviços Sem SDK

### Serviços que Usam API Routes (Sem módulo SDK disponível)

| Serviço | Arquivo | Razão | SDK Disponível? |
|---------|---------|-------|-----------------|
| **Movements** | `movements-service.ts` | Movimentações financeiras | ❌ Não |
| **Cost Centers** | `cost-centers-service.ts` | Centros de custo | ❌ Não |
| **Chart of Accounts** | `chart-of-accounts-service.ts` | Plano de contas | ❌ Não |
| **Payment Methods** | `payment-methods-service.ts` | Formas de pagamento | ❌ Não |
| **Credit** | `credito.ts` | Módulo de crédito | ❌ Não |
| **Tenders** | `licitacoes-service.ts` | Licitações | ❌ Não |
| **Chat** | `chat-service.ts` | Chat/IA | ❌ Não |
| **Lookups** | `lookups.ts` | Utilitários de busca | ❌ Não |
| **Cash Flow** | `fluxo-caixa-service.ts` | Usa DB direto (intencional) | N/A |

### Serviços com SDK mas com Fallbacks

Estes serviços JÁ usam SDK quando disponível, mas têm fallback para API routes:

| Serviço | Status SDK | Fallback |
|---------|-----------|----------|
| `financial-accounts-service.ts` | ✅ Usa SDK | Sim, para endpoints específicos |
| `nfe-service.ts` | ✅ Usa SDK | Sim, para integração |
| `payment-terms-service.ts` | ✅ Usa SDK | Sim |

---

## 🧩 Componentes Sem SDK

### Componentes com Fetch/Axios Direto

| Componente | Arquivo | Chamadas | Prioridade |
|------------|---------|----------|------------|
| **NovoLancamentoModal** | `NovoLancamentoModal.tsx` | fetch para movimentações | 🔴 Alta |
| **Point of Sale Modals** | `point-of-sale/*.tsx` | múltiplas chamadas fetch | 🔴 Alta |
| - ModalSangria | `ModalSangria.tsx` | POST /api/pdv/sangria | 🔴 Alta |
| - ModalSuprimento | `ModalSuprimento.tsx` | POST /api/pdv/suprimento | 🔴 Alta |
| - ModalSuspenderVenda | `ModalSuspenderVenda.tsx` | POST /api/pdv/vendas-suspensas | 🔴 Alta |
| - ModalCancelarVenda | `ModalCancelarVenda.tsx` | DELETE /api/pdv/vendas | 🔴 Alta |
| - ListaVendasSuspensas | `ListaVendasSuspensas.tsx` | GET /api/pdv/vendas-suspensas | 🔴 Alta |
| **ContaContabilFormPage** | `ContaContabilFormPage.tsx` | fetch contas contábeis | 🟡 Média |
| **FormaPagamentoFormPage** | `FormaPagamentoFormPage.tsx` | fetch formas pagamento | 🟡 Média |
| **ModalNovoUsuario** | `users/ModalNovoUsuario.tsx` | fetch usuários | 🟡 Média |
| **ClienteSearchDialog** | `nfe/ClienteSearchDialog.tsx` | fetch parceiros | 🟡 Média |
| **CadastrosAIAssistant** | `CadastrosAIAssistant.tsx` | fetch IA | 🟢 Baixa |
| **RelatorioAreaBase** | `reports/RelatorioAreaBase.tsx` | fetch relatórios | 🟢 Baixa |
| **ExemploUso** | `reports/pdf/ExemploUso.tsx` | fetch dados PDF | 🟢 Baixa |

---

## 🪝 Hooks Sem SDK

### Hooks que Precisam Migração

| Hook | Status | Depende de |
|------|--------|------------|
| `useMovimentacoes.ts` | ❌ Usa movements-service | Movements service precisa SDK |
| `useContas.ts` | ⚠️ Parcial | Financial accounts (já tem SDK) |
| `useCentrosCustos.ts` | ❌ Usa API routes | Cost centers service precisa SDK |
| `useContasContabeis.ts` | ❌ Usa API routes | Chart of accounts precisa SDK |
| `useContasContabeisSimples.ts` | ❌ Usa API routes | Chart of accounts precisa SDK |
| `useChartOfAccounts.ts` | ❌ Usa chart-of-accounts-service | Service precisa SDK |
| `useMovements.ts` | ❌ Usa movements-service | Service precisa SDK |

### Hooks que JÁ Usam SDK (através de services)

✅ Todos os hooks em `/hooks/queries/*`:
- `usePartners.ts`
- `useProducts.ts`
- `useQuotes.ts`
- `useSalesOrders.ts`
- `usePurchaseOrders.ts`

✅ Outros hooks migrados:
- `useFinancialAccounts.ts` - Usa SDK
- `useCostCenters.ts` - Usa service (service usa API routes)

---

## 📦 Módulos SDK Disponíveis vs Necessários

### ✅ Disponíveis no SDK (já implementados)

1. `AuthApiClient` ✅
2. `ProductsApiClient` ✅
3. `PartnersApiClient` ✅
4. `QuotesApiClient` ✅
5. `SalesOrdersApiClient` ✅
6. `PurchaseOrdersApiClient` ✅
7. `FinancialAccountsApiClient` ✅
8. `AccountsPayableApiClient` ✅
9. `AccountsReceivableApiClient` ✅
10. `StockApiClient` ✅
11. `TaxesApiClient` ✅
12. `NfeApiClient` ✅
13. `PaymentTermsApiClient` ✅
14. `ApiKeysApiClient` ✅
15. `CertificatesApiClient` ✅
16. `CompaniesUsersApiClient` ✅
17. `InvitationsApiClient` ✅
18. `NfeConfigApiClient` ✅
19. `OperationNatureApiClient` ✅
20. `PlansApiClient` ✅
21. `DashboardsApiClient` ✅

### ❌ Necessários mas NÃO Disponíveis no SDK

1. **MovementsApiClient** ❌ - Para movimentações financeiras
2. **CostCentersApiClient** ❌ - Para centros de custo
3. **ChartOfAccountsApiClient** ❌ - Para plano de contas
4. **PaymentMethodsApiClient** ❌ - Para formas de pagamento
5. **PointOfSaleApiClient** ❌ - Para PDV (caixas, vendas, movimentações)
6. **CreditApiClient** ❌ - Para módulo de crédito
7. **TendersApiClient** ❌ - Para licitações
8. **ChatApiClient** ❌ - Para chat/IA
9. **ReportsApiClient** ❌ - Para relatórios

---

## 🎯 Análise de Impacto

### Funcionalidades Críticas Sem SDK

1. **Point of Sale (PDV)** - 🔴 CRÍTICO
   - Em uso ativo em produção
   - Múltiplas telas e componentes afetados
   - ~15 chamadas fetch diretas

2. **Stock Management** - 🔴 CRÍTICO
   - Controle de estoque essencial
   - 6 páginas afetadas
   - ~30 chamadas fetch diretas

3. **Financial Movements** - 🔴 CRÍTICO
   - Movimentações financeiras core
   - Impacta contas bancárias e histórico
   - Service já existe mas usa API routes

4. **Cost Centers** - 🟡 IMPORTANTE
   - Fundamental para contabilidade
   - Service existe mas usa API routes

### Métricas de Complexidade

| Módulo | Páginas | Componentes | Chamadas API | Esforço Estimado |
|--------|---------|-------------|--------------|------------------|
| **PDV** | 5 | 8 | ~25 | 5-7 dias |
| **Stock** | 6 | 3 | ~30 | 4-6 dias |
| **Movements** | 3 | 2 | ~15 | 2-3 dias |
| **Cost Centers** | 1 | 2 | ~8 | 1-2 dias |
| **Payment Methods** | 3 | 2 | ~10 | 1-2 dias |
| **Chart of Accounts** | 3 | 2 | ~12 | 2-3 dias |
| **Credit** | 11 | 0 | ~40 | 5-7 dias |
| **Tenders** | 4 | 3 | ~20 | 3-4 dias |

**Total Estimado:** 23-34 dias de desenvolvimento

---

## 🔍 Padrões Identificados

### Padrão 1: Fetch Direto em Páginas
```typescript
// ❌ Antipadrão encontrado
const response = await fetch('/api/endpoint', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Solução:**
```typescript
// ✅ Usar service com SDK
import { operacao } from '@/services/nome-service';
const result = await operacao();
```

### Padrão 2: Services Sem SDK
```typescript
// ❌ Service usando API route
export async function listItems() {
  const response = await fetch('/api/items');
  return response.json();
}
```

**Solução (quando SDK disponível):**
```typescript
// ✅ Service usando SDK
import { SdkClientFactory } from '@/lib/sdk/client-factory';
export async function listItems() {
  const client = SdkClientFactory.getItemsClient();
  return await client.list();
}
```

**Solução (quando SDK NÃO disponível):**
```typescript
// ⚠️ Documentar claramente e adicionar TODO
/**
 * Items Service
 * Uses Next.js API routes
 *
 * NOTE: This service uses direct API routes because there's no ItemsApiClient in the SDK.
 * TODO: Add ItemsApiClient to the SDK
 */
export async function listItems() {
  // mantém fetch temporariamente
}
```

### Padrão 3: Componentes com Lógica de API
```typescript
// ❌ Componente fazendo fetch direto
function Componente() {
  const handleAction = async () => {
    await fetch('/api/action');
  };
}
```

**Solução:**
```typescript
// ✅ Componente usando hook que usa service
function Componente() {
  const { executeAction } = useActions();
  const handleAction = () => executeAction();
}
```

---

## 📋 Conclusões

### Pontos Positivos
1. ✅ **37.5%** das páginas já usam SDK (direta ou indiretamente)
2. ✅ **57.5%** dos serviços já implementados
3. ✅ Infraestrutura SDK bem estabelecida (client-factory, error-handler)
4. ✅ Padrões consistentes nos serviços migrados
5. ✅ Hooks de queries bem organizados

### Pontos de Atenção
1. ⚠️ Módulos críticos (PDV, Stock) ainda sem SDK
2. ⚠️ Muitas chamadas fetch diretas em páginas
3. ⚠️ 9 módulos SDK faltando no pacote
4. ⚠️ Componentes com lógica de API embutida
5. ⚠️ Código legacy (lib/api) ainda em uso

### Recomendações Estratégicas

1. **Curto Prazo (1-2 sprints)**
   - Adicionar módulos SDK críticos: PDV, Stock, Movements
   - Migrar páginas de alta prioridade
   - Criar hooks para novos services

2. **Médio Prazo (3-4 sprints)**
   - Adicionar módulos restantes ao SDK
   - Migrar todas as páginas financeiras
   - Refatorar componentes com fetch direto

3. **Longo Prazo (5+ sprints)**
   - Deprecar lib/api completamente
   - Migrar módulos beta (Credit, Tenders)
   - Estabelecer CI/CD checks para evitar fetch direto

---

**Próximos Passos:** Ver `02-plano-acao.md`

