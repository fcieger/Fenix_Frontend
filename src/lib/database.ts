import { Pool } from 'pg';

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'fenix_user',
  password: process.env.DB_PASSWORD || 'fenix_password',
  database: process.env.DB_DATABASE || 'fenix_db',
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

// Função para verificar se as tabelas existem (elas já existem no banco)
export async function initializeTables() {
  try {
    // As tabelas já existem no banco, apenas verificar conexão
    await query('SELECT 1');
    console.log('✅ Conexão com banco de dados estabelecida');
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    throw error;
  }
}

export default pool;
