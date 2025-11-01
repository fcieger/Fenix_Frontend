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
    const { companyId, localId } = await request.json()
    if (!companyId || !localId) return NextResponse.json({ success: false, error: 'companyId e localId obrigatórios' }, { status: 400 })
    await client.query('UPDATE companies SET "defaultLocalEstoqueId" = $1 WHERE id = $2 OR uuid::text = $2::text', [localId, companyId])
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 })
  } finally {
    client.release()
  }
}




