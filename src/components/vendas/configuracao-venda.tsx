'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Calendar,
  FileText,
  Hash,
  Plus,
  Search,
  ChevronDown,
  Check,
  Edit,
  Pencil,
  Truck,
  CreditCard,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DateInput from '@/components/ui/date-input';

interface ConfiguracaoVendaProps {
  formData: any;
  onInputChange: (field: string, value: any) => void;
  cadastros: any[];
  clientes: any[];
  vendedores: any[];
  isLoadingCadastros: boolean;
  onSearchCadastros: (query: string) => void;
  showClienteDropdown: boolean;
  setShowClienteDropdown: (show: boolean) => void;
  showVendedorDropdown: boolean;
  setShowVendedorDropdown: (show: boolean) => void;
  naturezasOperacao: any[];
  isLoadingNaturezas: boolean;
  clienteSelecionado: any | null;
  setClienteSelecionado: (c: any | null) => void;
  vendedorSelecionado: any | null;
  setVendedorSelecionado: (v: any | null) => void;
  onEditCliente?: (clienteId: string) => void;
  onEditVendedor?: (vendedorId: string) => void;
  // Novas props para prazo de pagamento
  prazosPagamento: any[];
  isLoadingPrazos: boolean;
  prazoSelecionado: any | null;
  setPrazoSelecionado: (p: any | null) => void;
  showPrazoDropdown: boolean;
  setShowPrazoDropdown: (show: boolean) => void;
}

export default function ConfiguracaoVenda({
  formData,
  onInputChange,
  cadastros,
  clientes,
  vendedores,
  isLoadingCadastros,
  onSearchCadastros,
  showClienteDropdown,
  setShowClienteDropdown,
  showVendedorDropdown,
  setShowVendedorDropdown,
  naturezasOperacao,
  isLoadingNaturezas,
  clienteSelecionado,
  setClienteSelecionado,
  vendedorSelecionado,
  setVendedorSelecionado,
  onEditCliente,
  onEditVendedor,
  // Novas props para prazo de pagamento
  prazosPagamento,
  isLoadingPrazos,
  prazoSelecionado,
  setPrazoSelecionado,
  showPrazoDropdown,
  setShowPrazoDropdown
}: ConfiguracaoVendaProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearchCadastros(query);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nomeRazaoSocial?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cliente.nomeFantasia?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVendedores = vendedores.filter(vendedor =>
    vendedor.nomeRazaoSocial?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendedor.nomeFantasia?.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-purple-600" />
          Configurações da Venda
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure as informações básicas do pedido
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Seção Cliente e Vendedor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cliente */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-purple-600" />
                Cliente *
              </div>
              {clienteSelecionado && onEditCliente && (
                <button
                  type="button"
                  onClick={() => onEditCliente(clienteSelecionado.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors duration-200"
                  title="Editar cliente"
                >
                  <Edit className="w-3 h-3" />
                  Editar
                </button>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={clienteSelecionado ? (clienteSelecionado.nomeRazaoSocial || clienteSelecionado.nomeFantasia) : ''}
                onChange={(e) => onInputChange('cliente', e.target.value)}
                onFocus={() => setShowClienteDropdown(true)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                placeholder="Digite o nome do cliente"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              
              {showClienteDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  <div className="p-3 border-b border-gray-100">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Buscar cliente..."
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {isLoadingCadastros ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="w-5 h-5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
                        Carregando clientes...
                      </div>
                    ) : filteredClientes.length > 0 ? (
                      filteredClientes.map((cadastro) => (
                        <button
                          key={cadastro.id}
                          onClick={() => {
                            onInputChange('cliente', cadastro.id);
                            setClienteSelecionado(cadastro);
                            setShowClienteDropdown(false);
                            setSearchQuery('');
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors duration-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {cadastro.nomeRazaoSocial || cadastro.nomeFantasia}
                            </div>
                            {cadastro.email && (
                              <div className="text-sm text-gray-500">{cadastro.email}</div>
                            )}
                          </div>
                          <Check className="w-4 h-4 text-purple-600" />
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Nenhum cliente encontrado
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Vendedor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-purple-600" />
                Vendedor
              </div>
              {vendedorSelecionado && onEditVendedor && (
                <button
                  type="button"
                  onClick={() => onEditVendedor(vendedorSelecionado.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors duration-200"
                  title="Editar vendedor"
                >
                  <Edit className="w-3 h-3" />
                  Editar
                </button>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={vendedorSelecionado ? (vendedorSelecionado.nomeRazaoSocial || vendedorSelecionado.nomeFantasia) : ''}
                onChange={(e) => onInputChange('vendedor', e.target.value)}
                onFocus={() => setShowVendedorDropdown(true)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                placeholder="Digite o nome do vendedor"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              
              {showVendedorDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  <div className="p-3 border-b border-gray-100">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Buscar vendedor..."
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {isLoadingCadastros ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="w-5 h-5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
                        Carregando vendedores...
                      </div>
                    ) : filteredVendedores.length > 0 ? (
                      filteredVendedores.map((cadastro) => (
                        <button
                          key={cadastro.id}
                          onClick={() => {
                            onInputChange('vendedor', cadastro.id);
                            setVendedorSelecionado(cadastro);
                            setShowVendedorDropdown(false);
                            setSearchQuery('');
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors duration-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {cadastro.nomeRazaoSocial || cadastro.nomeFantasia}
                            </div>
                            {cadastro.email && (
                              <div className="text-sm text-gray-500">{cadastro.email}</div>
                            )}
                          </div>
                          <Check className="w-4 h-4 text-purple-600" />
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Nenhum vendedor encontrado
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

        </div>

        {/* Seção Datas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="space-y-2"
          >
            <DateInput
              value={formData.dataPrevisao}
              onChange={(value) => onInputChange('dataPrevisao', value)}
              label="Data Previsão"
              icon={<Calendar className="w-4 h-4" />}
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="space-y-2"
          >
            <DateInput
              value={formData.dataEmissao}
              onChange={(value) => onInputChange('dataEmissao', value)}
              label="Data Emissão"
              icon={<Calendar className="w-4 h-4" />}
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="space-y-2"
          >
            <DateInput
              value={formData.dataEntrega}
              onChange={(value) => onInputChange('dataEntrega', value)}
              label="Data Entrega"
              icon={<Calendar className="w-4 h-4" />}
            />
          </motion.div>
        </div>

        {/* Seção Natureza de Operação e Prazo de Pagamento */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Natureza de Operação */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-purple-600" />
              Natureza de Operação *
            </label>
            <div className="relative">
              <select
                value={formData.naturezaOperacao}
                onChange={(e) => onInputChange('naturezaOperacao', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white appearance-none"
                disabled={isLoadingNaturezas}
              >
                <option value="">
                  {isLoadingNaturezas ? 'Carregando...' : 'Selecione uma natureza de operação'}
                </option>
                {naturezasOperacao.map((natureza) => (
                  <option key={natureza.id} value={natureza.id}>
                    {natureza.nome} - CFOP: {natureza.cfop}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Prazo de Pagamento */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-purple-600" />
              Prazo de Pagamento
            </label>
            <div className="relative">
              <select
                value={prazoSelecionado ? prazoSelecionado.id : ''}
                onChange={(e) => {
                  const prazoId = e.target.value;
                  if (prazoId) {
                    const prazo = prazosPagamento.find(p => p.id === prazoId);
                    if (prazo) {
                      onInputChange('prazoPagamento', prazoId);
                      setPrazoSelecionado(prazo);
                    }
                  } else {
                    onInputChange('prazoPagamento', '');
                    setPrazoSelecionado(null);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white appearance-none"
                disabled={isLoadingPrazos}
              >
                <option value="">
                  {isLoadingPrazos ? 'Carregando prazos...' : 'Selecione um prazo de pagamento'}
                </option>
                {prazosPagamento.map((prazo) => (
                  <option key={prazo.id} value={prazo.id}>
                    {prazo.nome} - {
                      prazo.tipo === 'dias' && `${prazo.configuracoes?.dias || 0} dias`
                    }
                    {prazo.tipo === 'parcelas' && `${prazo.configuracoes?.numeroParcelas || 0}x parcelas`
                    }
                    {prazo.tipo === 'personalizado' && `${prazo.configuracoes?.parcelas?.length || 0} parcelas personalizadas`
                    }
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preview do prazo selecionado - Ocupa toda a largura */}
        {prazoSelecionado && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-6 bg-purple-50 border border-purple-200 rounded-xl w-full"
          >
            <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Detalhes do Prazo: {prazoSelecionado.nome}
            </h4>
            
            {prazoSelecionado.tipo === 'dias' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <div className="text-gray-600 mb-1">Prazo</div>
                  <div className="text-xl font-bold text-purple-700">
                    {prazoSelecionado.configuracoes?.dias || 0} dias
                  </div>
                </div>
                {prazoSelecionado.configuracoes?.percentualEntrada > 0 && (
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <div className="text-gray-600 mb-1">Entrada</div>
                    <div className="text-xl font-bold text-purple-700">
                      {prazoSelecionado.configuracoes.percentualEntrada}%
                    </div>
                  </div>
                )}
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <div className="text-gray-600 mb-1">Restante</div>
                  <div className="text-xl font-bold text-purple-700">
                    {prazoSelecionado.configuracoes?.percentualRestante || 100}%
                  </div>
                </div>
              </div>
            )}
            
            {prazoSelecionado.tipo === 'parcelas' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <div className="text-gray-600 mb-1">Parcelas</div>
                  <div className="text-xl font-bold text-purple-700">
                    {prazoSelecionado.configuracoes?.numeroParcelas || 0}x
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <div className="text-gray-600 mb-1">Intervalo</div>
                  <div className="text-xl font-bold text-purple-700">
                    {prazoSelecionado.configuracoes?.intervaloDias || 0} dias
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <div className="text-gray-600 mb-1">Valor por parcela</div>
                  <div className="text-xl font-bold text-purple-700">
                    {prazoSelecionado.configuracoes?.percentualParcelas || 0}%
                  </div>
                </div>
              </div>
            )}
            
            {prazoSelecionado.tipo === 'personalizado' && prazoSelecionado.configuracoes?.parcelas && (
              <div className="space-y-4">
                <div className="text-lg font-semibold text-gray-700 mb-4">Parcelas Personalizadas</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prazoSelecionado.configuracoes.parcelas.map((parcela: any, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                      <div className="text-sm text-gray-600 mb-2">{parcela.descricao}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-purple-700">{parcela.dias} dias</div>
                        <div className="text-lg font-bold text-purple-700">{parcela.percentual}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Seção Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <Hash className="w-4 h-4 mr-2 text-purple-600" />
              Pedido
            </label>
            <input
              type="text"
              value={formData.pedido}
              onChange={(e) => onInputChange('pedido', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Número do pedido"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-purple-600" />
              NFe
            </label>
            <input
              type="text"
              value={formData.nfe}
              onChange={(e) => onInputChange('nfe', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Número da NFe"
            />
          </motion.div>
        </div>

        {/* Seção Ordem de Compra e Lista de Preço */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.4 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <Hash className="w-4 h-4 mr-2 text-purple-600" />
              N° da Ordem de Compra
            </label>
            <input
              type="text"
              value={formData.numeroOrdem}
              onChange={(e) => onInputChange('numeroOrdem', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Número da ordem de compra"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.4 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-purple-600" />
              Lista de Preço
            </label>
            <div className="flex">
              <input
                type="text"
                value={formData.listaPreco}
                onChange={(e) => onInputChange('listaPreco', e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Selecione a lista de preço"
              />
              <Button className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-r-xl rounded-l-none">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Seção Modalidade do Frete */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className="space-y-2"
        >
          <label className="block text-sm font-semibold text-gray-700 flex items-center">
            <Truck className="w-4 h-4 mr-2 text-purple-600" />
            Modalidade do Frete
          </label>
          <select
            value={formData.frete}
            onChange={(e) => onInputChange('frete', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          >
            <option value="0">0 - Por conta do emitente</option>
            <option value="1">1 - Por conta do destinatário</option>
            <option value="2">2 - Por conta de terceiros</option>
            <option value="9">9 - Sem frete</option>
          </select>
        </motion.div>

        {/* Seção Valores de Frete e Despesas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.4 }}
          className="bg-gray-50 p-6 rounded-xl border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Truck className="w-5 h-5 mr-2 text-purple-600" />
            Valores de Frete e Despesas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Valor do Frete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Frete (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valorFrete || 0}
                  onChange={(e) => onInputChange('valorFrete', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Despesas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Despesas (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.despesas || 0}
                  onChange={(e) => onInputChange('despesas', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* Checkbox para incluir frete no total */}
          <div className="mt-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.incluirFreteTotal || false}
                onChange={(e) => onInputChange('incluirFreteTotal', e.target.checked)}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Incluir frete e despesas no valor total do pedido
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-8">
              Quando marcado, o valor do frete e despesas serão somados ao total do pedido
            </p>
          </div>

          {/* Resumo dos valores */}
          {(formData.valorFrete > 0 || formData.despesas > 0) && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="text-sm font-semibold text-purple-800 mb-2">Resumo dos Valores</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Frete:</span>
                  <span className="ml-2 font-semibold text-purple-700">
                    R$ {Number(formData.valorFrete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Despesas:</span>
                  <span className="ml-2 font-semibold text-purple-700">
                    R$ {Number(formData.despesas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="col-span-2 border-t border-purple-200 pt-2">
                  <span className="text-gray-600">Total Frete + Despesas:</span>
                  <span className="ml-2 font-bold text-purple-800">
                    R$ {(Number(formData.valorFrete || 0) + Number(formData.despesas || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}


