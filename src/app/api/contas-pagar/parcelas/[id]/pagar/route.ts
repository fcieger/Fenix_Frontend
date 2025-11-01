import { NextRequest, NextResponse } from 'next/server';
import { transaction } from '@/lib/database';
import { validateUUID } from '@/utils/validations';
import { logHistory } from '@/lib/history';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const parcelaId = params.id;
  if (!validateUUID(parcelaId)) {
    return NextResponse.json({ success: false, error: 'Parcela inválida' }, { status: 400 });
  }

  const body = await request.json();
  const { conta_corrente_id, data_pagamento, valor_pago, descricao, created_by } = body || {};
  if (!validateUUID(conta_corrente_id)) {
    return NextResponse.json({ success: false, error: 'Conta inválida' }, { status: 400 });
  }

  try {
    const result = await transaction(async (client) => {
      // Buscar parcela e bloquear linha
      const pRes = await client.query(
        `SELECT id, conta_pagar_id, titulo_parcela, data_vencimento, data_compensacao, valor_parcela, valor_total, status 
           FROM parcelas_contas_pagar 
          WHERE id = $1 FOR UPDATE`,
        [parcelaId]
      );
      if (pRes.rows.length === 0) throw new Error('Parcela não encontrada');
      const parcela = pRes.rows[0];
      if ((parcela.status || '').toLowerCase() === 'pago') throw new Error('Parcela já está paga');

      const valor = Number(valor_pago ?? parcela.valor_total ?? parcela.valor_parcela ?? 0);
      const dataMov = parcela.data_compensacao
        ? new Date(parcela.data_compensacao)
        : (data_pagamento ? new Date(data_pagamento) : new Date());
      // Garantir colunas de origem e referência da parcela em movimentações
      await client.query(`
        ALTER TABLE movimentacoes_financeiras
          ADD COLUMN IF NOT EXISTS id_origem UUID,
          ADD COLUMN IF NOT EXISTS tela_origem TEXT,
          ADD COLUMN IF NOT EXISTS parcela_id UUID
      `);

      // Buscar fornecedor (razao social) para compor descrição
      const fornecedorRes = await client.query(
        `SELECT COALESCE(c."nomeRazaoSocial", c."nomeFantasia", '') AS fornecedor
           FROM contas_pagar cp
           LEFT JOIN cadastros c ON cp.cadastro_id = c.id
          WHERE cp.id = $1`,
        [parcela.conta_pagar_id]
      );
      const fornecedor = fornecedorRes.rows[0]?.fornecedor || '';

      const desc = `pagamento titulo "${parcela.titulo_parcela || 'parcela'}" de "${fornecedor}"`;

      // Atualizar parcela
      await client.query(
        `UPDATE parcelas_contas_pagar
            SET status = 'pago',
                data_pagamento = $2,
                conta_corrente_id = $3,
                updated_at = CURRENT_TIMESTAMP
          WHERE id = $1`,
        [parcelaId, dataMov.toISOString(), conta_corrente_id]
      );

      // Evitar duplicidade: já existe lançamento para esta parcela?
      const dupCheck = await client.query(
        `SELECT 1 FROM movimentacoes_financeiras 
          WHERE parcela_id = $1 AND tela_origem = 'contas_pagar_parcelas' 
          LIMIT 1`,
        [parcelaId]
      );

      if (dupCheck.rowCount === 0) {
        // Criar movimentação financeira (saida) com origem e referência da parcela
        await client.query(
        `INSERT INTO movimentacoes_financeiras
          (conta_id, tipo_movimentacao, valor_entrada, valor_saida, descricao, descricao_detalhada,
           data_movimentacao, saldo_anterior, saldo_posterior, situacao, created_by,
           id_origem, tela_origem, parcela_id)
         VALUES
          ($1, 'saida', 0, $2, $3, $4, $5, 0, 0, 'pago', $6,
           $7, $8, $9)`,
          [
            conta_corrente_id,
            valor,
            'Pagamento de conta a pagar',
            desc,
            dataMov.toISOString(),
            created_by || null,
            parcela.conta_pagar_id,
            'contas_pagar_parcelas',
            parcelaId
          ]
        );
        // Recalcular saldos do dia para refletir saldo_apos_movimentacao corretamente
        await client.query('SELECT recalcular_saldo_dia_conta($1)', [conta_corrente_id]);
      }
      // Triggers atualizam saldo_atual

      // Agregados do título
      const agg = await client.query(
        `SELECT 
            COUNT(*)::int                                 AS total_parcelas,
            SUM(CASE WHEN status = 'pago' THEN 1 ELSE 0 END)::int    AS parcelas_pagas,
            SUM(CASE WHEN status <> 'pago' THEN 1 ELSE 0 END)::int   AS parcelas_pendentes
         FROM parcelas_contas_pagar
         WHERE conta_pagar_id = $1`,
        [parcela.conta_pagar_id]
      );
      const stats = agg.rows[0];

      // Status do título
      let novoStatus = 'PARCIAL';
      let dataQuitacao: string | null = null;
      let bloqueado = false;
      if (Number(stats.parcelas_pendentes) === 0) {
        novoStatus = 'QUITADO';
        dataQuitacao = dataMov.toISOString();
        bloqueado = true;
      }

      const updateTitulo = await client.query(
        `UPDATE contas_pagar
            SET status = $2,
                data_quitacao = $3,
                bloqueado = $4,
                updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *`,
        [parcela.conta_pagar_id, novoStatus, dataQuitacao, bloqueado]
      );

      const titulo = updateTitulo.rows[0];
      const parcelaAtualizada = await client.query(
        `SELECT * FROM parcelas_contas_pagar WHERE id = $1`,
        [parcelaId]
      );

      await logHistory(client, {
        company_id: titulo?.company_id,
        action: 'parcela_paga',
        entity: 'parcela_contas_pagar',
        entity_id: parcelaId,
        description: `Parcela paga: "${parcela.titulo_parcela}" (valor ${valor})`,
        metadata: { conta_pagar_id: parcela.conta_pagar_id }
      });

      return {
        parcela: parcelaAtualizada.rows[0],
        titulo,
        agregados: {
          total_parcelas: Number(stats.total_parcelas),
          parcelas_pagas: Number(stats.parcelas_pagas),
          parcelas_pendentes: Number(stats.parcelas_pendentes)
        }
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Erro ao pagar parcela' }, { status: 400 });
  }
}


