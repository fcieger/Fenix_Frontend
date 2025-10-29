import { NextRequest, NextResponse } from 'next/server';
import { PrazosPagamentoService } from '@/services/prazos-pagamento-service';

const prazosPagamentoService = new PrazosPagamentoService();

// GET /api/prazos-pagamento - Listar prazos de pagamento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    const prazosPagamento = await prazosPagamentoService.getPrazosPagamento(companyId);
    
    return NextResponse.json({
      success: true,
      data: prazosPagamento
    });
  } catch (error) {
    console.error('Erro ao buscar prazos de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/prazos-pagamento - Criar novo prazo de pagamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validações básicas
    if (!body.nome || !body.company_id) {
      return NextResponse.json(
        { error: 'Nome e company_id são obrigatórios' },
        { status: 400 }
      );
    }

    const prazoPagamento = await prazosPagamentoService.createPrazoPagamento(body);
    
    return NextResponse.json({
      success: true,
      data: prazoPagamento
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar prazo de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

