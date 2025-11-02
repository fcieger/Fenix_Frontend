import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { logHistory } from '@/lib/history';

let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    // Priorizar DATABASE_URL se disponível (para produção/Vercel)
    if (process.env.DATABASE_URL) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    } else {
      // Fallback para desenvolvimento local
      pool = new Pool({
        connectionString: 'postgresql://postgres:fenix123@localhost:5432/fenix',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }
  }
  return pool;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const client = await getPool().connect();
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: 'ID é obrigatório' }, { status: 400 });

    const contaRes = await client.query(
      `SELECT cr.*, pp.nome as parcelamento_nome
         FROM contas_receber cr
         LEFT JOIN prazos_pagamento pp ON cr.parcelamento_id = pp.id
        WHERE cr.id = $1`,
      [id],
    );
    if (contaRes.rows.length === 0) return NextResponse.json({ success: false, error: 'Conta a receber não encontrada' }, { status: 404 });
    const conta = contaRes.rows[0];

    const parcelas = await client.query(
      `SELECT p.*, fp.nome as forma_pagamento_nome, cf.descricao as conta_corrente_nome, cf.banco_nome, cf.numero_agencia, cf.numero_conta
         FROM parcelas_contas_receber p
         LEFT JOIN formas_pagamento fp ON p.forma_pagamento_id = fp.id
         LEFT JOIN contas_financeiras cf ON p.conta_corrente_id = cf.id
        WHERE p.conta_receber_id = $1
        ORDER BY p.data_vencimento ASC`,
      [id],
    );

    const rateioConta = await client.query(
      `SELECT crc.*, cc.descricao as conta_contabil_descricao
         FROM contas_receber_conta_contabil crc
         LEFT JOIN contas_contabeis cc ON crc.conta_contabil_id = cc.id
        WHERE crc.conta_receber_id = $1`,
      [id],
    );
    const rateioCentro = await client.query(
      `SELECT ccc.*, cc.descricao as centro_custo_descricao
         FROM contas_receber_centro_custo ccc
         LEFT JOIN centros_custos cc ON ccc.centro_custo_id = cc.id
        WHERE ccc.conta_receber_id = $1`,
      [id],
    );

    return NextResponse.json({ success: true, data: { ...conta, parcelas: parcelas.rows, rateioContaContabil: rateioConta.rows, rateioCentroCusto: rateioCentro.rows } });
  } catch (e: any) {
    console.error('Erro ao buscar conta a receber:', e);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const client = await getPool().connect();
  try {
    const { id } = params;
    const body = await request.json();
    if (!id) return NextResponse.json({ success: false, error: 'ID é obrigatório' }, { status: 400 });

    // Buscar conta antes de atualizar para validar existência e obter company_id
    const contaCheckResult = await client.query(`
      SELECT id, company_id FROM contas_receber WHERE id = $1
    `, [id]);

    if (contaCheckResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Conta a receber não encontrada' },
        { status: 404 }
      );
    }

    const conta = contaCheckResult.rows[0];

    const { titulo, cadastro, valorTotal, contaContabil, parcelamento, dataEmissao, dataQuitacao, competencia, centroCusto, origem, observacoes, status, parcelas, cadastroId, parcelamentoId, rateioContaContabil, rateioCentroCusto } = body;

    await client.query('BEGIN');
    await client.query(
      `UPDATE contas_receber SET
         titulo=$1, valor_total=$2, conta_contabil_id=$3,
         data_emissao=$4, data_quitacao=$5, competencia=$6,
         centro_custo_id=$7, origem=$8, observacoes=$9,
         status=$10, cadastro_id=$11, parcelamento_id=$12,
         updated_at = CURRENT_TIMESTAMP
       WHERE id=$13`,
      [titulo, valorTotal, contaContabil, dataEmissao, dataQuitacao || null, competencia, centroCusto, origem, observacoes, status, (cadastroId || cadastro) || null, (parcelamentoId || parcelamento) || null, id],
    );

    const atuaisRes = await client.query(`SELECT id FROM parcelas_contas_receber WHERE conta_receber_id = $1`, [id]);
    const atuais = new Set(atuaisRes.rows.map((r: any) => String(r.id)));
    const recebidasIds = new Set<string>();

    if (Array.isArray(parcelas) && parcelas.length > 0) {
      for (const p of parcelas) {
        if (p.id && atuais.has(p.id)) {
          recebidasIds.add(p.id);
          await client.query(
            `UPDATE parcelas_contas_receber SET
               titulo_parcela=$2, data_vencimento=$3, data_pagamento=$4,
               data_compensacao=$5, valor_parcela=$6, diferenca=$7,
               valor_total=$8, status=$9, forma_pagamento_id=$10,
               conta_corrente_id=$11, updated_at=CURRENT_TIMESTAMP
             WHERE id=$1`,
            [p.id, p.tituloParcela, p.dataVencimento, p.dataPagamento || null, p.dataCompensacao || null, p.valorParcela, p.diferenca, p.valorTotal, p.status, p.formaPagamentoId || null, p.contaCorrenteId || null],
          );
        } else {
          const ins = await client.query(
            `INSERT INTO parcelas_contas_receber (
               conta_receber_id, titulo_parcela, data_vencimento, data_pagamento,
               data_compensacao, valor_parcela, diferenca, valor_total, status,
               forma_pagamento_id, conta_corrente_id
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
             RETURNING id`,
            [id, p.tituloParcela, p.dataVencimento, p.dataPagamento || null, p.dataCompensacao || null, p.valorParcela, p.diferenca, p.valorTotal, p.status, p.formaPagamentoId || null, p.contaCorrenteId || null],
          );
          const newId = ins.rows[0].id as string;
          recebidasIds.add(newId);
          p.id = newId;
        }
      }

      for (const pid of atuais) {
        if (!recebidasIds.has(pid)) {
          await client.query(`DELETE FROM movimentacoes_financeiras WHERE parcela_id = $1 AND tela_origem = 'contas_receber_parcelas'`, [pid]);
          await client.query(`DELETE FROM parcelas_contas_receber WHERE id = $1`, [pid]);
        }
      }

      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS uniq_mov_parcela_receber ON movimentacoes_financeiras (tela_origem, parcela_id) WHERE parcela_id IS NOT NULL;`);
      for (const p of parcelas) {
        if ((p.status || '').toLowerCase() === 'pago' && p.contaCorrenteId) {
          const cli = await client.query(`SELECT COALESCE(c."nomeRazaoSocial", c."nomeFantasia", '') AS cliente FROM contas_receber cr LEFT JOIN cadastros c ON cr.cadastro_id = c.id WHERE cr.id = $1`, [id]);
          const cliente = cli.rows[0]?.cliente || '';
          const desc = `recebimento titulo "${p.tituloParcela || 'parcela'}" de "${cliente}"`;
          const valor = Number(p.valorTotal ?? p.valorParcela ?? 0);
          const dataMov = p.dataCompensacao || p.dataPagamento || new Date().toISOString();
          await client.query(
            `INSERT INTO movimentacoes_financeiras
               (conta_id, tipo_movimentacao, valor_entrada, valor_saida, descricao, descricao_detalhada,
                data_movimentacao, saldo_anterior, saldo_posterior, situacao, created_by,
                id_origem, tela_origem, parcela_id)
             VALUES
               ($1,'entrada',$2,0,$3,$4,$5,0,0,'pago',NULL,$6,'contas_receber_parcelas',$7)
             ON CONFLICT (tela_origem, parcela_id) WHERE parcela_id IS NOT NULL DO NOTHING`,
            [p.contaCorrenteId, valor, 'Recebimento de conta a receber', desc, dataMov, id, p.id],
          );
          await client.query('SELECT recalcular_saldo_dia_conta($1)', [p.contaCorrenteId]);
        }
      }

      // Limpar e regravar rateios
      await client.query('DELETE FROM contas_receber_conta_contabil WHERE conta_receber_id = $1', [id]);
      await client.query('DELETE FROM contas_receber_centro_custo WHERE conta_receber_id = $1', [id]);

      if (Array.isArray(rateioContaContabil) && rateioContaContabil.length > 0) {
        for (const item of rateioContaContabil) {
          if (item.contaContabilId && item.valor > 0) {
            await client.query(`INSERT INTO contas_receber_conta_contabil (conta_receber_id, conta_contabil_id, valor, percentual) VALUES ($1,$2,$3,$4)`, [id, item.contaContabilId, item.valor, item.percentual]);
            if (Array.isArray(parcelas) && parcelas.length > 0 && valorTotal) {
              for (const p of parcelas) {
                const vParc = (item.valor / valorTotal) * p.valorParcela;
                const percParc = (vParc / p.valorParcela) * 100;
                await client.query(`INSERT INTO contas_receber_conta_contabil_parcela (conta_receber_id, parcela_id, conta_contabil_id, valor, percentual) VALUES ($1,$2,$3,$4,$5)`, [id, p.id, item.contaContabilId, vParc, percParc]);
              }
            }
          }
        }
      } else if (contaContabil) {
        await client.query(`INSERT INTO contas_receber_conta_contabil (conta_receber_id, conta_contabil_id, valor, percentual) VALUES ($1,$2,$3,100.00)`, [id, contaContabil, valorTotal || 0]);
        if (Array.isArray(parcelas) && parcelas.length > 0) {
          for (const p of parcelas) {
            await client.query(`INSERT INTO contas_receber_conta_contabil_parcela (conta_receber_id, parcela_id, conta_contabil_id, valor, percentual) VALUES ($1,$2,$3,$4,100.00)`, [id, p.id, contaContabil, p.valorParcela]);
          }
        }
      }

      if (Array.isArray(rateioCentroCusto) && rateioCentroCusto.length > 0) {
        for (const item of rateioCentroCusto) {
          if (item.centroCustoId && item.valor > 0) {
            await client.query(`INSERT INTO contas_receber_centro_custo (conta_receber_id, centro_custo_id, valor, percentual) VALUES ($1,$2,$3,$4)`, [id, item.centroCustoId, item.valor, item.percentual]);
            if (Array.isArray(parcelas) && parcelas.length > 0 && valorTotal) {
              for (const p of parcelas) {
                const vParc = (item.valor / valorTotal) * p.valorParcela;
                const percParc = (vParc / p.valorParcela) * 100;
                await client.query(`INSERT INTO contas_receber_centro_custo_parcela (conta_receber_id, parcela_id, centro_custo_id, valor, percentual) VALUES ($1,$2,$3,$4,$5)`, [id, p.id, item.centroCustoId, vParc, percParc]);
              }
            }
          }
        }
      } else if (centroCusto) {
        await client.query(`INSERT INTO contas_receber_centro_custo (conta_receber_id, centro_custo_id, valor, percentual) VALUES ($1,$2,$3,100.00)`, [id, centroCusto, valorTotal || 0]);
        if (Array.isArray(parcelas) && parcelas.length > 0) {
          for (const p of parcelas) {
            await client.query(`INSERT INTO contas_receber_centro_custo_parcela (conta_receber_id, parcela_id, centro_custo_id, valor, percentual) VALUES ($1,$2,$3,$4,100.00)`, [id, p.id, centroCusto, p.valorParcela]);
          }
        }
      }
    }

    await client.query('COMMIT');
    await logHistory(client, {
      company_id: conta.company_id,
      action: 'update',
      entity: 'contas_receber',
      entity_id: id,
      description: `Atualizado título a receber: "${titulo}"`,
      metadata: { id }
    });
    return NextResponse.json({ success: true, data: { message: 'Conta a receber atualizada com sucesso' } });
  } catch (e: any) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar conta a receber:', e);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const client = await getPool().connect();
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ success: false, error: 'ID é obrigatório' }, { status: 400 });

    // Buscar conta antes de deletar para obter company_id e informações para log
    const contaResult = await client.query(`
      SELECT id, company_id, titulo FROM contas_receber WHERE id = $1
    `, [id]);

    if (contaResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Conta a receber não encontrada' },
        { status: 404 }
      );
    }

    const conta = contaResult.rows[0];
    const companyId = conta.company_id;
    const titulo = conta.titulo || 'Sem título';

    await client.query('BEGIN');

    // Deletar movimentações financeiras relacionadas às parcelas
    await client.query(`
      DELETE FROM movimentacoes_financeiras 
      WHERE parcela_id IN (
        SELECT id FROM parcelas_contas_receber WHERE conta_receber_id = $1
      ) AND tela_origem = 'contas_receber_parcelas'
    `, [id]);

    // Deletar parcelas
    await client.query(`
      DELETE FROM parcelas_contas_receber WHERE conta_receber_id = $1
    `, [id]);

    // Deletar rateios
    await client.query(`
      DELETE FROM contas_receber_conta_contabil WHERE conta_receber_id = $1
    `, [id]);
    
    await client.query(`
      DELETE FROM contas_receber_centro_custo WHERE conta_receber_id = $1
    `, [id]);

    // Deletar conta a receber
    await client.query(`DELETE FROM contas_receber WHERE id = $1`, [id]);

    await client.query('COMMIT');

    await logHistory(client, {
      company_id: companyId,
      action: 'delete',
      entity: 'contas_receber',
      entity_id: id,
      description: `Excluído título a receber: "${titulo}"`,
      metadata: { id, titulo }
    });

    return NextResponse.json({ success: true, data: { message: 'Conta a receber deletada com sucesso' } });
  } catch (e: any) {
    await client.query('ROLLBACK');
    console.error('Erro ao deletar conta a receber:', e);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  } finally {
    client.release();
  }
}


