import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { generatePDFFromHTML } from '@/lib/pdf/generatePDF';
import { generatePedidoVendaPDFHTML } from '@/lib/pdf/templates/pedidoVendaPDF';
import { 
  generateRelatorioGenericoPDFHTML, 
  generateEstoquePDFHTML 
} from '@/lib/pdf/templates/relatorioGenericoPDF';

/**
 * POST /api/relatorios/export/pdf
 * 
 * Gera PDF de relatório usando Puppeteer
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const body = await request.json();
    const { tipo, subTipo, dados, filtros, company_id } = body;

    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'company_id é obrigatório' },
        { status: 400 }
      );
    }

    // Validar acesso
    const acesso = await validateUserAccess(token, company_id);
    if (!acesso.valid) {
      return NextResponse.json(
        { success: false, error: acesso.error || 'Acesso negado' },
        { status: 403 }
      );
    }

    if (!tipo || !subTipo) {
      return NextResponse.json(
        { success: false, error: 'tipo e subTipo são obrigatórios' },
        { status: 400 }
      );
    }

    if (!dados) {
      return NextResponse.json(
        { success: false, error: 'dados são obrigatórios' },
        { status: 400 }
      );
    }

    // Selecionar template baseado no tipo
    let htmlContent: string | null = null;

    switch (subTipo) {
      case 'pedido-venda':
        htmlContent = generatePedidoVendaPDFHTML(dados);
        break;
      
      // Relatórios de Estoque
      case 'estoque-saldos':
      case 'estoque-movimentacoes':
      case 'estoque-kardex':
      case 'estoque-valorizado':
      case 'estoque-minimo':
      case 'estoque-inventario':
        htmlContent = generateEstoquePDFHTML(dados, filtros);
        break;
      
      // Relatórios de Vendas
      case 'vendas-periodo':
      case 'vendas-produtos':
      case 'vendas-clientes':
      case 'vendas-vendedores':
      case 'orcamentos':
        htmlContent = generateRelatorioGenericoPDFHTML('Relatório de Vendas', dados, filtros);
        break;
      
      // Relatórios de Compras
      case 'compras-periodo':
      case 'compras-fornecedores':
      case 'compras-produtos':
      case 'compras-pendentes':
        htmlContent = generateRelatorioGenericoPDFHTML('Relatório de Compras', dados, filtros);
        break;
      
      // Relatórios Financeiros
      case 'financeiro-fluxo':
      case 'financeiro-contas':
      case 'financeiro-dre':
      case 'financeiro-bancos':
      case 'financeiro-formas-pagamento':
      case 'financeiro-centro-custo':
        htmlContent = generateRelatorioGenericoPDFHTML('Relatório Financeiro', dados, filtros);
        break;
      
      // Relatórios Fiscais
      case 'nfe-emitidas':
      case 'nfe-canceladas':
      case 'impostos-recolhidos':
        htmlContent = generateRelatorioGenericoPDFHTML('Relatório Fiscal', dados, filtros);
        break;
      
      // Relatórios de Frente de Caixa
      case 'caixa-vendas':
      case 'caixa-operadores':
      case 'caixa-sangrias':
      case 'caixa-formas-pagamento':
        htmlContent = generateRelatorioGenericoPDFHTML('Relatório de Caixa', dados, filtros);
        break;
      
      // Relatórios Gerais
      case 'clientes':
      case 'fornecedores':
      case 'produtos':
      case 'dashboard-consolidado':
        htmlContent = generateRelatorioGenericoPDFHTML('Relatório Geral', dados, filtros);
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: `Tipo de relatório não suportado: ${subTipo}` },
          { status: 400 }
        );
    }

    if (!htmlContent) {
      return NextResponse.json(
        { success: false, error: 'Erro ao gerar HTML do PDF' },
        { status: 500 }
      );
    }

    console.log(`📄 Gerando PDF: ${tipo}/${subTipo} para empresa ${company_id}`);

    // Gerar PDF
    const pdfBuffer = await generatePDFFromHTML(htmlContent);

    console.log(`✅ PDF gerado com sucesso: ${pdfBuffer.length} bytes`);

    // Nome do arquivo
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `relatorio-${subTipo}-${timestamp}.pdf`;

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao gerar PDF:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno ao gerar PDF'
      },
      { status: 500 }
    );
  }
}

