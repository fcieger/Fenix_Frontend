import { NextRequest, NextResponse } from 'next/server';
import { UserService, UserCompanyService } from '@/lib/database-service';

export async function GET(request: NextRequest) {
  try {
    const users = await UserService.getAll();
    
    const usersWithCompanies = await Promise.all(
      users.map(async (user) => {
        const companies = await UserCompanyService.getUserCompanies(user.id!);
        return {
          ...user,
          companies: companies
        };
      })
    );

    return NextResponse.json({
      users: usersWithCompanies,
      count: usersWithCompanies.length
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
