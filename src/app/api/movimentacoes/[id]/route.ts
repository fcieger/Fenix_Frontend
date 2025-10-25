import { NextRequest, NextResponse } from 'next/server';
import { MovimentacoesService } from '@/services/movimentacoes-service';
import { UpdateMovimentacaoRequest } from '@/types/movimentacao';

const movimentacoesService = new MovimentacoesService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const movimentacao = await movimentacoesService.getMovimentacaoById(id);
    
    if (!movimentacao) {
      return NextResponse.json(
        { success: false, error: 'Movimentação não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: movimentacao
    });
  } catch (error) {
    console.error('Erro ao buscar movimentação:', error);
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: UpdateMovimentacaoRequest = await request.json();
    
    const movimentacao = await movimentacoesService.updateMovimentacao(id, body);
    
    return NextResponse.json({
      success: true,
      data: movimentacao,
      message: 'Movimentação atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar movimentação:', error);
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const deleted = await movimentacoesService.deleteMovimentacao(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Movimentação não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Movimentação excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir movimentação:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

