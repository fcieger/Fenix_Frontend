import { NextRequest, NextResponse } from 'next/server';
import { ContasService } from '@/services/contas-service';
import { CreateContaFinanceiraRequest, ContaFinanceiraFilters } from '@/types/conta';

const contasService = new ContasService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: ContaFinanceiraFilters = {
      company_id: searchParams.get('company_id') || undefined,
      tipo_conta: searchParams.get('tipo_conta') || undefined,
      status: searchParams.get('status') || undefined,
      banco_id: searchParams.get('banco_id') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const contas = await contasService.getContas(filters);
    
    return NextResponse.json({
      success: true,
      data: contas,
      total: contas.length
    });
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateContaFinanceiraRequest = await request.json();
    
    const conta = await contasService.createConta(body);
    
    return NextResponse.json({
      success: true,
      data: conta,
      message: 'Conta criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 400 }
    );
  }
}

