# SDK Implementation Documentation

Documentação completa sobre a implementação e migração para o SDK do Fenix no frontend.

---

## 📚 Documentos

### [00-quick-start.md](./00-quick-start.md) - **COMECE AQUI** ⭐
**Leitura:** 15 minutos
**Para:** Desenvolvedores que vão implementar migração
**Conteúdo:**
- Como começar rapidamente
- Lista de services disponíveis (copy-paste)
- Templates prontos
- FAQ

---

### [01-analise-completa.md](./01-analise-completa.md)
**Leitura:** 30 minutos
**Para:** Entender o estado atual completo
**Conteúdo:**
- Status detalhado de todas as páginas
- Análise de componentes
- Serviços mapeados
- Hooks identificados
- Módulos SDK disponíveis vs necessários
- Métricas e estatísticas

---

### [02-plano-acao.md](./02-plano-acao.md)
**Leitura:** 45 minutos
**Para:** Product Owners, Tech Leads, Time completo
**Conteúdo:**
- Estratégia de implementação em fases
- Cronograma detalhado (30-54 dias)
- Priorização por impacto
- Riscos e mitigações
- Critérios de sucesso
- Checklists e métricas

---

### [03-migration-patterns.md](./03-migration-patterns.md)
**Leitura:** 30 minutos
**Para:** Referência durante desenvolvimento
**Conteúdo:**
- Padrões antes/depois
- Como criar services
- Como criar hooks
- Antipadrões comuns
- Exemplos completos
- Dicas avançadas

---

## 🚦 Fluxo de Leitura Recomendado

### Para Desenvolvedores

```
1. Quick Start (00-quick-start.md)
   ↓
2. Escolher uma página/componente
   ↓
3. Consultar Migration Patterns (03-migration-patterns.md)
   ↓
4. Implementar
   ↓
5. Testar
   ↓
6. PR
```

### Para Tech Leads / Product Owners

```
1. Análise Completa (01-analise-completa.md)
   ↓
2. Plano de Ação (02-plano-acao.md)
   ↓
3. Definir prioridades
   ↓
4. Distribuir tasks
   ↓
5. Acompanhar progresso
```

---

## 📊 Status Atual (24/12/2025)

### Resumo Executivo

| Categoria | % Implementado |
|-----------|----------------|
| Páginas | 37.5% |
| Serviços | 57.5% |
| Componentes | 62.5% |
| Hooks | 35.7% |

### Prioridades

🔴 **ALTA PRIORIDADE**
- Point of Sale (PDV)
- Stock Management
- Financial Movements
- Accounts Payable/Receivable

🟡 **MÉDIA PRIORIDADE**
- Settings pages
- Tax Management
- Company Management
- Payment Methods

🟢 **BAIXA PRIORIDADE**
- Credit Module (beta)
- Tenders Module
- Reports
- Miscellaneous

---

## 🎯 Módulos SDK

### ✅ Disponíveis (21 clients)

Estes clients já estão no SDK e podem ser usados:

1. AuthApiClient
2. ProductsApiClient
3. PartnersApiClient
4. QuotesApiClient
5. SalesOrdersApiClient
6. PurchaseOrdersApiClient
7. FinancialAccountsApiClient
8. AccountsPayableApiClient
9. AccountsReceivableApiClient
10. StockApiClient
11. TaxesApiClient
12. NfeApiClient
13. PaymentTermsApiClient
14. ApiKeysApiClient
15. CertificatesApiClient
16. CompaniesUsersApiClient
17. InvitationsApiClient
18. NfeConfigApiClient
19. OperationNatureApiClient
20. PlansApiClient
21. DashboardsApiClient

### ❌ Necessários mas NÃO Disponíveis (9 clients)

Estes clients precisam ser adicionados ao SDK:

1. **MovementsApiClient** - Movimentações financeiras
2. **CostCentersApiClient** - Centros de custo
3. **ChartOfAccountsApiClient** - Plano de contas
4. **PaymentMethodsApiClient** - Formas de pagamento
5. **PointOfSaleApiClient** - PDV (caixas, vendas)
6. **CreditApiClient** - Módulo de crédito
7. **TendersApiClient** - Licitações
8. **ChatApiClient** - Chat/IA
9. **ReportsApiClient** - Relatórios

---

## 📈 Cronograma

| Fase | Duração | Entregas Principais |
|------|---------|---------------------|
| **Fase 1** | 5-7 dias | 5 novos clients no SDK |
| **Fase 2** | 3-4 dias | 5 services migrados |
| **Fase 3** | 7-10 dias | PDV, Stock, Financial pages |
| **Fase 4** | 4-6 dias | Componentes core |
| **Fase 5** | 4-6 dias | Settings pages |
| **Fase 6** | Opcional | Credit, Tenders |
| **Fase 7** | 7 dias | Docs, testes, CI/CD |

**Total (core):** 30-40 dias
**Total (completo):** 40-54 dias

---

## ✅ Critérios de Sucesso Global

- [ ] **95%+** das páginas usando SDK
- [ ] **Zero** fetch direto em componentes críticos
- [ ] **100%** dos services críticos usando SDK
- [ ] **Todos** os testes passando
- [ ] **Documentação** completa
- [ ] **Performance** mantida/melhorada

---

## 🛠️ Quick Commands

```bash
# Ver status atual
grep -r "fetch\(" src/app/(protected) --include="*.tsx" | wc -l

# Listar services
ls -1 src/services/

# Verificar SDK clients disponíveis
cat src/lib/sdk/client-factory.ts | grep "get.*Client()"

# Ver TODOs de migração
grep -r "TODO.*SDK" src/ --include="*.ts"
```

---

## 📞 Contatos

### Dúvidas sobre SDK
- Time Backend (API)
- Documentação: `docs/api/sdk.md`

### Dúvidas sobre Frontend
- Time Frontend
- Padrões: `docs/standards/`

### Questões de Negócio
- Product Owner

---

## 🔗 Links Relacionados

### Documentação Interna
- [API Documentation](../api/)
- [Service Layer Pattern](../standards/service-layer-pattern.md)
- [Module Pattern](../standards/module-pattern.md)
- [SDK Migration Summary](../planning/sdk-migration-summary.md)

### Código
- Services: `src/services/`
- SDK Utils: `src/lib/sdk/`
- Hooks: `src/hooks/`
- Types: `src/types/`

---

## 📝 Convenções

### Nomenclatura

**Services:**
```
<recurso>-service.ts
Exemplo: products-service.ts
```

**Hooks:**
```
use<Recurso>.ts (plural)
Exemplo: useProducts.ts
```

**Client Factory Methods:**
```
get<Recurso>Client()
Exemplo: getProductsClient()
```

### Estrutura de Pastas

```
src/
├── services/           # Business logic
│   ├── products-service.ts
│   └── partners-service.ts
├── hooks/
│   └── queries/        # React Query hooks
│       ├── useProducts.ts
│       └── usePartners.ts
├── lib/
│   └── sdk/           # SDK infrastructure
│       ├── client-factory.ts
│       ├── error-handler.ts
│       └── initialize.ts
└── types/             # TypeScript types
```

---

## 🎓 Recursos de Aprendizado

### Exemplos de Código Migrado

**Services:**
- `src/services/quotes-service.ts` - Exemplo completo
- `src/services/sales-orders-service.ts` - Com tipos SDK
- `src/services/products-service.ts` - Padrão standard

**Hooks:**
- `src/hooks/queries/useQuotes.ts` - React Query
- `src/hooks/queries/useSalesOrders.ts` - Com mutations

**Pages:**
- `src/app/(protected)/quotes/page.tsx` - Migrada
- `src/app/(protected)/sales/page.tsx` - Migrada

### Testes

```typescript
// Exemplo de teste com service mockado
import { listProducts } from '@/services/products-service';

jest.mock('@/services/products-service');

test('should load products', async () => {
  (listProducts as jest.Mock).mockResolvedValue([
    { id: '1', name: 'Product 1' }
  ]);

  // ... seu teste
});
```

---

## 🚨 Avisos Importantes

### ⚠️ NÃO FAZER

1. ❌ **Nunca** use fetch direto em components/pages
2. ❌ **Nunca** acesse token manualmente (`localStorage.getItem('fenix_token')`)
3. ❌ **Nunca** duplique lógica de API em múltiplos lugares
4. ❌ **Nunca** ignore erros do SDK
5. ❌ **Nunca** faça merge sem code review

### ✅ SEMPRE FAZER

1. ✅ Use services para todas as operações de API
2. ✅ Use SDK quando client está disponível
3. ✅ Documente quando SDK não está disponível
4. ✅ Adicione tratamento de erros
5. ✅ Escreva/atualize testes
6. ✅ Verifique types com TypeScript
7. ✅ Rode linter antes de commit

---

## 📊 Tracking Progress

### Métricas Semanais

Acompanhe:
- Páginas migradas / Total
- Services migrados / Total
- Componentes migrados / Total
- Testes passando
- Cobertura de código

### Dashboard Sugerido

```
┌─────────────────────────────────────┐
│  SDK Migration Progress             │
├─────────────────────────────────────┤
│  Week: 1/8                          │
│                                     │
│  Pages:        45/80 (56%) ████░░░  │
│  Services:     28/40 (70%) █████░░  │
│  Components:   80/120(67%) ████░░░  │
│  Hooks:        20/42 (48%) ███░░░░  │
│                                     │
│  Critical:     ████░░ 80%           │
│  Medium:       ███░░░ 60%           │
│  Low:          ██░░░░ 40%           │
│                                     │
│  Status: 🟢 On Track                │
└─────────────────────────────────────┘
```

---

## 🎉 Milestone Celebrations

### Milestones Sugeridos

- [ ] **10%** - Primeiras 5 páginas migradas 🎊
- [ ] **25%** - Primeiro módulo completo (ex: Products) 🎉
- [ ] **50%** - Metade do caminho 🎊
- [ ] **75%** - Três quartos completos 🎉
- [ ] **90%** - Reta final 🎊
- [ ] **100%** - Missão cumprida! 🎉🎉🎉

---

## 📅 Última Atualização

**Data:** 24 de Dezembro de 2025
**Versão:** 1.0
**Autor:** AI Assistant (Fenix Team)
**Revisado por:** Pendente

---

## 🔄 Manutenção deste Documento

Este README deve ser atualizado quando:
- [ ] Novos clients SDK forem adicionados
- [ ] Fases forem completadas
- [ ] Prioridades mudarem
- [ ] Novos padrões forem identificados
- [ ] Métricas mudarem significativamente

---

**Pronto para começar? Vá para [00-quick-start.md](./00-quick-start.md)! 🚀**

