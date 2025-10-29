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
    console.error('❌ Erro na API /api/contas:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const companyId = searchParams.get('company_id');

    if (action === 'atualizar-saldos') {
      if (!companyId) {
        return NextResponse.json(
          { error: 'company_id é obrigatório para atualizar saldos' },
          { status: 400 }
        );
      }

      console.log(`🔄 Atualizando saldos para empresa ${companyId}...`);
      await contasService.atualizarTodosSaldos(companyId);

      return NextResponse.json({
        success: true,
        message: 'Saldos atualizados com sucesso'
      });
    }

    return NextResponse.json(
      { error: 'Ação não reconhecida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao atualizar saldos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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

