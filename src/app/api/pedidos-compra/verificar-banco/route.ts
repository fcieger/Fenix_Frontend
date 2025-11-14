import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/pedidos-compra/verificar-banco
 * 
 * Verifica se as tabelas de compras foram criadas no banco de dados
 */
export async function GET(request: NextRequest) {
  try {
    // Garantir que as migrations foram executadas
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    // Verificar se as tabelas existem
    const tableCheck = await query(`
      SELECT 
        table_name,
        CASE 
          WHEN table_name = 'pedidos_compra' THEN 'Tabela principal de pedidos'
          WHEN table_name = 'pedidos_compra_itens' THEN 'Tabela de itens dos pedidos'
          ELSE 'Outra tabela'
        END as descricao
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('pedidos_compra', 'pedidos_compra_itens')
      ORDER BY table_name;
    `);

    const tabelasEncontradas = tableCheck.rows.map(row => row.table_name);
    const tabelasEsperadas = ['pedidos_compra', 'pedidos_compra_itens'];
    const tabelasFaltantes = tabelasEsperadas.filter(t => !tabelasEncontradas.includes(t));

    // Verificar estrutura das tabelas se existirem
    let estruturaPedidos = null;
    let estruturaItens = null;

    if (tabelasEncontradas.includes('pedidos_compra')) {
      const colunasPedidos = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'pedidos_compra'
        ORDER BY ordinal_position;
      `);
      estruturaPedidos = colunasPedidos.rows.map(row => ({
        nome: row.column_name,
        tipo: row.data_type,
        nullable: row.is_nullable === 'YES'
      }));
    }

    if (tabelasEncontradas.includes('pedidos_compra_itens')) {
      const colunasItens = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'pedidos_compra_itens'
        ORDER BY ordinal_position;
      `);
      estruturaItens = colunasItens.rows.map(row => ({
        nome: row.column_name,
        tipo: row.data_type,
        nullable: row.is_nullable === 'YES'
      }));
    }

    // Verificar migrations aplicadas
    const migrationsCheck = await query(`
      SELECT id, applied_at
      FROM _migrations
      WHERE id = '2025-11-02_pedidos_compra'
      ORDER BY applied_at DESC
      LIMIT 1;
    `);

    const migrationAplicada = migrationsCheck.rows.length > 0;

    return NextResponse.json({
      success: true,
      tabelas: {
        encontradas: tabelasEncontradas,
        faltantes: tabelasFaltantes,
        todasCriadas: tabelasFaltantes.length === 0
      },
      estrutura: {
        pedidos_compra: estruturaPedidos,
        pedidos_compra_itens: estruturaItens
      },
      migration: {
        aplicada: migrationAplicada,
        data: migrationAplicada ? migrationsCheck.rows[0].applied_at : null
      },
      resumo: {
        status: tabelasFaltantes.length === 0 ? '✅ Todas as tabelas foram criadas' : '❌ Algumas tabelas estão faltando',
        tabelas: tabelasEncontradas.length,
        esperadas: tabelasEsperadas.length
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao verificar banco de dados:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao verificar banco de dados',
        details: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          code: error?.code,
          stack: error?.stack?.substring(0, 500)
        } : undefined
      },
      { status: 500 }
    );
  }
}







