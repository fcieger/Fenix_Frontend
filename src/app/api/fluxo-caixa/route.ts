import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

export async function GET(request: NextRequest) {
  try {
    // Garantir que a view existe
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const dataInicio = searchParams.get('data_inicio');
    const dataFim = searchParams.get('data_fim');
    const contaId = searchParams.get('conta_id');
    const incluirPendentes = searchParams.get('incluir_pendentes') === 'true';
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    // Primeiro, verificar se a view existe e testar query direta
    try {
      const testQuery = await query('SELECT COUNT(*) as total FROM vw_fluxo_caixa WHERE company_id = $1::uuid', [companyId]);
      console.log('✅ View existe e tem', testQuery.rows[0]?.total || 0, 'registros para company_id:', companyId);
    } catch (viewError: any) {
      console.error('❌ Erro ao acessar view:', viewError.message);
      // Se a view não existe, tentar criar
      await transaction(async (client) => {
        await ensureCoreSchema(client);
      });
    }

    let sql = `
      SELECT 
        origem_tipo,
        origem_id,
        data,
        data_timestamp,
        company_id,
        conta_id,
        valor_entrada,
        valor_saida,
        descricao,
        status,
        parcela_id
      FROM vw_fluxo_caixa
      WHERE company_id = $1::uuid
    `;
    
    const params: any[] = [companyId];
    let paramCount = 1;

    // Filtro por conta
    if (contaId) {
      paramCount++;
      sql += ` AND (conta_id = $${paramCount}::uuid OR conta_id IS NULL)`;
      params.push(contaId);
    }

    // Filtro por data início
    if (dataInicio) {
      paramCount++;
      sql += ` AND data >= $${paramCount}::date`;
      params.push(dataInicio);
    }

    // Filtro por data fim
    if (dataFim) {
      paramCount++;
      sql += ` AND data <= $${paramCount}::date`;
      params.push(dataFim);
    }

    // Filtro por status (incluir pendentes ou não)
    if (!incluirPendentes) {
      paramCount++;
      sql += ` AND status = $${paramCount}`;
      params.push('pago');
    }

    sql += ` ORDER BY data_timestamp ASC`;

    console.log('🔍 Query SQL:', sql);
    console.log('📋 Parâmetros:', params);

    const result = await query(sql, params);

    console.log('✅ Resultado:', result.rows.length, 'registros encontrados');
    if (result.rows.length > 0) {
      console.log('📊 Primeiro registro:', JSON.stringify(result.rows[0], null, 2));
      console.log('📊 Tipos encontrados:', [...new Set(result.rows.map((r: any) => r.origem_tipo))]);
    }

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Erro ao buscar fluxo de caixa:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}
