-- Adicionar coluna data_ultima_atualizacao na tabela contas_financeiras
-- Esta coluna é usada para rastrear quando o saldo foi atualizado pela última vez

-- Adicionar a coluna se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'contas_financeiras' 
    AND column_name = 'data_ultima_atualizacao'
  ) THEN
    ALTER TABLE contas_financeiras 
    ADD COLUMN data_ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    
    -- Atualizar registros existentes com a data atual
    UPDATE contas_financeiras 
    SET data_ultima_atualizacao = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
    WHERE data_ultima_atualizacao IS NULL;
    
    RAISE NOTICE 'Coluna data_ultima_atualizacao adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna data_ultima_atualizacao já existe.';
  END IF;
END $$;





