// Dados mock para teste da tela de prazos de pagamento
export const mockPrazosPagamento = [
  {
    id: '1',
    nome: '30 dias',
    descricao: 'Pagamento em 30 dias',
    tipo: 'dias',
    configuracoes: {
      dias: 30,
      percentualEntrada: 0,
      percentualRestante: 100
    },
    ativo: true,
    padrao: true,
    observacoes: 'Prazo padrão para vendas',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    nome: '10x sem entrada',
    descricao: 'Pagamento em 10 parcelas mensais',
    tipo: 'parcelas',
    configuracoes: {
      numeroParcelas: 10,
      intervaloDias: 30,
      percentualEntrada: 0,
      percentualParcelas: 10
    },
    ativo: true,
    padrao: false,
    observacoes: 'Ideal para produtos de alto valor',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  },
  {
    id: '3',
    nome: '30/60/90 dias',
    descricao: 'Pagamento escalonado',
    tipo: 'personalizado',
    configuracoes: {
      parcelas: [
        { numero: 1, dias: 0, percentual: 30, descricao: 'Entrada' },
        { numero: 2, dias: 30, percentual: 35, descricao: '30 dias' },
        { numero: 3, dias: 60, percentual: 35, descricao: '60 dias' }
      ]
    },
    ativo: true,
    padrao: false,
    observacoes: 'Para clientes especiais',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z'
  },
  {
    id: '4',
    nome: 'À vista',
    descricao: 'Pagamento imediato',
    tipo: 'dias',
    configuracoes: {
      dias: 0,
      percentualEntrada: 100,
      percentualRestante: 0
    },
    ativo: true,
    padrao: false,
    observacoes: 'Com desconto de 5%',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z'
  },
  {
    id: '5',
    nome: '6x com entrada',
    descricao: 'Pagamento em 6 parcelas com entrada',
    tipo: 'parcelas',
    configuracoes: {
      numeroParcelas: 6,
      intervaloDias: 30,
      percentualEntrada: 20,
      percentualParcelas: 13.33
    },
    ativo: false,
    padrao: false,
    observacoes: 'Prazo descontinuado',
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z'
  }
];

// Função para simular delay da API
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para simular resposta da API
export const mockApiResponse = (data: any[], page: number = 1, limit: number = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit)
    }
  };
};

















