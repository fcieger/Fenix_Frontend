import { NextRequest, NextResponse } from 'next/server';
import { transaction } from '@/lib/database';
import { validateUUID } from '@/utils/validations';
import { logHistory } from '@/lib/history';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const parcelaId = params.id;
  if (!validateUUID(parcelaId)) return NextResponse.json({ success: false, error: 'Parcela inválida' }, { status: 400 });

  const body = await request.json();
  const { motivo } = body || {};

  try {
    const result = await transaction(async (client) => {
      const pRes = await client.query(
        `SELECT id, conta_receber_id, status, conta_corrente_id FROM parcelas_contas_receber WHERE id = $1 FOR UPDATE`,
        [parcelaId],
      );
      if (pRes.rowCount === 0) throw new Error('Parcela não encontrada');
      const parcela = pRes.rows[0];
      if ((parcela.status || '').toLowerCase() !== 'pago') throw new Error('Parcela não está recebida');

      // Apagar movimentação vinculada
      await client.query(`DELETE FROM movimentacoes_financeiras WHERE parcela_id = $1 AND tela_origem = 'contas_receber_parcelas'`, [parcelaId]);

      // Marcar como pendente
      await client.query(
        `UPDATE parcelas_contas_receber SET status='pendente', data_pagamento=NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [parcelaId],
      );

      // Recalcular agregados para atualizar título
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
      if (Number(stats.parcelas_pagas) === 0) {
        novoStatus = 'PENDENTE';
      }
      await client.query(
        `UPDATE contas_receber SET status=$2, data_quitacao=$3, bloqueado=$4, updated_at=CURRENT_TIMESTAMP WHERE id=$1`,
        [parcela.conta_receber_id, novoStatus, dataQuitacao, bloqueado],
      );

      await logHistory(client, {
        company_id: (await client.query('SELECT company_id FROM contas_receber WHERE id = $1', [parcela.conta_receber_id])).rows[0]?.company_id,
        action: 'parcela_estornada',
        entity: 'parcela_contas_receber',
        entity_id: parcelaId,
        description: `Estorno do recebimento da parcela (${parcelaId})`,
        metadata: { motivo: motivo || null, conta_receber_id: parcela.conta_receber_id }
      });
      return { ok: true, motivo: motivo || null };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Erro ao estornar recebimento' }, { status: 400 });
  }
}


