import { NextRequest, NextResponse } from 'next/server';
import { UserCompanyService } from '@/lib/database-service';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const { userId, companyId } = await request.json();
    
    if (!userId || !companyId) {
      return NextResponse.json(
        { message: 'userId e companyId são obrigatórios' },
        { status: 400 }
      );
    }

    // Vincular usuário à empresa
    await UserCompanyService.addUserToCompany(userId, companyId);

    return NextResponse.json(
      { message: 'Usuário vinculado à empresa com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao vincular usuário à empresa:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

