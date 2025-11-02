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

export async function POST(request: NextRequest) {
  const client = await getPool().connect()
  try {
    await ensureCoreSchema(client)
    const body = await request.json()
    const { localId, produtos = [], observacao, companyId, precalcularQtdSistema = false } = body
    if (!localId || !companyId) return NextResponse.json({ success: false, error: 'localId e companyId são obrigatórios' }, { status: 400 })

    await client.query('BEGIN')
    const invRes = await client.query(
      'INSERT INTO estoque_inventarios ("localId", observacao, "companyId") VALUES ($1,$2,$3) RETURNING *',
      [localId, observacao || null, companyId]
    )
    const inventario = invRes.rows[0]

    // Se precalcularQtdSistema for true, buscar todos os produtos com saldo no local
    if (precalcularQtdSistema) {
      const saldos = await client.query(
        `SELECT 
          m."produtoId",
          SUM(CASE WHEN m.tipo IN ('entrada','transferencia') AND m."localDestinoId" = $1 THEN m.qtd ELSE 0 END)
          - SUM(CASE WHEN m.tipo IN ('saida','ajuste') AND m."localOrigemId" = $1 THEN m.qtd ELSE 0 END) AS qtd
         FROM estoque_movimentos m
         WHERE m."companyId" = $2
         GROUP BY m."produtoId"
         HAVING SUM(CASE WHEN m.tipo IN ('entrada','transferencia') AND m."localDestinoId" = $1 THEN m.qtd ELSE 0 END)
                - SUM(CASE WHEN m.tipo IN ('saida','ajuste') AND m."localOrigemId" = $1 THEN m.qtd ELSE 0 END) != 0`,
        [localId, companyId]
      )
      
      for (const row of saldos.rows) {
        const qtdSistema = Number(row.qtd) || 0
        await client.query(
          'INSERT INTO estoque_inventarios_itens ("inventarioId","produtoId","qtdSistema") VALUES ($1,$2,$3) ON CONFLICT ("inventarioId","produtoId") DO NOTHING',
          [inventario.id, row.produtoId, qtdSistema]
        )
      }
    } else if (Array.isArray(produtos) && produtos.length > 0) {
      // calcular qtdSistema por produto
      const ids = produtos.map((p: any) => p.produtoId)
      const saldos = await client.query(
        `WITH s AS (
           SELECT m."produtoId",
                  SUM(CASE WHEN m.tipo IN ('entrada','transferencia') AND m."localDestinoId" = $1 THEN m.qtd ELSE 0 END)
                  - SUM(CASE WHEN m.tipo IN ('saida','ajuste') AND m."localOrigemId" = $1 THEN m.qtd ELSE 0 END) AS qtd
           FROM estoque_movimentos m
           WHERE m."produtoId" = ANY($2)
           GROUP BY m."produtoId"
         )
         SELECT p."produtoId", COALESCE(s.qtd,0) AS qtd
         FROM UNNEST($2::uuid[]) AS p("produtoId")
         LEFT JOIN s ON s."produtoId" = p."produtoId"`,
        [localId, ids]
      )
      const map = new Map<string, number>()
      saldos.rows.forEach((r: any) => map.set(r.produtoId, Number(r.qtd)))

      for (const p of produtos) {
        const qtdSistema = map.get(p.produtoId) ?? 0
        await client.query(
          'INSERT INTO estoque_inventarios_itens ("inventarioId","produtoId","qtdSistema") VALUES ($1,$2,$3) ON CONFLICT ("inventarioId","produtoId") DO NOTHING',
          [inventario.id, p.produtoId, qtdSistema]
        )
      }
    }

    await client.query('COMMIT')
    return NextResponse.json({ success: true, data: inventario })
  } catch (e: any) {
    await client.query('ROLLBACK').catch(()=>{})
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function GET(request: NextRequest) {
  const client = await getPool().connect()
  try {
    await ensureCoreSchema(client)
    const { searchParams } = new URL(request.url)
    const localId = searchParams.get('localId')
    const status = searchParams.get('status')
    const companyId = searchParams.get('companyId')
    const where: string[] = []
    const params: any[] = []
    let c = 0
    if (companyId) { where.push('i."companyId" = $' + (++c)); params.push(companyId) }
    if (localId) { where.push('i."localId" = $' + (++c)); params.push(localId) }
    if (status) { where.push('i.status = $' + (++c)); params.push(status) }
    
    const sql = `
      SELECT 
        i.*,
        l.nome as local_nome,
        l.codigo as local_codigo
      FROM estoque_inventarios i
      LEFT JOIN locais_estoque l ON l.id = i."localId"
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''} 
      ORDER BY i."createdAt" DESC 
      LIMIT 200`
    const { rows } = await client.query(sql, params)
    return NextResponse.json({ success: true, data: rows })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}



