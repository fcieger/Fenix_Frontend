import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { ensureCoreSchema } from '@/lib/migrations';
import { ensureHistorySchema } from '@/lib/history';

let pool: Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:fenix123@localhost:5432/fenix'
    });
  }
  return pool;
}

export async function POST() {
  const client = await getPool().connect();
  try {
    await ensureCoreSchema(client);
    await ensureHistorySchema(client);
    return NextResponse.json({ success: true, message: 'Migrações aplicadas com sucesso' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Falha ao migrar' }, { status: 500 });
  } finally {
    client.release();
  }
}





