'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Plus, Search, Download, Eye, Trash2, AlertCircle, CheckCircle, Clock, XCircle,
  Send, Copy, Ban, CheckSquare, FileDown, RotateCcw, Edit3, Mail, Grid3X3, Printer, 
  Edit, Save, Search as SearchIcon, X, FileIcon, RefreshCw, DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/auth-context';
import { API_CONFIG } from '@/config/api';
import { apiService } from '@/lib/api';
import NFeIntegration from '@/components/nfe/nfe-integration';
import { toast } from 'sonner';

interface NFeItem {
  id: string;
  codigoProduto: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  ncm?: string;
  cfop?: string;
  unidadeComercial?: string;
}

interface NFe {
  id: string;
  companyId: string;
  numeroNfe: string;
  serie: string;
  chaveAcesso?: string;
  status: string;
  dataEmissao: string;
  dataSaida?: string;
  dataAutorizacao?: string;
  valorTotalNota: number;
  naturezaOperacao: string;
  destinatarioCnpjCpf: string;
  destinatarioRazaoSocial: string;
  destinatarioUF: string;
  numeroPedido?: string;
  modelo: string;
  tipoOperacao: string;
  ambiente: string;
  informacoesComplementares?: string;
  itens: NFeItem[];
}

const statusConfig = {
  RASCUNHO: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800', icon: FileText },
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSANDO: { label: 'Processando', color: 'bg-blue-100 text-blue-800', icon: Clock },
  AUTORIZADA: { label: 'Autorizada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  REJEITADA: { label: 'Rejeitada', color: 'bg-red-100 text-red-800', icon: XCircle },
  CANCELADA: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  INUTILIZADA: { label: 'Inutilizada', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  CONTINGENCIA: { label: 'Contingência', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
};

export default function NFePage() {
  const router = useRouter();
  const { token, activeCompanyId, isAuthenticated, isLoading } = useAuth();
  const [nfes, setNfes] = useState<NFe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewNFeDialog, setShowNewNFeDialog] = useState(false);
  
  // Estados para ações
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [processStatus, setProcessStatus] = useState(0);
  const [processMessage, setProcessMessage] = useState('');
  
  // Filtros baseados na imagem
  const [searchTerm, setSearchTerm] = useState('');
  const [statusSefazFilter, setStatusSefazFilter] = useState('ALL');
  const [modeloNfFilter, setModeloNfFilter] = useState('ALL');
  const [ambienteFilter, setAmbienteFilter] = useState('ALL');
  const [tipoPesquisaFilter, setTipoPesquisaFilter] = useState('ALL');
  const [statusNfFilter, setStatusNfFilter] = useState('ALL');
  const [tipoModeloFilter, setTipoModeloFilter] = useState('ALL');
  const [dataInicialEnabled, setDataInicialEnabled] = useState(true);
  const [dataFinalEnabled, setDataFinalEnabled] = useState(true);
  
  // Configurar datas padrão: hoje como data final, ontem como data inicial
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const [dataInicial, setDataInicial] = useState(formatDateForInput(yesterday));
  const [dataFinal, setDataFinal] = useState(formatDateForInput(today));
  const [selectAll, setSelectAll] = useState(false);
  const [selectedNFes, setSelectedNFes] = useState<string[]>([]);
  

  // Estados para nova NFe
  const [newNFe, setNewNFe] = useState({
    naturezaOperacao: '',
    destinatarioCnpj: '',
    destinatarioNome: '',
    observacoes: '',
    itens: [] as NFeItem[]
  });

  const [newItem, setNewItem] = useState({
    codigoProduto: '',
    descricao: '',
    ncm: '',
    cfop: '5102',
    unidadeComercial: 'UN',
    quantidade: 1,
    valorUnitario: 0,
    aliquotaIcms: 18,
    aliquotaIpi: 0,
    aliquotaPis: 1.65,
    aliquotaCofins: 7.60
  });

  useEffect(() => {
    // Só tenta carregar após sabermos o estado de autenticação
    if (!isLoading) {
    loadNFes();
    }
  }, [isLoading, isAuthenticated, activeCompanyId, token]);

  const loadNFes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Se autenticado e com empresa ativa, tentar backend
      if (isAuthenticated && token && activeCompanyId) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/nfe`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`Erro ao listar NFes (${response.status})`);
          }

          const data = await response.json();
          setNfes(data as NFe[]);
          return;
        } catch (e) {
          console.error('Falha ao carregar NFes do backend:', e);
          setError('Erro ao carregar notas fiscais. Tente novamente mais tarde.');
          setNfes([]);
          return;
        }
      }

      // Se não estiver autenticado, mostrar lista vazia
      setNfes([]);
      setError('É necessário estar logado para visualizar as notas fiscais.');
    } catch (err) {
      setError('Erro ao carregar NFes');
      console.error('Erro ao carregar NFes:', err);
      setNfes([]);
    } finally {
      setLoading(false);
    }
  };

  const sincronizarNFe = async (nfeId: string) => {
    if (!token) {
      toast.error('Token não encontrado');
      return;
    }
    
    try {
      const response = await apiService.sincronizarNFe(nfeId, token);
      
      if (response.success) {
        // Recarregar a lista para atualizar o status
        await loadNFes();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Erro ao sincronizar NFe:', error);
      setError(error.message || 'Erro ao sincronizar NFe');
    }
  };

  const handleEmitirNFe = async () => {
    try {
      setLoading(true);
      
      // Validar dados
      if (!newNFe.naturezaOperacao || !newNFe.destinatarioCnpj || !newNFe.destinatarioNome) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }
      
      if (newNFe.itens.length === 0) {
        setError('Adicione pelo menos um item');
        return;
      }
      
      // Em produção, fazer chamada para o backend
      console.log('Emitindo NFe:', newNFe);
      
      // Simular sucesso
      setShowNewNFeDialog(false);
      setNewNFe({
        naturezaOperacao: '',
        destinatarioCnpj: '',
        destinatarioNome: '',
        observacoes: '',
        itens: []
      });
      
      await loadNFes();
    } catch (err) {
      setError('Erro ao emitir NFe');
      console.error('Erro ao emitir NFe:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.codigoProduto || !newItem.descricao || newItem.quantidade <= 0 || newItem.valorUnitario <= 0) {
      setError('Preencha todos os campos do item');
      return;
    }
    
    const valorTotal = newItem.quantidade * newItem.valorUnitario;
    const item: NFeItem = {
      id: Date.now().toString(),
      codigoProduto: newItem.codigoProduto,
      descricao: newItem.descricao,
      ncm: newItem.ncm,
      cfop: newItem.cfop,
      unidadeComercial: newItem.unidadeComercial,
      quantidade: newItem.quantidade,
      valorUnitario: newItem.valorUnitario,
      valorTotal: valorTotal
    };
    
    setNewNFe(prev => ({
      ...prev,
      itens: [...prev.itens, item]
    }));
    
    setNewItem({
      codigoProduto: '',
      descricao: '',
      ncm: '',
      cfop: '5102',
      unidadeComercial: 'UN',
      quantidade: 1,
      valorUnitario: 0,
      aliquotaIcms: 18,
      aliquotaIpi: 0,
      aliquotaPis: 1.65,
      aliquotaCofins: 7.60
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setNewNFe(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.id !== itemId)
    }));
  };

  const filteredNFes = nfes.filter(nfe => {
    const matchesSearch = nfe.numeroNfe.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nfe.destinatarioRazaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (nfe.chaveAcesso && nfe.chaveAcesso.includes(searchTerm)) ||
                         nfe.numeroPedido?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatusSefaz = statusSefazFilter === 'ALL' || nfe.status === statusSefazFilter;
    const matchesModeloNf = modeloNfFilter === 'ALL' || nfe.modelo === modeloNfFilter;
    const matchesAmbiente = ambienteFilter === 'ALL' || nfe.ambiente === ambienteFilter;
    const matchesTipoPesquisa = tipoPesquisaFilter === 'ALL' || nfe.tipoOperacao === tipoPesquisaFilter;
    const matchesStatusNf = statusNfFilter === 'ALL' || nfe.status === statusNfFilter;
    const matchesTipoModelo = tipoModeloFilter === 'ALL' || nfe.tipoOperacao === tipoModeloFilter;
    
    // Filtro de data
    const nfeDate = new Date(nfe.dataEmissao);
    const dataInicialDate = dataInicialEnabled ? new Date(dataInicial) : null;
    const dataFinalDate = dataFinalEnabled ? new Date(dataFinal) : null;
    
    const matchesDataInicial = !dataInicialEnabled || !dataInicialDate || nfeDate >= dataInicialDate;
    const matchesDataFinal = !dataFinalEnabled || !dataFinalDate || nfeDate <= dataFinalDate;
    
    return matchesSearch && matchesStatusSefaz && matchesModeloNf && matchesAmbiente && 
           matchesTipoPesquisa && matchesStatusNf && matchesTipoModelo && 
           matchesDataInicial && matchesDataFinal;
  });

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDENTE;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  // Funções de seleção
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedNFes(filteredNFes.map(nfe => nfe.id));
    } else {
      setSelectedNFes([]);
    }
  };

  const handleSelectNFe = (nfeId: string, checked: boolean) => {
    if (checked) {
      setSelectedNFes(prev => [...prev, nfeId]);
    } else {
      setSelectedNFes(prev => prev.filter(id => id !== nfeId));
    }
  };

  // Funções de ação
  const handleTransmitirNFe = async () => {
    if (selectedNFes.length === 0) {
      toast.error('Selecione pelo menos uma NFe para transmitir');
      return;
    }

    if (!token) {
      toast.error('Token não encontrado');
      return;
    }

    setIsTransmitting(true);
    setProcessStatus(0);
    setProcessMessage('Iniciando transmissão...');

    try {
      for (let i = 0; i < selectedNFes.length; i++) {
        const nfeId = selectedNFes[i];
        setProcessMessage(`Transmitindo NFe ${i + 1} de ${selectedNFes.length}...`);
        
        await apiService.emitirNFeExterna(nfeId, token);
        
        setProcessStatus(((i + 1) / selectedNFes.length) * 100);
      }

      setProcessMessage('100% - Transmissão concluída!');
      toast.success(`${selectedNFes.length} NFe(s) transmitida(s) com sucesso!`);
      
      // Recarregar lista
      await loadNFes();
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      toast.error('Erro na transmissão', {
        description: errorMessage
      });
      setProcessMessage('Erro na transmissão');
    } finally {
      setIsTransmitting(false);
      setTimeout(() => {
        setProcessStatus(0);
        setProcessMessage('');
      }, 3000);
    }
  };

  const handleCopiarNFe = () => {
    console.log('Copiando NFes:', selectedNFes);
    toast.info('Funcionalidade de cópia em desenvolvimento');
  };

  const handleCancelarNFe = async () => {
    if (selectedNFes.length === 0) {
      toast.error('Selecione pelo menos uma NFe para cancelar');
      return;
    }

    if (!token) {
      toast.error('Token não encontrado');
      return;
    }

    const justificativa = prompt('Digite a justificativa para o cancelamento (mínimo 15 caracteres):');
    if (!justificativa || justificativa.trim().length < 15) {
      toast.error('Justificativa deve ter pelo menos 15 caracteres');
      return;
    }

    setIsCanceling(true);

    try {
      for (const nfeId of selectedNFes) {
        await apiService.cancelarNFeExterna(nfeId, justificativa, token);
      }

      toast.success(`${selectedNFes.length} NFe(s) cancelada(s) com sucesso!`);
      await loadNFes();
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      toast.error('Erro no cancelamento', {
        description: errorMessage
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const handleValidarXML = async () => {
    if (selectedNFes.length === 0) {
      toast.error('Selecione pelo menos uma NFe para validar');
      return;
    }

    setIsValidating(true);

    try {
      // TODO: Implementar validação de XML
      toast.info('Funcionalidade de validação XML em desenvolvimento');
    } catch (error: any) {
      toast.error('Erro na validação', {
        description: error.message
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleExportarXML = async () => {
    if (selectedNFes.length === 0) {
      toast.error('Selecione pelo menos uma NFe para exportar');
      return;
    }

    if (!token) {
      toast.error('Token não encontrado');
      return;
    }

    setIsDownloading(true);

    try {
      for (const nfeId of selectedNFes) {
        const response = await apiService.downloadXMLNFe(nfeId, token);
        
        // Criar e baixar arquivo
        const blob = new Blob([response.xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast.success(`${selectedNFes.length} XML(s) baixado(s) com sucesso!`);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      toast.error('Erro no download', {
        description: errorMessage
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEnviarEmail = () => {
    console.log('Enviando email para NFes:', selectedNFes);
    toast.info('Funcionalidade de envio por email em desenvolvimento');
  };

  const handleImprimir = () => {
    console.log('Imprimindo NFes:', selectedNFes);
    toast.info('Funcionalidade de impressão em desenvolvimento');
  };

  const handleSalvar = () => {
    console.log('Salvando NFes:', selectedNFes);
    toast.info('Funcionalidade de salvamento em desenvolvimento');
  };

  const handleRetorno = () => {
    console.log('Processando retorno para NFes:', selectedNFes);
    toast.info('Funcionalidade de retorno em desenvolvimento');
  };

  const handleExcluir = () => {
    console.log('Excluindo NFes:', selectedNFes);
    toast.info('Funcionalidade de exclusão em desenvolvimento');
  };



  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notas Fiscais Eletrônicas</h1>
              <p className="text-gray-600">Gerencie suas notas fiscais eletrônicas</p>
          </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="bg-white text-purple-700 hover:bg-purple-50 border-purple-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            <Button
              onClick={() => router.push('/nfe/nova')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
            <Plus className="w-4 h-4 mr-2" />
            Nova NFe
          </Button>
        </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{nfes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Autorizadas</p>
                <p className="text-2xl font-bold text-gray-900">{nfes.filter(n => n.status === 'AUTORIZADA').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-900">{nfes.filter(n => n.status === 'RASCUNHO').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejeitadas</p>
                <p className="text-2xl font-bold text-gray-900">{nfes.filter(n => n.status === 'REJEITADA').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(nfes.reduce((acc, n) => acc + n.valorTotalNota, 0))}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar NFes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusSefazFilter}
                  onChange={(e) => setStatusSefazFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="AUTORIZADA">Autorizada</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="REJEITADA">Rejeitada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>

                <select
                  value={modeloNfFilter}
                  onChange={(e) => setModeloNfFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="ALL">Todos os Modelos</option>
                  <option value="55">55 - NFe</option>
                  <option value="65">65 - NFCe</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <Checkbox 
                  id="dataInicial" 
                  checked={dataInicialEnabled}
                  onCheckedChange={(checked) => {
                    setDataInicialEnabled(checked as boolean);
                    if (checked) {
                      // Se habilitar, definir como ontem se não estiver definida
                      if (!dataInicial) {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        setDataInicial(formatDateForInput(yesterday));
                      }
                    }
                  }}
                  className=""
                />
                <Label htmlFor="dataInicial" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Data Inicial
                </Label>
                <Input
                  type="date"
                  value={dataInicial}
                  onChange={(e) => {
                    setDataInicial(e.target.value);
                    // Validar se data inicial não é maior que data final
                    if (dataFinal && e.target.value > dataFinal) {
                      setDataFinal(e.target.value);
                    }
                  }}
                  disabled={!dataInicialEnabled}
                  className={`w-36 transition-all duration-200 ${
                    dataInicialEnabled 
                      ? 'bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500' 
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                  }`}
                  max={dataFinal || undefined}
                />
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <Checkbox 
                  id="dataFinal" 
                  checked={dataFinalEnabled}
                  onCheckedChange={(checked) => {
                    setDataFinalEnabled(checked as boolean);
                    if (checked) {
                      // Se habilitar, definir como hoje se não estiver definida
                      if (!dataFinal) {
                        setDataFinal(formatDateForInput(new Date()));
                      }
                    }
                  }}
                  className=""
                />
                <Label htmlFor="dataFinal" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Data Final
                </Label>
                <Input
                  type="date"
                  value={dataFinal}
                  onChange={(e) => {
                    setDataFinal(e.target.value);
                    // Validar se data final não é menor que data inicial
                    if (dataInicial && e.target.value < dataInicial) {
                      setDataInicial(e.target.value);
                    }
                  }}
                  disabled={!dataFinalEnabled}
                  className={`w-36 transition-all duration-200 ${
                    dataFinalEnabled 
                      ? 'bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500' 
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                  }`}
                  min={dataInicial || undefined}
                  max={formatDateForInput(new Date())}
                />
              </div>
              
              {/* Botão para resetar filtros de data */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  setDataInicial(formatDateForInput(yesterday));
                  setDataFinal(formatDateForInput(today));
                  setDataInicialEnabled(true);
                  setDataFinalEnabled(true);
                }}
                className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Resetar
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12"
          >
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-2">Carregando NFes...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12"
          >
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </motion.div>
        ) : filteredNFes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12"
          >
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma NFe encontrada</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusSefazFilter !== 'ALL' ? 'Tente ajustar os filtros de busca.' : 'Comece criando sua primeira NFe.'}
              </p>
              {!searchTerm && statusSefazFilter === 'ALL' && (
                <Button onClick={() => setShowNewNFeDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova NFe
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Checkbox 
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mod
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Série
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Emissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saída
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CNPJ/CPF
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UF
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Integração
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNFes.map((nfe, index) => {
                    const status = getStatusConfig(nfe.status);
                    const StatusIcon = status.icon;
                    const isSelected = selectedNFes.includes(nfe.id);
                    
                    return (
                      <motion.tr
                        key={nfe.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectNFe(nfe.id, checked as boolean)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {nfe.modelo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {nfe.tipoOperacao}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {nfe.serie}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">#{nfe.numeroNfe}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {nfe.numeroPedido}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(nfe.dataEmissao)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {nfe.dataSaida ? formatDate(nfe.dataSaida) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {nfe.destinatarioCnpjCpf}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {nfe.destinatarioUF}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-48" title={nfe.destinatarioRazaoSocial}>
                            {nfe.destinatarioRazaoSocial}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(nfe.valorTotalNota)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {(nfe.status === 'PENDENTE' || nfe.status === 'AUTORIZADA') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => sincronizarNFe(nfe.id)}
                                className="h-7 px-2 text-xs"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Sincronizar
                              </Button>
                            )}
                            {nfe.chaveAcesso && (
                              <span className="text-xs text-gray-500">
                                Integrada
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4" />
                            </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Ações em Lote */}
        {selectedNFes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Ações em Lote</h3>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                {selectedNFes.length} NFe(s) selecionada(s)
              </div>
            </div>

            {/* Primeira linha - Ações principais */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              <Button 
                onClick={handleTransmitirNFe}
                disabled={isTransmitting || selectedNFes.length === 0}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTransmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Transmitindo...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Transmitir NF-e
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCopiarNFe} className="border-gray-200 hover:bg-gray-50">
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancelarNFe} 
                disabled={isCanceling || selectedNFes.length === 0}
                className="border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCanceling ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4 mr-2" />
                    Cancelar/Inutilizar
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleValidarXML} 
                disabled={isValidating || selectedNFes.length === 0}
                className="border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Validar XML
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportarXML} 
                disabled={isDownloading || selectedNFes.length === 0}
                className="border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Baixando...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Exportar XML
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRetorno}
                disabled={selectedNFes.length === 0}
                className="border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retorno
              </Button>
            </div>

            {/* Segunda linha - Ações secundárias */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Button 
                variant="outline" 
                disabled={selectedNFes.length === 0}
                className="border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Carta de Correção
              </Button>
              <Button 
                variant="outline" 
                disabled={selectedNFes.length === 0}
                className="border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4 mr-2" />
                Origem
              </Button>
              <Button 
                variant="outline" 
                onClick={handleEnviarEmail}
                disabled={selectedNFes.length === 0}
                className="border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar por Email
              </Button>
              <Button 
                variant="outline" 
                onClick={handleImprimir}
                disabled={selectedNFes.length === 0}
                className="border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSalvar}
                disabled={selectedNFes.length === 0}
                className="border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExcluir}
                disabled={selectedNFes.length === 0}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>

            {processStatus && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-4">
                  <Progress value={processStatus} className="flex-1 max-w-xs" />
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <FileIcon className="w-4 h-4" />
                    <span className="font-medium">{processMessage}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Dialog para Nova NFe */}
        <Dialog open={showNewNFeDialog} onOpenChange={setShowNewNFeDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Nota Fiscal Eletrônica</DialogTitle>
              <DialogDescription>
                Preencha os dados da NFe e adicione os itens
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Dados da NFe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="naturezaOperacao">Natureza da Operação *</Label>
                  <Input
                    id="naturezaOperacao"
                    value={newNFe.naturezaOperacao}
                    onChange={(e) => setNewNFe(prev => ({ ...prev, naturezaOperacao: e.target.value }))}
                    placeholder="Ex: Venda"
                  />
                </div>
                <div>
                  <Label htmlFor="destinatarioCnpj">CNPJ do Destinatário *</Label>
                  <Input
                    id="destinatarioCnpj"
                    value={newNFe.destinatarioCnpj}
                    onChange={(e) => setNewNFe(prev => ({ ...prev, destinatarioCnpj: e.target.value }))}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="destinatarioNome">Nome do Destinatário *</Label>
                  <Input
                    id="destinatarioNome"
                    value={newNFe.destinatarioNome}
                    onChange={(e) => setNewNFe(prev => ({ ...prev, destinatarioNome: e.target.value }))}
                    placeholder="Nome da empresa destinatária"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={newNFe.observacoes}
                    onChange={(e) => setNewNFe(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações adicionais"
                    rows={3}
                  />
                </div>
              </div>

              {/* Adicionar Item */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Adicionar Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="codigoProduto">Código do Produto *</Label>
                    <Input
                      id="codigoProduto"
                      value={newItem.codigoProduto}
                      onChange={(e) => setNewItem(prev => ({ ...prev, codigoProduto: e.target.value }))}
                      placeholder="PROD001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ncm">NCM</Label>
                    <Input
                      id="ncm"
                      value={newItem.ncm}
                      onChange={(e) => setNewItem(prev => ({ ...prev, ncm: e.target.value }))}
                      placeholder="12345678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cfop">CFOP</Label>
                    <Input
                      id="cfop"
                      value={newItem.cfop}
                      onChange={(e) => setNewItem(prev => ({ ...prev, cfop: e.target.value }))}
                      placeholder="5102"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Input
                      id="descricao"
                      value={newItem.descricao}
                      onChange={(e) => setNewItem(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição do produto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unidadeComercial">Unidade</Label>
                    <Input
                      id="unidadeComercial"
                      value={newItem.unidadeComercial}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unidadeComercial: e.target.value }))}
                      placeholder="UN"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantidade">Quantidade *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      step="0.001"
                      value={newItem.quantidade}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantidade: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="valorUnitario">Valor Unitário *</Label>
                    <Input
                      id="valorUnitario"
                      type="number"
                      step="0.01"
                      value={newItem.valorUnitario}
                      onChange={(e) => setNewItem(prev => ({ ...prev, valorUnitario: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Button onClick={handleAddItem} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lista de Itens */}
              {newNFe.itens.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Itens da NFe</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Valor Unit.</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newNFe.itens.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.codigoProduto}</TableCell>
                          <TableCell>{item.descricao}</TableCell>
                          <TableCell>{item.quantidade}</TableCell>
                          <TableCell>{formatCurrency(item.valorUnitario)}</TableCell>
                          <TableCell>{formatCurrency(item.valorTotal)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-4 text-right">
                    <div className="text-lg font-medium">
                      Total: {formatCurrency(newNFe.itens.reduce((sum, item) => sum + item.valorTotal, 0))}
                    </div>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end space-x-2 pt-6 border-t">
                <Button variant="outline" onClick={() => setShowNewNFeDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEmitirNFe} disabled={loading}>
                  {loading ? 'Emitindo...' : 'Emitir NFe'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
