import { query } from '@/lib/database';
import { ContaContabil, CreateContaContabilRequest, UpdateContaContabilRequest, ContaContabilStats } from '@/types/conta-contabil';

export class ContasContabeisService {
  // Buscar contas contábeis
  async getContas(companyId: string): Promise<ContaContabil[]> {
    const result = await query(
      `SELECT 
        id, codigo, descricao, tipo, conta_pai_id, nivel, ativo, "companyId", 
        created_at, updated_at
       FROM contas_contabeis 
       WHERE "companyId" = $1 
       ORDER BY codigo, descricao`,
      [companyId]
    );
    
    return result.rows;
  }

  // Buscar estatísticas
  async getStats(companyId: string): Promise<ContaContabilStats> {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
        COUNT(CASE WHEN ativo = false THEN 1 END) as inativos,
        COUNT(CASE WHEN tipo = 'RECEITA' THEN 1 END) as receita,
        COUNT(CASE WHEN tipo = 'DESPESA_FIXA' THEN 1 END) as despesa_fixa,
        COUNT(CASE WHEN tipo = 'DESPESA_VARIAVEL' THEN 1 END) as despesa_variavel,
        COUNT(CASE WHEN tipo = 'PATRIMONIO' THEN 1 END) as patrimonio
       FROM contas_contabeis 
       WHERE "companyId" = $1`,
      [companyId]
    );
    
    const row = result.rows[0];
    return {
      total: parseInt(row.total),
      ativos: parseInt(row.ativos),
      inativos: parseInt(row.inativos),
      por_tipo: {
        receita: parseInt(row.receita),
        despesa_fixa: parseInt(row.despesa_fixa),
        despesa_variavel: parseInt(row.despesa_variavel),
        patrimonio: parseInt(row.patrimonio),
      },
    };
  }

  // Criar conta contábil
  async createConta(data: CreateContaContabilRequest): Promise<ContaContabil> {
    // Calcular nível baseado na conta pai
    let nivel = 1;
    if (data.conta_pai_id) {
      const paiResult = await query(
        'SELECT nivel FROM contas_contabeis WHERE id = $1',
        [data.conta_pai_id]
      );
      if (paiResult.rows.length > 0) {
        nivel = paiResult.rows[0].nivel + 1;
      }
    }

    const result = await query(
      `INSERT INTO contas_contabeis 
       (id, codigo, descricao, tipo, conta_pai_id, nivel, ativo, "companyId", created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [data.codigo, data.descricao, data.tipo, data.conta_pai_id || null, nivel, data.ativo, data.company_id]
    );
    
    return result.rows[0];
  }

  // Atualizar conta contábil
  async updateConta(id: string, data: UpdateContaContabilRequest): Promise<ContaContabil> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.codigo !== undefined) {
      fields.push(`codigo = $${paramCount++}`);
      values.push(data.codigo);
    }
    if (data.descricao !== undefined) {
      fields.push(`descricao = $${paramCount++}`);
      values.push(data.descricao);
    }
    if (data.tipo !== undefined) {
      fields.push(`tipo = $${paramCount++}`);
      values.push(data.tipo);
    }
    if (data.conta_pai_id !== undefined) {
      fields.push(`conta_pai_id = $${paramCount++}`);
      values.push(data.conta_pai_id);
    }
    if (data.nivel !== undefined) {
      fields.push(`nivel = $${paramCount++}`);
      values.push(data.nivel);
    }
    if (data.ativo !== undefined) {
      fields.push(`ativo = $${paramCount++}`);
      values.push(data.ativo);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE contas_contabeis 
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  // Excluir/inativar conta contábil
  async deleteConta(id: string, ativo: boolean): Promise<ContaContabil> {
    const result = await query(
      `UPDATE contas_contabeis 
       SET ativo = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [ativo, id]
    );
    
    return result.rows[0];
  }
}
