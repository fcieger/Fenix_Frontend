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
  const { conta_corrente_id, data_pagamento, valor_recebido, descricao, created_by } = body || {};
  if (!validateUUID(conta_corrente_id)) {
    return NextResponse.json({ success: false, error: 'Conta inválida' }, { status: 400 });
  }

  try {
    const result = await transaction(async (client) => {
      const pRes = await client.query(
        `SELECT id, conta_receber_id, titulo_parcela, data_vencimento, data_compensacao, valor_parcela, valor_total, status
           FROM parcelas_contas_receber WHERE id = $1 FOR UPDATE`,
        [parcelaId],
      );
      if (pRes.rows.length === 0) throw new Error('Parcela não encontrada');
      const parcela = pRes.rows[0];
      if ((parcela.status || '').toLowerCase() === 'pago') throw new Error('Parcela já está recebida');

      const valor = Number(valor_recebido ?? parcela.valor_total ?? parcela.valor_parcela ?? 0);
      const dataMov = parcela.data_compensacao ? new Date(parcela.data_compensacao) : (data_pagamento ? new Date(data_pagamento) : new Date());

      await client.query(
        `ALTER TABLE movimentacoes_financeiras
           ADD COLUMN IF NOT EXISTS id_origem UUID,
           ADD COLUMN IF NOT EXISTS tela_origem TEXT,
           ADD COLUMN IF NOT EXISTS parcela_id UUID`,
      );

      const cliRes = await client.query(
        `SELECT COALESCE(c."nomeRazaoSocial", c."nomeFantasia", '') AS cliente
           FROM contas_receber cr LEFT JOIN cadastros c ON cr.cadastro_id = c.id
          WHERE cr.id = $1`,
        [parcela.conta_receber_id],
      );
      const cliente = cliRes.rows[0]?.cliente || '';
      const desc = `recebimento titulo "${parcela.titulo_parcela || 'parcela'}" de "${cliente}"`;

      await client.query(
        `UPDATE parcelas_contas_receber
            SET status = 'pago', data_pagamento = $2, conta_corrente_id = $3, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1`,
        [parcelaId, dataMov.toISOString(), conta_corrente_id],
      );

      const dup = await client.query(
        `SELECT 1 FROM movimentacoes_financeiras WHERE parcela_id = $1 AND tela_origem = 'contas_receber_parcelas' LIMIT 1`,
        [parcelaId],
      );
      if (dup.rowCount === 0) {
        await client.query(
          `INSERT INTO movimentacoes_financeiras
             (conta_id, tipo_movimentacao, valor_entrada, valor_saida, descricao, descricao_detalhada,
              data_movimentacao, saldo_anterior, saldo_posterior, situacao, created_by,
              id_origem, tela_origem, parcela_id)
           VALUES
             ($1,'entrada',$2,0,$3,$4,$5,0,0,'pago',$6,$7,'contas_receber_parcelas',$8)`,
          [conta_corrente_id, valor, 'Recebimento de conta a receber', desc, dataMov.toISOString(), created_by || null, parcela.conta_receber_id, parcelaId],
        );
        await client.query('SELECT recalcular_saldo_dia_conta($1)', [conta_corrente_id]);
      }

      const agg = await client.query(
        `SELECT COUNT(*)::int AS total_parcelas,
                SUM(CASE WHEN status = 'pago' THEN 1 ELSE 0 END)::int AS parcelas_pagas,
                SUM(CASE WHEN status <> 'pago' THEN 1 ELSE 0 END)::int AS parcelas_pendentes
           FROM parcelas_contas_receber WHERE conta_receber_id = $1`,
        [parcela.conta_receber_id],
      );
      const stats = agg.rows[0];

      let novoStatus = 'PARCIAL';
      let dataQuitacao: string | null = null;
      let bloqueado = false;
      if (Number(stats.parcelas_pendentes) === 0) {
        novoStatus = 'QUITADO';
        dataQuitacao = dataMov.toISOString();
        bloqueado = true;
      }

      const titulo = await client.query(
        `UPDATE contas_receber SET status=$2, data_quitacao=$3, bloqueado=$4, updated_at=CURRENT_TIMESTAMP WHERE id=$1 RETURNING *`,
        [parcela.conta_receber_id, novoStatus, dataQuitacao, bloqueado],
      );

      const parcelaAtualizada = await client.query(`SELECT * FROM parcelas_contas_receber WHERE id = $1`, [parcelaId]);

      await logHistory(client, {
        company_id: titulo.rows[0]?.company_id,
        action: 'parcela_paga',
        entity: 'parcela_contas_receber',
        entity_id: parcelaId,
        description: `Parcela recebida: "${parcela.titulo_parcela}" (valor ${valor})`,
        metadata: { conta_receber_id: parcela.conta_receber_id }
      });

      return {
        parcela: parcelaAtualizada.rows[0],
        titulo: titulo.rows[0],
        agregados: {
          total_parcelas: Number(stats.total_parcelas),
          parcelas_pagas: Number(stats.parcelas_pagas),
          parcelas_pendentes: Number(stats.parcelas_pendentes),
        },
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Erro ao registrar recebimento' }, { status: 400 });
  }
}


