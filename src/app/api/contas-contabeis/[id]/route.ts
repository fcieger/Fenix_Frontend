import { NextRequest, NextResponse } from 'next/server';
import { ContasContabeisService } from '@/services/contas-contabeis-service';

const contasService = new ContasContabeisService();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const conta = await contasService.updateConta(params.id, body);
    
    return NextResponse.json({
      success: true,
      data: conta,
    });
  } catch (error) {
    console.error('Erro ao atualizar conta contábil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const conta = await contasService.deleteConta(params.id, body.ativo);
    
    return NextResponse.json({
      success: true,
      data: conta,
    });
  } catch (error) {
    console.error('Erro ao excluir conta contábil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
