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

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const client = await getPool().connect()
  try {
    await ensureCoreSchema(client)
    const invRes = await client.query('SELECT * FROM estoque_inventarios WHERE id = $1', [params.id])
    if (invRes.rowCount === 0) return NextResponse.json({ success: false, error: 'Inventário não encontrado' }, { status: 404 })
    const inv = invRes.rows[0]
    const itensRes = await client.query('SELECT * FROM estoque_inventarios_itens WHERE "inventarioId" = $1', [params.id])
    const itens = itensRes.rows
    await client.query('BEGIN')
    // Se já existem movimentos com origem 'inventario' para este inventário,
    // assumimos que os ajustes foram lançados previamente (fluxo de duas etapas) e
    // apenas atualizamos o status, sem gerar novos movimentos para evitar duplicidade
    const existentes = await client.query(
      'SELECT 1 FROM estoque_movimentos WHERE origem = $1 AND "origemId" = $2 LIMIT 1',
      ['inventario', params.id]
    )

    if (existentes.rowCount === 0) {
      for (const it of itens) {
        const dif = Number(it.diferenca)
        if (dif === 0) continue
        const tipo = dif > 0 ? 'entrada' : 'saida'
        const qtd = Math.abs(dif)
        await client.query(
          `INSERT INTO estoque_movimentos ("produtoId","localOrigemId","localDestinoId",tipo,qtd,"custoUnitario","custoTotal",origem,"origemId","dataMov","companyId")
           VALUES ($1,$2,$3,$4,$5,0,0,'inventario',$6, now(), $7)`,
          [it.produtoid || it.produtoId, tipo === 'saida' ? inv.localId : null, tipo === 'entrada' ? inv.localId : null, tipo, qtd, params.id, inv.companyId]
        )
      }
    }
    await client.query('UPDATE estoque_inventarios SET status = $1 WHERE id = $2', ['aplicado', params.id])
    await client.query('COMMIT')
    return NextResponse.json({ success: true })
  } catch (e: any) {
    await (pool as any)?.query?.('ROLLBACK').catch(()=>{})
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}



