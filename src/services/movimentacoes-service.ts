import { query, transaction } from '@/lib/database';
import { MovimentacaoFinanceira, CreateMovimentacaoRequest, UpdateMovimentacaoRequest, MovimentacaoFilters } from '@/types/movimentacao';
import { validateMovimentacao, validateUUID } from '@/utils/validations';
import { ContasService } from './contas-service';

export class MovimentacoesService {
  private contasService: ContasService;

  constructor() {
    this.contasService = new ContasService();
  }

  async createMovimentacao(data: CreateMovimentacaoRequest): Promise<MovimentacaoFinanceira> {
    // Validar dados
    const errors = validateMovimentacao(data);
    if (errors.length > 0) {
      throw new Error(`Dados inválidos: ${errors.join(', ')}`);
    }

    // Validar UUIDs
    if (!validateUUID(data.conta_id)) {
      throw new Error('conta_id deve ser um UUID válido');
    }

    if (data.conta_destino_id && !validateUUID(data.conta_destino_id)) {
      throw new Error('conta_destino_id deve ser um UUID válido');
    }

    if (data.created_by && !validateUUID(data.created_by)) {
      throw new Error('created_by deve ser um UUID válido');
    }

    return await transaction(async (client) => {
      // Buscar conta atual
      const conta = await this.contasService.getContaById(data.conta_id);
      if (!conta) {
        throw new Error('Conta não encontrada');
      }

      const saldoAnterior = conta.saldo_atual;
      let saldoPosterior = saldoAnterior;
      let valorEntrada = data.valor_entrada || 0;
      let valorSaida = data.valor_saida || 0;

      // Calcular novo saldo
      if (data.tipo_movimentacao === 'entrada') {
        saldoPosterior = saldoAnterior + valorEntrada;
      } else if (data.tipo_movimentacao === 'saida') {
        saldoPosterior = saldoAnterior - valorSaida;
      } else if (data.tipo_movimentacao === 'transferencia') {
        if (valorEntrada > 0) {
          saldoPosterior = saldoAnterior + valorEntrada;
        } else {
          saldoPosterior = saldoAnterior - valorSaida;
        }
      }

      // Inserir movimentação
      const sql = `
        INSERT INTO movimentacoes_financeiras (
          conta_id, tipo_movimentacao, valor_entrada, valor_saida, descricao,
          descricao_detalhada, data_movimentacao, saldo_anterior, saldo_posterior,
          situacao, conta_destino_id, categoria_id, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        ) RETURNING *
      `;

      const params = [
        data.conta_id,
        data.tipo_movimentacao,
        valorEntrada,
        valorSaida,
        data.descricao || null,
        data.descricao_detalhada || null,
        data.data_movimentacao,
        saldoAnterior,
        saldoPosterior,
        data.situacao || 'pendente',
        data.conta_destino_id || null,
        data.categoria_id || null,
        data.created_by || null
      ];

      const result = await client.query(sql, params);
      const movimentacao = result.rows[0];

      // Atualizar saldo da conta usando o método do serviço
      await this.contasService.atualizarSaldoAtual(data.conta_id);

      // Recalcular saldo_apos_movimentacao para todas as movimentações da conta
      await client.query('SELECT recalcular_saldo_dia_conta($1)', [data.conta_id]);

      // Se for transferência e há conta destino, criar movimentação na conta destino
      if (data.tipo_movimentacao === 'transferencia' && data.conta_destino_id) {
        const contaDestino = await this.contasService.getContaById(data.conta_destino_id);
        if (!contaDestino) {
          throw new Error('Conta destino não encontrada');
        }

        const saldoAnteriorDestino = contaDestino.saldo_atual;
        const saldoPosteriorDestino = saldoAnteriorDestino + (valorEntrada > 0 ? valorEntrada : valorSaida);

        // Inserir movimentação na conta destino
        const sqlDestino = `
          INSERT INTO movimentacoes_financeiras (
            conta_id, tipo_movimentacao, valor_entrada, valor_saida, descricao,
            data_movimentacao, saldo_anterior, saldo_posterior, conta_destino_id,
            categoria_id, created_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          ) RETURNING *
        `;

        const paramsDestino = [
          data.conta_destino_id,
          'transferencia',
          valorEntrada > 0 ? valorEntrada : 0,
          valorSaida > 0 ? valorSaida : 0,
          data.descricao || `Transferência de ${conta.descricao}`,
          data.data_movimentacao,
          saldoAnteriorDestino,
          saldoPosteriorDestino,
          data.conta_id,
          data.categoria_id || null,
          data.created_by || null
        ];

        await client.query(sqlDestino, paramsDestino);

        // Atualizar saldo da conta destino usando o método do serviço
        await this.contasService.atualizarSaldoAtual(data.conta_destino_id);

        // Recalcular saldo_apos_movimentacao para todas as movimentações da conta destino
        await client.query('SELECT recalcular_saldo_dia_conta($1)', [data.conta_destino_id]);
      }

      return movimentacao;
    });
  }

  async getMovimentacaoById(id: string): Promise<MovimentacaoFinanceira | null> {
    if (!validateUUID(id)) {
      throw new Error('ID deve ser um UUID válido');
    }

    const sql = 'SELECT *, saldo_apos_movimentacao FROM movimentacoes_financeiras WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  async getMovimentacoes(filters: MovimentacaoFilters = {}): Promise<MovimentacaoFinanceira[]> {
    let sql = 'SELECT *, saldo_apos_movimentacao FROM movimentacoes_financeiras WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (filters.conta_id) {
      paramCount++;
      sql += ` AND conta_id = $${paramCount}`;
      params.push(filters.conta_id);
    }

    if (filters.tipo_movimentacao) {
      paramCount++;
      // Suportar múltiplos tipos separados por vírgula
      const tipos = filters.tipo_movimentacao.split(',').map(t => t.trim());
      if (tipos.length === 1) {
        sql += ` AND tipo_movimentacao = $${paramCount}`;
        params.push(tipos[0]);
      } else {
        const placeholders = tipos.map((_, index) => `$${paramCount + index}`).join(',');
        sql += ` AND tipo_movimentacao IN (${placeholders})`;
        params.push(...tipos);
        paramCount += tipos.length - 1;
      }
    }

    if (filters.data_inicio) {
      paramCount++;
      sql += ` AND data_movimentacao >= $${paramCount}`;
      params.push(filters.data_inicio);
    }

    if (filters.data_fim) {
      paramCount++;
      sql += ` AND data_movimentacao <= $${paramCount}`;
      params.push(filters.data_fim);
    }

    // Filtro por período (formato YYYY-MM)
    if (filters.periodo) {
      const [ano, mes] = filters.periodo.split('-');
      const dataInicio = `${ano}-${mes}-01`;
      
      // Calcular o último dia do mês
      const ultimoDia = new Date(parseInt(ano), parseInt(mes), 0).getDate();
      const dataFim = `${ano}-${mes}-${ultimoDia.toString().padStart(2, '0')}`;
      
      paramCount++;
      sql += ` AND data_movimentacao >= $${paramCount}`;
      params.push(dataInicio);
      
      paramCount++;
      sql += ` AND data_movimentacao <= $${paramCount}`;
      params.push(dataFim);
    }

    // Filtro de busca por descrição
    if (filters.search) {
      paramCount++;
      sql += ` AND (descricao ILIKE $${paramCount} OR descricao_detalhada ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    // Filtro por situação
    if (filters.situacao) {
      paramCount++;
      // Suportar múltiplas situações separadas por vírgula
      const situacoes = filters.situacao.split(',').map(s => s.trim());
      if (situacoes.length === 1) {
        sql += ` AND situacao = $${paramCount}`;
        params.push(situacoes[0]);
      } else {
        const placeholders = situacoes.map((_, index) => `$${paramCount + index}`).join(',');
        sql += ` AND situacao IN (${placeholders})`;
        params.push(...situacoes);
        paramCount += situacoes.length - 1;
      }
    }

    if (filters.valor_min !== undefined) {
      paramCount++;
      sql += ` AND (valor_entrada >= $${paramCount} OR valor_saida >= $${paramCount})`;
      params.push(filters.valor_min);
    }

    if (filters.valor_max !== undefined) {
      paramCount++;
      sql += ` AND (valor_entrada <= $${paramCount} OR valor_saida <= $${paramCount})`;
      params.push(filters.valor_max);
    }

    sql += ' ORDER BY data_movimentacao ASC, created_at ASC';

    if (filters.limit) {
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

  async updateMovimentacao(id: string, data: UpdateMovimentacaoRequest): Promise<MovimentacaoFinanceira> {
    if (!validateUUID(id)) {
      throw new Error('ID deve ser um UUID válido');
    }

    if (data.updated_by && !validateUUID(data.updated_by)) {
      throw new Error('updated_by deve ser um UUID válido');
    }

    // Buscar movimentação atual
    const movimentacaoAtual = await this.getMovimentacaoById(id);
    if (!movimentacaoAtual) {
      throw new Error('Movimentação não encontrada');
    }

    // Construir query dinamicamente
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

    paramCount++;
    params.push(id);

    const sql = `UPDATE movimentacoes_financeiras SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await query(sql, params);

    if (result.rows.length === 0) {
      throw new Error('Movimentação não encontrada');
    }

    const atualizada = result.rows[0];

    // Recalcular saldos do dia e saldo atual da(s) conta(s) envolvida(s)
    const contaAntiga = movimentacaoAtual.conta_id;
    const contaNova = (data as any).conta_id || movimentacaoAtual.conta_id;
    await this.contasService.atualizarSaldoAtual(contaNova);
    await query('SELECT recalcular_saldo_dia_conta($1)', [contaNova]);
    if (contaNova !== contaAntiga) {
      await this.contasService.atualizarSaldoAtual(contaAntiga);
      await query('SELECT recalcular_saldo_dia_conta($1)', [contaAntiga]);
    }

    return atualizada;
  }

  async deleteMovimentacao(id: string): Promise<boolean> {
    if (!validateUUID(id)) {
      throw new Error('ID deve ser um UUID válido');
    }

    return await transaction(async (client) => {
      // Buscar movimentação
      const movimentacao = await this.getMovimentacaoById(id);
      if (!movimentacao) {
        return false;
      }

      // Reverter saldo da conta
      const conta = await this.contasService.getContaById(movimentacao.conta_id);
      if (!conta) {
        throw new Error('Conta não encontrada');
      }

      const novoSaldo = conta.saldo_atual - movimentacao.valor_entrada + movimentacao.valor_saida;

      // Deletar movimentação
      const sql = 'DELETE FROM movimentacoes_financeiras WHERE id = $1';
      const result = await client.query(sql, [id]);

      if (result.rowCount === 0) {
        return false;
      }

      // Atualizar saldo da conta usando o método do serviço e recalc saldo do dia
      await this.contasService.atualizarSaldoAtual(movimentacao.conta_id);
      await client.query('SELECT recalcular_saldo_dia_conta($1)', [movimentacao.conta_id]);

      return true;
    });
  }

  async getMovimentacoesByConta(contaId: string, limit?: number, offset?: number): Promise<MovimentacaoFinanceira[]> {
    if (!validateUUID(contaId)) {
      throw new Error('conta_id deve ser um UUID válido');
    }

    let sql = 'SELECT * FROM movimentacoes_financeiras WHERE conta_id = $1 ORDER BY data_movimentacao DESC';
    const params: any[] = [contaId];

    if (limit) {
      sql += ` LIMIT $2`;
      params.push(limit);
    }

    if (offset) {
      sql += ` OFFSET $${params.length + 1}`;
      params.push(offset);
    }

    const result = await query(sql, params);
    return result.rows;
  }

  async getResumoMovimentacoes(contaId?: string, dataInicio?: string, dataFim?: string): Promise<{
    total_entradas: number;
    total_saidas: number;
    saldo_atual: number;
    total_movimentacoes: number;
  }> {
    let sql = `
      SELECT 
        COALESCE(SUM(valor_entrada), 0) as total_entradas,
        COALESCE(SUM(valor_saida), 0) as total_saidas,
        COUNT(*) as total_movimentacoes
      FROM movimentacoes_financeiras 
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (contaId) {
      paramCount++;
      sql += ` AND conta_id = $${paramCount}`;
      params.push(contaId);
    }

    if (dataInicio) {
      paramCount++;
      sql += ` AND data_movimentacao >= $${paramCount}`;
      params.push(dataInicio);
    }

    if (dataFim) {
      paramCount++;
      sql += ` AND data_movimentacao <= $${paramCount}`;
      params.push(dataFim);
    }

    const result = await query(sql, params);
    const resumo = result.rows[0];

    // Se for para uma conta específica, buscar saldo atual
    let saldoAtual = 0;
    if (contaId) {
      const conta = await this.contasService.getContaById(contaId);
      if (conta) {
        saldoAtual = conta.saldo_atual;
      }
    }

    return {
      total_entradas: parseFloat(resumo.total_entradas),
      total_saidas: parseFloat(resumo.total_saidas),
      saldo_atual: saldoAtual,
      total_movimentacoes: parseInt(resumo.total_movimentacoes)
    };
  }
}
