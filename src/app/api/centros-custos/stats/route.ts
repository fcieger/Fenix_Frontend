import { NextRequest, NextResponse } from 'next/server';
import { CentrosCustosService } from '@/services/centros-custos-service';
import { CentroCustoFilters } from '@/types/centro-custo';

const centrosCustosService = new CentrosCustosService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: CentroCustoFilters = {
      company_id: searchParams.get('company_id') || undefined
    };

    const stats = await centrosCustosService.getStats(filters);
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de centros de custos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

