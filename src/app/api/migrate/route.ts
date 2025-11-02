import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { ensureCoreSchema } from '@/lib/migrations';
import { ensureHistorySchema } from '@/lib/history';

let pool: Pool | null = null;
function getPool() {
  if (!pool) {
    // Priorizar DATABASE_URL se disponível (para produção/Vercel)
    if (process.env.DATABASE_URL) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    } else {
      // Fallback para desenvolvimento local
      pool = new Pool({
        connectionString: 'postgresql://postgres:fenix123@localhost:5432/fenix',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }
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






