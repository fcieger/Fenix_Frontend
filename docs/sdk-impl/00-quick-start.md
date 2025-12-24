# SDK Implementation - Quick Start Guide

**Para:** Desenvolvedores que vão implementar migração SDK
**Tempo estimado:** 15 minutos de leitura
**Objetivo:** Começar a migrar código rapidamente

---

## 🚀 TL;DR (Too Long; Didn't Read)

1. **Nunca** use `fetch()` direto em páginas ou componentes
2. **Sempre** use services da pasta `src/services/`
3. **Services** devem usar SDK quando disponível
4. **Se SDK não existe**, documente e use API routes temporariamente

---

## 📖 Leitura Obrigatória (5 min)

### O Que é o SDK?

O SDK (`@fenix/api-sdk`) é um pacote npm que encapsula todas as chamadas à API do Fenix. Ele:

- ✅ Gerencia autenticação automaticamente
- ✅ Padroniza tratamento de erros
- ✅ Fornece tipos TypeScript
- ✅ Simplifica código
- ✅ Facilita manutenção

### Arquitetura em Camadas

```
┌─────────────────────────────────┐
│  SDK Package (@fenix/api-sdk)   │  ← Biblioteca npm
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  Services (src/services/)       │  ← Nossa camada de serviços
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  Hooks (src/hooks/)             │  ← Hooks React Query
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  Pages & Components             │  ← UI
└─────────────────────────────────┘
```

**Regra de Ouro:** Cada camada só pode acessar a camada diretamente abaixo dela.

---

## 🎯 Como Migrar (Por Tipo)

### Tipo 1: Página Simples (10 min)

**Antes:**
```typescript
const res = await fetch('/api/products');
const data = await res.json();
```

**Depois:**
```typescript
import { listProducts } from '@/services/products-service';
const data = await listProducts();
```

**Passos:**
1. Identifique qual service usar (ver lista abaixo)
2. Importe a função do service
3. Substitua o fetch
4. Teste

---

### Tipo 2: Componente com Estado (15 min)

**Antes:**
```typescript
const [items, setItems] = useState([]);

useEffect(() => {
  fetch('/api/items').then(r => r.json()).then(setItems);
}, []);
```

**Depois:**
```typescript
import { useItems } from '@/hooks/queries/useItems';

const { data: items = [], isLoading } = useItems();
```

**Passos:**
1. Procure se existe hook (pasta `src/hooks/queries/`)
2. Se existe, use o hook
3. Se não existe, crie o hook (ver template abaixo)
4. Teste

---

### Tipo 3: Criar Service Novo (30 min)

**Quando:** Você precisa de funcionalidade que não tem service

**Template:**
```typescript
// src/services/meu-service.ts
import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

export async function listarItens() {
  try {
    const client = SdkClientFactory.getMeuClient();
    return await client.list();
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}
```

**Passos:**
1. Copie o template acima
2. Substitua `Meu` pelo nome do recurso
3. Implemente os métodos necessários
4. Teste

---

## 📋 Services Disponíveis (Copy-Paste Ready)

### Products (Produtos)
```typescript
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '@/services/products-service';
```
**Status:** ✅ Usa SDK

---

### Partners (Parceiros/Clientes/Fornecedores)
```typescript
import {
  listPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner
} from '@/services/partners-service';
```
**Status:** ✅ Usa SDK

---

### Quotes (Orçamentos)
```typescript
import {
  listQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote
} from '@/services/quotes-service';
```
**Status:** ✅ Usa SDK

---

### Sales Orders (Pedidos de Venda)
```typescript
import {
  listSalesOrders,
  getSalesOrder,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder
} from '@/services/sales-orders-service';
```
**Status:** ✅ Usa SDK

---

### Purchase Orders (Pedidos de Compra)
```typescript
import {
  listPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder
} from '@/services/purchase-orders-service';
```
**Status:** ✅ Usa SDK

---

### Stock (Estoque)
```typescript
import {
  listStockBalances,
  getStockBalance,
  createStockMovement,
  getStockHistory
} from '@/services/stock-service';
```
**Status:** ✅ Usa SDK

---

### Financial Accounts (Contas Financeiras)
```typescript
import {
  listFinancialAccounts,
  createFinancialAccount,
  updateFinancialAccount,
  deleteFinancialAccount
} from '@/services/financial-accounts-service';
```
**Status:** ✅ Usa SDK

---

### Accounts Payable (Contas a Pagar)
```typescript
import {
  listAccountsPayable,
  getAccountPayable,
  createAccountPayable,
  updateAccountPayable,
  deleteAccountPayable
} from '@/services/accounts-payable-service';
```
**Status:** ✅ Usa SDK

---

### Accounts Receivable (Contas a Receber)
```typescript
import {
  listAccountsReceivable,
  getAccountReceivable,
  createAccountReceivable,
  updateAccountReceivable,
  deleteAccountReceivable
} from '@/services/accounts-receivable-service';
```
**Status:** ✅ Usa SDK

---

### Payment Terms (Prazos de Pagamento)
```typescript
import {
  listPaymentTerms,
  getPaymentTerm,
  createPaymentTerm,
  updatePaymentTerm,
  deletePaymentTerm
} from '@/services/payment-terms-service';
```
**Status:** ✅ Usa SDK

---

### NFe (Nota Fiscal Eletrônica)
```typescript
import {
  listNFes,
  getNFe,
  issueNFe,
  cancelNFe,
  downloadNFeXML,
  downloadNFePDF
} from '@/services/nfe-service';
```
**Status:** ✅ Usa SDK

---

### Taxes (Impostos)
```typescript
import {
  listTaxes,
  getTax,
  calculateTaxes
} from '@/services/taxes-service';
```
**Status:** ✅ Usa SDK

---

### Operation Nature (Natureza de Operação)
```typescript
import {
  listOperationNatures,
  getOperationNature,
  createOperationNature,
  updateOperationNature
} from '@/services/operation-nature-service';
```
**Status:** ✅ Usa SDK

---

### Certificates (Certificados Digitais)
```typescript
import {
  listCertificates,
  uploadCertificate,
  deleteCertificate
} from '@/services/certificates-service';
```
**Status:** ✅ Usa SDK

---

### Companies Users (Usuários da Empresa)
```typescript
import {
  listCompanyUsers,
  inviteUser,
  removeUser
} from '@/services/companies-users-service';
```
**Status:** ✅ Usa SDK

---

### Services SEM SDK (Use com cautela)

Estes services ainda usam API routes porque o SDK não tem o client correspondente:

#### Movements (Movimentações Financeiras)
```typescript
import {
  listMovements,
  createMovement,
  updateMovement,
  deleteMovement
} from '@/services/movements-service';
```
**Status:** ⚠️ Usa API routes (temporário)

---

#### Cost Centers (Centros de Custo)
```typescript
import {
  listCostCenters,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter
} from '@/services/cost-centers-service';
```
**Status:** ⚠️ Usa API routes (temporário)

---

#### Chart of Accounts (Plano de Contas)
```typescript
import {
  listAccounts,
  createAccount,
  updateAccount,
  deleteAccount
} from '@/services/chart-of-accounts-service';
```
**Status:** ⚠️ Usa API routes (temporário)

---

#### Payment Methods (Formas de Pagamento)
```typescript
import {
  listPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
} from '@/services/payment-methods-service';
```
**Status:** ⚠️ Usa API routes (temporário)

---

## 🛠️ Templates Úteis

### Template: Hook React Query

```typescript
// src/hooks/queries/useMeuRecurso.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listarRecursos,
  criarRecurso,
  atualizarRecurso,
  deletarRecurso
} from '@/services/meu-recurso-service';

// Hook para listar
export function useMeuRecurso(filtros?: any) {
  return useQuery({
    queryKey: ['meu-recurso', filtros],
    queryFn: () => listarRecursos(filtros),
  });
}

// Hook para criar
export function useCriarRecurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: criarRecurso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meu-recurso'] });
    },
  });
}

// Hook para atualizar
export function useAtualizarRecurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      atualizarRecurso(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meu-recurso'] });
    },
  });
}

// Hook para deletar
export function useDeletarRecurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletarRecurso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meu-recurso'] });
    },
  });
}
```

---

### Template: Service Completo

```typescript
// src/services/meu-recurso-service.ts
import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Meu Recurso Service
 * Uses MeuRecursoApiClient from SDK
 */

export async function listarRecursos(filtros?: any) {
  try {
    const client = SdkClientFactory.getMeuRecursoClient();
    return await client.list(filtros);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function obterRecurso(id: string) {
  try {
    const client = SdkClientFactory.getMeuRecursoClient();
    return await client.get(id);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function criarRecurso(dados: any) {
  try {
    const client = SdkClientFactory.getMeuRecursoClient();
    return await client.create(dados);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function atualizarRecurso(id: string, dados: any) {
  try {
    const client = SdkClientFactory.getMeuRecursoClient();
    return await client.update(id, dados);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

export async function deletarRecurso(id: string) {
  try {
    const client = SdkClientFactory.getMeuRecursoClient();
    return await client.delete(id);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}
```

---

## ⚡ Comandos Úteis

### Encontrar código para migrar

```bash
# Encontrar páginas com fetch
grep -r "fetch\(" src/app/(protected) --include="*.tsx" | wc -l

# Encontrar componentes com fetch
grep -r "fetch\(" src/components --include="*.tsx" | wc -l

# Encontrar uso de lib/api legacy
grep -r "from '@/lib/api'" src/ --include="*.tsx"

# Ver services disponíveis
ls -1 src/services/
```

### Testar service localmente

```bash
# No console do navegador
import { listProducts } from '@/services/products-service';
const products = await listProducts();
console.log(products);
```

---

## ❓ FAQ (Perguntas Frequentes)

### P: O que faço se o service não existir?

**R:** Crie o service primeiro, depois use nas páginas. Use o template acima.

---

### P: O SDK tem o client que preciso?

**R:** Verifique em `src/lib/sdk/client-factory.ts`. Se tiver um método `getXxxClient()`, tem.

---

### P: E se o SDK NÃO tiver o client?

**R:** Crie o service usando API routes temporariamente. Documente claramente:
```typescript
/**
 * NOTE: Uses API routes because SDK doesn't have this client yet.
 * TODO: Add to SDK in the future.
 */
```

---

### P: Preciso mexer no SDK package?

**R:** Não, a menos que esteja adicionando um novo client. Foque no frontend.

---

### P: Como sei se minha migração está correta?

**R:** Checklist:
- [ ] Não tem fetch direto
- [ ] Usa service
- [ ] Tem tratamento de erro
- [ ] Testes passam
- [ ] Funcionalidade funciona igual

---

### P: Posso usar fetch direto "só dessa vez"?

**R:** ❌ **NÃO.** Sempre use services. Sem exceções.

---

### P: Quanto tempo leva para migrar uma página?

**R:**
- **Simples:** 10-15 minutos
- **Média:** 30-45 minutos
- **Complexa:** 1-2 horas

---

### P: Preciso atualizar testes?

**R:** Sim, se a página/componente tem testes. Mock o service ao invés do fetch.

---

## 🎯 Próximos Passos

1. **Escolha uma página simples** para começar
2. **Identifique o service** necessário (lista acima)
3. **Substitua o fetch** pelo service
4. **Teste localmente**
5. **Commit e PR**
6. **Repita** com próxima página

---

## 📚 Documentação Completa

- [Análise Completa](./01-analise-completa.md) - Status detalhado
- [Plano de Ação](./02-plano-acao.md) - Estratégia completa
- [Padrões de Migração](./03-migration-patterns.md) - Exemplos detalhados

---

## 🆘 Precisa de Ajuda?

1. **Leia primeiro:** [Padrões de Migração](./03-migration-patterns.md)
2. **Consulte exemplos:** Veja services já migrados em `src/services/`
3. **Pergunte no time:** Canal #frontend ou #sdk

---

## ✅ Checklist Rápida

Antes de fazer PR:

- [ ] Código não tem fetch/axios direto
- [ ] Usa service apropriado
- [ ] Service usa SDK (ou está documentado)
- [ ] Tem tratamento de erro
- [ ] Testei localmente
- [ ] Testes automatizados passam
- [ ] Sem erros de lint
- [ ] Sem warnings do TypeScript

---

**Boa sorte! 🚀**

*Última atualização: 24/12/2025*

