import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * POST /api/caixa/fechar
 * 
 * Fecha o caixa atual
 */
export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { company_id, caixa_id, valorReal, observacoes } = body;
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!caixa_id) {
      return NextResponse.json(
        { success: false, error: 'caixa_id é obrigatório' },
        { status: 400 }
      );
    }

    if (valorReal === undefined || valorReal === null) {
      return NextResponse.json(
        { success: false, error: 'valorReal é obrigatório' },
        { status: 400 }
      );
    }

    const valorRealNum = parseFloat(valorReal);
    if (isNaN(valorRealNum) || valorRealNum < 0) {
      return NextResponse.json(
        { success: false, error: 'valorReal deve ser um número >= 0' },
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

    // Verificar se o caixa existe e está aberto
    const caixaQuery = await query(`
      SELECT 
        id,
        status,
        "valorAbertura"
      FROM caixas
      WHERE id = $1::uuid
        AND "companyId" = $2::uuid
    `, [caixa_id, company_id]);

    if (caixaQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Caixa não encontrado' },
        { status: 404 }
      );
    }

    const caixa = caixaQuery.rows[0];
    if (caixa.status !== 'aberto') {
      return NextResponse.json(
        { success: false, error: 'Caixa já está fechado' },
        { status: 400 }
      );
    }

    // Calcular totais das vendas
    const vendasQuery = await query(`
      SELECT 
        COUNT(*) as total_vendas,
        COALESCE(SUM("valorTotal"), 0) as valor_total_vendas
      FROM vendas_caixa
      WHERE "caixaId" = $1::uuid
        AND status = 'concluida'
    `, [caixa_id]);

    // Calcular totais por forma de pagamento
    const formasPagamentoQuery = await query(`
      SELECT 
        COALESCE(v."meioPagamento", 'NÃO_INFORMADO') as forma_pagamento,
        COUNT(*) as total_vendas,
        COALESCE(SUM(v."valorTotal"), 0) as valor_total
      FROM vendas_caixa v
      WHERE v."caixaId" = $1::uuid
        AND v.status = 'concluida'
      GROUP BY v."meioPagamento"
      ORDER BY valor_total DESC
    `, [caixa_id]);

    // Calcular sangrias e suprimentos
    const movimentacoesQuery = await query(`
      SELECT 
        tipo,
        COALESCE(SUM(CASE WHEN tipo = 'sangria' THEN valor ELSE 0 END), 0) as total_sangrias,
        COALESCE(SUM(CASE WHEN tipo = 'suprimento' THEN valor ELSE 0 END), 0) as total_suprimentos
      FROM movimentacoes_caixa
      WHERE "caixaId" = $1::uuid
      GROUP BY tipo
    `, [caixa_id]);

    const totalSangrias = movimentacoesQuery.rows.reduce((sum, row) => sum + (row.tipo === 'sangria' ? parseFloat(row.total_sangrias || 0) : 0), 0);
    const totalSuprimentos = movimentacoesQuery.rows.reduce((sum, row) => sum + (row.tipo === 'suprimento' ? parseFloat(row.total_suprimentos || 0) : 0), 0);

    const vendas = vendasQuery.rows[0];
    const valorAbertura = parseFloat(caixa.valorAbertura || 0);
    const valorTotalVendas = parseFloat(vendas.valor_total_vendas || 0);
    const valorEsperado = valorAbertura + valorTotalVendas - totalSangrias + totalSuprimentos;
    const diferenca = valorRealNum - valorEsperado;

    // Fechar o caixa
    const fecharCaixaQuery = await query(`
      UPDATE caixas
      SET 
        status = 'fechado',
        "dataFechamento" = CURRENT_TIMESTAMP,
        "valorFechamento" = $1::numeric,
        "valorEsperado" = $2::numeric,
        "valorReal" = $3::numeric,
        "diferenca" = $4::numeric,
        observacoes = COALESCE($5::text, observacoes)
      WHERE id = $6::uuid
        AND "companyId" = $7::uuid
      RETURNING 
        id,
        "dataFechamento",
        "valorEsperado",
        "valorReal",
        "diferenca",
        status
    `, [valorRealNum, valorEsperado, valorRealNum, diferenca, observacoes || null, caixa_id, company_id]);

    const caixaFechado = fecharCaixaQuery.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        id: caixaFechado.id,
        dataFechamento: caixaFechado.dataFechamento,
        valorEsperado: parseFloat(caixaFechado.valorEsperado || 0),
        valorReal: parseFloat(caixaFechado.valorReal || 0),
        diferenca: parseFloat(caixaFechado.diferenca || 0),
        status: caixaFechado.status,
        resumoVendas: {
          totalVendas: parseInt(vendas.total_vendas || 0),
          valorTotalVendas: valorTotalVendas,
          totalSangrias: totalSangrias,
          totalSuprimentos: totalSuprimentos,
          totalPorFormaPagamento: formasPagamentoQuery.rows.map(row => ({
            formaPagamento: row.forma_pagamento,
            valor: parseFloat(row.valor_total || 0),
            quantidade: parseInt(row.total_vendas || 0)
          }))
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao fechar caixa:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}





