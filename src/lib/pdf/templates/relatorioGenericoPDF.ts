/**
 * Template genérico para PDFs de relatórios
 */

export function generateRelatorioGenericoPDFHTML(
  titulo: string,
  dados: any,
  filtros?: any
): string {
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('pt-BR');
    } catch {
      return date;
    }
  };

  // Renderizar tabela com base nos dados
  const renderizarTabela = () => {
    if (!dados?.data || !Array.isArray(dados.data)) {
      return '<p>Sem dados disponíveis</p>';
    }

    const items = dados.data;
    if (items.length === 0) {
      return '<p>Nenhum registro encontrado</p>';
    }

    // Pegar as chaves do primeiro item para criar as colunas
    const primeiroItem = items[0];
    const colunas = Object.keys(primeiroItem).filter(key => 
      !key.includes('Id') && !key.includes('id') && key !== 'companyId'
    );

    return `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            ${colunas.map(col => `
              <th style="
                padding: 12px;
                text-align: left;
                border-bottom: 2px solid #e5e7eb;
                font-weight: 600;
                color: #374151;
                font-size: 14px;
              ">
                ${col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
              ${colunas.map(col => {
                let valor = item[col];
                
                // Formatação especial para tipos conhecidos
                if (col.includes('valor') || col.includes('preco')) {
                  valor = typeof valor === 'number' ? formatCurrency(valor) : valor;
                } else if (col.includes('data')) {
                  valor = formatDate(valor);
                } else if (typeof valor === 'boolean') {
                  valor = valor ? 'Sim' : 'Não';
                } else if (valor === null || valor === undefined) {
                  valor = '-';
                }
                
                return `
                  <td style="
                    padding: 12px;
                    border-bottom: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 13px;
                  ">
                    ${valor}
                  </td>
                `;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  // Renderizar métricas se existirem
  const renderizarMetricas = () => {
    const metricas = [];
    
    if (dados.vendas) {
      metricas.push(
        { label: 'Total de Vendas', valor: dados.vendas.totalVendasPeriodo || 0 },
        { label: 'Valor Total', valor: formatCurrency(dados.vendas.valorTotalVendasPeriodo || 0) }
      );
    }
    
    if (dados.compras) {
      metricas.push(
        { label: 'Total de Compras', valor: dados.compras.totalComprasPeriodo || 0 },
        { label: 'Valor Total', valor: formatCurrency(dados.compras.valorTotalComprasPeriodo || 0) }
      );
    }
    
    if (dados.totais) {
      if (dados.totais.recebimentos !== undefined) {
        metricas.push({ label: 'Recebimentos', valor: formatCurrency(dados.totais.recebimentos) });
      }
      if (dados.totais.pagamentos !== undefined) {
        metricas.push({ label: 'Pagamentos', valor: formatCurrency(dados.totais.pagamentos) });
      }
    }
    
    if (metricas.length === 0) return '';
    
    return `
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin: 20px 0;
      ">
        ${metricas.map(m => `
          <div style="
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            color: white;
          ">
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">
              ${m.label}
            </div>
            <div style="font-size: 24px; font-weight: bold;">
              ${m.valor}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            padding: 40px;
            color: #1f2937;
          }
          
          .header {
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          
          .titulo {
            font-size: 24px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 10px;
          }
          
          .info {
            color: #6b7280;
            font-size: 14px;
          }
          
          .periodo {
            background-color: #f3f4f6;
            padding: 12px 16px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
            color: #374151;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">FENIX ERP</div>
          <div class="titulo">${titulo}</div>
          <div class="info">Gerado em: ${dataAtual}</div>
        </div>
        
        ${filtros?.dataInicio && filtros?.dataFim ? `
          <div class="periodo">
            <strong>Período:</strong> 
            ${formatDate(filtros.dataInicio)} até ${formatDate(filtros.dataFim)}
          </div>
        ` : ''}
        
        ${renderizarMetricas()}
        
        ${renderizarTabela()}
        
        <div class="footer">
          <p>FENIX ERP - Sistema de Gestão Empresarial</p>
          <p>Este documento foi gerado automaticamente</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Template específico para estoque
 */
export function generateEstoquePDFHTML(dados: any, filtros?: any): string {
  const titulo = 'Relatório de Saldos de Estoque';
  
  if (!dados?.data) {
    return generateRelatorioGenericoPDFHTML(titulo, dados, filtros);
  }
  
  const totalProdutos = dados.data.length;
  const totalItens = dados.data.reduce((acc: number, item: any) => acc + (item.saldo || 0), 0);
  
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Arial', sans-serif;
            padding: 40px;
            color: #1f2937;
          }
          .header {
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          .metricas {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin: 20px 0;
          }
          .metrica {
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            color: white;
          }
          .metrica-label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 8px;
          }
          .metrica-valor {
            font-size: 32px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            padding: 12px;
            text-align: left;
            background-color: #f3f4f6;
            border-bottom: 2px solid #e5e7eb;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">FENIX ERP</div>
          <h1 style="font-size: 24px; margin-bottom: 10px;">${titulo}</h1>
          <p style="color: #6b7280; font-size: 14px;">Gerado em: ${dataAtual}</p>
        </div>
        
        <div class="metricas">
          <div class="metrica">
            <div class="metrica-label">Total de Produtos</div>
            <div class="metrica-valor">${totalProdutos}</div>
          </div>
          <div class="metrica">
            <div class="metrica-label">Total de Itens</div>
            <div class="metrica-valor">${totalItens}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Produto</th>
              <th>Local</th>
              <th style="text-align: right;">Saldo</th>
            </tr>
          </thead>
          <tbody>
            ${dados.data.map((item: any) => `
              <tr>
                <td>${item.produto_codigo || '-'}</td>
                <td>${item.produto_nome || 'N/A'}</td>
                <td>${item.local_nome || 'N/A'}</td>
                <td style="text-align: right; font-weight: 600;">${item.saldo || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>FENIX ERP - Sistema de Gestão Empresarial</p>
          <p>Este documento foi gerado automaticamente</p>
        </div>
      </body>
    </html>
  `;
}

