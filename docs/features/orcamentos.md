# 📊 Orçamentos - FENIX ERP

## 📋 Visão Geral

A estrutura de orçamentos é composta por **duas tabelas principais**:

- `orcamentos` (cabeçalho)
- `orcamento_itens` (itens do orçamento)

Relacionamento: **1:N** (Um orçamento pode ter múltiplos itens)

---

## 🏗️ Estrutura do Cabeçalho (`orcamentos`)

### 🔑 Identificação

- `id` - UUID PRIMARY KEY
- `numero` - VARCHAR (sequencial por empresa/série)
- `serie` - VARCHAR (opcional)
- `numeroOrdemCompra` - VARCHAR (opcional)

### 📅 Datas

- `dataEmissao` - DATE NOT NULL
- `dataPrevisaoEntrega` - DATE (nullable)
- `dataEntrega` - DATE (nullable)

### 👥 Relacionamentos (Foreign Keys)

#### Obrigatórios:

- `clienteId` → `cadastros.id` (FK) - **OBRIGATÓRIO**
- `companyId` → `companies.id` (FK) - **OBRIGATÓRIO**

#### Opcionais:

- `vendedorId` → `cadastros.id` (FK, nullable)
- `transportadoraId` → `cadastros.id` (FK, nullable)
- `prazoPagamentoId` → `prazos_pagamento.id` (FK, nullable)
- `naturezaOperacaoPadraoId` → `natureza_operacao.id` (FK, nullable)
- `formaPagamentoId` → `formas_pagamento.id` (FK, nullable)
- `localEstoqueId` → `locais_estoque.id` (FK, nullable)

### 💰 Totais

- `totalProdutos` - NUMERIC(14,2) NOT NULL DEFAULT 0
- `totalDescontos` - NUMERIC(14,2) NOT NULL DEFAULT 0
- `totalImpostos` - NUMERIC(14,2) NOT NULL DEFAULT 0
- `totalGeral` - NUMERIC(14,2) NOT NULL DEFAULT 0

### 📝 Status

- `status` - ENUM('pendente', 'concluido') NOT NULL DEFAULT 'pendente'
- `observacoes` - TEXT (nullable)

---

## 🛒 Estrutura dos Itens (`orcamento_itens`)

### 🔑 Identificação

- `id` - UUID PRIMARY KEY
- `orcamentoId` - UUID NOT NULL → orcamentos.id (ON DELETE CASCADE)
- `companyId` - UUID NOT NULL → companies.id (FK)

### 📦 Produto (Opcional - permite item livre)

- `produtoId` - UUID (nullable) → produtos.id (FK)

### 🏷️ Identificação e Descrição do Item

- `codigo` - VARCHAR NOT NULL
- `nome` - VARCHAR NOT NULL
- `unidade` - VARCHAR NOT NULL

### 📋 Fiscais do Item

- `ncm` - VARCHAR (nullable)
- `cest` - VARCHAR (nullable)
- `naturezaOperacaoId` - UUID NOT NULL → natureza_operacao.id (FK)

### 🔢 Quantidades e Valores

- `quantidade` - NUMERIC(14,6) NOT NULL
- `precoUnitario` - NUMERIC(14,6) NOT NULL
- `descontoValor` - NUMERIC(14,2) DEFAULT 0
- `descontoPercentual` - NUMERIC(5,2) DEFAULT 0

### 💸 Rateios (Frete/Seguro/Outras)

- `freteRateado` - NUMERIC(14,2) DEFAULT 0
- `seguroRateado` - NUMERIC(14,2) DEFAULT 0
- `outrasDespesasRateado` - NUMERIC(14,2) DEFAULT 0

### 💰 Impostos Calculados por Item

- ICMS: `icmsBase`, `icmsAliquota`, `icmsValor`
- ICMS-ST: `icmsStBase`, `icmsStAliquota`, `icmsStValor`
- IPI: `ipiAliquota`, `ipiValor`
- PIS: `pisAliquota`, `pisValor`
- COFINS: `cofinsAliquota`, `cofinsValor`

### 💵 Total do Item

- `totalItem` - NUMERIC(14,2) NOT NULL

---

## 📋 Endpoints da API

### Orçamentos

- POST `/api/orcamentos` — criar orçamento (status pendente)
- GET `/api/orcamentos` — listar (filtros: status, clienteId, companyId, período)
- GET `/api/orcamentos/:id` — detalhes
- PUT `/api/orcamentos/:id` — editar (se pendente)
- PATCH `/api/orcamentos/:id/status` — pendente/concluido
- POST `/api/orcamentos/:id/recalcular-impostos` — recalcular (stub fiscal)
- DELETE `/api/orcamentos/:id` — excluir

---

## 🎯 Funcionalidades

### Criação de Orçamento

1. Selecionar cliente (obrigatório)
2. Adicionar itens (produtos ou itens livres)
3. Configurar impostos e descontos
4. Calcular totais automaticamente
5. Salvar como pendente ou concluído

### Conversão para Pedido de Venda

- Orçamento pode ser convertido em Pedido de Venda
- Mantém todos os dados e itens
- Status do orçamento atualizado

### Cálculo de Impostos

- Cálculo automático de ICMS, IPI, PIS, COFINS
- Baseado na natureza de operação
- Configuração por estado

---

**Última atualização**: 2024-12-24




