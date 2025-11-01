import { Pool } from 'pg';

// Lazy initialization - só cria o pool quando necessário
// Isso evita tentativas de conexão durante o build/SSR
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    // Priorizar DATABASE_URL se disponível (para produção/Vercel)
    if (process.env.DATABASE_URL) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    } else {
      // Fallback para configuração manual (desenvolvimento local)
      pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.POSTGRES_USER || process.env.DB_USERNAME || 'postgres',
        password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'fenix123',
        database: process.env.POSTGRES_DB || process.env.DB_DATABASE || 'fenix',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }
  }
  return pool;
}

// Função para executar queries
export async function query(text: string, params?: any[]) {
  const pool = getPool();
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
  const pool = getPool();
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
    
    // Verificar se as tabelas CORE existem (users, companies, user_companies)
    const coreTablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'companies', 'user_companies')
    `);
    
    const existingCoreTables = coreTablesResult.rows.map(row => row.table_name);
    const requiredCoreTables = ['users', 'companies', 'user_companies'];
    const missingCoreTables = requiredCoreTables.filter(t => !existingCoreTables.includes(t));
    
    if (missingCoreTables.length > 0) {
      console.log('🔧 Tabelas core não encontradas:', missingCoreTables);
      console.log('🔧 Inicializando schema core...');
      
      // Ler e executar schema core
      const { readFileSync } = await import('fs');
      const { join } = await import('path');
      const schemaCorePath = join(process.cwd(), 'src', 'lib', 'schema-core.sql');
      const schemaCore = readFileSync(schemaCorePath, 'utf8');
      
      // Executar schema core
      await query(schemaCore);
      console.log('✅ Schema core inicializado com sucesso!');
    } else {
      console.log('✅ Tabelas core já existem:', existingCoreTables);
    }
    
    // Verificar se as tabelas financeiras existem
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('contas_financeiras', 'movimentacoes_financeiras')
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    if (existingTables.length < 2) {
      console.log('🔧 Tabelas financeiras não encontradas, inicializando schema financeiro...');
      const { initializeDatabase } = await import('./init-db');
      await initializeDatabase();
    } else {
      console.log('✅ Tabelas financeiras já existem:', existingTables);
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    throw error;
  }
}

// Exportar função para obter o pool (mantendo compatibilidade)
export default function getPoolInstance() {
  return getPool();
}
