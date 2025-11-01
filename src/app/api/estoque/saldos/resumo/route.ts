import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { ensureCoreSchema } from '@/lib/migrations'

let pool: Pool | null = null
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:fenix123@localhost:5432/fenix',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return pool
}

export async function GET(request: NextRequest) {
  const client = await getPool().connect()
  try {
    await ensureCoreSchema(client)
    const { searchParams } = new URL(request.url)
    const localId = searchParams.get('localId')

    const whereLocal = localId ? `WHERE COALESCE(m."localDestinoId", m."localOrigemId") = $1` : ''
    const params = localId ? [localId] : []

    const sql = `
      WITH saldos AS (
        SELECT m."produtoId",
               SUM(CASE WHEN m.tipo IN ('entrada','transferencia') AND m."localDestinoId" IS NOT NULL THEN m.qtd ELSE 0 END)
               - SUM(CASE WHEN m.tipo IN ('saida','ajuste') AND m."localOrigemId" IS NOT NULL THEN m.qtd ELSE 0 END) AS qtd
        FROM estoque_movimentos m
        ${whereLocal}
        GROUP BY m."produtoId"
      )
      SELECT 
        COUNT(*)::int AS totalProdutos,
        COALESCE(SUM(s.qtd),0) AS qtdTotal,
        COUNT(*) FILTER (WHERE s.qtd <= 0)::int AS zeradosOuNegativos,
        COUNT(*) FILTER (WHERE s.qtd < 0)::int AS negativos,
        COUNT(*) FILTER (WHERE s.qtd = 0)::int AS zerados,
        0::int AS abaixoMinimo
      FROM saldos s`

    const { rows } = await client.query(sql, params)
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (e: any) {
    console.error('Erro saldos/resumo:', e)
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}



