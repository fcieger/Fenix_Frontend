const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://neondb_owner:npg_YjvLSX3d8JNM@ep-silent-mouse-ahjow0rn-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function runFinancialSchema() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📖 Lendo schema financeiro...');
    const schemaPath = path.join(__dirname, '../src/lib/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    const statements = schema.split(';').filter(s => {
      const trimmed = s.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--');
    });

    console.log(`🔧 Executando ${statements.length} statements...`);
    
    let ok = 0;
    let err = 0;
    
    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (trimmed.length > 0) {
        try {
          await pool.query(trimmed);
          ok++;
        } catch (e) {
          if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
            err++;
            console.warn('⚠️', e.message.substring(0, 100));
          }
        }
      }
    }

    console.log(`\n✅ Schema financeiro: ${ok} OK, ${err} erros ignorados`);
    
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`\n📊 Total final: ${result.rows.length} tabelas`);
    result.rows.forEach((t, i) => console.log(`   ${i + 1}. ${t.table_name}`));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runFinancialSchema();

