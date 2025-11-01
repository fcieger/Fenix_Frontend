import { NextRequest, NextResponse } from 'next/server';
import { initializeTables } from '@/lib/database';
import { transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';
import { ensureHistorySchema } from '@/lib/history';
import { addCorsHeaders, handleCors } from '@/lib/cors';
import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    console.log('🚀 Iniciando inicialização COMPLETA do banco de dados...');

    // 1. Inicializar tabelas core (users, companies, user_companies)
    await initializeTables();
    console.log('✅ Tabelas core inicializadas');

    // 2. Executar schema completo (todas as tabelas)
    console.log('🔧 Executando schema completo...');
    const schemaCompletoPath = join(process.cwd(), 'src', 'lib', 'schema-completo.sql');
    const schemaCompleto = readFileSync(schemaCompletoPath, 'utf8');
    
    // Dividir por ; e executar cada statement individualmente
    const statements = schemaCompleto.split(';').filter(s => {
      const trimmed = s.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--');
    });
    
    let executedStatements = 0;
    let skippedStatements = 0;
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed.length > 0) {
        try {
          await query(trimmed);
          executedStatements++;
        } catch (err: any) {
          // Ignorar erros de tabelas já existentes ou constraints duplicadas
          if (err.message.includes('already exists') || 
              err.message.includes('duplicate') ||
              err.message.includes('relation already exists')) {
            skippedStatements++;
            // Silenciar - tabela já existe (comportamento esperado)
          } else if (!err.message.includes('does not exist')) {
            console.warn('⚠️ Erro ao executar statement:', err.message.substring(0, 150));
          }
        }
      }
    }
    
    console.log(`✅ Schema completo executado (${executedStatements} criados, ${skippedStatements} já existiam)`);

    // 3. Aplicar migrations adicionais (estoque, financeiro, etc)
    console.log('🔧 Aplicando migrations adicionais...');
    await transaction(async (client) => {
      await ensureCoreSchema(client);
      await ensureHistorySchema(client);
    });
    console.log('✅ Migrations aplicadas');

    // 4. Verificar tabelas criadas
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const createdTables = tablesResult.rows.map(row => row.table_name);

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        message: 'Banco de dados inicializado COMPLETAMENTE com sucesso!',
        tablesCreated: createdTables.length,
        tables: createdTables
      })
    );
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    return addCorsHeaders(
      NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          details: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      )
    );
  }
}


