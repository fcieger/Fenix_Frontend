import { NextRequest, NextResponse } from 'next/server';
import { ContasService } from '@/services/contas-service';

export async function POST(request: NextRequest) {
  try {
    const { conta_id } = await request.json();
    
    const contasService = new ContasService();
    
    if (conta_id) {
      // Recalcular saldo de uma conta específica
      const saldoAtualizado = await contasService.atualizarSaldoAtual(conta_id);
      
      return NextResponse.json({
        success: true,
        data: {
          conta_id,
          saldo_atual: saldoAtualizado
        },
        message: 'Saldo da conta recalculado com sucesso'
      });
    } else {
      // Recalcular saldos de todas as contas
      const contasResult = await contasService.getContas({});
      const resultados = [];
      
      for (const conta of contasResult) {
        const saldoAtualizado = await contasService.atualizarSaldoAtual(conta.id);
        resultados.push({
          conta_id: conta.id,
          descricao: conta.descricao,
          saldo_atual: saldoAtualizado
        });
      }
      
      return NextResponse.json({
        success: true,
        data: resultados,
        message: 'Saldos de todas as contas recalculados com sucesso'
      });
    }
  } catch (error) {
    console.error('Erro ao recalcular saldos:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

