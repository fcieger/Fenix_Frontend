// Script para debugar diferença entre títulos em aberto e fluxo de caixa
import { query } from '../src/lib/database';
import { buscarDadosUnificados } from '../src/services/fluxo-caixa-service';

async function debugar() {
  try {
    const companyId = process.env.COMPANY_ID || 'eb198f2a-a95b-413a-abb9-464e3b7af303';
    
    console.log('🔍 === DEBUG: Títulos em Aberto vs Fluxo de Caixa ===\n');
    console.log('Company ID:', companyId);
    console.log('');

    // 1. Buscar TODOS os títulos pendentes (sem filtro de data)
    console.log('1️⃣ Buscando TODOS os títulos pendentes no banco...');
    const todosPendentesCR = await query(
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
       ORDER BY p.data_vencimento ASC`,
      [companyId]
    );

    const todosPendentesCP = await query(
      `SELECT 
         p.id,
         p.status,
         p.data_vencimento,
         p.valor_parcela,
         cp.titulo,
         p.titulo_parcela
       FROM parcelas_contas_pagar p
       INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
       WHERE cp.company_id = $1::uuid
         AND p.status = 'pendente'
       ORDER BY p.data_vencimento ASC`,
      [companyId]
    );

    console.log(`   ✅ Contas a Receber: ${todosPendentesCR.rows.length} títulos pendentes`);
    console.log(`   ✅ Contas a Pagar: ${todosPendentesCP.rows.length} títulos pendentes`);
    console.log(`   📊 TOTAL: ${todosPendentesCR.rows.length + todosPendentesCP.rows.length} títulos pendentes\n`);

    // 2. Verificar períodos dos títulos
    if (todosPendentesCR.rows.length > 0) {
      const primeiraData = new Date(todosPendentesCR.rows[0].data_vencimento);
      const ultimaData = new Date(todosPendentesCR.rows[todosPendentesCR.rows.length - 1].data_vencimento);
      console.log('   📅 Contas a Receber - Período:');
      console.log(`      Primeira vencimento: ${primeiraData.toISOString().split('T')[0]}`);
      console.log(`      Última vencimento: ${ultimaData.toISOString().split('T')[0]}\n`);
    }

    if (todosPendentesCP.rows.length > 0) {
      const primeiraData = new Date(todosPendentesCP.rows[0].data_vencimento);
      const ultimaData = new Date(todosPendentesCP.rows[todosPendentesCP.rows.length - 1].data_vencimento);
      console.log('   📅 Contas a Pagar - Período:');
      console.log(`      Primeira vencimento: ${primeiraData.toISOString().split('T')[0]}`);
      console.log(`      Última vencimento: ${ultimaData.toISOString().split('T')[0]}\n`);
    }

    // 3. Testar fluxo de caixa para novembro 2025
    console.log('2️⃣ Testando fluxo de caixa para Novembro 2025...');
    const dataInicio = new Date('2025-11-01');
    const dataFim = new Date('2025-11-30');
    
    const dadosNov = await buscarDadosUnificados({
      company_id: companyId,
      data_inicio: dataInicio.toISOString().split('T')[0],
      data_fim: dataFim.toISOString().split('T')[0],
      tipo_data: 'vencimento',
      status: 'todos',
      incluir_historico_pagas: false
    });

    const crNoNov = dadosNov.filter(d => d.origem_tipo === 'conta_receber');
    const cpNoNov = dadosNov.filter(d => d.origem_tipo === 'conta_pagar');
    const crPendentesNoNov = crNoNov.filter(d => d.status === 'pendente');
    const cpPendentesNoNov = cpNoNov.filter(d => d.status === 'pendente');

    console.log(`   📊 Nov/2025 - Contas a Receber:`);
    console.log(`      Total: ${crNoNov.length} (${crPendentesNoNov.length} pendentes)`);
    console.log(`   📊 Nov/2025 - Contas a Pagar:`);
    console.log(`      Total: ${cpNoNov.length} (${cpPendentesNoNov.length} pendentes)\n`);

    // 4. Comparar com títulos pendentes em novembro
    const pendentesCRNov = todosPendentesCR.rows.filter(r => {
      const dataVen = new Date(r.data_vencimento);
      return dataVen >= dataInicio && dataVen <= dataFim;
    });
    const pendentesCPNov = todosPendentesCP.rows.filter(r => {
      const dataVen = new Date(r.data_vencimento);
      return dataVen >= dataInicio && dataVen <= dataFim;
    });

    console.log('3️⃣ Comparação Novembro 2025:');
    console.log(`   Contas a Receber:`);
    console.log(`      No banco (pendentes): ${pendentesCRNov.length}`);
    console.log(`      No fluxo (pendentes): ${crPendentesNoNov.length}`);
    console.log(`      Diferença: ${pendentesCRNov.length - crPendentesNoNov.length}`);
    console.log(`   Contas a Pagar:`);
    console.log(`      No banco (pendentes): ${pendentesCPNov.length}`);
    console.log(`      No fluxo (pendentes): ${cpPendentesNoNov.length}`);
    console.log(`      Diferença: ${pendentesCPNov.length - cpPendentesNoNov.length}\n`);

    // 5. Testar para períodos maiores
    console.log('4️⃣ Testando fluxo de caixa para TODOS os meses (até dezembro 2025)...');
    const dataInicioGeral = new Date('2024-01-01');
    const dataFimGeral = new Date('2025-12-31');
    
    const dadosGeral = await buscarDadosUnificados({
      company_id: companyId,
      data_inicio: dataInicioGeral.toISOString().split('T')[0],
      data_fim: dataFimGeral.toISOString().split('T')[0],
      tipo_data: 'vencimento',
      status: 'todos',
      incluir_historico_pagas: false
    });

    const crNoGeral = dadosGeral.filter(d => d.origem_tipo === 'conta_receber');
    const cpNoGeral = dadosGeral.filter(d => d.origem_tipo === 'conta_pagar');
    const crPendentesGeral = crNoGeral.filter(d => d.status === 'pendente');
    const cpPendentesGeral = cpNoGeral.filter(d => d.status === 'pendente');

    console.log(`   📊 Período Geral - Contas a Receber:`);
    console.log(`      Total: ${crNoGeral.length} (${crPendentesGeral.length} pendentes)`);
    console.log(`      No banco: ${todosPendentesCR.rows.length} pendentes`);
    console.log(`      Diferença: ${todosPendentesCR.rows.length - crPendentesGeral.length}`);
    console.log(`   📊 Período Geral - Contas a Pagar:`);
    console.log(`      Total: ${cpNoGeral.length} (${cpPendentesGeral.length} pendentes)`);
    console.log(`      No banco: ${todosPendentesCP.rows.length} pendentes`);
    console.log(`      Diferença: ${todosPendentesCP.rows.length - cpPendentesGeral.length}\n`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

debugar();


