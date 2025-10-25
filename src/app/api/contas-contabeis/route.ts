import { NextRequest, NextResponse } from 'next/server';
import { ContasContabeisService } from '@/services/contas-contabeis-service';

const contasService = new ContasContabeisService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID é obrigatório' },
        { status: 400 }
      );
    }

    const contas = await contasService.getContas(companyId);
    
    return NextResponse.json({
      success: true,
      data: contas,
    });
  } catch (error) {
    console.error('Erro ao buscar contas contábeis:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.company_id) {
      return NextResponse.json(
        { error: 'Company ID é obrigatório' },
        { status: 400 }
      );
    }

    const conta = await contasService.createConta(body);
    
    return NextResponse.json({
      success: true,
      data: conta,
    });
  } catch (error) {
    console.error('Erro ao criar conta contábil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
