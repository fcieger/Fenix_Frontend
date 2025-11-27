'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, Save, FileText, Settings, 
  Info, Eye, EyeOff, AlertCircle, Loader2, XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useFeedback } from '@/contexts/feedback-context';
import { apiService, ConfiguracaoNfeResponse } from '@/lib/api';

// Componente que usa useSearchParams
function NovaConfiguracaoNfeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, activeCompanyId, isAuthenticated, isLoading } = useAuth();
  const { openSuccess } = useFeedback();
  
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
        
        openSuccess({
          title: 'Configuração atualizada!',
          message: 'A configuração foi atualizada com sucesso.'
        });
      } else {
        await apiService.createConfiguracaoNfe(configuracaoData, token);
        console.log('✅ Configuração criada com sucesso');
        
        openSuccess({
          title: 'Configuração criada!',
          message: 'A configuração foi criada com sucesso.'
        });
      }

      // Sucesso - redirecionar para listagem
      router.push('/settings/nfe');
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao salvar configuração.');
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelar = () => {
    router.push('/settings/nfe');
  };


  if (isLoading || carregando) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <p className="text-purple-600 font-medium">
              {carregando ? 'Carregando configuração...' : 'Carregando...'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header moderno */}
        <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 text-white shadow-lg rounded-2xl">
          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
                    <Settings className="w-8 h-8 mr-3" />
                    {isEditMode ? 'Editar Configuração de NFe' : 'Nova Configuração de NFe'}
                  </h1>
                  <p className="text-purple-100 mt-1 text-sm sm:text-base">Configure os parâmetros para emissão de notas fiscais</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleCancelar}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSalvar}
                  disabled={salvando}
                  className="bg-white text-purple-700 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {isEditMode ? 'Atualizar' : 'Salvar'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {erro && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{erro}</p>
            </div>
          </div>
        )}

        {/* Configuração do Modelo */}
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Configuração do Modelo</h2>
                <p className="text-purple-100 text-sm mt-1">
                  Configure os parâmetros básicos do modelo de documento fiscal
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="descricaoModelo" className="text-sm font-semibold text-gray-700">
                  Descrição Modelo *
                </Label>
                <Input
                  id="descricaoModelo"
                  value={descricaoModelo}
                  onChange={(e) => setDescricaoModelo(e.target.value)}
                  placeholder="Ex: Configuração Principal"
                  className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoModelo" className="text-sm font-semibold text-gray-700">
                  Tipo de modelo Documentos Fiscais *
                </Label>
                <Select value={tipoModelo} onValueChange={setTipoModelo}>
                  <SelectTrigger className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {tiposModelo.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo" className="text-sm font-semibold text-gray-700">
                  Modelo *
                </Label>
                <Input
                  id="modelo"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Ex: 55"
                  className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serie" className="text-sm font-semibold text-gray-700">
                  Série *
                </Label>
                <Input
                  id="serie"
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  placeholder="Ex: 1"
                  className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroAtual" className="text-sm font-semibold text-gray-700">
                  Número Atual
                </Label>
                <Input
                  id="numeroAtual"
                  value={numeroAtual}
                  onChange={(e) => setNumeroAtual(e.target.value)}
                  placeholder="Ex: 1"
                  className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ambiente" className="text-sm font-semibold text-gray-700">
                  Ambiente *
                </Label>
                <Select value={ambiente} onValueChange={setAmbiente}>
                  <SelectTrigger className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="HOMOLOGACAO">Homologação</SelectItem>
                    <SelectItem value="PRODUCAO">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Abas RPS e NFC-e */}
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Configurações Específicas</h2>
                <p className="text-purple-100 text-sm mt-1">
                  Configure parâmetros específicos para RPS e NFC-e
                </p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6 pt-4 border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
                <TabsTrigger 
                  value="rps" 
                  className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm rounded-md font-semibold py-2 transition-all duration-200"
                >
                  RPS
                </TabsTrigger>
                <TabsTrigger 
                  value="nfce" 
                  className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm rounded-md font-semibold py-2 transition-all duration-200"
                >
                  NFC-e
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* Aba RPS */}
              <TabsContent value="rps" className="space-y-6 mt-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Configurações RPS</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="naturezaOperacao" className="text-sm font-semibold text-gray-700">
                      Natureza da operação *
                    </Label>
                    <Select value={naturezaOperacao} onValueChange={setNaturezaOperacao}>
                      <SelectTrigger className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        {naturezasOperacao.map((natureza) => (
                          <SelectItem key={natureza.value} value={natureza.value}>
                            {natureza.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regimeTributario" className="text-sm font-semibold text-gray-700">
                      Regime Tributário *
                    </Label>
                    <Select value={regimeTributario} onValueChange={setRegimeTributario}>
                      <SelectTrigger className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        {regimesTributarios.map((regime) => (
                          <SelectItem key={regime.value} value={regime.value}>
                            {regime.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regimeEspecialTributacao" className="text-sm font-semibold text-gray-700">
                      Regime Especial de Tributação *
                    </Label>
                    <Select value={regimeEspecialTributacao} onValueChange={setRegimeEspecialTributacao}>
                      <SelectTrigger className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        {regimesEspeciaisTributacao.map((regime) => (
                          <SelectItem key={regime.value} value={regime.value}>
                            {regime.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroLoteAtual" className="text-sm font-semibold text-gray-700">
                      Número do Lote Atual
                    </Label>
                    <Input
                      id="numeroLoteAtual"
                      value={numeroLoteAtual}
                      onChange={(e) => setNumeroLoteAtual(e.target.value)}
                      placeholder="0"
                      className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serieLoteAtual" className="text-sm font-semibold text-gray-700">
                      Série do Lote Atual
                    </Label>
                    <Input
                      id="serieLoteAtual"
                      value={serieLoteAtual}
                      onChange={(e) => setSerieLoteAtual(e.target.value)}
                      placeholder="0"
                      className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginPrefeitura" className="text-sm font-semibold text-gray-700">
                      Login da Prefeitura
                    </Label>
                    <Input
                      id="loginPrefeitura"
                      value={loginPrefeitura}
                      onChange={(e) => setLoginPrefeitura(e.target.value)}
                      placeholder="Digite o login"
                      className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senhaPrefeitura" className="text-sm font-semibold text-gray-700">
                      Senha da Prefeitura
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="senhaPrefeitura"
                        type={mostrarSenhaPrefeitura ? "text" : "password"}
                        value={senhaPrefeitura}
                        onChange={(e) => setSenhaPrefeitura(e.target.value)}
                        placeholder="Digite a senha"
                        className="flex-1 h-11 border-gray-300 focus:ring-purple-500 rounded-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMostrarSenhaPrefeitura(!mostrarSenhaPrefeitura)}
                        className="h-11 px-4 hover:bg-purple-50 border-gray-300 rounded-lg"
                      >
                        {mostrarSenhaPrefeitura ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aliquotaISS" className="text-sm font-semibold text-gray-700">
                      Alíquota ISS
                    </Label>
                    <Input
                      id="aliquotaISS"
                      value={aliquotaISS}
                      onChange={(e) => setAliquotaISS(e.target.value)}
                      placeholder="0"
                      className="w-32 h-11 border-gray-300 focus:ring-purple-500 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Notificações</Label>
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="enviarNotificacaoCliente"
                          checked={enviarNotificacaoCliente}
                          onCheckedChange={(checked) => setEnviarNotificacaoCliente(checked === true)}
                        />
                        <Label htmlFor="enviarNotificacaoCliente" className="text-sm font-medium cursor-pointer">
                          Enviar Notificação para o cliente
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="receberNotificacao"
                          checked={receberNotificacao}
                          onCheckedChange={(checked) => setReceberNotificacao(checked === true)}
                        />
                        <Label htmlFor="receberNotificacao" className="text-sm font-medium cursor-pointer">
                          Receber Notificação
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailNotificacao" className="text-sm font-semibold text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="emailNotificacao"
                      value={emailNotificacao}
                      onChange={(e) => setEmailNotificacao(e.target.value)}
                      placeholder="email@exemplo.com"
                      type="email"
                      className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Aba NFC-e */}
              <TabsContent value="nfce" className="space-y-6 mt-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Configurações NFC-e</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="idToken" className="text-sm font-semibold text-gray-700">
                      ID Token *
                    </Label>
                    <Input
                      id="idToken"
                      value={idToken}
                      onChange={(e) => setIdToken(e.target.value)}
                      placeholder="Digite o ID do Token"
                      className="h-11 border-gray-300 focus:ring-purple-500 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cscToken" className="text-sm font-semibold text-gray-700">
                      CSC do Token *
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="cscToken"
                        type={mostrarCscToken ? "text" : "password"}
                        value={cscToken}
                        onChange={(e) => setCscToken(e.target.value)}
                        placeholder="Digite o CSC do Token"
                        className="flex-1 h-11 border-gray-300 focus:ring-purple-500 rounded-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMostrarCscToken(!mostrarCscToken)}
                        className="h-11 px-4 hover:bg-purple-50 border-gray-300 rounded-lg"
                      >
                        {mostrarCscToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Informações sobre Token */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Info className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Informações sobre Token NFC-e</h4>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        O ID Token e CSC (Código de Segurança do Contribuinte) são fornecidos pela SEFAZ 
                        para autenticação na emissão de NFC-e. Estes dados são obrigatórios para o 
                        funcionamento correto da emissão de notas fiscais de consumidor.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
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
