import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const naturezaId = searchParams.get('id');
    
    if (!naturezaId) {
      return NextResponse.json(
        { error: 'ID da natureza é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 Verificando natureza:', naturezaId);

    // Verificar se a natureza existe e buscar todos os campos relevantes
    const result = await query(`
      SELECT 
        id,
        nome,
        cfop,
        tipo,
        "movimentaEstoque",
        habilitado,
        "frenteDeCaixa",
        "considerarOperacaoComoFaturamento",
        "destacarTotalImpostosIBPT",
        "gerarContasReceberPagar",
        "tipoDataContasReceberPagar",
        "informacoesAdicionaisFisco",
        "informacoesAdicionaisContribuinte",
        "createdAt",
        "updatedAt"
      FROM natureza_operacao
      WHERE id = $1::uuid
    `, [naturezaId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Natureza não encontrada no banco de dados' },
        { status: 404 }
      );
    }

    const natureza = result.rows[0];
    
    // Verificar se frenteDeCaixa está salvo
    const frenteDeCaixaValue = natureza.frenteDeCaixa;
    const isFrenteDeCaixaTrue = frenteDeCaixaValue === true || frenteDeCaixaValue === 'true' || frenteDeCaixaValue === 1;
    
    // Verificar estrutura da tabela
    const columnsResult = await query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'natureza_operacao'
      AND column_name = 'frenteDeCaixa'
    `);

    const response = {
      natureza: {
        id: natureza.id,
        nome: natureza.nome,
        cfop: natureza.cfop,
        tipo: natureza.tipo,
        frenteDeCaixa: {
          valor: natureza.frenteDeCaixa,
          tipo: typeof natureza.frenteDeCaixa,
          estaMarcado: isFrenteDeCaixaTrue,
          avaliacao: isFrenteDeCaixaTrue ? '✅ MARCADO' : '❌ NÃO MARCADO'
        },
        considerarOperacaoComoFaturamento: natureza.considerarOperacaoComoFaturamento,
        destacarTotalImpostosIBPT: natureza.destacarTotalImpostosIBPT,
        gerarContasReceberPagar: natureza.gerarContasReceberPagar,
        habilitado: natureza.habilitado,
        movimentaEstoque: natureza.movimentaEstoque,
        createdAt: natureza.createdAt,
        updatedAt: natureza.updatedAt
      },
      estruturaColuna: columnsResult.rows.length > 0 ? {
        existe: true,
        tipo: columnsResult.rows[0].data_type,
        valorPadrao: columnsResult.rows[0].column_default
      } : {
        existe: false,
        mensagem: 'Coluna frenteDeCaixa não existe na tabela!'
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Erro ao verificar natureza:', error);
    return NextResponse.json(
      {
        error: 'Erro ao verificar natureza',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}






