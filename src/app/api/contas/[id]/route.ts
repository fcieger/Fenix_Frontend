import { NextRequest, NextResponse } from 'next/server';
import { ContasService } from '@/services/contas-service';
import { UpdateContaFinanceiraRequest } from '@/types/conta';

const contasService = new ContasService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const conta = await contasService.getContaById(id);
    
    if (!conta) {
      return NextResponse.json(
        { success: false, error: 'Conta não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: conta
    });
  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateContaFinanceiraRequest = await request.json();
    
    const conta = await contasService.updateConta(id, body);
    
    return NextResponse.json({
      success: true,
      data: conta,
      message: 'Conta atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await contasService.deleteConta(id);
    
    return NextResponse.json({
      success: result.success,
      action: result.action,
      message: result.message
    });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}
