# 📊 Análise da Estrutura de Orçamentos - FENIX ERP

## 📋 Visão Geral

A estrutura de orçamentos é composta por **duas tabelas principais**:
- `orcamentos` (cabeçalho)
- `orcamento_itens` (itens do orçamento)

Relacionamento: **1:N** (Um orçamento pode ter múltiplos itens)

---

## 🏗️ Estrutura do Cabeçalho (`orcamentos`)

### 🔑 Identificação
```sql
id                  UUID PRIMARY KEY (gen_random_uuid)
numero              VARCHAR (sequencial por empresa/série)
serie               VARCHAR (opcional)
numeroOrdemCompra   VARCHAR (opcional)
```

### 📅 Datas
```sql
dataEmissao              DATE NOT NULL
dataPrevisaoEntrega      DATE (nullable)
dataEntrega              DATE (nullable)
```

### 👥 Relacionamentos (Foreign Keys)

#### Obrigatórios:
- `clienteId` → `cadastros.id` (FK) - **OBRIGATÓRIO**
- `companyId` → `companies.id` (FK) - **OBRIGATÓRIO**

#### Opcionais:
- `vendedorId` → `cadastros.id` (FK, nullable)
- `transportadoraId` → `cadastros.id` (FK, nullable)
- `prazoPagamentoId` → `prazos_pagamento.id` (FK, nullable)
- `naturezaOperacaoPadraoId` → `natureza_operacao.id` (FK, nullable)
- `formaPagamentoId` → `formas_pagamento.id` (FK, nullable, ON DELETE SET NULL)
- `localEstoqueId` → `locais_estoque.id` (FK, nullable, ON DELETE SET NULL)

### 💰 Pagamento e Configurações
```sql
parcelamento        VARCHAR
consumidorFinal     BOOLEAN
indicadorPresenca   VARCHAR
listaPreco          VARCHAR
```

### 🚚 Frete e Transporte
```sql
frete               VARCHAR
valorFrete          NUMERIC(14,2) DEFAULT 0
despesas            NUMERIC(14,2) DEFAULT 0
incluirFreteTotal   BOOLEAN
```

### 🚛 Dados do Veículo
```sql
placaVeiculo        VARCHAR
ufPlaca             VARCHAR
rntc                VARCHAR
```

### 📦 Dados de Volume e Peso
```sql
pesoLiquido         NUMERIC(14,3) DEFAULT 0
pesoBruto           NUMERIC(14,3) DEFAULT 0
volume              NUMERIC(14,3) DEFAULT 0
especie             VARCHAR
marca               VARCHAR
numeracao           VARCHAR
quantidadeVolumes   INTEGER
```

### 💵 Totais
```sql
totalProdutos       NUMERIC(14,2) NOT NULL DEFAULT 0
totalDescontos      NUMERIC(14,2) NOT NULL DEFAULT 0
totalImpostos       NUMERIC(14,2) NOT NULL DEFAULT 0
totalGeral          NUMERIC(14,2) NOT NULL DEFAULT 0
```

### 📝 Observações e Status
```sql
observacoes         TEXT (nullable)
status              ENUM('pendente', 'concluido') NOT NULL DEFAULT 'pendente'
```

### 🔍 Auditoria
```sql
createdAt           TIMESTAMP NOT NULL DEFAULT now()
updatedAt           TIMESTAMP NOT NULL DEFAULT now()
```

### 📊 Índices
- `IDX_orcamentos_forma_pagamento` (formaPagamentoId)
- `IDX_orcamentos_local_estoque` (localEstoqueId)

---

## 🛒 Estrutura dos Itens (`orcamento_itens`)

### 🔑 Identificação
```sql
id                  UUID PRIMARY KEY (gen_random_uuid)
orcamentoId         UUID NOT NULL → orcamentos.id (ON DELETE CASCADE)
companyId           UUID NOT NULL → companies.id (FK)
```

### 📦 Produto (Opcional - permite item livre)
```sql
produtoId           UUID (nullable) → produtos.id (FK)
```

### 🏷️ Identificação e Descrição do Item
```sql
codigo              VARCHAR NOT NULL
nome                VARCHAR NOT NULL
unidade             VARCHAR NOT NULL
```

### 📋 Fiscais do Item
```sql
ncm                 VARCHAR (nullable)
cest                VARCHAR (nullable)
naturezaOperacaoId  UUID NOT NULL → natureza_operacao.id (FK)
```

### 🔢 Quantidades e Valores
```sql
quantidade          NUMERIC(14,6) NOT NULL
precoUnitario       NUMERIC(14,6) NOT NULL
descontoValor       NUMERIC(14,2) DEFAULT 0
descontoPercentual  NUMERIC(5,2) DEFAULT 0
```

### 💸 Rateios (Frete/Seguro/Outras)
```sql
freteRateado        NUMERIC(14,2) DEFAULT 0
seguroRateado       NUMERIC(14,2) DEFAULT 0
outrasDespesasRateado NUMERIC(14,2) DEFAULT 0
```

### 💰 Impostos Calculados por Item

#### ICMS
```sql
icmsBase            NUMERIC(14,4) (nullable)
icmsAliquota        NUMERIC(7,4) (nullable)
icmsValor           NUMERIC(14,2) (nullable)
```

#### ICMS-ST (Substituição Tributária)
```sql
icmsStBase          NUMERIC(14,4) (nullable)
icmsStAliquota       NUMERIC(7,4) (nullable)
icmsStValor         NUMERIC(14,2) (nullable)
```

#### IPI
```sql
ipiAliquota         NUMERIC(7,4) (nullable)
ipiValor            NUMERIC(14,2) (nullable)
```

#### PIS
```sql
pisAliquota         NUMERIC(7,4) (nullable)
pisValor            NUMERIC(14,2) (nullable)
```

#### COFINS
```sql
cofinsAliquota      NUMERIC(7,4) (nullable)
cofinsValor         NUMERIC(14,2) (nullable)
```

### 💵 Total do Item
```sql
totalItem           NUMERIC(14,2) NOT NULL
```

### 📝 Observações
```sql
observacoes         TEXT (nullable)
```

### 🔍 Auditoria
```sql
createdAt           TIMESTAMP NOT NULL DEFAULT now()
updatedAt           TIMESTAMP NOT NULL DEFAULT now()
```

---

## 🔗 Relacionamentos Detalhados

### Tabela `orcamentos`

| Campo | Tipo | Relacionamento | Tabela | Obrigatório |
|-------|------|----------------|--------|-------------|
| `clienteId` | UUID | FK | `cadastros` | ✅ Sim |
| `vendedorId` | UUID | FK | `cadastros` | ❌ Não |
| `transportadoraId` | UUID | FK | `cadastros` | ❌ Não |
| `prazoPagamentoId` | UUID | FK | `prazos_pagamento` | ❌ Não |
| `naturezaOperacaoPadraoId` | UUID | FK | `natureza_operacao` | ❌ Não |
| `formaPagamentoId` | UUID | FK | `formas_pagamento` | ❌ Não (ON DELETE SET NULL) |
| `localEstoqueId` | UUID | FK | `locais_estoque` | ❌ Não (ON DELETE SET NULL) |
| `companyId` | UUID | FK | `companies` | ✅ Sim |

### Tabela `orcamento_itens`

| Campo | Tipo | Relacionamento | Tabela | Obrigatório |
|-------|------|----------------|--------|-------------|
| `orcamentoId` | UUID | FK | `orcamentos` | ✅ Sim (ON DELETE CASCADE) |
| `companyId` | UUID | FK | `companies` | ✅ Sim |
| `produtoId` | UUID | FK | `produtos` | ❌ Não (permite item livre) |
| `naturezaOperacaoId` | UUID | FK | `natureza_operacao` | ✅ Sim |

---

## 📊 Status do Orçamento

### Enum: `orcamentos_status_enum`
- `pendente` - Padrão inicial
- `concluido` - Orçamento finalizado

### Regras de Negócio:
- **Status `pendente`**: Permite edição total do cabeçalho e itens
- **Status `concluido`**: Bloqueia edição do cabeçalho e itens, permitindo apenas observações
- **Transições permitidas**:
  - `pendente` → `concluido`
  - `concluido` → `pendente` (reabertura)

---

## 💼 Campos Multi-Empresa

Ambas as tabelas possuem `companyId` para suportar o sistema multi-empresa:
- Isolamento de dados por empresa
- Consultas sempre filtradas por `companyId`
- Todas as operações devem incluir `companyId`

---

## 🧮 Cálculos e Totais

### Por Item:
```
Total Bruto = quantidade × precoUnitario
Subtotal = Total Bruto - descontoValor - (Total Bruto × descontoPercentual / 100)
Rateios = freteRateado + seguroRateado + outrasDespesasRateado
Impostos = icmsValor + icmsStValor + ipiValor + pisValor + cofinsValor
totalItem = Subtotal + Rateios + Impostos
```

### Totais do Orçamento:
```
totalProdutos = SUM(itens.totalBruto)
totalDescontos = SUM(itens.descontoValor + descontoPercentual aplicado)
totalImpostos = SUM(itens.todos os impostos)
totalGeral = totalProdutos - totalDescontos + totalImpostos + valorFrete + despesas
```

---

## 🎯 Características Especiais

### ✅ Item Livre
- Campo `produtoId` é **nullable** na tabela `orcamento_itens`
- Permite criar itens sem vinculação a produto cadastrado
- Campos `codigo`, `nome`, `unidade` são obrigatórios mesmo para itens livres

### ✅ Natureza de Operação
- **Cabeçalho**: `naturezaOperacaoPadraoId` (opcional) - serve como padrão para novos itens
- **Item**: `naturezaOperacaoId` (obrigatório) - pode ser diferente do padrão do cabeçalho

### ✅ Impostos por Item
- Cada item calcula seus próprios impostos (ICMS, ICMS-ST, IPI, PIS, COFINS)
- Campos nullable permitem que itens sem impostos não precisem preencher valores
- Cálculos podem ser derivados da natureza de operação + UF do cliente + dados do produto

### ✅ Estoque
- **Não baixa estoque** ao criar/concluir orçamento
- Campo `localEstoqueId` apenas para referência
- Reserva de estoque pode ser implementada futuramente

---

## 🔒 Constraints e Regras

### Constraints de Banco:
- `orcamentos.id` → PRIMARY KEY
- `orcamento_itens.id` → PRIMARY KEY
- `orcamento_itens.orcamentoId` → FK com `ON DELETE CASCADE`
- `orcamentos.formaPagamentoId` → FK com `ON DELETE SET NULL`
- `orcamentos.localEstoqueId` → FK com `ON DELETE SET NULL`

### Validações de Negócio:
- `dataEmissao` é obrigatória
- `clienteId` é obrigatório
- `companyId` é obrigatório em ambas as tabelas
- Pelo menos um item é necessário para criar orçamento
- `naturezaOperacaoId` é obrigatório nos itens
- `status` deve ser `pendente` ou `concluido`

---

## 📝 Observações Importantes

1. **Cascade Delete**: Quando um orçamento é excluído, todos os itens são automaticamente excluídos (`ON DELETE CASCADE`)

2. **Soft Delete**: Não há campo `deletedAt` - exclusão é física no banco

3. **NFe-Ready**: A estrutura coleta todos os campos necessários para futura conversão em NFe:
   - Destinatário (cliente)
   - Natureza de operação
   - CFOP/CST/NCM por item
   - Quantidades e valores
   - Modalidade de frete
   - Transportadora
   - Datas

4. **Precisão Numérica**:
   - Quantidades: `NUMERIC(14,6)` - permite até 6 casas decimais
   - Valores monetários: `NUMERIC(14,2)` - 2 casas decimais
   - Aliquotas: `NUMERIC(7,4)` ou `NUMERIC(5,2)` - 2 a 4 casas decimais

5. **Índices**: Apenas índices básicos foram criados. Podem ser adicionados índices adicionais para otimização:
   - `orcamentos(status)`
   - `orcamentos(dataEmissao)`
   - `orcamentos(clienteId)`
   - `orcamento_itens(orcamentoId)` (já existe implicitamente via FK)

---

## 🔄 Fluxo de Dados

### Criação de Orçamento:
1. Criar registro em `orcamentos` com status `pendente`
2. Criar registros em `orcamento_itens` vinculados ao orçamento
3. Calcular totais e atualizar `orcamentos`

### Atualização de Orçamento:
1. Validar se status permite edição (`pendente`)
2. Atualizar campos do cabeçalho se necessário
3. Atualizar/criar/excluir itens
4. Recalcular totais

### Conclusão de Orçamento:
1. Validar campos obrigatórios e itens
2. Atualizar status para `concluido`
3. Bloquear edições futuras (exceto observações)

### Reabertura de Orçamento:
1. Validar permissões
2. Atualizar status para `pendente`
3. Permitir edições novamente

---

## 📚 Referências

- **Entidade Backend**: `/home/fabio/projetos/fenix-backend/src/orcamentos/entities/orcamento.entity.ts`
- **Entidade Item**: `/home/fabio/projetos/fenix-backend/src/orcamentos/entities/orcamento-item.entity.ts`
- **Type Frontend**: `/home/fabio/projetos/fenix/src/types/orcamento.ts`
- **Service Frontend**: `/home/fabio/projetos/fenix/src/services/orcamentos.ts`
- **Documentação Tarefas**: `/home/fabio/projetos/fenix/docs/TAREFASORCAMENTO.md`

---

**Última atualização**: 2024-10-31  
**Versão da Análise**: 1.0.0









