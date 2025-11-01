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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const client = await getPool().connect()
  try {
    await ensureCoreSchema(client)
    const { itens } = await request.json()
    if (!Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json({ success: false, error: 'itens deve ser uma lista' }, { status: 400 })
    }
    await client.query('BEGIN')
    for (const it of itens) {
      const { produtoId, qtdContada } = it
      if (!produtoId) continue
      // obter qtdSistema atual
      const qSistRes = await client.query(
        `SELECT COALESCE(SUM(CASE WHEN tipo IN ('entrada','transferencia') AND "localDestinoId" IS NOT NULL THEN qtd ELSE 0 END)
                - SUM(CASE WHEN tipo IN ('saida','ajuste') AND "localOrigemId" IS NOT NULL THEN qtd ELSE 0 END),0) AS qtd
         FROM estoque_movimentos m
         WHERE m."produtoId" = $1`,
        [produtoId]
      )
      const qtdSistema = Number(qSistRes.rows[0]?.qtd || 0)
      const diferenca = Number(qtdContada || 0) - qtdSistema
      await client.query(
        `INSERT INTO estoque_inventarios_itens ("inventarioId","produtoId","qtdSistema","qtdContada",diferenca)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT ("inventarioId","produtoId") DO UPDATE SET "qtdSistema" = EXCLUDED."qtdSistema", "qtdContada" = EXCLUDED."qtdContada", diferenca = EXCLUDED.diferenca`,
        [params.id, produtoId, qtdSistema, Number(qtdContada || 0), diferenca]
      )
    }
    await client.query('COMMIT')
    return NextResponse.json({ success: true })
  } catch (e: any) {
    await (pool as any)?.query?.('ROLLBACK').catch(()=>{})
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}




