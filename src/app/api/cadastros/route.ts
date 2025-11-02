import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/cadastros
 * 
 * Retorna lista de cadastros do banco de dados.
 * Se não tiver token, retorna erro de autenticação.
 * Se tiver token, busca do banco usando companyId do token ou query param.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    
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

    // Garantir que schema existe
    try {
      await transaction(async (client) => {
        await ensureCoreSchema(client);
      });
    } catch (schemaError: any) {
      console.warn('⚠️ Erro ao garantir schema (continuando):', schemaError?.message);
    }

    // Se não tiver companyId, retornar erro
    if (!companyId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'company_id é obrigatório' 
        },
        { status: 400 }
      );
    }

    // Buscar cadastros do banco de dados
    const result = await query(
      `SELECT 
        id, 
        "nomeRazaoSocial", 
        "nomeFantasia", 
        cnpj, 
        cpf, 
        email, 
        telefone, 
        "tipoPessoa",
        "createdAt",
        "updatedAt"
      FROM cadastros 
      WHERE "companyId" = $1::uuid
      ORDER BY "nomeRazaoSocial" ASC`,
      [companyId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Erro na API /api/cadastros:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cadastros
 * 
 * Cria um novo cadastro no banco de dados.
 * Redireciona para o backend NestJS se NEXT_PUBLIC_API_URL estiver configurado.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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

    // Se tiver NEXT_PUBLIC_API_URL configurado, redirecionar para backend NestJS
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cadastros`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify(body),
        });

        if (!backendResponse.ok) {
          const errorData = await backendResponse.json().catch(() => ({ message: 'Erro ao criar cadastro no backend' }));
          throw new Error(errorData.message || `Erro ${backendResponse.status}`);
        }

        const data = await backendResponse.json();
        return NextResponse.json({
          success: true,
          data: data,
          message: 'Cadastro criado com sucesso'
        }, { status: 201 });
      } catch (fetchError: any) {
        console.error('❌ Erro ao chamar backend NestJS:', fetchError);
        // Se falhar, continuar com criação local (fallback)
      }
    }

    // Fallback: Criar no banco local diretamente
    const { companyId, ...cadastroData } = body;
    
    if (!companyId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'companyId é obrigatório' 
        },
        { status: 400 }
      );
    }

    // Garantir que schema existe
    try {
      await transaction(async (client) => {
        await ensureCoreSchema(client);
      });
    } catch (schemaError: any) {
      console.warn('⚠️ Erro ao garantir schema (continuando):', schemaError?.message);
    }

    // Inserir cadastro no banco
    const insertResult = await query(
      `INSERT INTO cadastros (
        "companyId", 
        "nomeRazaoSocial", 
        "nomeFantasia", 
        cnpj, 
        cpf, 
        email, 
        telefone, 
        "tipoPessoa"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        companyId,
        cadastroData.nomeRazaoSocial || cadastroData.nome || '',
        cadastroData.nomeFantasia || null,
        cadastroData.cnpj || null,
        cadastroData.cpf || null,
        cadastroData.email || null,
        cadastroData.telefone || cadastroData.phone || null,
        cadastroData.tipoPessoa || (cadastroData.cnpj ? 'juridica' : 'fisica')
      ]
    );

    return NextResponse.json({
      success: true,
      data: insertResult.rows[0],
      message: 'Cadastro criado com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Erro ao criar cadastro:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}



