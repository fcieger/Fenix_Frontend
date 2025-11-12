import { NextRequest, NextResponse } from 'next/server';
import { transaction } from '@/lib/database';
import { validateUUID } from '@/utils/validations';
import { extractUserIdFromToken } from '@/lib/auth-utils';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!validateUUID(id)) {
    return NextResponse.json({ success: false, error: 'Parcela inválida' }, { status: 400 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const userId = extractUserIdFromToken(token);

  if (!userId) {
    return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
  }

  const body = await request.json();
  const { data_pagamento, data_compensacao, conta_corrente_id, forma_pagamento_id } = body || {};

  try {
    const result = await transaction(async (client) => {
      // Buscar parcela e verificar company_id
      const parcelaRes = await client.query(
        `SELECT p.id, p.conta_receber_id, cr.company_id 
         FROM parcelas_contas_receber p
         JOIN contas_receber cr ON p.conta_receber_id = cr.id
         WHERE p.id = $1`,
        [id]
      );

      if (parcelaRes.rows.length === 0) {
        throw new Error('Parcela não encontrada');
      }

      const parcela = parcelaRes.rows[0];
      const companyId = parcela.company_id;

      // Validar company_id se fornecido
      const companyIdParam = request.nextUrl.searchParams.get('company_id');
      if (companyIdParam && companyIdParam !== companyId) {
        throw new Error('Acesso negado');
      }

      // Preparar campos para atualização
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data_pagamento !== undefined) {
        updates.push(`data_pagamento = $${paramCount}`);
        values.push(data_pagamento || null);
        paramCount++;
      }

      if (data_compensacao !== undefined) {
        updates.push(`data_compensacao = $${paramCount}`);
        values.push(data_compensacao || null);
        paramCount++;
      }

      if (conta_corrente_id !== undefined) {
        if (conta_corrente_id && !validateUUID(conta_corrente_id)) {
          throw new Error('Conta corrente inválida');
        }
        updates.push(`conta_corrente_id = $${paramCount}`);
        values.push(conta_corrente_id || null);
        paramCount++;
      }

      if (forma_pagamento_id !== undefined) {
        if (forma_pagamento_id && !validateUUID(forma_pagamento_id)) {
          throw new Error('Forma de pagamento inválida');
        }
        updates.push(`forma_pagamento_id = $${paramCount}`);
        values.push(forma_pagamento_id || null);
        paramCount++;
      }

      if (updates.length === 0) {
        throw new Error('Nenhum campo para atualizar');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      await client.query(
        `UPDATE parcelas_contas_receber 
         SET ${updates.join(', ')}
         WHERE id = $${paramCount}`,
        values
      );

      // Buscar parcela atualizada
      const updatedRes = await client.query(
        `SELECT p.*, 
         fp.nome as forma_pagamento_nome, 
         cf.descricao as conta_corrente_nome, 
         cf.banco_nome
         FROM parcelas_contas_receber p
         LEFT JOIN formas_pagamento fp ON p.forma_pagamento_id = fp.id
         LEFT JOIN contas_financeiras cf ON p.conta_corrente_id = cf.id
         WHERE p.id = $1`,
        [id]
      );

      return updatedRes.rows[0];
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Erro ao atualizar parcela:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao atualizar parcela' },
      { status: 500 }
    );
  }
}

