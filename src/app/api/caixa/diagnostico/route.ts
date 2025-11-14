import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query } from '@/lib/database';

/**
 * GET /api/caixa/diagnostico
 * 
 * Diagnóstico completo do caixa para debug
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    const caixa_id = searchParams.get('caixa_id');
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    const acesso = await validateUserAccess(token, company_id);
    if (!acesso.valid) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    let diagnostico: any = {
      timestamp: new Date().toISOString(),
      company_id,
      caixa_id
    };

    // 1. Buscar caixa
    if (caixa_id) {
      const caixaQuery = await query(`
        SELECT * FROM caixas
        WHERE id = $1::uuid AND "companyId" = $2::uuid
      `, [caixa_id, company_id]);

      diagnostico.caixa = caixaQuery.rows[0] || null;
    } else {
      const caixasQuery = await query(`
        SELECT * FROM caixas
        WHERE "companyId" = $1::uuid
        ORDER BY "dataAbertura" DESC
        LIMIT 5
      `, [company_id]);

      diagnostico.ultimos_caixas = caixasQuery.rows;
    }

    // 2. Buscar vendas
    if (caixa_id) {
      const vendasQuery = await query(`
        SELECT 
          id,
          "caixaId",
          "valorTotal",
          "meioPagamento",
          status,
          "dataVenda"
        FROM vendas_caixa
        WHERE "caixaId" = $1::uuid
        ORDER BY "dataVenda" DESC
      `, [caixa_id]);

      diagnostico.vendas = {
        total: vendasQuery.rows.length,
        lista: vendasQuery.rows
      };

      // Totais
      const totaisQuery = await query(`
        SELECT 
          status,
          COUNT(*) as qtd,
          SUM("valorTotal") as total
        FROM vendas_caixa
        WHERE "caixaId" = $1::uuid
        GROUP BY status
      `, [caixa_id]);

      diagnostico.vendas_por_status = totaisQuery.rows;

      // Por forma de pagamento
      const formasQuery = await query(`
        SELECT 
          "meioPagamento",
          COUNT(*) as qtd,
          SUM("valorTotal") as total
        FROM vendas_caixa
        WHERE "caixaId" = $1::uuid
          AND status = 'concluida'
        GROUP BY "meioPagamento"
      `, [caixa_id]);

      diagnostico.vendas_por_forma = formasQuery.rows;
    }

    // 3. Movimentações
    if (caixa_id) {
      const movQuery = await query(`
        SELECT * FROM movimentacoes_caixa
        WHERE "caixaId" = $1::uuid
        ORDER BY "dataMovimentacao" DESC
      `, [caixa_id]);

      diagnostico.movimentacoes = {
        total: movQuery.rows.length,
        lista: movQuery.rows
      };
    }

    // 4. Cálculo do saldo
    if (caixa_id && diagnostico.caixa) {
      const valorAbertura = parseFloat(diagnostico.caixa.valorAbertura || 0);
      const vendasConcluidas = diagnostico.vendas_por_status?.find((v: any) => v.status === 'concluida');
      const valorVendas = parseFloat(vendasConcluidas?.total || 0);
      
      const sangrias = diagnostico.movimentacoes?.lista?.filter((m: any) => m.tipo === 'sangria') || [];
      const suprimentos = diagnostico.movimentacoes?.lista?.filter((m: any) => m.tipo === 'suprimento') || [];
      
      const totalSangrias = sangrias.reduce((sum: number, s: any) => sum + parseFloat(s.valor || 0), 0);
      const totalSuprimentos = suprimentos.reduce((sum: number, s: any) => sum + parseFloat(s.valor || 0), 0);
      
      const saldoCalculado = valorAbertura + valorVendas - totalSangrias + totalSuprimentos;

      diagnostico.calculo_saldo = {
        valorAbertura,
        valorVendas,
        totalSangrias,
        totalSuprimentos,
        formula: `${valorAbertura} + ${valorVendas} - ${totalSangrias} + ${totalSuprimentos}`,
        saldoCalculado
      };
    }

    return NextResponse.json({
      success: true,
      data: diagnostico
    });
  } catch (error: any) {
    console.error('❌ Erro no diagnóstico:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}




