import { NextRequest, NextResponse } from 'next/server';
import { MovimentacoesService } from '@/services/movimentacoes-service';
import { CreateMovimentacaoRequest, MovimentacaoFilters } from '@/types/movimentacao';

const movimentacoesService = new MovimentacoesService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    
    const filters: MovimentacaoFilters = {
      conta_id: id,
      tipo_movimentacao: searchParams.get('tipo_movimentacao') || undefined,
      data_inicio: searchParams.get('data_inicio') || undefined,
      data_fim: searchParams.get('data_fim') || undefined,
      valor_min: searchParams.get('valor_min') ? parseFloat(searchParams.get('valor_min')!) : undefined,
      valor_max: searchParams.get('valor_max') ? parseFloat(searchParams.get('valor_max')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const movimentacoes = await movimentacoesService.getMovimentacoes(filters);
    
    return NextResponse.json({
      success: true,
      data: movimentacoes,
      total: movimentacoes.length
    });
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: CreateMovimentacaoRequest = await request.json();
    
    // Garantir que a conta_id seja a mesma do parâmetro
    body.conta_id = id;
    
    const movimentacao = await movimentacoesService.createMovimentacao(body);
    
    return NextResponse.json({
      success: true,
      data: movimentacao,
      message: 'Movimentação criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 400 }
    );
  }
}

