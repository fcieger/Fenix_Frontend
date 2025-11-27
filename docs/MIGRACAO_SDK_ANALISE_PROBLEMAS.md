# Análise de Problemas e Informações Necessárias para Migração SDK

## 📋 Resumo Executivo

Este documento identifica todas as telas que possuem problemas similares ao de produtos (dados não sendo exibidos corretamente) e lista as informações necessárias para adequar completamente o frontend ao novo backend que usa o SDK `@fenix/api-sdk`.

---

## 🔍 Telas com Problemas Identificados

### 1. **Parceiros (Partners)** - `src/app/partners/page.tsx`

**Status**: ⚠️ **PROBLEMA CRÍTICO**

**Problemas encontrados**:

- Usa `any[]` para tipagem de parceiros
- Normalização incorreta: `const data = response.data || response;`
- Campos antigos sendo usados:
  - `cadastro.nomeRazaoSocial` → SDK usa `partner.legalName`
  - `cadastro.nomeFantasia` → SDK usa `partner.tradeName`
  - `cadastro.cpfCnpj` → SDK usa `partner.taxId`
  - `cadastro.email` → SDK usa `partner.email` (mas pode estar em `contacts`)
  - `cadastro.id` → SDK usa `partner.id` (mas pode ser `number` vs `string`)

**Linhas problemáticas**:

- Linha 38: `const [cadastros, setCadastros] = useState<any[]>([]);`
- Linha 86: `const data = response.data || response;`
- Linhas 123-127: Filtros usando campos antigos
- Linhas 483-942: Renderização usando campos antigos

---

### 2. **Orçamentos (Quotes)** - `src/app/quotes/page.tsx`

**Status**: ⚠️ **PROBLEMA CRÍTICO**

**Problemas encontrados**:

- Usa `any[]` para tipagem de orçamentos
- Mapeamento incorreto de campos:
  - `o.cliente?.nomeRazaoSocial` → SDK usa `quote.partnerId` (precisa buscar o Partner)
  - `o.vendedor?.nomeRazaoSocial` → SDK não tem campo `vendedor` direto
  - `o.status === "pendente"` → SDK usa enum `QuoteStatus.OPEN`
  - `o.numero` → SDK usa `quote.number`
  - `o.dataEmissao` → SDK usa `quote.date`
  - `o.totalGeral` → SDK usa `quote.total`
  - `o.itens?.length` → SDK usa `quote.items?.length`

**Linhas problemáticas**:

- Linha 50: `const [orcamentos, setOrcamentos] = useState<any[]>([]);`
- Linhas 82-97: Mapeamento incorreto de campos
- Linhas 679-858: Renderização usando campos antigos

---

### 3. **Pedidos de Venda (Sales Orders)** - `src/app/sales/page.tsx`

**Status**: ⚠️ **PROBLEMA CRÍTICO**

**Problemas encontrados**:

- Usa `any[]` para tipagem
- Normalização incorreta: `const resultArray = Array.isArray(result) ? result : (result?.data || result?.items || []);`
- Mapeamento incorreto:
  - `o.cliente?.nomeRazaoSocial` → SDK usa `salesOrder.partnerId` (precisa buscar Partner)
  - `o.vendedor?.nomeRazaoSocial` → SDK não tem campo direto
  - `o.status` → SDK usa enum `OrderStatus`
  - `o.numero` → SDK usa `salesOrder.number`
  - `o.dataEmissao` → SDK usa `salesOrder.date`
  - `o.totalGeral` → SDK usa `salesOrder.total`

**Linhas problemáticas**:

- Linha 47: `const [pedidoVendas, setPedidoVendas] = useState<any[]>([]);`
- Linhas 83-97: Mapeamento incorreto

---

### 4. **Pedidos de Compra (Purchase Orders)** - `src/app/purchases/page.tsx`

**Status**: ⚠️ **PROBLEMA CRÍTICO**

**Problemas encontrados**:

- Usa `any[]` para tipagem
- Normalização incorreta similar a Sales Orders
- Mapeamento incorreto:
  - `o.fornecedor?.nomeRazaoSocial` → SDK usa `purchaseOrder.partnerId` (precisa buscar Partner)
  - `o.comprador?.nomeRazaoSocial` → SDK não tem campo direto
  - `o.status` → SDK usa enum `OrderStatus`
  - `o.numero` → SDK usa `purchaseOrder.number`
  - `o.dataEmissao` → SDK usa `purchaseOrder.date`
  - `o.totalGeral` → SDK usa `purchaseOrder.total`

**Linhas problemáticas**:

- Linha 43: `const [pedidosCompra, setPedidosCompra] = useState<any[]>([]);`
- Linhas 70-84: Mapeamento incorreto

---

### 5. **NFe - Nova Nota Fiscal** - `src/app/nfe/nova/page.tsx`

**Status**: ⚠️ **PROBLEMA CRÍTICO**

**Problemas encontrados**:

- Faz fetch direto sem usar SDK: `fetch(\`${API_CONFIG.BASE_URL}/api/products\`)`
- Mapeamento incorreto de produtos:
  - `produto.sku` → SDK usa `product.code`
  - `produto.nome` → SDK usa `product.description`
  - `produto.descricao` → SDK usa `product.description`
  - `produto.unidadeMedida` → SDK usa `product.unit`
  - `produto.preco` → SDK usa `product.price`
  - `produto.categoriaProduto` → SDK não tem campo direto
  - `produto.marca` → SDK não tem campo direto

**Linhas problemáticas**:

- Linhas 398-421: Fetch direto e mapeamento incorreto

---

### 6. **Point of Sale (Frente de Caixa)** - `src/app/point-of-sale/page.tsx`

**Status**: ⚠️ **PROBLEMA CRÍTICO**

**Problemas encontrados**:

- Faz fetch direto sem usar SDK: `fetch(\`/api/products?search=...\`)`
- Usa campos antigos:
  - `produto.nome` → SDK usa `product.description`
  - `produto.codigo` → SDK usa `product.code`
  - `produto.codigoBarras` → SDK não tem campo direto (pode estar em extensões)

**Linhas problemáticas**:

- Linhas 492-523: Fetch direto sem SDK
- Linhas 530-577: Uso de campos antigos

---

### 7. **Componente ProdutoSearchDialog** - `src/components/nfe/ProdutoSearchDialog.tsx`

**Status**: ⚠️ **PROBLEMA CRÍTICO**

**Problemas encontrados**:

- Usa campos antigos:
  - `produto.codigo` → SDK usa `product.code`
  - `produto.descricao` → SDK usa `product.description`
  - `produto.ncm` → SDK usa `product.ncm`
  - `produto.unidade` → SDK usa `product.unit`
  - `produto.valorUnitario` → SDK usa `product.price`
  - `produto.estoqueAtual` → SDK não tem campo direto (precisa buscar StockBalance)

**Linhas problemáticas**:

- Linhas 166-217: Renderização usando campos antigos

---

### 8. **Estoque - Saldos** - `src/app/stock/saldos/page.tsx`

**Status**: ⚠️ **PROBLEMA MODERADO**

**Problemas encontrados**:

- Usa `apiService.getProdutos()` que retorna tipos antigos
- Campos antigos:
  - `p.nome` → SDK usa `product.description`
  - `p.sku` → SDK usa `product.code`
  - `p.codigoBarras` → SDK não tem campo direto

**Linhas problemáticas**:

- Linha 96: `const produtos = await apiService.getProdutos();`
- Linhas 100-102: Filtros usando campos antigos

---

## 📊 Mapeamento de Campos: Frontend Antigo vs SDK

### **Produtos (Product)**

| Frontend Antigo                         | SDK Atual             | Observações                                     |
| --------------------------------------- | --------------------- | ----------------------------------------------- |
| `produto.nome`                          | `product.description` | Campo obrigatório no SDK                        |
| `produto.sku` ou `produto.codigo`       | `product.code`        | Campo obrigatório no SDK                        |
| `produto.descricao`                     | `product.description` | Mesmo campo que `nome`                          |
| `produto.unidadeMedida`                 | `product.unit`        | Campo obrigatório no SDK                        |
| `produto.precoVenda` ou `produto.preco` | `product.price`       | Campo obrigatório no SDK (number)               |
| `produto.ncm`                           | `product.ncm`         | Campo obrigatório no SDK                        |
| `produto.cest`                          | `product.cest`        | Opcional no SDK                                 |
| `produto.categoriaProduto`              | ❌ Não existe         | Pode estar em extensões ou precisa ser removido |
| `produto.marca`                         | ❌ Não existe         | Pode estar em extensões ou precisa ser removido |
| `produto.codigoBarras`                  | ❌ Não existe         | Pode estar em extensões ou precisa ser removido |
| `produto.quantidadeEstoque`             | ❌ Não existe         | Precisa buscar `StockBalance` separadamente     |
| `produto.estoqueMinimo`                 | ❌ Não existe         | Precisa buscar `StockBalance` separadamente     |
| `produto.ativo`                         | ❌ Não existe         | SDK não tem campo de ativação                   |

---

### **Parceiros (Partner)**

| Frontend Antigo               | SDK Atual                                     | Observações                                        |
| ----------------------------- | --------------------------------------------- | -------------------------------------------------- |
| `cadastro.nomeRazaoSocial`    | `partner.legalName`                           | Campo obrigatório no SDK                           |
| `cadastro.nomeFantasia`       | `partner.tradeName`                           | Opcional no SDK                                    |
| `cadastro.cpfCnpj`            | `partner.taxId`                               | Campo obrigatório no SDK                           |
| `cadastro.email`              | `partner.email` ou `partner.contacts[].email` | Pode estar em contatos primários                   |
| `cadastro.telefone`           | `partner.phone` ou `partner.contacts[].phone` | Pode estar em contatos primários                   |
| `cadastro.endereco`           | `partner.addresses[]`                         | Array de endereços no SDK                          |
| `cadastro.tipo`               | `partner.type`                                | Enum `RegistrationType` (CUSTOMER, SUPPLIER, BOTH) |
| `cadastro.pessoaFisica`       | `partner.personType`                          | Enum `PersonType` (INDIVIDUAL, LEGAL_ENTITY)       |
| `cadastro.inscricaoEstadual`  | `partner.stateRegistration`                   | Opcional                                           |
| `cadastro.inscricaoMunicipal` | `partner.municipalRegistration`               | Opcional                                           |

---

### **Orçamentos (Quote)**

| Frontend Antigo                     | SDK Atual                           | Observações                                            |
| ----------------------------------- | ----------------------------------- | ------------------------------------------------------ |
| `orcamento.cliente` (objeto)        | `quote.partnerId` (string)          | Precisa buscar Partner separadamente                   |
| `orcamento.cliente.nomeRazaoSocial` | `partner.legalName`                 | Via `partnerId`                                        |
| `orcamento.vendedor`                | ❌ Não existe                       | Pode estar em extensões ou metadata                    |
| `orcamento.numero`                  | `quote.number`                      | Campo obrigatório no SDK                               |
| `orcamento.status`                  | `quote.status`                      | Enum `QuoteStatus` (OPEN, APPROVED, REJECTED, EXPIRED) |
| `orcamento.dataEmissao`             | `quote.date`                        | Campo obrigatório (ISO string)                         |
| `orcamento.dataValidade`            | `quote.validityDate`                | Opcional (ISO string)                                  |
| `orcamento.totalGeral`              | `quote.total`                       | Campo obrigatório (number)                             |
| `orcamento.totalProdutos`           | `quote.totalProducts`               | Campo obrigatório (number)                             |
| `orcamento.totalDescontos`          | `quote.totalDiscounts`              | Campo obrigatório (number)                             |
| `orcamento.totalImpostos`           | `quote.totalTaxes`                  | Campo obrigatório (number)                             |
| `orcamento.frete`                   | `quote.freightValue`                | Opcional (number)                                      |
| `orcamento.despesas`                | `quote.expensesValue`               | Opcional (number)                                      |
| `orcamento.itens[]`                 | `quote.items[]`                     | Array de `QuoteItem`                                   |
| `orcamento.itens[].codigo`          | `quote.items[].product.code`        | Via `productId`                                        |
| `orcamento.itens[].nome`            | `quote.items[].product.description` | Via `productId`                                        |
| `orcamento.itens[].quantidade`      | `quote.items[].quantity`            | Campo obrigatório                                      |
| `orcamento.itens[].valorUnitario`   | `quote.items[].unitValue`           | Campo obrigatório                                      |
| `orcamento.itens[].desconto`        | `quote.items[].discount`            | Opcional                                               |
| `orcamento.itens[].subtotal`        | `quote.items[].subtotal`            | Calculado automaticamente                              |
| `orcamento.itens[].total`           | `quote.items[].total`               | Calculado automaticamente                              |

---

### **Pedidos de Venda (Sales Order)**

| Frontend Antigo              | SDK Atual                         | Observações                          |
| ---------------------------- | --------------------------------- | ------------------------------------ |
| `pedido.cliente` (objeto)    | `salesOrder.partnerId` (string)   | Precisa buscar Partner separadamente |
| `pedido.vendedor`            | ❌ Não existe                     | Pode estar em extensões              |
| `pedido.numero`              | `salesOrder.number`               | Campo obrigatório                    |
| `pedido.status`              | `salesOrder.status`               | Enum `OrderStatus`                   |
| `pedido.dataEmissao`         | `salesOrder.date`                 | Campo obrigatório (ISO string)       |
| `pedido.dataPrevisaoEntrega` | `salesOrder.expectedDeliveryDate` | Opcional (ISO string)                |
| `pedido.dataEntrega`         | `salesOrder.deliveryDate`         | Opcional (ISO string)                |
| `pedido.totalGeral`          | `salesOrder.total`                | Campo obrigatório (number)           |
| `pedido.itens[]`             | `salesOrder.items[]`              | Array de `SalesOrderItem`            |

---

### **Pedidos de Compra (Purchase Order)**

| Frontend Antigo              | SDK Atual                          | Observações                          |
| ---------------------------- | ---------------------------------- | ------------------------------------ |
| `pedido.fornecedor` (objeto) | `purchaseOrder.partnerId` (string) | Precisa buscar Partner separadamente |
| `pedido.comprador`           | ❌ Não existe                      | Pode estar em extensões              |
| `pedido.numero`              | `purchaseOrder.number`             | Campo obrigatório                    |
| `pedido.status`              | `purchaseOrder.status`             | Enum `OrderStatus`                   |
| `pedido.dataEmissao`         | `purchaseOrder.date`               | Campo obrigatório (ISO string)       |
| `pedido.totalGeral`          | `purchaseOrder.total`              | Campo obrigatório (number)           |
| `pedido.itens[]`             | `purchaseOrder.items[]`            | Array de `PurchaseOrderItem`         |

---

## 🔧 Informações Necessárias para Adequar o Frontend

### 1. **Estrutura de Resposta do SDK**

**Pergunta**: Qual é o formato exato de resposta dos métodos `findAll()` do SDK?

**Necessário saber**:

- O SDK sempre retorna `PaginatedResponse<T>` ou pode retornar `{ data: T[] }`?
- Quando retorna paginação, qual é a estrutura de `meta`?
- Exemplo de resposta real do backend para cada endpoint

**Exemplo esperado**:

```typescript
// Formato 1: Paginação
{
  data: Product[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    hasPreviousPage: boolean,
    hasNextPage: boolean
  }
}

// Formato 2: Lista simples
{
  data: Product[]
}

// Formato 3: Array direto?
Product[]
```

---

### 2. **Relacionamentos e População**

**Pergunta**: Como o SDK lida com relacionamentos (ex: `Quote.partnerId` → `Partner`)?

**Necessário saber**:

- Quando um `Quote` é retornado, o campo `partner` vem populado ou apenas `partnerId`?
- Se não vem populado, existe um método para buscar relacionamentos?
- Exemplo: `quote.partner` vs `quote.partnerId` - qual existe na resposta real?

**Exemplo esperado**:

```typescript
// Opção 1: Vem populado
{
  id: "123",
  partnerId: "456",
  partner: {
    id: "456",
    legalName: "Empresa XYZ"
  }
}

// Opção 2: Apenas ID
{
  id: "123",
  partnerId: "456"
}
```

---

### 3. **Campos Extras e Extensões**

**Pergunta**: O SDK suporta campos extras ou extensões?

**Necessário saber**:

- Campos como `produto.categoriaProduto`, `produto.marca`, `produto.codigoBarras` existem em algum lugar?
- Existe um sistema de extensões/metadata no SDK?
- Ou esses campos precisam ser removidos do frontend?

**Campos em questão**:

- `Product`: `categoriaProduto`, `marca`, `codigoBarras`, `ativo`
- `Quote/SalesOrder`: `vendedor`, `comprador`
- `Partner`: campos adicionais de contato/endereço

---

### 4. **Estoque e Produtos**

**Pergunta**: Como buscar informações de estoque de um produto?

**Necessário saber**:

- Existe um endpoint específico para buscar `StockBalance` por produto?
- O `Product` retorna informações de estoque ou precisa buscar separadamente?
- Como funciona a busca de saldo de estoque?

**Exemplo esperado**:

```typescript
// Opção 1: Vem no Product
Product {
  id: "123",
  description: "Produto",
  stockBalance: 100
}

// Opção 2: Busca separada
const balance = await stockClient.getBalance(productId, locationId);
```

---

### 5. **Enums e Valores**

**Pergunta**: Quais são os valores exatos dos enums?

**Necessário saber**:

- `QuoteStatus`: Valores são `"OPEN"`, `"APPROVED"`, `"REJECTED"`, `"EXPIRED"`?
- `OrderStatus`: Quais são todos os valores possíveis?
- `RegistrationType`: Valores são `"CUSTOMER"`, `"SUPPLIER"`, `"BOTH"`?
- Como traduzir esses valores para português na UI?

**Exemplo esperado**:

```typescript
// QuoteStatus
"OPEN" → "Aberto" / "Pendente"
"APPROVED" → "Aprovado"
"REJECTED" → "Rejeitado"
"EXPIRED" → "Expirado"

// OrderStatus
"PENDING" → "Pendente"
"CONFIRMED" → "Confirmado"
"DELIVERED" → "Entregue"
"CANCELLED" → "Cancelado"
```

---

### 6. **Busca e Filtros**

**Pergunta**: Como funciona a busca e filtros no SDK?

**Necessário saber**:

- O parâmetro `search` funciona em todos os endpoints?
- Quais filtros são suportados em cada endpoint?
- Exemplo: `listProducts({ search: "termo" })` funciona?

**Exemplo esperado**:

```typescript
// Busca de produtos
listProducts({ search: "notebook" });

// Filtros de parceiros
listPartners({ type: RegistrationType.CUSTOMER, search: "empresa" });

// Filtros de orçamentos
listQuotes({ status: QuoteStatus.OPEN });
```

---

### 7. **Autenticação e Company ID**

**Pergunta**: Como o SDK lida com `companyId`?

**Necessário saber**:

- O `companyId` vem automaticamente do JWT token?
- Preciso passar `companyId` explicitamente em algum caso?
- Como funciona a autenticação no SDK?

**Exemplo esperado**:

```typescript
// Opção 1: Automático via JWT
const products = await productsClient.findAll(); // companyId vem do token

// Opção 2: Precisa passar explicitamente
const products = await productsClient.findAll({ companyId: "123" });
```

---

### 8. **Erros e Tratamento**

**Pergunta**: Como o SDK trata erros?

**Necessário saber**:

- Quais tipos de erro o SDK pode lançar?
- Como identificar erros de validação vs erros de API?
- Exemplo de estrutura de erro retornada

**Exemplo esperado**:

```typescript
try {
  await productsClient.create(data);
} catch (error) {
  if (error instanceof ApiError) {
    // Erro da API
  } else if (error instanceof ZodError) {
    // Erro de validação
  }
}
```

---

## 📝 Checklist de Ações Necessárias

### Fase 1: Correção de Tipagem

- [ ] Atualizar `src/app/partners/page.tsx` para usar `Partner` do SDK
- [ ] Atualizar `src/app/quotes/page.tsx` para usar `Quote` do SDK
- [ ] Atualizar `src/app/sales/page.tsx` para usar `SalesOrder` do SDK
- [ ] Atualizar `src/app/purchases/page.tsx` para usar `PurchaseOrder` do SDK
- [ ] Atualizar `src/app/nfe/nova/page.tsx` para usar SDK em vez de fetch direto
- [ ] Atualizar `src/app/point-of-sale/page.tsx` para usar SDK em vez de fetch direto
- [ ] Atualizar `src/components/nfe/ProdutoSearchDialog.tsx` para usar `Product` do SDK
- [ ] Atualizar `src/app/stock/saldos/page.tsx` para usar SDK

### Fase 2: Mapeamento de Campos

- [ ] Criar funções helper para mapear campos antigos → SDK
- [ ] Atualizar todos os filtros para usar campos do SDK
- [ ] Atualizar todas as renderizações para usar campos do SDK
- [ ] Criar funções de tradução para enums (ex: `QuoteStatus.OPEN` → "Aberto")

### Fase 3: Relacionamentos

- [ ] Implementar busca de `Partner` quando necessário (ex: em Quotes)
- [ ] Implementar busca de `Product` quando necessário (ex: em QuoteItems)
- [ ] Implementar busca de `StockBalance` quando necessário

### Fase 4: Normalização de Respostas

- [ ] Remover normalizações desnecessárias
- [ ] Usar formato padrão do SDK (`PaginatedResponse<T>` ou `{ data: T[] }`)
- [ ] Atualizar todos os serviços para retornar tipos corretos

### Fase 5: Testes

- [ ] Testar listagem de produtos
- [ ] Testar listagem de parceiros
- [ ] Testar listagem de orçamentos
- [ ] Testar listagem de pedidos de venda
- [ ] Testar listagem de pedidos de compra
- [ ] Testar criação/edição de cada entidade
- [ ] Testar busca e filtros

---

## 🎯 Próximos Passos Recomendados

1. **Obter respostas para as perguntas acima** do time de backend/SDK
2. **Criar funções helper** para mapeamento de campos
3. **Atualizar uma tela por vez** começando pelas mais críticas
4. **Testar cada migração** antes de prosseguir
5. **Documentar padrões** encontrados durante a migração

---

## 📚 Referências

- SDK Types: `node_modules/@fenix/api-sdk/dist/clients/*/types.d.ts`
- SDK Re-exports: `src/types/sdk.ts`
- Serviços Migrados: `src/services/*-service.ts`
- Plan de Migração: `cursor-plan://3d0707df-294a-45fb-bf60-b0111778f89c/Migração de Tipagem para SDK.plan.md`
