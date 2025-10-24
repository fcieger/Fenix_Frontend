import { NextRequest, NextResponse } from 'next/server';
import { UserService, CompanyService, UserCompanyService } from '@/lib/database-service';

export async function POST(request: NextRequest) {
  try {

    const { user, company } = await request.json();

    // Validar dados obrigatórios
    if (!user.name || !user.email || !user.phone || !user.password) {
      return NextResponse.json(
        { message: 'Nome, email, telefone e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (!company.name || !company.cnpj) {
      return NextResponse.json(
        { message: 'Nome da empresa e CNPJ são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = await UserService.findByEmail(user.email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email já está em uso' },
        { status: 400 }
      );
    }

    // Verificar se CNPJ já existe
    const existingCompany = await CompanyService.findByCnpj(company.cnpj);
    if (existingCompany) {
      return NextResponse.json(
        { message: 'CNPJ já está em uso por outra empresa' },
        { status: 400 }
      );
    }

    // Criar nova empresa no banco de dados
    const newCompany = await CompanyService.create({
      name: company.name,
      cnpj: company.cnpj,
      token: `company-token-${Date.now()}`,
      isActive: true,
      founded: company.founded || '',
      nature: company.nature || '',
      size: company.size || '',
      status: company.status || '',
      mainActivity: company.mainActivity || '',
      address: company.address || {},
      phones: company.phones || [],
      emails: company.emails || [],
      members: company.members || []
    });

    // Criar novo usuário no banco de dados
    const newUser = await UserService.create({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password, // Em produção, seria hash
      isActive: true
    });

    // Relacionar usuário com empresa
    await UserCompanyService.addUserToCompany(newUser.id!, newCompany.id!);

    // Gerar token JWT (em produção, usar biblioteca JWT)
    const access_token = `mock-jwt-token-${newUser.id}-${Date.now()}`;

    // Buscar usuário com empresas para retorno
    const userCompanies = await UserCompanyService.getUserCompanies(newUser.id!);

    // Retornar dados do usuário sem a senha
    const { password: _, ...userWithoutPassword } = {
      ...newUser,
      companies: userCompanies
    };

    return NextResponse.json({
      access_token,
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
