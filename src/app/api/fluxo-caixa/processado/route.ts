import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';
import {
  buscarDadosUnificados,
  calcularSaldoInicial,
  processarDadosDiarios,
  buscarSaldosContas,
  formatarResposta,
  validarParametros,
  FluxoCaixaParams,
  FluxoCaixaResponse
} from '@/services/fluxo-caixa-service';

/**
 * Valida se contas pertencem à empresa
 */
async function validarContas(
  company_id: string,
  conta_ids?: string[]
): Promise<{ valid: boolean; error?: string }> {
  if (!conta_ids || conta_ids.length === 0) {
    return { valid: true };
  }

  try {
    const { query } = await import('@/lib/database');
    const sql = `
      SELECT COUNT(*) as total
      FROM contas_financeiras cf
      WHERE cf."companyId" = $1::uuid
        AND cf.id = ANY($2::uuid[])
    `;
    const result = await query(sql, [company_id, conta_ids]);
    const total = parseInt(result.rows[0]?.total || '0');

    if (total !== conta_ids.length) {
      return { valid: false, error: 'Uma ou mais contas não pertencem à empresa' };
    }

    return { valid: true };
  } catch (error: any) {
    console.error('Erro ao validar contas:', error);
    return { valid: false, error: 'Erro ao validar contas' };
  }
}

/**
 * GET /api/fluxo-caixa/processado
 * 
 * Retorna dados processados do fluxo de caixa com movimentações agrupadas por dia,
 * saldos calculados e totais do período.
 * 
 * @description
 * Este endpoint unifica dados de três fontes:
 * 1. Movimentações financeiras diretas (não geradas por contas a receber/pagar)
 * 2. Contas a receber (parcelas pendentes e opcionalmente pagas)
 * 3. Contas a pagar (parcelas pendentes e opcionalmente pagas)
 * 
 * Todas as queries garantem isolamento por company_id para evitar vazamento de dados entre empresas.
 * 
 * @param {string} company_id - UUID da empresa (obrigatório)
 * @param {string} [data_inicio] - Data início do período no formato YYYY-MM-DD (default: início do mês atual)
 * @param {string} [data_fim] - Data fim do período no formato YYYY-MM-DD (default: fim do mês atual)
 * @param {string} [tipo_data='pagamento'] - Tipo de data a usar: 'pagamento' (usa data de pagamento/compensação) ou 'vencimento' (usa data de vencimento)
 * @param {string} [status='todos'] - Filtro de status: 'todos', 'pago' ou 'pendente'
 * @param {boolean} [incluir_saldos=true] - Se true, inclui saldos iniciais das contas e saldos atuais
 * @param {string} [conta_ids] - Array de UUIDs separados por vírgula para filtrar contas específicas
 * @param {boolean} [incluir_historico_pagas=false] - Se true, inclui contas a receber/pagar pagas no histórico
 * 
 * @returns {FluxoCaixaResponse} Resposta com dados processados:
 * - success: boolean
 * - saldo_inicial: número
 * - saldo_final: número
 * - periodo: { inicio, fim }
 * - filtros_aplicados: objeto com filtros usados
 * - dados_diarios: array de dados agrupados por dia
 * - saldos_contas: array de saldos das contas (se incluir_saldos = true)
 * - totais: objeto com totais do período
 * 
 * @example
 * GET /api/fluxo-caixa/processado?company_id=xxx&data_inicio=2024-11-01&data_fim=2024-11-30&tipo_data=pagamento&status=todos
 * 
 * @throws {401} Se token de autenticação não for fornecido ou inválido
 * @throws {403} Se usuário não tiver acesso à empresa especificada
 * @throws {400} Se parâmetros forem inválidos
 * @throws {500} Se ocorrer erro interno
 */
export async function GET(request: NextRequest) {
  try {
    // Garantir que migrations estão aplicadas (inclui criação da coluna saldo_atual se necessário)
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de autenticação necessário',
          message: 'Token de autenticação necessário'
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    
    // LOG para debug - REMOVER DEPOIS
    console.log('🔍 === ROUTE /api/fluxo-caixa/processado ===');
    console.log('🔍 Token recebido (primeiros 50 chars):', token ? token.substring(0, 50) + '...' : 'NENHUM');
    console.log('🔍 Token completo (primeiros 100 chars):', token ? token.substring(0, 100) + '...' : 'NENHUM');
    console.log('🔍 Token length:', token ? token.length : 0);

    // Extrair parâmetros de query
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 Company ID:', company_id);

    // Validar acesso usando função utilitária compartilhada
    console.log('🔍 Chamando validateUserAccess...');
    const acesso = await validateUserAccess(token, company_id);
    console.log('🔍 Resultado validateUserAccess:', { valid: acesso.valid, error: acesso.error, userId: acesso.userId });
    if (!acesso.valid) {
      // Retornar 401 se for erro de token, 403 se for erro de acesso
      const statusCode = acesso.error?.includes('Token') || acesso.error?.includes('não fornecido') ? 401 : 403;
      return NextResponse.json(
        { 
          success: false, 
          error: acesso.error || 'Acesso negado',
          message: acesso.error || 'Acesso negado' // Manter compatibilidade
        },
        { status: statusCode }
      );
    }

    // Preparar parâmetros
    const params: FluxoCaixaParams = {
      company_id,
      data_inicio: searchParams.get('data_inicio') || undefined,
      data_fim: searchParams.get('data_fim') || undefined,
      tipo_data: (searchParams.get('tipo_data') as 'pagamento' | 'vencimento') || 'pagamento',
      status: (searchParams.get('status') as 'todos' | 'pago' | 'pendente') || 'todos',
      incluir_saldos: searchParams.get('incluir_saldos') !== 'false',
      incluir_historico_pagas: searchParams.get('incluir_historico_pagas') === 'true'
    };

    // Processar conta_ids
    const contaIdsParam = searchParams.get('conta_ids');
    if (contaIdsParam) {
      params.conta_ids = contaIdsParam.split(',').map(id => id.trim()).filter(id => id);
    }

    // Validar parâmetros
    const validacao = validarParametros(params);
    if (!validacao.valid) {
      return NextResponse.json(
        { success: false, error: validacao.error || 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    // Validar contas se especificadas
    if (params.conta_ids && params.conta_ids.length > 0) {
      const validacaoContas = await validarContas(company_id, params.conta_ids);
      if (!validacaoContas.valid) {
        return NextResponse.json(
          { success: false, error: validacaoContas.error || 'Contas inválidas' },
          { status: 400 }
        );
      }
    }

    // Calcular datas padrão se não fornecidas
    const hoje = new Date();
    const data_inicio = params.data_inicio 
      ? new Date(params.data_inicio)
      : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const data_fim = params.data_fim
      ? new Date(params.data_fim)
      : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    // Log para debug
    console.log('📅 Parâmetros do fluxo de caixa:', {
      company_id,
      data_inicio: data_inicio.toISOString().split('T')[0],
      data_fim: data_fim.toISOString().split('T')[0],
      tipo_data: params.tipo_data,
      status: params.status,
      conta_ids: params.conta_ids?.length || 0,
      incluir_saldos: params.incluir_saldos,
      incluir_historico_pagas: params.incluir_historico_pagas
    });

    // Buscar dados
    const [movimentacoes, saldo_inicial, saldos_contas] = await Promise.all([
      buscarDadosUnificados(params),
      calcularSaldoInicial(company_id, data_inicio, params.conta_ids, params.incluir_saldos),
      params.incluir_saldos ? buscarSaldosContas(company_id, params.conta_ids) : Promise.resolve(undefined)
    ]);

    // Processar dados diários
    const dados_diarios = processarDadosDiarios(
      movimentacoes,
      saldo_inicial,
      params.status,
      data_inicio,
      data_fim
    );

    // Formatar resposta
    const resposta = formatarResposta(
      dados_diarios,
      saldo_inicial,
      {
        inicio: data_inicio.toISOString().split('T')[0],
        fim: data_fim.toISOString().split('T')[0]
      },
      {
        tipo_data: params.tipo_data,
        status: params.status,
        incluir_saldos: params.incluir_saldos,
        contas_filtradas: params.conta_ids
      },
      saldos_contas
    );

    return NextResponse.json(resposta);
  } catch (error: any) {
    console.error('❌ Erro ao processar fluxo de caixa:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

