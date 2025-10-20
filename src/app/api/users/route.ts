import { NextRequest, NextResponse } from 'next/server';

// Simulação de dados do banco de dados baseados no register
const mockUsers = [
  {
    id: '2b866126-8cfa-4c8d-b5fb-a91e5cc4c18b',
    name: 'João Silva',
    email: 'joao.silva@certus.com.br',
    phone: '(11) 99999-9999',
    isActive: true,
    role: 'Administrador',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-01-20T14:22:00Z',
    companies: [
      {
        id: '2c650c76-4e2a-4b58-933c-c3f8b7434d80',
        name: 'Certus Empresa',
        cnpj: '12.345.678/0001-90',
        isActive: true
      }
    ]
  },
  {
    id: '3c977237-9dfb-5d9e-c6gc-b92f6dd5d29c',
    name: 'Maria Santos',
    email: 'maria.santos@certus.com.br',
    phone: '(11) 88888-8888',
    isActive: true,
    role: 'Usuário',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    lastLogin: '2024-01-19T11:30:00Z',
    companies: [
      {
        id: '2c650c76-4e2a-4b58-933c-c3f8b7434d80',
        name: 'Certus Empresa',
        cnpj: '12.345.678/0001-90',
        isActive: true
      }
    ]
  },
  {
    id: '4d088348-ae0c-6e0f-d7hd-c03g7ee6e30d',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@certus.com.br',
    phone: '(11) 77777-7777',
    isActive: false,
    role: 'Usuário',
    createdAt: '2024-01-17T14:20:00Z',
    updatedAt: '2024-01-19T10:15:00Z',
    lastLogin: '2024-01-18T09:45:00Z',
    companies: [
      {
        id: '2c650c76-4e2a-4b58-933c-c3f8b7434d80',
        name: 'Certus Empresa',
        cnpj: '12.345.678/0001-90',
        isActive: true
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    // Verificar se há token de autenticação
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

    // Filtrar usuários
    let filteredUsers = mockUsers;

    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.phone.includes(search)
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
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email já está em uso' },
        { status: 400 }
      );
    }

    // Criar novo usuário
    const newUser = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      isActive: true,
      role: userData.role || 'Usuário',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
      companies: userData.companies || []
    };

    mockUsers.push(newUser);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
