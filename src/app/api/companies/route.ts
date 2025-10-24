import { NextRequest, NextResponse } from 'next/server';
import { CompanyService } from '@/lib/database-service';
import { initializeTables } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Inicializar tabelas se necessário
    await initializeTables();

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    // Retornar todas as empresas ativas do banco de dados
    const companies = await CompanyService.getAll();
    const activeCompanies = companies.filter(company => company.isActive);
    
    return NextResponse.json(activeCompanies);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Inicializar tabelas se necessário
    await initializeTables();

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const companyData = await request.json();
    
    // Validar dados obrigatórios
    if (!companyData.name || !companyData.cnpj) {
      return NextResponse.json(
        { message: 'Nome e CNPJ são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se CNPJ já existe
    const existingCompany = await CompanyService.findByCnpj(companyData.cnpj);
    if (existingCompany) {
      return NextResponse.json(
        { message: 'CNPJ já está em uso por outra empresa' },
        { status: 400 }
      );
    }

    // Criar nova empresa no banco de dados
    const newCompany = await CompanyService.create({
      uuid: `company-${Date.now()}`,
      name: companyData.name,
      cnpj: companyData.cnpj,
      token: `company-token-${Date.now()}`,
      isActive: true,
      founded: companyData.founded || '',
      nature: companyData.nature || '',
      size: companyData.size || '',
      status: companyData.status || '',
      mainActivity: companyData.mainActivity || '',
      address: companyData.address || {},
      phones: companyData.phones || [],
      emails: companyData.emails || [],
      members: companyData.members || []
    });

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
