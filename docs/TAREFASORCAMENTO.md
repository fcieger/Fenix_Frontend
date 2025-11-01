# 📋 Plano de Implementação — Tela de Orçamentos

Este documento controla, com checklists, todas as tarefas para implementar a funcionalidade de Orçamentos (criar, editar, excluir), com integrações e premissas discutidas.

---

## ✅ Escopo e Premissas

- [x] 1.1 Status do orçamento
  - [x] Estados: `pendente` e `concluido`
  - [x] Regras: edição total em `pendente`; em `concluido`, bloquear cabeçalho/itens, permitindo somente observações; ação de reabrir (permite voltar a `pendente`)
  - [x] Transições permitidas: pendente → concluido; concluido → pendente (reabrir)

- [x] 1.2 Campos principais
  - [x] Identificação: `numero` (sequencial por empresa/série), `serie` (opcional), `numeroOrdemCompra` (texto)
  - [x] Datas: `dataEmissao` (obrigatória), `dataPrevisaoEntrega` (opcional), `dataEntrega` (opcional)
  - [x] Pagamento: `formaPagamento` (string/código), `prazoPagamentoId` (FK opcional)
  - [x] Gerais: `observacoes` (texto)

- [x] 1.3 Relacionamentos
  - [x] 1.3.1 `company_id` → Companies (obrigatório)
  - [x] 1.3.2 `cliente_id` (obrigatório), `vendedor_id` (opcional), `transportadora_id` (opcional) → Cadastros
  - [x] 1.3.3 `prazo_pagamento_id` → Prazos de pagamento (opcional)
  - [x] 1.3.4 `natureza_operacao_padrao_id` (cabeçalho, opcional) e `natureza_operacao_id` (por item, obrigatório) → Natureza de operação
  - [x] 1.3.5 `produto_id` nos itens → Produtos (opcional; permite item livre)

- [x] 1.4 Impostos por item
  - [x] Tributos: ICMS, IPI, PIS, COFINS, ICMS-ST
  - [x] Origem dos cálculos: derivados da `natureza_operacao` + UF do cliente + dados do produto; permitir override manual com permissão (futuro)
  - [x] Campos por item: bases, alíquotas e valores para ICMS, ICMS-ST, IPI, PIS, COFINS; NCM/CEST/CFOP/CST

- [x] 1.5 Totais do orçamento
  - [x] Por item: bruto = quantidade × preço; descontos (valor/percentual); rateios (frete/seguro/outras); tributos; total do item
  - [x] Cabeçalho: `totalProdutos`, `totalDescontos`, `totalImpostos`, `totalGeral` (somatório dos itens)

- [x] 1.6 Estoque
  - [x] Não baixa estoque em orçamento
  - [x] Checagem de disponibilidade por item (consulta)
  - [x] Reserva opcional ao concluir (a ser implementada posteriormente)

- [x] 1.7 NFe-ready (sem integrar à NFe)
  - [x] Garantir coleta dos campos mínimos: destinatário (cliente e endereço), natureza operação, CFOP/CST/NCM por item, quantidades, valores, modalidade de frete, transportadora, datas
  - [x] Objetivo: permitir conversão rápida para Pedido/NFe futuramente, sem emitir NFe nesta tela

---

## 🧱 Backend — NestJS/TypeORM

### Status da Área 2
- [x] Entidades `orcamentos` e `orcamento_itens` criadas com campos e FKs
- [x] DTOs `CreateOrcamentoDto`, `UpdateOrcamentoDto`, `ChangeStatusDto`
- [x] Service com regras de create/find/update/changeStatus/recalcularTotais
- [x] Controller REST com rotas: criar, listar, obter, atualizar, mudar status, recalcular impostos, excluir
- [x] Módulo registrado no `app.module.ts` e entidades incluídas no TypeORM
- [x] Migration criada com tabelas, índices e FKs
- [ ] Lookups (cadastros, prazos, natureza, produtos) consumidos pelo frontend (pendente — Área 3)
- [ ] Integração de impostos/estoque (stubs prontos; lógica futura)
- [ ] Testes unitários e de integração do backend (pendente)

### Modelagem e Migrations
- [ ] 2.1 Criar entidade `orcamentos`
  - [ ] 2.1.1 Campos: `id (uuid)`, `numero (varchar)`, `serie (varchar)`, `numeroOrdemCompra (varchar)`, `dataEmissao (date)`, `dataPrevisaoEntrega (date|null)`, `dataEntrega (date|null)`, `formaPagamento (varchar|null)`, `observacoes (text|null)`, `status (enum: pendente|concluido)`, `companyId (uuid)`
  - [ ] 2.1.2 Relacionamentos (FKs): `clienteId (uuid)`, `vendedorId (uuid|null)`, `transportadoraId (uuid|null)`, `prazoPagamentoId (uuid|null)`, `naturezaOperacaoPadraoId (uuid|null)`
  - [ ] 2.1.3 Totais: `totalProdutos (numeric(14,2))`, `totalDescontos (numeric(14,2))`, `totalImpostos (numeric(14,2))`, `totalGeral (numeric(14,2))`
  - [ ] 2.1.4 Auditoria: `createdAt`, `updatedAt`
- [ ] 2.2 Criar entidade `orcamento_itens`
  - [ ] 2.2.1 Campos: `id (uuid)`, `orcamentoId (uuid)`, `companyId (uuid)`, `produtoId (uuid|null)`, `naturezaOperacaoId (uuid)`, `codigo (varchar)`, `nome (varchar)`, `unidade (varchar)`, `ncm (varchar|null)`, `cest (varchar|null)`
  - [ ] 2.2.2 Quantidades e valores: `quantidade (numeric(14,6))`, `precoUnitario (numeric(14,6))`, `descontoValor (numeric(14,2))`, `descontoPercentual (numeric(5,2))`, `freteRateado (numeric(14,2))`, `seguroRateado (numeric(14,2))`, `outrasDespesasRateado (numeric(14,2))`, `totalItem (numeric(14,2))`
  - [ ] 2.2.3 Impostos: bases/aliquotas/valores para ICMS, ICMS-ST, IPI, PIS, COFINS (numeric)
  - [ ] 2.2.4 Auditoria: `createdAt`, `updatedAt`
- [ ] 2.3 Definir FKs
  - [ ] 2.3.1 `orcamentos.companyId` → `companies.id`
  - [ ] 2.3.2 `orcamentos.clienteId` → `cadastros.id`
  - [ ] 2.3.3 `orcamentos.vendedorId` → `cadastros.id`
  - [ ] 2.3.4 `orcamentos.transportadoraId` → `cadastros.id`
  - [ ] 2.3.5 `orcamentos.prazoPagamentoId` → `prazos_pagamento.id`
  - [ ] 2.3.6 `orcamentos.naturezaOperacaoPadraoId` → `natureza_operacao.id`
  - [ ] 2.3.7 `orcamento_itens.orcamentoId` → `orcamentos.id (ON DELETE CASCADE)`
  - [ ] 2.3.8 `orcamento_itens.companyId` → `companies.id`
  - [ ] 2.3.9 `orcamento_itens.produtoId` → `produtos.id`
  - [ ] 2.3.10 `orcamento_itens.naturezaOperacaoId` → `natureza_operacao.id`
- [ ] 2.4 Criar índices
  - [ ] 2.4.1 `orcamentos(status)`
  - [ ] 2.4.2 `orcamentos(dataEmissao)`
  - [ ] 2.4.3 `orcamentos(clienteId)`
  - [ ] 2.4.4 `orcamentos(companyId)`
  - [ ] 2.4.5 `orcamento_itens(orcamentoId)`
- [ ] 2.5 Migration inicial com schema e constraints (incluindo geração de `gen_random_uuid()`/`uuid_generate_v4()` conforme ambiente)

### DTOs e Validações
- [x] 2.6 DTO `CreateOrcamentoDto` com itens e validações (class-validator)
  - [x] 2.6.1 Campos obrigatórios: `companyId`, `clienteId`, `dataEmissao`, `itens[]`
  - [x] 2.6.2 Campos opcionais: `vendedorId`, `transportadoraId`, `prazoPagamentoId`, `naturezaOperacaoPadraoId`, `formaPagamento`, `numero`, `serie`, `numeroOrdemCompra`, `observacoes`, `status`
  - [x] 2.6.3 Itens: `naturezaOperacaoId`, `codigo`, `nome`, `unidade`, `quantidade`, `precoUnitario`; opcionais fiscais e descontos
  - [x] 2.6.4 Validações: UUIDs válidos; datas ISO; numéricos positivos; tamanho máximo de strings conforme colunas
- [x] 2.7 DTO `UpdateOrcamentoDto` (PartialType) — permitir atualização parcial com mesmas validações
- [x] 2.8 DTO `ChangeStatusDto` (enum pendente/concluido) — restringir valores ao enum

### Serviço e Controller
- [x] 2.9 Service: `create`
  - [x] 2.9.1 Normalizar datas (string → Date)
  - [x] 2.9.2 Criar orçamento + itens (cascade) com `companyId` propagado
  - [x] 2.9.3 Recalcular totais (itens e cabeçalho) antes de salvar
- [x] 2.10 Service: `findAll`
  - [x] 2.10.1 Suportar filtros: `status`, `clienteId`, `companyId`, período (`dataEmissao` entre)
  - [x] 2.10.2 Ordenar por `createdAt DESC`
- [x] 2.11 Service: `findOne` com `itens`
- [x] 2.12 Service: `update`
  - [x] 2.12.1 Bloquear alteração se `status = concluido`
  - [x] 2.12.2 Atualizar cabeçalho; regravar itens (delete + create) ou upsert conforme performance
  - [x] 2.12.3 Recalcular totais
- [x] 2.13 Service: `changeStatus` (pendente ⇄ concluido)
  - [x] 2.13.1 Validar transição
  - [x] 2.13.2 No `concluido`, opcionalmente acionar reserva de estoque (futuro)
- [x] 2.14 Service: `recalcularImpostos` (stub)
  - [x] 2.14.1 Iterar itens e consultar estratégia de impostos (quando disponível)
  - [x] 2.14.2 Atualizar campos fiscais do item e totais
- [x] 2.15 Controller: rotas REST `/api/orcamentos`
  - [x] 2.15.1 POST criar
  - [x] 2.15.2 GET lista (com query params de filtro)
  - [x] 2.15.3 GET detalhe por id
  - [x] 2.15.4 PUT atualizar por id
  - [x] 2.15.5 PATCH status
  - [x] 2.15.6 POST recalcular-impostos
  - [x] 2.15.7 DELETE remover por id
- [x] 2.16 Module: registrar repositórios no TypeORM e providers do serviço

### Integrações e Regras
 - [x] 2.17 Lookups: clientes, vendedores, transportadoras (cadastros)
  - [ ] 2.17.1 Endpoint atual suporta filtro por `query`
  - [ ] 2.17.2 Garantir retorno de `id`, `nomeRazaoSocial`, `enderecos`
 - [x] 2.18 Lookups: prazos_pagamento — listar ativos por `companyId`
 - [x] 2.19 Lookups: natureza_operacao — listar habilitadas por `companyId`
 - [x] 2.20 Lookups: produtos — suporte a busca por nome/sku/código
 - [x] 2.21 Regras de totais
  - [ ] 2.21.1 Fórmulas de item e somatórios de cabeçalho consolidados
  - [ ] 2.21.2 Arredondamentos: manter precisão (2 casas para valores; 6 para unitário/quantidade conforme necessidade)
 - [x] 2.22 Regras de status: bloqueios em `concluido`; reabrir permitido
 - [x] 2.23 Regras de empresa: todas as consultas por `companyId`
 - [x] 2.24 Hooks stubs: impostos e estoque (sem implementar lógica externa agora)

### Testes Backend
- [x] 2.25 Unit: cálculo de totais de itens e cabeçalho (casos com desconto valor e percentual, e com rateios)
 - [ ] 2.26 Unit: cálculo de impostos por itens e totais (stubado; validar persistência dos campos)
- [x] 2.27 Unit: transições de status (pendente→concluido→pendente) e bloqueios em `concluido`
 - [x] 2.28 Integração (service-level): criar, editar, excluir com cascade e validações
 - [x] 2.29 Integração (service-level): filtros da listagem (status, clienteId, companyId, período)

---

## 🖥️ Frontend — Next.js

### Tipos e Serviços
- [x] 3.1 Definir tipos `Orcamento` e `OrcamentoItem` (`src/types/orcamento.ts`)
- [x] 3.2 Serviços HTTP (`src/services/orcamentos.ts`): listar, obter, criar, atualizar, excluir, alterar status, recalcular impostos

### Listagem
- [x] 3.3 Página `app/orcamentos` com tabela e filtros (status, período, cliente, vendedor)
- [x] 3.4 Colunas: número, cliente, total, status, emissão
- [x] 3.5 Ações: novo, abrir, concluir/reabrir, excluir

### Formulário
- [x] 3.6 Página `app/orcamentos/[id]` com cabeçalho (empresa, cliente, vendedor, transportadora, natureza padrão, datas)
- [x] 3.7 Sessão de pagamento: forma, prazo, prévia de parcelas (visual) 
- [x] 3.8 Itens: inclusão/edição, autocomplete de produto; quantidade, preço, descontos; natureza por item
- [x] 3.9 Impostos por item: CFOP/CST/NCM/CEST, alíquotas e valores (edição/visualização)
- [x] 3.10 Totais: produtos, descontos, rateios, impostos, total geral
- [x] 3.11 Ações: salvar, concluir, reabrir, recalcular impostos, excluir

### Autocompletes e Lookups
- [x] 3.12 Autocomplete de cliente (cadastros) com dropdown
- [x] 3.13 Autocomplete de vendedor (cadastros) com dropdown
- [x] 3.14 Autocomplete de transportadora (cadastros) com dropdown
- [x] 3.15 Autocomplete de natureza de operação com dropdown
- [x] 3.16 Autocomplete de produto (campo de busca inicial; seleção futura)
- [x] 3.17 Carregar prazos de pagamento com dropdown

### Validações e UX
- [x] 3.18 Validações de campos obrigatórios (company, cliente, datas, itens)
- [x] 3.19 Máscaras e formatação numérica/monetária (arredondamento em blur para 2/4 casas)
- [x] 3.20 Estados de carregamento e erro (toasts/alerts simples)
- [x] 3.21 Bloqueio de campos em status concluido

### Testes Frontend
- [x] 3.22 E2E: smoke test lista e formulário (Puppeteer, `npm run test:orcamentos`)
- [x] 3.23 E2E: editar itens, concluir, reabrir (flows via `npm run test:orcamentos:flows` com env TEST_* )
- [x] 3.24 E2E: excluir orçamento (flows via `npm run test:orcamentos:flows`)

---

## 🔌 Endpoints REST (Resumo)

- [x] 4.1 POST `/api/orcamentos` — criar pendente
- [x] 4.2 GET `/api/orcamentos` — listar (filtros: status, clienteId, companyId, período)
- [x] 4.3 GET `/api/orcamentos/:id` — detalhes
- [x] 4.4 PUT `/api/orcamentos/:id` — editar (se pendente)
- [x] 4.5 PATCH `/api/orcamentos/:id/status` — pendente/concluido
- [x] 4.6 POST `/api/orcamentos/:id/recalcular-impostos` — recalcular (stub)
- [x] 4.7 DELETE `/api/orcamentos/:id` — excluir

---

## 🧮 Cálculos e Regras de Negócio (Detalhe)

- [x] 5.1 Total do item = (quantidade × preço) − descontos + rateios + tributos
- [x] 5.2 Totais de cabeçalho = somatório por item (produtos, descontos, impostos, total geral)
- [x] 5.3 Item aceita override de NCM/CEST/CFOP/CST e alíquotas (com permissão futura)
- [x] 5.4 Natureza por item prevalece sobre cabeçalho
- [x] 5.5 Estoque: não baixa em orçamento; reserva opcional futuramente na conclusão

---

## ⚙️ Operacional

- [x] 6.1 Variáveis de ambiente no backend e frontend (reusar existentes)
- [x] 6.2 Scripts de start já existentes (`./start-backend-native.sh`, `npm run dev:3004`)
- [x] 6.3 Documentar no `CONTEXTO.md` os novos endpoints

---

## ✅ Critérios de Aceite

- [x] 7.1 É possível criar orçamento pendente com todos os campos obrigatórios e itens
- [x] 7.2 É possível editar orçamento pendente (cabeçalho e itens)
- [x] 7.3 É possível concluir orçamento (bloqueando campos críticos) e reabrir
- [x] 7.4 É possível excluir orçamento (e seus itens) com confirmação
- [x] 7.5 Cálculo de totais consistente com os itens
- [x] 7.6 Lookups funcionam (cadastros, prazos, natureza, produtos)
- [x] 7.7 Validações lado cliente e servidor
- [x] 7.8 Testes básicos passam (backend e frontend)

---

## 📎 Referências

- Frontend: Next.js 15, Tailwind, Radix UI
- Backend: NestJS 11, TypeORM, PostgreSQL
- Módulos existentes: cadastros, produtos, prazos_pagamento, natureza_operacao, companies


