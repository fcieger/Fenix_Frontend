'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import CriarContaModal from '@/components/CriarContaModal';
import CriarCaixinhaModal from '@/components/CriarCaixinhaModal';
import CriarCartaoCreditoModal from '@/components/CriarCartaoCreditoModal';
import CriarInvestimentoModal from '@/components/CriarInvestimentoModal';
import CriarAplicacaoAutomaticaModal from '@/components/CriarAplicacaoAutomaticaModal';
import CriarOutroTipoModal from '@/components/CriarOutroTipoModal';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  Eye,
  CreditCard,
  DollarSign,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Upload,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  StarOff,
  PiggyBank,
  Calculator,
  RotateCcw,
  FileText,
  HelpCircle,
  Sparkles,
  EyeOff
} from 'lucide-react';

interface Banco {
  id: string;
  codigo: string;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  website: string;
  status: 'Ativo' | 'Inativo' | 'Suspenso';
  tipo: 'Público' | 'Privado' | 'Cooperativo';
  saldo: number;
  dataCadastro: string;
  ultimaAtualizacao: string;
}

export default function BancoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [loading, setLoading] = useState(false);
  const [selectedBanco, setSelectedBanco] = useState<Banco | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showTipoContaModal, setShowTipoContaModal] = useState(false);
  const [showCriarContaModal, setShowCriarContaModal] = useState(false);
  const [showCriarCaixinhaModal, setShowCriarCaixinhaModal] = useState(false);
  const [showCriarCartaoCreditoModal, setShowCriarCartaoCreditoModal] = useState(false);
  const [showCriarInvestimentoModal, setShowCriarInvestimentoModal] = useState(false);
  const [showCriarAplicacaoAutomaticaModal, setShowCriarAplicacaoAutomaticaModal] = useState(false);
  const [showCriarOutroTipoModal, setShowCriarOutroTipoModal] = useState(false);
  const [tipoContaSelecionado, setTipoContaSelecionado] = useState('');
  const [mostrarSaldo, setMostrarSaldo] = useState(false);

  // Lista atualizada dos principais bancos brasileiros
  const bancos: Banco[] = [
    {
      id: '1',
      codigo: '001',
      nome: 'Banco do Brasil S.A.',
      cnpj: '00.000.000/0001-91',
      endereco: 'SBS Quadra 1, Bloco A, Edifício Sede',
      cidade: 'Brasília',
      estado: 'DF',
      cep: '70073-900',
      telefone: '(61) 3214-5000',
      email: 'atendimento@bb.com.br',
      website: 'www.bb.com.br',
      status: 'Ativo',
      tipo: 'Público',
      saldo: 125000.50,
      dataCadastro: '2024-01-15',
      ultimaAtualizacao: '2024-01-20'
    },
    {
      id: '2',
      codigo: '104',
      nome: 'Caixa Econômica Federal',
      cnpj: '00.360.305/0001-04',
      endereco: 'SBS Quadra 4, Bloco A',
      cidade: 'Brasília',
      estado: 'DF',
      cep: '70092-900',
      telefone: '(61) 3206-1000',
      email: 'atendimento@caixa.gov.br',
      website: 'www.caixa.gov.br',
      status: 'Ativo',
      tipo: 'Público',
      saldo: 87500.25,
      dataCadastro: '2024-01-10',
      ultimaAtualizacao: '2024-01-18'
    },
    {
      id: '3',
      codigo: '237',
      nome: 'Banco Bradesco S.A.',
      cnpj: '60.746.948/0001-12',
      endereco: 'Cidade de Deus, s/n',
      cidade: 'Osasco',
      estado: 'SP',
      cep: '06029-900',
      telefone: '(11) 3684-2000',
      email: 'atendimento@bradesco.com.br',
      website: 'www.bradesco.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 250000.75,
      dataCadastro: '2024-01-12',
      ultimaAtualizacao: '2024-01-19'
    },
    {
      id: '4',
      codigo: '341',
      nome: 'Banco Itaú Unibanco S.A.',
      cnpj: '60.701.190/0001-04',
      endereco: 'Praça Alfredo Egydio de Souza Aranha, 100',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04344-902',
      telefone: '(11) 3003-3000',
      email: 'atendimento@itau.com.br',
      website: 'www.itau.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 180000.00,
      dataCadastro: '2024-01-08',
      ultimaAtualizacao: '2024-01-17'
    },
    {
      id: '5',
      codigo: '033',
      nome: 'Banco Santander (Brasil) S.A.',
      cnpj: '90.400.888/0001-42',
      endereco: 'Rua Amador Bueno, 474',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04752-900',
      telefone: '(11) 3553-5000',
      email: 'atendimento@santander.com.br',
      website: 'www.santander.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 95000.30,
      dataCadastro: '2024-01-05',
      ultimaAtualizacao: '2024-01-16'
    },
    {
      id: '6',
      codigo: '422',
      nome: 'Banco Safra S.A.',
      cnpj: '58.160.789/0001-28',
      endereco: 'Alameda Santos, 2.100',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01418-200',
      telefone: '(11) 3179-2000',
      email: 'atendimento@safra.com.br',
      website: 'www.safra.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 75000.00,
      dataCadastro: '2024-01-03',
      ultimaAtualizacao: '2024-01-15'
    },
    {
      id: '7',
      codigo: '070',
      nome: 'Banco de Brasília S.A.',
      cnpj: '00.000.208/0001-00',
      endereco: 'SBS Quadra 1, Bloco J',
      cidade: 'Brasília',
      estado: 'DF',
      cep: '70073-900',
      telefone: '(61) 3214-1000',
      email: 'atendimento@brb.com.br',
      website: 'www.brb.com.br',
      status: 'Ativo',
      tipo: 'Público',
      saldo: 45000.00,
      dataCadastro: '2024-01-20',
      ultimaAtualizacao: '2024-01-22'
    },
    {
      id: '8',
      codigo: '756',
      nome: 'Sicoob',
      cnpj: '02.038.232/0001-64',
      endereco: 'SBS Quadra 1, Bloco J',
      cidade: 'Brasília',
      estado: 'DF',
      cep: '70073-900',
      telefone: '(61) 3214-1000',
      email: 'atendimento@sicoob.com.br',
      website: 'www.sicoob.com.br',
      status: 'Ativo',
      tipo: 'Cooperativo',
      saldo: 32000.00,
      dataCadastro: '2024-01-18',
      ultimaAtualizacao: '2024-01-21'
    },
    {
      id: '9',
      codigo: '748',
      nome: 'Sicredi',
      cnpj: '92.122.021/0001-83',
      endereco: 'Rua Cândido Mendes, 297',
      cidade: 'Porto Alegre',
      estado: 'RS',
      cep: '90010-150',
      telefone: '(51) 3214-1000',
      email: 'atendimento@sicredi.com.br',
      website: 'www.sicredi.com.br',
      status: 'Ativo',
      tipo: 'Cooperativo',
      saldo: 28000.00,
      dataCadastro: '2024-01-16',
      ultimaAtualizacao: '2024-01-20'
    },
    {
      id: '10',
      codigo: '260',
      nome: 'Nu Pagamentos S.A.',
      cnpj: '18.236.120/0001-58',
      endereco: 'Rua Capote Valente, 39',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '05409-001',
      telefone: '(11) 3003-3000',
      email: 'atendimento@nubank.com.br',
      website: 'www.nubank.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 150000.00,
      dataCadastro: '2024-01-14',
      ultimaAtualizacao: '2024-01-19'
    },
    {
      id: '11',
      codigo: '336',
      nome: 'Banco C6 S.A.',
      cnpj: '31.872.495/0001-72',
      endereco: 'Rua Funchal, 538',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04551-060',
      telefone: '(11) 3003-3000',
      email: 'atendimento@c6bank.com.br',
      website: 'www.c6bank.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 85000.00,
      dataCadastro: '2024-01-12',
      ultimaAtualizacao: '2024-01-18'
    },
    {
      id: '12',
      codigo: '290',
      nome: 'PagSeguro Digital Ltd.',
      cnpj: '08.561.701/0001-01',
      endereco: 'Rua Funchal, 538',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04551-060',
      telefone: '(11) 3003-3000',
      email: 'atendimento@pagseguro.com.br',
      website: 'www.pagseguro.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 65000.00,
      dataCadastro: '2024-01-10',
      ultimaAtualizacao: '2024-01-17'
    },
    {
      id: '13',
      codigo: '077',
      nome: 'Banco Inter S.A.',
      cnpj: '00.765.295/0001-41',
      endereco: 'Rua Bandeira Paulista, 520',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04532-001',
      telefone: '(11) 3003-3000',
      email: 'atendimento@bancointer.com.br',
      website: 'www.bancointer.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 120000.00,
      dataCadastro: '2024-01-08',
      ultimaAtualizacao: '2024-01-16'
    },
    {
      id: '14',
      codigo: '341',
      nome: 'Banco Original S.A.',
      cnpj: '90.400.888/0001-42',
      endereco: 'Rua Amador Bueno, 474',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04752-900',
      telefone: '(11) 3553-5000',
      email: 'atendimento@original.com.br',
      website: 'www.original.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 55000.00,
      dataCadastro: '2024-01-06',
      ultimaAtualizacao: '2024-01-15'
    },
    {
      id: '15',
      codigo: '336',
      nome: 'Banco BTG Pactual S.A.',
      cnpj: '30.306.294/0001-45',
      endereco: 'Rua Funchal, 538',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04551-060',
      telefone: '(11) 3003-3000',
      email: 'atendimento@btgpactual.com',
      website: 'www.btgpactual.com',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 200000.00,
      dataCadastro: '2024-01-04',
      ultimaAtualizacao: '2024-01-14'
    },
    {
      id: '16',
      codigo: '422',
      nome: 'Banco Safra S.A.',
      cnpj: '58.160.789/0001-28',
      endereco: 'Alameda Santos, 2.100',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01418-200',
      telefone: '(11) 3179-2000',
      email: 'atendimento@safra.com.br',
      website: 'www.safra.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 75000.00,
      dataCadastro: '2024-01-03',
      ultimaAtualizacao: '2024-01-15'
    },
    {
      id: '17',
      codigo: '104',
      nome: 'Banco do Nordeste do Brasil S.A.',
      cnpj: '07.237.373/0001-20',
      endereco: 'Rua Senador Pompeu, 1375',
      cidade: 'Fortaleza',
      estado: 'CE',
      cep: '60125-000',
      telefone: '(85) 3206-1000',
      email: 'atendimento@bnb.gov.br',
      website: 'www.bnb.gov.br',
      status: 'Ativo',
      tipo: 'Público',
      saldo: 40000.00,
      dataCadastro: '2024-01-02',
      ultimaAtualizacao: '2024-01-13'
    },
    {
      id: '18',
      codigo: '033',
      nome: 'Banco do Estado do Rio Grande do Sul S.A.',
      cnpj: '92.741.490/0001-10',
      endereco: 'Rua Sete de Setembro, 1375',
      cidade: 'Porto Alegre',
      estado: 'RS',
      cep: '90010-191',
      telefone: '(51) 3214-1000',
      email: 'atendimento@banrisul.com.br',
      website: 'www.banrisul.com.br',
      status: 'Ativo',
      tipo: 'Público',
      saldo: 60000.00,
      dataCadastro: '2024-01-01',
      ultimaAtualizacao: '2024-01-12'
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inativo':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Suspenso':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Público':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Privado':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Cooperativo':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  // Filtrar bancos
  const filteredBancos = bancos.filter(banco => {
    const matchesSearch = banco.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         banco.codigo.includes(searchTerm) ||
                         banco.cnpj.includes(searchTerm);
    const matchesStatus = filterStatus === 'Todos' || banco.status === filterStatus;
    const matchesTipo = filterTipo === 'Todos' || banco.tipo === filterTipo;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const handleRefresh = async () => {
    setLoading(true);
    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const handleViewBanco = (banco: Banco) => {
    setSelectedBanco(banco);
    setShowModal(true);
  };

  const handleNovoBanco = () => {
    setShowTipoContaModal(true);
  };

  const handleTipoContaSelecionado = (tipo: string) => {
    setTipoContaSelecionado(tipo);
    setShowTipoContaModal(false);

    if (tipo === 'caixinha') {
      setShowCriarCaixinhaModal(true);
    } else if (tipo === 'cartao-credito') {
      setShowCriarCartaoCreditoModal(true);
    } else if (tipo === 'investimento') {
      setShowCriarInvestimentoModal(true);
    } else if (tipo === 'aplicacao-automatica') {
      setShowCriarAplicacaoAutomaticaModal(true);
    } else if (tipo === 'outro-tipo') {
      setShowCriarOutroTipoModal(true);
    } else {
      setShowCriarContaModal(true);
    }
  };

  const handleVoltarParaSelecao = () => {
    // Fecha todos os modais
    setShowCriarContaModal(false);
    setShowCriarCaixinhaModal(false);
    setShowCriarCartaoCreditoModal(false);
    setShowCriarInvestimentoModal(false);
    setShowCriarAplicacaoAutomaticaModal(false);
    setShowCriarOutroTipoModal(false);
    
    // Abre a tela de seleção de tipos de conta
    setShowTipoContaModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Building2 className="h-8 w-8 mr-3 text-purple-600" />
                Gestão de Bancos
              </h1>
              <p className="text-gray-600">Cadastro e gestão de instituições bancárias</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setMostrarSaldo(!mostrarSaldo)}
                variant="outline"
                className="bg-white text-purple-700 hover:bg-purple-50 border-purple-200"
              >
                {mostrarSaldo ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {mostrarSaldo ? 'Ocultar Saldo' : 'Mostrar Saldo'}
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                variant="outline"
                className="bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                className="bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button
                onClick={handleNovoBanco}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Banco
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="px-6">
          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Banco
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Nome, código ou CNPJ do banco..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtro Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Todos">Todos</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Suspenso">Suspenso</option>
                </select>
              </div>

              {/* Filtro Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Todos">Todos</option>
                  <option value="Público">Público</option>
                  <option value="Privado">Privado</option>
                  <option value="Cooperativo">Cooperativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Bancos</p>
                  <p className="text-2xl font-bold text-gray-900">{bancos.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+2 este mês</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bancos Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bancos.filter(b => b.status === 'Ativo').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-green-600">
                <span>94% ativos</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bancos Públicos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bancos.filter(b => b.tipo === 'Público').length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-blue-600">
                <span>Instituições públicas</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mostrarSaldo ? formatCurrency(bancos.reduce((acc, b) => acc + b.saldo, 0)) : '••••••••'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-green-600">
                <span>Valor total em contas</span>
              </div>
            </div>
          </div>

          {/* Lista de Bancos */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Bancos Cadastrados</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {filteredBancos.length} de {bancos.length} bancos
                  </span>
                </div>
              </div>
            </div>
          
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Banco
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CNPJ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBancos.map((banco) => (
                    <tr key={banco.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {banco.nome}
                            </div>
                            <div className="text-sm text-gray-500">
                              {banco.cidade}, {banco.estado}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {banco.codigo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {banco.cnpj}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getTipoColor(banco.tipo)}`}>
                          {banco.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {mostrarSaldo ? formatCurrency(banco.saldo) : '••••••••'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(banco.status)}`}>
                          {banco.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleViewBanco(banco)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                            title="Mais opções"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        {/* Modal de Detalhes do Banco */}
        {showModal && selectedBanco && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalhes do Banco
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome</label>
                      <p className="text-sm text-gray-900">{selectedBanco.nome}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Código</label>
                      <p className="text-sm text-gray-900">{selectedBanco.codigo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                      <p className="text-sm text-gray-900">{selectedBanco.cnpj}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo</label>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getTipoColor(selectedBanco.tipo)}`}>
                        {selectedBanco.tipo}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(selectedBanco.status)}`}>
                        {selectedBanco.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rating</label>
                      <div className="flex items-center">
                        <div className="flex items-center mr-2">
                          {renderStars(selectedBanco.rating)}
                        </div>
                        <span className="text-sm text-gray-900">{selectedBanco.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Informações de Contato</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{selectedBanco.endereco}, {selectedBanco.cidade} - {selectedBanco.estado}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{selectedBanco.telefone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{selectedBanco.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{selectedBanco.website}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Fechar
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700">
                    Editar Banco
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Seleção de Tipo de Conta */}
        {showTipoContaModal && (
          <div className="fixed inset-0 bg-white bg-opacity-95 overflow-y-auto h-full w-full z-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full h-full overflow-y-auto"
            >
              <div className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Selecione o tipo de conta que você quer cadastrar
                      </h3>
                      <p className="text-gray-600 text-sm">Escolha o tipo de conta bancária que melhor se adequa às suas necessidades</p>
                    </div>
                    <button
                      onClick={() => setShowTipoContaModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                
                  <div className="space-y-6 flex-1 overflow-y-auto">
                    {/* Contas bancárias e contas de movimentação */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-purple-600" />
                        Contas bancárias e contas de movimentação
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <button
                          onClick={() => handleTipoContaSelecionado('conta-corrente')}
                          className="group flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-transparent hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="p-3 bg-white rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300 mb-3">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <span className="text-sm font-bold text-gray-800 text-center">Conta Corrente</span>
                          <p className="text-xs text-gray-600 text-center mt-1">Movimentações diárias</p>
                        </button>

                        <button
                          onClick={() => handleTipoContaSelecionado('caixinha')}
                          className="group flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-transparent hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="p-3 bg-white rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300 mb-3">
                            <DollarSign className="h-6 w-6 text-green-600" />
                          </div>
                          <span className="text-sm font-bold text-gray-800 text-center">Caixinha</span>
                          <p className="text-xs text-gray-600 text-center mt-1">Reserva de emergência</p>
                        </button>

                        <button
                          onClick={() => handleTipoContaSelecionado('cartao-credito')}
                          className="group flex flex-col items-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-transparent hover:border-red-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="p-3 bg-white rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300 mb-3">
                            <CreditCard className="h-6 w-6 text-red-600" />
                          </div>
                          <span className="text-sm font-bold text-gray-800 text-center">Cartão de Crédito</span>
                          <p className="text-xs text-gray-600 text-center mt-1">Despesas com cartão</p>
                        </button>


                        <button
                          onClick={() => handleTipoContaSelecionado('investimento')}
                          className="group flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-transparent hover:border-yellow-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="p-3 bg-white rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300 mb-3">
                            <Calculator className="h-6 w-6 text-yellow-600" />
                          </div>
                          <span className="text-sm font-bold text-gray-800 text-center">Investimento</span>
                          <p className="text-xs text-gray-600 text-center mt-1">Aplicações financeiras</p>
                        </button>

                        <button
                          onClick={() => handleTipoContaSelecionado('aplicacao-automatica')}
                          className="group flex flex-col items-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-transparent hover:border-indigo-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="p-3 bg-white rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300 mb-3">
                            <RotateCcw className="h-6 w-6 text-indigo-600" />
                          </div>
                          <span className="text-sm font-bold text-gray-800 text-center">Aplicação Automática</span>
                          <p className="text-xs text-gray-600 text-center mt-1">Investimento automático</p>
                        </button>
                    </div>
                  </div>


                    {/* Outros tipos de conta */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <HelpCircle className="h-5 w-5 mr-2 text-orange-600" />
                        Outros tipos de conta
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <button
                          onClick={() => handleTipoContaSelecionado('outro-tipo')}
                          className="group flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-transparent hover:border-orange-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="p-3 bg-white rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300 mb-3">
                            <HelpCircle className="h-6 w-6 text-orange-600" />
                          </div>
                          <span className="text-sm font-bold text-gray-800 text-center">Outro tipo de conta</span>
                          <p className="text-xs text-gray-600 text-center mt-1">Personalizado</p>
                        </button>
                      </div>
                    </div>
                  </div>
                
                  {/* Botão Flutuante */}
                  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
                    <Button
                      onClick={() => setShowTipoContaModal(false)}
                      variant="outline"
                      className="px-6 py-3 text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </motion.div>
          </div>
        )}

        {/* Modal de Criação de Conta */}
        <CriarContaModal
          isOpen={showCriarContaModal}
          onClose={() => setShowCriarContaModal(false)}
          onVoltarParaSelecao={handleVoltarParaSelecao}
          tipoConta={tipoContaSelecionado}
        />

        {/* Modal de Criação de Caixinha */}
        <CriarCaixinhaModal
          isOpen={showCriarCaixinhaModal}
          onClose={() => setShowCriarCaixinhaModal(false)}
          onVoltarParaSelecao={handleVoltarParaSelecao}
        />

        {/* Modal de Criação de Cartão de Crédito */}
        <CriarCartaoCreditoModal
          isOpen={showCriarCartaoCreditoModal}
          onClose={() => setShowCriarCartaoCreditoModal(false)}
          onVoltarParaSelecao={handleVoltarParaSelecao}
        />

        {/* Modal de Criação de Investimento */}
        <CriarInvestimentoModal
          isOpen={showCriarInvestimentoModal}
          onClose={() => setShowCriarInvestimentoModal(false)}
          onVoltarParaSelecao={handleVoltarParaSelecao}
        />

        {/* Modal de Criação de Aplicação Automática */}
        <CriarAplicacaoAutomaticaModal
          isOpen={showCriarAplicacaoAutomaticaModal}
          onClose={() => setShowCriarAplicacaoAutomaticaModal(false)}
          onVoltarParaSelecao={handleVoltarParaSelecao}
        />

        {/* Modal de Criação de Outro Tipo */}
        <CriarOutroTipoModal
          isOpen={showCriarOutroTipoModal}
          onClose={() => setShowCriarOutroTipoModal(false)}
          onVoltarParaSelecao={handleVoltarParaSelecao}
        />
      </div>
      </div>
    </Layout>
  );
}
