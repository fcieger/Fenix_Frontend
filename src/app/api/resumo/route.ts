import { NextRequest, NextResponse } from 'next/server';
import { ContasService } from '@/services/contas-service';
import { MovimentacoesService } from '@/services/movimentacoes-service';
import { calculateResumoFinanceiro } from '@/utils/calculations';

const contasService = new ContasService();
const movimentacoesService = new MovimentacoesService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar contas da empresa
    const contas = await contasService.getContasByCompany(companyId);
    
    // Buscar todas as movimentações das contas
    const movimentacoes = await movimentacoesService.getMovimentacoes({
      conta_id: contas.map(conta => conta.id).join(',')
    });

    // Calcular resumo financeiro
    const resumo = calculateResumoFinanceiro(contas, movimentacoes);
    
    return NextResponse.json({
      success: true,
      data: resumo
    });
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

