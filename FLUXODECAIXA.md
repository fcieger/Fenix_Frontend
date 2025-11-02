# Planejamento Detalhado - Backend Fluxo de Caixa

## Objetivo
Implementar um backend robusto para o fluxo de caixa que permita visualizar movimentações financeiras do passado e futuro, com filtros avançados e garantia de isolamento por empresa.

## Premissas e Requisitos

### Premissas
1. **Isolamento por Empresa**: Todas as consultas devem filtrar por `company_id` para evitar vazamento de dados entre empresas
2. **Dados Unificados**: Combinar movimentações financeiras diretas, contas a receber e contas a pagar
3. **Evitar Duplicação**: Contas a receber/pagar pagas geram movimentações financeiras - não duplicar dados
4. **Performance**: Otimizar queries para grandes volumes de dados
5. **Flexibilidade**: Suportar múltiplos filtros e cenários de uso

### Requisitos Funcionais
1. **Visualizar Passado e Futuro**: Permitir consulta de dados históricos e projetados
2. **Escolha de Data**: Permitir usar data de pagamento/compensação OU data de vencimento
3. **Filtro de Status**: Filtrar por pagos, pendentes ou todos
4. **Inclusão de Saldos**: Opção de incluir ou não saldos atuais das contas bancárias
5. **Filtro por Conta**: Permitir filtrar por conta(s) específica(s)
6. **Período Flexível**: Consultar por período (data início e fim)

---

## Estrutura de Dados

### Fontes de Dados
1. **Movimentações Financeiras Diretas** (`movimentacoes_financeiras`)
   - Entradas (tipo: 'entrada')
   - Saídas (tipo: 'saida')
   - Transferências (tipo: 'transferencia')
   - Status: 'pago' ou 'pendente'
   - Data: `data_movimentacao`
   - Campos: `tela_origem`, `parcela_id` (para evitar duplicação)

2. **Contas a Receber** (`parcelas_contas_receber`)
   - Status: 'pago' ou 'pendente'
   - Data de vencimento: `data_vencimento`
   - Data de pagamento: `data_pagamento`
   - Data de compensação: `data_compensacao`
   - Valor: `valor_parcela`
   - Geram movimentações quando pagas (verificar `tela_origem = 'contas_receber_parcelas'`)

3. **Contas a Pagar** (`parcelas_contas_pagar`)
   - Status: 'pago' ou 'pendente'
   - Data de vencimento: `data_vencimento`
   - Data de pagamento: `data_pagamento`
   - Data de compensação: `data_compensacao`
   - Valor: `valor_parcela`
   - Geram movimentações quando pagas (verificar `tela_origem = 'contas_pagar_parcelas'`)

4. **Contas Financeiras** (`contas_financeiras`)
   - Saldo atual: `saldo_atual`
   - Saldo inicial: `saldo_inicial`
   - Company ID: `companyId`

---

## Tarefas Detalhadas

### Fase 1: Análise e Estruturação da API

#### [ ] Tarefa 1.1: Definir Interface da API
- [ ] Criar endpoint `/api/fluxo-caixa/processado` que retorna dados já processados
- [ ] Definir parâmetros de query:
  - `company_id` (obrigatório)
  - `data_inicio` (opcional, default: início do mês atual)
  - `data_fim` (opcional, default: fim do mês atual)
  - `tipo_data` (opcional: 'pagamento' | 'vencimento', default: 'pagamento')
  - `status` (opcional: 'todos' | 'pago' | 'pendente', default: 'todos')
  - `incluir_saldos` (opcional: boolean, default: true)
  - `conta_ids` (opcional: array de UUIDs, para filtrar contas específicas)
- [ ] Definir estrutura de resposta JSON:
  ```json
  {
    "success": true,
    "saldo_inicial": 1000.00,
    "saldo_final": 1500.00,
    "periodo": {
      "inicio": "2024-11-01",
      "fim": "2024-11-30"
    },
    "dados_diarios": [
      {
        "data": "2024-11-01",
        "recebimentos": 500.00,
        "pagamentos": 200.00,
        "transferencias_entrada": 0,
        "transferencias_saida": 0,
        "saldo_dia": 1300.00,
        "movimentacoes": [...]
      }
    ],
    "saldos_contas": [...] // Se incluir_saldos = true
  }
  ```

#### [ ] Tarefa 1.2: Criar Função Helper para Escolha de Data
- [ ] Criar função que determina qual data usar baseado em `tipo_data`:
  - Se `tipo_data = 'pagamento'`: usar `data_pagamento` ou `data_compensacao` (se pago), senão `data_vencimento`
  - Se `tipo_data = 'vencimento'`: sempre usar `data_vencimento`
- [ ] Aplicar lógica para movimentações financeiras:
  - Movimentações: sempre usar `data_movimentacao`
  - Contas a receber/pagar: aplicar lógica acima

---

### Fase 2: Implementação das Queries SQL

#### [ ] Tarefa 2.1: Query para Movimentações Financeiras Diretas
- [ ] Criar query que busca movimentações diretas (não geradas por contas a receber/pagar)
- [ ] Filtrar por `company_id` via JOIN com `contas_financeiras`
- [ ] Excluir movimentações onde `tela_origem IN ('contas_receber_parcelas', 'contas_pagar_parcelas')`
- [ ] Filtrar por status (pago/pendente/todos)
- [ ] Filtrar por período de datas
- [ ] Filtrar por conta(s) se especificado
- [ ] Campos a retornar:
  - `origem_tipo`: 'movimentacao'
  - `origem_id`: ID da movimentação
  - `data`: DATA baseada no filtro
  - `data_timestamp`: timestamp para ordenação
  - `company_id`: ID da empresa
  - `conta_id`: ID da conta
  - `valor_entrada`: valor de entrada
  - `valor_saida`: valor de saída
  - `descricao`: descrição
  - `status`: status (pago/pendente)
  - `parcela_id`: NULL

#### [ ] Tarefa 2.2: Query para Contas a Receber Pendentes
- [ ] Buscar apenas parcelas pendentes (pois pagas já têm movimentação)
- [ ] OU buscar todas se incluindo pagas para histórico
- [ ] Aplicar lógica de escolha de data (`tipo_data`)
- [ ] Filtrar por `company_id`
- [ ] Filtrar por período baseado na data escolhida
- [ ] Filtrar por conta se especificado
- [ ] Campos a retornar:
  - `origem_tipo`: 'conta_receber'
  - `origem_id`: ID da conta a receber
  - `data`: DATA baseada em tipo_data
  - `data_timestamp`: timestamp para ordenação
  - `company_id`: ID da empresa
  - `conta_id`: ID da conta corrente (pode ser NULL)
  - `valor_entrada`: valor da parcela
  - `valor_saida`: 0
  - `descricao`: descrição formatada
  - `status`: status da parcela
  - `parcela_id`: ID da parcela

#### [ ] Tarefa 2.3: Query para Contas a Pagar Pendentes
- [ ] Buscar apenas parcelas pendentes (pois pagas já têm movimentação)
- [ ] OU buscar todas se incluindo pagas para histórico
- [ ] Aplicar lógica de escolha de data (`tipo_data`)
- [ ] Filtrar por `company_id`
- [ ] Filtrar por período baseado na data escolhida
- [ ] Filtrar por conta se especificado
- [ ] Campos a retornar:
  - `origem_tipo`: 'conta_pagar'
  - `origem_id`: ID da conta a pagar
  - `data`: DATA baseada em tipo_data
  - `data_timestamp`: timestamp para ordenação
  - `company_id`: ID da empresa
  - `conta_id`: ID da conta corrente (pode ser NULL)
  - `valor_entrada`: 0
  - `valor_saida`: valor da parcela
  - `descricao`: descrição formatada
  - `status`: status da parcela
  - `parcela_id`: ID da parcela

#### [ ] Tarefa 2.4: Unificar Queries com UNION ALL
- [ ] Combinar as 3 queries com UNION ALL
- [ ] Garantir que todos os campos estejam alinhados
- [ ] Ordenar por `data_timestamp` ASC
- [ ] Aplicar filtros finais (status, período, contas)

---

### Fase 3: Cálculo de Saldos

#### [ ] Tarefa 3.1: Calcular Saldo Inicial do Período
- [ ] Buscar saldo inicial das contas selecionadas (ou todas)
- [ ] Se `incluir_saldos = true`: usar `saldo_atual` das contas
- [ ] Se `incluir_saldos = false`: usar apenas movimentações
- [ ] Buscar TODAS as movimentações pagas ANTES do período selecionado
- [ ] Calcular: `saldo_inicial = soma(saldos_iniciais_contas) + soma(movimentacoes_antes_periodo)`
- [ ] Considerar apenas movimentações com status 'pago' para saldo inicial
- [ ] Filtrar por `company_id` em todas as etapas

#### [ ] Tarefa 3.2: Calcular Saldos Diários
- [ ] Processar movimentações agrupadas por dia
- [ ] Para cada dia:
  - Somar recebimentos (valor_entrada)
  - Somar pagamentos (valor_saida)
  - Somar transferências entrada
  - Somar transferências saída
  - Calcular saldo do dia: `saldo_anterior + recebimentos - pagamentos`
- [ ] Considerar status conforme filtro:
  - Se status = 'pago': apenas movimentações pagas afetam saldo
  - Se status = 'pendente': apenas pendentes afetam saldo
  - Se status = 'todos': ambos afetam saldo

#### [ ] Tarefa 3.3: Retornar Saldos das Contas (se solicitado)
- [ ] Se `incluir_saldos = true`:
  - Buscar saldos atuais de todas as contas da empresa
  - Ou apenas das contas filtradas se `conta_ids` especificado
  - Retornar:
    ```json
    "saldos_contas": [
      {
        "conta_id": "uuid",
        "descricao": "Nome da Conta",
        "saldo_atual": 1000.00,
        "saldo_inicial": 500.00
      }
    ]
    ```

---

### Fase 4: Validações e Segurança

#### [ ] Tarefa 4.1: Validação de Entrada
- [ ] Validar que `company_id` é obrigatório e válido (UUID)
- [ ] Validar formato de datas (`data_inicio` e `data_fim`)
- [ ] Validar que `data_inicio <= data_fim`
- [ ] Validar `tipo_data` é 'pagamento' ou 'vencimento'
- [ ] Validar `status` é 'todos', 'pago' ou 'pendente'
- [ ] Validar `incluir_saldos` é boolean
- [ ] Validar `conta_ids` é array de UUIDs válidos

#### [ ] Tarefa 4.2: Validação de Acesso
- [ ] Verificar se usuário está autenticado (token válido)
- [ ] Verificar se `company_id` pertence ao usuário autenticado
- [ ] Verificar se contas filtradas pertencem à empresa
- [ ] Retornar erro 403 se acesso negado

#### [ ] Tarefa 4.3: Garantir Isolamento por Empresa
- [ ] Todas as queries devem ter JOIN com tabela que tem `company_id`
- [ ] Sempre filtrar por `company_id` na cláusula WHERE
- [ ] Verificar que contas filtradas pertencem à empresa
- [ ] Não retornar dados de outras empresas mesmo em caso de erro

---

### Fase 5: Otimizações e Performance

#### [ ] Tarefa 5.1: Criar Índices no Banco de Dados
- [ ] Índice em `movimentacoes_financeiras(conta_id, data_movimentacao, situacao)`
- [ ] Índice em `movimentacoes_financeiras(tela_origem, parcela_id)`
- [ ] Índice em `parcelas_contas_receber(conta_receber_id, status, data_vencimento, data_pagamento)`
- [ ] Índice em `parcelas_contas_pagar(conta_pagar_id, status, data_vencimento, data_pagamento)`
- [ ] Índice em `contas_financeiras(companyId, id)`
- [ ] Índice em `contas_receber(company_id, id)`
- [ ] Índice em `contas_pagar(company_id, id)`

#### [ ] Tarefa 5.2: Otimizar Queries
- [ ] Usar EXPLAIN ANALYZE para verificar performance
- [ ] Limitar resultados se necessário (paginamento futuro)
- [ ] Usar prepared statements para evitar SQL injection
- [ ] Cachear resultados para consultas frequentes (se aplicável)

#### [ ] Tarefa 5.3: Tratamento de Erros
- [ ] Capturar erros de banco de dados
- [ ] Retornar mensagens de erro amigáveis
- [ ] Logar erros para debug
- [ ] Não expor informações sensíveis em erros

---

### Fase 6: Processamento e Agregação

#### [ ] Tarefa 6.1: Agrupar Movimentações por Dia
- [ ] Processar resultado da query unificada
- [ ] Agrupar por data (dia)
- [ ] Somar valores de cada tipo por dia:
  - Recebimentos (valor_entrada de origem 'movimentacao' ou 'conta_receber')
  - Pagamentos (valor_saida de origem 'movimentacao' ou 'conta_pagar')
  - Transferências entrada (valor_entrada de transferências)
  - Transferências saída (valor_saida de transferências)
- [ ] Manter lista de movimentações detalhadas por dia

#### [ ] Tarefa 6.2: Calcular Saldo Acumulado
- [ ] Iniciar com saldo inicial do período
- [ ] Para cada dia em ordem cronológica:
  - Calcular variação do dia: `recebimentos + transfer_entrada - pagamentos - transfer_saida`
  - Atualizar saldo: `saldo_dia = saldo_dia_anterior + variacao`
  - Considerar apenas movimentações pagas para cálculo de saldo (se status = 'pago')
  - Considerar todas se status = 'todos' ou 'pendente'

#### [ ] Tarefa 6.3: Formatar Dados para Resposta
- [ ] Estruturar dados diários em formato JSON
- [ ] Incluir metadados (período, totais, etc)
- [ ] Formatar valores monetários
- [ ] Incluir informações de contas se solicitado

---

### Fase 7: Endpoint da API

#### [ ] Tarefa 7.1: Criar Arquivo `/api/fluxo-caixa/processado/route.ts`
- [ ] Implementar método GET
- [ ] Extrair e validar parâmetros de query
- [ ] Chamar funções de processamento
- [ ] Retornar resposta JSON estruturada
- [ ] Tratar erros adequadamente

#### [ ] Tarefa 7.2: Criar Funções Helper
- [ ] `buscarMovimentacoesFinanceiras()` - busca movimentações diretas
- [ ] `buscarContasReceber()` - busca contas a receber
- [ ] `buscarContasPagar()` - busca contas a pagar
- [ ] `calcularSaldoInicial()` - calcula saldo inicial
- [ ] `processarDadosDiarios()` - agrupa e processa por dia
- [ ] `validarAcesso()` - valida autenticação e permissões

#### [ ] Tarefa 7.3: Integrar com Frontend
- [ ] Atualizar `/app/financeiro/fluxo-caixa/page.tsx` para usar novo endpoint
- [ ] Passar parâmetros corretos baseados nos filtros do usuário
- [ ] Processar resposta e atualizar estado
- [ ] Tratar erros do backend

---

### Fase 8: Testes e Validação

#### [ ] Tarefa 8.1: Testes de Unidade
- [ ] Testar função de escolha de data
- [ ] Testar cálculo de saldo inicial
- [ ] Testar agrupamento por dia
- [ ] Testar cálculos de saldo acumulado

#### [ ] Tarefa 8.2: Testes de Integração
- [ ] Testar endpoint com diferentes combinações de parâmetros
- [ ] Testar com dados reais do banco
- [ ] Verificar isolamento por empresa
- [ ] Verificar que não há duplicação de dados

#### [ ] Tarefa 8.3: Testes de Segurança
- [ ] Tentar acessar dados de outra empresa (deve falhar)
- [ ] Testar com UUIDs inválidos
- [ ] Testar com datas inválidas
- [ ] Verificar que todos os filtros funcionam corretamente

#### [ ] Tarefa 8.4: Validação de Dados
- [ ] Comparar resultados com cálculos manuais
- [ ] Verificar que saldos finais batem com saldos das contas
- [ ] Verificar que não há movimentações duplicadas
- [ ] Verificar que todos os filtros funcionam isoladamente e em conjunto

---

### Fase 9: Documentação

#### [ ] Tarefa 9.1: Documentar API
- [ ] Documentar todos os parâmetros do endpoint
- [ ] Documentar estrutura de resposta
- [ ] Documentar exemplos de uso
- [ ] Documentar códigos de erro

#### [ ] Tarefa 9.2: Comentários no Código
- [ ] Comentar funções complexas
- [ ] Explicar lógicas de negócio importantes
- [ ] Documentar decisões de design
- [ ] Adicionar JSDoc onde aplicável

---

## Checklist de Implementação

### Backend
- [ ] Criar endpoint `/api/fluxo-caixa/processado/route.ts`
- [ ] Implementar função `buscarMovimentacoesFinanceiras()`
- [ ] Implementar função `buscarContasReceber()`
- [ ] Implementar função `buscarContasPagar()`
- [ ] Implementar função `calcularSaldoInicial()`
- [ ] Implementar função `processarDadosDiarios()`
- [ ] Implementar função `validarAcesso()`
- [ ] Implementar lógica de escolha de data (`tipo_data`)
- [ ] Implementar filtro de status
- [ ] Implementar filtro por contas
- [ ] Implementar inclusão/exclusão de saldos
- [ ] Garantir isolamento por `company_id` em todas as queries
- [ ] Criar índices de performance

### Frontend
- [ ] Atualizar `loadFluxoCaixa()` para usar novo endpoint
- [ ] Adicionar filtro `tipo_data` (pagamento/vencimento)
- [ ] Manter filtro de status funcionando
- [ ] Manter filtro por contas funcionando
- [ ] Adicionar opção para incluir/excluir saldos
- [ ] Atualizar interface para novos filtros

### Validação
- [ ] Testar com dados reais
- [ ] Verificar cálculos de saldo
- [ ] Verificar isolamento por empresa
- [ ] Verificar ausência de duplicação
- [ ] Testar todos os filtros
- [ ] Validar performance

---

## Estrutura SQL Proposta

### Query Unificada (Pseudocódigo)

```sql
WITH movimentacoes_diretas AS (
  SELECT 
    'movimentacao' as origem_tipo,
    m.id::text as origem_id,
    DATE(m.data_movimentacao) as data,
    m.data_movimentacao as data_timestamp,
    cf."companyId" as company_id,
    cf.id::text as conta_id,
    CASE WHEN m.tipo_movimentacao = 'entrada' THEN m.valor_entrada ELSE 0 END as valor_entrada,
    CASE WHEN m.tipo_movimentacao = 'saida' THEN m.valor_saida ELSE 0 END as valor_saida,
    m.descricao,
    COALESCE(m.situacao, 'pago') as status,
    NULL::text as parcela_id
  FROM movimentacoes_financeiras m
  INNER JOIN contas_financeiras cf ON m.conta_id = cf.id
  WHERE cf."companyId" = $1::uuid
    AND (m.tela_origem IS NULL OR m.tela_origem NOT IN ('contas_receber_parcelas', 'contas_pagar_parcelas'))
    AND COALESCE(m.situacao, 'pago') IN ('pago', 'pendente')
    AND DATE(m.data_movimentacao) BETWEEN $2::date AND $3::date
    AND ($4::uuid[] IS NULL OR cf.id = ANY($4::uuid[]))
    AND ($5::text = 'todos' OR COALESCE(m.situacao, 'pago') = $5::text)
),
contas_receber_data AS (
  SELECT 
    p.*,
    CASE 
      WHEN $6::text = 'pagamento' AND p.status = 'pago' AND p.data_compensacao IS NOT NULL 
        THEN DATE(p.data_compensacao)
      WHEN $6::text = 'pagamento' AND p.status = 'pago' AND p.data_pagamento IS NOT NULL 
        THEN DATE(p.data_pagamento)
      ELSE DATE(p.data_vencimento)
    END as data_escolhida,
    CASE 
      WHEN $6::text = 'pagamento' AND p.status = 'pago' AND p.data_compensacao IS NOT NULL 
        THEN p.data_compensacao::timestamp
      WHEN $6::text = 'pagamento' AND p.status = 'pago' AND p.data_pagamento IS NOT NULL 
        THEN p.data_pagamento::timestamp
      ELSE p.data_vencimento::timestamp
    END as data_timestamp_escolhida
  FROM parcelas_contas_receber p
  INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
  WHERE cr.company_id = $1::uuid
),
contas_receber_filtradas AS (
  SELECT 
    'conta_receber' as origem_tipo,
    p.conta_receber_id::text as origem_id,
    p.data_escolhida as data,
    p.data_timestamp_escolhida as data_timestamp,
    cr.company_id,
    COALESCE(p.conta_corrente_id::text, NULL) as conta_id,
    p.valor_parcela as valor_entrada,
    0::decimal(15,2) as valor_saida,
    'Recebimento: ' || cr.titulo || ' - ' || p.titulo_parcela as descricao,
    p.status,
    p.id::text as parcela_id
  FROM contas_receber_data p
  INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
  WHERE p.data_escolhida BETWEEN $2::date AND $3::date
    AND ($4::uuid[] IS NULL OR p.conta_corrente_id = ANY($4::uuid[]))
    AND ($5::text = 'todos' OR p.status = $5::text)
    AND (p.status = 'pendente' OR $7::boolean = true) -- incluir pagas se solicitado
),
contas_pagar_data AS (
  SELECT 
    p.*,
    CASE 
      WHEN $6::text = 'pagamento' AND p.status = 'pago' AND p.data_compensacao IS NOT NULL 
        THEN DATE(p.data_compensacao)
      WHEN $6::text = 'pagamento' AND p.status = 'pago' AND p.data_pagamento IS NOT NULL 
        THEN DATE(p.data_pagamento)
      ELSE DATE(p.data_vencimento)
    END as data_escolhida,
    CASE 
      WHEN $6::text = 'pagamento' AND p.status = 'pago' AND p.data_compensacao IS NOT NULL 
        THEN p.data_compensacao::timestamp
      WHEN $6::text = 'pagamento' AND p.status = 'pago' AND p.data_pagamento IS NOT NULL 
        THEN p.data_pagamento::timestamp
      ELSE p.data_vencimento::timestamp
    END as data_timestamp_escolhida
  FROM parcelas_contas_pagar p
  INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
  WHERE cp.company_id = $1::uuid
),
contas_pagar_filtradas AS (
  SELECT 
    'conta_pagar' as origem_tipo,
    p.conta_pagar_id::text as origem_id,
    p.data_escolhida as data,
    p.data_timestamp_escolhida as data_timestamp,
    cp.company_id,
    COALESCE(p.conta_corrente_id::text, NULL) as conta_id,
    0::decimal(15,2) as valor_entrada,
    p.valor_parcela as valor_saida,
    'Pagamento: ' || cp.titulo || ' - ' || p.titulo_parcela as descricao,
    p.status,
    p.id::text as parcela_id
  FROM contas_pagar_data p
  INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
  WHERE p.data_escolhida BETWEEN $2::date AND $3::date
    AND ($4::uuid[] IS NULL OR p.conta_corrente_id = ANY($4::uuid[]))
    AND ($5::text = 'todos' OR p.status = $5::text)
    AND (p.status = 'pendente' OR $7::boolean = true) -- incluir pagas se solicitado
)
SELECT * FROM movimentacoes_diretas
UNION ALL
SELECT * FROM contas_receber_filtradas
UNION ALL
SELECT * FROM contas_pagar_filtradas
ORDER BY data_timestamp ASC;
```

---

## Parâmetros da API

### GET `/api/fluxo-caixa/processado`

**Query Parameters:**
- `company_id` (obrigatório): UUID da empresa
- `data_inicio` (opcional): Data início do período (YYYY-MM-DD), default: início do mês atual
- `data_fim` (opcional): Data fim do período (YYYY-MM-DD), default: fim do mês atual
- `tipo_data` (opcional): 'pagamento' | 'vencimento', default: 'pagamento'
- `status` (opcional): 'todos' | 'pago' | 'pendente', default: 'todos'
- `incluir_saldos` (opcional): boolean, default: true
- `conta_ids` (opcional): Array de UUIDs separados por vírgula, para filtrar contas específicas
- `incluir_historico_pagas` (opcional): boolean, default: false - se true, inclui contas a receber/pagar pagas no histórico

**Response:**
```json
{
  "success": true,
  "saldo_inicial": 1000.00,
  "saldo_final": 1500.00,
  "periodo": {
    "inicio": "2024-11-01",
    "fim": "2024-11-30"
  },
  "filtros_aplicados": {
    "tipo_data": "pagamento",
    "status": "todos",
    "incluir_saldos": true,
    "contas_filtradas": ["uuid1", "uuid2"]
  },
  "dados_diarios": [
    {
      "data": "2024-11-01",
      "data_formatada": "01/11/2024",
      "recebimentos": 500.00,
      "pagamentos": 200.00,
      "transferencias_entrada": 0,
      "transferencias_saida": 0,
      "saldo_dia": 1300.00,
      "total_movimentacoes": 5,
      "movimentacoes": [
        {
          "origem_tipo": "movimentacao",
          "origem_id": "uuid",
          "descricao": "Descrição",
          "valor_entrada": 500.00,
          "valor_saida": 0,
          "status": "pago",
          "conta_id": "uuid"
        }
      ]
    }
  ],
  "saldos_contas": [
    {
      "conta_id": "uuid",
      "descricao": "Conta Corrente XP",
      "saldo_atual": 1000.00,
      "saldo_inicial": 500.00
    }
  ],
  "totais": {
    "total_recebimentos": 5000.00,
    "total_pagamentos": 3000.00,
    "total_transferencias_entrada": 500.00,
    "total_transferencias_saida": 200.00,
    "variacao_periodo": 2300.00
  }
}
```

---

## Notas de Implementação

1. **Isolamento por Empresa**: TODAS as queries devem filtrar por `company_id`. Usar JOINs sempre que possível para garantir isolamento.

2. **Evitar Duplicação**: 
   - Movimentações geradas por contas a receber/pagar têm `tela_origem = 'contas_receber_parcelas'` ou `'contas_pagar_parcelas'`
   - Excluir essas movimentações OU não incluir contas a receber/pagar pagas (escolher uma estratégia)

3. **Performance**: 
   - Criar índices nas colunas usadas em WHERE e JOINs
   - Considerar particionamento de tabelas se volume muito grande
   - Usar prepared statements

4. **Escolha de Data**:
   - Quando `tipo_data = 'pagamento'`: usar data de compensação (se existir), senão data de pagamento (se pago), senão data de vencimento
   - Quando `tipo_data = 'vencimento'`: sempre usar data de vencimento
   - Para movimentações financeiras: sempre usar `data_movimentacao`

5. **Saldos**:
   - Saldo inicial: soma de saldos iniciais das contas + movimentações pagas antes do período
   - Saldo por dia: saldo anterior + variação do dia (considerando apenas pagas se status = 'pago')
   - Saldo final: saldo do último dia

---

## Próximos Passos

1. Revisar este planejamento
2. Aprovar estrutura proposta
3. Implementar Fase 1 (Definição da API)
4. Implementar Fase 2 (Queries SQL)
5. Implementar Fases seguintes sequencialmente
6. Testar cada fase antes de avançar
7. Validar resultados finais

---

## Controle de Implementação

**Status Atual**: 📋 Planejamento

**Próxima Tarefa**: Tarefa 1.1 - Definir Interface da API

**Prazo Estimado**: 2-3 dias de desenvolvimento

**Responsável**: Equipe de Backend

---

*Última atualização: 2024-11-27*

