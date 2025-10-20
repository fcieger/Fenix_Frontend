import { NextRequest, NextResponse } from 'next/server';

// Mock de dados do usuário baseados no register
const mockUsers = [
  {
    id: '2b866126-8cfa-4c8d-b5fb-a91e5cc4c18b',
    name: 'Fabio Ieger',
    email: 'teste@ieger.com.br',
    phone: '(12) 21212-121212121221',
    password: '123456', // Em produção, seria hash
    isActive: true,
    role: 'Administrador',
    companies: [
      {
        id: '2c650c76-4e2a-4b58-933c-c3f8b7434d80',
        name: 'fabio Ieger',
        cnpj: '042.503.009-19',
        token: '4505963cffe3851dd81a8eb5cb67e38f9dfddb57f48593324e46d70cfadd5b0a',
        isActive: true
      }
    ]
  },
  {
    id: '2b866126-8cfa-4c8d-b5fb-a91e5cc4c18b',
    name: 'João Silva',
    email: 'joao.silva@certus.com.br',
    phone: '(11) 99999-9999',
    password: '123456', // Em produção, seria hash
    isActive: true,
    role: 'Administrador',
    companies: [
      {
        id: '2c650c76-4e2a-4b58-933c-c3f8b7434d80',
        name: 'Certus Empresa',
        cnpj: '12.345.678/0001-90',
        token: 'company-token-123',
        isActive: true
      }
    ]
  }
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Buscar usuário pelo email
    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar senha (em produção, comparar hash)
    if (user.password !== password) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Gerar token JWT (em produção, usar biblioteca JWT)
    const access_token = `mock-jwt-token-${user.id}-${Date.now()}`;

    // Retornar dados do usuário sem a senha
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      access_token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
