import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { ensureCoreSchema } from '@/lib/migrations'
import { validateUUID } from '@/utils/validations'

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

export async function POST(request: NextRequest) {
  const client = await getPool().connect()
  try {
    await ensureCoreSchema(client)
    const body = await request.json()
    const {
      pedidoId,
      companyId,
      localEstoqueId,
      naturezaOperacao, // objeto ou { movimentaEstoque: boolean }
      itens = [], // [{ produtoId, quantidade }]
      status,
    } = body || {}

    if (!validateUUID(companyId)) return NextResponse.json({ success: false, error: 'companyId inválido' }, { status: 400 })
    if (!validateUUID(localEstoqueId)) return NextResponse.json({ success: false, error: 'localEstoqueId inválido' }, { status: 400 })
    if (!pedidoId || !validateUUID(pedidoId)) return NextResponse.json({ success: false, error: 'pedidoId inválido' }, { status: 400 })

    const movimenta = naturezaOperacao?.movimentaEstoque === true || naturezaOperacao?.movimenta_estoque === true
    if (!movimenta) {
      return NextResponse.json({ success: true, data: { message: 'Natureza não movimenta estoque' } })
    }
    if (Number(status) !== 3) {
      return NextResponse.json({ success: true, data: { message: 'Pedido não está ENTREGUE; sem movimentação' } })
    }

    // Evitar duplicidade
    const dup = await client.query('SELECT 1 FROM estoque_movimentos WHERE origem = $1 AND "origemId" = $2 LIMIT 1', ['pedido_venda', pedidoId])
    if (dup.rowCount > 0) {
      return NextResponse.json({ success: true, data: { message: 'Movimentos já lançados' } })
    }

    await client.query('BEGIN')
    for (const it of itens) {
      const produtoId = it?.produtoId
      const qtd = Number(it?.quantidade || it?.qtd || 0)
      if (!validateUUID(produtoId) || !qtd || qtd <= 0) continue
      await client.query(
        `INSERT INTO estoque_movimentos ("produtoId","localOrigemId","localDestinoId",tipo,qtd,"custoUnitario","custoTotal",origem,"origemId","dataMov","companyId")
         VALUES ($1,$2,$3,'saida',$4,0,0,'pedido_venda',$5, now(), $6)`,
        [produtoId, localEstoqueId, null, qtd, pedidoId, companyId]
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



