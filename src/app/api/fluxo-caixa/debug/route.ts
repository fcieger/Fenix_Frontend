import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';
import { query } from '@/lib/database';

/**
 * Endpoint de debug para verificar dados disponíveis
 * GET /api/fluxo-caixa/debug?company_id=xxx&data_inicio=2024-11-01&data_fim=2024-11-30
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

    // Datas padrão: mês atual
    const hoje = new Date();
    const data_inicio = searchParams.get('data_inicio') 
      ? new Date(searchParams.get('data_inicio')!)
      : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const data_fim = searchParams.get('data_fim')
      ? new Date(searchParams.get('data_fim')!)
      : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    // 1. Verificar contas financeiras
    const contasResult = await query(
      `SELECT COUNT(*) as total FROM contas_financeiras WHERE "companyId" = $1::uuid AND status = 'ativo'`,
      [company_id]
    );
    const totalContas = parseInt(contasResult.rows[0]?.total || '0');

    // 2. Verificar movimentações financeiras
    const movResult = await query(
      `SELECT COUNT(*) as total 
       FROM movimentacoes_financeiras m
       INNER JOIN contas_financeiras cf ON m.conta_id = cf.id
       WHERE cf."companyId" = $1::uuid
         AND (m.tela_origem IS NULL OR m.tela_origem NOT IN ('contas_receber_parcelas', 'contas_pagar_parcelas'))
         AND DATE(m.data_movimentacao) >= $2::date
         AND DATE(m.data_movimentacao) <= $3::date`,
      [company_id, data_inicio, data_fim]
    );
    const totalMov = parseInt(movResult.rows[0]?.total || '0');

    // 3. Verificar todas as contas a receber (sem filtro de data primeiro)
    const crTodas = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status IN ('pago', 'pendente')`,
      [company_id]
    );

    // 3a. Verificar contas a receber com data de vencimento no período
    const crVencimento = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status IN ('pago', 'pendente')
         AND DATE(p.data_vencimento) >= $2::date
         AND DATE(p.data_vencimento) <= $3::date`,
      [company_id, data_inicio, data_fim]
    );

    // 3b. Verificar contas a receber (pendentes)
    const crPendentes = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status = 'pendente'
         AND DATE(p.data_vencimento) >= $2::date
         AND DATE(p.data_vencimento) <= $3::date`,
      [company_id, data_inicio, data_fim]
    );

    // 3c. Verificar contas a receber (pagas)
    const crPagas = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status = 'pago'
         AND (
           (p.data_pagamento IS NOT NULL AND DATE(p.data_pagamento) >= $2::date AND DATE(p.data_pagamento) <= $3::date)
           OR (p.data_compensacao IS NOT NULL AND DATE(p.data_compensacao) >= $2::date AND DATE(p.data_compensacao) <= $3::date)
           OR (p.data_pagamento IS NULL AND p.data_compensacao IS NULL AND DATE(p.data_vencimento) >= $2::date AND DATE(p.data_vencimento) <= $3::date)
         )`,
      [company_id, data_inicio, data_fim]
    );

    // 3d. Exemplos de parcelas
    const exemploCR = await query(
      `SELECT p.id, p.status, p.data_vencimento, p.data_pagamento, p.data_compensacao, p.valor_parcela, cr.titulo
       FROM parcelas_contas_receber p
       INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
       WHERE cr.company_id = $1::uuid
         AND p.status IN ('pago', 'pendente')
       ORDER BY p.data_vencimento DESC
       LIMIT 10`,
      [company_id]
    );

    const totalCR = parseInt(crPendentes.rows[0]?.total || '0') + parseInt(crPagas.rows[0]?.total || '0');

    // 4. Verificar todas as contas a pagar (sem filtro de data primeiro)
    const cpTodas = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_pagar p
       INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
       WHERE cp.company_id = $1::uuid
         AND p.status IN ('pago', 'pendente')`,
      [company_id]
    );

    // 4a. Verificar contas a pagar com data de vencimento no período
    const cpVencimento = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_pagar p
       INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
       WHERE cp.company_id = $1::uuid
         AND p.status IN ('pago', 'pendente')
         AND DATE(p.data_vencimento) >= $2::date
         AND DATE(p.data_vencimento) <= $3::date`,
      [company_id, data_inicio, data_fim]
    );

    // 4b. Verificar contas a pagar (pendentes)
    const cpPendentes = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_pagar p
       INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
       WHERE cp.company_id = $1::uuid
         AND p.status = 'pendente'
         AND DATE(p.data_vencimento) >= $2::date
         AND DATE(p.data_vencimento) <= $3::date`,
      [company_id, data_inicio, data_fim]
    );

    // 4c. Verificar contas a pagar (pagas)
    const cpPagas = await query(
      `SELECT COUNT(*) as total
       FROM parcelas_contas_pagar p
       INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
       WHERE cp.company_id = $1::uuid
         AND p.status = 'pago'
         AND (
           (p.data_pagamento IS NOT NULL AND DATE(p.data_pagamento) >= $2::date AND DATE(p.data_pagamento) <= $3::date)
           OR (p.data_compensacao IS NOT NULL AND DATE(p.data_compensacao) >= $2::date AND DATE(p.data_compensacao) <= $3::date)
           OR (p.data_pagamento IS NULL AND p.data_compensacao IS NULL AND DATE(p.data_vencimento) >= $2::date AND DATE(p.data_vencimento) <= $3::date)
         )`,
      [company_id, data_inicio, data_fim]
    );

    // 4d. Exemplos de parcelas
    const exemploCP = await query(
      `SELECT p.id, p.status, p.data_vencimento, p.data_pagamento, p.data_compensacao, p.valor_parcela, cp.titulo
       FROM parcelas_contas_pagar p
       INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
       WHERE cp.company_id = $1::uuid
         AND p.status IN ('pago', 'pendente')
       ORDER BY p.data_vencimento DESC
       LIMIT 10`,
      [company_id]
    );

    const totalCP = parseInt(cpPendentes.rows[0]?.total || '0') + parseInt(cpPagas.rows[0]?.total || '0');

    // 5. Verificar movimentações por status
    const movPorStatus = await query(
      `SELECT COALESCE(m.situacao, 'pago') as status, COUNT(*) as total
       FROM movimentacoes_financeiras m
       INNER JOIN contas_financeiras cf ON m.conta_id = cf.id
       WHERE cf."companyId" = $1::uuid
         AND (m.tela_origem IS NULL OR m.tela_origem NOT IN ('contas_receber_parcelas', 'contas_pagar_parcelas'))
         AND DATE(m.data_movimentacao) >= $2::date
         AND DATE(m.data_movimentacao) <= $3::date
       GROUP BY COALESCE(m.situacao, 'pago')`,
      [company_id, data_inicio, data_fim]
    );

    // 6. Verificar algumas movimentações de exemplo
    const exemploMov = await query(
      `SELECT m.id, m.data_movimentacao, m.tipo_movimentacao, m.valor_entrada, m.valor_saida, m.situacao, m.descricao
       FROM movimentacoes_financeiras m
       INNER JOIN contas_financeiras cf ON m.conta_id = cf.id
       WHERE cf."companyId" = $1::uuid
         AND (m.tela_origem IS NULL OR m.tela_origem NOT IN ('contas_receber_parcelas', 'contas_pagar_parcelas'))
       ORDER BY m.data_movimentacao DESC
       LIMIT 5`,
      [company_id]
    );

    return NextResponse.json({
      success: true,
      periodo: {
        inicio: data_inicio.toISOString().split('T')[0],
        fim: data_fim.toISOString().split('T')[0]
      },
      contas_financeiras: {
        total: totalContas
      },
      movimentacoes_financeiras: {
        total_no_periodo: totalMov,
        por_status: movPorStatus.rows.map(r => ({ status: r.status, total: parseInt(r.total) })),
        exemplos: exemploMov.rows.map(r => ({
          id: r.id,
          data: r.data_movimentacao,
          tipo: r.tipo_movimentacao,
          valor_entrada: parseFloat(r.valor_entrada || 0),
          valor_saida: parseFloat(r.valor_saida || 0),
          situacao: r.situacao,
          descricao: r.descricao?.substring(0, 100)
        }))
      },
      contas_receber: {
        total_geral: parseInt(crTodas.rows[0]?.total || '0'),
        total_no_periodo_vencimento: parseInt(crVencimento.rows[0]?.total || '0'),
        total_no_periodo: totalCR,
        pendentes: parseInt(crPendentes.rows[0]?.total || '0'),
        pagas: parseInt(crPagas.rows[0]?.total || '0'),
        exemplos: exemploCR.rows.map(r => ({
          id: r.id,
          status: r.status,
          data_vencimento: r.data_vencimento,
          data_pagamento: r.data_pagamento,
          data_compensacao: r.data_compensacao,
          valor: parseFloat(r.valor_parcela || 0),
          titulo: r.titulo?.substring(0, 50)
        }))
      },
      contas_pagar: {
        total_geral: parseInt(cpTodas.rows[0]?.total || '0'),
        total_no_periodo_vencimento: parseInt(cpVencimento.rows[0]?.total || '0'),
        total_no_periodo: totalCP,
        pendentes: parseInt(cpPendentes.rows[0]?.total || '0'),
        pagas: parseInt(cpPagas.rows[0]?.total || '0'),
        exemplos: exemploCP.rows.map(r => ({
          id: r.id,
          status: r.status,
          data_vencimento: r.data_vencimento,
          data_pagamento: r.data_pagamento,
          data_compensacao: r.data_compensacao,
          valor: parseFloat(r.valor_parcela || 0),
          titulo: r.titulo?.substring(0, 50)
        }))
      },
      resumo: {
        total_contas: totalContas,
        total_movimentacoes_periodo: totalMov,
        total_contas_receber_periodo: totalCR,
        total_contas_pagar_periodo: totalCP,
        total_geral: totalMov + totalCR + totalCP
      }
    });
  } catch (error: any) {
    console.error('❌ Erro no debug:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

