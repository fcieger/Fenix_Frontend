import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query } from '@/lib/database';

/**
 * GET /api/produtos
 * 
 * Busca produtos por código, código de barras ou nome
 * Processo:
 * 1. Usuário digita código/código de barras e aperta Enter
 * 2. Sistema consulta banco de dados de produtos
 * 3. Retorna o produto encontrado
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticação
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
    const search = searchParams.get('search') || searchParams.get('query') || '';
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId é obrigatório' },
        { status: 400 }
      );
    }

    if (!search || search.trim().length === 0) {
      return NextResponse.json([]);
    }

    // 2. Validar acesso do usuário
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

    // 3. Consultar banco de dados de produtos
    const searchTerm = search.trim();
    
    // Construir query SQL - busca simples e direta
    // IMPORTANTE: A tabela produtos tem 'sku' (não 'codigo') e 'ativo' (não 'isActive')
    let querySQL = `
      SELECT 
        id,
        "companyId",
        sku as codigo,
        "codigoBarras",
        nome,
        descricao,
        "unidadeMedida" as unidade,
        ncm,
        cest,
        preco,
        custo as "precoCusto",
        ativo as "isActive",
        "createdAt",
        "updatedAt"
      FROM produtos
      WHERE "companyId" = $1::uuid
        AND (ativo IS NULL OR ativo = true)
        AND sku IS NOT NULL
        AND TRIM(sku) != ''
    `;
    
    const params: any[] = [companyId];
    
    // Buscar por código exato OU código parcial OU nome OU descrição
    // Adicionar o termo de busca sem % para busca exata
    params.push(searchTerm); // $2 - para busca exata
    params.push(`%${searchTerm}%`); // $3 - para busca parcial
    
    // Usar TRIM para garantir que espaços em branco sejam ignorados
    // Adicionar múltiplas formas de comparação para garantir que encontre
    // IMPORTANTE: Buscar em 'sku' e 'codigoBarras' (campos reais da tabela)
    querySQL += ` AND (
      TRIM(COALESCE(sku, '')) = $2 OR
      sku = $2 OR
      sku::text = $2 OR
      TRIM(sku)::text = $2 OR
      COALESCE(sku, '')::text = $2 OR
      TRIM(COALESCE(sku, ''))::text = $2 OR
      TRIM(COALESCE("codigoBarras", '')) = $2 OR
      "codigoBarras" = $2 OR
      "codigoBarras"::text = $2 OR
      TRIM(COALESCE(sku, '')) ILIKE $3 OR
      sku ILIKE $3 OR
      TRIM(sku) ILIKE $3 OR
      TRIM(COALESCE("codigoBarras", '')) ILIKE $3 OR
      "codigoBarras" ILIKE $3 OR
      nome ILIKE $3 OR
      COALESCE(descricao, '') ILIKE $3
    )`;
    
    // Ordenar: código exato primeiro, depois por nome
    querySQL += ` ORDER BY 
      CASE 
        WHEN TRIM(sku) = $2 THEN 1
        WHEN sku = $2 THEN 2
        WHEN sku::text = $2 THEN 3
        WHEN TRIM(sku)::text = $2 THEN 4
        WHEN TRIM(COALESCE("codigoBarras", '')) = $2 THEN 5
        WHEN "codigoBarras" = $2 THEN 6
        WHEN TRIM(sku) ILIKE $3 THEN 7
        WHEN sku ILIKE $3 THEN 8
        WHEN TRIM(COALESCE("codigoBarras", '')) ILIKE $3 THEN 9
        WHEN "codigoBarras" ILIKE $3 THEN 10
        WHEN nome ILIKE $3 THEN 11
        ELSE 12
      END,
      nome ASC 
      LIMIT 100`;

    console.log('📝 Buscando produtos:', {
      companyId,
      search: searchTerm,
      searchLength: searchTerm.length,
      querySQL,
      params: params.map((p, i) => `$${i + 1}: ${JSON.stringify(p)}`)
    });

    try {
      const result = await query(querySQL, params);
      
      console.log(`✅ ${result.rows.length} produtos encontrados para: "${searchTerm}"`);
      
      // Log detalhado dos resultados para debug
      if (result.rows.length > 0) {
        console.log('📦 Produtos encontrados:', result.rows.map((r: any) => ({
          id: r.id,
          codigo: r.codigo,
          codigoLength: r.codigo?.length,
          codigoTrim: r.codigo?.trim(),
          nome: r.nome
        })));
      } else {
        // Se não encontrou nada, fazer uma busca diagnóstica
        const diagnosticQuery = `
          SELECT sku as codigo, nome, "companyId", ativo
          FROM produtos
          WHERE "companyId" = $1::uuid
            AND (ativo IS NULL OR ativo = true)
          LIMIT 5
        `;
        try {
          const diagnosticResult = await query(diagnosticQuery, [companyId]);
          console.log('🔍 Diagnóstico - Produtos na empresa:', diagnosticResult.rows.map((r: any) => ({
            codigo: r.codigo,
            codigoType: typeof r.codigo,
            codigoValue: JSON.stringify(r.codigo),
            nome: r.nome,
            ativo: r.ativo
          })));
          
          // Tentar buscar especificamente por "1"
          const searchOneQuery = `
            SELECT sku, nome
            FROM produtos
            WHERE "companyId" = $1::uuid
              AND (ativo IS NULL OR ativo = true)
              AND sku = '1'
            LIMIT 1
          `;
          const searchOneResult = await query(searchOneQuery, [companyId]);
          console.log('🔍 Busca específica por "1":', searchOneResult.rows.length > 0 ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
          if (searchOneResult.rows.length > 0) {
            console.log('  Produto encontrado:', searchOneResult.rows[0]);
          }
        } catch (diagError: any) {
          console.error('❌ Erro no diagnóstico:', diagError.message);
        }
      }

      // 4. Mapear resultado para o formato esperado
      const produtos = result.rows.map((row: any) => ({
        id: row.id,
        companyId: row.companyId,
        codigo: row.codigo || null, // já é o sku mapeado
        nome: row.nome || 'Sem nome',
        descricao: row.descricao || null,
        unidade: row.unidade || 'UN',
        ncm: row.ncm || null,
        cest: row.cest || null,
        cfop: null, // não existe na tabela antiga
        preco: row.preco ? parseFloat(String(row.preco)) : 0,
        precoCusto: row.precoCusto ? parseFloat(String(row.precoCusto)) : 0,
        controlaEstoque: true, // assumir true por padrão
        estoqueMinimo: 0, // não existe na tabela antiga
        localPadraoId: null, // não existe na tabela antiga
        isActive: row.isActive !== false,
        // Para compatibilidade com código existente
        ean: null,
        codigoBarras: row.codigoBarras || null, // usar codigoBarras real
        estoque: null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      }));

      console.log(`✅ Retornando ${produtos.length} produtos mapeados`);

      return NextResponse.json(produtos);
    } catch (queryError: any) {
      console.error('❌ Erro ao executar query de produtos:', queryError);
      console.error('❌ Stack:', queryError?.stack);
      console.error('❌ Query:', querySQL);
      console.error('❌ Params:', params);
      
      // Se a tabela não existir, retornar array vazio
      if (queryError.message?.includes('does not exist') || 
          queryError.message?.includes('não existe')) {
        console.warn('⚠️ Tabela produtos não existe, retornando array vazio');
        return NextResponse.json([]);
      }
      
      throw queryError;
    }
  } catch (error: any) {
    console.error('❌ Erro ao listar produtos:', error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Error name:', error?.name);
    console.error('❌ Error code:', error?.code);
    
    // Em caso de erro, retornar array vazio em vez de erro 500
    // Isso evita quebrar o frontend
    return NextResponse.json([]);
  }
}

/**
 * POST /api/produtos
 * 
 * Cria um novo produto no banco de dados
 * Processo:
 * 1. Frontend envia dados do produto (incluindo sku que será mapeado para codigo)
 * 2. Sistema valida e salva no banco de dados
 * 3. Retorna o produto criado
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
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
    
    // Extrair dados do body
    const {
      nome,
      sku, // Campo do frontend que será mapeado para codigo
      codigo, // Pode vir diretamente também
      codigoBarras,
      descricao,
      unidadeMedida,
      ncm,
      cest,
      cfop,
      precoVenda,
      preco,
      precoCusto,
      custo,
      controlaEstoque,
      estoqueMinimo,
      localPadraoId,
      isActive,
      companyId
    } = body;

    // Validar campos obrigatórios
    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome do produto é obrigatório' },
        { status: 400 }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId é obrigatório' },
        { status: 400 }
      );
    }

    // Mapear sku para codigo (o banco espera codigo, não sku)
    const codigoProduto = codigo || sku || `PROD-${Date.now()}`; // Se não tiver código, gerar um
    
    if (!codigoProduto || !codigoProduto.trim()) {
      return NextResponse.json(
        { success: false, error: 'Código do produto é obrigatório (sku ou codigo)' },
        { status: 400 }
      );
    }

    // 2. Validar acesso do usuário
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

    // 3. Verificar se código já existe
    try {
      const codigoExistente = await query(
        `SELECT id FROM produtos WHERE codigo = $1 AND "companyId" = $2::uuid`,
        [codigoProduto.trim(), companyId]
      );
      
      if (codigoExistente.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: `Código "${codigoProduto}" já está em uso` },
          { status: 400 }
        );
      }
    } catch (e: any) {
      // Se der erro na verificação, continuar (pode ser que a tabela não exista ainda)
      console.warn('⚠️ Erro ao verificar código existente:', e?.message);
    }

    // 4. Inserir produto no banco de dados
    const querySQL = `
      INSERT INTO produtos (
        "companyId",
        codigo,
        nome,
        descricao,
        "unidadeMedida",
        ncm,
        cest,
        cfop,
        "precoVenda",
        "precoCusto",
        "controlaEstoque",
        "estoqueMinimo",
        "localPadraoId",
        "isActive"
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
        $12,
        $13::uuid,
        $14
      )
      RETURNING *
    `;

    const params = [
      companyId,
      codigoProduto.trim(), // IMPORTANTE: usar codigo, não sku
      nome.trim(),
      descricao?.trim() || null,
      unidadeMedida || 'UN',
      ncm?.trim() || null,
      cest?.trim() || null,
      cfop?.trim() || null,
      precoVenda ? parseFloat(String(precoVenda)) : (preco ? parseFloat(String(preco)) : 0),
      precoCusto ? parseFloat(String(precoCusto)) : (custo ? parseFloat(String(custo)) : 0),
      controlaEstoque !== false,
      estoqueMinimo ? parseFloat(String(estoqueMinimo)) : 0,
      localPadraoId || null,
      isActive !== false
    ];

    console.log('📝 Criando produto:', {
      companyId,
      codigo: codigoProduto,
      nome,
      querySQL,
      params: params.map((p, i) => `$${i + 1}: ${p}`)
    });

    try {
      const result = await query(querySQL, params);
      
      const produto = result.rows[0];
      
      console.log(`✅ Produto criado com sucesso:`, {
        id: produto.id,
        codigo: produto.codigo,
        nome: produto.nome
      });

      // Mapear para formato esperado pelo frontend
      const produtoResponse = {
        id: produto.id,
        companyId: produto.companyId,
        codigo: produto.codigo,
        nome: produto.nome,
        descricao: produto.descricao || null,
        unidade: produto.unidadeMedida || 'UN',
        ncm: produto.ncm || null,
        cest: produto.cest || null,
        cfop: produto.cfop || null,
        preco: produto.precoVenda ? parseFloat(String(produto.precoVenda)) : 0,
        precoCusto: produto.precoCusto ? parseFloat(String(produto.precoCusto)) : 0,
        controlaEstoque: produto.controlaEstoque !== false,
        estoqueMinimo: produto.estoqueMinimo ? parseFloat(String(produto.estoqueMinimo)) : 0,
        localPadraoId: produto.localPadraoId || null,
        isActive: produto.isActive !== false,
        // Compatibilidade
        sku: produto.codigo, // Para compatibilidade com frontend
        codigoBarras: codigoBarras || produto.codigo || null,
        createdAt: produto.createdAt,
        updatedAt: produto.updatedAt
      };

      return NextResponse.json(produtoResponse, { status: 201 });
    } catch (queryError: any) {
      console.error('❌ Erro ao criar produto:', queryError);
      console.error('❌ Stack:', queryError?.stack);
      console.error('❌ Query:', querySQL);
      console.error('❌ Params:', params);
      
      // Se for erro de constraint única (código duplicado)
      if (queryError.code === '23505' || queryError.message?.includes('unique') || queryError.message?.includes('duplicate')) {
        return NextResponse.json(
          { success: false, error: `Código "${codigoProduto}" já está em uso` },
          { status: 400 }
        );
      }
      
      // Se a tabela não existir
      if (queryError.message?.includes('does not exist') || 
          queryError.message?.includes('não existe')) {
        return NextResponse.json(
          { success: false, error: 'Tabela produtos não existe no banco de dados' },
          { status: 500 }
        );
      }
      
      throw queryError;
    }
  } catch (error: any) {
    console.error('❌ Erro ao criar produto:', error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Error name:', error?.name);
    console.error('❌ Error code:', error?.code);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error?.stack,
          details: error
        })
      },
      { status: 500 }
    );
  }
}
