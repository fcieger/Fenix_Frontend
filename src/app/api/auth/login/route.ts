import { NextRequest, NextResponse } from 'next/server';
import { UserService, UserCompanyService } from '@/lib/database-service';
import { initializeTables } from '@/lib/database';
import { addCorsHeaders, handleCors } from '@/lib/cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const body = await request.json().catch(() => null);
    
    if (!body || !body.email || !body.password) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Email e senha são obrigatórios' },
          { status: 400 }
        )
      );
    }

    const { email, password } = body;

    // Inicializar tabelas se necessário
    await initializeTables();

    // Buscar usuário por email
    const user = await UserService.findByEmail(email);
    
    if (!user) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Credenciais inválidas' },
          { status: 401 }
        )
      );
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return addCorsHeaders(
        NextResponse.json(
          { message: 'Credenciais inválidas' },
          { status: 401 }
        )
      );
    }

    // Buscar empresas do usuário
    const companies = await UserCompanyService.getUserCompanies(user.id!);

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        companyId: companies.length > 0 ? companies[0].id : null
      },
      process.env.JWT_SECRET || 'fenix-secret-key',
      { expiresIn: '24h' }
    );

    // Formatar empresas no formato esperado pelo frontend
    const formattedCompanies = companies.map(company => ({
      id: company.id,
      cnpj: company.cnpj,
      name: company.name,
      token: company.token || '',
      simplesNacional: company.status === 'simples_nacional' || false
    }));

    // Retornar dados do usuário sem a senha no formato esperado pelo frontend
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone || '',
        companies: formattedCompanies
      }
    });
    
    return addCorsHeaders(response);

  } catch (error) {
    console.error('Erro no login:', error);
    return addCorsHeaders(
      NextResponse.json(
        { 
          message: 'Erro interno do servidor',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        },
        { status: 500 }
      )
    );
  }
}
