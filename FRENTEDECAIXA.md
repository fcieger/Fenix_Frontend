# 🏪 PROJETO FRENTE DE CAIXA (PDV) COM NFCe

## 📋 ÍNDICE
1. [Visão Geral](#visão-geral)
2. [Estrutura de Banco de Dados](#estrutura-de-banco-de-dados)
3. [APIs Necessárias](#apis-necessárias)
4. [Telas e Componentes](#telas-e-componentes)
5. [Fluxos Funcionais](#fluxos-funcionais)
6. [Integrações](#integrações)
7. [Validações](#validações)
8. [Checklist de Implementação](#checklist-de-implementação)

---

## 🎯 VISÃO GERAL

### Objetivo
Sistema de Frente de Caixa (PDV) completo para venda rápida com emissão automática de NFCe, integrado com cadastros, produtos, natureza de operações e controle de caixa.

### Funcionalidades Principais
- ✅ Abertura e fechamento de caixa
- ✅ Venda rápida de produtos
- ✅ Busca de produtos por código/nome
- ✅ Seleção de clientes
- ✅ Cálculo automático de impostos
- ✅ Emissão automática de NFCe
- ✅ Múltiplas formas de pagamento
- ✅ Cálculo de troco
- ✅ Sangria e suprimento de caixa
- ✅ Histórico de vendas
- ✅ Relatórios de fechamento de caixa

---

## 🗄️ ESTRUTURA DE BANCO DE DADOS

### FASE 1: Tabelas de Caixa

#### ✅ Tabela: `caixas`
```sql
CREATE TABLE IF NOT EXISTS caixas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "usuarioId" UUID NOT NULL REFERENCES users(id),
  descricao TEXT NOT NULL,
  "valorAbertura" NUMERIC(14,2) NOT NULL DEFAULT 0,
  "valorFechamento" NUMERIC(14,2),
  "valorEsperado" NUMERIC(14,2),
  "valorReal" NUMERIC(14,2),
  "diferenca" NUMERIC(14,2),
  "dataAbertura" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataFechamento" TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'aberto', -- 'aberto', 'fechado'
  observacoes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_caixas_company_status ON caixas("companyId", status);
CREATE INDEX IF NOT EXISTS idx_caixas_usuario ON caixas("usuarioId");
CREATE INDEX IF NOT EXISTS idx_caixas_data_abertura ON caixas("dataAbertura");
```

**Checklist:**
- [ ] Criar tabela `caixas`
- [ ] Criar índices
- [ ] Adicionar constraints
- [ ] Criar triggers para `updatedAt`

#### ✅ Tabela: `vendas_caixa`
```sql
CREATE TABLE IF NOT EXISTS vendas_caixa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "caixaId" UUID NOT NULL REFERENCES caixas(id) ON DELETE CASCADE,
  "pedidoVendaId" UUID REFERENCES pedidos_venda(id),
  "nfeId" UUID REFERENCES nfe(id),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "configuracaoNfeId" UUID REFERENCES configuracoes_nfe(id),
  "naturezaOperacaoId" UUID NOT NULL REFERENCES natureza_operacao(id),
  
  -- Dados da venda
  "dataVenda" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataEmissao" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataSaida" TIMESTAMP,
  "horaSaida" TEXT,
  "numeroNFCe" INTEGER,
  "serieNFCe" TEXT,
  "chaveAcesso" TEXT,
  "protocolo" TEXT,
  "statusNFCe" TEXT DEFAULT 'pendente', -- 'pendente', 'autorizada', 'cancelada', 'denegada'
  
  -- Destinatário
  "clienteId" UUID REFERENCES cadastros(id),
  "clienteCpfCnpj" TEXT,
  "clienteNome" TEXT,
  "clienteEmail" TEXT,
  "clienteEndereco" JSONB,
  
  -- Indicadores NFCe
  "consumidorFinal" BOOLEAN DEFAULT TRUE,
  "indicadorPresenca" TEXT NOT NULL, -- PRESENCIAL, INTERNET, TELEATENDIMENTO, ENTREGA_DOMICILIO, PRESENCIAL_FORA_ESTABELECIMENTO
  
  -- Valores
  "valorTotal" NUMERIC(14,2) NOT NULL,
  "valorProdutos" NUMERIC(14,2) NOT NULL,
  "valorDesconto" NUMERIC(14,2) DEFAULT 0,
  "valorFrete" NUMERIC(14,2) DEFAULT 0,
  "valorImpostos" NUMERIC(14,2) DEFAULT 0,
  "valorTributosAprox" NUMERIC(14,2) DEFAULT 0,
  
  -- Forma de Pagamento
  "formaPagamentoId" UUID REFERENCES formas_pagamento(id),
  "meioPagamento" TEXT, -- DINHEIRO, CARTAO_CREDITO, CARTAO_DEBITO, PIX, etc.
  "valorRecebido" NUMERIC(14,2),
  "valorTroco" NUMERIC(14,2) DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'concluida', -- 'concluida', 'cancelada'
  "observacoes" TEXT,
  
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vendas_caixa_caixa ON vendas_caixa("caixaId");
CREATE INDEX IF NOT EXISTS idx_vendas_caixa_company ON vendas_caixa("companyId");
CREATE INDEX IF NOT EXISTS idx_vendas_caixa_data ON vendas_caixa("dataVenda");
CREATE INDEX IF NOT EXISTS idx_vendas_caixa_nfce ON vendas_caixa("numeroNFCe", "serieNFCe");
```

**Checklist:**
- [ ] Criar tabela `vendas_caixa`
- [ ] Criar índices
- [ ] Adicionar foreign keys
- [ ] Criar triggers para `updatedAt`

#### ✅ Tabela: `vendas_caixa_itens`
```sql
CREATE TABLE IF NOT EXISTS vendas_caixa_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "vendaCaixaId" UUID NOT NULL REFERENCES vendas_caixa(id) ON DELETE CASCADE,
  "produtoId" UUID REFERENCES produtos(id),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "naturezaOperacaoId" UUID NOT NULL REFERENCES natureza_operacao(id),
  
  -- Dados do Produto
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  ncm TEXT NOT NULL,
  cfop TEXT NOT NULL,
  cest TEXT,
  unidade TEXT NOT NULL,
  
  -- Valores e Quantidades
  quantidade NUMERIC(14,6) NOT NULL,
  "precoUnitario" NUMERIC(14,6) NOT NULL,
  "valorDesconto" NUMERIC(14,2) DEFAULT 0,
  "descontoPercentual" NUMERIC(5,2) DEFAULT 0,
  "valorTotal" NUMERIC(14,2) NOT NULL,
  
  -- Impostos do Item
  "icmsCST" TEXT,
  "icmsBase" NUMERIC(14,4),
  "icmsAliquota" NUMERIC(7,4),
  "icmsValor" NUMERIC(14,2),
  "ipiCST" TEXT,
  "ipiBase" NUMERIC(14,4),
  "ipiAliquota" NUMERIC(7,4),
  "ipiValor" NUMERIC(14,2),
  "pisCST" TEXT,
  "pisBase" NUMERIC(14,4),
  "pisAliquota" NUMERIC(7,4),
  "pisValor" NUMERIC(14,2),
  "cofinsCST" TEXT,
  "cofinsBase" NUMERIC(14,4),
  "cofinsAliquota" NUMERIC(7,4),
  "cofinsValor" NUMERIC(14,2),
  
  "numeroItem" INTEGER,
  observacoes TEXT,
  
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vendas_caixa_itens_venda ON vendas_caixa_itens("vendaCaixaId");
CREATE INDEX IF NOT EXISTS idx_vendas_caixa_itens_produto ON vendas_caixa_itens("produtoId");
```

**Checklist:**
- [ ] Criar tabela `vendas_caixa_itens`
- [ ] Criar índices
- [ ] Adicionar foreign keys

#### ✅ Tabela: `movimentacoes_caixa`
```sql
CREATE TABLE IF NOT EXISTS movimentacoes_caixa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "caixaId" UUID NOT NULL REFERENCES caixas(id) ON DELETE CASCADE,
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'entrada', 'saida', 'sangria', 'suprimento'
  valor NUMERIC(14,2) NOT NULL,
  descricao TEXT,
  "formaPagamentoId" UUID REFERENCES formas_pagamento(id),
  "dataMovimentacao" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_caixa_caixa ON movimentacoes_caixa("caixaId");
CREATE INDEX IF NOT EXISTS idx_movimentacoes_caixa_data ON movimentacoes_caixa("dataMovimentacao");
```

**Checklist:**
- [ ] Criar tabela `movimentacoes_caixa`
- [ ] Criar índices
- [ ] Adicionar foreign keys

---

## 🔌 APIs NECESSÁRIAS

### FASE 2: APIs de Caixa

#### ✅ API: `GET /api/caixa/status`
**Descrição:** Verifica se existe caixa aberto para o usuário/empresa atual

**Parâmetros:**
- `company_id` (query) - UUID da empresa
- `usuario_id` (query) - UUID do usuário (opcional, pega do token)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "caixaAberto": true,
    "caixa": {
      "id": "uuid",
      "descricao": "Caixa Principal",
      "valorAbertura": 100.00,
      "dataAbertura": "2024-01-01T10:00:00Z",
      "status": "aberto"
    }
  }
}
```

**Checklist:**
- [ ] Criar endpoint `GET /api/caixa/status`
- [ ] Validar autenticação
- [ ] Buscar caixa aberto do usuário
- [ ] Retornar dados do caixa ou null
- [ ] Tratar erros

#### ✅ API: `POST /api/caixa/abrir`
**Descrição:** Abre um novo caixa

**Body:**
```json
{
  "descricao": "Caixa Principal",
  "valorAbertura": 100.00,
  "observacoes": "Observações opcionais"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "descricao": "Caixa Principal",
    "valorAbertura": 100.00,
    "dataAbertura": "2024-01-01T10:00:00Z",
    "status": "aberto"
  }
}
```

**Validações:**
- Verificar se não existe caixa aberto
- Validar valor de abertura >= 0
- Usuário deve estar autenticado

**Checklist:**
- [ ] Criar endpoint `POST /api/caixa/abrir`
- [ ] Validar autenticação
- [ ] Verificar se não existe caixa aberto
- [ ] Validar valor de abertura
- [ ] Criar registro na tabela `caixas`
- [ ] Retornar dados do caixa criado
- [ ] Tratar erros

#### ✅ API: `POST /api/caixa/fechar`
**Descrição:** Fecha o caixa atual

**Body:**
```json
{
  "valorReal": 1500.00,
  "observacoes": "Observações do fechamento"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "dataFechamento": "2024-01-01T18:00:00Z",
    "valorEsperado": 1500.00,
    "valorReal": 1500.00,
    "diferenca": 0.00,
    "status": "fechado",
    "resumoVendas": {
      "totalVendas": 15,
      "valorTotalVendas": 1500.00,
      "totalPorFormaPagamento": [
        {
          "formaPagamento": "DINHEIRO",
          "valor": 800.00
        },
        {
          "formaPagamento": "CARTAO_DEBITO",
          "valor": 700.00
        }
      ]
    }
  }
}
```

**Validações:**
- Verificar se existe caixa aberto
- Calcular valor esperado baseado nas vendas
- Validar valor real >= 0

**Checklist:**
- [ ] Criar endpoint `POST /api/caixa/fechar`
- [ ] Validar autenticação
- [ ] Verificar se existe caixa aberto
- [ ] Calcular totais das vendas
- [ ] Calcular valor esperado
- [ ] Calcular diferença
- [ ] Atualizar status do caixa
- [ ] Retornar resumo de fechamento
- [ ] Tratar erros

#### ✅ API: `GET /api/caixa/resumo`
**Descrição:** Retorna resumo do caixa aberto

**Parâmetros:**
- `caixa_id` (query) - UUID do caixa
- `company_id` (query) - UUID da empresa

**Resposta:**
```json
{
  "success": true,
  "data": {
    "caixa": {
      "id": "uuid",
      "descricao": "Caixa Principal",
      "valorAbertura": 100.00,
      "dataAbertura": "2024-01-01T10:00:00Z"
    },
    "resumo": {
      "totalVendas": 15,
      "valorTotalVendas": 1500.00,
      "totalSangrias": 50.00,
      "totalSuprimentos": 20.00,
      "saldoAtual": 1570.00,
      "totalPorFormaPagamento": [...]
    },
    "vendas": [
      {
        "id": "uuid",
        "numeroNFCe": 1,
        "clienteNome": "Cliente Avulso",
        "valorTotal": 100.00,
        "dataVenda": "2024-01-01T10:30:00Z",
        "statusNFCe": "autorizada"
      }
    ]
  }
}
```

**Checklist:**
- [ ] Criar endpoint `GET /api/caixa/resumo`
- [ ] Validar autenticação
- [ ] Buscar dados do caixa
- [ ] Calcular totais de vendas
- [ ] Calcular totais de movimentações
- [ ] Calcular saldo atual
- [ ] Agrupar por forma de pagamento
- [ ] Retornar lista de vendas
- [ ] Tratar erros

### FASE 3: APIs de Vendas Caixa

#### ✅ API: `POST /api/caixa/venda`
**Descrição:** Cria uma venda no caixa com emissão de NFCe

**Body:**
```json
{
  "caixaId": "uuid",
  "configuracaoNfeId": "uuid",
  "naturezaOperacaoId": "uuid",
  "clienteId": "uuid (opcional)",
  "clienteCpfCnpj": "12345678900 (opcional)",
  "clienteNome": "Cliente Avulso",
  "clienteEmail": "cliente@email.com (opcional)",
  "indicadorPresenca": "PRESENCIAL",
  "itens": [
    {
      "produtoId": "uuid",
      "codigo": "001",
      "nome": "Produto Teste",
      "ncm": "12345678",
      "cfop": "5102",
      "unidade": "UN",
      "quantidade": 2,
      "precoUnitario": 50.00,
      "valorDesconto": 0,
      "naturezaOperacaoId": "uuid"
    }
  ],
  "valorDesconto": 0,
  "formaPagamentoId": "uuid",
  "meioPagamento": "DINHEIRO",
  "valorRecebido": 100.00
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "venda": {
      "id": "uuid",
      "numeroNFCe": 1,
      "chaveAcesso": "35200100000000000000650000000000000000000000",
      "protocolo": "123456789012345",
      "statusNFCe": "autorizada",
      "qrCode": "data:image/png;base64,...",
      "valorTotal": 100.00,
      "valorTroco": 0.00
    }
  }
}
```

**Processo:**
1. Validar caixa aberto
2. Validar configuração NFCe
3. Validar produtos (NCM, estoque, etc.)
4. Calcular impostos
5. Gerar número NFCe
6. Emitir NFCe (chamar API externa)
7. Criar registro em `vendas_caixa`
8. Criar registros em `vendas_caixa_itens`
9. Criar registro em `movimentacoes_caixa`
10. Atualizar estoque (se controla estoque)
11. Gerar QR Code
12. Retornar dados da venda

**Checklist:**
- [ ] Criar endpoint `POST /api/caixa/venda`
- [ ] Validar autenticação
- [ ] Validar caixa aberto
- [ ] Validar configuração NFCe
- [ ] Validar produtos e estoque
- [ ] Calcular impostos (chamar API)
- [ ] Gerar número sequencial NFCe
- [ ] Preparar dados NFCe
- [ ] Emitir NFCe (integração externa)
- [ ] Criar registro `vendas_caixa`
- [ ] Criar registros `vendas_caixa_itens`
- [ ] Criar registro `movimentacoes_caixa`
- [ ] Atualizar estoque
- [ ] Gerar QR Code
- [ ] Retornar dados completos
- [ ] Tratar erros e rollback

#### ✅ API: `GET /api/caixa/vendas`
**Descrição:** Lista vendas do caixa

**Parâmetros:**
- `caixa_id` (query) - UUID do caixa (obrigatório)
- `company_id` (query) - UUID da empresa
- `data_inicio` (query) - Data início (opcional)
- `data_fim` (query) - Data fim (opcional)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "vendas": [
      {
        "id": "uuid",
        "numeroNFCe": 1,
        "clienteNome": "Cliente Avulso",
        "valorTotal": 100.00,
        "meioPagamento": "DINHEIRO",
        "dataVenda": "2024-01-01T10:30:00Z",
        "statusNFCe": "autorizada",
        "chaveAcesso": "35200100000000000000650000000000000000000000"
      }
    ],
    "total": 15,
    "valorTotal": 1500.00
  }
}
```

**Checklist:**
- [ ] Criar endpoint `GET /api/caixa/vendas`
- [ ] Validar autenticação
- [ ] Filtrar por caixa_id
- [ ] Filtrar por data (opcional)
- [ ] Retornar lista de vendas
- [ ] Retornar totais
- [ ] Tratar erros

#### ✅ API: `POST /api/caixa/cancelar-venda`
**Descrição:** Cancela uma venda já finalizada

**Body:**
```json
{
  "vendaId": "uuid",
  "justificativa": "Venda cancelada por solicitação do cliente"
}
```

**Validações:**
- Venda deve existir
- Venda deve estar concluída
- NFCe deve estar autorizada
- Deve estar dentro do prazo (24h)
- Verificar permissões do usuário

**Processo:**
1. Buscar venda
2. Validar condições de cancelamento
3. Cancelar NFCe (chamar API externa)
4. Atualizar status da venda
5. Estornar movimentação de caixa
6. Estornar estoque (se aplicável)
7. Retornar resultado

**Checklist:**
- [ ] Criar endpoint `POST /api/caixa/cancelar-venda`
- [ ] Validar autenticação
- [ ] Buscar venda
- [ ] Validar condições de cancelamento
- [ ] Cancelar NFCe (integração externa)
- [ ] Atualizar status da venda
- [ ] Estornar movimentação
- [ ] Estornar estoque
- [ ] Tratar erros

### FASE 4: APIs de Movimentações

#### ✅ API: `POST /api/caixa/movimentacao`
**Descrição:** Registra sangria ou suprimento de caixa

**Body:**
```json
{
  "caixaId": "uuid",
  "tipo": "sangria", // ou "suprimento"
  "valor": 50.00,
  "descricao": "Retirada para pagamento de fornecedor",
  "formaPagamentoId": "uuid (opcional)"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tipo": "sangria",
    "valor": 50.00,
    "dataMovimentacao": "2024-01-01T15:00:00Z"
  }
}
```

**Checklist:**
- [ ] Criar endpoint `POST /api/caixa/movimentacao`
- [ ] Validar autenticação
- [ ] Validar caixa aberto
- [ ] Validar tipo (sangria/suprimento)
- [ ] Validar valor > 0
- [ ] Criar registro na tabela
- [ ] Retornar dados
- [ ] Tratar erros

---

## 🖥️ TELAS E COMPONENTES

### FASE 5: Página Principal

#### ✅ Página: `/frente-caixa`
**Descrição:** Tela principal do PDV

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🏪 FRENTE DE CAIXA - NFCe          Caixa: #001  |  Aberto      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌──────────────────────────────────┐   │
│  │ BUSCA PRODUTO   │    │ CARRINHO                          │   │
│  │ [___________]🔍 │    │ ┌──────────────────────────────┐ │   │
│  │                 │    │ │ 1x Produto A      R$ 50,00   │ │   │
│  │ Cliente:         │    │ │ 2x Produto B      R$ 80,00   │ │   │
│  │ [Cliente Avulso▼]│    │ └──────────────────────────────┘ │   │
│  │                 │    │                                  │   │
│  │ Natureza Op:     │    │ Total Produtos:      R$ 130,00  │   │
│  │ [Venda Consumidor]│   │ Desconto:            R$ 0,00    │   │
│  │                 │    │ ICMS:                 R$ 23,40   │   │
│  │ Indicador:      │    │ PIS:                  R$ 2,15    │   │
│  │ [Presencial▼]   │    │ COFINS:               R$ 9,88    │   │
│  │                 │    │ Total:                R$ 165,43  │   │
│  └─────────────────┘    │                                  │   │
│                          │ Forma Pagamento:                 │   │
│                          │ [💰 Dinheiro]                    │   │
│                          │                                  │   │
│                          │ Valor Recebido:                  │   │
│                          │ [R$ 200,00]                      │   │
│                          │                                  │   │
│                          │ Troco: R$ 34,57                 │   │
│                          │                                  │   │
│                          │ [FINALIZAR VENDA E EMITIR NFCe] │   │
│                          └──────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ VENDAS DE HOJE                                            │   │
│  │ ┌──────────────┬──────────┬──────────────┬──────────────┐ │   │
│  │ │ NFCe #001    │ R$ 165,43│ 15:30        │ ✅ Autorizada │ │   │
│  │ └──────────────┴──────────┴──────────────┴──────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Checklist:**
- [ ] Criar arquivo `/src/app/frente-caixa/page.tsx`
- [ ] Implementar layout responsivo
- [ ] Implementar busca de produtos
- [ ] Implementar seleção de cliente
- [ ] Implementar carrinho de compras
- [ ] Implementar cálculos automáticos
- [ ] Implementar seleção de forma de pagamento
- [ ] Implementar cálculo de troco
- [ ] Implementar histórico de vendas
- [ ] Implementar integração com APIs
- [ ] Implementar tratamento de erros
- [ ] Implementar loading states
- [ ] Implementar validações
- [ ] Implementar notificações

### FASE 6: Componentes

#### ✅ Componente: `HeaderCaixa`
**Descrição:** Exibe status do caixa (aberto/fechado)

**Props:**
```typescript
interface HeaderCaixaProps {
  caixa: {
    id: string;
    descricao: string;
    valorAbertura: number;
    dataAbertura: string;
    status: 'aberto' | 'fechado';
  } | null;
  onAbrirCaixa: () => void;
  onFecharCaixa: () => void;
}
```

**Checklist:**
- [ ] Criar componente `HeaderCaixa`
- [ ] Exibir status do caixa
- [ ] Exibir valor de abertura
- [ ] Botão para abrir caixa
- [ ] Botão para fechar caixa
- [ ] Badge de status (aberto/fechado)

#### ✅ Componente: `BuscaProduto`
**Descrição:** Busca rápida de produtos por código ou nome

**Props:**
```typescript
interface BuscaProdutoProps {
  onProdutoSelecionado: (produto: Produto) => void;
  placeholder?: string;
}
```

**Funcionalidades:**
- Busca por código de barras (Enter)
- Busca por nome (digitação)
- Lista de sugestões
- Seleção rápida

**Checklist:**
- [ ] Criar componente `BuscaProduto`
- [ ] Implementar busca por código
- [ ] Implementar busca por nome
- [ ] Implementar lista de sugestões
- [ ] Implementar seleção de produto
- [ ] Implementar loading state
- [ ] Tratar erros de busca

#### ✅ Componente: `ListaProdutosVenda`
**Descrição:** Carrinho de compras

**Props:**
```typescript
interface ListaProdutosVendaProps {
  itens: ItemVenda[];
  onRemoverItem: (itemId: string) => void;
  onAlterarQuantidade: (itemId: string, quantidade: number) => void;
  onAplicarDesconto: (itemId: string, desconto: number) => void;
}
```

**Funcionalidades:**
- Lista produtos adicionados
- Editar quantidade
- Aplicar desconto por item
- Remover item
- Calcular subtotais

**Checklist:**
- [ ] Criar componente `ListaProdutosVenda`
- [ ] Listar itens do carrinho
- [ ] Editar quantidade
- [ ] Aplicar desconto
- [ ] Remover item
- [ ] Calcular subtotais
- [ ] Atualizar totais automaticamente

#### ✅ Componente: `SelecaoCliente`
**Descrição:** Seleção rápida de cliente

**Props:**
```typescript
interface SelecaoClienteProps {
  cliente: Cliente | null;
  onClienteSelecionado: (cliente: Cliente | null) => void;
  onCriarClienteRapido: () => void;
}
```

**Funcionalidades:**
- Busca de clientes
- Opção "Cliente Avulso"
- Criar cliente rápido
- Preencher dados automaticamente

**Checklist:**
- [ ] Criar componente `SelecaoCliente`
- [ ] Implementar busca de clientes
- [ ] Opção cliente avulso
- [ ] Modal de criação rápida
- [ ] Preencher dados automaticamente

#### ✅ Componente: `FormaPagamento`
**Descrição:** Seleção de forma de pagamento

**Props:**
```typescript
interface FormaPagamentoProps {
  formasPagamento: FormaPagamento[];
  valorTotal: number;
  onFormaPagamentoSelecionada: (forma: FormaPagamento) => void;
  onValorRecebidoAlterado: (valor: number) => void;
}
```

**Funcionalidades:**
- Listar formas de pagamento
- Seleção de forma
- Campo valor recebido (se dinheiro)
- Cálculo de troco automático

**Checklist:**
- [ ] Criar componente `FormaPagamento`
- [ ] Listar formas disponíveis
- [ ] Seleção de forma
- [ ] Campo valor recebido
- [ ] Cálculo de troco
- [ ] Validação de valor mínimo

#### ✅ Componente: `ResumoVenda`
**Descrição:** Exibe totais e resumo da venda

**Props:**
```typescript
interface ResumoVendaProps {
  totais: {
    produtos: number;
    descontos: number;
    impostos: number;
    total: number;
  };
  valorRecebido?: number;
  valorTroco?: number;
}
```

**Checklist:**
- [ ] Criar componente `ResumoVenda`
- [ ] Exibir totais
- [ ] Exibir impostos detalhados
- [ ] Exibir valor recebido
- [ ] Exibir troco
- [ ] Formatação de moeda

#### ✅ Componente: `HistoricoVendas`
**Descrição:** Lista vendas do dia

**Checklist:**
- [ ] Criar componente `HistoricoVendas`
- [ ] Listar vendas do caixa
- [ ] Filtros por data
- [ ] Detalhes da venda
- [ ] Reimpressão de cupom
- [ ] Cancelamento de venda

#### ✅ Componente: `ModalAberturaCaixa`
**Descrição:** Modal para abrir caixa

**Checklist:**
- [ ] Criar componente `ModalAberturaCaixa`
- [ ] Campo descrição
- [ ] Campo valor de abertura
- [ ] Campo observações
- [ ] Validações
- [ ] Integração com API

#### ✅ Componente: `ModalFechamentoCaixa`
**Descrição:** Modal para fechar caixa

**Checklist:**
- [ ] Criar componente `ModalFechamentoCaixa`
- [ ] Exibir resumo de vendas
- [ ] Exibir totais por forma de pagamento
- [ ] Campo valor real
- [ ] Cálculo de diferença
- [ ] Campo observações
- [ ] Integração com API

#### ✅ Componente: `ModalVendaFinalizada`
**Descrição:** Modal após finalização da venda

**Checklist:**
- [ ] Criar componente `ModalVendaFinalizada`
- [ ] Exibir QR Code NFCe
- [ ] Exibir chave de acesso
- [ ] Botão imprimir cupom
- [ ] Botão enviar por email
- [ ] Botão nova venda

---

## 🔄 FLUXOS FUNCIONAIS

### FASE 7: Fluxo de Abertura de Caixa

```
1. Usuário acessa /frente-caixa
2. Sistema verifica se há caixa aberto (GET /api/caixa/status)
3. Se não houver caixa aberto:
   a. Exibir modal de abertura
   b. Solicitar valor inicial
   c. Opcional: descrição e observações
   d. Usuário confirma
   e. Sistema abre caixa (POST /api/caixa/abrir)
   f. Tela principal é liberada
4. Se houver caixa aberto:
   a. Exibir dados do caixa no header
   b. Tela principal é liberada imediatamente
```

**Checklist:**
- [ ] Implementar verificação de caixa aberto
- [ ] Implementar modal de abertura
- [ ] Implementar validações
- [ ] Implementar integração com API
- [ ] Implementar tratamento de erros
- [ ] Atualizar estado após abertura

### FASE 8: Fluxo de Venda

```
1. Buscar/Adicionar Cliente (opcional)
   a. Clicar em seleção de cliente
   b. Buscar cliente ou selecionar "Cliente Avulso"
   c. Preencher dados automaticamente

2. Adicionar Produtos
   a. Buscar produto por código/nome
   b. Selecionar produto
   c. Produto é adicionado ao carrinho
   d. Permitir editar quantidade
   e. Permitir aplicar desconto
   f. Repetir até finalizar

3. Selecionar Configurações
   a. Natureza de Operação (padrão para NFCe)
   b. Indicador de Presença (padrão: PRESENCIAL)

4. Calcular Impostos
   a. Automaticamente ao adicionar produtos
   b. Recalcular ao alterar quantidade/desconto
   c. Exibir impostos detalhados

5. Selecionar Forma de Pagamento
   a. Escolher forma de pagamento
   b. Se dinheiro: informar valor recebido
   c. Sistema calcula troco automaticamente

6. Finalizar Venda
   a. Validar dados obrigatórios
   b. Validar estoque (se aplicável)
   c. Chamar API para criar venda e emitir NFCe
   d. Aguardar resposta da emissão
   e. Exibir modal com QR Code e chave
   f. Opções: imprimir, enviar email, nova venda
   g. Limpar carrinho
```

**Checklist:**
- [ ] Implementar fluxo de seleção de cliente
- [ ] Implementar fluxo de adição de produtos
- [ ] Implementar cálculo de impostos
- [ ] Implementar seleção de forma de pagamento
- [ ] Implementar validações antes de finalizar
- [ ] Implementar chamada de API de venda
- [ ] Implementar tratamento de resposta NFCe
- [ ] Implementar modal de venda finalizada
- [ ] Implementar limpeza de carrinho

### FASE 9: Fluxo de Fechamento de Caixa

```
1. Usuário clica em "Fechar Caixa"
2. Sistema busca resumo do caixa (GET /api/caixa/resumo)
3. Exibir modal com:
   a. Lista de todas as vendas do dia
   b. Totais por forma de pagamento
   c. Total de sangrias
   d. Total de suprimentos
   e. Valor esperado
   f. Campo para valor real
   g. Cálculo de diferença
   h. Campo de observações
4. Usuário preenche valor real
5. Sistema calcula diferença
6. Usuário confirma fechamento
7. Sistema fecha caixa (POST /api/caixa/fechar)
8. Exibir relatório de fechamento
9. Bloquear novas vendas
```

**Checklist:**
- [ ] Implementar botão fechar caixa
- [ ] Implementar modal de fechamento
- [ ] Implementar busca de resumo
- [ ] Implementar exibição de totais
- [ ] Implementar cálculo de diferença
- [ ] Implementar confirmação
- [ ] Implementar chamada de API
- [ ] Implementar relatório de fechamento
- [ ] Implementar bloqueio de novas vendas

### FASE 10: Fluxo de Sangria/Suprimento

```
1. Usuário clica em "Sangria" ou "Suprimento"
2. Exibir modal com:
   a. Tipo (sangria/suprimento)
   b. Valor
   c. Descrição
   d. Forma de pagamento (opcional)
3. Usuário preenche dados
4. Sistema valida valor > 0
5. Sistema registra movimentação (POST /api/caixa/movimentacao)
6. Atualizar saldo do caixa
7. Fechar modal
```

**Checklist:**
- [ ] Implementar botões sangria/suprimento
- [ ] Implementar modal de movimentação
- [ ] Implementar validações
- [ ] Implementar chamada de API
- [ ] Implementar atualização de saldo

---

## 🔗 INTEGRAÇÕES

### FASE 11: Integração com Cadastros

**Checklist:**
- [ ] Buscar clientes da API `/api/cadastros`
- [ ] Filtrar apenas clientes (tiposCliente)
- [ ] Implementar busca rápida
- [ ] Preencher dados automaticamente
- [ ] Opção cliente avulso
- [ ] Criar cliente rápido (opcional)

### FASE 12: Integração com Produtos

**Checklist:**
- [ ] Buscar produtos da API `/api/produtos`
- [ ] Filtrar apenas produtos ativos
- [ ] Implementar busca por código de barras
- [ ] Implementar busca por nome
- [ ] Validar estoque disponível
- [ ] Mostrar alerta de estoque baixo
- [ ] Preencher dados do produto automaticamente

### FASE 13: Integração com Natureza de Operação

**Checklist:**
- [ ] Buscar naturezas da API `/api/natureza-operacao`
- [ ] Filtrar apenas habilitadas
- [ ] Filtrar por tipo 'cupom_fiscal' ou 'vendas'
- [ ] Selecionar natureza padrão
- [ ] Permitir seleção manual

### FASE 14: Integração com Formas de Pagamento

**Checklist:**
- [ ] Buscar formas de pagamento da API `/api/formas-pagamento`
- [ ] Filtrar apenas ativas
- [ ] Exibir formas disponíveis
- [ ] Mapear para meios de pagamento NFCe

### FASE 15: Integração com Configuração NFCe

**Checklist:**
- [ ] Buscar configurações da API `/api/configuracoes-nfe`
- [ ] Filtrar por modelo = '65'
- [ ] Filtrar por tipoModelo = 'nfce-consumidor'
- [ ] Filtrar apenas ativas
- [ ] Validar tokens preenchidos (idToken, cscToken)
- [ ] Usar configuração padrão ou permitir seleção

### FASE 16: Integração com Cálculo de Impostos

**Checklist:**
- [ ] Chamar API `/api/vendas/calcular-impostos`
- [ ] Enviar produtos, natureza, UF origem/destino
- [ ] Receber impostos calculados
- [ ] Atualizar totais automaticamente
- [ ] Exibir impostos detalhados

### FASE 17: Integração com Emissão NFCe

**Checklist:**
- [ ] Preparar dados NFCe
- [ ] Validar todos os campos obrigatórios
- [ ] Chamar API de emissão NFCe
- [ ] Aguardar resposta
- [ ] Salvar chave de acesso
- [ ] Salvar protocolo
- [ ] Gerar QR Code
- [ ] Atualizar status da venda

---

## ✅ VALIDAÇÕES

### FASE 18: Validações de Abertura de Caixa

**Checklist:**
- [ ] Verificar se não existe caixa aberto
- [ ] Validar valor de abertura >= 0
- [ ] Validar usuário autenticado
- [ ] Validar empresa selecionada

### FASE 19: Validações de Venda

**Checklist:**
- [ ] Validar caixa aberto
- [ ] Validar configuração NFCe ativa
- [ ] Validar tokens NFCe preenchidos
- [ ] Validar natureza de operação selecionada
- [ ] Validar indicador de presença selecionado
- [ ] Validar pelo menos 1 produto no carrinho
- [ ] Validar todos produtos com NCM
- [ ] Validar estoque disponível (se controla estoque)
- [ ] Validar valor total > 0
- [ ] Validar forma de pagamento selecionada
- [ ] Validar valor recebido >= total (se dinheiro)

### FASE 20: Validações de NFCe

**Checklist:**
- [ ] Modelo = 65
- [ ] Tipo modelo = 'nfce-consumidor'
- [ ] Consumidor final = true
- [ ] Indicador presença válido
- [ ] Todos produtos com NCM preenchido
- [ ] Todos produtos com CFOP válido
- [ ] Valores calculados corretamente
- [ ] Impostos calculados

### FASE 21: Validações de Fechamento

**Checklist:**
- [ ] Validar caixa aberto
- [ ] Validar valor real >= 0
- [ ] Validar que há vendas (opcional)
- [ ] Confirmar fechamento

---

## 📊 CHECKLIST GERAL DE IMPLEMENTAÇÃO

### ESTRUTURA DE BANCO DE DADOS
- [ ] Criar tabela `caixas`
- [ ] Criar tabela `vendas_caixa`
- [ ] Criar tabela `vendas_caixa_itens`
- [ ] Criar tabela `movimentacoes_caixa`
- [ ] Criar índices
- [ ] Criar foreign keys
- [ ] Criar triggers
- [ ] Criar migrations

### APIs BACKEND
- [ ] `GET /api/caixa/status`
- [ ] `POST /api/caixa/abrir`
- [ ] `POST /api/caixa/fechar`
- [ ] `GET /api/caixa/resumo`
- [ ] `POST /api/caixa/venda`
- [ ] `GET /api/caixa/vendas`
- [ ] `POST /api/caixa/cancelar-venda`
- [ ] `POST /api/caixa/movimentacao`

### TELAS FRONTEND
- [ ] Página `/frente-caixa`
- [ ] Layout responsivo
- [ ] Busca de produtos
- [ ] Seleção de cliente
- [ ] Carrinho de compras
- [ ] Cálculos automáticos
- [ ] Forma de pagamento
- [ ] Histórico de vendas

### COMPONENTES
- [ ] `HeaderCaixa`
- [ ] `BuscaProduto`
- [ ] `ListaProdutosVenda`
- [ ] `SelecaoCliente`
- [ ] `FormaPagamento`
- [ ] `ResumoVenda`
- [ ] `HistoricoVendas`
- [ ] `ModalAberturaCaixa`
- [ ] `ModalFechamentoCaixa`
- [ ] `ModalVendaFinalizada`

### INTEGRAÇÕES
- [ ] Cadastros
- [ ] Produtos
- [ ] Natureza de Operação
- [ ] Formas de Pagamento
- [ ] Configuração NFCe
- [ ] Cálculo de Impostos
- [ ] Emissão NFCe

### VALIDAÇÕES
- [ ] Validações de abertura
- [ ] Validações de venda
- [ ] Validações de NFCe
- [ ] Validações de fechamento

### TESTES
- [ ] Testes de abertura de caixa
- [ ] Testes de venda
- [ ] Testes de emissão NFCe
- [ ] Testes de fechamento
- [ ] Testes de validações
- [ ] Testes de integrações

### DOCUMENTAÇÃO
- [ ] Documentar APIs
- [ ] Documentar componentes
- [ ] Documentar fluxos
- [ ] Documentar validações
- [ ] Guia de uso

---

## 📝 NOTAS IMPORTANTES

### Configuração NFCe
- As configurações NFCe já estão disponíveis em `/configuracoes/nfe`
- Campos necessários: `idToken`, `cscToken`, `modelo` = '65'
- A frente de caixa deve buscar e usar essas configurações

### Emissão de NFCe
- Deve ser feita automaticamente ao finalizar venda
- Requer integração com API externa de NFe
- Gerar QR Code após autorização
- Salvar chave de acesso e protocolo

### Controle de Estoque
- Validar estoque antes de permitir venda
- Atualizar estoque após venda confirmada
- Considerar produtos que não controlam estoque

### Performance
- Buscar produtos com cache
- Buscar cadastros com cache
- Otimizar queries de resumo
- Implementar debounce em buscas

---

**Última atualização:** 2024-01-XX
**Status do projeto:** Em planejamento
**Próximos passos:** Iniciar FASE 1 - Estrutura de Banco de Dados
