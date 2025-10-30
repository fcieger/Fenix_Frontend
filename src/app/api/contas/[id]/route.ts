import { NextRequest, NextResponse } from 'next/server';
import { ContasService } from '@/services/contas-service';

const contasService = new ContasService();

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conta = await contasService.getContaById(params.id);
    if (!conta) {
      return NextResponse.json({ success: false, error: 'Conta não encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: conta });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const conta = await contasService.updateConta(params.id, body);
    return NextResponse.json({ success: true, data: conta });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await contasService.deleteConta(params.id);
    return NextResponse.json({
      success: result.success,
      action: result.action,
      message: result.message
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 400 }
    );
  }
}
