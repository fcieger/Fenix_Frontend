import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from './database';

export async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando banco de dados...');
    
    // Ler o arquivo de schema
    const schemaPath = join(process.cwd(), 'src', 'lib', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Executar o schema
    await query(schema);
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    
    // Verificar se as tabelas foram criadas
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('contas_financeiras', 'movimentacoes_financeiras')
    `);
    
    console.log('📊 Tabelas criadas:', tablesResult.rows.map(row => row.table_name));
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

// Função para executar o script diretamente
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar script:', error);
      process.exit(1);
    });
}

