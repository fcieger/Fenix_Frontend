import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/database-service';
import { initializeTables } from '@/lib/database';
import { addCorsHeaders, handleCors } from '@/lib/cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const { email, password } = await request.json();

    // Inicializar tabelas se necessário
    await initializeTables();

    // Buscar usuário por email
    const user = await UserService.findByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        companyId: user.companyId 
      },
      process.env.JWT_SECRET || 'fenix-secret-key',
      { expiresIn: '24h' }
    );

    // Retornar dados do usuário sem a senha
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      user: userWithoutPassword,
      token,
      message: 'Login realizado com sucesso'
    });
    
    return addCorsHeaders(response);

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
