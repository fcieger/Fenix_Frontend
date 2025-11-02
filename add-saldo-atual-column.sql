-- Migração para adicionar coluna saldo_atual se não existir
DO $$ 
BEGIN
  -- Verificar se a coluna saldo_atual existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contas_financeiras' 
    AND column_name = 'saldo_atual'
  ) THEN
    -- Adicionar a coluna saldo_atual
    ALTER TABLE contas_financeiras 
    ADD COLUMN saldo_atual DECIMAL(15,2) DEFAULT 0.00;
    
    -- Atualizar saldo_atual com saldo_inicial para todas as contas existentes
    UPDATE contas_financeiras 
    SET saldo_atual = COALESCE(saldo_inicial, 0)
    WHERE saldo_atual IS NULL;
    
    RAISE NOTICE 'Coluna saldo_atual adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna saldo_atual já existe.';
  END IF;
END $$;
