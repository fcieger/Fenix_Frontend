# 📄 Sistema de Geração de PDF com Puppeteer

Sistema completo para gerar PDFs de relatórios com layout moderno usando Puppeteer.

## 📁 Estrutura de Arquivos

```
src/lib/pdf/
├── generatePDF.ts      # Helper principal para gerar PDF
├── utils.ts            # Utilitários de formatação
└── exportPDF.ts        # Helper para exportar no frontend

src/components/relatorios/pdf/
├── PDFLayout.tsx       # Layout base para PDFs
├── VendasPeriodoPDF.tsx # Template de exemplo
└── ExemploUso.tsx      # Exemplo de uso

src/app/api/relatorios/export/pdf/
└── route.ts            # API route para gerar PDF
```

## 🚀 Como Usar

### 1. No Frontend (Componente React)

```typescript
import { useAuth } from '@/contexts/auth-context';
import { exportPDF } from '@/lib/pdf/exportPDF';
import { toast } from 'sonner';

function MeuRelatorio() {
  const { token, activeCompanyId } = useAuth();
  const [exportando, setExportando] = useState(false);

  const handleExportarPDF = async () => {
    setExportando(true);
    
    try {
      // 1. Buscar dados do relatório
      const dados = await buscarDadosRelatorio();

      // 2. Exportar PDF
      await exportPDF({
        tipo: 'vendas',
        subTipo: 'vendas-periodo',
        dados: {
          periodo: {
            dataInicio: '2024-01-01',
            dataFim: '2024-01-31'
          },
          resumo: {
            totalVendas: dados.totalVendas,
            valorTotal: dados.valorTotal,
            ticketMedio: dados.ticketMedio,
            mediaDiaria: dados.mediaDiaria
          },
          detalhes: dados.detalhes
        },
        filtros: {
          dataInicio: '2024-01-01',
          dataFim: '2024-01-31'
        },
        token,
        companyId: activeCompanyId
      });

      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
      console.error(error);
    } finally {
      setExportando(false);
    }
  };

  return (
    <button onClick={handleExportarPDF} disabled={exportando}>
      {exportando ? 'Gerando PDF...' : 'Exportar PDF'}
    </button>
  );
}
```

### 2. Criar Novo Template de PDF

```typescript
// src/components/relatorios/pdf/MeuRelatorioPDF.tsx
'use client';

import React from 'react';
import { PDFLayout } from './PDFLayout';
import { formatCurrency, formatDate } from '@/lib/pdf/utils';

interface MeuRelatorioPDFProps {
  dados: any;
  filtros?: any;
}

export function MeuRelatorioPDF({ dados, filtros }: MeuRelatorioPDFProps) {
  return (
    <PDFLayout 
      title="Meu Relatório"
      subtitle={`${formatDate(dados.periodo.dataInicio)} a ${formatDate(dados.periodo.dataFim)}`}
    >
      {/* Seu conteúdo aqui */}
      <div className="pdf-section">
        <div className="pdf-section-title">Resumo</div>
        {/* ... */}
      </div>
    </PDFLayout>
  );
}
```

### 3. Registrar Novo Template na API

```typescript
// src/app/api/relatorios/export/pdf/route.ts
import { MeuRelatorioPDF } from '@/components/relatorios/pdf/MeuRelatorioPDF';

// No switch case, adicionar:
case 'meu-relatorio':
  pdfComponent = React.createElement(MeuRelatorioPDF, { dados, filtros });
  break;
```

## 📋 Utilitários Disponíveis

### Formatação

```typescript
import { 
  formatCurrency,    // Formata valor monetário: R$ 1.234,56
  formatDate,        // Formata data: 01/01/2024
  formatDateTime,    // Formata data e hora: 01/01/2024 10:30
  formatPercent,     // Formata percentual: 15.50%
  formatNumber,      // Formata número: 1.234,56
  formatInteger      // Formata inteiro: 1.234
} from '@/lib/pdf/utils';
```

### Classes CSS Disponíveis

- `.pdf-container` - Container principal
- `.pdf-header` - Cabeçalho do relatório
- `.pdf-section` - Seção do relatório
- `.pdf-section-title` - Título da seção
- `.pdf-metrics` - Grid de métricas
- `.pdf-metric-card` - Card de métrica
- `.pdf-table` - Tabela estilizada
- `.text-right`, `.text-center` - Alinhamento
- `.font-bold` - Negrito
- `.text-green`, `.text-red`, `.text-blue` - Cores

## 🎨 Personalização

### Opções de PDF

```typescript
import { generatePDFFromReact } from '@/lib/pdf/generatePDF';

const pdf = await generatePDFFromReact(component, {
  format: 'A4',              // 'A4' | 'Letter' | 'Legal'
  margin: {
    top: '20mm',
    right: '15mm',
    bottom: '20mm',
    left: '15mm'
  },
  displayHeaderFooter: true,
  printBackground: true,
  landscape: false
});
```

### Customizar Header/Footer

```typescript
const pdf = await generatePDFFromReact(component, {
  headerTemplate: `
    <div style="font-size: 10px; text-align: center;">
      Meu Header Personalizado
    </div>
  `,
  footerTemplate: `
    <div style="font-size: 10px; text-align: center;">
      Página <span class="pageNumber"></span> de <span class="totalPages"></span>
    </div>
  `
});
```

## 🔧 Troubleshooting

### Erro: "Puppeteer não encontrado"
```bash
npm install puppeteer
```

### Erro: "Cannot find module 'react-dom/server'"
```bash
npm install react-dom
```

### PDF muito grande
- Reduzir quantidade de dados
- Usar paginação
- Otimizar imagens

### PDF com layout quebrado
- Verificar estilos CSS
- Testar em diferentes tamanhos de página
- Verificar se há elementos que ultrapassam a página

## 📝 Exemplos de Templates

### Relatório Simples
```typescript
<PDFLayout title="Relatório Simples">
  <div className="pdf-section">
    <div className="pdf-section-title">Dados</div>
    <table className="pdf-table">
      <thead>
        <tr>
          <th>Campo</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total</td>
          <td>{formatCurrency(1000)}</td>
        </tr>
      </tbody>
    </table>
  </div>
</PDFLayout>
```

### Relatório com Métricas
```typescript
<PDFLayout title="Relatório com Métricas">
  <div className="pdf-metrics">
    <div className="pdf-metric-card">
      <div className="pdf-metric-label">Total</div>
      <div className="pdf-metric-value">{formatCurrency(1000)}</div>
    </div>
    <div className="pdf-metric-card">
      <div className="pdf-metric-label">Vendas</div>
      <div className="pdf-metric-value">150</div>
    </div>
  </div>
</PDFLayout>
```

## ✅ Checklist para Novo Relatório

- [ ] Criar componente React em `src/components/relatorios/pdf/`
- [ ] Usar `PDFLayout` como base
- [ ] Usar utilitários de formatação (`formatCurrency`, `formatDate`, etc.)
- [ ] Registrar na API route (`/api/relatorios/export/pdf/route.ts`)
- [ ] Testar geração de PDF
- [ ] Verificar layout e formatação
- [ ] Testar com diferentes volumes de dados

## 📚 Recursos

- [Puppeteer Documentation](https://pptr.dev/)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [CSS Print Styles](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/print)





