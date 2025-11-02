import { NextRequest, NextResponse } from 'next/server';
import { MovimentacoesService } from '@/services/movimentacoes-service';
import { ContasService } from '@/services/contas-service';
import { query } from '@/lib/database';

const movimentacoesService = new MovimentacoesService();
const contasService = new ContasService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    
    // Se company_id for fornecido, buscar movimentações de todas as contas da empresa
    if (companyId) {
      const contas = await contasService.getContas({ company_id: companyId });
      const contasIds = contas.map(c => c.id);
      
      if (contasIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          total: 0
        });
      }
      
      // Construir filtros
      const filters: any = {
        data_inicio: searchParams.get('data_inicio') || undefined,
        data_fim: searchParams.get('data_fim') || undefined,
        situacao: searchParams.get('situacao') || undefined,
        tipo_movimentacao: searchParams.get('tipo_movimentacao') || undefined,
      };
      
      // Buscar movimentações de todas as contas usando IN
      let sql = `
        SELECT m.*, m.saldo_apos_movimentacao 
        FROM movimentacoes_financeiras m
        WHERE m.conta_id = ANY($1::uuid[])
      `;
      const params: any[] = [contasIds];
      let paramCount = 1;
      
      if (filters.data_inicio) {
        paramCount++;
        sql += ` AND m.data_movimentacao >= $${paramCount}`;
        params.push(filters.data_inicio);
      }
      
      if (filters.data_fim) {
        paramCount++;
        sql += ` AND m.data_movimentacao <= $${paramCount}`;
        params.push(filters.data_fim);
      }
      
      if (filters.situacao) {
        paramCount++;
        sql += ` AND m.situacao = $${paramCount}`;
        params.push(filters.situacao);
      }
      
      if (filters.tipo_movimentacao) {
        paramCount++;
        sql += ` AND m.tipo_movimentacao = $${paramCount}`;
        params.push(filters.tipo_movimentacao);
      }
      
      sql += ' ORDER BY m.data_movimentacao ASC, m.created_at ASC';
      
      const result = await query(sql, params);
      
      return NextResponse.json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
    }
    
    // Se não houver company_id, usar o método normal
    const filters: any = {
      conta_id: searchParams.get('conta_id') || undefined,
      tipo_movimentacao: searchParams.get('tipo_movimentacao') || undefined,
      data_inicio: searchParams.get('data_inicio') || undefined,
      data_fim: searchParams.get('data_fim') || undefined,
      valor_min: searchParams.get('valor_min') ? parseFloat(searchParams.get('valor_min')!) : undefined,
      valor_max: searchParams.get('valor_max') ? parseFloat(searchParams.get('valor_max')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      situacao: searchParams.get('situacao') || undefined,
    };

    const movimentacoes = await movimentacoesService.getMovimentacoes(filters);
    
    return NextResponse.json({
      success: true,
      data: movimentacoes,
      total: movimentacoes.length
    });
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();
    
    const movimentacao = await movimentacoesService.createMovimentacao(body);
    
    return NextResponse.json({
      success: true,
      data: movimentacao,
      message: 'Movimentação criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const contaId = searchParams.get('conta_id');

    if (action === 'recalcular-saldo-dia') {
      if (contaId) {
        // Recalcular para uma conta específica
        const result = await query('SELECT recalcular_saldo_dia_conta($1)', [contaId]);
        return NextResponse.json({
          success: true,
          message: `Saldo dia recalculado para conta ${contaId}`,
          movimentacoes_atualizadas: result.rows[0].recalcular_saldo_dia_conta
        });
      } else {
        // Recalcular para todas as contas
        const result = await query('SELECT * FROM recalcular_saldo_dia_todas_contas()');
        return NextResponse.json({
          success: true,
          message: 'Saldo dia recalculado para todas as contas',
          contas_atualizadas: result.rows
        });
      }
    }

    if (action === 'recalcular-todas') {
      // Recalcular saldos do dia e saldo_atual para todas as contas
      try {
        const contas = await contasService.getContas({ limit: 100000 });
        const resultados: any[] = [];
        for (const conta of contas) {
          try {
            // Atualizar saldo_atual baseado nas movimentações
            const saldoAtual = await contasService.atualizarSaldoAtual(conta.id);
            // Recalcular os saldos do dia para a conta
            await query('SELECT recalcular_saldo_dia_conta($1)', [conta.id]);
            resultados.push({ conta_id: conta.id, descricao: conta.descricao, saldoAtual });
          } catch (e: any) {
            resultados.push({ conta_id: conta.id, descricao: conta.descricao, erro: e?.message || 'falha' });
          }
        }
        return NextResponse.json({ success: true, message: 'Recalculo aplicado a todas as contas', resultados });
      } catch (e) {
        console.error('Erro ao recalcular todas as contas:', e);
        return NextResponse.json({ success: false, error: 'Erro ao recalcular todas as contas' }, { status: 500 });
      }
    }

    return NextResponse.json(
      { error: 'Ação não reconhecida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao recalcular saldo dia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
