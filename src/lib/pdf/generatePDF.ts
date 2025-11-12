import puppeteer from 'puppeteer';

interface PDFOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  printBackground?: boolean;
  landscape?: boolean;
}

const defaultOptions: PDFOptions = {
  format: 'A4',
  margin: {
    top: '20mm',
    right: '15mm',
    bottom: '20mm',
    left: '15mm'
  },
  displayHeaderFooter: true,
  printBackground: true,
  landscape: false
};

/**
 * Gera PDF a partir de HTML
 */
export async function generatePDFFromHTML(
  htmlContent: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  const finalOptions = { ...defaultOptions, ...options };

  // HTML completo com estilos
  const fullHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório PDF</title>
        <style>
          ${getPDFStyles()}
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  // Iniciar Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Configurar viewport
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });

    // Carregar HTML
    await page.setContent(fullHTML, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Aguardar renderização completa (especialmente para gráficos)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Gerar PDF
    const pdf = await page.pdf({
      format: finalOptions.format,
      margin: finalOptions.margin,
      displayHeaderFooter: finalOptions.displayHeaderFooter,
      headerTemplate: finalOptions.headerTemplate || getDefaultHeader(),
      footerTemplate: finalOptions.footerTemplate || getDefaultFooter(),
      printBackground: finalOptions.printBackground,
      landscape: finalOptions.landscape,
      preferCSSPageSize: false
    });

    return pdf;
  } finally {
    await browser.close();
  }
}

/**
 * Estilos CSS para PDF
 */
function getPDFStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
    }

    .pdf-container {
      padding: 0;
      max-width: 100%;
    }

    /* Cabeçalho Moderno */
    .pdf-header-modern {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 24px;
      margin-bottom: 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .company-info {
      flex: 1;
    }

    .company-name {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #ffffff;
    }

    .company-cnpj, .company-address, .company-contact {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 4px;
    }

    .document-info {
      text-align: right;
    }

    .document-title {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      color: rgba(255, 255, 255, 0.9);
    }

    .document-number {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #ffffff;
    }

    .document-status {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Cards de Informações */
    .info-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .info-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }

    .info-card .info-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }

    /* Seções em Colunas */
    .two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .column {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
    }

    .section-header {
      font-size: 13px;
      font-weight: 700;
      color: #3b82f6;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #3b82f6;
    }

    .section-content {
      font-size: 11px;
    }

    .field-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 8px;
      margin-bottom: 4px;
    }

    .field-value {
      font-size: 12px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .field-value-small {
      font-size: 10px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    /* Informações Adicionais */
    .additional-info {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-label {
      font-size: 11px;
      color: #6b7280;
      font-weight: 600;
    }

    .info-text {
      font-size: 12px;
      color: #1f2937;
      font-weight: 500;
    }

    /* Seção de Transportadora */
    .transport-section {
      margin-bottom: 24px;
    }

    .transport-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 12px;
    }

    .transport-item {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
    }

    /* Tabelas */
    .pdf-section {
      margin-bottom: 24px;
    }

    .items-table, .taxes-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 10px;
    }

    .items-table thead, .taxes-table thead {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
    }

    .items-table th, .taxes-table th {
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .items-table td, .taxes-table td {
      padding: 8px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 10px;
    }

    .items-table tbody tr:nth-child(even), .taxes-table tbody tr:nth-child(even) {
      background: #f9fafb;
    }

    .items-table tbody tr:hover, .taxes-table tbody tr:hover {
      background: #f3f4f6;
    }

    /* Totais */
    .totals-section {
      margin-bottom: 24px;
    }

    .totals-table {
      width: 100%;
      max-width: 400px;
      margin-left: auto;
      border-collapse: collapse;
      margin-top: 12px;
    }

    .totals-table td {
      padding: 10px 16px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 12px;
    }

    .total-label {
      text-align: right;
      font-weight: 600;
      color: #6b7280;
    }

    .total-value {
      text-align: right;
      font-weight: 600;
      color: #1f2937;
    }

    .total-value.discount {
      color: #ef4444;
    }

    .total-final {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      border-top: 2px solid #3b82f6;
    }

    .total-label-final {
      text-align: right;
      font-weight: 700;
      font-size: 14px;
      color: #ffffff;
      padding: 14px 16px;
    }

    .total-value-final {
      text-align: right;
      font-weight: 700;
      font-size: 18px;
      color: #ffffff;
      padding: 14px 16px;
    }

    /* Observações */
    .observations-section {
      margin-bottom: 24px;
    }

    .observations-content {
      padding: 16px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      white-space: pre-wrap;
      line-height: 1.6;
      font-size: 11px;
      color: #1f2937;
      margin-top: 12px;
    }

    /* Utilitários */
    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    .font-bold {
      font-weight: 700;
    }

    @media print {
      .page-break {
        page-break-after: always;
      }
    }
  `;
}

/**
 * Header padrão para PDF
 */
function getDefaultHeader(): string {
  return `
    <div style="font-size: 10px; text-align: center; width: 100%; padding: 10px 20mm; border-bottom: 1px solid #e5e7eb;">
      <span style="font-weight: 600; color: #3b82f6;">FENIX ERP</span>
    </div>
  `;
}

/**
 * Footer padrão para PDF
 */
function getDefaultFooter(): string {
  return `
    <div style="font-size: 10px; text-align: center; width: 100%; padding: 10px 20mm; border-top: 1px solid #e5e7eb; color: #6b7280;">
      <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      <span style="margin-left: 20px;">Gerado em ${new Date().toLocaleString('pt-BR')}</span>
    </div>
  `;
}
