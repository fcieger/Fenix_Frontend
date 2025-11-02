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

export async function POST(request: NextRequest) {
  const client = await getPool().connect()
  try {
    await ensureCoreSchema(client)
    const body = await request.json()
    const {
      produtoId,
      tipo,
      qtd,
      localOrigemId,
      localDestinoId,
      custoUnitario = 0,
      origem,
      origemId,
      dataMov,
      companyId
    } = body

    if (!produtoId || !tipo || !qtd || !companyId) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios: produtoId, tipo, qtd, companyId' }, { status: 400 })
    }

    if (!['entrada', 'saida', 'transferencia', 'ajuste'].includes(String(tipo))) {
      return NextResponse.json({ success: false, error: 'tipo inválido' }, { status: 400 })
    }

    if (Number(qtd) <= 0) {
      return NextResponse.json({ success: false, error: 'qtd deve ser > 0' }, { status: 400 })
    }

    if (tipo === 'transferencia' && (!localOrigemId || !localDestinoId)) {
      return NextResponse.json({ success: false, error: 'Transferência requer localOrigemId e localDestinoId' }, { status: 400 })
    }

    const custoTotal = Number(qtd) * Number(custoUnitario || 0)

    const sql = `
      INSERT INTO estoque_movimentos
        ("produtoId","localOrigemId","localDestinoId",tipo,qtd,"custoUnitario","custoTotal",origem,"origemId","dataMov","companyId")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `
    const params = [
      produtoId,
      localOrigemId || null,
      localDestinoId || null,
      tipo,
      qtd,
      custoUnitario || 0,
      custoTotal,
      origem || null,
      origemId || null,
      dataMov ? new Date(dataMov) : new Date(),
      companyId,
    ]

    const result = await client.query(sql, params)
    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    console.error('Erro ao criar movimento de estoque:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function GET(request: NextRequest) {
  const client = await getPool().connect()
  try {
    await ensureCoreSchema(client)
    const { searchParams } = new URL(request.url)
    const produtoId = searchParams.get('produtoId')
    const localId = searchParams.get('localId')
    const tipo = searchParams.get('tipo')
    const origem = searchParams.get('origem')
    const origemId = searchParams.get('origemId')
    const inicio = searchParams.get('inicio')
    const fim = searchParams.get('fim')

    const where: string[] = []
    const params: any[] = []
    let c = 0

    if (produtoId) { where.push(`m."produtoId" = $${++c}`); params.push(produtoId) }
    if (localId) { where.push(`(COALESCE(m."localOrigemId", '00000000-0000-0000-0000-000000000000') = $${++c} OR COALESCE(m."localDestinoId", '00000000-0000-0000-0000-000000000000') = $${c})`); params.push(localId) }
    if (tipo) { where.push(`m.tipo = $${++c}`); params.push(tipo) }
    if (origem) { where.push(`m.origem = $${++c}`); params.push(origem) }
    if (origemId) { where.push(`m."origemId" = $${++c}`); params.push(origemId) }
    if (inicio) { 
      const inicioDate = new Date(inicio);
      where.push(`m."dataMov" >= $${++c}`); 
      params.push(inicioDate);
    }
    if (fim) { 
      const fimDate = new Date(fim);
      where.push(`m."dataMov" <= $${++c}`); 
      params.push(fimDate);
    }

    const companyId = searchParams.get('companyId')
    if (companyId) { where.push(`m."companyId" = $${++c}`); params.push(companyId) }

    const sql = `
      SELECT 
        m.*,
        p.nome as produto_nome,
        p.sku as produto_sku,
        p."codigoBarras" as produto_codigo_barras,
        lo.nome as local_origem_nome,
        lo.codigo as local_origem_codigo,
        ld.nome as local_destino_nome,
        ld.codigo as local_destino_codigo
      FROM estoque_movimentos m
      LEFT JOIN produtos p ON p.id = m."produtoId" AND p."companyId" = m."companyId"
      LEFT JOIN locais_estoque lo ON lo.id = m."localOrigemId" AND lo."companyId" = m."companyId"
      LEFT JOIN locais_estoque ld ON ld.id = m."localDestinoId" AND ld."companyId" = m."companyId"
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY m."dataMov" DESC
      LIMIT 500
    `
    console.log('SQL Query:', sql);
    console.log('Params:', params);
    const result = await client.query(sql, params)
    console.log('Resultados encontrados:', result.rows.length);
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error: any) {
    console.error('Erro ao listar movimentos de estoque:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}



