import { NextRequest, NextResponse } from 'next/server';
import { CentrosCustosService } from '@/services/centros-custos-service';
import { CreateCentroCustoRequest, CentroCustoFilters } from '@/types/centro-custo';

const centrosCustosService = new CentrosCustosService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: CentroCustoFilters = {
      company_id: searchParams.get('company_id') || undefined,
      centro_pai_id: searchParams.get('centro_pai_id') === 'null' ? null : 
                     searchParams.get('centro_pai_id') || undefined,
      ativo: searchParams.get('ativo') ? searchParams.get('ativo') === 'true' : undefined,
      search: searchParams.get('search') || undefined
    };

    const centros = await centrosCustosService.getCentrosCustos(filters);
    
    return NextResponse.json({
      success: true,
      data: centros
    });
  } catch (error) {
    console.error('Erro ao buscar centros de custos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCentroCustoRequest = await request.json();
    
    // Validar campos obrigatórios
    if (!body.company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.codigo) {
      return NextResponse.json(
        { success: false, error: 'codigo é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.descricao) {
      return NextResponse.json(
        { success: false, error: 'descricao é obrigatória' },
        { status: 400 }
      );
    }

    const centro = await centrosCustosService.createCentroCusto(body);
    
    return NextResponse.json({
      success: true,
      data: centro
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar centro de custo:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

