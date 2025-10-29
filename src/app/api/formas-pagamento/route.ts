import { NextRequest, NextResponse } from 'next/server';
import { FormasPagamentoService } from '@/services/formas-pagamento-service';

const formasPagamentoService = new FormasPagamentoService();

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

    const formas = await formasPagamentoService.getFormasPagamento(companyId);
    
    return NextResponse.json({
      success: true,
      data: formas,
    });
  } catch (error) {
    console.error('Erro ao buscar formas de pagamento:', error);
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

    const forma = await formasPagamentoService.createFormaPagamento(body);
    
    return NextResponse.json({
      success: true,
      data: forma,
    });
  } catch (error) {
    console.error('Erro ao criar forma de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

