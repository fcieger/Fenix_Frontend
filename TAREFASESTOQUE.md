## Plano detalhado - Módulo de Estoque (MVP)

Escopo: somente movimentações (entrada, saída, transferência, ajuste), múltiplos estoques, histórico (kardex), lista de itens com saldos, inventário simples. Sem reservas, sem NFe de entrada, sem permissões, sem CSV. Todas as telas devem seguir nosso layout moderno.

### 0) Preparação
- [x] Definir local de estoque padrão por company (companies.defaultLocalEstoqueId)
- [x] Confirmar colunas essenciais nos `produtos` (controlaEstoque, estoqueMinimo, localPadraoId)

### 1) Banco de Dados (DDL mínima)
- [x] Criar tabela `locais_estoque` (id, nome, codigo, ativo, companyId, createdAt)
- [x] Criar tabela `estoque_movimentos` (histórico)
- [x] Índices: `idx_mov_produto_data(produtoId,dataMov)`, `idx_mov_origem(origem,origemId)`
- [ ] (Opcional fase 1.1) View `estoque_saldos_view` (saldo calculado por produto+local)

### 2) API - Movimentações
- [x] POST `/api/estoque/movimentos`
  - payload: { produtoId, tipo('entrada'|'saida'|'transferencia'|'ajuste'), qtd, localOrigemId?, localDestinoId?, custoUnitario?, origem?, origemId?, dataMov?, companyId }
  - validações: campos obrigatórios, qtd>0, locais coerentes para transferência
- [x] GET `/api/estoque/movimentos`
  - filtros: produtoId, localId, tipo, origem, período (inicio,fim)
  - ordenação por dataMov desc

### 2.1) API - Locais de Estoque (para telas de Multilocais)
- [x] GET `/api/estoque/locais` – listar (filtros: ativo, search)
- [x] POST `/api/estoque/locais` – criar { nome, codigo?, ativo? }
- [x] PUT `/api/estoque/locais/{id}` – atualizar
- [x] DELETE `/api/estoque/locais/{id}` – excluir/desativar

### 2.2) API - Saldos e Lista por Produto (para tela de Itens e Saldos)
- [x] GET `/api/estoque/saldos` – agrega por produto/local (filtros: produtoId, categoriaId, localId)
- [x] GET `/api/estoque/saldos/resumo` – totais gerais e contagens (abaixo do mínimo, zerados, negativos)

### 3) API - Saldos (computado)
- [x] GET `/api/estoque/saldos`
  - por produto/local; agrega `SUM(entradas-saidas)` via `estoque_movimentos`
  - filtros: produtoId, localId

### 3.1) API - Inventário
- [x] POST `/api/estoque/inventarios` – criar inventário { localId, produtos?: Produto[], observacao? }
- [x] GET `/api/estoque/inventarios` – listar inventários (filtros: localId, periodo, status)
- [x] GET `/api/estoque/inventarios/{id}` – obter com itens e contagens
- [x] POST `/api/estoque/inventarios/{id}/contagens` – enviar/atualizar contagens
- [x] POST `/api/estoque/inventarios/{id}/aplicar` – gerar ajustes de diferença (movimentos)

### 4) UI - Multilocais e Lista de Itens e Saldos
- [x] Multilocais
  - [x] Cadastro de estoques/depósitos
  - [x] Local padrão por company e opcional por produto
- [x] Lista de itens e saldos
  - [x] Grid com produto, código, estoque por local e total geral
  - [x] Filtros: produto, categoria, local; ordenação por saldo/descrição
  - [x] Indicadores: abaixo do mínimo, zerados, negativos
  - [x] Aplicar layout moderno do projeto em todos os componentes

### 5) UI - Lançamentos (Histórico/Kardex)
- [x] Tela com todos os movimentos (entrada/saída/transferência/ajuste)
- [x] Filtros: período, produto, local, tipo, origem (pedido, manual)
- [x] Link para origem quando houver (ex.: pedido de venda)
- [x] Layout moderno coerente com o restante do app

### 6) UI - Lançamento Manual
- [x] Formulário simples: tipo, produto, quantidade, local(es), data, custo opcional, observação, origem “manual”
- [x] Validação básica: quantidade > 0; locais obrigatórios em transferência
- [x] Enviar via POST `/api/estoque/movimentos`
- [x] Layout moderno e feedbacks (success/erro) padrão do app

### 7) Inventário Simples
- [x] Criar inventário para um local (ou seleção de produtos)
- [x] Digitar contagem por produto
- [x] Diferenças exibidas vs saldo calculado (kardex)
- [x] Botão “Aplicar inventário” que gera ajustes (entrada/saída)
- [x] Layout moderno padronizado

### 8) Alertas e Indicadores
- [ ] Card: itens abaixo do mínimo
- [ ] Card: itens sem movimento no período selecionado

### 10) Observabilidade e Qualidade
- [ ] Logar userId e requestId nos movimentos (se disponível)
- [ ] Testes básicos: criação, listagem, filtros e inventário
- [ ] Documentar payloads/rotas (README seção estoque)

### 11) Navegação e Menu Principal
- [x] Criar item de menu "Estoque" no menu principal
- [x] Subitens do menu "Estoque" seguindo layout moderno:
  - [x] "Itens e Saldos" → tela da seção 4
  - [x] "Lançamentos (Kardex)" → tela da seção 5
  - [x] "Lançamento Manual" → tela da seção 6
  - [x] "Inventário" → tela da seção 7
  - [x] "Locais de Estoque" → CRUD de depósitos (Multilocais)
- [x] Garantir rotas, breadcrumbs e ícones consistentes

---

### Backlog (futuro)
- [ ] Integração com Vendas: ação manual "Gerar baixa de estoque" e automação ao faturar
- [ ] Saldos materializados (tabela `estoque_saldos`) para leitura rápida
- [ ] Custo médio móvel (cálculo e exposição de custo no kardex)
- [ ] Devolução de venda → entrada automática
- [ ] Inventário cíclico
- [ ] Lotes/séries e validade


