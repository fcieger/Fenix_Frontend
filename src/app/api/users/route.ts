import { NextRequest, NextResponse } from 'next/server';
import { UserService, UserCompanyService } from '@/lib/database-service';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    // Parâmetros de query para paginação e filtros
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const companyId = searchParams.get('company_id') || '';

    let users;

    // Se company_id for fornecido, buscar apenas usuários daquela empresa
    if (companyId) {
      users = await UserCompanyService.getCompanyUsers(companyId);
    } else {
      // Buscar todos os usuários do banco
      users = await UserService.getAll();
    }
    
    // Para cada usuário, buscar suas empresas
    const usersWithCompanies = await Promise.all(
      users.map(async (user) => {
        const companies = await UserCompanyService.getUserCompanies(user.id!);
        return {
          ...user,
          companies: companies
        };
      })
    );

    // Filtrar usuários
    let filteredUsers = usersWithCompanies;

    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.phone && user.phone.includes(search))
      );
    }

    if (status) {
      filteredUsers = filteredUsers.filter(user => 
        status === 'active' ? user.isActive : !user.isActive
      );
    }

    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Resposta com metadados de paginação
    const response = {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
        hasNext: endIndex < filteredUsers.length,
        hasPrev: page > 1
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const userData = await request.json();
    
    // Validar dados obrigatórios
    if (!userData.name || !userData.email || !userData.phone) {
      return NextResponse.json(
        { message: 'Nome, email e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = await UserService.findByEmail(userData.email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email já está em uso' },
        { status: 400 }
      );
    }

    // Criar novo usuário no banco
    const newUser = await UserService.create({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password || '123456', // Senha padrão
      isActive: true
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}