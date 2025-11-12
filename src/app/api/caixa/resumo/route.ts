import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';

/**
 * GET /api/caixa/resumo
 * 
 * Retorna resumo do caixa aberto
 */
export async function GET(request: NextRequest) {
  try {
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de autenticação necessário'
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');
    let caixa_id = searchParams.get('caixa_id');
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    // Validar acesso
    const acesso = await validateUserAccess(token, company_id);
    if (!acesso.valid) {
      const statusCode = acesso.error?.includes('Token') || acesso.error?.includes('não fornecido') ? 401 : 403;
      return NextResponse.json(
        { 
          success: false, 
          error: acesso.error || 'Acesso negado'
        },
        { status: statusCode }
      );
    }

    // Se caixa_id não foi fornecido, buscar caixa aberto
    if (!caixa_id) {
      const caixaAbertoQuery = await query(`
        SELECT id
        FROM caixas
        WHERE "companyId" = $1::uuid
          AND status = 'aberto'
        ORDER BY "dataAbertura" DESC
        LIMIT 1
      `, [company_id]);

      if (caixaAbertoQuery.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Nenhum caixa aberto encontrado' },
          { status: 404 }
        );
      }

      caixa_id = caixaAbertoQuery.rows[0].id;
    }

    // Buscar dados do caixa
    const caixaQuery = await query(`
      SELECT 
        id,
        descricao,
        "valorAbertura",
        "dataAbertura",
        status,
        observacoes
      FROM caixas
      WHERE id = $1::uuid
        AND "companyId" = $2::uuid
    `, [caixa_id, company_id]);

    if (caixaQuery.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Caixa não encontrado' },
        { status: 404 }
      );
    }

    const caixa = caixaQuery.rows[0];

    // Calcular totais de vendas
    console.log('🔍 Buscando vendas do caixa:', caixa_id);
    console.log('  Tipo do caixa_id:', typeof caixa_id);
    console.log('  Valor do caixa_id:', caixa_id);
    
    const vendasQuery = await query(`
      SELECT 
        COUNT(*) as total_vendas,
        COALESCE(SUM("valorTotal"), 0) as valor_total_vendas
      FROM vendas_caixa
      WHERE "caixaId" = $1::uuid
        AND status = 'concluida'
    `, [caixa_id]);
    
    console.log('📊 Resultado query vendas:', vendasQuery.rows[0]);
    console.log('  Tipo de total_vendas:', typeof vendasQuery.rows[0]?.total_vendas);
    console.log('  Tipo de valor_total_vendas:', typeof vendasQuery.rows[0]?.valor_total_vendas);

    // Calcular totais por forma de pagamento
    const formasPagamentoQuery = await query(`
      SELECT 
        COALESCE(v."meioPagamento", 'NÃO_INFORMADO') as forma_pagamento,
        COUNT(*) as total_vendas,
        COALESCE(SUM(v."valorTotal"), 0) as valor_total
      FROM vendas_caixa v
      WHERE v."caixaId" = $1::uuid
        AND v.status = 'concluida'
      GROUP BY v."meioPagamento"
      ORDER BY valor_total DESC
    `, [caixa_id]);

    // Calcular vendas canceladas
    const vendasCanceladasQuery = await query(`
      SELECT 
        COUNT(*) as total_canceladas,
        COALESCE(SUM("valorTotal"), 0) as valor_total_canceladas
      FROM vendas_caixa
      WHERE "caixaId" = $1::uuid
        AND status = 'cancelada'
    `, [caixa_id]);

    // Calcular sangrias e suprimentos (totais)
    const movimentacoesQuery = await query(`
      SELECT 
        tipo,
        COALESCE(SUM(CASE WHEN tipo = 'sangria' THEN valor ELSE 0 END), 0) as total_sangrias,
        COALESCE(SUM(CASE WHEN tipo = 'suprimento' THEN valor ELSE 0 END), 0) as total_suprimentos
      FROM movimentacoes_caixa
      WHERE "caixaId" = $1::uuid
      GROUP BY tipo
    `, [caixa_id]);

    // Buscar lista detalhada de movimentações
    const listaMovimentacoesQuery = await query(`
      SELECT 
        id,
        tipo,
        valor,
        descricao,
        "dataMovimentacao"
      FROM movimentacoes_caixa
      WHERE "caixaId" = $1::uuid
      ORDER BY "dataMovimentacao" DESC
    `, [caixa_id]);

    const totalSangrias = (movimentacoesQuery.rows || []).reduce((sum, row) => sum + (row.tipo === 'sangria' ? parseFloat(row.total_sangrias || 0) : 0), 0);
    const totalSuprimentos = (movimentacoesQuery.rows || []).reduce((sum, row) => sum + (row.tipo === 'suprimento' ? parseFloat(row.total_suprimentos || 0) : 0), 0);

    // Buscar lista de vendas
    const vendasListaQuery = await query(`
      SELECT 
        id,
        "clienteNome",
        "valorTotal",
        "meioPagamento",
        "dataVenda",
        status
      FROM vendas_caixa
      WHERE "caixaId" = $1::uuid
        AND status = 'concluida'
      ORDER BY "dataVenda" DESC
    `, [caixa_id]);

    const vendas = vendasQuery.rows?.[0] || { total_vendas: '0', valor_total_vendas: '0' };
    const vendasCanceladas = vendasCanceladasQuery.rows?.[0] || { total_canceladas: '0', valor_total_canceladas: '0' };
    
    // Conversões seguras com log detalhado
    const valorAbertura = parseFloat(String(caixa?.valorAbertura || '0'));
    const valorTotalVendasRaw = vendas?.valor_total_vendas || '0';
    const valorTotalVendas = parseFloat(String(valorTotalVendasRaw));
    
    console.log('🔢 CONVERSÕES:');
    console.log('  valorAbertura (raw):', caixa?.valorAbertura, 'tipo:', typeof caixa?.valorAbertura);
    console.log('  valorAbertura (convertido):', valorAbertura);
    console.log('  valorTotalVendas (raw):', valorTotalVendasRaw, 'tipo:', typeof valorTotalVendasRaw);
    console.log('  valorTotalVendas (convertido):', valorTotalVendas);
    
    const saldoAtual = valorAbertura + valorTotalVendas - totalSangrias + totalSuprimentos;
    
    // VERIFICAÇÃO EXTRA: Buscar vendas sem filtro de status para ver se existem
    try {
      const todasVendasQuery = await query(`
        SELECT COUNT(*) as total, status
        FROM vendas_caixa
        WHERE "caixaId" = $1::uuid
        GROUP BY status
      `, [caixa_id]);
      console.log('🔍 TODAS as vendas (por status):', todasVendasQuery.rows);
    } catch (err) {
      console.warn('⚠️ Erro ao buscar todas as vendas:', err);
    }

    console.log('💰 CÁLCULO DO SALDO:');
    console.log('  📍 Caixa ID:', caixa_id);
    console.log('  💵 Valor Abertura:', valorAbertura);
    console.log('  🛒 Vendas Concluídas:', vendas.total_vendas);
    console.log('  💰 Valor Total Vendas:', valorTotalVendas);
    console.log('  🔻 Total Sangrias:', totalSangrias);
    console.log('  🔺 Total Suprimentos:', totalSuprimentos);
    console.log('  📐 Fórmula:', `${valorAbertura} + ${valorTotalVendas} - ${totalSangrias} + ${totalSuprimentos}`);
    console.log('  ✅ SALDO ATUAL:', saldoAtual);
    
    // ALERTA se saldo for zero mas houver abertura
    if (saldoAtual === valorAbertura && valorTotalVendas === 0 && String(vendas.total_vendas) !== '0') {
      console.error('⚠️⚠️⚠️ ALERTA: Vendas existem mas valorTotalVendas está ZERO!');
      console.error('   Isso indica problema na conversão de tipos ou na query!');
      console.error('   Vendas.total_vendas:', vendas.total_vendas, 'tipo:', typeof vendas.total_vendas);
    }

    return NextResponse.json({
      success: true,
      data: {
        caixa: {
          id: caixa.id,
          descricao: caixa.descricao,
          valorAbertura: valorAbertura,
          dataAbertura: caixa.dataAbertura,
          status: caixa.status,
          observacoes: caixa.observacoes
        },
        resumo: {
          totalVendas: parseInt(vendas.total_vendas || 0),
          valorTotalVendas: valorTotalVendas,
          totalVendasCanceladas: parseInt(vendasCanceladas.total_canceladas || 0),
          valorTotalCanceladas: parseFloat(vendasCanceladas.valor_total_canceladas || 0),
          totalSangrias: totalSangrias,
          totalSuprimentos: totalSuprimentos,
          quantidadeSangrias: (movimentacoesQuery.rows || []).filter(row => row.tipo === 'sangria').length,
          quantidadeSuprimentos: (movimentacoesQuery.rows || []).filter(row => row.tipo === 'suprimento').length,
          saldoAtual: saldoAtual,
          entradas: valorTotalVendas + totalSuprimentos,
          saidas: totalSangrias,
          totalPorFormaPagamento: (formasPagamentoQuery.rows || []).map(row => ({
            formaPagamento: row.forma_pagamento,
            valor: parseFloat(row.valor_total || 0),
            quantidade: parseInt(row.total_vendas || 0)
          }))
        },
        vendas: (vendasListaQuery.rows || []).map(venda => ({
          id: venda.id,
          numero: venda.id.substring(0, 8), // Usar primeiros 8 caracteres do ID como número
          clienteNome: venda.clienteNome || 'Cliente Avulso',
          valorTotal: parseFloat(venda.valorTotal || 0),
          meioPagamento: venda.meioPagamento,
          dataVenda: venda.dataVenda,
          status: venda.status
        })),
        movimentacoes: (listaMovimentacoesQuery.rows || []).map(mov => ({
          id: mov.id,
          tipo: mov.tipo,
          valor: parseFloat(mov.valor || 0),
          descricao: mov.descricao,
          dataMovimentacao: mov.dataMovimentacao,
          usuarioNome: 'Sistema' // Temporário até adicionar a coluna
        })),
        valorAbertura: valorAbertura,
        valorEsperado: saldoAtual
      }
    });
  } catch (error: any) {
    console.error('❌ ERRO CRÍTICO ao buscar resumo do caixa:', error);
    console.error('❌ Mensagem:', error.message);
    console.error('❌ Stack:', error.stack);
    console.error('❌ Nome:', error.name);
    
    // Log adicional para debug
    if (error.code) {
      console.error('❌ Código do erro:', error.code);
    }
    if (error.detail) {
      console.error('❌ Detalhe:', error.detail);
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        errorType: error.name,
        errorCode: error.code,
        details: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          code: error.code
        }
      },
      { status: 500 }
    );
  }
}
