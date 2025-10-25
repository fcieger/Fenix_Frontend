import { NextRequest, NextResponse } from 'next/server';
import { CentrosCustosService } from '@/services/centros-custos-service';
import { UpdateCentroCustoRequest } from '@/types/centro-custo';

const centrosCustosService = new CentrosCustosService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const centro = await centrosCustosService.getCentroCustoById(params.id);
    
    if (!centro) {
      return NextResponse.json(
        { success: false, error: 'Centro de custo não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: centro
    });
  } catch (error) {
    console.error('Erro ao buscar centro de custo:', error);
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
    const body: UpdateCentroCustoRequest = await request.json();
    
    const centro = await centrosCustosService.updateCentroCusto(params.id, body);
    
    return NextResponse.json({
      success: true,
      data: centro
    });
  } catch (error) {
    console.error('Erro ao atualizar centro de custo:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await centrosCustosService.deleteCentroCusto(params.id);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao excluir centro de custo:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

