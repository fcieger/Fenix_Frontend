// Script para testar validação do fluxo de caixa usando as mesmas funções do projeto
import { query } from '../src/lib/database';
import { buscarDadosUnificados } from '../src/services/fluxo-caixa-service';

async function testar() {
  try {
    const companyId = process.env.COMPANY_ID || 'eb198f2a-a95b-413a-abb9-464e3b7af303';
    const dataInicio = new Date('2025-11-01');
    const dataFim = new Date('2025-11-30');

    console.log('🔍 Testando validação do fluxo de caixa...');
    console.log('Company ID:', companyId);
    console.log('Período:', dataInicio.toISOString().split('T')[0], 'a', dataFim.toISOString().split('T')[0]);
    console.log('');

    // 1. Contar títulos pendentes total
    const result1 = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status = 'pendente'`,
      [companyId]
    );
    const totalPendentesGeral = parseInt(result1.rows[0]?.total || '0');
    console.log('📊 Títulos pendentes (TOTAL no banco):', totalPendentesGeral);

    // 2. Contar títulos pendentes no período
    const result2 = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status = 'pendente'
         AND DATE(p.data_vencimento) >= $2::date
         AND DATE(p.data_vencimento) <= $3::date`,
      [companyId, dataInicio, dataFim]
    );
    const totalPendentesPeriodo = parseInt(result2.rows[0]?.total || '0');
    console.log('📊 Títulos pendentes (NO PERÍODO):', totalPendentesPeriodo);

    // 3. Listar títulos pendentes no período
    const result3 = await query(
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
    if (result3.rows.length === 0) {
      console.log('   Nenhum título encontrado no período!');
    } else {
      result3.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.titulo} - ${row.titulo_parcela}`);
        console.log(`      ID: ${row.id}`);
        console.log(`      Vencimento: ${row.data_vencimento}`);
        console.log(`      Valor: R$ ${parseFloat(row.valor_parcela || 0).toFixed(2)}`);
        console.log('');
      });
    }

    // 4. Buscar dados do fluxo de caixa
    console.log('');
    console.log('🔍 Buscando dados do fluxo de caixa...');
    const dadosFluxoCaixa = await buscarDadosUnificados({
      company_id: companyId,
      data_inicio: dataInicio.toISOString().split('T')[0],
      data_fim: dataFim.toISOString().split('T')[0],
      tipo_data: 'vencimento',
      status: 'todos',
      incluir_historico_pagas: false
    });

    const crNoFluxo = dadosFluxoCaixa.filter(d => d.origem_tipo === 'conta_receber');
    const crPendentesNoFluxo = crNoFluxo.filter(d => d.status === 'pendente');

    console.log('📊 Títulos no fluxo de caixa (TOTAL):', crNoFluxo.length);
    console.log('📊 Títulos PENDENTES no fluxo de caixa:', crPendentesNoFluxo.length);
    console.log('');

    // 5. Comparação
    const diferenca = totalPendentesPeriodo - crPendentesNoFluxo.length;
    console.log('📊 COMPARAÇÃO:');
    console.log(`   No banco (período): ${totalPendentesPeriodo}`);
    console.log(`   No fluxo de caixa: ${crPendentesNoFluxo.length}`);
    console.log(`   Diferença: ${diferenca}`);
    
    if (diferenca > 0) {
      console.log(`   ⚠️ ${diferenca} títulos estão faltando no fluxo de caixa!`);
      
      // Identificar quais estão faltando
      const idsNoFluxo = new Set(crPendentesNoFluxo.map(d => d.parcela_id));
      const titulosFaltando = result3.rows.filter(r => !idsNoFluxo.has(r.id));
      
      if (titulosFaltando.length > 0) {
        console.log('');
        console.log('   TÍTULOS FALTANDO NO FLUXO:');
        titulosFaltando.forEach((titulo, index) => {
          console.log(`   ${index + 1}. ${titulo.titulo} - ${titulo.titulo_parcela}`);
          console.log(`      ID: ${titulo.id}`);
          console.log(`      Vencimento: ${titulo.data_vencimento}`);
          console.log(`      Valor: R$ ${parseFloat(titulo.valor_parcela || 0).toFixed(2)}`);
        });
      }
    } else if (diferenca < 0) {
      console.log(`   ⚠️ ${Math.abs(diferenca)} títulos extras no fluxo de caixa!`);
    } else {
      console.log(`   ✅ OK! Todos os títulos estão no fluxo de caixa.`);
    }

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testar();


