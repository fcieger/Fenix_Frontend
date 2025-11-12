// Script para testar diretamente no banco de dados
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/fenix'
});

async function testar() {
  try {
    const companyId = 'eb198f2a-a95b-413a-abb9-464e3b7af303'; // Ajustar se necessário
    const dataInicio = '2025-11-01';
    const dataFim = '2025-11-30';

    console.log('🔍 Testando diretamente no banco de dados...');
    console.log('Company ID:', companyId);
    console.log('Período:', dataInicio, 'a', dataFim);
    console.log('');

    // 1. Contar títulos pendentes total
    const result1 = await pool.query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status = 'pendente'`,
      [companyId]
    );
    console.log('📊 Títulos pendentes (TOTAL):', result1.rows[0].total);

    // 2. Contar títulos pendentes no período
    const result2 = await pool.query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status = 'pendente'
         AND DATE(p.data_vencimento) >= $2::date
         AND DATE(p.data_vencimento) <= $3::date`,
      [companyId, dataInicio, dataFim]
    );
    console.log('📊 Títulos pendentes (NO PERÍODO):', result2.rows[0].total);

    // 3. Listar títulos pendentes no período
    const result3 = await pool.query(
      `SELECT 
         p.id,
         p.status,
         p.data_vencimento,
         p.valor_parcela,
         cr.titulo,
         p.titulo_parcela
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status = 'pendente'
         AND DATE(p.data_vencimento) >= $2::date
         AND DATE(p.data_vencimento) <= $3::date
       ORDER BY p.data_vencimento DESC`,
      [companyId, dataInicio, dataFim]
    );
    
    console.log('');
    console.log('📋 TÍTULOS PENDENTES NO PERÍODO:');
    result3.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.titulo} - ${row.titulo_parcela}`);
      console.log(`      ID: ${row.id}`);
      console.log(`      Vencimento: ${row.data_vencimento}`);
      console.log(`      Valor: R$ ${parseFloat(row.valor_parcela || 0).toFixed(2)}`);
      console.log('');
    });

    // 4. Testar query do fluxo de caixa (com tipo_data = vencimento)
    const condicaoData = 'DATE(p.data_vencimento)';
    const result4 = await pool.query(
      `SELECT 
         'conta_receber'::text as origem_tipo,
         p.id::text as parcela_id,
         ${condicaoData} as data,
         p.status,
         p.valor_parcela as valor_entrada
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status IN ('pago', 'pendente')
         AND (${condicaoData}) >= $2::date
         AND (${condicaoData}) <= $3::date
       ORDER BY data ASC`,
      [companyId, dataInicio, dataFim]
    );

    console.log('📊 Títulos encontrados pela query do fluxo (tipo_data=vencimento):', result4.rows.length);
    if (result4.rows.length > 0) {
      console.log('   Primeiros 5:');
      result4.rows.slice(0, 5).forEach((row, index) => {
        console.log(`      ${index + 1}. Data: ${row.data}, Status: ${row.status}, Valor: R$ ${parseFloat(row.valor_entrada || 0).toFixed(2)}`);
      });
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    await pool.end();
    process.exit(1);
  }
}

testar();


