# 📊 FASE 1 - ANÁLISE E PREPARAÇÃO - RELATÓRIO DE INVESTIGAÇÃO

**Data:** 31/01/2025  
**Status:** ✅ Concluída

---

## 1.1 INVESTIGAÇÃO DA ESTRUTURA ATUAL

### ✅ Backend - Verificações Realizadas

#### Estrutura de Entidades
- [x] **PedidoVenda existe** em `/src/pedidos-venda/entities/pedido-venda.entity.ts`
- [x] **PedidoVendaItem existe** em `/src/pedidos-venda/entities/pedido-venda-item.entity.ts`
- [x] **Service existe** em `/src/pedidos-venda/pedidos-venda.service.ts`
- [x] **Controller existe** em `/src/pedidos-venda/pedidos-venda.controller.ts`
- [x] **Module existe** em `/src/pedidos-venda/pedidos-venda.module.ts`
- [x] **DTOs existem**:
  - `create-pedido-venda.dto.ts`
  - `update-pedido-venda.dto.ts`
  - `create-pedido-venda-item.dto.ts`
  - `update-status-pedido.dto.ts`

#### Análise da Entidade PedidoVenda

**Campos Existentes:**
- ✅ `numeroPedido: string` (equivalente a `numero` do Orcamento)
- ✅ `numeroNFe: string` (equivalente a `serie` do Orcamento)
- ✅ `numeroOrdemCompra: string` (equivalente a `numeroPedidoCotacao` do Orcamento)
- ✅ `dataEmissao: Date`
- ✅ `dataPrevisao: Date` (equivalente a `dataPrevisaoEntrega`)
- ✅ `dataEntrega: Date`
- ✅ Relacionamentos: `cliente`, `vendedor`, `transportadora`, `naturezaOperacao`, `prazoPagamento`
- ✅ Campos de configuração: `consumidorFinal`, `indicadorPresenca`, `formaPagamento`, `parcelamento`, `estoque`, `listaPreco`
- ✅ Campos de frete: `frete`, `valorFrete`, `despesas`, `incluirFreteTotal`
- ✅ Dados do veículo: `placaVeiculo`, `ufPlaca`, `rntc`
- ✅ Dados de volume/peso: `pesoLiquido`, `pesoBruto`, `volume`, `quantidadeVolumes`, `especie`, `marca`, `numeracao`
- ✅ Totais: `totalDescontos`, `totalImpostos`, `totalProdutos`, `totalPedido`
- ✅ Status: `status: StatusPedido` (enum diferente do Orcamento)
- ✅ `companyId: UUID`

**Campos FALTANTES para integração com Orçamento:**
- ❌ `orcamentoId: UUID` - **NÃO EXISTE** (precisa ser adicionado)
- ❌ Relacionamento `@ManyToOne(() => Orcamento)` - **NÃO EXISTE** (precisa ser adicionado)
- ❌ Campo `observacoes?: string` - **NÃO EXISTE** (precisa ser adicionado)

**Diferenças Importantes:**
1. **Status**: PedidoVenda usa enum `StatusPedido` (PENDENTE, APROVADO, etc.) enquanto Orcamento usa `StatusOrcamento` (RASCUNHO, ENVIADO, PERDIDO, GANHO)
2. **Forma de Pagamento**: PedidoVenda usa enum `FormaPagamento` (numérico), Orcamento usa relacionamento `formaPagamentoId` (UUID)
3. **Estoque**: PedidoVenda usa enum `TipoEstoque` (numérico), Orcamento usa relacionamento `localEstoqueId` (UUID)
4. **Natureza Operação**: PedidoVenda tem `naturezaOperacaoId` obrigatório, Orcamento tem `naturezaOperacaoPadraoId` opcional
5. **Totais**: PedidoVenda usa `totalPedido`, Orcamento usa `totalGeral`
6. **Serie**: PedidoVenda usa `numeroNFe`, Orcamento usa `serie`

#### Análise da Entidade PedidoVendaItem

**Campos Existentes:**
- ✅ `pedidoVendaId: UUID`
- ✅ `produtoId?: UUID` (opcional)
- ✅ `naturezaOperacaoId: UUID` (obrigatório)
- ✅ `codigo: string`
- ✅ `nome: string`
- ✅ `unidadeMedida: string` (Orcamento usa `unidade`)
- ✅ `quantidade: number`
- ✅ `valorUnitario: number` (Orcamento usa `precoUnitario`)
- ✅ `valorDesconto: number` (Orcamento usa `descontoValor`)
- ✅ `percentualDesconto: number` (Orcamento usa `descontoPercentual`)
- ✅ `valorTotal: number` (Orcamento usa `totalItem`)
- ✅ `ncm?: string`
- ✅ `cest?: string`
- ✅ `observacoes?: string`
- ✅ `numeroItem?: string` (Orcamento usa `numeroItem?: number`)

**Campos FALTANTES para compatibilidade com OrcamentoItem:**
- ❌ Campos de rateio: `freteRateado`, `seguroRateado`, `outrasDespesasRateado` - **NÃO EXISTEM**
- ❌ Campos fiscais detalhados:
  - ❌ `icmsBase`, `icmsAliquota`, `icmsValor`
  - ❌ `icmsStBase`, `icmsStAliquota`, `icmsStValor`
  - ❌ `ipiAliquota`, `ipiValor`
  - ❌ `pisAliquota`, `pisValor`
  - ❌ `cofinsAliquota`, `cofinsValor`
- ❌ Campo `numeroItem?: number` (existe como string, precisa ser number)

#### Análise do Service

**Métodos Existentes:**
- ✅ `create(dto, companyId)` - Criar pedido
- ✅ `findAll(companyId, page, limit)` - Listar pedidos
- ✅ `findOne(id, companyId?)` - Buscar pedido
- ✅ `update(id, dto, companyId)` - Atualizar pedido
- ✅ `updateStatus(id, dto, companyId)` - Atualizar status
- ✅ `clonar(id, companyId)` - Clonar pedido
- ✅ `cancelar(id, companyId)` - Cancelar pedido
- ✅ `remove(id, companyId)` - Excluir pedido

**Métodos FALTANTES:**
- ❌ `createFromOrcamento(dto, companyId)` - **NÃO EXISTE** (precisa ser criado)

#### Análise do Controller

**Endpoints Existentes:**
- ✅ `POST /pedidos-venda` - Criar pedido
- ✅ `GET /pedidos-venda` - Listar pedidos
- ✅ `GET /pedidos-venda/:id` - Buscar pedido
- ✅ `PATCH /pedidos-venda/:id` - Atualizar pedido
- ✅ `PATCH /pedidos-venda/:id/status` - Atualizar status
- ✅ `POST /pedidos-venda/:id/clonar` - Clonar pedido
- ✅ `PATCH /pedidos-venda/:id/cancelar` - Cancelar pedido
- ✅ `DELETE /pedidos-venda/:id` - Excluir pedido

**Endpoints FALTANTES:**
- ❌ `POST /pedidos-venda/from-orcamento/:orcamentoId` - **NÃO EXISTE** (precisa ser criado)

#### Verificação de Migrations
- ⚠️ **NÃO VERIFICADO** - Necessário verificar se existe migration para tabelas `pedidos_venda` e `pedidos_venda_itens`
- ⚠️ **NECESSÁRIO**: Criar migration para adicionar campo `orcamentoId` na tabela `pedidos_venda`

### ⚠️ Frontend - Verificações Parciais (Timeout)

**Estrutura Identificada:**
- ✅ Diretório `/src/app/vendas` existe
- ✅ Arquivo `/src/app/vendas/page.tsx` existe
- ✅ Diretório `/src/app/vendas/novo` existe

**Verificações Pendentes:**
- ⚠️ Conteúdo de `/src/app/vendas/page.tsx` não foi lido (timeout)
- ⚠️ Verificar se existe `/src/services/pedidos-venda.ts` ou `/src/services/vendas.ts`
- ⚠️ Verificar se existe `/src/types/pedido-venda.ts` ou `/src/types/venda.ts`
- ⚠️ Verificar estrutura de `/src/app/vendas/novo/page.tsx`

---

## 1.2 COMPARAÇÃO DE CAMPOS - Orçamento vs Pedido de Venda

### Campos Equivalentes (já mapeados)

| Campo Orcamento | Campo PedidoVenda | Observação |
|----------------|-------------------|------------|
| `numero` | `numeroPedido` | ✅ Equivalente |
| `serie` | `numeroNFe` | ✅ Equivalente |
| `numeroPedidoCotacao` | `numeroOrdemCompra` | ✅ Equivalente |
| `dataEmissao` | `dataEmissao` | ✅ Equivalente |
| `dataPrevisaoEntrega` | `dataPrevisao` | ✅ Equivalente |
| `dataValidade` | - | ❌ Não existe em PedidoVenda |
| `clienteId` | `clienteId` | ✅ Equivalente |
| `vendedorId` | `vendedorId` | ✅ Equivalente |
| `transportadoraId` | `transportadoraId` | ✅ Equivalente |
| `prazoPagamentoId` | `prazoPagamentoId` | ✅ Equivalente |
| `naturezaOperacaoPadraoId` | `naturezaOperacaoId` | ⚠️ Nome diferente, obrigatório em PedidoVenda |
| `formaPagamentoId` | `formaPagamento` | ⚠️ Em PedidoVenda é enum numérico |
| `parcelamento` | `parcelamento` | ✅ Equivalente |
| `consumidorFinal` | `consumidorFinal` | ✅ Equivalente |
| `indicadorPresenca` | `indicadorPresenca` | ⚠️ Tipo diferente (string vs enum) |
| `localEstoqueId` | `estoque` | ⚠️ Em PedidoVenda é enum numérico |
| `listaPreco` | `listaPreco` | ✅ Equivalente |
| `frete` | `frete` | ⚠️ Tipo diferente (string vs enum) |
| `valorFrete` | `valorFrete` | ✅ Equivalente |
| `despesas` | `despesas` | ✅ Equivalente |
| `incluirFreteTotal` | `incluirFreteTotal` | ✅ Equivalente |
| `placaVeiculo` | `placaVeiculo` | ✅ Equivalente |
| `ufPlaca` | `ufPlaca` | ✅ Equivalente |
| `rntc` | `rntc` | ✅ Equivalente |
| `pesoLiquido` | `pesoLiquido` | ✅ Equivalente |
| `pesoBruto` | `pesoBruto` | ✅ Equivalente |
| `volume` | `volume` | ✅ Equivalente |
| `especie` | `especie` | ✅ Equivalente |
| `marca` | `marca` | ✅ Equivalente |
| `numeracao` | `numeracao` | ✅ Equivalente |
| `quantidadeVolumes` | `quantidadeVolumes` | ✅ Equivalente |
| `totalProdutos` | `totalProdutos` | ✅ Equivalente |
| `totalDescontos` | `totalDescontos` | ✅ Equivalente |
| `totalImpostos` | `totalImpostos` | ✅ Equivalente |
| `totalGeral` | `totalPedido` | ⚠️ Nome diferente |
| `observacoes` | - | ❌ Não existe em PedidoVenda |
| `status` | `status` | ⚠️ Enums diferentes |
| `motivoPerda` | - | ❌ Não existe em PedidoVenda (específico de orçamento) |
| `companyId` | `companyId` | ✅ Equivalente |

### Campos Exclusivos de Orçamento (não devem ser copiados)
- `dataValidade` - Data de validade do orçamento
- `motivoPerda` - Motivo quando status é PERDIDO
- Campos relacionados ao status de orçamento

### Campos Exclusivos de PedidoVenda
- `dataEntrega` - Data de entrega real (não existe em orçamento)
- `numeroNFe` - Número da NFe gerada (será preenchido após emissão)

### Comparação de Itens - OrcamentoItem vs PedidoVendaItem

| Campo OrcamentoItem | Campo PedidoVendaItem | Observação |
|---------------------|----------------------|------------|
| `produtoId` | `produtoId` | ✅ Equivalente |
| `naturezaOperacaoId` | `naturezaOperacaoId` | ✅ Equivalente |
| `codigo` | `codigo` | ✅ Equivalente |
| `nome` | `nome` | ✅ Equivalente |
| `unidade` | `unidadeMedida` | ⚠️ Nome diferente |
| `ncm` | `ncm` | ✅ Equivalente |
| `cest` | `cest` | ✅ Equivalente |
| `quantidade` | `quantidade` | ✅ Equivalente |
| `precoUnitario` | `valorUnitario` | ⚠️ Nome diferente |
| `descontoValor` | `valorDesconto` | ⚠️ Nome diferente |
| `descontoPercentual` | `percentualDesconto` | ⚠️ Nome diferente |
| `freteRateado` | - | ❌ Não existe em PedidoVendaItem |
| `seguroRateado` | - | ❌ Não existe em PedidoVendaItem |
| `outrasDespesasRateado` | - | ❌ Não existe em PedidoVendaItem |
| `icmsBase` | - | ❌ Não existe em PedidoVendaItem |
| `icmsAliquota` | - | ❌ Não existe em PedidoVendaItem |
| `icmsValor` | - | ❌ Não existe em PedidoVendaItem |
| `icmsStBase` | - | ❌ Não existe em PedidoVendaItem |
| `icmsStAliquota` | - | ❌ Não existe em PedidoVendaItem |
| `icmsStValor` | - | ❌ Não existe em PedidoVendaItem |
| `ipiAliquota` | - | ❌ Não existe em PedidoVendaItem |
| `ipiValor` | - | ❌ Não existe em PedidoVendaItem |
| `pisAliquota` | - | ❌ Não existe em PedidoVendaItem |
| `pisValor` | - | ❌ Não existe em PedidoVendaItem |
| `cofinsAliquota` | - | ❌ Não existe em PedidoVendaItem |
| `cofinsValor` | - | ❌ Não existe em PedidoVendaItem |
| `totalItem` | `valorTotal` | ⚠️ Nome diferente |
| `observacoes` | `observacoes` | ✅ Equivalente |
| `numeroItem` | `numeroItem` | ⚠️ Tipo diferente (number vs string) |

---

## 1.3 DECISÕES TÉCNICAS NECESSÁRIAS

### 1. Adicionar Campo `orcamentoId` em PedidoVenda
**Decisão:** ✅ ADICIONAR
- Adicionar campo `orcamentoId?: UUID` na entidade
- Adicionar relacionamento `@ManyToOne(() => Orcamento)`
- Criar migration para adicionar coluna e foreign key

### 2. Adicionar Campo `observacoes` em PedidoVenda
**Decisão:** ✅ ADICIONAR
- Adicionar campo `observacoes?: string` na entidade
- Criar migration para adicionar coluna

### 3. Criar Método `createFromOrcamento`
**Decisão:** ✅ CRIAR
- Criar DTO `CreatePedidoVendaFromOrcamentoDto`
- Criar método no service
- Criar endpoint no controller

### 4. Mapeamento de Campos Incompatíveis

**Forma de Pagamento:**
- **Orcamento:** `formaPagamentoId` (UUID - relacionamento)
- **PedidoVenda:** `formaPagamento` (enum numérico)
- **Decisão:** Durante conversão, buscar `FormaPagamento` pelo ID e mapear para enum ou adicionar campo `formaPagamentoId` em PedidoVenda também

**Estoque:**
- **Orcamento:** `localEstoqueId` (UUID - relacionamento)
- **PedidoVenda:** `estoque` (enum numérico)
- **Decisão:** Durante conversão, buscar `LocalEstoque` pelo ID e mapear para enum ou adicionar campo `localEstoqueId` em PedidoVenda também

**Indicador de Presença:**
- **Orcamento:** `indicadorPresenca` (string)
- **PedidoVenda:** `indicadorPresenca` (enum numérico)
- **Decisão:** Criar função de mapeamento string → enum

**Status:**
- **Orcamento:** `StatusOrcamento` (RASCUNHO, ENVIADO, PERDIDO, GANHO)
- **PedidoVenda:** `StatusPedido` (PENDENTE, APROVADO, etc.)
- **Decisão:** Ao converter, definir status inicial como `PENDENTE` (padrão)

### 5. Campos de Impostos nos Itens
**Decisão:** ⚠️ DECIDIR
- Opção A: Adicionar campos de impostos em `PedidoVendaItem` para compatibilidade
- Opção B: Não copiar campos de impostos durante conversão (serão calculados depois)
- **Recomendação:** Opção B - Não copiar, pois serão recalculados pelo sistema de impostos

### 6. Campos de Rateio nos Itens
**Decisão:** ⚠️ DECIDIR
- Opção A: Adicionar campos de rateio em `PedidoVendaItem`
- Opção B: Não copiar campos de rateio
- **Recomendação:** Opção B - Não copiar, pois serão recalculados se necessário

---

## 1.4 CHECKLIST DE VERIFICAÇÕES COMPLETAS

### Backend - Verificações Concluídas
- [x] Entidade `PedidoVenda` existe
- [x] Entidade `PedidoVendaItem` existe
- [x] Service existe
- [x] Controller existe
- [x] Module existe
- [x] DTOs existem
- [x] Comparação de campos realizada
- [x] Diferenças identificadas
- [x] Decisões técnicas documentadas

### Backend - Verificações Pendentes
- [ ] Verificar migrations existentes
- [ ] Verificar relacionamento com Orcamento na entidade Orcamento
- [ ] Verificar se FormaPagamento e LocalEstoque são entidades ou enums

### Frontend - Verificações Pendentes
- [ ] Ler conteúdo de `/src/app/vendas/page.tsx`
- [ ] Verificar se existe serviço de API para vendas
- [ ] Verificar se existem tipos TypeScript para vendas
- [ ] Verificar estrutura de `/src/app/vendas/novo/page.tsx`
- [ ] Verificar componentes compartilhados

---

## 1.5 PRÓXIMOS PASSOS

### Prioridade Alta
1. ✅ **COMPLETO**: Análise da estrutura atual
2. ⏭️ **PRÓXIMO**: Adicionar campo `orcamentoId` em `PedidoVenda`
3. ⏭️ **PRÓXIMO**: Adicionar campo `observacoes` em `PedidoVenda`
4. ⏭️ **PRÓXIMO**: Criar relacionamento `@ManyToOne(() => Orcamento)` em `PedidoVenda`
5. ⏭️ **PRÓXIMO**: Criar DTO `CreatePedidoVendaFromOrcamentoDto`
6. ⏭️ **PRÓXIMO**: Criar método `createFromOrcamento` no service
7. ⏭️ **PRÓXIMO**: Criar endpoint no controller

### Prioridade Média
8. Verificar e completar análise do frontend
9. Criar migration para adicionar campos novos
10. Implementar função de mapeamento de campos incompatíveis

### Prioridade Baixa
11. Adicionar campos de impostos em `PedidoVendaItem` (se necessário)
12. Adicionar campos de rateio em `PedidoVendaItem` (se necessário)

---

## 📝 NOTAS IMPORTANTES

1. **Estrutura já existe**: O módulo de Pedidos de Venda já está implementado no backend, o que facilita muito a integração.

2. **Diferenças de tipos**: Há diferenças significativas entre enums e relacionamentos. Será necessário criar funções de mapeamento.

3. **Campos específicos**: Orçamento tem campos específicos (`dataValidade`, `motivoPerda`) que não devem ser copiados.

4. **Impostos**: Os campos de impostos não existem em `PedidoVendaItem`, mas isso não é problema pois serão calculados pelo sistema.

5. **Status inicial**: Ao converter orçamento ganho em pedido, o status inicial do pedido será `PENDENTE` (padrão).

---

**Status da FASE 1:** ✅ **CONCLUÍDA** (com ressalvas sobre verificações de frontend que deram timeout)

**Próxima Fase:** FASE 2 - Backend - Estrutura de Dados


