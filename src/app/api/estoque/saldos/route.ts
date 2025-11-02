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
    const produtoId = searchParams.get('produtoId')
    const localId = searchParams.get('localId')
    const companyId = searchParams.get('companyId')
    const categoriaId = searchParams.get('categoriaId') // futuro

    const whereMov: string[] = []
    const params: any[] = []
    let c = 0
    if (produtoId) { whereMov.push('m."produtoId" = $' + (++c)); params.push(produtoId) }
    if (localId) { whereMov.push('(COALESCE(m."localOrigemId", \'00000000-0000-0000-0000-000000000000\') = $' + (++c) + ' OR COALESCE(m."localDestinoId", \'00000000-0000-0000-0000-000000000000\') = $' + c + ')'); params.push(localId) }
    if (companyId) { whereMov.push('m."companyId" = $' + (++c)); params.push(companyId) }

    const sql = `
      WITH rows AS (
        SELECT m."produtoId",
               COALESCE(m."localDestinoId", m."localOrigemId") AS "localId",
               SUM(CASE WHEN m.tipo IN ('entrada','transferencia') AND m."localDestinoId" IS NOT NULL THEN m.qtd ELSE 0 END)
                 - SUM(CASE WHEN m.tipo IN ('saida','ajuste') AND m."localOrigemId" IS NOT NULL THEN m.qtd ELSE 0 END) AS qtd
        FROM estoque_movimentos m
        ${whereMov.length ? 'WHERE ' + whereMov.join(' AND ') : ''}
        GROUP BY m."produtoId", COALESCE(m."localDestinoId", m."localOrigemId")
      )
      SELECT r."produtoId", r."localId", r.qtd
      FROM rows r
      ORDER BY r."produtoId", r."localId"`

    const { rows } = await client.query(sql, params)

    // indicadores simples (abaixo do mínimo/zerados/negativos) exigem consulta a produtos, mas mantemos estrutura para evoluir
    return NextResponse.json({ success: true, data: rows })
  } catch (e: any) {
    console.error('Erro ao obter saldos:', e)
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}




