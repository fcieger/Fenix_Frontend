import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { ensureCoreSchema } from '@/lib/migrations'

let pool: Pool | null = null
function getPool(): Pool {
  if (!pool) {
    // Priorizar DATABASE_URL se disponível (para produção/Vercel)
    if (process.env.DATABASE_URL) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })
    } else {
      // Fallback para desenvolvimento local
      pool = new Pool({
        connectionString: 'postgresql://postgres:fenix123@localhost:5432/fenix',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })
    }
  }
  return pool
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const client = await getPool().connect()
  try {
    await ensureCoreSchema(client)
    const inv = await client.query('SELECT * FROM estoque_inventarios WHERE id = $1', [params.id])
    if (inv.rowCount === 0) return NextResponse.json({ success: false, error: 'Inventário não encontrado' }, { status: 404 })
    
    const inventario = inv.rows[0]
    
    // Buscar itens com dados do produto
    const itens = await client.query(
      `SELECT 
        i.*,
        p.nome as produto_nome,
        p.sku as produto_sku,
        p."codigoBarras" as produto_codigo_barras
      FROM estoque_inventarios_itens i
      LEFT JOIN produtos p ON p.id = i."produtoId"
      WHERE i."inventarioId" = $1 
      ORDER BY i."createdAt" ASC`,
      [params.id]
    )
    
    return NextResponse.json({ success: true, data: { inventario, itens: itens.rows } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}



