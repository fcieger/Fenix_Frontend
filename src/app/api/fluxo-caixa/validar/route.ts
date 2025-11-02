import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';
import { query } from '@/lib/database';
import { buscarDadosUnificados } from '@/services/fluxo-caixa-service';

/**
 * Endpoint de validação para comparar dados do banco com o fluxo de caixa
 * GET /api/fluxo-caixa/validar?company_id=xxx&data_inicio=2025-11-01&data_fim=2025-11-30&tipo_data=vencimento
 */
export async function GET(request: NextRequest) {
  try {
    // Garantir que migrations estão aplicadas
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    // Validar acesso
    const acesso = await validateUserAccess(token, company_id);
    if (!acesso.valid) {
      return NextResponse.json(
        { success: false, error: acesso.error || 'Acesso negado' },
        { status: acesso.error?.includes('Token') ? 401 : 403 }
      );
    }

    // Parâmetros do fluxo de caixa
    const hoje = new Date();
    const data_inicio = searchParams.get('data_inicio') 
      ? new Date(searchParams.get('data_inicio')!)
      : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const data_fim = searchParams.get('data_fim')
      ? new Date(searchParams.get('data_fim')!)
      : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const tipo_data = (searchParams.get('tipo_data') as 'pagamento' | 'vencimento') || 'vencimento';
    const status = (searchParams.get('status') as 'todos' | 'pago' | 'pendente') || 'todos';

    console.log('🔍 Validação iniciada:', {
      company_id,
      data_inicio: data_inicio.toISOString().split('T')[0],
      data_fim: data_fim.toISOString().split('T')[0],
      tipo_data,
      status
    });

    // 1. Contar títulos PENDENTES em contas a receber (SEM filtro de data)
    const crPendentesGeral = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status = 'pendente'`,
      [company_id]
    );

    // 2. Contar títulos PENDENTES com vencimento no período
    const crPendentesVencimento = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status = 'pendente'
         AND DATE(p.data_vencimento) >= $2::date
         AND DATE(p.data_vencimento) <= $3::date`,
      [company_id, data_inicio, data_fim]
    );

    // 3. Listar TODOS os títulos pendentes no período
    const todasParcelasCRPeriodo = await query(
      `SELECT 
         p.id,
         p.status,
         p.data_vencimento,
         p.data_pagamento,
         p.data_compensacao,
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
      [company_id, data_inicio, data_fim]
    );

    // 3a. Listar exemplos gerais de títulos pendentes (primeiros 10)
    const exemplosCR = await query(
      `SELECT 
         p.id,
         p.status,
         p.data_vencimento,
         p.data_pagamento,
         p.data_compensacao,
         p.valor_parcela,
         cr.titulo,
         p.titulo_parcela
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status = 'pendente'
       ORDER BY p.data_vencimento DESC
       LIMIT 10`,
      [company_id]
    );

    // 4. Contar títulos PAGOS em contas a receber
    const crPagasGeral = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status = 'pago'`,
      [company_id]
    );

    // 5. Buscar dados do fluxo de caixa usando o serviço
    const dadosFluxoCaixa = await buscarDadosUnificados({
      company_id,
      data_inicio: data_inicio.toISOString().split('T')[0],
      data_fim: data_fim.toISOString().split('T')[0],
      tipo_data,
      status,
      incluir_historico_pagas: false
    });

    // 6. Separar contas a receber do fluxo de caixa
    const crNoFluxo = dadosFluxoCaixa.filter(d => d.origem_tipo === 'conta_receber');
    const crPendentesNoFluxo = crNoFluxo.filter(d => d.status === 'pendente');
    const crPagasNoFluxo = crNoFluxo.filter(d => d.status === 'pago');

    // 7. Contar contas a pagar pendentes
    const cpPendentesGeral = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_pagar p
       INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
       WHERE cp.company_id = $1::uuid
         AND p.status = 'pendente'`,
      [company_id]
    );

    const cpPendentesVencimento = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_pagar p
       INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
       WHERE cp.company_id = $1::uuid
         AND p.status = 'pendente'
         AND DATE(p.data_vencimento) >= $2::date
         AND DATE(p.data_vencimento) <= $3::date`,
      [company_id, data_inicio, data_fim]
    );

    const cpNoFluxo = dadosFluxoCaixa.filter(d => d.origem_tipo === 'conta_pagar');
    const cpPendentesNoFluxo = cpNoFluxo.filter(d => d.status === 'pendente');

    // 8. Análise detalhada
    const totalCRPendentesBanco = parseInt(crPendentesGeral.rows[0]?.total || '0');
    const totalCRPendentesVencimento = parseInt(crPendentesVencimento.rows[0]?.total || '0');
    const totalCRPendentesFluxo = crPendentesNoFluxo.length;

    const diferencaCR = totalCRPendentesVencimento - totalCRPendentesFluxo;

    // 9. Identificar títulos que estão no banco mas não no fluxo
    const idsNoFluxo = new Set(crPendentesNoFluxo.map(d => d.parcela_id));
    const titulosFaltando = todasParcelasCRPeriodo.rows
      .filter(r => !idsNoFluxo.has(r.id))
      .map(r => ({
        id: r.id,
        titulo: r.titulo,
        titulo_parcela: r.titulo_parcela,
        data_vencimento: r.data_vencimento,
        valor: parseFloat(r.valor_parcela || 0),
        status: r.status
      }));

    const totalCPPendentesBanco = parseInt(cpPendentesGeral.rows[0]?.total || '0');
    const totalCPPendentesVencimento = parseInt(cpPendentesVencimento.rows[0]?.total || '0');
    const totalCPPendentesFluxo = cpPendentesNoFluxo.length;

    const diferencaCP = totalCPPendentesVencimento - totalCPPendentesFluxo;

    return NextResponse.json({
      success: true,
      periodo: {
        inicio: data_inicio.toISOString().split('T')[0],
        fim: data_fim.toISOString().split('T')[0],
        tipo_data,
        status
      },
      contas_receber: {
        no_banco: {
          pendentes_total: totalCRPendentesBanco,
          pendentes_no_periodo: totalCRPendentesVencimento,
          pagas_total: parseInt(crPagasGeral.rows[0]?.total || '0')
        },
        no_fluxo_caixa: {
          total: crNoFluxo.length,
          pendentes: totalCRPendentesFluxo,
          pagas: crPagasNoFluxo.length
        },
        comparacao: {
          diferenca: diferencaCR,
          status: diferencaCR === 0 ? 'OK' : diferencaCR > 0 ? 'FALTANDO_NO_FLUXO' : 'EXTRAS_NO_FLUXO',
          percentual_cobertura: totalCRPendentesVencimento > 0 
            ? ((totalCRPendentesFluxo / totalCRPendentesVencimento) * 100).toFixed(2) + '%'
            : '0%',
          titulos_faltando_total: titulosFaltando.length,
          titulos_faltando: titulosFaltando.length > 0 ? titulosFaltando.slice(0, 20) : undefined
        },
        exemplos: exemplosCR.rows.map(r => ({
          id: r.id,
          status: r.status,
          data_vencimento: r.data_vencimento,
          data_pagamento: r.data_pagamento,
          data_compensacao: r.data_compensacao,
          valor: parseFloat(r.valor_parcela || 0),
          titulo: r.titulo,
          titulo_parcela: r.titulo_parcela,
          esta_no_periodo: r.data_vencimento >= data_inicio && r.data_vencimento <= data_fim
        }))
      },
      contas_pagar: {
        no_banco: {
          pendentes_total: totalCPPendentesBanco,
          pendentes_no_periodo: totalCPPendentesVencimento
        },
        no_fluxo_caixa: {
          total: cpNoFluxo.length,
          pendentes: totalCPPendentesFluxo
        },
        comparacao: {
          diferenca: diferencaCP,
          status: diferencaCP === 0 ? 'OK' : diferencaCP > 0 ? 'FALTANDO_NO_FLUXO' : 'EXTRAS_NO_FLUXO',
          percentual_cobertura: totalCPPendentesVencimento > 0 
            ? ((totalCPPendentesFluxo / totalCPPendentesVencimento) * 100).toFixed(2) + '%'
            : '0%'
        }
      },
      resumo: {
        total_movimentacoes_fluxo: dadosFluxoCaixa.length,
        total_cr_fluxo: crNoFluxo.length,
        total_cp_fluxo: cpNoFluxo.length,
        total_movimentacoes_diretas: dadosFluxoCaixa.filter(d => d.origem_tipo === 'movimentacao').length
      }
    });
  } catch (error: any) {
    console.error('❌ Erro na validação:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

