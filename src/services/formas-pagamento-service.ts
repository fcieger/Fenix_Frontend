import { query } from '@/lib/database';

export interface FormaPagamento {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  padrao: boolean;
  companyId: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFormaPagamentoRequest {
  nome: string;
  descricao?: string;
  ativo?: boolean;
  padrao?: boolean;
  company_id: string;
}

export interface UpdateFormaPagamentoRequest {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
  padrao?: boolean;
}

export class FormasPagamentoService {
  // Buscar formas de pagamento
  async getFormasPagamento(companyId: string): Promise<FormaPagamento[]> {
    const result = await query(
      `SELECT 
        id, nome, descricao, ativo, padrao, "companyId", 
        created_at, updated_at
       FROM formas_pagamento 
       WHERE "companyId" = $1 AND ativo = true
       ORDER BY nome`,
      [companyId]
    );
    
    return result.rows;
  }

  // Criar forma de pagamento
  async createFormaPagamento(data: CreateFormaPagamentoRequest): Promise<FormaPagamento> {
    const result = await query(
      `INSERT INTO formas_pagamento 
       (id, nome, descricao, ativo, padrao, "companyId", created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [data.nome, data.descricao || null, data.ativo !== false, data.padrao || false, data.company_id]
    );
    
    return result.rows[0];
  }

  // Atualizar forma de pagamento
  async updateFormaPagamento(id: string, data: UpdateFormaPagamentoRequest): Promise<FormaPagamento> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.nome !== undefined) {
      fields.push(`nome = $${paramCount++}`);
      values.push(data.nome);
    }
    if (data.descricao !== undefined) {
      fields.push(`descricao = $${paramCount++}`);
      values.push(data.descricao);
    }
    if (data.ativo !== undefined) {
      fields.push(`ativo = $${paramCount++}`);
      values.push(data.ativo);
    }
    if (data.padrao !== undefined) {
      fields.push(`padrao = $${paramCount++}`);
      values.push(data.padrao);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE formas_pagamento 
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  // Excluir/inativar forma de pagamento
  async deleteFormaPagamento(id: string, ativo: boolean): Promise<FormaPagamento> {
    const result = await query(
      `UPDATE formas_pagamento 
       SET ativo = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [ativo, id]
    );
    
    return result.rows[0];
  }
}


