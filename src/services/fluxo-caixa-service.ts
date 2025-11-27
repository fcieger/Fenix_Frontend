import { query, transaction } from '@/lib/database';
import { validateUUID } from '@/utils/validations';

/**
 * Fluxo Caixa Service
 *
 * NOTE: This service uses direct database queries instead of API calls.
 * It's a complex service that aggregates data from multiple sources (movements, accounts payable/receivable).
 * This is intentional as it provides optimized queries for cash flow reporting.
 *
 * This service should remain as-is and does not need SDK migration.
 */

/**
 * Interface para parâmetros do fluxo de caixa
 */
export interface FluxoCaixaParams {
  company_id: string;
  data_inicio?: string;
  data_fim?: string;
  tipo_data?: 'pagamento' | 'vencimento';
  status?: 'todos' | 'pago' | 'pendente';
  incluir_saldos?: boolean;
  conta_ids?: string[];
  incluir_historico_pagas?: boolean;
}

/**
 * Interface para uma movimentação no fluxo de caixa
 */
export interface MovimentacaoFluxoCaixa {
  origem_tipo: 'movimentacao' | 'conta_receber' | 'conta_pagar';
  origem_id: string;
  data: string;
  data_timestamp: Date;
  company_id: string;
  conta_id: string | null;
  valor_entrada: number;
  valor_saida: number;
  descricao: string;
  status: string;
  parcela_id: string | null;
  tipo_movimentacao?: string;
  conta_destino_id?: string | null;
}

/**
 * Interface para dados diários do fluxo de caixa
 */
export interface DadosDia {
  data: string;
  data_formatada: string;
  recebimentos: number;
  pagamentos: number;
  transferencias_entrada: number;
  transferencias_saida: number;
  saldo_dia: number;
  total_movimentacoes: number;
  movimentacoes: MovimentacaoFluxoCaixa[];
}

/**
 * Interface para saldo de conta
 */
export interface SaldoConta {
  conta_id: string;
  descricao: string;
  saldo_atual: number;
  saldo_inicial: number;
  tipo_conta: string;
}

/**
 * Interface para resposta do fluxo de caixa
 */
export interface FluxoCaixaResponse {
  success: boolean;
  saldo_inicial: number;
  saldo_final: number;
  periodo: {
    inicio: string;
    fim: string;
  };
  filtros_aplicados: {
    tipo_data: string;
    status: string;
    incluir_saldos: boolean;
    contas_filtradas?: string[];
  };
  dados_diarios: DadosDia[];
  saldos_contas?: SaldoConta[];
  totais: {
    total_recebimentos: number;
    total_pagamentos: number;
    total_transferencias_entrada: number;
    total_transferencias_saida: number;
    variacao_periodo: number;
  };
}

/**
 * Determina qual data usar baseado no tipo_data
 */
export function determinarDataMovimentacao(
  tipo_data: 'pagamento' | 'vencimento',
  data_vencimento: Date | string | null,
  data_pagamento: Date | string | null,
  data_compensacao: Date | string | null,
  status: string
): { data: Date; data_timestamp: Date } {
  if (tipo_data === 'vencimento') {
    const dataVen = data_vencimento ? new Date(data_vencimento) : new Date();
    return { data: dataVen, data_timestamp: dataVen };
  }

  // tipo_data === 'pagamento'
  if (status?.toLowerCase() === 'pago') {
    if (data_compensacao) {
      const dataComp = new Date(data_compensacao);
      return { data: dataComp, data_timestamp: dataComp };
    }
    if (data_pagamento) {
      const dataPag = new Date(data_pagamento);
      return { data: dataPag, data_timestamp: dataPag };
    }
  }

  // Se não pago ou não tem data de pagamento, usar vencimento
  const dataVen = data_vencimento ? new Date(data_vencimento) : new Date();
  return { data: dataVen, data_timestamp: dataVen };
}

/**
 * Busca movimentações financeiras diretas (não geradas por contas a receber/pagar)
 */
export async function buscarMovimentacoesFinanceiras(
  company_id: string,
  data_inicio: Date,
  data_fim: Date,
  status: 'todos' | 'pago' | 'pendente',
  conta_ids?: string[]
): Promise<MovimentacaoFluxoCaixa[]> {
  if (!validateUUID(company_id)) {
    throw new Error('company_id deve ser um UUID válido');
  }

  let sql = `
    SELECT
      'movimentacao'::text as origem_tipo,
      m.id::text as origem_id,
      DATE(m.data_movimentacao) as data,
      m.data_movimentacao as data_timestamp,
      cf."companyId"::text as company_id,
      cf.id::text as conta_id,
      CASE
        WHEN m.tipo_movimentacao = 'entrada' THEN m.valor_entrada
        WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_entrada > 0 THEN m.valor_entrada
        ELSE 0
      END as valor_entrada,
      CASE
        WHEN m.tipo_movimentacao = 'saida' THEN m.valor_saida
        WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_saida > 0 THEN m.valor_saida
        ELSE 0
      END as valor_saida,
      m.tipo_movimentacao as tipo_movimentacao,
      m.conta_destino_id::text as conta_destino_id,
      COALESCE(m.descricao, 'Movimentação financeira') as descricao,
      COALESCE(m.situacao, 'pago') as status,
      NULL::text as parcela_id
    FROM movimentacoes_financeiras m
    INNER JOIN contas_financeiras cf ON m.conta_id = cf.id
    WHERE cf."companyId" = $1::uuid
      AND (m.tela_origem IS NULL OR m.tela_origem NOT IN ('contas_receber_parcelas', 'contas_pagar_parcelas'))
      AND COALESCE(m.situacao, 'pago') IN ('pago', 'pendente')
      AND DATE(m.data_movimentacao) >= $2::date
      AND DATE(m.data_movimentacao) <= $3::date
  `;

  const params: any[] = [company_id, data_inicio, data_fim];
  let paramCount = 3;

  // Filtro por conta(s)
  if (conta_ids && conta_ids.length > 0) {
    paramCount++;
    sql += ` AND cf.id = ANY($${paramCount}::uuid[])`;
    params.push(conta_ids);
  }

  // Filtro por status
  if (status !== 'todos') {
    paramCount++;
    sql += ` AND COALESCE(m.situacao, 'pago') = $${paramCount}`;
    params.push(status);
  }

  sql += ` ORDER BY m.data_movimentacao ASC`;

  // Log para debug
  console.log('🔍 Query movimentações financeiras:', {
    sql: sql.substring(0, 200) + '...',
    params: params.map((p, i) => i === 0 ? p : typeof p === 'object' ? JSON.stringify(p).substring(0, 50) : p)
  });

  const result = await query(sql, params);

  console.log('📊 Movimentações encontradas:', result.rows.length);

  return result.rows.map(row => {
    // Normalizar data para formato YYYY-MM-DD
    const data = typeof row.data === 'string'
      ? row.data
      : row.data instanceof Date
        ? row.data.toISOString().split('T')[0]
        : new Date(row.data_timestamp).toISOString().split('T')[0];

    return {
      origem_tipo: row.origem_tipo,
      origem_id: row.origem_id,
      data,
      data_timestamp: new Date(row.data_timestamp),
      company_id: row.company_id,
      conta_id: row.conta_id,
      valor_entrada: parseFloat(row.valor_entrada || 0),
      valor_saida: parseFloat(row.valor_saida || 0),
      descricao: row.descricao,
      status: row.status,
      parcela_id: row.parcela_id,
      tipo_movimentacao: row.tipo_movimentacao,
      conta_destino_id: row.conta_destino_id || null
    };
  });
}

/**
 * Busca contas a receber pendentes ou todas (se incluir histórico)
 */
export async function buscarContasReceber(
  company_id: string,
  data_inicio: Date,
  data_fim: Date,
  tipo_data: 'pagamento' | 'vencimento',
  status: 'todos' | 'pago' | 'pendente',
  conta_ids?: string[],
  incluir_historico_pagas: boolean = false
): Promise<MovimentacaoFluxoCaixa[]> {
  if (!validateUUID(company_id)) {
    throw new Error('company_id deve ser um UUID válido');
  }

  // Construir condição de data baseado em tipo_data
  let condicaoData = '';
  let condicaoTimestamp = '';

  if (tipo_data === 'pagamento') {
    // Para pagamento: se pago, usar data de pagamento/compensação; se pendente, usar data de vencimento
    condicaoData = `
      CASE
        WHEN p.status = 'pago' AND p.data_compensacao IS NOT NULL THEN DATE(p.data_compensacao)
        WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN DATE(p.data_pagamento)
        WHEN p.status = 'pago' THEN DATE(p.data_vencimento)
        ELSE DATE(p.data_vencimento)
      END
    `;
    condicaoTimestamp = `
      CASE
        WHEN p.status = 'pago' AND p.data_compensacao IS NOT NULL THEN p.data_compensacao::timestamp
        WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN p.data_pagamento::timestamp
        WHEN p.status = 'pago' THEN p.data_vencimento::timestamp
        ELSE p.data_vencimento::timestamp
      END
    `;
  } else {
    // Para vencimento: sempre usar data de vencimento
    condicaoData = 'DATE(p.data_vencimento)';
    condicaoTimestamp = 'p.data_vencimento::timestamp';
  }

  let sql = `
    SELECT
      'conta_receber'::text as origem_tipo,
      p.conta_receber_id::text as origem_id,
      ${condicaoData} as data,
      ${condicaoTimestamp} as data_timestamp,
      cr.company_id::text as company_id,
      COALESCE(p.conta_corrente_id::text, NULL) as conta_id,
      p.valor_parcela as valor_entrada,
      0::decimal(15,2) as valor_saida,
      COALESCE('Recebimento: ' || cr.titulo || ' - ' || p.titulo_parcela, '') as descricao,
      p.status,
      p.id::text as parcela_id
    FROM parcelas_contas_receber p
    INNER JOIN contas_receber cr ON p.conta_receber_id = cr.id
    WHERE cr.company_id = $1::uuid
      AND p.status IN ('pago', 'pendente')
  `;

  const params: any[] = [company_id];
  let paramCount = 1;

  // Filtro por período de data - APLICAR PRIMEIRO para garantir que pegamos dados do período
  paramCount++;
  sql += ` AND (${condicaoData}) >= $${paramCount}::date`;
  params.push(data_inicio);

  paramCount++;
  sql += ` AND (${condicaoData}) <= $${paramCount}::date`;
  params.push(data_fim);

  // Filtro por status
  if (status !== 'todos') {
    // Se status específico (pago ou pendente), aplicar filtro direto
    paramCount++;
    sql += ` AND p.status = $${paramCount}`;
    params.push(status);
  }
  // Se status = 'todos', trazer todas (pendentes e pagas) que estão no período
  // O incluir_historico_pagas não afeta quando status = 'todos', pois já filtramos por data

  // Filtro por conta(s)
  if (conta_ids && conta_ids.length > 0) {
    paramCount++;
    sql += ` AND (p.conta_corrente_id = ANY($${paramCount}::uuid[]) OR p.conta_corrente_id IS NULL)`;
    params.push(conta_ids);
  }

  sql += ` ORDER BY data_timestamp ASC`;

  // Log para debug
  console.log('🔍 Query contas a receber:', {
    sql: sql.substring(0, 300) + '...',
    params: params.map((p, i) => i === 0 ? p : typeof p === 'object' ? JSON.stringify(p).substring(0, 50) : p),
    data_inicio: data_inicio.toISOString().split('T')[0],
    data_fim: data_fim.toISOString().split('T')[0],
    tipo_data,
    status,
    incluir_historico_pagas
  });

  const result = await query(sql, params);

  console.log('📊 Contas a receber encontradas:', result.rows.length);

  // Log de exemplo das primeiras 3 parcelas encontradas
  if (result.rows.length > 0) {
    console.log('📝 Exemplo de parcelas encontradas:', result.rows.slice(0, 3).map(r => ({
      data: r.data,
      status: r.status,
      valor: r.valor_entrada,
      descricao: r.descricao?.substring(0, 50)
    })));
  } else {
    console.log('⚠️ Nenhuma parcela encontrada - verifique se há parcelas no período com os filtros aplicados');
  }

  return result.rows.map(row => {
    // Normalizar data para formato YYYY-MM-DD
    const data = typeof row.data === 'string'
      ? row.data
      : row.data instanceof Date
        ? row.data.toISOString().split('T')[0]
        : new Date(row.data_timestamp).toISOString().split('T')[0];

    return {
      ...row,
      data,
      data_timestamp: new Date(row.data_timestamp),
      valor_entrada: parseFloat(row.valor_entrada || 0),
      valor_saida: 0
    };
  });
}

/**
 * Busca contas a pagar pendentes ou todas (se incluir histórico)
 */
export async function buscarContasPagar(
  company_id: string,
  data_inicio: Date,
  data_fim: Date,
  tipo_data: 'pagamento' | 'vencimento',
  status: 'todos' | 'pago' | 'pendente',
  conta_ids?: string[],
  incluir_historico_pagas: boolean = false
): Promise<MovimentacaoFluxoCaixa[]> {
  if (!validateUUID(company_id)) {
    throw new Error('company_id deve ser um UUID válido');
  }

  // Construir condição de data baseado em tipo_data
  let condicaoData = '';
  let condicaoTimestamp = '';

  if (tipo_data === 'pagamento') {
    // Para pagamento:
    // - Se PAGO: usar data de pagamento/compensação (se tiver), senão usar data de vencimento
    // - Se PENDENTE: sempre usar data de vencimento (pois não tem data de pagamento ainda)
    condicaoData = `
      CASE
        WHEN p.status = 'pago' AND p.data_compensacao IS NOT NULL THEN DATE(p.data_compensacao)
        WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN DATE(p.data_pagamento)
        WHEN p.status = 'pago' THEN DATE(p.data_vencimento) -- Fallback para pago sem data de pagamento
        ELSE DATE(p.data_vencimento) -- Para pendente, sempre usar vencimento
      END
    `;
    condicaoTimestamp = `
      CASE
        WHEN p.status = 'pago' AND p.data_compensacao IS NOT NULL THEN p.data_compensacao::timestamp
        WHEN p.status = 'pago' AND p.data_pagamento IS NOT NULL THEN p.data_pagamento::timestamp
        WHEN p.status = 'pago' THEN p.data_vencimento::timestamp
        ELSE p.data_vencimento::timestamp -- Para pendente, sempre usar vencimento
      END
    `;
  } else {
    // Para vencimento: sempre usar data de vencimento
    condicaoData = 'DATE(p.data_vencimento)';
    condicaoTimestamp = 'p.data_vencimento::timestamp';
  }

  let sql = `
    SELECT
      'conta_pagar'::text as origem_tipo,
      p.conta_pagar_id::text as origem_id,
      ${condicaoData} as data,
      ${condicaoTimestamp} as data_timestamp,
      cp.company_id::text as company_id,
      COALESCE(p.conta_corrente_id::text, NULL) as conta_id,
      0::decimal(15,2) as valor_entrada,
      p.valor_parcela as valor_saida,
      COALESCE('Pagamento: ' || cp.titulo || ' - ' || p.titulo_parcela, '') as descricao,
      p.status,
      p.id::text as parcela_id
    FROM parcelas_contas_pagar p
    INNER JOIN contas_pagar cp ON p.conta_pagar_id = cp.id
    WHERE cp.company_id = $1::uuid
      AND p.status IN ('pago', 'pendente')
  `;

  const params: any[] = [company_id];
  let paramCount = 1;

  // Filtro por período de data - APLICAR PRIMEIRO para garantir que pegamos dados do período
  paramCount++;
  sql += ` AND (${condicaoData}) >= $${paramCount}::date`;
  params.push(data_inicio);

  paramCount++;
  sql += ` AND (${condicaoData}) <= $${paramCount}::date`;
  params.push(data_fim);

  // Filtro por status
  if (status !== 'todos') {
    // Se status específico (pago ou pendente), aplicar filtro direto
    paramCount++;
    sql += ` AND p.status = $${paramCount}`;
    params.push(status);
  }
  // Se status = 'todos', trazer todas (pendentes e pagas) que estão no período
  // O incluir_historico_pagas não afeta quando status = 'todos', pois já filtramos por data

  // Filtro por conta(s)
  if (conta_ids && conta_ids.length > 0) {
    paramCount++;
    sql += ` AND (p.conta_corrente_id = ANY($${paramCount}::uuid[]) OR p.conta_corrente_id IS NULL)`;
    params.push(conta_ids);
  }

  sql += ` ORDER BY data_timestamp ASC`;

  // Log para debug
  console.log('🔍 Query contas a pagar:', {
    sql: sql.substring(0, 300) + '...',
    params: params.map((p, i) => i === 0 ? p : typeof p === 'object' ? JSON.stringify(p).substring(0, 50) : p),
    data_inicio: data_inicio.toISOString().split('T')[0],
    data_fim: data_fim.toISOString().split('T')[0],
    tipo_data,
    status,
    incluir_historico_pagas
  });

  const result = await query(sql, params);

  console.log('📊 Contas a pagar encontradas:', result.rows.length);

  // Log de exemplo das primeiras 3 parcelas encontradas
  if (result.rows.length > 0) {
    console.log('📝 Exemplo de parcelas encontradas:', result.rows.slice(0, 3).map(r => ({
      data: r.data,
      status: r.status,
      valor: r.valor_saida,
      descricao: r.descricao?.substring(0, 50)
    })));
  } else {
    console.log('⚠️ Nenhuma parcela encontrada - verifique se há parcelas no período com os filtros aplicados');
  }

  return result.rows.map(row => {
    // Normalizar data para formato YYYY-MM-DD
    const data = typeof row.data === 'string'
      ? row.data
      : row.data instanceof Date
        ? row.data.toISOString().split('T')[0]
        : new Date(row.data_timestamp).toISOString().split('T')[0];

    return {
      ...row,
      data,
      data_timestamp: new Date(row.data_timestamp),
      valor_entrada: 0,
      valor_saida: parseFloat(row.valor_saida || 0)
    };
  });
}

/**
 * Busca dados unificados de todas as fontes
 */
export async function buscarDadosUnificados(
  params: FluxoCaixaParams
): Promise<MovimentacaoFluxoCaixa[]> {
  const {
    company_id,
    data_inicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    data_fim = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    tipo_data = 'pagamento',
    status = 'todos',
    conta_ids,
    incluir_historico_pagas = false
  } = params;

  const dataInicio = new Date(data_inicio);
  const dataFim = new Date(data_fim);

  // Buscar de todas as fontes em paralelo
  const [movimentacoes, contasReceber, contasPagar] = await Promise.all([
    buscarMovimentacoesFinanceiras(company_id, dataInicio, dataFim, status, conta_ids),
    buscarContasReceber(company_id, dataInicio, dataFim, tipo_data, status, conta_ids, incluir_historico_pagas),
    buscarContasPagar(company_id, dataInicio, dataFim, tipo_data, status, conta_ids, incluir_historico_pagas)
  ]);

  // Log para debug
  console.log('📊 Fluxo de Caixa - Dados encontrados:', {
    movimentacoes: movimentacoes.length,
    contasReceber: contasReceber.length,
    contasPagar: contasPagar.length,
    periodo: {
      inicio: dataInicio.toISOString().split('T')[0],
      fim: dataFim.toISOString().split('T')[0]
    },
    filtros: {
      tipo_data,
      status,
      conta_ids: conta_ids?.length || 0,
      incluir_historico_pagas
    }
  });

  // Unificar e ordenar
  const todasMovimentacoes = [
    ...movimentacoes,
    ...contasReceber,
    ...contasPagar
  ].sort((a, b) => a.data_timestamp.getTime() - b.data_timestamp.getTime());

  return todasMovimentacoes;
}

/**
 * Calcula o saldo inicial do período
 */
export async function calcularSaldoInicial(
  company_id: string,
  data_inicio: Date,
  conta_ids?: string[],
  incluir_saldos: boolean = true
): Promise<number> {
  if (!validateUUID(company_id)) {
    throw new Error('company_id deve ser um UUID válido');
  }

  // Sempre começar do zero e somar todas as movimentações pagas antes do período
  // Isso mantém a mesma lógica do calcularSaldoAtual (começar do zero)
  let saldoInicial = 0;

  // Buscar TODAS as movimentações pagas ANTES do período
  let sqlMov = `
    SELECT
      COALESCE(SUM(
        CASE
          WHEN m.tipo_movimentacao = 'entrada' THEN m.valor_entrada
          WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_entrada > 0 THEN m.valor_entrada
          ELSE 0
        END
      ), 0) as total_entradas,
      COALESCE(SUM(
        CASE
          WHEN m.tipo_movimentacao = 'saida' THEN m.valor_saida
          WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_saida > 0 THEN m.valor_saida
          ELSE 0
        END
      ), 0) as total_saidas
    FROM movimentacoes_financeiras m
    INNER JOIN contas_financeiras cf ON m.conta_id = cf.id
    WHERE cf."companyId" = $1::uuid
      AND (m.tela_origem IS NULL OR m.tela_origem NOT IN ('contas_receber_parcelas', 'contas_pagar_parcelas'))
      AND COALESCE(m.situacao, 'pago') = 'pago'
      AND DATE(m.data_movimentacao) < $2::date
  `;

  const paramsMov: any[] = [company_id, data_inicio];
  let paramCount = 2;

  if (conta_ids && conta_ids.length > 0) {
    paramCount++;
    sqlMov += ` AND cf.id = ANY($${paramCount}::uuid[])`;
    paramsMov.push(conta_ids);
  }

  const resultMov = await query(sqlMov, paramsMov);
  const totalEntradas = parseFloat(resultMov.rows[0]?.total_entradas || 0);
  const totalSaidas = parseFloat(resultMov.rows[0]?.total_saidas || 0);

  // Saldo inicial = começar do zero + todas as movimentações pagas antes do período
  // Mesma lógica do calcularSaldoAtual (não usar saldo_inicial das contas)
  saldoInicial = totalEntradas - totalSaidas;

  return saldoInicial;
}

/**
 * Busca saldos das contas
 */
export async function buscarSaldosContas(
  company_id: string,
  conta_ids?: string[]
): Promise<SaldoConta[]> {
  if (!validateUUID(company_id)) {
    throw new Error('company_id deve ser um UUID válido');
  }

  // Calcular saldo_atual dinamicamente usando a mesma lógica do calcularSaldoAtual
  let sql = `
    SELECT
      cf.id::text as conta_id,
      COALESCE(cf.descricao, cf.banco_nome, 'Conta') as descricao,
      COALESCE(
        (
          SELECT
            COALESCE(SUM(
              CASE
                WHEN m.tipo_movimentacao = 'entrada' THEN m.valor_entrada
                WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_entrada > 0 THEN m.valor_entrada
                WHEN m.tipo_movimentacao = 'saida' THEN -m.valor_saida
                WHEN m.tipo_movimentacao = 'transferencia' AND m.valor_saida > 0 THEN -m.valor_saida
                ELSE 0
              END
            ), 0)
          FROM movimentacoes_financeiras m
          WHERE m.conta_id = cf.id
            AND COALESCE(m.situacao, 'pago') = 'pago'
        ),
        0
      ) as saldo_atual,
      COALESCE(cf.saldo_inicial, 0) as saldo_inicial,
      cf.tipo_conta
    FROM contas_financeiras cf
    WHERE cf."companyId" = $1::uuid
      AND cf.status = 'ativo'
  `;

  const params: any[] = [company_id];

  if (conta_ids && conta_ids.length > 0) {
    params.push(conta_ids);
    sql += ` AND cf.id = ANY($2::uuid[])`;
  }

  sql += ` ORDER BY cf.tipo_conta, cf.descricao`;

  const result = await query(sql, params);
  return result.rows.map(row => ({
    conta_id: row.conta_id,
    descricao: row.descricao,
    saldo_atual: parseFloat(row.saldo_atual || 0),
    saldo_inicial: parseFloat(row.saldo_inicial || 0),
    tipo_conta: row.tipo_conta
  }));
}

/**
 * Agrupa movimentações por dia
 */
export function agruparPorDia(
  movimentacoes: MovimentacaoFluxoCaixa[]
): Map<string, MovimentacaoFluxoCaixa[]> {
  const agrupado = new Map<string, MovimentacaoFluxoCaixa[]>();

  for (const mov of movimentacoes) {
    const dataKey = mov.data;
    if (!agrupado.has(dataKey)) {
      agrupado.set(dataKey, []);
    }
    agrupado.get(dataKey)!.push(mov);
  }

  return agrupado;
}

/**
 * Processa dados diários e calcula saldos
 */
export function processarDadosDiarios(
  movimentacoes: MovimentacaoFluxoCaixa[],
  saldo_inicial: number,
  status: 'todos' | 'pago' | 'pendente',
  data_inicio: Date,
  data_fim: Date
): DadosDia[] {
  // Log para debug
  console.log('📊 Processando dados diários:', {
    total_movimentacoes: movimentacoes.length,
    saldo_inicial,
    status,
    data_inicio: data_inicio.toISOString().split('T')[0],
    data_fim: data_fim.toISOString().split('T')[0]
  });

  // Criar array de todos os dias do período
  const dias: Date[] = [];
  const dataInicio = new Date(data_inicio);
  const dataFim = new Date(data_fim);

  for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
    dias.push(new Date(d));
  }

  console.log(`📅 Dias no período: ${dias.length} dias`);

  // Agrupar movimentações por dia
  const agrupado = agruparPorDia(movimentacoes);

  console.log(`📊 Dias com movimentações: ${agrupado.size} dias`);

  // Log das primeiras 5 movimentações para debug
  if (movimentacoes.length > 0) {
    console.log('📝 Primeiras 5 movimentações:', movimentacoes.slice(0, 5).map(m => ({
      origem: m.origem_tipo,
      data: m.data,
      valor_entrada: m.valor_entrada,
      valor_saida: m.valor_saida,
      status: m.status,
      descricao: m.descricao?.substring(0, 50)
    })));
  }

  // Processar cada dia
  const dadosDia: DadosDia[] = [];
  let saldoAtual = saldo_inicial;

  for (const dia of dias) {
    const dataKey = dia.toISOString().split('T')[0];
    const movimentacoesDoDia = agrupado.get(dataKey) || [];

    let recebimentos = 0;
    let pagamentos = 0;
    let transferenciasEntrada = 0;
    let transferenciasSaida = 0;

    for (const mov of movimentacoesDoDia) {
      // Considerar apenas movimentações que afetam saldo baseado em status
      const deveConsiderar = status === 'todos' || mov.status === status;

        if (deveConsiderar) {
            if (mov.origem_tipo === 'conta_receber') {
              // Contas a receber são recebimentos
              recebimentos += mov.valor_entrada;
            } else if (mov.origem_tipo === 'conta_pagar') {
              // Contas a pagar são pagamentos
              pagamentos += mov.valor_saida;
            } else if (mov.origem_tipo === 'movimentacao') {
              // Movimentações financeiras diretas
              if (mov.tipo_movimentacao === 'transferencia') {
                // Transferências: entrada na conta destino, saída na conta origem
                if (mov.valor_entrada > 0) {
                  transferenciasEntrada += mov.valor_entrada;
                }
                if (mov.valor_saida > 0) {
                  transferenciasSaida += mov.valor_saida;
                }
              } else if (mov.tipo_movimentacao === 'entrada') {
                // Entradas são recebimentos
                recebimentos += mov.valor_entrada;
              } else if (mov.tipo_movimentacao === 'saida') {
                // Saídas são pagamentos
                pagamentos += mov.valor_saida;
              } else {
                // Fallback: tratar baseado em valores
                if (mov.valor_entrada > 0 && mov.valor_saida === 0) {
                  recebimentos += mov.valor_entrada;
                } else if (mov.valor_saida > 0 && mov.valor_entrada === 0) {
                  pagamentos += mov.valor_saida;
                }
              }
            }
        }
    }

    // Calcular variação do dia (considerando apenas pagas para saldo se status = 'pago')
    let variacaoDia = 0;
    if (status === 'pago') {
      // Para saldo, considerar apenas pagas
      const movimentacoesPagas = movimentacoesDoDia.filter(m => m.status === 'pago');
      for (const mov of movimentacoesPagas) {
        variacaoDia += mov.valor_entrada - mov.valor_saida;
      }
    } else {
      // Para saldo, considerar todas se status = 'todos' ou apenas pendentes
      const movimentacoesConsideradas = status === 'todos'
        ? movimentacoesDoDia
        : movimentacoesDoDia.filter(m => m.status === status);
      for (const mov of movimentacoesConsideradas) {
        variacaoDia += mov.valor_entrada - mov.valor_saida;
      }
    }

    saldoAtual += variacaoDia;

    dadosDia.push({
      data: dataKey,
      data_formatada: dia.toLocaleDateString('pt-BR'),
      recebimentos,
      pagamentos,
      transferencias_entrada: transferenciasEntrada,
      transferencias_saida: transferenciasSaida,
      saldo_dia: saldoAtual,
      total_movimentacoes: movimentacoesDoDia.length,
      movimentacoes: movimentacoesDoDia
    });
  }

  console.log(`✅ Dados diários processados: ${dadosDia.length} dias, saldo final: R$ ${saldoAtual.toFixed(2)}`);
  const diasComMovimentacao = dadosDia.filter(d => d.recebimentos > 0 || d.pagamentos > 0 || d.transferencias_entrada > 0 || d.transferencias_saida > 0);
  console.log(`📊 Resumo: ${diasComMovimentacao.length} dias com movimentações de ${dadosDia.length} dias totais`);

  return dadosDia;
}

/**
 * Formata resposta final do fluxo de caixa
 */
export function formatarResposta(
  dados_diarios: DadosDia[],
  saldo_inicial: number,
  periodo: { inicio: string; fim: string },
  filtros_aplicados: any,
  saldos_contas?: SaldoConta[]
): FluxoCaixaResponse {
  const saldo_final = dados_diarios.length > 0
    ? dados_diarios[dados_diarios.length - 1].saldo_dia
    : saldo_inicial;

  const totais = {
    total_recebimentos: dados_diarios.reduce((sum, dia) => sum + dia.recebimentos, 0),
    total_pagamentos: dados_diarios.reduce((sum, dia) => sum + dia.pagamentos, 0),
    total_transferencias_entrada: dados_diarios.reduce((sum, dia) => sum + dia.transferencias_entrada, 0),
    total_transferencias_saida: dados_diarios.reduce((sum, dia) => sum + dia.transferencias_saida, 0),
    variacao_periodo: saldo_final - saldo_inicial
  };

  const resposta: FluxoCaixaResponse = {
    success: true,
    saldo_inicial,
    saldo_final,
    periodo,
    filtros_aplicados,
    dados_diarios,
    totais
  };

  if (saldos_contas) {
    resposta.saldos_contas = saldos_contas;
  }

  return resposta;
}

/**
 * Valida parâmetros de entrada
 */
export function validarParametros(params: any): { valid: boolean; error?: string } {
  if (!params.company_id) {
    return { valid: false, error: 'company_id é obrigatório' };
  }

  if (!validateUUID(params.company_id)) {
    return { valid: false, error: 'company_id deve ser um UUID válido' };
  }

  if (params.data_inicio) {
    const dataInicio = new Date(params.data_inicio);
    if (isNaN(dataInicio.getTime())) {
      return { valid: false, error: 'data_inicio deve ser uma data válida (formato: YYYY-MM-DD)' };
    }
  }

  if (params.data_fim) {
    const dataFim = new Date(params.data_fim);
    if (isNaN(dataFim.getTime())) {
      return { valid: false, error: 'data_fim deve ser uma data válida (formato: YYYY-MM-DD)' };
    }
  }

  if (params.data_inicio && params.data_fim) {
    const dataInicio = new Date(params.data_inicio);
    const dataFim = new Date(params.data_fim);
    if (dataInicio > dataFim) {
      return { valid: false, error: 'data_inicio deve ser menor ou igual a data_fim' };
    }
  }

  if (params.tipo_data && !['pagamento', 'vencimento'].includes(params.tipo_data)) {
    return { valid: false, error: 'tipo_data deve ser "pagamento" ou "vencimento"' };
  }

  if (params.status && !['todos', 'pago', 'pendente'].includes(params.status)) {
    return { valid: false, error: 'status deve ser "todos", "pago" ou "pendente"' };
  }

  if (params.conta_ids && !Array.isArray(params.conta_ids)) {
    // Se conta_ids for string, converter para array
    if (typeof params.conta_ids === 'string') {
      params.conta_ids = params.conta_ids.split(',').filter((id: string) => id.trim());
    } else {
      return { valid: false, error: 'conta_ids deve ser um array de UUIDs' };
    }
  }

  if (params.conta_ids) {
    for (const conta_id of params.conta_ids) {
      if (!validateUUID(conta_id)) {
        return { valid: false, error: `conta_id inválido: ${conta_id}` };
      }
    }
  }

  return { valid: true };
}

