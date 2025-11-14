import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query } from '@/lib/database';

/**
 * GET /api/produtos/debug
 * 
 * Endpoint de diagnóstico para verificar produtos no banco
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || searchParams.get('company_id');
    const searchCode = searchParams.get('code') || '1';

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId é obrigatório' },
        { status: 400 }
      );
    }

    // Validar acesso
    const acesso = await validateUserAccess(token, companyId);
    if (!acesso.valid) {
      return NextResponse.json(
        { success: false, error: acesso.error || 'Acesso negado' },
        { status: 403 }
      );
    }

    // 1. Verificar se a tabela existe
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'produtos'
      )
    `);

    // 2. Listar todos os produtos da empresa (primeiros 20)
    const allProducts = await query(`
      SELECT 
        id,
        codigo,
        nome,
        "companyId",
        "isActive",
        LENGTH(codigo) as codigo_length,
        TRIM(codigo) as codigo_trim,
        codigo::text as codigo_text,
        typeof(codigo) as codigo_type
      FROM produtos
      WHERE "companyId" = $1::uuid
      ORDER BY "createdAt" DESC
      LIMIT 20
    `, [companyId]);

    // 3. Buscar especificamente por código "1"
    const searchForOne = await query(`
      SELECT 
        id,
        codigo,
        nome,
        LENGTH(codigo) as codigo_length,
        TRIM(codigo) as codigo_trim,
        codigo::text as codigo_text
      FROM produtos
      WHERE "companyId" = $1::uuid
        AND ("isActive" IS NULL OR "isActive" = true)
        AND (
          codigo = $2 OR
          codigo::text = $2 OR
          TRIM(codigo) = $2 OR
          TRIM(COALESCE(codigo, '')) = $2
        )
    `, [companyId, searchCode]);

    // 4. Contar total de produtos
    const countTotal = await query(`
      SELECT COUNT(*) as total
      FROM produtos
      WHERE "companyId" = $1::uuid
        AND ("isActive" IS NULL OR "isActive" = true)
        AND codigo IS NOT NULL
        AND TRIM(codigo) != ''
    `, [companyId]);

    // 5. Listar códigos únicos (primeiros 10)
    const uniqueCodes = await query(`
      SELECT DISTINCT 
        codigo,
        LENGTH(codigo) as length,
        TRIM(codigo) as trimmed
      FROM produtos
      WHERE "companyId" = $1::uuid
        AND ("isActive" IS NULL OR "isActive" = true)
        AND codigo IS NOT NULL
      ORDER BY codigo
      LIMIT 10
    `, [companyId]);

    return NextResponse.json({
      success: true,
      tableExists: tableExists.rows[0]?.exists || false,
      totalProducts: parseInt(countTotal.rows[0]?.total || '0'),
      searchCode: searchCode,
      searchResults: searchForOne.rows.length,
      productsFound: searchForOne.rows,
      allProducts: allProducts.rows.map((r: any) => ({
        id: r.id,
        codigo: r.codigo,
        codigoLength: r.codigo_length,
        codigoTrim: r.codigo_trim,
        codigoText: r.codigo_text,
        codigoMatchesSearch: r.codigo === searchCode || r.codigo_trim === searchCode,
        nome: r.nome,
        isActive: r.isActive
      })),
      uniqueCodes: uniqueCodes.rows.map((r: any) => ({
        codigo: r.codigo,
        length: r.length,
        trimmed: r.trimmed,
        matchesSearch: r.codigo === searchCode || r.trimmed === searchCode
      }))
    });
  } catch (error: any) {
    console.error('❌ Erro no debug de produtos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro desconhecido',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}







