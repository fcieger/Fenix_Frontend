import { query, transaction } from '@/lib/database';
import { ContaFinanceira, CreateContaFinanceiraRequest, UpdateContaFinanceiraRequest, ContaFinanceiraFilters } from '@/types/conta';
import { validateContaFinanceira, validateUUID } from '@/utils/validations';

export class ContasService {
  async createConta(data: CreateContaFinanceiraRequest): Promise<ContaFinanceira> {
    // Validar dados
    const errors = validateContaFinanceira(data);
    if (errors.length > 0) {
      throw new Error(`Dados inválidos: ${errors.join(', ')}`);
    }

    // Validar UUIDs
    if (data.company_id && !validateUUID(data.company_id)) {
      throw new Error('company_id deve ser um UUID válido');
    }

    if (data.created_by && !validateUUID(data.created_by)) {
      throw new Error('created_by deve ser um UUID válido');
    }

    return await transaction(async (client) => {
      // 1. Criar a conta - usando apenas campos que existem na tabela
      const contaSql = `
        INSERT INTO contas_financeiras (
          "companyId", tipo_conta, descricao, banco_id, banco_nome, banco_codigo,
          numero_agencia, numero_conta, tipo_pessoa, saldo_inicial, data_abertura
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING *
      `;

      // Filtrar apenas campos que existem na tabela
      const contaParams = [
        data.company_id,
        data.tipo_conta,
        data.descricao,
        data.banco_id || null,
        data.banco_nome || null,
        data.banco_codigo || null,
        data.numero_agencia || null,
        data.numero_conta || null,
        data.tipo_pessoa || null,
        data.saldo_inicial || 0,
        data.data_abertura || new Date().toISOString().split('T')[0]
      ];

      console.log('🔧 Campos filtrados - apenas campos que existem na tabela:', contaParams);

      console.log('🔧 Criando conta com parâmetros:', contaParams);

      const contaResult = await client.query(contaSql, contaParams);
      const conta = contaResult.rows[0];

      // 2. Se há saldo inicial, criar lançamento automático
      if (data.saldo_inicial && data.saldo_inicial > 0) {
        const movimentacaoSql = `
          INSERT INTO movimentacoes_financeiras (
            conta_id, tipo_movimentacao, valor_entrada, valor_saida, descricao,
            descricao_detalhada, data_movimentacao, saldo_anterior, saldo_posterior,
            situacao, created_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          ) RETURNING *
        `;

        const movimentacaoParams = [
          conta.id,
          'entrada',
          data.saldo_inicial,
          0,
          'Saldo Inicial',
          `Saldo inicial da conta ${data.descricao}`,
          data.data_abertura || new Date().toISOString(),
          0, // saldo anterior é 0
          data.saldo_inicial, // saldo posterior é o saldo inicial
          'pago', // situacao pago pois é o saldo inicial
          data.created_by || null
        ];

        await client.query(movimentacaoSql, movimentacaoParams);
      }

      return conta;
    });
  }

  async calcularSaldoAtual(contaId: string): Promise<number> {
    if (!validateUUID(contaId)) {
      throw new Error('ID deve ser um UUID válido');
    }

    // Verificar se a conta existe
    const contaResult = await query('SELECT id FROM contas_financeiras WHERE id = $1', [contaId]);
    if (contaResult.rows.length === 0) {
      throw new Error('Conta não encontrada');
    }

    // Buscar todas as movimentações da conta (apenas as realizadas/pagas)
    // ORDENAR POR DATA - não excluir nenhum tipo de lançamento
    const movimentacoesResult = await query(
      'SELECT tipo_movimentacao, valor_entrada, valor_saida FROM movimentacoes_financeiras WHERE conta_id = $1 AND situacao = $2 ORDER BY data_movimentacao ASC, created_at ASC',
      [contaId, 'pago'] // ✅ Sem exclusão de "Saldo Inicial"
    );

    let saldoAtual = 0; // ✅ Começar do zero, não do saldo_inicial
    
    // Calcular saldo baseado nas movimentações em ordem cronológica
    for (const mov of movimentacoesResult.rows) {
      if (mov.tipo_movimentacao === 'entrada') {
        saldoAtual += parseFloat(mov.valor_entrada) || 0;
      } else if (mov.tipo_movimentacao === 'saida') {
        saldoAtual -= parseFloat(mov.valor_saida) || 0;
      } else if (mov.tipo_movimentacao === 'transferencia') {
        if (parseFloat(mov.valor_entrada) > 0) {
          saldoAtual += parseFloat(mov.valor_entrada);
        } else {
          saldoAtual -= parseFloat(mov.valor_saida) || 0;
        }
      }
    }

    return saldoAtual;
  }

  async atualizarSaldoAtual(contaId: string): Promise<number> {
    const saldoAtual = await this.calcularSaldoAtual(contaId);
    
    // Atualizar o saldo_atual na tabela
    await this.updateSaldoAtual(contaId, saldoAtual);
    

    return saldoAtual;
  }

  async getContaById(id: string): Promise<ContaFinanceira | null> {
    if (!validateUUID(id)) {
      throw new Error('ID deve ser um UUID válido');
    }

    const sql = 'SELECT * FROM contas_financeiras WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  async getContas(filters: ContaFinanceiraFilters = {}): Promise<ContaFinanceira[]> {
    let sql = 'SELECT * FROM contas_financeiras WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (filters.company_id) {
      paramCount++;
      sql += ` AND "companyId" = $${paramCount}`;
      params.push(filters.company_id);
    }

    if (filters.tipo_conta) {
      paramCount++;
      sql += ` AND tipo_conta = $${paramCount}`;
      params.push(filters.tipo_conta);
    }

    if (filters.status) {
      paramCount++;
      sql += ` AND status = $${paramCount}`;
      params.push(filters.status);
    }

    if (filters.banco_id) {
      paramCount++;
      sql += ` AND banco_id = $${paramCount}`;
      params.push(filters.banco_id);
    }

    if (filters.search) {
      paramCount++;
      sql += ` AND (descricao ILIKE $${paramCount} OR banco_nome ILIKE $${paramCount} OR banco_codigo ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    sql += ' ORDER BY created_at DESC';
    
    // ✅ Adicionar LIMIT padrão se não especificado para melhor performance
    if (!filters.limit) {
      sql += ' LIMIT 100'; // Limitar a 100 contas por padrão
    } else {
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      paramCount++;
      sql += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);
    return result.rows;
  }

  async updateConta(id: string, data: UpdateContaFinanceiraRequest): Promise<ContaFinanceira> {
    if (!validateUUID(id)) {
      throw new Error('ID deve ser um UUID válido');
    }

    if (data.updated_by && !validateUUID(data.updated_by)) {
      throw new Error('updated_by deve ser um UUID válido');
    }

    // Construir query dinamicamente baseada nos campos fornecidos
    const fields: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'updated_by') {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        params.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar foi fornecido');
    }

    if (data.updated_by) {
      paramCount++;
      fields.push(`updated_by = $${paramCount}`);
      params.push(data.updated_by);
    }

    paramCount++;
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `UPDATE contas_financeiras SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await query(sql, params);

    if (result.rows.length === 0) {
      throw new Error('Conta não encontrada');
    }

    return result.rows[0];
  }

  async deleteConta(id: string): Promise<{ success: boolean; action: 'deleted' | 'inactivated'; message: string }> {
    if (!validateUUID(id)) {
      throw new Error('ID deve ser um UUID válido');
    }

    // Verificar se a conta existe
    const conta = await this.getContaById(id);
    if (!conta) {
      throw new Error('Conta não encontrada');
    }

    // Verificar se existem movimentações financeiras relacionadas
    const movimentacoesSql = 'SELECT COUNT(*) as count FROM movimentacoes_financeiras WHERE conta_id = $1';
    const movimentacoesResult = await query(movimentacoesSql, [id]);
    const hasMovimentacoes = parseInt(movimentacoesResult.rows[0].count) > 0;

    if (hasMovimentacoes) {
      // Se tem movimentações, inativar a conta
      const inactivateSql = `
        UPDATE contas_financeiras 
        SET status = 'inativo', 
            updated_at = CURRENT_TIMESTAMP,
            updated_by = $2
        WHERE id = $1
      `;
      await query(inactivateSql, [id, '123e4567-e89b-12d3-a456-426614174001']); // System user
      
      return {
        success: true,
        action: 'inactivated',
        message: `Conta "${conta.descricao}" foi inativada pois possui movimentações financeiras associadas.`
      };
    } else {
      // Se não tem movimentações, excluir a conta
      const deleteSql = 'DELETE FROM contas_financeiras WHERE id = $1';
      const result = await query(deleteSql, [id]);
      
      if (result.rowCount === 0) {
        throw new Error('Erro ao excluir conta');
      }
      
      return {
        success: true,
        action: 'deleted',
        message: `Conta "${conta.descricao}" foi excluída com sucesso.`
      };
    }
  }

  async getContasByCompany(companyId: string): Promise<ContaFinanceira[]> {
    if (!validateUUID(companyId)) {
      throw new Error('company_id deve ser um UUID válido');
    }

    const sql = 'SELECT * FROM contas_financeiras WHERE "companyId" = $1 ORDER BY created_at DESC';
    const result = await query(sql, [companyId]);
    return result.rows;
  }

  async getContasByTipo(tipoConta: string, companyId?: string): Promise<ContaFinanceira[]> {
    let sql = 'SELECT * FROM contas_financeiras WHERE tipo_conta = $1';
    const params: any[] = [tipoConta];

    if (companyId) {
      if (!validateUUID(companyId)) {
        throw new Error('company_id deve ser um UUID válido');
      }
      sql += ' AND "companyId" = $2';
      params.push(companyId);
    }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    return result.rows;
  }

  async getResumoContas(companyId: string): Promise<{
    total_contas: number;
    contas_ativas: number;
    saldo_total: number;
    por_tipo: Record<string, number>;
  }> {
    if (!validateUUID(companyId)) {
      throw new Error('company_id deve ser um UUID válido');
    }

    const sql = `
      SELECT 
        COUNT(*) as total_contas,
        COUNT(CASE WHEN status = 'ativo' THEN 1 END) as contas_ativas,
        COALESCE(SUM(saldo_atual), 0) as saldo_total
      FROM contas_financeiras 
      WHERE "companyId" = $1
    `;

    const result = await query(sql, [companyId]);
    const resumo = result.rows[0];

    // Buscar contagem por tipo
    const sqlTipos = `
      SELECT tipo_conta, COUNT(*) as quantidade
      FROM contas_financeiras 
      WHERE company_id = $1
      GROUP BY tipo_conta
    `;

    const resultTipos = await query(sqlTipos, [companyId]);
    const porTipo: Record<string, number> = {};
    resultTipos.rows.forEach(row => {
      porTipo[row.tipo_conta] = parseInt(row.quantidade);
    });

    return {
      total_contas: parseInt(resumo.total_contas),
      contas_ativas: parseInt(resumo.contas_ativas),
      saldo_total: parseFloat(resumo.saldo_total),
      por_tipo: porTipo
    };
  }

  async updateSaldoAtual(id: string, novoSaldo: number): Promise<ContaFinanceira> {
    if (!validateUUID(id)) {
      throw new Error('ID deve ser um UUID válido');
    }

    const sql = `
      UPDATE contas_financeiras 
      SET saldo_atual = $1, data_ultima_atualizacao = CURRENT_TIMESTAMP
      WHERE id = $2 
      RETURNING *
    `;

    const result = await query(sql, [novoSaldo, id]);

    if (result.rows.length === 0) {
      throw new Error('Conta não encontrada');
    }

    return result.rows[0];
  }

  async atualizarTodosSaldos(companyId: string): Promise<void> {
    if (!validateUUID(companyId)) {
      throw new Error('company_id deve ser um UUID válido');
    }

    console.log(`🔄 Atualizando saldos para empresa ${companyId}...`);

    // Buscar todas as contas da empresa
    const contasResult = await query(
      'SELECT id, descricao FROM contas_financeiras WHERE "companyId" = $1',
      [companyId]
    );

    let contasAtualizadas = 0;
    let totalSaldo = 0;

    for (const conta of contasResult.rows) {
      try {
        const saldoAtual = await this.calcularSaldoAtual(conta.id);
        await this.updateSaldoAtual(conta.id, saldoAtual);
        
        contasAtualizadas++;
        totalSaldo += saldoAtual;
      } catch (error) {
        console.error(`❌ Erro ao atualizar saldo da conta ${conta.descricao}:`, error);
      }
    }

    console.log(`📊 Resumo: ${contasAtualizadas} contas atualizadas, Saldo total: R$ ${totalSaldo.toFixed(2)}`);
  }
}
