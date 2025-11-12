// Script para verificar produtos no banco de dados
const { Pool } = require('pg');

function getPool() {
  // Priorizar DATABASE_URL se disponível (para produção/Vercel)
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : undefined,
    });
  } else {
    // Fallback para configuração manual (desenvolvimento local)
    return new Pool({
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

const pool = getPool();

async function verificarProdutos() {
  try {
    console.log('🔍 Verificando produtos no banco de dados...\n');

    // 1. Verificar se a tabela existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'produtos'
      ) as existe
    `);
    
    console.log('📊 Tabela produtos existe:', tableCheck.rows[0]?.existe || false);
    console.log('');

    if (!tableCheck.rows[0]?.existe) {
      console.log('❌ Tabela produtos não existe no banco de dados!');
      await pool.end();
      return;
    }

    // 2. Verificar estrutura da tabela
    const tableStructure = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'produtos'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estrutura da tabela produtos:');
    tableStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    console.log('');

    const hasIsActive = tableStructure.rows.some(col => col.column_name === 'isActive');
    const hasAtivo = tableStructure.rows.some(col => col.column_name === 'ativo');
    const hasSku = tableStructure.rows.some(col => col.column_name === 'sku');
    
    // Determinar qual campo usar para ativo
    let isActiveFilter = 'TRUE';
    if (hasIsActive) {
      isActiveFilter = '("isActive" IS NULL OR "isActive" = true)';
    } else if (hasAtivo) {
      isActiveFilter = '(ativo IS NULL OR ativo = true)';
    }
    
    // Determinar qual campo usar para código
    const codigoField = hasSku ? 'sku' : 'codigo';
    console.log(`📝 Usando campo '${codigoField}' para código e filtro '${isActiveFilter}' para ativos\n`);

    // 3. Contar total de produtos
    const countTotal = await pool.query(`
      SELECT COUNT(*) as total
      FROM produtos
      WHERE ${isActiveFilter}
        AND ${codigoField} IS NOT NULL
        AND TRIM(${codigoField}) != ''
    `);
    
    console.log('📊 Total de produtos ativos:', countTotal.rows[0]?.total || 0);
    console.log('');

    // 4. Listar todos os produtos (primeiros 10)
    const allProducts = await pool.query(`
      SELECT 
        id,
        "companyId",
        ${codigoField} as codigo,
        nome,
        LENGTH(${codigoField}) as codigo_length,
        TRIM(${codigoField}) as codigo_trim
      FROM produtos
      WHERE ${isActiveFilter}
        AND ${codigoField} IS NOT NULL
      ORDER BY "createdAt" DESC NULLS LAST
      LIMIT 10
    `);
    
    console.log('📦 Primeiros 10 produtos encontrados:');
    allProducts.rows.forEach((produto, index) => {
      console.log(`  ${index + 1}. Código: "${produto.codigo}" (length: ${produto.codigo_length}, trim: "${produto.codigo_trim}") | Nome: ${produto.nome}`);
      console.log(`     CompanyId: ${produto.companyId}`);
    });
    console.log('');

    // 5. Buscar especificamente por código "1"
    const searchForOne = await pool.query(`
      SELECT 
        id,
        ${codigoField} as codigo,
        nome,
        "companyId",
        LENGTH(${codigoField}) as codigo_length,
        TRIM(${codigoField}) as codigo_trim,
        ${codigoField}::text as codigo_text
      FROM produtos
      WHERE ${isActiveFilter}
        AND ${codigoField} IS NOT NULL
        AND (
          ${codigoField} = $1 OR
          ${codigoField}::text = $1 OR
          TRIM(${codigoField}) = $1 OR
          TRIM(COALESCE(${codigoField}, '')) = $1
        )
    `, ['1']);
    
    console.log(`🔍 Produtos encontrados com código "1": ${searchForOne.rows.length}`);
    if (searchForOne.rows.length > 0) {
      searchForOne.rows.forEach((produto, index) => {
        console.log(`  ${index + 1}. ID: ${produto.id}`);
        console.log(`     Código: "${produto.codigo}" (type: ${typeof produto.codigo})`);
        console.log(`     Código Length: ${produto.codigo_length}`);
        console.log(`     Código Trim: "${produto.codigo_trim}"`);
        console.log(`     Código Text: "${produto.codigo_text}"`);
        console.log(`     Nome: ${produto.nome}`);
        console.log(`     CompanyId: ${produto.companyId}`);
        console.log('');
      });
    } else {
      console.log('  ❌ Nenhum produto encontrado com código exato "1"');
      console.log('');
    }

    // 6. Listar códigos únicos (primeiros 20)
    const uniqueCodes = await pool.query(`
      SELECT DISTINCT 
        ${codigoField} as codigo,
        LENGTH(${codigoField}) as length,
        TRIM(${codigoField}) as trimmed,
        COUNT(*) as count
      FROM produtos
      WHERE ${isActiveFilter}
        AND ${codigoField} IS NOT NULL
      GROUP BY ${codigoField}
      ORDER BY ${codigoField}
      LIMIT 20
    `);
    
    console.log('📋 Primeiros 20 códigos únicos encontrados:');
    uniqueCodes.rows.forEach((code, index) => {
      const matchesOne = code.codigo === '1' || code.trimmed === '1';
      console.log(`  ${index + 1}. "${code.codigo}" (length: ${code.length}, trim: "${code.trimmed}") [${code.count} produto(s)] ${matchesOne ? '← MATCH!' : ''}`);
    });
    console.log('');

    // 7. Verificar produtos por companyId específico (se houver)
    const companies = await pool.query(`
      SELECT DISTINCT "companyId", COUNT(*) as total
      FROM produtos
      WHERE ${isActiveFilter}
        AND ${codigoField} IS NOT NULL
      GROUP BY "companyId"
      ORDER BY total DESC
      LIMIT 5
    `);
    
    console.log('🏢 Produtos por empresa:');
    for (const company of companies.rows) {
      console.log(`  ${company.companyId}: ${company.total} produto(s)`);
      
      // Buscar código "1" nesta empresa
      try {
        const result = await pool.query(`
          SELECT ${codigoField} as codigo, nome
          FROM produtos
          WHERE "companyId" = $1::uuid
            AND ${isActiveFilter}
            AND (
              ${codigoField} = '1' OR
              ${codigoField}::text = '1' OR
              TRIM(${codigoField}) = '1'
            )
          LIMIT 5
        `, [company.companyId]);
        
        if (result.rows.length > 0) {
          console.log(`     ✅ Encontrado código "1" nesta empresa:`);
          result.rows.forEach(p => {
            console.log(`        - "${p.codigo}" | ${p.nome}`);
          });
        } else {
          console.log(`     ❌ Nenhum código "1" nesta empresa`);
        }
      } catch (err) {
        console.log(`     ⚠️ Erro ao buscar: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar produtos:', error);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

verificarProdutos();

