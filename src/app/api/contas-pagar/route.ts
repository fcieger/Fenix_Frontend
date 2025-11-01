import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { ensureCoreSchema } from '@/lib/migrations';
import { logHistory } from '@/lib/history';

// Lazy initialization do pool - só cria quando necessário
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
      rateioCentroCusto
    } = body;

    // Validar dados obrigatórios (aceita cadastroId ou cadastro)
    const cadastroValido = cadastroId || cadastro;
    if (!titulo || !valorTotal || !dataEmissao || !companyId || !cadastroValido) {
      return NextResponse.json(
        { success: false, error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Inserir conta a pagar
    const contaPagarResult = await client.query(`
      INSERT INTO contas_pagar (
        titulo, valor_total, conta_contabil_id, data_emissao, data_quitacao, 
        competencia, centro_custo_id, origem, observacoes, status, 
        company_id, cadastro_id, parcelamento_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `, [
      titulo, valorTotal, contaContabil, dataEmissao, dataQuitacao || null, 
      competencia, centroCusto, origem, observacoes, status, 
      companyId, (cadastroId || cadastro) || null, parcelamentoId || parcelamento || null
    ]);

    const contaPagarId = contaPagarResult.rows[0].id;

    // Histórico
    await logHistory(client, {
      company_id: companyId,
      action: 'create',
      entity: 'contas_pagar',
      entity_id: contaPagarId,
      description: `Criado título a pagar: "${titulo}" (valor ${valorTotal})`,
      metadata: { titulo, valorTotal }
    });

    // Inserir parcelas
    if (parcelas && parcelas.length > 0) {
      for (const parcela of parcelas) {
        await client.query(`
          INSERT INTO parcelas_contas_pagar (
            conta_pagar_id, titulo_parcela, data_vencimento, data_pagamento,
            data_compensacao, valor_parcela, diferenca, valor_total, status, 
            forma_pagamento_id, conta_corrente_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          contaPagarId, parcela.tituloParcela, parcela.dataVencimento, parcela.dataPagamento || null,
          parcela.dataCompensacao || null, parcela.valorParcela, parcela.diferenca, parcela.valorTotal, 
          parcela.status, parcela.formaPagamentoId || null, parcela.contaCorrenteId || null
        ]);
      }
    }

    // Se alguma parcela já foi criada como 'pago', criar movimentação bancária correspondente
    // Garantir colunas extras e índice único para idempotência
    await client.query(`
      ALTER TABLE movimentacoes_financeiras
        ADD COLUMN IF NOT EXISTS id_origem UUID,
        ADD COLUMN IF NOT EXISTS tela_origem TEXT,
        ADD COLUMN IF NOT EXISTS parcela_id UUID;
      CREATE UNIQUE INDEX IF NOT EXISTS uniq_mov_parcela
        ON movimentacoes_financeiras (tela_origem, parcela_id)
        WHERE parcela_id IS NOT NULL;
    `);
    const pagasRes = await client.query(`
      SELECT id, conta_pagar_id, titulo_parcela, data_compensacao, data_pagamento,
             valor_parcela, valor_total, conta_corrente_id
      FROM parcelas_contas_pagar
      WHERE conta_pagar_id = $1 AND status = 'pago'
    `, [contaPagarId]);

    for (const p of pagasRes.rows) {
      const valor = Number(p.valor_total ?? p.valor_parcela ?? 0);
      const dataMov = p.data_compensacao || p.data_pagamento || new Date().toISOString();
      // Buscar razão social do fornecedor
      const fornecedorRes = await client.query(`
        SELECT COALESCE(c."nomeRazaoSocial", c."nomeFantasia", '') AS fornecedor
          FROM contas_pagar cp
          LEFT JOIN cadastros c ON cp.cadastro_id = c.id
         WHERE cp.id = $1
      `, [p.conta_pagar_id]);
      const fornecedor = fornecedorRes.rows[0]?.fornecedor || '';
      const desc = `pagamento titulo "${p.titulo_parcela || 'parcela'}" de "${fornecedor}"`;
      if (p.conta_corrente_id) {
        await client.query(`
          INSERT INTO movimentacoes_financeiras
            (conta_id, tipo_movimentacao, valor_entrada, valor_saida, descricao, descricao_detalhada,
             data_movimentacao, saldo_anterior, saldo_posterior, situacao, created_by,
             id_origem, tela_origem, parcela_id)
           VALUES
            ($1, 'saida', 0, $2, $3, $4, $5, 0, 0, 'pago', NULL,
             $6, $7, $8)
          ON CONFLICT (tela_origem, parcela_id) WHERE parcela_id IS NOT NULL DO NOTHING
        `, [p.conta_corrente_id, valor, 'Pagamento de conta a pagar', desc, dataMov, p.conta_pagar_id, 'contas_pagar_parcelas', p.id]);
        // Recalcular saldo após inserir movimento
        await client.query('SELECT recalcular_saldo_dia_conta($1)', [p.conta_corrente_id]);
        await logHistory(client, {
          company_id: companyId,
          action: 'parcela_paga',
          entity: 'parcela_contas_pagar',
          entity_id: p.id,
          description: `Parcela paga: "${p.titulo_parcela}" (valor ${valor})`,
          metadata: { conta_pagar_id: p.conta_pagar_id, valor }
        });
      }
    }

    // Implementar rateio de conta contábil usando as novas tabelas
    if (rateioContaContabil && rateioContaContabil.length > 0) {
      // Rateio múltiplo
      for (const item of rateioContaContabil) {
        if (item.contaContabilId && item.valor > 0) {
          // Inserir na tabela principal
          await client.query(`
            INSERT INTO contas_pagar_conta_contabil (conta_pagar_id, conta_contabil_id, valor, percentual)
            VALUES ($1, $2, $3, $4)
          `, [contaPagarId, item.contaContabilId, item.valor, item.percentual]);

          // Inserir para cada parcela se houver parcelas
          if (parcelas && parcelas.length > 0) {
            for (const parcela of parcelas) {
              // Buscar ID da parcela pelo título
              const parcelaResult = await client.query(`
                SELECT id FROM parcelas_contas_pagar WHERE conta_pagar_id = $1 AND titulo_parcela = $2
              `, [contaPagarId, parcela.tituloParcela]);

              if (parcelaResult.rows.length > 0) {
                const parcelaId = parcelaResult.rows[0].id;
                // Calcular valor proporcional da parcela
              const valorParcelaRateio = valorTotal > 0 ? (item.valor / valorTotal) * (Number(parcela.valorParcela) || 0) : 0;
                const percentualParcelaRateio = (Number(parcela.valorParcela) || 0) > 0 
                  ? (valorParcelaRateio / Number(parcela.valorParcela)) * 100 
                  : 0;
                const valorParcelaRateioRounded = Math.round(valorParcelaRateio * 100) / 100;
                const percentualParcelaRateioRounded = Math.round(percentualParcelaRateio * 100) / 100;
                
                await client.query(`
                  INSERT INTO contas_pagar_conta_contabil_parcela (conta_pagar_id, parcela_id, conta_contabil_id, valor, percentual)
                  VALUES ($1, $2, $3, $4, $5)
                `, [contaPagarId, parcelaId, item.contaContabilId, valorParcelaRateioRounded, percentualParcelaRateioRounded]);
              }
            }
          }
        }
      }
    } else if (contaContabil) {
      // Fallback: conta contábil única se não houver rateio
      const contaContabilId = contaContabil;
      
      // Inserir na tabela principal
      await client.query(`
        INSERT INTO contas_pagar_conta_contabil (conta_pagar_id, conta_contabil_id, valor, percentual)
        VALUES ($1, $2, $3, 100.00)
      `, [contaPagarId, contaContabilId, valorTotal]);

      // Inserir para cada parcela se houver parcelas
      if (parcelas && parcelas.length > 0) {
        for (const parcela of parcelas) {
          // Buscar ID da parcela pelo título
          const parcelaResult = await client.query(`
            SELECT id FROM parcelas_contas_pagar WHERE conta_pagar_id = $1 AND titulo_parcela = $2
          `, [contaPagarId, parcela.tituloParcela]);

          if (parcelaResult.rows.length > 0) {
            const parcelaId = parcelaResult.rows[0].id;
            await client.query(`
              INSERT INTO contas_pagar_conta_contabil_parcela (conta_pagar_id, parcela_id, conta_contabil_id, valor, percentual)
              VALUES ($1, $2, $3, $4, 100.00)
            `, [contaPagarId, parcelaId, contaContabilId, Math.round((Number(parcela.valorParcela) || 0) * 100) / 100]);
          }
        }
      }
    }

    // Implementar rateio de centro de custo usando as novas tabelas
    if (rateioCentroCusto && rateioCentroCusto.length > 0) {
      // Rateio múltiplo
      for (const item of rateioCentroCusto) {
        if (item.centroCustoId && item.valor > 0) {
          // Inserir na tabela principal
          await client.query(`
            INSERT INTO contas_pagar_centro_custo (conta_pagar_id, centro_custo_id, valor, percentual)
            VALUES ($1, $2, $3, $4)
          `, [contaPagarId, item.centroCustoId, item.valor, item.percentual]);

          // Inserir para cada parcela se houver parcelas
          if (parcelas && parcelas.length > 0) {
            for (const parcela of parcelas) {
              // Buscar ID da parcela pelo título
              const parcelaResult = await client.query(`
                SELECT id FROM parcelas_contas_pagar WHERE conta_pagar_id = $1 AND titulo_parcela = $2
              `, [contaPagarId, parcela.tituloParcela]);

              if (parcelaResult.rows.length > 0) {
                const parcelaId = parcelaResult.rows[0].id;
                // Calcular valor proporcional da parcela
                const valorParcelaRateio = valorTotal > 0 ? (item.valor / valorTotal) * (Number(parcela.valorParcela) || 0) : 0;
                const percentualParcelaRateio = (Number(parcela.valorParcela) || 0) > 0 
                  ? (valorParcelaRateio / Number(parcela.valorParcela)) * 100 
                  : 0;
                const valorParcelaRateioRounded = Math.round(valorParcelaRateio * 100) / 100;
                const percentualParcelaRateioRounded = Math.round(percentualParcelaRateio * 100) / 100;
                
                await client.query(`
                  INSERT INTO contas_pagar_centro_custo_parcela (conta_pagar_id, parcela_id, centro_custo_id, valor, percentual)
                  VALUES ($1, $2, $3, $4, $5)
                `, [contaPagarId, parcelaId, item.centroCustoId, valorParcelaRateioRounded, percentualParcelaRateioRounded]);
              }
            }
          }
        }
      }
    } else if (centroCusto) {
      // Fallback: centro de custo único se não houver rateio
      const centroCustoId = centroCusto;
      
      // Inserir na tabela principal
      await client.query(`
        INSERT INTO contas_pagar_centro_custo (conta_pagar_id, centro_custo_id, valor, percentual)
        VALUES ($1, $2, $3, 100.00)
      `, [contaPagarId, centroCustoId, valorTotal]);

      // Inserir para cada parcela se houver parcelas
      if (parcelas && parcelas.length > 0) {
        for (const parcela of parcelas) {
          // Buscar ID da parcela pelo título
          const parcelaResult = await client.query(`
            SELECT id FROM parcelas_contas_pagar WHERE conta_pagar_id = $1 AND titulo_parcela = $2
          `, [contaPagarId, parcela.tituloParcela]);

          if (parcelaResult.rows.length > 0) {
            const parcelaId = parcelaResult.rows[0].id;
            await client.query(`
              INSERT INTO contas_pagar_centro_custo_parcela (conta_pagar_id, parcela_id, centro_custo_id, valor, percentual)
              VALUES ($1, $2, $3, $4, 100.00)
            `, [contaPagarId, parcelaId, centroCustoId, Math.round((Number(parcela.valorParcela) || 0) * 100) / 100]);
          }
        }
      }
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: {
        id: contaPagarId,
        message: 'Conta a pagar salva com sucesso'
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao salvar conta a pagar:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor: ' + error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

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

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar contas a pagar com paginação e dados relacionados
    const result = await client.query(`
      SELECT 
        cp.*,
        c."nomeRazaoSocial" as fornecedor_nome,
        c."nomeFantasia" as fornecedor_fantasia,
        COALESCE(c.cnpj, c.cpf) as fornecedor_cpf_cnpj,
        CASE 
          WHEN cp.conta_contabil_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
          THEN cc.descricao
          ELSE COALESCE(cp.conta_contabil_id, '')
        END as conta_contabil_nome,
        CASE 
          WHEN cp.conta_contabil_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
          THEN cc.codigo
          ELSE ''
        END as conta_contabil_codigo,
        CASE 
          WHEN cp.centro_custo_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
          THEN centro.descricao
          ELSE COALESCE(cp.centro_custo_id, '')
        END as centro_custo_nome,
        CASE 
          WHEN cp.centro_custo_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
          THEN centro.codigo
          ELSE ''
        END as centro_custo_codigo,
        COALESCE(stats.total_parcelas, 0)::integer as total_parcelas,
        COALESCE(stats.parcelas_pagas, 0)::integer as parcelas_pagas,
        COALESCE(stats.parcelas_pendentes, 0)::integer as parcelas_pendentes,
        stats.proximo_vencimento,
        stats.ultimo_vencimento,
        COALESCE(stats.valor_pendente, 0) as valor_pendente,
        COALESCE(stats.valor_pago, 0) as valor_pago,
        COALESCE(stats.tem_parcela_vencida, false) as tem_parcela_vencida
      FROM contas_pagar cp
      LEFT JOIN cadastros c ON cp.cadastro_id = c.id
      LEFT JOIN contas_contabeis cc ON cp.conta_contabil_id::text = cc.id::text 
        AND cp.conta_contabil_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      LEFT JOIN centros_custos centro ON cp.centro_custo_id::text = centro.id::text
        AND cp.centro_custo_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      LEFT JOIN (
        SELECT 
          p.conta_pagar_id,
          COUNT(*)::integer as total_parcelas,
          SUM(CASE WHEN p.status = 'pago' THEN 1 ELSE 0 END)::integer as parcelas_pagas,
          SUM(CASE WHEN p.status = 'pendente' THEN 1 ELSE 0 END)::integer as parcelas_pendentes,
          MIN(CASE WHEN p.status = 'pendente' THEN p.data_vencimento END) as proximo_vencimento,
          MAX(CASE WHEN p.status = 'pendente' THEN p.data_vencimento END) as ultimo_vencimento,
          SUM(CASE WHEN p.status = 'pendente' THEN p.valor_parcela ELSE 0 END) as valor_pendente,
          SUM(CASE WHEN p.status = 'pago' THEN p.valor_total ELSE 0 END) as valor_pago,
          BOOL_OR(p.status = 'pendente' AND p.data_vencimento < CURRENT_DATE) as tem_parcela_vencida
        FROM parcelas_contas_pagar p
        GROUP BY p.conta_pagar_id
      ) stats ON cp.id = stats.conta_pagar_id
      WHERE cp.company_id = $1
      ORDER BY cp.created_at DESC
      LIMIT $2 OFFSET $3
    `, [companyId, limit, offset]);

    // Buscar parcelas para cada conta
    const contasIds = result.rows.map((row: any) => row.id);
    let parcelasMap: Record<string, any[]> = {};
    
    if (contasIds.length > 0) {
      const parcelasResult = await client.query(`
        SELECT 
          p.*,
          p.conta_pagar_id
        FROM parcelas_contas_pagar p
        WHERE p.conta_pagar_id = ANY($1)
        ORDER BY p.data_vencimento ASC
      `, [contasIds]);
      
      parcelasResult.rows.forEach((parcela: any) => {
        if (!parcelasMap[parcela.conta_pagar_id]) {
          parcelasMap[parcela.conta_pagar_id] = [];
        }
        parcelasMap[parcela.conta_pagar_id].push(parcela);
      });
    }

    // Adicionar parcelas a cada conta
    result.rows.forEach((row: any) => {
      row.parcelas = parcelasMap[row.id] || [];
    });

    // Contar total de registros
    const countResult = await client.query(`
      SELECT COUNT(*) as total FROM contas_pagar WHERE company_id = $1
    `, [companyId]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error: any) {
    console.error('Erro ao buscar contas a pagar:', error);
    const errorMessage = error?.message || 'Erro interno do servidor';
    const errorStack = error?.stack || '';
    console.error('Detalhes do erro:', { errorMessage, errorStack });
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
