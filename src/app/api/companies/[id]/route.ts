import { NextRequest, NextResponse } from 'next/server';
import { CompanyService } from '@/lib/database-service';
import { initializeTables } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    
    // Buscar empresa por ID no banco de dados
    const company = await CompanyService.findById(id);
    
    if (!company) {
      return NextResponse.json(
        { message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const updateData = await request.json();
    
    // Buscar empresa por ID
    const existingCompany = await CompanyService.findById(id);
    
    if (!existingCompany) {
      return NextResponse.json(
        { message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se CNPJ já existe em outra empresa
    if (updateData.cnpj && updateData.cnpj !== existingCompany.cnpj) {
      const companyWithCnpj = await CompanyService.findByCnpj(updateData.cnpj);
      if (companyWithCnpj && companyWithCnpj.id !== id) {
        return NextResponse.json(
          { message: 'CNPJ já está em uso por outra empresa' },
          { status: 400 }
        );
      }
    }

    // Atualizar empresa no banco de dados
    const updatedCompany = await CompanyService.update(id, updateData);

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Buscar empresa por ID
    const companyIndex = mockCompanies.findIndex(c => c.id === id && c.isActive);
    
    if (companyIndex === -1) {
      return NextResponse.json(
        { message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Marcar como inativa (soft delete)
    mockCompanies[companyIndex].isActive = false;
    mockCompanies[companyIndex].updatedAt = new Date().toISOString();

    return NextResponse.json({ message: 'Empresa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
