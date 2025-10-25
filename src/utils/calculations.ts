import { MovimentacaoFinanceira } from '@/types/movimentacao';

export function calculateSaldoAtual(saldoInicial: number, movimentacoes: MovimentacaoFinanceira[]): number {
  const totalEntradas = movimentacoes.reduce((sum, mov) => sum + mov.valor_entrada, 0);
  const totalSaidas = movimentacoes.reduce((sum, mov) => sum + mov.valor_saida, 0);
  
  return saldoInicial + totalEntradas - totalSaidas;
}

export function calculateTotalEntradas(movimentacoes: MovimentacaoFinanceira[]): number {
  return movimentacoes.reduce((sum, mov) => sum + mov.valor_entrada, 0);
}

export function calculateTotalSaidas(movimentacoes: MovimentacaoFinanceira[]): number {
  return movimentacoes.reduce((sum, mov) => sum + mov.valor_saida, 0);
}

export function calculateMovimentacoesPorPeriodo(
  movimentacoes: MovimentacaoFinanceira[],
  dataInicio: Date,
  dataFim: Date
): MovimentacaoFinanceira[] {
  return movimentacoes.filter(mov => {
    const dataMov = new Date(mov.data_movimentacao);
    return dataMov >= dataInicio && dataMov <= dataFim;
  });
}

export function calculateMovimentacoesPorTipo(
  movimentacoes: MovimentacaoFinanceira[],
  tipo: 'entrada' | 'saida' | 'transferencia'
): MovimentacaoFinanceira[] {
  return movimentacoes.filter(mov => mov.tipo_movimentacao === tipo);
}

export function calculateResumoFinanceiro(
  contas: any[],
  movimentacoes: MovimentacaoFinanceira[]
): {
  total_entradas: number;
  total_saidas: number;
  saldo_atual_total: number;
  total_contas: number;
  contas_ativas: number;
  movimentacoes_mes: number;
} {
  const totalEntradas = calculateTotalEntradas(movimentacoes);
  const totalSaidas = calculateTotalSaidas(movimentacoes);
  const saldoAtualTotal = contas.reduce((sum, conta) => sum + conta.saldo_atual, 0);
  const totalContas = contas.length;
  const contasAtivas = contas.filter(conta => conta.status === 'ativo').length;
  
  // Movimentações do mês atual
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
  const movimentacoesMes = calculateMovimentacoesPorPeriodo(movimentacoes, inicioMes, fimMes).length;

  return {
    total_entradas: totalEntradas,
    total_saidas: totalSaidas,
    saldo_atual_total: saldoAtualTotal,
    total_contas: totalContas,
    contas_ativas: contasAtivas,
    movimentacoes_mes: movimentacoesMes
  };
}

export function calculateProjecaoSaldo(
  saldoAtual: number,
  movimentacoesFuturas: MovimentacaoFinanceira[]
): number {
  const totalEntradas = calculateTotalEntradas(movimentacoesFuturas);
  const totalSaidas = calculateTotalSaidas(movimentacoesFuturas);
  
  return saldoAtual + totalEntradas - totalSaidas;
}

export function calculateTendenciaSaldo(
  movimentacoes: MovimentacaoFinanceira[],
  dias: number = 30
): 'crescendo' | 'diminuindo' | 'estavel' {
  const agora = new Date();
  const dataInicio = new Date(agora.getTime() - (dias * 24 * 60 * 60 * 1000));
  
  const movimentacoesPeriodo = calculateMovimentacoesPorPeriodo(movimentacoes, dataInicio, agora);
  
  if (movimentacoesPeriodo.length < 2) return 'estavel';
  
  // Dividir o período em duas metades
  const meioPeriodo = new Date(dataInicio.getTime() + (dias * 12 * 60 * 60 * 1000));
  
  const primeiraMetade = movimentacoesPeriodo.filter(mov => 
    new Date(mov.data_movimentacao) < meioPeriodo
  );
  const segundaMetade = movimentacoesPeriodo.filter(mov => 
    new Date(mov.data_movimentacao) >= meioPeriodo
  );
  
  const saldoPrimeiraMetade = calculateTotalEntradas(primeiraMetade) - calculateTotalSaidas(primeiraMetade);
  const saldoSegundaMetade = calculateTotalEntradas(segundaMetade) - calculateTotalSaidas(segundaMetade);
  
  const diferenca = saldoSegundaMetade - saldoPrimeiraMetade;
  const percentualVariacao = Math.abs(diferenca) / Math.max(Math.abs(saldoPrimeiraMetade), 1) * 100;
  
  if (percentualVariacao < 5) return 'estavel';
  if (diferenca > 0) return 'crescendo';
  return 'diminuindo';
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.'));
}

