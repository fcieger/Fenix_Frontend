import { Pool } from 'pg';

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.POSTGRES_USER || process.env.DB_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'fenix123',
  database: process.env.POSTGRES_DB || process.env.DB_DATABASE || 'fenix',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Função para executar queries
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Função para executar transações
export async function transaction(callback: (client: any) => Promise<any>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Função para verificar se as tabelas existem e inicializar se necessário
export async function initializeTables() {
  try {
    // Verificar conexão
    await query('SELECT 1');
    console.log('✅ Conexão com banco de dados estabelecida');
    
    // Verificar se as tabelas existem
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('contas_financeiras', 'movimentacoes_financeiras')
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    if (existingTables.length < 2) {
      console.log('🔧 Tabelas não encontradas, inicializando schema...');
      const { initializeDatabase } = await import('./init-db');
      await initializeDatabase();
    } else {
      console.log('✅ Tabelas já existem:', existingTables);
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    throw error;
  }
}

export default pool;
