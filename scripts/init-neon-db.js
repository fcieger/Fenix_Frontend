#!/usr/bin/env node

/**
 * Script para inicializar todas as tabelas no Neon
 * Execute: node scripts/init-neon-db.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// URL do banco Neon (configure aqui se necessário)
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_YjvLSX3d8JNM@ep-silent-mouse-ahjow0rn-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🚀 Conectando ao banco Neon...');
    
    // Testar conexão
    await pool.query('SELECT 1');
    console.log('✅ Conexão estabelecida!');

    // Ler schema completo
    const schemaPath = path.join(__dirname, '../src/lib/schema-completo.sql');
    console.log('📖 Lendo schema completo...');
    
    let schemaCompleto;
    try {
      schemaCompleto = fs.readFileSync(schemaPath, 'utf8');
      console.log('✅ Schema carregado!');
    } catch (error) {
      console.error('❌ Erro ao ler schema:', error.message);
      process.exit(1);
    }

    // Dividir por ; mas manter blocos DO $$ juntos
    // Primeiro, vamos processar blocos DO $$ separadamente
    let processedSchema = schemaCompleto;
    
    // Extrair blocos DO $$ ... END $$; e processá-los separadamente
    const doBlocks = [];
    const doBlockRegex = /DO\s+\$\$\s*[\s\S]*?END\s+\$\$\s*;/g;
    let match;
    let blockIndex = 0;
    
    while ((match = doBlockRegex.exec(schemaCompleto)) !== null) {
      doBlocks.push(match[0]);
      processedSchema = processedSchema.replace(match[0], `__DO_BLOCK_${blockIndex}__`);
      blockIndex++;
    }

    // Dividir o resto por ;
    let statements = processedSchema.split(';').filter(s => {
      const trimmed = s.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--');
    });

    // Substituir placeholders pelos blocos DO $$
    statements = statements.map(stmt => {
      let result = stmt;
      doBlocks.forEach((block, idx) => {
        result = result.replace(`__DO_BLOCK_${idx}__`, block);
      });
      return result;
    }).filter(s => s.trim().length > 0);

    console.log(`🔧 Executando ${statements.length} statements...`);

    let executedStatements = 0;
    let skippedStatements = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement.length > 0) {
        try {
          await pool.query(statement);
          executedStatements++;
          if ((i + 1) % 10 === 0) {
            console.log(`   Processando... ${i + 1}/${statements.length}`);
          }
        } catch (err) {
          if (
            err.message.includes('already exists') ||
            err.message.includes('duplicate') ||
            err.message.includes('relation already exists')
          ) {
            skippedStatements++;
          } else {
            errors.push({
              statement: statement.substring(0, 50),
              error: err.message.substring(0, 150)
            });
            console.warn(`⚠️ Erro no statement ${i + 1}:`, err.message.substring(0, 100));
          }
        }
      }
    }

    // Verificar tabelas criadas
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const createdTables = tablesResult.rows.map(row => row.table_name);

    console.log('\n✅ ============================================');
    console.log('✅ INICIALIZAÇÃO CONCLUÍDA!');
    console.log('✅ ============================================');
    console.log(`✅ Statements executados: ${executedStatements}`);
    console.log(`✅ Statements ignorados (já existiam): ${skippedStatements}`);
    console.log(`✅ Total de tabelas: ${createdTables.length}`);
    
    if (errors.length > 0) {
      console.log(`⚠️ Erros encontrados: ${errors.length}`);
    }

    console.log('\n📋 Tabelas criadas:');
    createdTables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });

    await pool.end();

    return {
      success: true,
      tablesCreated: createdTables.length,
      executedStatements,
      skippedStatements,
      errors,
      tables: createdTables
    };

  } catch (error) {
    console.error('\n❌ ============================================');
    console.error('❌ ERRO AO INICIALIZAR BANCO');
    console.error('❌ ============================================');
    console.error('Erro:', error.message);
    console.error('\nVerifique:');
    console.error('1. A DATABASE_URL está correta?');
    console.error('2. O Neon está acessível?');
    console.error('3. As credenciais estão corretas?');
    
    await pool.end();
    process.exit(1);
  }
}

// Executar
initializeDatabase()
  .then(result => {
    console.log('\n🎉 Processo finalizado com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });

