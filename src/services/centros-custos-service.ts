import { query, transaction } from '@/lib/database';
import { CentroCusto, CreateCentroCustoRequest, UpdateCentroCustoRequest, CentroCustoFilters, CentroCustoStats } from '@/types/centro-custo';
import { validateUUID } from '@/utils/validations';

export class CentrosCustosService {
  async createCentroCusto(data: CreateCentroCustoRequest): Promise<CentroCusto> {
    // Validar dados
    if (!data.codigo || data.codigo.length < 2 || data.codigo.length > 20) {
      throw new Error('Código deve ter entre 2 e 20 caracteres');
    }

    if (!data.descricao || data.descricao.length < 3 || data.descricao.length > 200) {
      throw new Error('Descrição deve ter entre 3 e 200 caracteres');
    }

    if (data.company_id && !validateUUID(data.company_id)) {
      throw new Error('company_id deve ser um UUID válido');
    }

    if (data.centro_pai_id && !validateUUID(data.centro_pai_id)) {
      throw new Error('centro_pai_id deve ser um UUID válido');
    }

    if (data.created_by && !validateUUID(data.created_by)) {
      throw new Error('created_by deve ser um UUID válido');
    }

    return await transaction(async (client) => {
      // Verificar se o código já existe no mesmo nível
      let codigoExists;
      if (data.centro_pai_id) {
        // Sub-pasta - verificar se código existe na mesma pasta pai
        codigoExists = await client.query(
          'SELECT id FROM centros_custos WHERE company_id = $1 AND codigo = $2 AND centro_pai_id = $3',
          [data.company_id, data.codigo, data.centro_pai_id]
        );
      } else {
        // Pasta principal - verificar se código existe no nível 1
        codigoExists = await client.query(
          'SELECT id FROM centros_custos WHERE company_id = $1 AND codigo = $2 AND centro_pai_id IS NULL',
          [data.company_id, data.codigo]
        );
      }

      if (codigoExists.rows.length > 0) {
        throw new Error('Código já existe neste nível');
      }

      // Se é sub-pasta, verificar se a pasta pai existe
      if (data.centro_pai_id) {
        const paiExists = await client.query(
          'SELECT id FROM centros_custos WHERE id = $1 AND company_id = $2',
          [data.centro_pai_id, data.company_id]
        );

        if (paiExists.rows.length === 0) {
          throw new Error('Pasta pai não encontrada');
        }
      }

      // Inserir centro de custo
      const sql = `
        INSERT INTO centros_custos (
          company_id, codigo, descricao, centro_pai_id, ativo, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        ) RETURNING *
      `;

      const params = [
        data.company_id,
        data.codigo,
        data.descricao,
        data.centro_pai_id || null,
        data.ativo !== false,
        data.created_by || null
      ];

      const result = await client.query(sql, params);
      return result.rows[0];
    });
  }

  async getCentrosCustos(filters: CentroCustoFilters = {}): Promise<CentroCusto[]> {
    let whereConditions = ['1=1'];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.company_id) {
      whereConditions.push(`cc.company_id = $${paramIndex}`);
      params.push(filters.company_id);
      paramIndex++;
    }

    if (filters.centro_pai_id !== undefined) {
      if (filters.centro_pai_id === null) {
        whereConditions.push('cc.centro_pai_id IS NULL');
      } else {
        whereConditions.push(`cc.centro_pai_id = $${paramIndex}`);
        params.push(filters.centro_pai_id);
        paramIndex++;
      }
    }

    if (filters.ativo !== undefined) {
      whereConditions.push(`cc.ativo = $${paramIndex}`);
      params.push(filters.ativo);
      paramIndex++;
    }

    if (filters.search) {
      whereConditions.push(`(cc.codigo ILIKE $${paramIndex} OR cc.descricao ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const sql = `
      SELECT 
        cc.*,
        ccp.codigo as centro_pai_codigo,
        ccp.descricao as centro_pai_descricao,
        CASE 
          WHEN cc.centro_pai_id IS NULL THEN 1 
          ELSE 2 
        END as nivel,
        (SELECT COUNT(*) FROM centros_custos sub WHERE sub.centro_pai_id = cc.id) as sub_pastas_count
      FROM centros_custos cc
      LEFT JOIN centros_custos ccp ON cc.centro_pai_id = ccp.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY cc.centro_pai_id NULLS FIRST, cc.codigo
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  async getCentroCustoById(id: string): Promise<CentroCusto | null> {
    if (!validateUUID(id)) {
      throw new Error('ID deve ser um UUID válido');
    }

    const sql = `
      SELECT 
        cc.*,
        ccp.codigo as centro_pai_codigo,
        ccp.descricao as centro_pai_descricao,
        CASE 
          WHEN cc.centro_pai_id IS NULL THEN 1 
          ELSE 2 
        END as nivel,
        (SELECT COUNT(*) FROM centros_custos sub WHERE sub.centro_pai_id = cc.id) as sub_pastas_count
      FROM centros_custos cc
      LEFT JOIN centros_custos ccp ON cc.centro_pai_id = ccp.id
      WHERE cc.id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  async updateCentroCusto(id: string, data: UpdateCentroCustoRequest): Promise<CentroCusto> {
    if (!validateUUID(id)) {
      throw new Error('ID deve ser um UUID válido');
    }

    if (data.updated_by && !validateUUID(data.updated_by)) {
      throw new Error('updated_by deve ser um UUID válido');
    }

    return await transaction(async (client) => {
      // Buscar centro atual
      const current = await this.getCentroCustoById(id);
      if (!current) {
        throw new Error('Centro de custo não encontrado');
      }

      // Verificar se o código já existe no mesmo nível (se foi alterado)
      if (data.codigo && data.codigo !== current.codigo) {
        const codigoExistsSql = `
          SELECT id FROM centros_custos 
          WHERE company_id = $1 AND codigo = $2 AND id != $3
          AND (centro_pai_id IS NULL AND $4 IS NULL OR centro_pai_id = $4)
        `;
        const codigoExists = await client.query(codigoExistsSql, [
          current.company_id,
          data.codigo,
          id,
          data.centro_pai_id !== undefined ? data.centro_pai_id : current.centro_pai_id
        ]);

        if (codigoExists.rows.length > 0) {
          throw new Error('Código já existe neste nível');
        }
      }

      // Se está mudando a pasta pai, verificar se a nova pasta pai existe
      if (data.centro_pai_id !== undefined && data.centro_pai_id !== current.centro_pai_id) {
        if (data.centro_pai_id) {
          const paiExists = await client.query(
            'SELECT id FROM centros_custos WHERE id = $1 AND company_id = $2',
            [data.centro_pai_id, current.company_id]
          );

          if (paiExists.rows.length === 0) {
            throw new Error('Pasta pai não encontrada');
          }
        }
      }

      // Atualizar
      const updateFields = [];
      const params = [];
      let paramIndex = 1;

      if (data.codigo !== undefined) {
        updateFields.push(`codigo = $${paramIndex}`);
        params.push(data.codigo);
        paramIndex++;
      }

      if (data.descricao !== undefined) {
        updateFields.push(`descricao = $${paramIndex}`);
        params.push(data.descricao);
        paramIndex++;
      }

      if (data.centro_pai_id !== undefined) {
        updateFields.push(`centro_pai_id = $${paramIndex}`);
        params.push(data.centro_pai_id || null);
        paramIndex++;
      }

      if (data.ativo !== undefined) {
        updateFields.push(`ativo = $${paramIndex}`);
        params.push(data.ativo);
        paramIndex++;
      }

      if (data.updated_by !== undefined) {
        updateFields.push(`updated_by = $${paramIndex}`);
        params.push(data.updated_by);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        throw new Error('Nenhum campo para atualizar');
      }

      params.push(id);

      const sql = `
        UPDATE centros_custos 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(sql, params);
      return result.rows[0];
    });
  }

  async deleteCentroCusto(id: string): Promise<{ success: boolean; action: 'deleted' | 'inactivated'; message: string }> {
    if (!validateUUID(id)) {
      throw new Error('ID deve ser um UUID válido');
    }

    return await transaction(async (client) => {
      // Verificar se tem sub-pastas
      const subPastas = await client.query(
        'SELECT COUNT(*) as count FROM centros_custos WHERE centro_pai_id = $1',
        [id]
      );

      const hasSubPastas = parseInt(subPastas.rows[0].count) > 0;

      if (hasSubPastas) {
        // Se tem sub-pastas, apenas inativar
        await client.query(
          'UPDATE centros_custos SET ativo = false WHERE id = $1',
          [id]
        );

        return {
          success: true,
          action: 'inactivated',
          message: 'Centro de custo inativado (possui sub-pastas)'
        };
      } else {
        // Se não tem sub-pastas, pode excluir
        await client.query(
          'DELETE FROM centros_custos WHERE id = $1',
          [id]
        );

        return {
          success: true,
          action: 'deleted',
          message: 'Centro de custo excluído com sucesso'
        };
      }
    });
  }

  async getStats(filters: CentroCustoFilters = {}): Promise<CentroCustoStats> {
    let whereConditions = ['1=1'];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.company_id) {
      whereConditions.push(`company_id = $${paramIndex}`);
      params.push(filters.company_id);
      paramIndex++;
    }

    const sql = `
      SELECT 
        COUNT(*) as total_centros,
        COUNT(CASE WHEN ativo = true THEN 1 END) as centros_ativos,
        COUNT(CASE WHEN ativo = false THEN 1 END) as centros_inativos,
        COUNT(CASE WHEN centro_pai_id IS NULL THEN 1 END) as nivel_1_count,
        COUNT(CASE WHEN centro_pai_id IS NOT NULL THEN 1 END) as nivel_2_count
      FROM centros_custos
      WHERE ${whereConditions.join(' AND ')}
    `;

    const result = await query(sql, params);
    const stats = result.rows[0];

    return {
      total_centros: parseInt(stats.total_centros),
      centros_ativos: parseInt(stats.centros_ativos),
      centros_inativos: parseInt(stats.centros_inativos),
      nivel_1_count: parseInt(stats.nivel_1_count),
      nivel_2_count: parseInt(stats.nivel_2_count)
    };
  }
}
