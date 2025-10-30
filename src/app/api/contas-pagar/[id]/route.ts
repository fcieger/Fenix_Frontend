import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { logHistory } from '@/lib/history';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgresql://postgres:fenix123@localhost:5432/fenix',
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();
  
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da conta é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar conta a pagar com JOIN para trazer nome do parcelamento
    const contaResult = await client.query(`
      SELECT 
        cp.*,
        pp.nome as parcelamento_nome
      FROM contas_pagar cp
      LEFT JOIN prazos_pagamento pp ON cp.parcelamento_id = pp.id
      WHERE cp.id = $1
    `, [id]);

    if (contaResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Conta a pagar não encontrada' },
        { status: 404 }
      );
    }

    const conta = contaResult.rows[0];

    // Buscar parcelas com JOINs para trazer nomes
    const parcelasResult = await client.query(`
      SELECT 
        p.*,
        fp.nome as forma_pagamento_nome,
        cf.descricao as conta_corrente_nome,
        cf.banco_nome,
        cf.numero_agencia,
        cf.numero_conta
      FROM parcelas_contas_pagar p
      LEFT JOIN formas_pagamento fp ON p.forma_pagamento_id = fp.id
      LEFT JOIN contas_financeiras cf ON p.conta_corrente_id = cf.id
      WHERE p.conta_pagar_id = $1 
      ORDER BY p.data_vencimento ASC
    `, [id]);

    // Buscar rateio de conta contábil (tabelas atuais)
    const rateioContaResult = await client.query(`
      SELECT cpc.*, cc.descricao as conta_contabil_descricao
      FROM contas_pagar_conta_contabil cpc
      LEFT JOIN contas_contabeis cc ON cpc.conta_contabil_id = cc.id
      WHERE cpc.conta_pagar_id = $1
    `, [id]);

    // Buscar rateio de centro de custo (tabelas atuais)
    const rateioCentroResult = await client.query(`
      SELECT ccc.*, cc.descricao as centro_custo_descricao
      FROM contas_pagar_centro_custo ccc
      LEFT JOIN centros_custos cc ON ccc.centro_custo_id = cc.id
      WHERE ccc.conta_pagar_id = $1
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
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();
  
  try {
    const { id } = params;
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
      observacoes, status, parcelas, cadastroId, parcelamentoId,
      rateioContaContabil, rateioCentroCusto
    } = body;

    await client.query('BEGIN');

    // Atualizar conta a pagar
    await client.query(`
      UPDATE contas_pagar SET
        titulo = $1, valor_total = $2, conta_contabil_id = $3,
        data_emissao = $4, data_quitacao = $5, competencia = $6, 
        centro_custo_id = $7, origem = $8, observacoes = $9, 
        status = $10, cadastro_id = $11, parcelamento_id = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
    `, [
      titulo, valorTotal, contaContabil, dataEmissao, dataQuitacao || null, 
      competencia, centroCusto, origem, observacoes, status, 
      (cadastroId || cadastro) || null, (parcelamentoId || parcelamento) || null, id
    ]);

    // ========= NOVA LÓGICA: UPSERT DE PARCELAS =========
    const atuaisRes = await client.query(`
      SELECT id FROM parcelas_contas_pagar WHERE conta_pagar_id = $1
    `, [id]);
    const atuais = new Set(atuaisRes.rows.map((r: any) => String(r.id)));
    const recebidasIds = new Set<string>();

    if (parcelas && parcelas.length > 0) {
      for (const parcela of parcelas) {
        if (parcela.id && atuais.has(parcela.id)) {
          recebidasIds.add(parcela.id);
          await client.query(`
            UPDATE parcelas_contas_pagar SET
              titulo_parcela = $2, data_vencimento = $3, data_pagamento = $4,
              data_compensacao = $5, valor_parcela = $6, diferenca = $7,
              valor_total = $8, status = $9, forma_pagamento_id = $10,
              conta_corrente_id = $11, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `, [
            parcela.id, parcela.tituloParcela, parcela.dataVencimento, parcela.dataPagamento || null,
            parcela.dataCompensacao || null, parcela.valorParcela, parcela.diferenca, parcela.valorTotal,
            parcela.status, parcela.formaPagamentoId || null, parcela.contaCorrenteId || null
          ]);
        } else {
          const ins = await client.query(`
            INSERT INTO parcelas_contas_pagar (
              conta_pagar_id, titulo_parcela, data_vencimento, data_pagamento,
              data_compensacao, valor_parcela, diferenca, valor_total, status,
              forma_pagamento_id, conta_corrente_id
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING id
          `, [
            id, parcela.tituloParcela, parcela.dataVencimento, parcela.dataPagamento || null,
            parcela.dataCompensacao || null, parcela.valorParcela, parcela.diferenca, parcela.valorTotal,
            parcela.status, parcela.formaPagamentoId || null, parcela.contaCorrenteId || null
          ]);
          const newId = ins.rows[0].id as string;
          recebidasIds.add(newId);
          parcela.id = newId; // para uso no lançamento abaixo
        }
      }

      // Remover parcelas não enviadas e limpar seus movimentos
      for (const pid of atuais) {
        if (!recebidasIds.has(pid)) {
          await client.query(`DELETE FROM movimentacoes_financeiras WHERE parcela_id = $1 AND tela_origem = 'contas_pagar_parcelas'`, [pid]);
          await client.query(`DELETE FROM parcelas_contas_pagar WHERE id = $1`, [pid]);
        }
      }

      // Garantir índice único para idempotência
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS uniq_mov_parcela
          ON movimentacoes_financeiras (tela_origem, parcela_id)
          WHERE parcela_id IS NOT NULL;
      `);

      // Criar movimentos idempotentes para parcelas pagas
      for (const parcela of parcelas) {
        if ((parcela.status || '').toLowerCase() === 'pago' && parcela.contaCorrenteId) {
          const fornecedorRes = await client.query(`
            SELECT COALESCE(c."nomeRazaoSocial", c."nomeFantasia", '') AS fornecedor
              FROM contas_pagar cp LEFT JOIN cadastros c ON cp.cadastro_id = c.id
             WHERE cp.id = $1
          `, [id]);
          const fornecedor = fornecedorRes.rows[0]?.fornecedor || '';
          const desc = `pagamento titulo "${parcela.tituloParcela || 'parcela'}" de "${fornecedor}"`;
          const valor = Number(parcela.valorTotal ?? parcela.valorParcela ?? 0);
          const dataMov = parcela.dataCompensacao || parcela.dataPagamento || new Date().toISOString();

          await client.query(`
            INSERT INTO movimentacoes_financeiras
              (conta_id, tipo_movimentacao, valor_entrada, valor_saida, descricao, descricao_detalhada,
               data_movimentacao, saldo_anterior, saldo_posterior, situacao, created_by,
               id_origem, tela_origem, parcela_id)
            VALUES
              ($1,'saida',0,$2,$3,$4,$5,0,0,'pago',NULL,$6,'contas_pagar_parcelas',$7)
            ON CONFLICT (tela_origem, parcela_id) WHERE parcela_id IS NOT NULL DO NOTHING
          `, [parcela.contaCorrenteId, valor, 'Pagamento de conta a pagar', desc, dataMov, id, parcela.id]);
          await client.query('SELECT recalcular_saldo_dia_conta($1)', [parcela.contaCorrenteId]);
        }
      }

      // =================== RATEIO (PUT) ===================
      // Limpar rateios atuais
      await client.query('DELETE FROM contas_pagar_conta_contabil WHERE conta_pagar_id = $1', [id]);
      await client.query('DELETE FROM contas_pagar_centro_custo WHERE conta_pagar_id = $1', [id]);

      // Regravar rateio de conta contábil
      if (Array.isArray(rateioContaContabil) && rateioContaContabil.length > 0) {
        for (const item of rateioContaContabil) {
          if (item.contaContabilId && item.valor > 0) {
            await client.query(`
              INSERT INTO contas_pagar_conta_contabil (conta_pagar_id, conta_contabil_id, valor, percentual)
              VALUES ($1, $2, $3, $4)
            `, [id, item.contaContabilId, item.valor, item.percentual]);

            // Distribuir por parcela (se houver)
            if (parcelas && parcelas.length > 0 && valorTotal) {
              for (const parcela of parcelas) {
                const valorParcelaRateio = (item.valor / valorTotal) * parcela.valorParcela;
                const percentualParcelaRateio = (valorParcelaRateio / parcela.valorParcela) * 100;
                await client.query(`
                  INSERT INTO contas_pagar_conta_contabil_parcela (conta_pagar_id, parcela_id, conta_contabil_id, valor, percentual)
                  VALUES ($1, $2, $3, $4, $5)
                `, [id, parcela.id, item.contaContabilId, valorParcelaRateio, percentualParcelaRateio]);
              }
            }
          }
        }
      } else if (contaContabil) {
        // Fallback: conta contábil única (100%)
        await client.query(`
          INSERT INTO contas_pagar_conta_contabil (conta_pagar_id, conta_contabil_id, valor, percentual)
          VALUES ($1, $2, $3, 100.00)
        `, [id, contaContabil, valorTotal || 0]);

        if (parcelas && parcelas.length > 0) {
          for (const parcela of parcelas) {
            await client.query(`
              INSERT INTO contas_pagar_conta_contabil_parcela (conta_pagar_id, parcela_id, conta_contabil_id, valor, percentual)
              VALUES ($1, $2, $3, $4, 100.00)
            `, [id, parcela.id, contaContabil, parcela.valorParcela]);
          }
        }
      }

      // Regravar rateio de centro de custo
      if (Array.isArray(rateioCentroCusto) && rateioCentroCusto.length > 0) {
        for (const item of rateioCentroCusto) {
          if (item.centroCustoId && item.valor > 0) {
            await client.query(`
              INSERT INTO contas_pagar_centro_custo (conta_pagar_id, centro_custo_id, valor, percentual)
              VALUES ($1, $2, $3, $4)
            `, [id, item.centroCustoId, item.valor, item.percentual]);

            if (parcelas && parcelas.length > 0 && valorTotal) {
              for (const parcela of parcelas) {
                const valorParcelaRateio = (item.valor / valorTotal) * parcela.valorParcela;
                const percentualParcelaRateio = (valorParcelaRateio / parcela.valorParcela) * 100;
                await client.query(`
                  INSERT INTO contas_pagar_centro_custo_parcela (conta_pagar_id, parcela_id, centro_custo_id, valor, percentual)
                  VALUES ($1, $2, $3, $4, $5)
                `, [id, parcela.id, item.centroCustoId, valorParcelaRateio, percentualParcelaRateio]);
              }
            }
          }
        }
      } else if (centroCusto) {
        await client.query(`
          INSERT INTO contas_pagar_centro_custo (conta_pagar_id, centro_custo_id, valor, percentual)
          VALUES ($1, $2, $3, 100.00)
        `, [id, centroCusto, valorTotal || 0]);

        if (parcelas && parcelas.length > 0) {
          for (const parcela of parcelas) {
            await client.query(`
              INSERT INTO contas_pagar_centro_custo_parcela (conta_pagar_id, parcela_id, centro_custo_id, valor, percentual)
              VALUES ($1, $2, $3, $4, 100.00)
            `, [id, parcela.id, centroCusto, parcela.valorParcela]);
          }
        }
      }
    }

    await client.query('COMMIT');

    await logHistory(client, {
      company_id: conta.company_id,
      action: 'update',
      entity: 'contas_pagar',
      entity_id: id,
      description: `Atualizado título a pagar: "${titulo}"`,
      metadata: { id }
    });

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
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();
  
  try {
    const { id } = params;

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
    await logHistory(client, {
      company_id: contaResult.rows[0]?.company_id || null,
      action: 'delete',
      entity: 'contas_pagar',
      entity_id: id,
      description: `Excluído título a pagar (${id})`,
      metadata: { id }
    });

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
