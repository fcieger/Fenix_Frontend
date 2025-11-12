import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/natureza-operacao
 * 
 * Lista todas as naturezas de operação da empresa
 */
export async function GET(request: NextRequest) {
  try {
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de autenticação necessário'
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || searchParams.get('company_id');
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId é obrigatório' },
        { status: 400 }
      );
    }

    // Validar acesso
    const acesso = await validateUserAccess(token, companyId);
    if (!acesso.valid) {
      const statusCode = acesso.error?.includes('Token') || acesso.error?.includes('não fornecido') ? 401 : 403;
      return NextResponse.json(
        { 
          success: false, 
          error: acesso.error || 'Acesso negado'
        },
        { status: statusCode }
      );
    }

    // Verificar se a tabela existe
    try {
      await query(`
        SELECT 1 FROM natureza_operacao LIMIT 1
      `);
    } catch (e: any) {
      // Se a tabela não existir, retornar array vazio
      console.warn('⚠️ Tabela natureza_operacao não encontrada, retornando array vazio');
      return NextResponse.json([]);
    }

    // Buscar naturezas de operação
    const habilitadas = searchParams.get('habilitadas') === 'true';
    let querySQL = `
      SELECT 
        id,
        "companyId",
        nome,
        cfop,
        COALESCE(tipo, 'vendas') as tipo,
        COALESCE("movimentaEstoque", true) as "movimentaEstoque",
        COALESCE(habilitado, true) as habilitado,
        "considerarOperacaoComoFaturamento",
        "destacarTotalImpostosIBPT",
        "gerarContasReceberPagar",
        "tipoDataContasReceberPagar",
        "informacoesAdicionaisFisco",
        "informacoesAdicionaisContribuinte",
        "createdAt",
        "updatedAt"
      FROM natureza_operacao
      WHERE "companyId" = $1::uuid
    `;
    
    const params: any[] = [companyId];
    
    if (habilitadas) {
      querySQL += ` AND (habilitado IS NULL OR habilitado = true)`;
    }
    
    querySQL += ` ORDER BY nome ASC`;

    console.log('📝 SQL Query:', querySQL);
    console.log('📝 Params:', params);

    const result = await query(querySQL, params);
    
    console.log(`✅ ${result.rows.length} naturezas encontradas no banco`);
    
    if (result.rows.length > 0) {
      console.log('📋 Primeira natureza de exemplo:', result.rows[0]);
    }

    // Mapear resultado para o formato esperado
    const naturezas = result.rows.map((row: any) => ({
      id: row.id,
      companyId: row.companyId,
      codigo: row.cfop || null,
      cfop: row.cfop || null,
      nome: row.nome,
      descricao: row.nome, // Para compatibilidade
      tipo: row.tipo || 'vendas',
      movimentaEstoque: row.movimentaEstoque !== false,
      habilitada: row.habilitado !== false,
      habilitado: row.habilitado !== false,
      considerarOperacaoComoFaturamento: row.considerarOperacaoComoFaturamento === true,
      destacarTotalImpostosIBPT: row.destacarTotalImpostosIBPT === true,
      gerarContasReceberPagar: row.gerarContasReceberPagar === true,
      tipoDataContasReceberPagar: row.tipoDataContasReceberPagar || null,
      informacoesAdicionaisFisco: row.informacoesAdicionaisFisco || null,
      informacoesAdicionaisContribuinte: row.informacoesAdicionaisContribuinte || null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));

    console.log(`✅ ${naturezas.length} naturezas de operação encontradas para companyId: ${companyId}`);

    return NextResponse.json(naturezas);
  } catch (error: any) {
    console.error('❌ Erro ao listar naturezas de operação:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/natureza-operacao
 * 
 * Cria uma nova natureza de operação
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/natureza-operacao INICIADO');
    
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    console.log('✅ ensureCoreSchema executado');

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de autenticação necessário'
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const body = await request.json();
    console.log('📦 POST body recebido:', JSON.stringify(body, null, 2));
    console.log('🔍 TIPO recebido:', {
      valor: body.tipo,
      tipo: typeof body.tipo,
      presente: 'tipo' in body,
      undefined: body.tipo === undefined
    });
    const companyId = body.companyId || body.company_id;
    
    // Validar tipo se fornecido
    const tiposValidos = ['compras', 'vendas', 'servicos', 'cupom_fiscal', 'ecommerce', 'devolucao_vendas', 'devolucao_compras', 'outras_movimentacoes'];
    console.log('🔍 Validando tipo. Valor recebido:', body.tipo);
    console.log('🔍 Tipos válidos:', tiposValidos);
    console.log('🔍 Tipo está na lista?', tiposValidos.includes(body.tipo));
    
    if (body.tipo && !tiposValidos.includes(body.tipo)) {
      console.error('❌ VALIDAÇÃO FALHOU - Tipo inválido recebido:', body.tipo);
      console.error('❌ Tipos válidos são:', tiposValidos.join(', '));
      return NextResponse.json(
        { 
          success: false, 
          error: `[BACKEND] tipo deve ser um dos seguintes valores: ${tiposValidos.join(', ')}. Recebido: '${body.tipo}'`
        },
        { status: 400 }
      );
    }
    
    console.log('✅ Validação de tipo passou!');
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.nome || !body.nome.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.cfop || !body.cfop.trim()) {
      return NextResponse.json(
        { success: false, error: 'CFOP é obrigatório' },
        { status: 400 }
      );
    }

    // Validar acesso
    const acesso = await validateUserAccess(token, companyId);
    if (!acesso.valid) {
      const statusCode = acesso.error?.includes('Token') || acesso.error?.includes('não fornecido') ? 401 : 403;
      return NextResponse.json(
        { 
          success: false, 
          error: acesso.error || 'Acesso negado'
        },
        { status: statusCode }
      );
    }


    // Criar natureza de operação
    console.log('💾 Executando INSERT no banco de dados...');
    console.log('💾 Tipo que será inserido:', body.tipo || 'vendas');
    
    const result = await query(`
      INSERT INTO natureza_operacao (
        "companyId",
        nome,
        cfop,
        tipo,
        "movimentaEstoque",
        habilitado,
        "considerarOperacaoComoFaturamento",
        "destacarTotalImpostosIBPT",
        "gerarContasReceberPagar",
        "tipoDataContasReceberPagar",
        "informacoesAdicionaisFisco",
        "informacoesAdicionaisContribuinte"
      ) VALUES (
        $1::uuid,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12
      )
      RETURNING *
    `, [
      companyId,
      body.nome.trim(),
      body.cfop.trim(),
      body.tipo || 'vendas',
      body.movimentaEstoque !== false,
      body.habilitado !== false,
      body.considerarOperacaoComoFaturamento === true,
      body.destacarTotalImpostosIBPT === true,
      body.gerarContasReceberPagar === true,
      body.tipoDataContasReceberPagar || null,
      body.informacoesAdicionaisFisco || null,
      body.informacoesAdicionaisContribuinte || null
    ]);
    
    console.log('💾 Query executada com sucesso.');

    const row = result.rows[0];
    
    const natureza = {
      id: row.id,
      companyId: row.companyId,
      codigo: row.cfop || null,
      cfop: row.cfop || null,
      nome: row.nome,
      descricao: row.nome,
      tipo: row.tipo || 'vendas',
      movimentaEstoque: row.movimentaEstoque !== false,
      habilitada: row.habilitado !== false,
      habilitado: row.habilitado !== false,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };

    return NextResponse.json(natureza, { status: 201 });
  } catch (error: any) {
    console.error('❌ ERRO CAPTURADO em POST natureza-operacao');
    console.error('❌ Tipo do erro:', typeof error);
    console.error('❌ Mensagem:', error.message);
    console.error('❌ Nome:', error.name);
    console.error('❌ Stack:', error.stack);
    console.error('❌ Erro completo:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        errorType: error.name || 'Unknown',
        errorDetails: error.toString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

