const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const naturezaId = '979411f7-aa1f-433e-b8f0-f04bf435e2dc';

async function checkNaturezaFrenteCaixa() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'fenix123'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.POSTGRES_DB || 'fenix'}`,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : undefined,
  });

  try {
    console.log('🔍 Verificando natureza:', naturezaId);
    console.log('');

    // Verificar se a natureza existe e buscar todos os campos relevantes
    const result = await pool.query(`
      SELECT 
        id,
        nome,
        cfop,
        tipo,
        "movimentaEstoque",
        habilitado,
        "frenteDeCaixa",
        "considerarOperacaoComoFaturamento",
        "destacarTotalImpostosIBPT",
        "gerarContasReceberPagar",
        "tipoDataContasReceberPagar",
        "informacoesAdicionaisFisco",
        "informacoesAdicionaisContribuinte",
        "createdAt",
        "updatedAt"
      FROM natureza_operacao
      WHERE id = $1::uuid
    `, [naturezaId]);

    if (result.rows.length === 0) {
      console.log('❌ Natureza não encontrada no banco de dados');
      return;
    }

    const natureza = result.rows[0];
    
    console.log('✅ Natureza encontrada:');
    console.log('   Nome:', natureza.nome);
    console.log('   CFOP:', natureza.cfop);
    console.log('   Tipo:', natureza.tipo);
    console.log('');
    console.log('📋 Configurações:');
    console.log('   frenteDeCaixa:', natureza.frenteDeCaixa, `(${typeof natureza.frenteDeCaixa})`);
    console.log('   considerarOperacaoComoFaturamento:', natureza.considerarOperacaoComoFaturamento, `(${typeof natureza.considerarOperacaoComoFaturamento})`);
    console.log('   destacarTotalImpostosIBPT:', natureza.destacarTotalImpostosIBPT, `(${typeof natureza.destacarTotalImpostosIBPT})`);
    console.log('   gerarContasReceberPagar:', natureza.gerarContasReceberPagar, `(${typeof natureza.gerarContasReceberPagar})`);
    console.log('');
    console.log('📊 Status:');
    console.log('   habilitado:', natureza.habilitado);
    console.log('   movimentaEstoque:', natureza.movimentaEstoque);
    console.log('');
    console.log('🕐 Datas:');
    console.log('   Criado em:', natureza.createdAt);
    console.log('   Atualizado em:', natureza.updatedAt);
    console.log('');

    // Verificar se frenteDeCaixa está salvo
    const frenteDeCaixaValue = natureza.frenteDeCaixa;
    const isFrenteDeCaixaTrue = frenteDeCaixaValue === true || frenteDeCaixaValue === 'true' || frenteDeCaixaValue === 1;
    
    if (isFrenteDeCaixaTrue) {
      console.log('✅ SUCESSO: O checkbox "Frente de Caixa" ESTÁ MARCADO no banco de dados');
    } else {
      console.log('❌ PROBLEMA: O checkbox "Frente de Caixa" NÃO ESTÁ MARCADO no banco de dados');
      console.log('   Valor encontrado:', frenteDeCaixaValue);
      console.log('   Tipo:', typeof frenteDeCaixaValue);
    }

    // Verificar estrutura da tabela
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'natureza_operacao'
      AND column_name = 'frenteDeCaixa'
    `);

    console.log('');
    console.log('🗂️  Estrutura da coluna frenteDeCaixa:');
    if (columnsResult.rows.length > 0) {
      console.log('   Coluna existe:', true);
      console.log('   Tipo de dados:', columnsResult.rows[0].data_type);
      console.log('   Valor padrão:', columnsResult.rows[0].column_default);
    } else {
      console.log('   ❌ Coluna frenteDeCaixa não existe na tabela!');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar natureza:', error);
  } finally {
    await pool.end();
  }
}

checkNaturezaFrenteCaixa();






