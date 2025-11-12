import { PoolClient } from './database';
import { applyOnce } from './migrations';

/**
 * Adiciona coluna saldo_atual se não existir
 */
export async function addSaldoAtualColumn(client: PoolClient) {
  await applyOnce(
    '2025-11-27_add_saldo_atual_column',
    `
    -- Verificar e adicionar coluna saldo_atual se não existir
    DO $$ 
    BEGIN
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
      END IF;
    END $$;
    `
  );
}


