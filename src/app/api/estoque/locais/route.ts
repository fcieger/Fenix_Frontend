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
    const search = searchParams.get('search')
    const ativo = searchParams.get('ativo')
    const companyId = searchParams.get('companyId')

    // Log para debug (desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 GET /api/estoque/locais - Parâmetros:', {
        search,
        ativo,
        companyId
      });
    }

    const where: string[] = []
    const params: any[] = []
    let c = 0
    // Filtro por companyId: comparar como texto para evitar ambiguidade de tipo
    if (companyId) { 
      where.push('l."companyId"::text = $' + (++c) + '::text'); 
      params.push(String(companyId)) 
    }
    if (ativo !== null) { 
      where.push('l.ativo = $' + (++c)); 
      params.push(ativo === 'true') 
    }
    if (search) { 
      where.push('(l.nome ILIKE $' + (++c) + ' OR COALESCE(l.codigo, \'\') ILIKE $' + c + ')'); 
      params.push(`%${search}%`) 
    }

    // Buscar o local padrão da company se existir a coluna/registro
    let defaultLocalId: string | null = null
    if (companyId) {
      try {
        const defaultResult = await client.query(
          'SELECT "defaultLocalEstoqueId" FROM companies WHERE id::text = $1::text',
          [String(companyId)]
        )
        if (defaultResult.rows.length > 0 && defaultResult.rows[0].defaultLocalEstoqueId) {
          defaultLocalId = defaultResult.rows[0].defaultLocalEstoqueId
        }
      } catch {
        defaultLocalId = null
      }
    }

    const sql = `SELECT l.*, 
      CASE WHEN $${++c}::uuid IS NOT NULL AND l.id = $${c}::uuid THEN true ELSE false END as "is_default_company_local"
      FROM locais_estoque l 
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''} 
      ORDER BY l.nome ASC`
    params.push(defaultLocalId)
    
    // Log para debug (desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 GET /api/estoque/locais - SQL:', sql);
      console.log('🔍 GET /api/estoque/locais - Params:', params);
    }
    
    const { rows } = await client.query(sql, params)
    
    // Log para debug (desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 GET /api/estoque/locais - Resultado:', {
        total: rows.length,
        locais: rows.map(r => ({ id: r.id, nome: r.nome, companyId: r.companyId }))
      });
    }
    
    return NextResponse.json({ success: true, data: rows })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function POST(request: NextRequest) {
  const client = await getPool().connect()
  try {
    await ensureCoreSchema(client)
    const { nome, codigo, ativo = true, companyId } = await request.json()
    
    // Log para debug (desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 POST /api/estoque/locais - Dados recebidos:', {
        nome,
        codigo,
        ativo,
        companyId
      });
    }
    
    if (!nome || !companyId) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios: nome, companyId' }, { status: 400 })
    }
    const { rows } = await client.query(
      'INSERT INTO locais_estoque (nome, codigo, ativo, "companyId") VALUES ($1,$2,$3,$4) RETURNING *',
      [nome, codigo || null, !!ativo, companyId]
    )
    
    // Log para debug (desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ POST /api/estoque/locais - Local criado:', {
        id: rows[0].id,
        nome: rows[0].nome,
        companyId: rows[0].companyId
      });
    }
    
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function PUT(request: NextRequest) {
  const client = await getPool().connect()
  try {
    await ensureCoreSchema(client)
    const body = await request.json()
    const { id, nome, codigo, ativo } = body
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 })
    const fields: string[] = []
    const params: any[] = []
    let c = 0
    if (nome !== undefined) { fields.push('nome = $' + (++c)); params.push(nome) }
    if (codigo !== undefined) { fields.push('codigo = $' + (++c)); params.push(codigo) }
    if (ativo !== undefined) { fields.push('ativo = $' + (++c)); params.push(!!ativo) }
    if (!fields.length) return NextResponse.json({ success: false, error: 'Nenhum campo para atualizar' }, { status: 400 })
    params.push(id)
    const sql = `UPDATE locais_estoque SET ${fields.join(', ') } WHERE id = $${++c} RETURNING *`
    const { rows } = await client.query(sql, params)
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function DELETE(request: NextRequest) {
  const client = await getPool().connect()
  try {
    await ensureCoreSchema(client)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 })
    await client.query('DELETE FROM locais_estoque WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}



