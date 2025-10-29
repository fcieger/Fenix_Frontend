import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da conta é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar conta a pagar
    const contaResult = await client.query(`
      SELECT * FROM contas_pagar WHERE id = $1
    `, [id]);

    if (contaResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Conta a pagar não encontrada' },
        { status: 404 }
      );
    }

    const conta = contaResult.rows[0];

    // Buscar parcelas
    const parcelasResult = await client.query(`
      SELECT * FROM parcelas_contas_pagar 
      WHERE conta_pagar_id = $1 
      ORDER BY data_vencimento ASC
    `, [id]);

    // Buscar rateio de conta contábil
    const rateioContaResult = await client.query(`
      SELECT rcc.*, cc.descricao as conta_contabil_descricao
      FROM rateio_conta_contabil rcc
      LEFT JOIN contas_contabeis cc ON rcc.conta_contabil_id = cc.id
      WHERE rcc.conta_pagar_id = $1
    `, [id]);

    // Buscar rateio de centro de custo
    const rateioCentroResult = await client.query(`
      SELECT rcc.*, cc.descricao as centro_custo_descricao
      FROM rateio_centro_custo rcc
      LEFT JOIN centros_custos cc ON rcc.centro_custo_id = cc.id
      WHERE rcc.conta_pagar_id = $1
    `, [id]);

    return NextResponse.json({
      success: true,
      data: {
        ...conta,
        parcelas: parcelasResult.rows,
        rateioContaContabil: rateioContaResult.rows,
        rateioCentroCusto: rateioCentroResult.rows
      }
    });

  } catch (error) {
    console.error('Erro ao buscar conta a pagar:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da conta é obrigatório' },
        { status: 400 }
      );
    }

    const {
      titulo, cadastro, valorTotal, contaContabil, parcelamento,
      dataEmissao, dataQuitacao, competencia, centroCusto, origem,
      observacoes, status, parcelas
    } = body;

    await client.query('BEGIN');

    // Atualizar conta a pagar
    await client.query(`
      UPDATE contas_pagar SET
        titulo = $1, valor_total = $2, conta_contabil_id = $3,
        data_emissao = $4, data_quitacao = $5, competencia = $6, 
        centro_custo_id = $7, origem = $8, observacoes = $9, 
        status = $10, updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
    `, [
      titulo, valorTotal, contaContabil, dataEmissao, dataQuitacao || null, 
      competencia, centroCusto, origem, observacoes, status, id
    ]);

    // Remover parcelas existentes
    await client.query(`
      DELETE FROM parcelas_contas_pagar WHERE conta_pagar_id = $1
    `, [id]);

    // Inserir novas parcelas
    if (parcelas && parcelas.length > 0) {
      for (const parcela of parcelas) {
        await client.query(`
          INSERT INTO parcelas_contas_pagar (
            conta_pagar_id, titulo_parcela, data_vencimento, data_pagamento,
            data_compensacao, valor_parcela, diferenca, valor_total, status, 
            forma_pagamento_id, conta_corrente_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          id, parcela.tituloParcela, parcela.dataVencimento, parcela.dataPagamento || null,
          parcela.dataCompensacao || null, parcela.valorParcela, parcela.diferenca, parcela.valorTotal, 
          parcela.status, parcela.formaPagamentoId || null, parcela.contaCorrenteId || null
        ]);
      }
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: { message: 'Conta a pagar atualizada com sucesso' }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar conta a pagar:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da conta é obrigatório' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Deletar conta a pagar (cascade deletará parcelas e rateios)
    await client.query(`
      DELETE FROM contas_pagar WHERE id = $1
    `, [id]);

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: { message: 'Conta a pagar deletada com sucesso' }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao deletar conta a pagar:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
