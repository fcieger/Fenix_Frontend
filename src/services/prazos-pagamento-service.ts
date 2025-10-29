import { query } from '@/lib/database';

export interface PrazoPagamento {
  id: string;
  nome: string;
  descricao?: string;
  tipo: string;
  configuracoes: any;
  ativo: boolean;
  padrao: boolean;
  observacoes?: string;
  company_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePrazoPagamentoRequest {
  nome: string;
  descricao?: string;
  tipo?: string;
  configuracoes?: any;
  ativo?: boolean;
  padrao?: boolean;
  observacoes?: string;
  company_id: string;
}

export interface UpdatePrazoPagamentoRequest {
  id: string;
  nome?: string;
  descricao?: string;
  tipo?: string;
  configuracoes?: any;
  ativo?: boolean;
  padrao?: boolean;
  observacoes?: string;
}

export class PrazosPagamentoService {
  // Buscar todos os prazos de pagamento de uma empresa
  async getPrazosPagamento(companyId: string): Promise<PrazoPagamento[]> {
    const result = await query(
      `SELECT * FROM prazos_pagamento 
       WHERE company_id = $1 
       ORDER BY padrao DESC, nome ASC`,
      [companyId]
    );
    return result.rows;
  }

  // Buscar um prazo de pagamento por ID
  async getPrazoPagamentoById(id: string): Promise<PrazoPagamento | null> {
    const result = await query(
      `SELECT * FROM prazos_pagamento WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Criar novo prazo de pagamento
  async createPrazoPagamento(data: CreatePrazoPagamentoRequest): Promise<PrazoPagamento> {
    const result = await query(
      `INSERT INTO prazos_pagamento 
       (nome, descricao, tipo, configuracoes, ativo, padrao, observacoes, company_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [
        data.nome,
        data.descricao || null,
        data.tipo || 'dias',
        data.configuracoes || '{}',
        data.ativo !== false,
        data.padrao || false,
        data.observacoes || null,
        data.company_id
      ]
    );
    return result.rows[0];
  }

  // Atualizar prazo de pagamento
  async updatePrazoPagamento(data: UpdatePrazoPagamentoRequest): Promise<PrazoPagamento> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.nome !== undefined) {
      fields.push(`nome = $${paramIndex}`);
      values.push(data.nome);
      paramIndex++;
    }

    if (data.descricao !== undefined) {
      fields.push(`descricao = $${paramIndex}`);
      values.push(data.descricao);
      paramIndex++;
    }

    if (data.tipo !== undefined) {
      fields.push(`tipo = $${paramIndex}`);
      values.push(data.tipo);
      paramIndex++;
    }

    if (data.configuracoes !== undefined) {
      fields.push(`configuracoes = $${paramIndex}`);
      values.push(data.configuracoes);
      paramIndex++;
    }

    if (data.observacoes !== undefined) {
      fields.push(`observacoes = $${paramIndex}`);
      values.push(data.observacoes);
      paramIndex++;
    }

    if (data.ativo !== undefined) {
      fields.push(`ativo = $${paramIndex}`);
      values.push(data.ativo);
      paramIndex++;
    }

    if (data.padrao !== undefined) {
      fields.push(`padrao = $${paramIndex}`);
      values.push(data.padrao);
      paramIndex++;
    }

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    fields.push(`updated_at = NOW()`);
    values.push(data.id);

    const result = await query(
      `UPDATE prazos_pagamento 
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Prazo de pagamento não encontrado');
    }

    return result.rows[0];
  }

  // Deletar prazo de pagamento
  async deletePrazoPagamento(id: string): Promise<void> {
    const result = await query(
      `DELETE FROM prazos_pagamento WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error('Prazo de pagamento não encontrado');
    }
  }

  // Definir prazo de pagamento como padrão
  async setPrazoPagamentoPadrao(id: string, companyId: string): Promise<PrazoPagamento> {
    // Primeiro, remover padrão de todos os prazos da empresa
    await query(
      `UPDATE prazos_pagamento SET padrao = false WHERE company_id = $1`,
      [companyId]
    );

    // Depois, definir o prazo específico como padrão
    const result = await query(
      `UPDATE prazos_pagamento 
       SET padrao = true, updated_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      throw new Error('Prazo de pagamento não encontrado');
    }

    return result.rows[0];
  }

  // Criar prazos padrão para uma empresa
  async createPrazosPadrao(companyId: string): Promise<void> {
    const prazosPadrao = [
      { nome: 'À Vista', descricao: 'Pagamento à vista', configuracoes: { dias: 0 } },
      { nome: '30 Dias', descricao: 'Pagamento em 30 dias', configuracoes: { dias: 30 } },
      { nome: '60 Dias', descricao: 'Pagamento em 60 dias', configuracoes: { dias: 60 } },
      { nome: '90 Dias', descricao: 'Pagamento em 90 dias', configuracoes: { dias: 90 } },
      { nome: '120 Dias', descricao: 'Pagamento em 120 dias', configuracoes: { dias: 120 } }
    ];

    for (const prazo of prazosPadrao) {
      await query(
        `INSERT INTO prazos_pagamento 
         (nome, descricao, tipo, configuracoes, ativo, padrao, company_id, created_at, updated_at)
         VALUES ($1, $2, 'dias', $3, true, false, $4, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [prazo.nome, prazo.descricao, JSON.stringify(prazo.configuracoes), companyId]
      );
    }
  }
}
