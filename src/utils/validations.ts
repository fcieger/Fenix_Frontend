import { CreateContaFinanceiraRequest, CreateMovimentacaoRequest } from '@/types/conta';

export function validateContaFinanceira(data: CreateContaFinanceiraRequest): string[] {
  const errors: string[] = [];

  // Validações obrigatórias
  if (!data.company_id) errors.push('company_id é obrigatório');
  if (!data.tipo_conta) errors.push('tipo_conta é obrigatório');
  if (!data.descricao || data.descricao.trim().length === 0) errors.push('descricao é obrigatória');
  if (!data.banco_id) errors.push('banco_id é obrigatório');
  if (!data.banco_nome) errors.push('banco_nome é obrigatório');
  if (!data.banco_codigo) errors.push('banco_codigo é obrigatório');
  if (data.saldo_inicial === undefined || data.saldo_inicial === null) errors.push('saldo_inicial é obrigatório');
  if (!data.data_saldo) errors.push('data_saldo é obrigatória');

  // Validações de tipo
  const tiposValidos = ['conta_corrente', 'caixinha', 'cartao_credito', 'poupanca', 'investimento', 'aplicacao_automatica', 'outro_tipo'];
  if (data.tipo_conta && !tiposValidos.includes(data.tipo_conta)) {
    errors.push('tipo_conta deve ser um dos valores: ' + tiposValidos.join(', '));
  }

  // Validações específicas por tipo de conta
  if (data.tipo_conta === 'conta_corrente' || data.tipo_conta === 'poupanca' || data.tipo_conta === 'aplicacao_automatica') {
    if (!data.numero_agencia) errors.push('numero_agencia é obrigatório para este tipo de conta');
    if (!data.numero_conta) errors.push('numero_conta é obrigatório para este tipo de conta');
  }

  if (data.tipo_conta === 'cartao_credito') {
    if (!data.ultimos_4_digitos) errors.push('ultimos_4_digitos é obrigatório para cartão de crédito');
    if (!data.bandeira_cartao) errors.push('bandeira_cartao é obrigatória para cartão de crédito');
    if (!data.emissor_cartao) errors.push('emissor_cartao é obrigatório para cartão de crédito');
    if (!data.dia_fechamento) errors.push('dia_fechamento é obrigatório para cartão de crédito');
    if (!data.dia_vencimento) errors.push('dia_vencimento é obrigatório para cartão de crédito');
  }

  if (data.tipo_conta === 'poupanca') {
    if (!data.modalidade) errors.push('modalidade é obrigatória para poupança');
  }

  // Validações de formato
  if (data.numero_agencia && data.numero_agencia.length > 20) {
    errors.push('numero_agencia deve ter no máximo 20 caracteres');
  }

  if (data.numero_conta && data.numero_conta.length > 50) {
    errors.push('numero_conta deve ter no máximo 50 caracteres');
  }

  if (data.ultimos_4_digitos && !/^\d{4}$/.test(data.ultimos_4_digitos)) {
    errors.push('ultimos_4_digitos deve conter exatamente 4 dígitos');
  }

  if (data.dia_fechamento && (data.dia_fechamento < 1 || data.dia_fechamento > 31)) {
    errors.push('dia_fechamento deve estar entre 1 e 31');
  }

  if (data.dia_vencimento && (data.dia_vencimento < 1 || data.dia_vencimento > 31)) {
    errors.push('dia_vencimento deve estar entre 1 e 31');
  }

  if (data.saldo_inicial !== undefined && data.saldo_inicial < 0) {
    errors.push('saldo_inicial não pode ser negativo');
  }

  // Validação de data
  if (data.data_saldo && isNaN(Date.parse(data.data_saldo))) {
    errors.push('data_saldo deve ser uma data válida');
  }

  return errors;
}

export function validateMovimentacao(data: CreateMovimentacaoRequest): string[] {
  const errors: string[] = [];

  // Validações obrigatórias
  if (!data.conta_id) errors.push('conta_id é obrigatório');
  if (!data.tipo_movimentacao) errors.push('tipo_movimentacao é obrigatório');
  if (!data.data_movimentacao) errors.push('data_movimentacao é obrigatória');

  // Validações de tipo
  const tiposValidos = ['entrada', 'saida', 'transferencia'];
  if (data.tipo_movimentacao && !tiposValidos.includes(data.tipo_movimentacao)) {
    errors.push('tipo_movimentacao deve ser um dos valores: ' + tiposValidos.join(', '));
  }

  // Validações de valor
  const valorEntrada = data.valor_entrada || 0;
  const valorSaida = data.valor_saida || 0;

  if (data.tipo_movimentacao === 'entrada') {
    if (valorEntrada <= 0) errors.push('valor_entrada deve ser maior que zero para entrada');
    if (valorSaida > 0) errors.push('valor_saida deve ser zero para entrada');
  }

  if (data.tipo_movimentacao === 'saida') {
    if (valorSaida <= 0) errors.push('valor_saida deve ser maior que zero para saída');
    if (valorEntrada > 0) errors.push('valor_entrada deve ser zero para saída');
  }

  if (data.tipo_movimentacao === 'transferencia') {
    if (valorEntrada <= 0 && valorSaida <= 0) {
      errors.push('Para transferência, pelo menos um valor (entrada ou saída) deve ser maior que zero');
    }
    if (valorEntrada > 0 && valorSaida > 0) {
      errors.push('Para transferência, apenas um valor (entrada ou saída) deve ser preenchido');
    }
    if (!data.conta_destino_id) {
      errors.push('conta_destino_id é obrigatório para transferência');
    }
  }

  // Validação de data
  if (data.data_movimentacao && isNaN(Date.parse(data.data_movimentacao))) {
    errors.push('data_movimentacao deve ser uma data válida');
  }

  return errors;
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
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
