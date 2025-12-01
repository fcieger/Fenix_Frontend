import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Verificar se a coluna já existe
    const checkColumnResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contas_financeiras' 
      AND column_name = 'data_ultima_atualizacao'
    `);

    if (checkColumnResult.rows.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Coluna data_ultima_atualizacao já existe',
        alreadyExists: true
      });
    }

    // Adicionar a coluna
    await query(`
      ALTER TABLE contas_financeiras 
      ADD COLUMN data_ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Atualizar registros existentes
    await query(`
      UPDATE contas_financeiras 
      SET data_ultima_atualizacao = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
      WHERE data_ultima_atualizacao IS NULL
    `);

    return NextResponse.json({
      success: true,
      message: 'Coluna data_ultima_atualizacao adicionada com sucesso!',
      alreadyExists: false
    });
  } catch (error: any) {
    console.error('Erro ao adicionar coluna:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Erro ao executar migration'
      },
      { status: 500 }
    );
  }
}







