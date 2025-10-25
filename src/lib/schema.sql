-- Schema para o sistema de contas financeiras
-- Tabela de contas financeiras
CREATE TABLE IF NOT EXISTS contas_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  tipo_conta VARCHAR(50) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  banco_id VARCHAR(50) NOT NULL,
  banco_nome VARCHAR(255) NOT NULL,
  banco_codigo VARCHAR(10) NOT NULL,
  numero_agencia VARCHAR(20),
  numero_conta VARCHAR(50),
  tipo_pessoa VARCHAR(20) DEFAULT 'fisica',
  ultimos_4_digitos VARCHAR(4),
  bandeira_cartao VARCHAR(50),
  emissor_cartao VARCHAR(255),
  conta_padrao_pagamento VARCHAR(255),
  dia_fechamento INTEGER,
  dia_vencimento INTEGER,
  modalidade VARCHAR(20),
  conta_corrente_vinculada VARCHAR(255),
  saldo_inicial DECIMAL(15,2) DEFAULT 0.00,
  saldo_atual DECIMAL(15,2) DEFAULT 0.00,
  data_saldo DATE,
  data_abertura DATE NOT NULL DEFAULT CURRENT_DATE,
  data_ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ativo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID
);

-- Tabela de movimentações financeiras
CREATE TABLE IF NOT EXISTS movimentacoes_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id UUID NOT NULL REFERENCES contas_financeiras(id) ON DELETE CASCADE,
  tipo_movimentacao VARCHAR(20) NOT NULL,
  valor_entrada DECIMAL(15,2) DEFAULT 0.00,
  valor_saida DECIMAL(15,2) DEFAULT 0.00,
  descricao VARCHAR(255),
  data_movimentacao TIMESTAMP NOT NULL,
  saldo_anterior DECIMAL(15,2) NOT NULL,
  saldo_posterior DECIMAL(15,2) NOT NULL,
  conta_destino_id UUID REFERENCES contas_financeiras(id),
  categoria_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID
);

-- Tabela de centros de custos
CREATE TABLE IF NOT EXISTS centros_custos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  codigo VARCHAR(20) NOT NULL,
  descricao VARCHAR(200) NOT NULL,
  centro_pai_id UUID REFERENCES centros_custos(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_contas_company_id ON contas_financeiras(company_id);
CREATE INDEX IF NOT EXISTS idx_contas_tipo_conta ON contas_financeiras(tipo_conta);
CREATE INDEX IF NOT EXISTS idx_contas_status ON contas_financeiras(status);
CREATE INDEX IF NOT EXISTS idx_contas_banco_id ON contas_financeiras(banco_id);
CREATE INDEX IF NOT EXISTS idx_contas_data_abertura ON contas_financeiras(data_abertura);
CREATE INDEX IF NOT EXISTS idx_contas_saldo_atual ON contas_financeiras(saldo_atual);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_conta_id ON movimentacoes_financeiras(conta_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes_financeiras(data_movimentacao);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes_financeiras(tipo_movimentacao);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_conta_destino ON movimentacoes_financeiras(conta_destino_id);

CREATE INDEX IF NOT EXISTS idx_centros_custos_company_id ON centros_custos(company_id);
CREATE INDEX IF NOT EXISTS idx_centros_custos_pai ON centros_custos(centro_pai_id);
CREATE INDEX IF NOT EXISTS idx_centros_custos_codigo ON centros_custos(codigo);
CREATE INDEX IF NOT EXISTS idx_centros_custos_ativo ON centros_custos(ativo);

-- Constraints de validação
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_tipo_conta') THEN
    ALTER TABLE contas_financeiras ADD CONSTRAINT chk_tipo_conta 
    CHECK (tipo_conta IN ('conta_corrente', 'caixinha', 'cartao_credito', 'poupanca', 'investimento', 'aplicacao_automatica', 'outro_tipo'));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_status') THEN
    ALTER TABLE contas_financeiras ADD CONSTRAINT chk_status 
    CHECK (status IN ('ativo', 'inativo', 'suspenso'));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_tipo_pessoa') THEN
    ALTER TABLE contas_financeiras ADD CONSTRAINT chk_tipo_pessoa 
    CHECK (tipo_pessoa IN ('fisica', 'juridica'));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_dia_fechamento') THEN
    ALTER TABLE contas_financeiras ADD CONSTRAINT chk_dia_fechamento 
    CHECK (dia_fechamento IS NULL OR (dia_fechamento >= 1 AND dia_fechamento <= 31));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_dia_vencimento') THEN
    ALTER TABLE contas_financeiras ADD CONSTRAINT chk_dia_vencimento 
    CHECK (dia_vencimento IS NULL OR (dia_vencimento >= 1 AND dia_vencimento <= 31));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_modalidade') THEN
    ALTER TABLE contas_financeiras ADD CONSTRAINT chk_modalidade 
    CHECK (modalidade IS NULL OR modalidade IN ('pf', 'pj'));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_tipo_movimentacao') THEN
    ALTER TABLE movimentacoes_financeiras ADD CONSTRAINT chk_tipo_movimentacao 
    CHECK (tipo_movimentacao IN ('entrada', 'saida', 'transferencia'));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_valor_movimentacao') THEN
    ALTER TABLE movimentacoes_financeiras ADD CONSTRAINT chk_valor_movimentacao 
    CHECK (
      (valor_entrada > 0 AND valor_saida = 0) OR 
      (valor_entrada = 0 AND valor_saida > 0) OR
      (valor_entrada = 0 AND valor_saida = 0 AND tipo_movimentacao = 'transferencia')
    );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_valor_entrada_positivo') THEN
    ALTER TABLE movimentacoes_financeiras ADD CONSTRAINT chk_valor_entrada_positivo 
    CHECK (valor_entrada >= 0);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_valor_saida_positivo') THEN
    ALTER TABLE movimentacoes_financeiras ADD CONSTRAINT chk_valor_saida_positivo 
    CHECK (valor_saida >= 0);
  END IF;
END $$;

-- Constraints para centros de custos
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_codigo_centro_custo') THEN
    ALTER TABLE centros_custos ADD CONSTRAINT chk_codigo_centro_custo 
    CHECK (LENGTH(codigo) >= 2 AND LENGTH(codigo) <= 20);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_descricao_centro_custo') THEN
    ALTER TABLE centros_custos ADD CONSTRAINT chk_descricao_centro_custo 
    CHECK (LENGTH(descricao) >= 3 AND LENGTH(descricao) <= 200);
  END IF;
END $$;

-- Constraint para evitar referência circular
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_centro_pai_diferente') THEN
    ALTER TABLE centros_custos ADD CONSTRAINT chk_centro_pai_diferente 
    CHECK (id != centro_pai_id);
  END IF;
END $$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_contas_financeiras_updated_at ON contas_financeiras;
CREATE TRIGGER tr_contas_financeiras_updated_at
  BEFORE UPDATE ON contas_financeiras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_centros_custos_updated_at ON centros_custos;
CREATE TRIGGER tr_centros_custos_updated_at
  BEFORE UPDATE ON centros_custos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para inicializar saldo atual na criação da conta
CREATE OR REPLACE FUNCTION init_saldo_atual()
RETURNS TRIGGER AS $$
BEGIN
  -- Inicializar saldo_atual = saldo_inicial na criação
  NEW.saldo_atual = NEW.saldo_inicial;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_contas_init_saldo ON contas_financeiras;
CREATE TRIGGER tr_contas_init_saldo
  BEFORE INSERT ON contas_financeiras
  FOR EACH ROW
  EXECUTE FUNCTION init_saldo_atual();

-- Função para atualizar saldo atual nas movimentações
CREATE OR REPLACE FUNCTION update_saldo_atual()
RETURNS TRIGGER AS $$
DECLARE
  novo_saldo DECIMAL(15,2);
BEGIN
  -- Calcular novo saldo
  SELECT saldo_atual + COALESCE(NEW.valor_entrada, 0) - COALESCE(NEW.valor_saida, 0)
  INTO novo_saldo
  FROM contas_financeiras 
  WHERE id = NEW.conta_id;
  
  -- Atualizar saldo_atual da conta
  UPDATE contas_financeiras 
  SET saldo_atual = novo_saldo,
      data_ultima_atualizacao = CURRENT_TIMESTAMP
  WHERE id = NEW.conta_id;
  
  -- Atualizar saldo_apos_movimentacao na movimentação
  NEW.saldo_apos_movimentacao = novo_saldo;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_movimentacoes_update_saldo ON movimentacoes_financeiras;
CREATE TRIGGER tr_movimentacoes_update_saldo
  AFTER INSERT ON movimentacoes_financeiras
  FOR EACH ROW
  EXECUTE FUNCTION update_saldo_atual();
