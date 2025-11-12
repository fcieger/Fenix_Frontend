import { NextRequest, NextResponse } from 'next/server';
import { UserService, UserCompanyService } from '@/lib/database-service';
import { extractUserIdFromToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    
    // Extrair user ID do token (suporta JWT e formato mock)
    const userId = extractUserIdFromToken(token);
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }
    
    // Buscar usuário no banco
    const user = await UserService.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar empresas do usuário
    const companies = await UserCompanyService.getUserCompanies(user.id!);

    // Retornar dados do usuário sem a senha
    const { password: _, ...userWithoutPassword } = {
      ...user,
      companies: companies
    };

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar se há token de autenticação
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const updateData = await request.json();
    
    // Fazer requisição para o backend real
    const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { message: 'Token inválido ou expirado' },
          { status: 401 }
        );
      }
      
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Erro ao atualizar perfil' },
        { status: response.status }
      );
    }

    const updatedUser = await response.json();
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}