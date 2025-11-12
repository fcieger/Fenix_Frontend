import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';
import { query } from '@/lib/database';

/**
 * Endpoint de teste para validar queries do fluxo de caixa
 * GET /api/fluxo-caixa/test-query?company_id=xxx&data_inicio=2024-11-01&data_fim=2024-11-30&tipo_data=vencimento
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
    const data_inicio = searchParams.get('data_inicio') || '2024-11-01';
    const data_fim = searchParams.get('data_fim') || '2024-11-30';
    const tipo_data = (searchParams.get('tipo_data') as 'pagamento' | 'vencimento') || 'vencimento';

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

    // Construir condição de data baseado em tipo_data (igual ao fluxo-caixa-service.ts)
    let condicaoData = '';
    let condicaoTimestamp = '';
    
    if (tipo_data === 'pagamento') {
      condicaoData = `
        CASE 
          WHEN p.status = 'pago' AND p.data_compensacao IS NOT NULL THEN DATE(p.data_compensacao)
          WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN DATE(p.data_pagamento)
          WHEN p.status = 'pago' THEN DATE(p.data_vencimento)
          ELSE DATE(p.data_vencimento)
        END
      `;
      condicaoTimestamp = `
        CASE 
          WHEN p.status = 'pago' AND p.data_compensacao IS NOT NULL THEN p.data_compensacao::timestamp
          WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN p.data_pagamento::timestamp
          WHEN p.status = 'pago' THEN p.data_vencimento::timestamp
          ELSE p.data_vencimento::timestamp
        END
      `;
    } else {
      condicaoData = 'DATE(p.data_vencimento)';
      condicaoTimestamp = 'p.data_vencimento::timestamp';
    }

    // Testar query de contas a receber (igual ao fluxo-caixa-service.ts)
    const sqlCR = `
      SELECT 
        'conta_receber'::text as origem_tipo,
        p.conta_receber_id::text as origem_id,
        ${condicaoData} as data,
        ${condicaoTimestamp} as data_timestamp,
        cr.company_id::text as company_id,
        COALESCE(p.conta_corrente_id::text, NULL) as conta_id,
        p.valor_parcela as valor_entrada,
        0::decimal(15,2) as valor_saida,
        COALESCE('Recebimento: ' || cr.titulo || ' - ' || p.titulo_parcela, '') as descricao,
        p.status,
        p.id::text as parcela_id
      FROM parcelas_contas_receber p
      INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
      WHERE cr.company_id = $1::uuid
        AND p.status IN ('pago', 'pendente')
        AND (${condicaoData}) >= $2::date
        AND (${condicaoData}) <= $3::date
      ORDER BY data_timestamp ASC
      LIMIT 20
    `;

    const resultCR = await query(sqlCR, [company_id, data_inicio, data_fim]);

    // Testar query de contas a pagar (igual ao fluxo-caixa-service.ts)
    const sqlCP = `
      SELECT 
        'conta_pagar'::text as origem_tipo,
        p.conta_pagar_id::text as origem_id,
        ${condicaoData} as data,
        ${condicaoTimestamp} as data_timestamp,
        cp.company_id::text as company_id,
        COALESCE(p.conta_corrente_id::text, NULL) as conta_id,
        0::decimal(15,2) as valor_entrada,
        p.valor_parcela as valor_saida,
        COALESCE('Pagamento: ' || cp.titulo || ' - ' || p.titulo_parcela, '') as descricao,
        p.status,
        p.id::text as parcela_id
      FROM parcelas_contas_pagar p
      INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
      WHERE cp.company_id = $1::uuid
        AND p.status IN ('pago', 'pendente')
        AND (${condicaoData}) >= $2::date
        AND (${condicaoData}) <= $3::date
      ORDER BY data_timestamp ASC
      LIMIT 20
    `;

    const resultCP = await query(sqlCP, [company_id, data_inicio, data_fim]);

    return NextResponse.json({
      success: true,
      periodo: {
        inicio: data_inicio,
        fim: data_fim,
        tipo_data
      },
      contas_receber: {
        total: resultCR.rows.length,
        dados: resultCR.rows.map(r => ({
          origem_tipo: r.origem_tipo,
          data: r.data,
          status: r.status,
          valor_entrada: parseFloat(r.valor_entrada || 0),
          descricao: r.descricao?.substring(0, 100),
          parcela_id: r.parcela_id
        }))
      },
      contas_pagar: {
        total: resultCP.rows.length,
        dados: resultCP.rows.map(r => ({
          origem_tipo: r.origem_tipo,
          data: r.data,
          status: r.status,
          valor_saida: parseFloat(r.valor_saida || 0),
          descricao: r.descricao?.substring(0, 100),
          parcela_id: r.parcela_id
        }))
      },
      query_cr: sqlCR.substring(0, 500) + '...',
      query_cp: sqlCP.substring(0, 500) + '...'
    });
  } catch (error: any) {
    console.error('❌ Erro no teste de query:', error);
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


