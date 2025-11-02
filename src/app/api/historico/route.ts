import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { ensureHistorySchema } from '@/lib/history';

let pool: Pool | null = null;
function getPool(): Pool {
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

export async function GET(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    // Garantir que a tabela exista
    await ensureHistorySchema(client);
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const action = searchParams.get('action');
    const entity = searchParams.get('entity');
    const user = searchParams.get('user');
    const q = searchParams.get('q');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    if (!companyId) return NextResponse.json({ success: false, error: 'company_id é obrigatório' }, { status: 400 });

    const conds: string[] = ['company_id = $1'];
    const params: any[] = [companyId];
    let p = 2;
    if (action) { conds.push('action = $' + p++); params.push(action); }
    if (entity) { conds.push('entity = $' + p++); params.push(entity); }
    if (user) { conds.push('(user_name ILIKE $' + p++ + ' OR user_id::text = $' + p++ + ')'); params.push(`%${user}%`, user); }
    if (q) { conds.push('(description ILIKE $' + p++ + ' OR entity_id ILIKE $' + p++ + ')'); params.push(`%${q}%`, `%${q}%`); }
    if (dateFrom) { conds.push('created_at >= $' + p++); params.push(dateFrom); }
    if (dateTo) { conds.push('created_at <= $' + p++); params.push(dateTo); }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

    const rows = await client.query(
      `SELECT id, created_at, user_name, action, entity, entity_id, description, metadata
         FROM historico_eventos
         ${where}
         ORDER BY created_at DESC
         LIMIT $${p} OFFSET $${p + 1}`,
      [...params, limit, offset]
    );

    const count = await client.query(
      `SELECT COUNT(*)::int AS total FROM historico_eventos ${where}`,
      params
    );

    return NextResponse.json({ success: true, data: rows.rows, total: count.rows[0].total, page, limit });
  } catch (e: any) {
    console.error('Erro ao listar histórico:', e);
    return NextResponse.json({ success: false, error: e.message || 'Erro interno' }, { status: 500 });
  } finally {
    client.release();
  }
}


