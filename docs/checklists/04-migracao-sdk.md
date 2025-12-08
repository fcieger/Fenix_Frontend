# Checklist: Migração Completa para SDK

## 🎯 Objetivo
Migrar todos os serviços que ainda usam `apiService` ou `fetch` direto para usar o SDK (`@fenix/api-sdk`).

---

## 📋 Auditoria Inicial

### Identificar Serviços a Migrar
- [ ] Listar todos os arquivos em `src/services/`
- [ ] Identificar quais usam `apiService`
- [ ] Identificar quais usam `fetch` direto
- [ ] Identificar quais já usam SDK
- [ ] Priorizar por frequência de uso

### Serviços Prioritários
- [ ] `partners-service.ts` - Não migrado
- [ ] `nfe-service.ts` - Não migrado
- [ ] `stock-service.ts` - Não migrado
- [ ] `purchase-orders-service.ts` - Parcialmente migrado
- [ ] `sales-orders-service.ts` - Parcialmente migrado
- [ ] `quotes-service.ts` - Parcialmente migrado
- [ ] `financial-accounts-service.ts` - Verificar se completo
- [ ] Outros serviços identificados

---

## 🔧 Template de Migração

### Estrutura do Serviço Migrado
```typescript
// src/services/[entity]-service.ts
import { SdkClientFactory } from "@/lib/sdk/client-factory";
import { SdkErrorHandler } from "@/lib/sdk/error-handler";
import { normalizeListResponse } from "@/lib/sdk/response-normalizer";
import type { [Entity], Create[Entity]Dto, Update[Entity]Dto } from "@/types/sdk";
```

### Funções Padrão
- [ ] `list[Entity]s(params?)` - Listar com paginação/filtros
- [ ] `get[Entity](id)` - Buscar por ID
- [ ] `create[Entity](payload)` - Criar novo
- [ ] `update[Entity](id, payload)` - Atualizar
- [ ] `delete[Entity](id)` - Excluir

---

## 📝 Checklist por Serviço

### Para cada serviço, seguir:

#### 1. Preparação
- [ ] Verificar se o SDK tem o cliente correspondente
- [ ] Verificar tipos no `@/types/sdk`
- [ ] Verificar se precisa criar tipos customizados
- [ ] Documentar diferenças entre API antiga e SDK

#### 2. Migração de Funções
- [ ] Migrar `list[Entity]s`
  - [ ] Usar `SdkClientFactory.get[Entity]Client()`
  - [ ] Chamar `findAll(params)`
  - [ ] Normalizar resposta com `normalizeListResponse`
  - [ ] Tratar erros com `SdkErrorHandler`
- [ ] Migrar `get[Entity]`
  - [ ] Usar `findOne(id)`
  - [ ] Tratar erros
- [ ] Migrar `create[Entity]`
  - [ ] Usar `create(payload)`
  - [ ] Validar payload
  - [ ] Tratar erros
- [ ] Migrar `update[Entity]`
  - [ ] Usar `update(id, payload)`
  - [ ] Validar payload
  - [ ] Tratar erros
- [ ] Migrar `delete[Entity]`
  - [ ] Usar `delete(id)`
  - [ ] Tratar erros

#### 3. Funções Específicas
- [ ] Identificar funções específicas (não CRUD)
- [ ] Verificar se SDK suporta
- [ ] Migrar ou criar wrapper
- [ ] Documentar limitações

#### 4. Testes
- [ ] Testar cada função migrada
- [ ] Testar tratamento de erros
- [ ] Testar com dados válidos
- [ ] Testar com dados inválidos
- [ ] Comparar comportamento com versão antiga

#### 5. Atualização de Uso
- [ ] Buscar todos os lugares que usam o serviço antigo
- [ ] Atualizar imports
- [ ] Verificar se interface mudou
- [ ] Atualizar tipos se necessário
- [ ] Testar funcionalidades que usam o serviço

#### 6. Limpeza
- [ ] Remover código antigo comentado
- [ ] Remover imports não usados
- [ ] Atualizar documentação
- [ ] Marcar como migrado no checklist

---

## 🔍 Serviços Específicos

### partners-service.ts
- [ ] Verificar `PartnersApiClient` no SDK
- [ ] Migrar `listPartners`
- [ ] Migrar `getPartner`
- [ ] Migrar `createPartner`
- [ ] Migrar `updatePartner`
- [ ] Migrar `deletePartner`
- [ ] Verificar funções específicas (busca por CNPJ, etc.)
- [ ] Atualizar todos os usos
- [ ] Testar integração

### nfe-service.ts
- [ ] Verificar `NFeApiClient` no SDK
- [ ] Migrar funções de listagem
- [ ] Migrar funções de criação
- [ ] Migrar funções de atualização
- [ ] Verificar funções específicas (emitir, cancelar, etc.)
- [ ] Atualizar todos os usos
- [ ] Testar integração

### stock-service.ts
- [ ] Verificar `StockApiClient` no SDK
- [ ] Migrar funções de estoque
- [ ] Verificar movimentações de estoque
- [ ] Atualizar todos os usos
- [ ] Testar integração

### purchase-orders-service.ts
- [ ] Identificar funções não migradas
- [ ] Completar migração
- [ ] Verificar consistência
- [ ] Remover código antigo
- [ ] Testar integração

### sales-orders-service.ts
- [ ] Identificar funções não migradas
- [ ] Completar migração
- [ ] Verificar consistência
- [ ] Remover código antigo
- [ ] Testar integração

### quotes-service.ts
- [ ] Identificar funções não migradas
- [ ] Completar migração
- [ ] Verificar funções específicas (converter em pedido)
- [ ] Remover código antigo
- [ ] Testar integração

---

## 🎣 Atualização de Hooks React Query

### Para cada serviço migrado:
- [ ] Atualizar hooks em `src/hooks/queries/`
- [ ] Verificar se tipos estão corretos
- [ ] Testar queries
- [ ] Testar mutations
- [ ] Verificar invalidação de cache

---

## 🧹 Limpeza Final

### Remover Código Antigo
- [ ] Buscar todos os usos de `apiService`
- [ ] Verificar se ainda são necessários
- [ ] Remover ou migrar
- [ ] Buscar `fetch` direto (fora de serviços)
- [ ] Migrar ou documentar exceções

### Atualizar Imports
- [ ] Buscar imports de `@/lib/api` (apiService)
- [ ] Substituir por imports de serviços
- [ ] Verificar se `apiService` ainda é usado
- [ ] Documentar se ainda necessário

---

## 📝 Documentação

### Padrões de Migração
- [ ] Documentar template de migração
- [ ] Documentar padrões de tratamento de erro
- [ ] Documentar normalização de respostas
- [ ] Criar guia de migração

### Status de Migração
- [ ] Criar documento com status de cada serviço
- [ ] Manter atualizado durante migração
- [ ] Marcar serviços completos

---

## ✅ Critérios de Aceitação

### Por Serviço
- [ ] Todas as funções migradas
- [ ] Testes passando
- [ ] Todos os usos atualizados
- [ ] Código antigo removido
- [ ] Documentação atualizada

### Geral
- [ ] 100% dos serviços usando SDK
- [ ] `apiService` removido ou apenas para casos especiais
- [ ] Sem `fetch` direto (exceto casos documentados)
- [ ] Todos os hooks atualizados
- [ ] Testes de integração passando

---

## 🎯 Métricas de Sucesso

### Antes
- ❌ Mistura de padrões (SDK + apiService + fetch)
- ❌ Inconsistência entre serviços
- ❌ Difícil manutenção

### Depois
- ✅ 100% dos serviços usando SDK
- ✅ Padrão consistente
- ✅ Fácil manutenção e extensão

---

## 📊 Progresso

### Serviços Migrados
- [ ] partners-service.ts
- [ ] nfe-service.ts
- [ ] stock-service.ts
- [ ] purchase-orders-service.ts (completo)
- [ ] sales-orders-service.ts (completo)
- [ ] quotes-service.ts (completo)
- [ ] financial-accounts-service.ts (verificar)
- [ ] Outros serviços...

### Total: 0/X serviços migrados

---

**Prioridade:** 🟡 IMPORTANTE
**Estimativa:** 2-3 semanas
**Dependências:** Checklist 01 (React Query)

