import { NextRequest, NextResponse } from 'next/server';
import { transaction } from '@/lib/database';
import { validateUUID } from '@/utils/validations';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const parcelaId = params.id;
  if (!validateUUID(parcelaId)) {
    return NextResponse.json({ success: false, error: 'Parcela inválida' }, { status: 400 });
  }

  try {
    const result = await transaction(async (client) => {
      // Buscar parcela e bloquear
      const pRes = await client.query(
        `SELECT id, conta_pagar_id, status FROM parcelas_contas_pagar WHERE id = $1 FOR UPDATE`,
        [parcelaId]
      );
      if (pRes.rows.length === 0) throw new Error('Parcela não encontrada');
      const parcela = pRes.rows[0];

      // Só permite estornar se estiver paga
      if ((parcela.status || '').toLowerCase() !== 'pago') {
        throw new Error('Parcela não está paga');
      }

      // Descobrir contas afetadas pelos lançamentos desta parcela
      const contasAfetadasRes = await client.query(
        `SELECT DISTINCT conta_id FROM movimentacoes_financeiras WHERE parcela_id = $1 AND tela_origem = 'contas_pagar_parcelas'`,
        [parcelaId]
      );

      // Excluir lançamentos bancários correspondentes à parcela
      await client.query(
        `DELETE FROM movimentacoes_financeiras WHERE parcela_id = $1 AND tela_origem = 'contas_pagar_parcelas'`,
        [parcelaId]
      );

      // Atualizar parcela para pendente
      await client.query(
        `UPDATE parcelas_contas_pagar
            SET status = 'pendente',
                data_pagamento = NULL,
                updated_at = CURRENT_TIMESTAMP
          WHERE id = $1`,
        [parcelaId]
      );

      // Recalcular agregados do título
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

      // Definir novo status do título
      let novoStatus = 'PARCIAL';
      let dataQuitacao: string | null = null;
      let bloqueado = false;
      if (Number(stats.parcelas_pagas) === 0) {
        novoStatus = 'PENDENTE';
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

      // Recalcular saldos do dia para contas afetadas
      for (const row of contasAfetadasRes.rows) {
        if (row?.conta_id) {
          await client.query('SELECT recalcular_saldo_dia_conta($1)', [row.conta_id]);
        }
      }
      const parcelaAtualizada = await client.query(
        `SELECT * FROM parcelas_contas_pagar WHERE id = $1`,
        [parcelaId]
      );

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
    return NextResponse.json({ success: false, error: err.message || 'Erro ao estornar parcela' }, { status: 400 });
  }
}


