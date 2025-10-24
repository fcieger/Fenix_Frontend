'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, Save, FileText, Settings, 
  Building2, Calendar, Clock, Info, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { apiService, ConfiguracaoNfeResponse } from '@/lib/api';

// Componente que usa useSearchParams
function NovaConfiguracaoNfeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, activeCompanyId, isAuthenticated, isLoading } = useAuth();
  
  // Detectar se está em modo de edição
  const configId = searchParams.get('id');
  const isEditMode = !!configId;
  
  // Estados para configuração do modelo
  const [descricaoModelo, setDescricaoModelo] = useState('');
  const [tipoModelo, setTipoModelo] = useState('');
  const [modelo, setModelo] = useState('');
  const [serie, setSerie] = useState('');
  const [numeroAtual, setNumeroAtual] = useState('');
  const [ambiente, setAmbiente] = useState('PRODUCAO');
  
  // Estados para RPS
  const [naturezaOperacao, setNaturezaOperacao] = useState('1');
  const [regimeTributario, setRegimeTributario] = useState('1');
  const [regimeEspecialTributacao, setRegimeEspecialTributacao] = useState('1');
  const [numeroLoteAtual, setNumeroLoteAtual] = useState('0');
  const [serieLoteAtual, setSerieLoteAtual] = useState('0');
  const [loginPrefeitura, setLoginPrefeitura] = useState('');
  const [senhaPrefeitura, setSenhaPrefeitura] = useState('');
  const [mostrarSenhaPrefeitura, setMostrarSenhaPrefeitura] = useState(false);
  const [aliquotaISS, setAliquotaISS] = useState('0');
  const [enviarNotificacaoCliente, setEnviarNotificacaoCliente] = useState(false);
  const [receberNotificacao, setReceberNotificacao] = useState(false);
  const [emailNotificacao, setEmailNotificacao] = useState('');
  
  // Estados para NFC-e
  const [idToken, setIdToken] = useState('');
  const [cscToken, setCscToken] = useState('');
  const [mostrarCscToken, setMostrarCscToken] = useState(false);
  
  // Estados gerais
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('rps');
  const [configuracaoExistente, setConfiguracaoExistente] = useState<ConfiguracaoNfeResponse | null>(null);

  const tiposModelo = [
    { value: 'nfe-produto', label: 'NF-e Produto' },
    { value: 'nfse-servico', label: 'NFS-e Serviço' },
    { value: 'nf-entrada', label: 'NF Entrada' },
    { value: 'nfce-consumidor', label: 'NFC-e Consumidor' },
    { value: 'mdfe', label: 'MDF-e' }
  ];

  const naturezasOperacao = [
    { value: '1', label: '1 - Tributação no município' },
    { value: '2', label: '2 - Tributação fora do município' },
    { value: '3', label: '3 - Isenção' },
    { value: '4', label: '4 - Imune' },
    { value: '5', label: '5 - Exigibilidade suspensa por decisão judicial' },
    { value: '6', label: '6 - Exigibilidade suspensa por procedimento administrativo' }
  ];

  const regimesTributarios = [
    { value: '1', label: '1 - Optante pelo Simples Nacional' },
    { value: '2', label: '2 - Regime Normal' },
    { value: '3', label: '3 - Regime Diferenciado' }
  ];

  const regimesEspeciaisTributacao = [
    { value: '1', label: '1 - Micro empresa' },
    { value: '2', label: '2 - Empresa de pequeno porte' },
    { value: '3', label: '3 - Demais' }
  ];

  // Carregar dados existentes quando estiver em modo de edição
  useEffect(() => {
    const carregarConfiguracao = async () => {
      if (!isEditMode || !configId || !token) return;

      try {
        setCarregando(true);
        setErro(null);
        
        const config = await apiService.getConfiguracaoNfe(configId, token);
        setConfiguracaoExistente(config);
        
        // Preencher os campos com os dados existentes
        setDescricaoModelo(config.descricaoModelo);
        setTipoModelo(config.tipoModelo);
        setModelo(config.modelo);
        setSerie(config.serie);
        setNumeroAtual(config.numeroAtual.toString());
        setAmbiente(config.ambiente);
        
        // Campos RPS
        setNaturezaOperacao(config.rpsNaturezaOperacao || '1');
        setRegimeTributario(config.rpsRegimeTributario || '1');
        setRegimeEspecialTributacao(config.rpsRegimeEspecialTributacao || '1');
        setNumeroLoteAtual(config.rpsNumeroLoteAtual.toString());
        setSerieLoteAtual(config.rpsSerieLoteAtual.toString());
        setLoginPrefeitura(config.rpsLoginPrefeitura || '');
        setAliquotaISS(config.rpsAliquotaISS || '0');
        setEnviarNotificacaoCliente(config.rpsEnviarNotificacaoCliente);
        setReceberNotificacao(config.rpsReceberNotificacao);
        setEmailNotificacao(config.rpsEmailNotificacao || '');
        
        // Campos NFC-e
        setIdToken(config.nfceIdToken || '');
        
        console.log('✅ Configuração carregada para edição:', config);
      } catch (error) {
        console.error('❌ Erro ao carregar configuração:', error);
        setErro('Erro ao carregar configuração para edição.');
      } finally {
        setCarregando(false);
      }
    };

    carregarConfiguracao();
  }, [isEditMode, configId, token]);

  const handleSalvar = async () => {
    setSalvando(true);
    setErro(null);

    try {
      // Verificar se está autenticado
      if (!isAuthenticated || !token) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      // Validações básicas
      if (!descricaoModelo || !tipoModelo || !modelo || !serie) {
        throw new Error('Preencha todos os campos obrigatórios.');
      }

      // Preparar dados para enviar ao backend
      const configuracaoData = {
        descricaoModelo,
        tipoModelo,
        modelo,
        serie,
        numeroAtual: parseInt(numeroAtual) || 0,
        ambiente,
        // Campos RPS
        rpsNaturezaOperacao: naturezaOperacao,
        rpsRegimeTributario: regimeTributario,
        rpsRegimeEspecialTributacao: regimeEspecialTributacao,
        rpsNumeroLoteAtual: parseInt(numeroLoteAtual) || 0,
        rpsSerieLoteAtual: parseInt(serieLoteAtual) || 0,
        rpsLoginPrefeitura: loginPrefeitura || undefined,
        rpsSenhaPrefeitura: senhaPrefeitura || undefined,
        rpsAliquotaISS: parseFloat(aliquotaISS) || 0,
        rpsEnviarNotificacaoCliente: enviarNotificacaoCliente,
        rpsReceberNotificacao: receberNotificacao,
        rpsEmailNotificacao: emailNotificacao || undefined,
        // Campos NFC-e
        nfceIdToken: idToken || undefined,
        nfceCscToken: cscToken || undefined,
      };

      console.log('🔄 Salvando configuração:', {
        isEditMode,
        configId,
        dataKeys: Object.keys(configuracaoData)
      });

      // Usar API service para criar ou atualizar
      if (isEditMode && configId) {
        await apiService.updateConfiguracaoNfe(configId, configuracaoData, token);
        console.log('✅ Configuração atualizada com sucesso');
      } else {
        await apiService.createConfiguracaoNfe(configuracaoData, token);
        console.log('✅ Configuração criada com sucesso');
      }

      // Sucesso - redirecionar para listagem
      router.push('/configuracoes/nfe');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao salvar configuração.');
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelar = () => {
    router.push('/configuracoes/nfe');
  };


  if (isLoading || carregando) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {carregando ? 'Carregando configuração...' : 'Carregando...'}
            </p>
          </div>
        </div>

        {/* Botões Flutuantes */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
          <Button
            onClick={handleCancelar}
            variant="outline"
            className="h-14 px-6 bg-white/95 backdrop-blur-sm border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={carregando}
            className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" />
            {isEditMode ? 'Atualizar Configuração' : 'Salvar Configuração'}
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="space-y-8 p-6">
          {/* Header Moderno */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 rounded-2xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="hover:bg-purple-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        {isEditMode ? 'Editar Configuração de NFe' : 'Nova Configuração de NFe'}
                      </h1>
                      <p className="text-gray-600 mt-2 text-lg">Configure os parâmetros para emissão de notas fiscais</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerta de erro moderno */}
          {erro && (
            <div className="relative">
              <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800 font-medium">{erro}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Configuração do Modelo - Modernizada */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5 rounded-3xl"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">Configuração do Modelo</CardTitle>
                    <CardDescription className="text-blue-100 text-lg mt-2">
                      Configure os parâmetros básicos do modelo de documento fiscal
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="descricaoModelo" className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                      Descrição Modelo *
                    </Label>
                    <Input
                      id="descricaoModelo"
                      value={descricaoModelo}
                      onChange={(e) => setDescricaoModelo(e.target.value)}
                      placeholder="Ex: Configuração Principal"
                      className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="tipoModelo" className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                      Tipo de modelo Documentos Fiscais *
                    </Label>
                    <Select value={tipoModelo} onValueChange={setTipoModelo}>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {tiposModelo.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value} className="rounded-lg">
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="modelo" className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                      Modelo *
                    </Label>
                    <Input
                      id="modelo"
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      placeholder="Ex: 55"
                      className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="serie" className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
                      Série *
                    </Label>
                    <Input
                      id="serie"
                      value={serie}
                      onChange={(e) => setSerie(e.target.value)}
                      placeholder="Ex: 1"
                      className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="numeroAtual" className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                      Número Atual
                    </Label>
                    <Input
                      id="numeroAtual"
                      value={numeroAtual}
                      onChange={(e) => setNumeroAtual(e.target.value)}
                      placeholder="Ex: 1"
                      className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="ambiente" className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                      Ambiente *
                    </Label>
                    <Select value={ambiente} onValueChange={setAmbiente}>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="HOMOLOGACAO" className="rounded-lg">Homologação</SelectItem>
                        <SelectItem value="PRODUCAO" className="rounded-lg">Produção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Abas RPS e NFC-e - Modernizadas */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 rounded-3xl"></div>
            <Card className="relative bg-white/95 backdrop-blur-sm shadow-2xl border border-gray-200 rounded-3xl overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-white">Configurações Específicas</CardTitle>
                      <CardDescription className="text-blue-100 text-lg mt-2">
                        Configure parâmetros específicos para RPS e NFC-e
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                {/* Abas separadas do header */}
                <div className="px-8 py-4 bg-white border-b border-gray-200">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent rounded-xl p-1">
                    <TabsTrigger 
                      value="rps" 
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 data-[state=inactive]:hover:bg-white/50 rounded-lg font-bold py-3 transition-all duration-200 text-base border border-gray-200 hover:border-gray-300"
                    >
                      RPS
                    </TabsTrigger>
                    <TabsTrigger 
                      value="nfce" 
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 data-[state=inactive]:hover:bg-white/50 rounded-lg font-bold py-3 transition-all duration-200 text-base border border-gray-200 hover:border-gray-300"
                    >
                      NFC-e
                    </TabsTrigger>
                  </TabsList>
                </div>

                <CardContent className="p-8">
                  {/* Aba RPS */}
                  <TabsContent value="rps" className="space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Configurações RPS</h3>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label htmlFor="naturezaOperacao" className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                            Natureza da operação *
                          </Label>
                          <Select value={naturezaOperacao} onValueChange={setNaturezaOperacao}>
                            <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {naturezasOperacao.map((natureza) => (
                                <SelectItem key={natureza.value} value={natureza.value} className="rounded-lg">
                                  {natureza.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="regimeTributario" className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                            Regime Tributário *
                          </Label>
                          <Select value={regimeTributario} onValueChange={setRegimeTributario}>
                            <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {regimesTributarios.map((regime) => (
                                <SelectItem key={regime.value} value={regime.value} className="rounded-lg">
                                  {regime.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="regimeEspecialTributacao" className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                            Regime Especial de Tributação *
                          </Label>
                          <Select value={regimeEspecialTributacao} onValueChange={setRegimeEspecialTributacao}>
                            <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {regimesEspeciaisTributacao.map((regime) => (
                                <SelectItem key={regime.value} value={regime.value} className="rounded-lg">
                                  {regime.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="numeroLoteAtual" className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
                            Número do Lote Atual
                          </Label>
                          <Input
                            id="numeroLoteAtual"
                            value={numeroLoteAtual}
                            onChange={(e) => setNumeroLoteAtual(e.target.value)}
                            placeholder="0"
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="serieLoteAtual" className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                            Série do Lote Atual
                          </Label>
                          <Input
                            id="serieLoteAtual"
                            value={serieLoteAtual}
                            onChange={(e) => setSerieLoteAtual(e.target.value)}
                            placeholder="0"
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="loginPrefeitura" className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                            Login da Prefeitura
                          </Label>
                          <Input
                            id="loginPrefeitura"
                            value={loginPrefeitura}
                            onChange={(e) => setLoginPrefeitura(e.target.value)}
                            placeholder="Digite o login"
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="senhaPrefeitura" className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-pink-600 rounded-full mr-2"></span>
                            Senha da Prefeitura
                          </Label>
                          <div className="flex space-x-2">
                            <Input
                              id="senhaPrefeitura"
                              type={mostrarSenhaPrefeitura ? "text" : "password"}
                              value={senhaPrefeitura}
                              onChange={(e) => setSenhaPrefeitura(e.target.value)}
                              placeholder="Digite a senha"
                              className="flex-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setMostrarSenhaPrefeitura(!mostrarSenhaPrefeitura)}
                              className="h-12 px-4 hover:bg-blue-50 border-gray-300 rounded-xl"
                            >
                              {mostrarSenhaPrefeitura ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="aliquotaISS" className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></span>
                            Alíquota ISS
                          </Label>
                          <Input
                            id="aliquotaISS"
                            value={aliquotaISS}
                            onChange={(e) => setAliquotaISS(e.target.value)}
                            placeholder="0"
                            className="w-32 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="enviarNotificacaoCliente"
                                checked={enviarNotificacaoCliente}
                                onChange={(e) => setEnviarNotificacaoCliente(e.target.checked)}
                                className="rounded border-gray-300 focus:ring-blue-500"
                              />
                              <Label htmlFor="enviarNotificacaoCliente" className="text-sm font-medium">
                                Enviar Notificação para o cliente
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="receberNotificacao"
                                checked={receberNotificacao}
                                onChange={(e) => setReceberNotificacao(e.target.checked)}
                                className="rounded border-gray-300 focus:ring-blue-500"
                              />
                              <Label htmlFor="receberNotificacao" className="text-sm font-semibold text-gray-700">
                                Receber Notificação
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="emailNotificacao" className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-teal-600 rounded-full mr-2"></span>
                            Email
                          </Label>
                          <Input
                            id="emailNotificacao"
                            value={emailNotificacao}
                            onChange={(e) => setEmailNotificacao(e.target.value)}
                            placeholder="email@exemplo.com"
                            type="email"
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          />
                        </div>
                      </div>

                    </div>
                  </TabsContent>

                  {/* Aba NFC-e Modernizada */}
                  <TabsContent value="nfce" className="space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Configurações NFC-e</h3>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label htmlFor="idToken" className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                            ID Token *
                          </Label>
                          <Input
                            id="idToken"
                            value={idToken}
                            onChange={(e) => setIdToken(e.target.value)}
                            placeholder="Digite o ID do Token"
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="cscToken" className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                            CSC do Token *
                          </Label>
                          <div className="flex space-x-2">
                            <Input
                              id="cscToken"
                              type={mostrarCscToken ? "text" : "password"}
                              value={cscToken}
                              onChange={(e) => setCscToken(e.target.value)}
                              placeholder="Digite o CSC do Token"
                              className="flex-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setMostrarCscToken(!mostrarCscToken)}
                              className="h-12 px-4 hover:bg-blue-50 border-gray-300 rounded-xl"
                            >
                              {mostrarCscToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Informações sobre Token */}
                      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Info className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-2">Informações sobre Token NFC-e</h4>
                            <p className="text-blue-800 text-sm leading-relaxed">
                              O ID Token e CSC (Código de Segurança do Contribuinte) são fornecidos pela SEFAZ 
                              para autenticação na emissão de NFC-e. Estes dados são obrigatórios para o 
                              funcionamento correto da emissão de notas fiscais de consumidor.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
          </div>
        </div>

        {/* Botões Flutuantes */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
          <Button
            onClick={handleCancelar}
            variant="outline"
            className="h-14 px-6 bg-white/95 backdrop-blur-sm border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={handleSalvar}
            className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl font-bold text-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {isEditMode ? 'Atualizar Configuração' : 'Salvar Configuração'}
          </Button>
        </div>
      </Layout>
    );
  }

// Componente principal com Suspense
export default function NovaConfiguracaoNFEPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </Layout>
    }>
      <NovaConfiguracaoNfeForm />
    </Suspense>
  );
}
