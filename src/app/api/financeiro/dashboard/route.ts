import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';
import { subDays, startOfMonth, endOfMonth, format } from 'date-fns';

/**
 * GET /api/financeiro/dashboard
 * 
 * Retorna dados do dashboard financeiro com informações consolidadas
 */
export async function GET(request: NextRequest) {
  try {
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de autenticação necessário'
        },
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
      const statusCode = acesso.error?.includes('Token') || acesso.error?.includes('não fornecido') ? 401 : 403;
      return NextResponse.json(
        { 
          success: false, 
          error: acesso.error || 'Acesso negado'
        },
        { status: statusCode }
      );
    }

    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);
    const data30DiasAtras = subDays(hoje, 30);

    // 1. Saldo atual total (soma de todas as contas ativas)
    const saldoAtualQuery = await query(`
      SELECT 
        COALESCE(SUM(
          (
            SELECT 
              COALESCE(SUM(
                CASE 
                  WHEN m.tipo_movimentacao = 'entrada' THEN m.valor_entrada
                  WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_entrada > 0 THEN m.valor_entrada
                  WHEN m.tipo_movimentacao = 'saida' THEN -m.valor_saida
                  WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_saida > 0 THEN -m.valor_saida
                  ELSE 0
                END
              ), 0)
            FROM movimentacoes_financeiras m
            WHERE m.conta_id = cf.id
              AND COALESCE(m.situacao, 'pago') = 'pago'
          )
        ), 0) as saldo_atual
      FROM contas_financeiras cf
      WHERE cf."companyId" = $1::uuid
        AND cf.status = 'ativo'
    `, [company_id]);

    const saldoAtual = parseFloat(saldoAtualQuery.rows[0]?.saldo_atual || 0);

    // 2. Fluxo de caixa últimos 30 dias (receitas - despesas)
    const fluxoCaixaQuery = await query(`
      SELECT 
        COALESCE(SUM(
          CASE 
            WHEN m.tipo_movimentacao = 'entrada' THEN m.valor_entrada
            WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_entrada > 0 THEN m.valor_entrada
            ELSE 0
          END
        ), 0) as receitas,
        COALESCE(SUM(
          CASE 
            WHEN m.tipo_movimentacao = 'saida' THEN m.valor_saida
            WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_saida > 0 THEN m.valor_saida
            ELSE 0
          END
        ), 0) as despesas
      FROM movimentacoes_financeiras m
      INNER JOIN contas_financeiras cf ON m.conta_id = cf.id
      WHERE cf."companyId" = $1::uuid
        AND (m.tela_origem IS NULL OR m.tela_origem NOT IN ('contas_receber_parcelas', 'contas_pagar_parcelas'))
        AND COALESCE(m.situacao, 'pago') = 'pago'
        AND DATE(m.data_movimentacao) >= $2::date
        AND DATE(m.data_movimentacao) <= $3::date
    `, [company_id, data30DiasAtras, hoje]);

    const receitas30Dias = parseFloat(fluxoCaixaQuery.rows[0]?.receitas || 0);
    const despesas30Dias = parseFloat(fluxoCaixaQuery.rows[0]?.despesas || 0);
    const fluxoCaixa = receitas30Dias - despesas30Dias;

    // 3. Contas vencidas (tanto a receber quanto a pagar)
    const contasVencidasQuery = await query(`
      SELECT 
        'pagar' as tipo,
        p.id,
        cp.titulo as descricao,
        p.valor_parcela as valor,
        p.data_vencimento as vencimento
      FROM parcelas_contas_pagar p
      INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
      WHERE cp.company_id = $1::uuid
        AND p.status = 'pendente'
        AND p.data_vencimento < CURRENT_DATE
      
      UNION ALL
      
      SELECT 
        'receber' as tipo,
        p.id,
        cr.titulo as descricao,
        p.valor_parcela as valor,
        p.data_vencimento as vencimento
      FROM parcelas_contas_receber p
      INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
      WHERE cr.company_id = $1::uuid
        AND p.status = 'pendente'
        AND p.data_vencimento < CURRENT_DATE
      
      ORDER BY vencimento ASC
      LIMIT 10
    `, [company_id]);

    const contasVencidas = contasVencidasQuery.rows.map((row: any) => ({
      id: row.id,
      descricao: row.descricao,
      valor: parseFloat(row.valor || 0),
      vencimento: row.vencimento,
      tipo: row.tipo === 'pagar' ? 'pagar' : 'receber'
    }));

    const totalContasVencidas = contasVencidas.reduce((sum, conta) => sum + conta.valor, 0);

    // 4. Próximos vencimentos (próximos 30 dias)
    const proximosVencimentosQuery = await query(`
      SELECT 
        'pagar' as tipo,
        p.id,
        cp.titulo as descricao,
        p.valor_parcela as valor,
        p.data_vencimento as vencimento,
        (p.data_vencimento - CURRENT_DATE)::integer as dias
      FROM parcelas_contas_pagar p
      INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
      WHERE cp.company_id = $1::uuid
        AND p.status = 'pendente'
        AND p.data_vencimento >= CURRENT_DATE
        AND p.data_vencimento <= (CURRENT_DATE + INTERVAL '30 days')
      
      UNION ALL
      
      SELECT 
        'receber' as tipo,
        p.id,
        cr.titulo as descricao,
        p.valor_parcela as valor,
        p.data_vencimento as vencimento,
        (p.data_vencimento - CURRENT_DATE)::integer as dias
      FROM parcelas_contas_receber p
      INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
      WHERE cr.company_id = $1::uuid
        AND p.status = 'pendente'
        AND p.data_vencimento >= CURRENT_DATE
        AND p.data_vencimento <= (CURRENT_DATE + INTERVAL '30 days')
      
      ORDER BY vencimento ASC
      LIMIT 10
    `, [company_id]);

    const proximosVencimentos = proximosVencimentosQuery.rows.map((row: any) => ({
      id: row.id,
      descricao: row.descricao,
      valor: parseFloat(row.valor || 0),
      vencimento: row.vencimento,
      dias: parseInt(row.dias || 0)
    }));

    const totalProximosVencimentos = proximosVencimentos.reduce((sum, conta) => sum + conta.valor, 0);

    // 5. Faturamento do mês (receitas pagas do mês)
    const faturamentoQueries = await Promise.all([
      // Movimentações diretas
      query(`
        SELECT COALESCE(SUM(m.valor_entrada), 0) as valor
        FROM movimentacoes_financeiras m
        INNER JOIN contas_financeiras cf ON m.conta_id = cf.id
        WHERE cf."companyId" = $1::uuid
          AND m.tipo_movimentacao = 'entrada'
          AND (m.tela_origem IS NULL OR m.tela_origem NOT IN ('contas_receber_parcelas', 'contas_pagar_parcelas'))
          AND COALESCE(m.situacao, 'pago') = 'pago'
          AND DATE(m.data_movimentacao) >= $2::date
          AND DATE(m.data_movimentacao) <= $3::date
      `, [company_id, inicioMes, fimMes]),
      // Contas a receber pagas com compensação
      query(`
        SELECT COALESCE(SUM(p.valor_total), 0) as valor
        FROM parcelas_contas_receber p
        INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
        WHERE cr.company_id = $1::uuid
          AND p.status = 'pago'
          AND p.data_compensacao IS NOT NULL
          AND DATE(p.data_compensacao) >= $2::date
          AND DATE(p.data_compensacao) <= $3::date
      `, [company_id, inicioMes, fimMes]),
      // Contas a receber pagas sem compensação (usar data_pagamento)
      query(`
        SELECT COALESCE(SUM(p.valor_total), 0) as valor
        FROM parcelas_contas_receber p
        INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
        WHERE cr.company_id = $1::uuid
          AND p.status = 'pago'
          AND p.data_compensacao IS NULL
          AND p.data_pagamento IS NOT NULL
          AND DATE(p.data_pagamento) >= $2::date
          AND DATE(p.data_pagamento) <= $3::date
      `, [company_id, inicioMes, fimMes])
    ]);

    const faturamentoMes = faturamentoQueries.reduce((sum, result) => {
      return sum + parseFloat(result.rows[0]?.valor || 0);
    }, 0);

    // 6. Despesas do mês (saídas pagas do mês)
    const despesasQueries = await Promise.all([
      // Movimentações diretas
      query(`
        SELECT COALESCE(SUM(m.valor_saida), 0) as valor
        FROM movimentacoes_financeiras m
        INNER JOIN contas_financeiras cf ON m.conta_id = cf.id
        WHERE cf."companyId" = $1::uuid
          AND m.tipo_movimentacao = 'saida'
          AND (m.tela_origem IS NULL OR m.tela_origem NOT IN ('contas_receber_parcelas', 'contas_pagar_parcelas'))
          AND COALESCE(m.situacao, 'pago') = 'pago'
          AND DATE(m.data_movimentacao) >= $2::date
          AND DATE(m.data_movimentacao) <= $3::date
      `, [company_id, inicioMes, fimMes]),
      // Contas a pagar pagas com compensação
      query(`
        SELECT COALESCE(SUM(p.valor_total), 0) as valor
        FROM parcelas_contas_pagar p
        INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
        WHERE cp.company_id = $1::uuid
          AND p.status = 'pago'
          AND p.data_compensacao IS NOT NULL
          AND DATE(p.data_compensacao) >= $2::date
          AND DATE(p.data_compensacao) <= $3::date
      `, [company_id, inicioMes, fimMes]),
      // Contas a pagar pagas sem compensação (usar data_pagamento)
      query(`
        SELECT COALESCE(SUM(p.valor_total), 0) as valor
        FROM parcelas_contas_pagar p
        INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
        WHERE cp.company_id = $1::uuid
          AND p.status = 'pago'
          AND p.data_compensacao IS NULL
          AND p.data_pagamento IS NOT NULL
          AND DATE(p.data_pagamento) >= $2::date
          AND DATE(p.data_pagamento) <= $3::date
      `, [company_id, inicioMes, fimMes])
    ]);

    const despesasMes = despesasQueries.reduce((sum, result) => {
      return sum + parseFloat(result.rows[0]?.valor || 0);
    }, 0);

    // 7. Lucro bruto e margem
    const lucroBruto = faturamentoMes - despesasMes;
    const margemLucro = faturamentoMes > 0 ? (lucroBruto / faturamentoMes) * 100 : 0;

    // 8. Dados para gráficos (últimos 30 dias)
    const graficoFluxoQuery = await query(`
      SELECT 
        DATE(m.data_movimentacao) as data,
        COALESCE(SUM(
          CASE 
            WHEN m.tipo_movimentacao = 'entrada' THEN m.valor_entrada
            WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_entrada > 0 THEN m.valor_entrada
            ELSE 0
          END
        ), 0) as receitas,
        COALESCE(SUM(
          CASE 
            WHEN m.tipo_movimentacao = 'saida' THEN m.valor_saida
            WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_saida > 0 THEN m.valor_saida
            ELSE 0
          END
        ), 0) as despesas
      FROM movimentacoes_financeiras m
      INNER JOIN contas_financeiras cf ON m.conta_id = cf.id
      WHERE cf."companyId" = $1::uuid
        AND (m.tela_origem IS NULL OR m.tela_origem NOT IN ('contas_receber_parcelas', 'contas_pagar_parcelas'))
        AND COALESCE(m.situacao, 'pago') = 'pago'
        AND DATE(m.data_movimentacao) >= $2::date
        AND DATE(m.data_movimentacao) <= $3::date
      GROUP BY DATE(m.data_movimentacao)
      ORDER BY DATE(m.data_movimentacao) ASC
    `, [company_id, data30DiasAtras, hoje]);

    const graficoFluxo = graficoFluxoQuery.rows.map((row: any) => ({
      data: format(new Date(row.data), 'dd/MM'),
      receitas: parseFloat(row.receitas || 0),
      despesas: parseFloat(row.despesas || 0)
    }));

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          saldoAtual,
          fluxoCaixa,
          contasVencidas: totalContasVencidas,
          proximosVencimentos: totalProximosVencimentos,
          faturamentoMes,
          despesasMes,
          lucroBruto,
          margemLucro: parseFloat(margemLucro.toFixed(2))
        },
        contasVencidas,
        proximosVencimentos,
        graficoFluxo
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar dashboard financeiro:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}
