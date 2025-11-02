// Script para verificar títulos pendentes que deveriam aparecer no fluxo de caixa
import { query } from '../src/lib/database';
import { buscarDadosUnificados } from '../src/services/fluxo-caixa-service';

async function verificar() {
  try {
    const companyId = process.env.COMPANY_ID || 'eb198f2a-a95b-413a-abb9-464e3b7af303';
    const hoje = new Date();
    const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    console.log('🔍 === VERIFICAÇÃO: Títulos Pendentes no Período Atual ===\n');
    console.log('Company ID:', companyId);
    console.log('Período atual:', mesAtual.toISOString().split('T')[0], 'a', fimMesAtual.toISOString().split('T')[0]);
    console.log('');

    // 1. Buscar títulos pendentes no período atual (banco)
    console.log('1️⃣ Buscando títulos pendentes no banco (período atual)...');
    
    const pendentesCRAtual = await query(
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
       ORDER BY p.data_vencimento ASC`,
      [companyId, mesAtual, fimMesAtual]
    );

    const pendentesCPAtual = await query(
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
         AND DATE(p.data_vencimento) >= $2::date
         AND DATE(p.data_vencimento) <= $3::date
       ORDER BY p.data_vencimento ASC`,
      [companyId, mesAtual, fimMesAtual]
    );

    console.log(`   ✅ Contas a Receber: ${pendentesCRAtual.rows.length} títulos pendentes`);
    console.log(`   ✅ Contas a Pagar: ${pendentesCPAtual.rows.length} títulos pendentes\n`);

    // 2. Buscar no fluxo de caixa (mesmo período)
    console.log('2️⃣ Buscando no fluxo de caixa (mesmo período)...');
    
    const dadosFluxo = await buscarDadosUnificados({
      company_id: companyId,
      data_inicio: mesAtual.toISOString().split('T')[0],
      data_fim: fimMesAtual.toISOString().split('T')[0],
      tipo_data: 'vencimento',
      status: 'todos',
      incluir_historico_pagas: false
    });

    const crNoFluxo = dadosFluxo.filter(d => d.origem_tipo === 'conta_receber');
    const cpNoFluxo = dadosFluxo.filter(d => d.origem_tipo === 'conta_pagar');
    const crPendentesFluxo = crNoFluxo.filter(d => d.status === 'pendente');
    const cpPendentesFluxo = cpNoFluxo.filter(d => d.status === 'pendente');

    console.log(`   📊 Contas a Receber: ${crNoFluxo.length} títulos (${crPendentesFluxo.length} pendentes)`);
    console.log(`   📊 Contas a Pagar: ${cpNoFluxo.length} títulos (${cpPendentesFluxo.length} pendentes)\n`);

    // 3. Comparar
    console.log('3️⃣ Comparação:');
    const diferencaCR = pendentesCRAtual.rows.length - crPendentesFluxo.length;
    const diferencaCP = pendentesCPAtual.rows.length - cpPendentesFluxo.length;

    console.log(`   Contas a Receber:`);
    console.log(`      No banco: ${pendentesCRAtual.rows.length}`);
    console.log(`      No fluxo: ${crPendentesFluxo.length}`);
    console.log(`      Diferença: ${diferencaCR} ${diferencaCR > 0 ? '❌ FALTANDO' : diferencaCR < 0 ? '⚠️ EXTRAS' : '✅ OK'}`);
    
    if (diferencaCR > 0) {
      console.log(`\n   🔍 Títulos faltando no fluxo de caixa (CR):`);
      const idsNoFluxo = new Set(crPendentesFluxo.map(d => d.parcela_id));
      pendentesCRAtual.rows
        .filter(r => !idsNoFluxo.has(r.id))
        .slice(0, 10)
        .forEach((r, i) => {
          console.log(`      ${i + 1}. ${r.titulo} - ${r.titulo_parcela} (Venc: ${r.data_vencimento}, Valor: R$ ${parseFloat(r.valor_parcela || 0).toFixed(2)})`);
        });
    }

    console.log(`\n   Contas a Pagar:`);
    console.log(`      No banco: ${pendentesCPAtual.rows.length}`);
    console.log(`      No fluxo: ${cpPendentesFluxo.length}`);
    console.log(`      Diferença: ${diferencaCP} ${diferencaCP > 0 ? '❌ FALTANDO' : diferencaCP < 0 ? '⚠️ EXTRAS' : '✅ OK'}`);
    
    if (diferencaCP > 0) {
      console.log(`\n   🔍 Títulos faltando no fluxo de caixa (CP):`);
      const idsNoFluxo = new Set(cpPendentesFluxo.map(d => d.parcela_id));
      pendentesCPAtual.rows
        .filter(r => !idsNoFluxo.has(r.id))
        .slice(0, 10)
        .forEach((r, i) => {
          console.log(`      ${i + 1}. ${r.titulo} - ${r.titulo_parcela} (Venc: ${r.data_vencimento}, Valor: R$ ${parseFloat(r.valor_parcela || 0).toFixed(2)})`);
        });
    }

    // 4. Exibir exemplos de títulos pendentes no período
    if (pendentesCRAtual.rows.length > 0 || pendentesCPAtual.rows.length > 0) {
      console.log('\n4️⃣ Exemplos de títulos pendentes no período atual:');
      
      if (pendentesCRAtual.rows.length > 0) {
        console.log(`\n   Contas a Receber (primeiros 5):`);
        pendentesCRAtual.rows.slice(0, 5).forEach((r, i) => {
          console.log(`      ${i + 1}. ${r.titulo} - ${r.titulo_parcela}`);
          console.log(`         Vencimento: ${r.data_vencimento}`);
          console.log(`         Valor: R$ ${parseFloat(r.valor_parcela || 0).toFixed(2)}`);
          console.log(`         ID: ${r.id}`);
          const estaNoFluxo = crPendentesFluxo.some(d => d.parcela_id === r.id);
          console.log(`         No fluxo: ${estaNoFluxo ? '✅ SIM' : '❌ NÃO'}`);
          console.log('');
        });
      }

      if (pendentesCPAtual.rows.length > 0) {
        console.log(`\n   Contas a Pagar (primeiros 5):`);
        pendentesCPAtual.rows.slice(0, 5).forEach((r, i) => {
          console.log(`      ${i + 1}. ${r.titulo} - ${r.titulo_parcela}`);
          console.log(`         Vencimento: ${r.data_vencimento}`);
          console.log(`         Valor: R$ ${parseFloat(r.valor_parcela || 0).toFixed(2)}`);
          console.log(`         ID: ${r.id}`);
          const estaNoFluxo = cpPendentesFluxo.some(d => d.parcela_id === r.id);
          console.log(`         No fluxo: ${estaNoFluxo ? '✅ SIM' : '❌ NÃO'}`);
          console.log('');
        });
      }
    }

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verificar();

