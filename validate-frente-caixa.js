const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function validateFrenteCaixa() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'fenix123'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.POSTGRES_DB || 'fenix'}`,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : undefined,
  });

  try {
    console.log('🔍 VALIDAÇÃO COMPLETA: Checkbox "Frente de Caixa"\n');
    console.log('='.repeat(60));

    // 1. Verificar se a coluna existe no banco de dados
    console.log('\n1️⃣ VERIFICANDO BANCO DE DADOS:');
    console.log('-'.repeat(60));
    
    const columnCheck = await pool.query(`
      SELECT 
        column_name,
        data_type,
        column_default,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'natureza_operacao'
      AND column_name = 'frenteDeCaixa'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('❌ PROBLEMA: Coluna "frenteDeCaixa" NÃO existe na tabela natureza_operacao!');
      console.log('\n💡 SOLUÇÃO: Execute a migração para adicionar a coluna.');
    } else {
      const col = columnCheck.rows[0];
      console.log('✅ Coluna "frenteDeCaixa" EXISTE na tabela');
      console.log(`   Tipo de dados: ${col.data_type}`);
      console.log(`   Valor padrão: ${col.column_default || 'NULL'}`);
      console.log(`   Pode ser NULL: ${col.is_nullable}`);
    }

    // 2. Verificar índices relacionados
    console.log('\n2️⃣ VERIFICANDO ÍNDICES:');
    console.log('-'.repeat(60));
    
    const indexCheck = await pool.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'natureza_operacao'
      AND indexname LIKE '%frente%'
    `);

    if (indexCheck.rows.length === 0) {
      console.log('ℹ️  Nenhum índice específico para "frenteDeCaixa" encontrado');
    } else {
      console.log('✅ Índices encontrados:');
      indexCheck.rows.forEach(idx => {
        console.log(`   - ${idx.indexname}`);
      });
    }

    // 3. Verificar dados existentes
    console.log('\n3️⃣ VERIFICANDO DADOS EXISTENTES:');
    console.log('-'.repeat(60));
    
    const dataCheck = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT("frenteDeCaixa") as com_valor,
        SUM(CASE WHEN "frenteDeCaixa" = true THEN 1 ELSE 0 END) as marcados,
        SUM(CASE WHEN "frenteDeCaixa" = false THEN 1 ELSE 0 END) as desmarcados,
        SUM(CASE WHEN "frenteDeCaixa" IS NULL THEN 1 ELSE 0 END) as nulos
      FROM natureza_operacao
    `);

    if (dataCheck.rows.length > 0) {
      const stats = dataCheck.rows[0];
      console.log(`   Total de naturezas: ${stats.total}`);
      console.log(`   Com valor definido: ${stats.com_valor}`);
      console.log(`   Marcadas (true): ${stats.marcados}`);
      console.log(`   Desmarcadas (false): ${stats.desmarcados}`);
      console.log(`   NULL: ${stats.nulos}`);
    }

    // 4. Exemplo de natureza com frenteDeCaixa marcado
    console.log('\n4️⃣ EXEMPLO DE NATUREZAS COM FRENTE DE CAIXA MARCADO:');
    console.log('-'.repeat(60));
    
    const exemploCheck = await pool.query(`
      SELECT 
        id,
        nome,
        cfop,
        "frenteDeCaixa",
        typeof("frenteDeCaixa") as tipo_valor
      FROM natureza_operacao
      WHERE "frenteDeCaixa" = true
      LIMIT 5
    `);

    if (exemploCheck.rows.length === 0) {
      console.log('ℹ️  Nenhuma natureza encontrada com "frenteDeCaixa" = true');
    } else {
      console.log(`✅ ${exemploCheck.rows.length} natureza(s) com "frenteDeCaixa" marcado:`);
      exemploCheck.rows.forEach(nat => {
        console.log(`   - ${nat.nome} (${nat.cfop}): ${nat.frenteDeCaixa} [${nat.tipo_valor || typeof nat.frenteDeCaixa}]`);
      });
    }

    // 5. Verificar estrutura completa da tabela
    console.log('\n5️⃣ ESTRUTURA COMPLETA DA TABELA:');
    console.log('-'.repeat(60));
    
    const tableStructure = await pool.query(`
      SELECT 
        column_name,
        data_type,
        column_default,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'natureza_operacao'
      ORDER BY ordinal_position
    `);

    console.log('   Colunas da tabela natureza_operacao:');
    tableStructure.rows.forEach(col => {
      const isRelevant = col.column_name.toLowerCase().includes('frente') || 
                        col.column_name.toLowerCase().includes('config') ||
                        col.column_name === 'considerarOperacaoComoFaturamento' ||
                        col.column_name === 'destacarTotalImpostosIBPT' ||
                        col.column_name === 'gerarContasReceberPagar';
      
      if (isRelevant) {
        console.log(`   ✅ ${col.column_name}: ${col.data_type} (padrão: ${col.column_default || 'NULL'})`);
      }
    });

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO:');
    console.log('='.repeat(60));
    
    if (columnCheck.rows.length > 0) {
      console.log('✅ Coluna "frenteDeCaixa" EXISTE no banco de dados');
      
      const stats = dataCheck.rows[0];
      if (parseInt(stats.marcados) > 0) {
        console.log(`✅ Há ${stats.marcados} natureza(s) com "frenteDeCaixa" marcado`);
      } else {
        console.log('⚠️  Nenhuma natureza tem "frenteDeCaixa" marcado ainda');
      }
      
      console.log('\n✅ VALIDAÇÃO DO BANCO: OK');
    } else {
      console.log('❌ Coluna "frenteDeCaixa" NÃO existe no banco de dados');
      console.log('\n❌ VALIDAÇÃO DO BANCO: FALHOU');
      console.log('\n💡 Execute a migração em src/lib/migrations.ts');
    }

  } catch (error) {
    console.error('❌ Erro ao validar:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Verifique se o banco de dados está rodando');
    }
  } finally {
    await pool.end();
  }
}

validateFrenteCaixa();








