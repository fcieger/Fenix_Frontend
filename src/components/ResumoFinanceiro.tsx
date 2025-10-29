'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  PiggyBank, 
  Building2,
  Activity,
  Target,
  Zap
} from 'lucide-react';

interface ResumoFinanceiroProps {
  contas: any[];
  mostrarSaldo: boolean;
}

export default function ResumoFinanceiro({ contas, mostrarSaldo }: ResumoFinanceiroProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalSaldo = contas.reduce((acc, conta) => acc + (parseFloat(conta.saldo_atual) || 0), 0);
  const saldoPositivo = contas.reduce((acc, conta) => {
    const saldo = parseFloat(conta.saldo_atual) || 0;
    return saldo > 0 ? acc + saldo : acc;
  }, 0);
  const saldoNegativo = contas.reduce((acc, conta) => {
    const saldo = parseFloat(conta.saldo_atual) || 0;
    return saldo < 0 ? acc + saldo : acc;
  }, 0);

  const contasPorTipo = contas.reduce((acc, conta) => {
    acc[conta.tipo_conta] = (acc[conta.tipo_conta] || 0) + 1;
    return acc;
  }, {});

  const getTipoIcone = (tipo: string) => {
    switch (tipo) {
      case 'conta_corrente': return Building2;
      case 'caixinha': return PiggyBank;
      case 'cartao_credito': return CreditCard;
      case 'investimento': return TrendingUp;
      case 'aplicacao_automatica': return Zap;
      default: return Activity;
    }
  };

  const getTipoNome = (tipo: string) => {
    switch (tipo) {
      case 'conta_corrente': return 'Contas Correntes';
      case 'caixinha': return 'Caixinhas';
      case 'cartao_credito': return 'Cartões de Crédito';
      case 'investimento': return 'Investimentos';
      case 'aplicacao_automatica': return 'Aplicações Automáticas';
      default: return 'Outros';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      {/* Saldo Total */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-slate-600 mb-1">Saldo Total</p>
            <h3 className={`text-2xl font-bold ${totalSaldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {mostrarSaldo ? formatCurrency(totalSaldo) : '••••••'}
            </h3>
          </div>
          <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-slate-600" />
          </div>
        </div>
      </motion.div>

      {/* Saldo Positivo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-slate-600 mb-1">Entradas</p>
            <h3 className="text-2xl font-bold text-green-600">
              {mostrarSaldo ? formatCurrency(saldoPositivo) : '••••••'}
            </h3>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </motion.div>

      {/* Saldo Negativo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-slate-600 mb-1">Saídas</p>
            <h3 className="text-2xl font-bold text-red-600">
              {mostrarSaldo ? formatCurrency(Math.abs(saldoNegativo)) : '••••••'}
            </h3>
          </div>
          <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
        </div>
      </motion.div>

      {/* Total de Contas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-slate-600 mb-1">Total de Contas</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {contas.length}
            </h3>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {Object.entries(contasPorTipo).slice(0, 2).map(([tipo, quantidade]) => {
            const Icone = getTipoIcone(tipo);
            return (
              <div key={tipo} className="flex items-center gap-2">
                <Icone className="h-3 w-3 text-slate-500" />
                <span className="text-xs text-slate-600">{quantidade as number}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}