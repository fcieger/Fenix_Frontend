import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { logHistory } from '@/lib/history';
import { ensureCoreSchema } from '@/lib/migrations';
import { validateUUID } from '@/utils/validations';

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

// Criar título a receber com parcelas e rateios
export async function POST(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await ensureCoreSchema(client);
    const body = await request.json();
    const {
      titulo,
      cadastro,
      valorTotal,
      contaContabil,
      parcelamento,
      dataEmissao,
      dataQuitacao,
      competencia,
      centroCusto,
      origem,
      observacoes,
      status = 'PENDENTE',
      parcelas,
      companyId,
      cadastroId,
      parcelamentoId,
      rateioContaContabil,
      rateioCentroCusto,
    } = body;

    // Normalizar strings vazias para null
    const norm = (v: any) => (v === '' || v === undefined ? null : v);
    const companyIdNorm = norm(companyId);
    const contaContabilNorm = norm(contaContabil);
    const centroCustoNorm = norm(centroCusto);
    const cadastroIdNorm = norm(cadastroId);
    const parcelamentoIdNorm = norm(parcelamentoId ?? parcelamento);

    const cadastroValido = cadastroIdNorm || cadastro;
    if (!titulo || !valorTotal || !dataEmissao || !companyIdNorm || !cadastroValido) {
      return NextResponse.json({ success: false, error: 'Dados obrigatórios não fornecidos' }, { status: 400 });
    }

    // Validar UUIDs obrigatórios e opcionais
    if (!validateUUID(companyIdNorm)) {
      return NextResponse.json({ success: false, error: 'companyId inválido' }, { status: 400 });
    }
    if (contaContabilNorm && !validateUUID(contaContabilNorm)) {
      return NextResponse.json({ success: false, error: 'contaContabil inválido' }, { status: 400 });
    }
    if (centroCustoNorm && !validateUUID(centroCustoNorm)) {
      return NextResponse.json({ success: false, error: 'centroCusto inválido' }, { status: 400 });
    }
    if (cadastroIdNorm && !validateUUID(cadastroIdNorm)) {
      return NextResponse.json({ success: false, error: 'cadastroId inválido' }, { status: 400 });
    }
    if (parcelamentoIdNorm && !validateUUID(parcelamentoIdNorm)) {
      return NextResponse.json({ success: false, error: 'parcelamentoId inválido' }, { status: 400 });
    }

    await client.query('BEGIN');

    // contas_receber
    const contaRes = await client.query(
      `INSERT INTO contas_receber (
         titulo, valor_total, conta_contabil_id, data_emissao, data_quitacao,
         competencia, centro_custo_id, origem, observacoes, status,
         company_id, cadastro_id, parcelamento_id
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [
        titulo,
        valorTotal,
        contaContabilNorm,
        dataEmissao,
        dataQuitacao || null,
        competencia,
        centroCustoNorm,
        origem,
        observacoes,
        status,
        companyIdNorm,
        (cadastroIdNorm || cadastro) || null,
        parcelamentoIdNorm || null,
      ],
    );
    const contaId = contaRes.rows[0].id;
    await logHistory(client, {
      company_id: companyId,
      action: 'create',
      entity: 'contas_receber',
      entity_id: contaId,
      description: `Criado título a receber: "${titulo}" (valor ${valorTotal})`,
      metadata: { titulo, valorTotal }
    });

    // parcelas_contas_receber
    if (Array.isArray(parcelas) && parcelas.length > 0) {
      for (const p of parcelas) {
        const formaPagamentoIdNorm = norm(p.formaPagamentoId);
        const contaCorrenteIdNorm = norm(p.contaCorrenteId);
        if (formaPagamentoIdNorm && !validateUUID(formaPagamentoIdNorm)) {
          await client.query('ROLLBACK');
          return NextResponse.json({ success: false, error: 'formaPagamentoId inválido' }, { status: 400 });
        }
        if (contaCorrenteIdNorm && !validateUUID(contaCorrenteIdNorm)) {
          await client.query('ROLLBACK');
          return NextResponse.json({ success: false, error: 'contaCorrenteId inválido' }, { status: 400 });
        }
        await client.query(
          `INSERT INTO parcelas_contas_receber (
             conta_receber_id, titulo_parcela, data_vencimento, data_pagamento,
             data_compensacao, valor_parcela, diferenca, valor_total, status,
             forma_pagamento_id, conta_corrente_id
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            contaId,
            p.tituloParcela,
            p.dataVencimento,
            p.dataPagamento || null,
            p.dataCompensacao || null,
            p.valorParcela,
            p.diferenca,
            p.valorTotal,
            p.status,
            formaPagamentoIdNorm || null,
            contaCorrenteIdNorm || null,
          ],
        );
      }
    }

    // Criar movimentações para parcelas já marcadas como 'pago' (recebidas) — tipo entrada
    await client.query(`
      ALTER TABLE movimentacoes_financeiras
        ADD COLUMN IF NOT EXISTS id_origem UUID,
        ADD COLUMN IF NOT EXISTS tela_origem TEXT,
        ADD COLUMN IF NOT EXISTS parcela_id UUID;
      CREATE UNIQUE INDEX IF NOT EXISTS uniq_mov_parcela_receber
        ON movimentacoes_financeiras (tela_origem, parcela_id)
        WHERE parcela_id IS NOT NULL;
    `);

    const pagas = await client.query(
      `SELECT id, conta_receber_id, titulo_parcela, data_compensacao, data_pagamento,
              valor_parcela, valor_total, conta_corrente_id
         FROM parcelas_contas_receber
        WHERE conta_receber_id = $1 AND status = 'pago'`,
      [contaId],
    );

    for (const p of pagas.rows) {
      const valor = Number(p.valor_total ?? p.valor_parcela ?? 0);
      const dataMov = p.data_compensacao || p.data_pagamento || new Date().toISOString();
      const cliRes = await client.query(
        `SELECT COALESCE(c."nomeRazaoSocial", c."nomeFantasia", '') AS cliente
           FROM contas_receber cr LEFT JOIN cadastros c ON cr.cadastro_id = c.id
          WHERE cr.id = $1`,
        [p.conta_receber_id],
      );
      const cliente = cliRes.rows[0]?.cliente || '';
      const desc = `recebimento titulo "${p.titulo_parcela || 'parcela'}" de "${cliente}"`;
      if (p.conta_corrente_id) {
        await client.query(
          `INSERT INTO movimentacoes_financeiras
             (conta_id, tipo_movimentacao, valor_entrada, valor_saida, descricao, descricao_detalhada,
              data_movimentacao, saldo_anterior, saldo_posterior, situacao, created_by,
              id_origem, tela_origem, parcela_id)
           VALUES
             ($1,'entrada',$2,0,$3,$4,$5,0,0,'pago',NULL,$6,'contas_receber_parcelas',$7)
           ON CONFLICT (tela_origem, parcela_id) WHERE parcela_id IS NOT NULL DO NOTHING`,
          [p.conta_corrente_id, valor, 'Recebimento de conta a receber', desc, dataMov, p.conta_receber_id, p.id],
        );
        await client.query('SELECT recalcular_saldo_dia_conta($1)', [p.conta_corrente_id]);
      }
    }

    // Rateios — contas_receber_conta_contabil e contas_receber_centro_custo (+ _parcela)
    if (Array.isArray(rateioContaContabil) && rateioContaContabil.length > 0) {
      for (const item of rateioContaContabil) {
        if (item.contaContabilId && item.valor > 0) {
          await client.query(
            `INSERT INTO contas_receber_conta_contabil (conta_receber_id, conta_contabil_id, valor, percentual)
             VALUES ($1,$2,$3,$4)`,
            [contaId, item.contaContabilId, item.valor, item.percentual],
          );
          if (Array.isArray(parcelas) && parcelas.length > 0) {
            for (const parcela of parcelas) {
              const parcelaRes = await client.query(
                `SELECT id FROM parcelas_contas_receber WHERE conta_receber_id = $1 AND titulo_parcela = $2`,
                [contaId, parcela.tituloParcela],
              );
              if (parcelaRes.rows.length > 0) {
                const parcelaId = parcelaRes.rows[0].id;
                const vParc = (item.valor / valorTotal) * parcela.valorParcela;
                const percParc = (vParc / parcela.valorParcela) * 100;
                await client.query(
                  `INSERT INTO contas_receber_conta_contabil_parcela (conta_receber_id, parcela_id, conta_contabil_id, valor, percentual)
                   VALUES ($1,$2,$3,$4,$5)`,
                  [contaId, parcelaId, item.contaContabilId, vParc, percParc],
                );
              }
            }
          }
        }
      }
    } else if (contaContabil) {
      await client.query(
        `INSERT INTO contas_receber_conta_contabil (conta_receber_id, conta_contabil_id, valor, percentual)
         VALUES ($1,$2,$3,100.00)`,
        [contaId, contaContabil, valorTotal],
      );
      if (Array.isArray(parcelas) && parcelas.length > 0) {
        for (const parcela of parcelas) {
          const parcelaRes = await client.query(
            `SELECT id FROM parcelas_contas_receber WHERE conta_receber_id = $1 AND titulo_parcela = $2`,
            [contaId, parcela.tituloParcela],
          );
          if (parcelaRes.rows.length > 0) {
            const parcelaId = parcelaRes.rows[0].id;
            await client.query(
              `INSERT INTO contas_receber_conta_contabil_parcela (conta_receber_id, parcela_id, conta_contabil_id, valor, percentual)
               VALUES ($1,$2,$3,$4,100.00)`,
              [contaId, parcelaId, contaContabil, parcela.valorParcela],
            );
          }
        }
      }
    }

    if (Array.isArray(rateioCentroCusto) && rateioCentroCusto.length > 0) {
      for (const item of rateioCentroCusto) {
        if (item.centroCustoId && item.valor > 0) {
          await client.query(
            `INSERT INTO contas_receber_centro_custo (conta_receber_id, centro_custo_id, valor, percentual)
             VALUES ($1,$2,$3,$4)`,
            [contaId, item.centroCustoId, item.valor, item.percentual],
          );
          if (Array.isArray(parcelas) && parcelas.length > 0) {
            for (const parcela of parcelas) {
              const parcelaRes = await client.query(
                `SELECT id FROM parcelas_contas_receber WHERE conta_receber_id = $1 AND titulo_parcela = $2`,
                [contaId, parcela.tituloParcela],
              );
              if (parcelaRes.rows.length > 0) {
                const parcelaId = parcelaRes.rows[0].id;
                const vParc = (item.valor / valorTotal) * parcela.valorParcela;
                const percParc = (vParc / parcela.valorParcela) * 100;
                await client.query(
                  `INSERT INTO contas_receber_centro_custo_parcela (conta_receber_id, parcela_id, centro_custo_id, valor, percentual)
                   VALUES ($1,$2,$3,$4,$5)`,
                  [contaId, parcelaId, item.centroCustoId, vParc, percParc],
                );
              }
            }
          }
        }
      }
    } else if (centroCusto) {
      await client.query(
        `INSERT INTO contas_receber_centro_custo (conta_receber_id, centro_custo_id, valor, percentual)
         VALUES ($1,$2,$3,100.00)`,
        [contaId, centroCusto, valorTotal],
      );
      if (Array.isArray(parcelas) && parcelas.length > 0) {
        for (const parcela of parcelas) {
          const parcelaRes = await client.query(
            `SELECT id FROM parcelas_contas_receber WHERE conta_receber_id = $1 AND titulo_parcela = $2`,
            [contaId, parcela.tituloParcela],
          );
          if (parcelaRes.rows.length > 0) {
            const parcelaId = parcelaRes.rows[0].id;
            await client.query(
              `INSERT INTO contas_receber_centro_custo_parcela (conta_receber_id, parcela_id, centro_custo_id, valor, percentual)
               VALUES ($1,$2,$3,$4,100.00)`,
              [contaId, parcelaId, centroCusto, parcela.valorParcela],
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, data: { id: contaId, message: 'Conta a receber salva com sucesso' } });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Erro ao salvar conta a receber:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor: ' + error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

// Listar títulos a receber com agregados de parcelas
export async function GET(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await ensureCoreSchema(client);
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    if (!companyId) return NextResponse.json({ success: false, error: 'Company ID é obrigatório' }, { status: 400 });

    const result = await client.query(
      `SELECT 
         cr.*,
         c."nomeRazaoSocial" as cliente_nome,
         c."nomeFantasia" as cliente_fantasia,
         COALESCE(c.cnpj, c.cpf) as cliente_cpf_cnpj,
         CASE WHEN cr.conta_contabil_id::text ~ '^[0-9a-f]{8}-' THEN cc.descricao ELSE COALESCE(cr.conta_contabil_id::text, '') END as conta_contabil_nome,
         CASE WHEN cr.conta_contabil_id::text ~ '^[0-9a-f]{8}-' THEN cc.codigo ELSE '' END as conta_contabil_codigo,
         CASE WHEN cr.centro_custo_id::text ~ '^[0-9a-f]{8}-' THEN centro.descricao ELSE COALESCE(cr.centro_custo_id::text, '') END as centro_custo_nome,
         CASE WHEN cr.centro_custo_id::text ~ '^[0-9a-f]{8}-' THEN centro.codigo ELSE '' END as centro_custo_codigo,
         COALESCE(stats.total_parcelas,0)::int as total_parcelas,
         COALESCE(stats.parcelas_pagas,0)::int as parcelas_pagas,
         COALESCE(stats.parcelas_pendentes,0)::int as parcelas_pendentes,
         stats.proximo_vencimento,
         stats.ultimo_vencimento,
         COALESCE(stats.valor_pendente,0) as valor_pendente,
         COALESCE(stats.valor_pago,0) as valor_pago,
         COALESCE(stats.tem_parcela_vencida,false) as tem_parcela_vencida
       FROM contas_receber cr
       LEFT JOIN cadastros c ON cr.cadastro_id = c.id
       LEFT JOIN contas_contabeis cc ON cr.conta_contabil_id::text = cc.id::text AND cr.conta_contabil_id::text ~ '^[0-9a-f]{8}-'
       LEFT JOIN centros_custos centro ON cr.centro_custo_id::text = centro.id::text AND cr.centro_custo_id::text ~ '^[0-9a-f]{8}-'
       LEFT JOIN (
         SELECT p.conta_receber_id,
                COUNT(*)::int as total_parcelas,
                SUM(CASE WHEN p.status = 'pago' THEN 1 ELSE 0 END)::int as parcelas_pagas,
                SUM(CASE WHEN p.status = 'pendente' THEN 1 ELSE 0 END)::int as parcelas_pendentes,
                MIN(CASE WHEN p.status = 'pendente' THEN p.data_vencimento END) as proximo_vencimento,
                MAX(CASE WHEN p.status = 'pendente' THEN p.data_vencimento END) as ultimo_vencimento,
                SUM(CASE WHEN p.status = 'pendente' THEN p.valor_parcela ELSE 0 END) as valor_pendente,
                SUM(CASE WHEN p.status = 'pago' THEN p.valor_total ELSE 0 END) as valor_pago,
                BOOL_OR(p.status = 'pendente' AND p.data_vencimento < CURRENT_DATE) as tem_parcela_vencida
           FROM parcelas_contas_receber p
           GROUP BY p.conta_receber_id
       ) stats ON cr.id = stats.conta_receber_id
       WHERE cr.company_id = $1
       ORDER BY cr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [companyId, limit, offset],
    );

    const ids = result.rows.map((r: any) => r.id);
    let parcelasMap: Record<string, any[]> = {};
    if (ids.length > 0) {
      const parc = await client.query(
        `SELECT p.*, p.conta_receber_id FROM parcelas_contas_receber p WHERE p.conta_receber_id = ANY($1) ORDER BY p.data_vencimento ASC`,
        [ids],
      );
      parc.rows.forEach((p: any) => {
        if (!parcelasMap[p.conta_receber_id]) parcelasMap[p.conta_receber_id] = [];
        parcelasMap[p.conta_receber_id].push(p);
      });
    }
    result.rows.forEach((row: any) => { row.parcelas = parcelasMap[row.id] || []; });

    const countRes = await client.query(`SELECT COUNT(*) as total FROM contas_receber WHERE company_id = $1`, [companyId]);
    const total = parseInt(countRes.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ success: true, data: result.rows, pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } });
  } catch (error: any) {
    console.error('Erro ao buscar contas a receber:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno do servidor' }, { status: 500 });
  } finally {
    client.release();
  }
}


