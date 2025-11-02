import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { ensureCoreSchema } from '@/lib/migrations';
import { validateUUID } from '@/utils/validations';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await getPool().connect();
  try {
    await ensureCoreSchema(client);
    
    const { id } = await params;
    
    if (!id || !validateUUID(id)) {
      return NextResponse.json(
        { success: false, error: 'ID do cadastro inválido' },
        { status: 400 }
      );
    }

    // Verificar se a tabela existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cadastros'
      );
    `);
    
    if (!tableCheck.rows[0]?.exists) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tabela de cadastros não encontrada. Verifique se as migrações foram aplicadas.' 
        },
        { status: 500 }
      );
    }

    // Buscar cadastro
    const cadastroResult = await client.query(
      `SELECT * FROM cadastros WHERE id = $1`,
      [id]
    );
    
    if (cadastroResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cadastro não encontrado' },
        { status: 404 }
      );
    }

    const cadastro = cadastroResult.rows[0];

    return NextResponse.json({
      success: true,
      data: cadastro
    });
  } catch (error: any) {
    // Se for um erro de SQL (tabela não existe, coluna não existe, etc)
    if (error?.code === '42P01') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tabela de cadastros não encontrada no banco de dados. Verifique se as migrações foram aplicadas.' 
        },
        { status: 500 }
      );
    }
    
    if (error?.code === '42703') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Coluna não encontrada: ${error?.message}. Verifique se o schema está atualizado.` 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? {
          code: error?.code,
          detail: error?.detail,
          hint: error?.hint
        } : undefined
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

