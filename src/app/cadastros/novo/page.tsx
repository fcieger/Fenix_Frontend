'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiService, CadastroData } from '@/lib/api';
import { makeCnpjRequest, extractCompanyData, CnpjResponse } from '@/lib/cnpj-api';
import { consultarCep, formatCep, ViaCepResponse } from '@/lib/viacep-api';
import { 
  X, 
  User, 
  ChevronDown, 
  MessageSquare, 
  MapPin, 
  FileText,
  Check,
  Info,
  Plus,
  Phone,
  Mail,
  Building,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import CadastrosAIAssistant from '@/components/CadastrosAIAssistant';

// Componente que usa useSearchParams
function NovoClienteForm() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading, activeCompanyId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchingCnpj, setSearchingCnpj] = useState(false);
  const [cnpjData, setCnpjData] = useState<any>(null);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [searchingCep, setSearchingCep] = useState<{[key: number]: boolean}>({});
  const [cepError, setCepError] = useState<{[key: number]: string}>({});
  const [contactCount, setContactCount] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  
  // TODOS OS HOOKS DEVEM VIR ANTES DE QUALQUER RETURN CONDICIONAL
  const [formData, setFormData] = useState({
    // Dados Gerais
    nomeRazaoSocial: '',
    tipoPessoa: 'Pessoa Física',
    cpf: '',
    cnpj: '',
    nomeFantasia: '',
    tiposCliente: {
      cliente: false,
      vendedor: false,
      fornecedor: false,
      funcionario: false,
      transportadora: false,
      prestadorServico: false
    },
    // Contato
    email: '',
    contatos: [{
    email: '',
    pessoaContato: '',
    telefoneComercial: '',
    celular: '',
    cargo: '',
    celularContato: '',
      principal: true
    }] as Array<{
      email: string;
      pessoaContato: string;
      telefoneComercial: string;
      celular: string;
      cargo: string;
      celularContato: string;
      principal: boolean;
    }>,
    // Tributário
    optanteSimples: false,
    orgaoPublico: false,
    ie: '',
    im: '',
    suframa: '',
    // Endereço
    enderecos: [{
      tipo: 'Comercial',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      principal: true
    }] as Array<{
      tipo: string;
      logradouro: string;
      numero: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
      principal: boolean;
    }>,
    // Observações
    observacoes: ''
  });

  // Funções devem vir antes dos useEffect
  const searchCnpj = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) {
      setCnpjData(null);
      setCnpjError(null);
      return;
    }

    try {
      setSearchingCnpj(true);
      setCnpjError(null);
      
      const response = await makeCnpjRequest<CnpjResponse>(cnpj);
      
      if (response) {
        const companyData = extractCompanyData(response);
        setCnpjData(companyData);
        
        // Preencher automaticamente os campos do formulário
        setFormData(prev => ({
          ...prev,
          nomeRazaoSocial: companyData.name,
          nomeFantasia: companyData.name,
          cnpj: cnpj,
          email: companyData.emails[0]?.address || '',
          telefoneComercial: companyData.phones.find(p => p.type === 'LANDLINE')?.number || '',
          celular: companyData.phones.find(p => p.type === 'MOBILE')?.number || '',
          ie: '', // IE não vem da API CNPJ
          im: '', // IM não vem da API CNPJ
          optanteSimples: response.company.simples.optant,
          enderecos: [{
            tipo: 'Comercial',
            logradouro: companyData.address.street,
            numero: companyData.address.number,
            bairro: companyData.address.district,
            cidade: companyData.address.city,
            estado: companyData.address.state,
            cep: companyData.address.zip,
            principal: true
          }]
        }));
      } else {
        setCnpjError('CNPJ não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      setCnpjError('Erro ao consultar CNPJ');
    } finally {
      setSearchingCnpj(false);
    }
  };

  // Verificar autenticação - DEVE VIR DEPOIS DE TODOS OS HOOKS
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Buscar CNPJ automaticamente quando o usuário digitar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.cnpj && formData.tipoPessoa === 'Pessoa Jurídica') {
        searchCnpj(formData.cnpj);
      }
    }, 1000); // Debounce de 1 segundo

    return () => clearTimeout(timeoutId);
  }, [formData.cnpj, formData.tipoPessoa]);

  // Detectar modo de edição e preencher dados
  useEffect(() => {
    const editParam = searchParams.get('edit');
    const idParam = searchParams.get('id');
    const dataParam = searchParams.get('data');
    const returnUrl = searchParams.get('returnUrl');
    
    if (editParam === 'true' && idParam && dataParam) {
      try {
        const cadastroData = JSON.parse(dataParam);
        setIsEditMode(true);
        setEditId(idParam);
        
        // Preencher os dados do formulário
        setFormData({
          nomeRazaoSocial: cadastroData.nomeRazaoSocial || '',
          nomeFantasia: cadastroData.nomeFantasia || '',
          tipoPessoa: cadastroData.tipoPessoa || 'Pessoa Física',
          cpf: cadastroData.cpf || '',
          cnpj: cadastroData.cnpj || '',
          tiposCliente: cadastroData.tiposCliente || {
            cliente: false,
            vendedor: false,
            fornecedor: false,
            funcionario: false,
            transportadora: false,
            prestadorServico: false
          },
          email: cadastroData.email || '',
          contatos: cadastroData.contatos || [{
            email: cadastroData.email || '',
            pessoaContato: cadastroData.pessoaContato || '',
            telefoneComercial: cadastroData.telefoneComercial || '',
            celular: cadastroData.celular || '',
            cargo: cadastroData.cargo || '',
            celularContato: cadastroData.celularContato || '',
            principal: true
          }],
          optanteSimples: cadastroData.optanteSimples || false,
          orgaoPublico: cadastroData.orgaoPublico || false,
          ie: cadastroData.ie || '',
          im: cadastroData.im || '',
          suframa: cadastroData.suframa || '',
          enderecos: cadastroData.enderecos || [{
            tipo: 'Comercial',
            logradouro: '',
            numero: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
            principal: true
          }],
          observacoes: cadastroData.observacoes || ''
        });
        
        // Atualizar contador de contatos
        if (cadastroData.contatos && cadastroData.contatos.length > 1) {
          setContactCount(cadastroData.contatos.length);
        }
      } catch (error) {
        console.error('Erro ao parsear dados de edição:', error);
        setError('Erro ao carregar dados para edição');
      }
    }
  }, [searchParams]);

  // RETURNS CONDICIONAIS DEVEM VIR DEPOIS DE TODOS OS HOOKS
  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, não renderizar nada (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTipoClienteChange = (tipo: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tiposCliente: {
        ...prev.tiposCliente,
        [tipo]: checked
      }
    }));
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const formatIE = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1.$2.$3.$4');
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  // Função para aplicar dados gerados pela IA
  const handleAIGenerateData = (data: any) => {
    setFormData(prev => ({
      ...prev,
      nomeRazaoSocial: data.nomeRazaoSocial || prev.nomeRazaoSocial,
      tipoPessoa: data.tipoPessoa || prev.tipoPessoa,
      nomeFantasia: data.nomeFantasia || prev.nomeFantasia,
      email: data.email || prev.email,
      contatos: [{
        email: data.email || prev.email,
        pessoaContato: data.pessoaContato || '',
        telefoneComercial: data.telefoneComercial || '',
        celular: data.celular || '',
        cargo: data.cargo || '',
        celularContato: data.celularContato || '',
        principal: true
      }],
      tiposCliente: {
        ...prev.tiposCliente,
        ...data.tiposCliente
      }
    }));
  };

  // Funções para adicionar contatos e endereços
  const addContact = () => {
    const novoContato = {
      email: '',
      pessoaContato: '',
      telefoneComercial: '',
      celular: '',
      cargo: '',
      celularContato: '',
      principal: false
    };
    setFormData(prev => ({
      ...prev,
      contatos: [...prev.contatos, novoContato]
    }));
    setContactCount(prev => prev + 1);
    console.log(`Adicionando contato ${contactCount + 1}`);
  };

  const addEndereco = () => {
    const novoEndereco = {
      tipo: 'Comercial',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      principal: formData.enderecos.length === 0 // Primeiro endereço é principal
    };
    
    setFormData(prev => ({
      ...prev,
      enderecos: [...prev.enderecos, novoEndereco]
    }));
  };

  const removeEndereco = (index: number) => {
    setFormData(prev => ({
      ...prev,
      enderecos: prev.enderecos.filter((_, i) => i !== index)
    }));
  };

  const updateEndereco = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      enderecos: prev.enderecos.map((endereco, i) => 
        i === index ? { ...endereco, [field]: value } : endereco
      )
    }));
  };

  const removeContato = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contatos: prev.contatos.filter((_, i) => i !== index)
    }));
    setContactCount(prev => Math.max(1, prev - 1));
  };

  const updateContato = (index: number, field: string, value: string) => {
        setFormData(prev => ({
          ...prev,
      contatos: prev.contatos.map((contato, i) => 
        i === index ? { ...contato, [field]: value } : contato
      )
    }));
  };

  const searchCep = async (cep: string, enderecoIndex: number) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      setCepError(prev => ({ ...prev, [enderecoIndex]: '' }));
      return;
    }

    try {
      setSearchingCep(prev => ({ ...prev, [enderecoIndex]: true }));
      setCepError(prev => ({ ...prev, [enderecoIndex]: '' }));
      
      const cepData = await consultarCep(cleanCep);
      
      if (cepData) {
        updateEndereco(enderecoIndex, 'logradouro', cepData.logradouro);
        updateEndereco(enderecoIndex, 'bairro', cepData.bairro);
        updateEndereco(enderecoIndex, 'cidade', cepData.localidade);
        updateEndereco(enderecoIndex, 'estado', cepData.uf);
        updateEndereco(enderecoIndex, 'cep', formatCep(cepData.cep));
      } else {
        setCepError(prev => ({ ...prev, [enderecoIndex]: 'CEP não encontrado' }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepError(prev => ({ ...prev, [enderecoIndex]: 'Erro ao consultar CEP' }));
    } finally {
      setSearchingCep(prev => ({ ...prev, [enderecoIndex]: false }));
    }
  };

  // Gerar código automaticamente ao carregar a página
  // (useEffect movido para cima, após todos os hooks)
  // (função searchCnpj movida para cima, antes dos useEffect)

  const handleUpdate = async () => {
    if (!editId || !token) return;

    try {
      setIsLoading(true);
      setError(null);

      const updateData = {
        nomeRazaoSocial: formData.nomeRazaoSocial.trim(),
        nomeFantasia: formData.nomeFantasia?.trim() || undefined,
        tipoPessoa: (formData.tipoPessoa === 'Pessoa Física' ? 'Pessoa Física' : 'Pessoa Jurídica') as "Pessoa Física" | "Pessoa Jurídica",
        cpf: formData.tipoPessoa === 'Pessoa Física' ? formData.cpf.replace(/\D/g, '') : undefined,
        cnpj: formData.tipoPessoa === 'Pessoa Jurídica' ? formData.cnpj.replace(/\D/g, '') : undefined,
        tiposCliente: formData.tiposCliente,
        email: formData.email?.trim() || undefined,
        pessoaContato: formData.contatos[0]?.pessoaContato?.trim() || undefined,
        telefoneComercial: formData.contatos[0]?.telefoneComercial?.replace(/\D/g, '') || undefined,
        celular: formData.contatos[0]?.celular?.replace(/\D/g, '') || undefined,
        cargo: formData.contatos[0]?.cargo?.trim() || undefined,
        celularContato: formData.contatos[0]?.celularContato?.replace(/\D/g, '') || undefined,
        optanteSimples: formData.optanteSimples,
        orgaoPublico: formData.orgaoPublico,
        ie: formData.ie?.replace(/\D/g, '') || undefined,
        im: formData.im?.replace(/\D/g, '') || undefined,
        suframa: formData.suframa?.trim() || undefined,
        enderecos: formData.enderecos,
        observacoes: formData.observacoes?.trim() || undefined,
      };

      await apiService.updateCadastro(editId, updateData, token);
      
      // Verificar se foi aberto em nova janela (tem returnUrl)
      const returnUrl = searchParams.get('returnUrl');
      if (returnUrl && window.opener) {
        // Notificar a janela pai que a edição foi concluída
        window.opener.postMessage({ type: 'cadastroUpdated', id: editId }, window.location.origin);
        // Fechar a janela
        window.close();
      } else {
        // Redirecionar de volta para a listagem
        router.push('/cadastros');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar cadastro:', error);
      setError(error.message || 'Erro ao atualizar cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !token) {
      setError('Usuário não autenticado');
      return;
    }

    // Se estiver em modo de edição, usar API de atualização
    if (isEditMode && editId) {
      await handleUpdate();
      return;
    }

    if (!user || !user.companies || user.companies.length === 0) {
      setError('Usuário não possui empresa associada');
      return;
    }

    if (!activeCompanyId) {
      setError('Nenhuma empresa ativa selecionada');
      return;
    }

    // Validações obrigatórias
    console.log('=== VALIDAÇÃO FRONTEND ===');
    console.log('Dados do formulário:', {
      nomeRazaoSocial: formData.nomeRazaoSocial,
      tipoPessoa: formData.tipoPessoa,
      cpf: formData.cpf,
      cnpj: formData.cnpj,
      tiposCliente: formData.tiposCliente
    });
    console.log('Valores após trim:', {
      nomeRazaoSocial: formData.nomeRazaoSocial?.trim(),
      tipoPessoa: formData.tipoPessoa,
      cpf: formData.cpf?.trim(),
      cnpj: formData.cnpj?.trim()
    });
    
    // Validar campos obrigatórios
    const errors: string[] = [];
    
    if (!formData.nomeRazaoSocial.trim()) {
      errors.push('Nome/Razão Social é obrigatório');
    }

    if (formData.tipoPessoa === 'Pessoa Física' && !formData.cpf.trim()) {
      errors.push('CPF é obrigatório para Pessoa Física');
    }

    if (formData.tipoPessoa === 'Pessoa Jurídica' && !formData.cnpj.trim()) {
      errors.push('CNPJ é obrigatório para Pessoa Jurídica');
    }

    // Validar se pelo menos um tipo de cliente foi selecionado
    const hasSelectedType = Object.values(formData.tiposCliente).some(value => value === true);
    if (!hasSelectedType) {
      errors.push('Selecione pelo menos um tipo de cliente (Cliente, Fornecedor, etc.)');
    }

    if (errors.length > 0) {
      setError(errors.join('. '));
      
      // Marcar campos com erro
      const newFieldErrors: {[key: string]: boolean} = {};
      if (!formData.nomeRazaoSocial.trim()) {
        newFieldErrors.nomeRazaoSocial = true;
      }
      if (formData.tipoPessoa === 'Pessoa Física' && !formData.cpf.trim()) {
        newFieldErrors.cpf = true;
      }
      if (formData.tipoPessoa === 'Pessoa Jurídica' && !formData.cnpj.trim()) {
        newFieldErrors.cnpj = true;
      }
      if (!hasSelectedType) {
        newFieldErrors.tiposCliente = true;
      }
      
      setFieldErrors(newFieldErrors);
      return;
    }
    
    // Limpar erros de campo se validação passou
    setFieldErrors({});

    setIsLoading(true);
    setError(null);

    try {
      // Preparar dados para envio
      const cadastroData: CadastroData = {
        nomeRazaoSocial: formData.nomeRazaoSocial.trim(),
        nomeFantasia: formData.nomeFantasia?.trim() || undefined,
        tipoPessoa: formData.tipoPessoa === 'Pessoa Física' ? 'Pessoa Física' : 'Pessoa Jurídica',
        cpf: formData.tipoPessoa === 'Pessoa Física' ? formData.cpf.replace(/\D/g, '') : undefined,
        cnpj: formData.tipoPessoa === 'Pessoa Jurídica' ? formData.cnpj.replace(/\D/g, '') : undefined,
        tiposCliente: formData.tiposCliente,
        // Manter campos individuais para compatibilidade (primeiro contato)
        email: formData.contatos[0]?.email?.trim() || formData.email?.trim() || undefined,
        pessoaContato: formData.contatos[0]?.pessoaContato?.trim() || undefined,
        telefoneComercial: formData.contatos[0]?.telefoneComercial?.replace(/\D/g, '') || undefined,
        celular: formData.contatos[0]?.celular?.replace(/\D/g, '') || undefined,
        cargo: formData.contatos[0]?.cargo?.trim() || undefined,
        celularContato: formData.contatos[0]?.celularContato?.replace(/\D/g, '') || undefined,
        // Enviar contatos múltiplos
        contatos: formData.contatos.map(contato => ({
          email: contato.email?.trim() || undefined,
          pessoaContato: contato.pessoaContato?.trim() || undefined,
          telefoneComercial: contato.telefoneComercial?.replace(/\D/g, '') || undefined,
          celular: contato.celular?.replace(/\D/g, '') || undefined,
          cargo: contato.cargo?.trim() || undefined,
          celularContato: contato.celularContato?.replace(/\D/g, '') || undefined,
          principal: contato.principal || false
        })),
        optanteSimples: formData.optanteSimples,
        orgaoPublico: formData.orgaoPublico,
        ie: formData.ie?.replace(/\D/g, '') || undefined,
        im: formData.im?.replace(/\D/g, '') || undefined,
        suframa: formData.suframa?.trim() || undefined,
        enderecos: formData.enderecos,
        observacoes: formData.observacoes?.trim() || undefined,
        userId: user!.id,
        companyId: activeCompanyId,
      };

      // Validação adicional antes de enviar
      if (!cadastroData.nomeRazaoSocial) {
        throw new Error('Nome/Razão Social é obrigatório');
      }
      
      if (cadastroData.tipoPessoa === 'Pessoa Física' && !cadastroData.cpf) {
        throw new Error('CPF é obrigatório para Pessoa Física');
      }
      
      if (cadastroData.tipoPessoa === 'Pessoa Jurídica' && !cadastroData.cnpj) {
        throw new Error('CNPJ é obrigatório para Pessoa Jurídica');
      }
      
      if (!cadastroData.tiposCliente || !Object.values(cadastroData.tiposCliente).some(v => v === true)) {
        throw new Error('Selecione pelo menos um tipo de cliente');
      }

      console.log('=== DADOS PARA BACKEND ===');
      console.log('Dados sendo enviados:', JSON.stringify(cadastroData, null, 2));
      console.log('Token sendo usado:', token);
      console.log('User ID:', user!.id);
      console.log('Active Company ID:', activeCompanyId);
      console.log('Tipo de nomeRazaoSocial:', typeof cadastroData.nomeRazaoSocial);
      console.log('Tipo de tipoPessoa:', typeof cadastroData.tipoPessoa);
      console.log('Valor de nomeRazaoSocial:', cadastroData.nomeRazaoSocial);
      console.log('Valor de tipoPessoa:', cadastroData.tipoPessoa);
      console.log('=== ENDEREÇOS ===');
      console.log('Quantidade de endereços:', cadastroData.enderecos?.length || 0);
      console.log('Endereços:', JSON.stringify(cadastroData.enderecos, null, 2));
      
      await apiService.createCadastro(cadastroData, token);
      
      // Redirecionar para a lista de cadastros
      router.push('/cadastros');
    } catch (error) {
      console.error('Erro ao salvar cadastro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao salvar cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header com gradiente */}
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {isEditMode ? 'Editar Cliente' : 'Novo Cliente'}
                  </h1>
                  <p className="text-purple-100 text-sm">
                    {isEditMode ? 'Edite as informações do cliente' : 'Cadastre um novo cliente no sistema'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsAIAssistantOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Assistente IA</span>
                </button>
              <button
                onClick={() => router.push('/cadastros')}
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}
            
        <form id="novo-cadastro-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Dados Gerais */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Dados Gerais</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Nome ou Razão Social */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Nome ou Razão Social *
                </label>
                <input
                  type="text"
                  value={formData.nomeRazaoSocial}
                  onChange={(e) => {
                    handleInputChange('nomeRazaoSocial', e.target.value);
                    // Limpar erro do campo quando usuário começar a digitar
                    if (fieldErrors.nomeRazaoSocial) {
                      setFieldErrors(prev => ({ ...prev, nomeRazaoSocial: false }));
                    }
                  }}
                  placeholder="Digite o nome ou razão social"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 ${
                    fieldErrors.nomeRazaoSocial 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200'
                  }`}
                  required
                />
              </div>


              {/* Tipo de Pessoa */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Tipo de Pessoa *
                </label>
                <div className="relative">
                  <select
                    value={formData.tipoPessoa}
                    onChange={(e) => handleInputChange('tipoPessoa', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 appearance-none text-gray-700"
                    required
                  >
                    <option value="Pessoa Física">Pessoa Física</option>
                    <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                  </select>
                  <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-4 pointer-events-none" />
                </div>
              </div>

              {/* CPF/CNPJ */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  {formData.tipoPessoa === 'Pessoa Física' ? 'CPF' : 'CNPJ'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.tipoPessoa === 'Pessoa Física' ? formData.cpf : formData.cnpj}
                    onChange={(e) => {
                      if (formData.tipoPessoa === 'Pessoa Física') {
                        handleInputChange('cpf', formatCPF(e.target.value));
                        // Limpar erro do campo quando usuário começar a digitar
                        if (fieldErrors.cpf) {
                          setFieldErrors(prev => ({ ...prev, cpf: false }));
                        }
                      } else {
                        handleInputChange('cnpj', formatCNPJ(e.target.value));
                        // Limpar erro do campo quando usuário começar a digitar
                        if (fieldErrors.cnpj) {
                          setFieldErrors(prev => ({ ...prev, cnpj: false }));
                        }
                      }
                    }}
                    placeholder={formData.tipoPessoa === 'Pessoa Física' ? '000.000.000-00' : '00.000.000/0000-00'}
                    maxLength={formData.tipoPessoa === 'Pessoa Física' ? 14 : 18}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 pr-10 ${
                      (formData.tipoPessoa === 'Pessoa Física' && fieldErrors.cpf) || 
                      (formData.tipoPessoa === 'Pessoa Jurídica' && fieldErrors.cnpj)
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200'
                    }`}
                  />
                  {searchingCnpj && (
                    <div className="absolute right-3 top-3">
                      <RefreshCw className="w-5 h-5 text-purple-600 animate-spin" />
                    </div>
                  )}
                </div>
                {cnpjError && (
                  <p className="text-red-500 text-sm mt-1">{cnpjError}</p>
                )}
                {cnpjData && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm font-medium">✓ Dados encontrados automaticamente</p>
                    <p className="text-green-600 text-xs mt-1">{cnpjData.name}</p>
                  </div>
                )}
              </div>

              {/* Nome Fantasia */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={formData.nomeFantasia}
                  onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                  placeholder="Nome fantasia da empresa"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>
            </div>

            {/* Tipos de Cliente */}
            <div className={`mt-8 ${fieldErrors.tiposCliente ? 'p-4 border border-red-200 rounded-xl bg-red-50' : ''}`}>
              <label className="block text-sm font-semibold text-gray-800 mb-4">
                Tipos de Cliente *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { key: 'cliente', label: 'Cliente' },
                  { key: 'vendedor', label: 'Vendedor' },
                  { key: 'fornecedor', label: 'Fornecedor' },
                  { key: 'funcionario', label: 'Funcionário' },
                  { key: 'transportadora', label: 'Transportadora' },
                  { key: 'prestadorServico', label: 'Prestador de Serviço' }
                ].map((tipo) => (
                  <label key={tipo.key} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tiposCliente[tipo.key as keyof typeof formData.tiposCliente]}
                      onChange={(e) => {
                        handleTipoClienteChange(tipo.key, e.target.checked);
                        // Limpar erro dos tipos de cliente quando um tipo for selecionado
                        if (fieldErrors.tiposCliente) {
                          setFieldErrors(prev => ({ ...prev, tiposCliente: false }));
                        }
                      }}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">{tipo.label}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.tiposCliente && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  Selecione pelo menos um tipo de cliente
                </p>
              )}
            </div>
          </div>

          {/* Contatos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Contatos</h2>
              </div>
              <button
                type="button"
                onClick={addContact}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar Contato</span>
              </button>
            </div>

            {/* Lista de Contatos */}
            {formData.contatos.map((contato, index) => (
              <div key={index} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Contato {index + 1}
                      {contato.principal && (
                        <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                          Principal
                        </span>
                      )}
                    </h3>
                  </div>
                  {formData.contatos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContato(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Remover contato"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  E-mail
                </label>
                <input
                  type="email"
                      value={index === 0 ? formData.email : contato.email || ''}
                      onChange={(e) => {
                        if (index === 0) {
                          handleInputChange('email', e.target.value);
                        }
                        updateContato(index, 'email', e.target.value);
                      }}
                  placeholder="email@exemplo.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Telefone Comercial
                </label>
                <input
                  type="text"
                      value={contato.telefoneComercial}
                      onChange={(e) => updateContato(index, 'telefoneComercial', formatPhone(e.target.value))}
                      placeholder="(11) 3333-4444"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Celular
                </label>
                <input
                  type="text"
                      value={contato.celular}
                      onChange={(e) => updateContato(index, 'celular', formatPhone(e.target.value))}
                      placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Pessoa de Contato
                </label>
                <input
                  type="text"
                      value={contato.pessoaContato}
                      onChange={(e) => updateContato(index, 'pessoaContato', e.target.value)}
                      placeholder="Nome da pessoa de contato"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Cargo
                </label>
                <input
                  type="text"
                      value={contato.cargo}
                      onChange={(e) => updateContato(index, 'cargo', e.target.value)}
                      placeholder="Cargo da pessoa de contato"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Celular do Contato
                </label>
                <input
                  type="text"
                      value={contato.celularContato}
                      onChange={(e) => updateContato(index, 'celularContato', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>
            </div>
              </div>
            ))}
          </div>

          {/* Informações Tributárias */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Informações Tributárias</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Status Tributário */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Status Tributário</h3>
                </div>
                <div className="space-y-4">
                  <label className="flex items-start space-x-4 p-4 rounded-lg hover:bg-white transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.optanteSimples}
                      onChange={(e) => handleInputChange('optanteSimples', e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-1"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-800">Optante pelo Simples Nacional</span>
                      <p className="text-xs text-gray-500 mt-1">Empresa optante pelo regime tributário simplificado</p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-4 p-4 rounded-lg hover:bg-white transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.orgaoPublico}
                      onChange={(e) => handleInputChange('orgaoPublico', e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-1"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-800">Órgão Público</span>
                      <p className="text-xs text-gray-500 mt-1">Entidade da administração pública</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Informações Importantes */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Informações Importantes</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Simples Nacional: Isenção de IE para alguns estados</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Órgão Público: Tratamento fiscal diferenciado</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>IE obrigatória para empresas não optantes</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Inscrições e Registros */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Inscrições e Registros</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Inscrição Estadual (IE) *
                  </label>
                  <input
                    type="text"
                    value={formData.ie}
                    onChange={(e) => handleInputChange('ie', formatIE(e.target.value))}
                    placeholder="000.000.000.000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-2">Obrigatória para empresas não optantes pelo Simples</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Inscrição Municipal (IM)
                  </label>
                  <input
                    type="text"
                    value={formData.im}
                    onChange={(e) => handleInputChange('im', e.target.value)}
                    placeholder="00000000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-2">Registro na prefeitura local</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Inscrição SUFRAMA
                  </label>
                  <input
                    type="text"
                    value={formData.suframa}
                    onChange={(e) => handleInputChange('suframa', e.target.value)}
                    placeholder="00000000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-2">Zona Franca de Manaus</p>
                </div>
              </div>
            </div>

            {/* Resumo do Status Tributário */}
            <div className="mt-8 bg-blue-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Resumo do Status Tributário</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4">
                  <span className="text-sm font-semibold text-gray-800">Regime Tributário:</span>
                  <p className="text-sm text-gray-600 mt-1">Regime Normal</p>
                  <p className="text-xs text-orange-600 font-medium mt-1">IE Preenchida: Não</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <span className="text-sm font-semibold text-gray-800">Tipo de Entidade:</span>
                  <p className="text-sm text-gray-600 mt-1">Empresa Privada</p>
                  <p className="text-xs text-orange-600 font-medium mt-1">IM Preenchida: Não</p>
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="bg-blue-100 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Endereço</h2>
                </div>
                <button
                  type="button"
                  onClick={addEndereco}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span>Adicionar Endereço</span>
                </button>
              </div>
            </div>
            
            {formData.enderecos && formData.enderecos.length > 0 ? (
              <div className="space-y-6">
                {formData.enderecos.map((endereco, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900">Endereço {index + 1}</h4>
                      {endereco.principal && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Principal
                        </span>
                      )}
                    </div>
                      {formData.enderecos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEndereco(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Endereço
                        </label>
                        <select
                          value={endereco.tipo}
                          onChange={(e) => updateEndereco(index, 'tipo', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Comercial">Comercial</option>
                          <option value="Residencial">Residencial</option>
                          <option value="Cobrança">Cobrança</option>
                          <option value="Entrega">Entrega</option>
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logradouro
                        </label>
                        <input
                          type="text"
                          value={endereco.logradouro}
                          onChange={(e) => updateEndereco(index, 'logradouro', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Rua, Avenida, etc."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número
                        </label>
                        <input
                          type="text"
                          value={endereco.numero}
                          onChange={(e) => updateEndereco(index, 'numero', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="123"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={endereco.bairro}
                          onChange={(e) => updateEndereco(index, 'bairro', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Centro"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CEP
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={endereco.cep}
                            onChange={(e) => {
                              const formattedCep = formatCep(e.target.value);
                              updateEndereco(index, 'cep', formattedCep);
                              
                              // Consultar CEP automaticamente quando tiver 8 dígitos
                              if (e.target.value.replace(/\D/g, '').length === 8) {
                                searchCep(formattedCep, index);
                              }
                            }}
                            onKeyDown={(e) => {
                              // Prevenir submit do form quando pressionar Enter no CEP
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const cleanCep = endereco.cep.replace(/\D/g, '');
                                if (cleanCep.length === 8) {
                                  searchCep(endereco.cep, index);
                                }
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                            placeholder="00000-000"
                            maxLength={9}
                          />
                          {searchingCep[index] && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                            </div>
                          )}
                        </div>
                        {cepError[index] && (
                          <p className="text-red-500 text-sm mt-1">{cepError[index]}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cidade
                        </label>
                        <input
                          type="text"
                          value={endereco.cidade}
                          onChange={(e) => updateEndereco(index, 'cidade', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="São Paulo"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado
                        </label>
                        <select
                          value={endereco.estado}
                          onChange={(e) => updateEndereco(index, 'estado', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecione</option>
                          <option value="AC">Acre</option>
                          <option value="AL">Alagoas</option>
                          <option value="AP">Amapá</option>
                          <option value="AM">Amazonas</option>
                          <option value="BA">Bahia</option>
                          <option value="CE">Ceará</option>
                          <option value="DF">Distrito Federal</option>
                          <option value="ES">Espírito Santo</option>
                          <option value="GO">Goiás</option>
                          <option value="MA">Maranhão</option>
                          <option value="MT">Mato Grosso</option>
                          <option value="MS">Mato Grosso do Sul</option>
                          <option value="MG">Minas Gerais</option>
                          <option value="PA">Pará</option>
                          <option value="PB">Paraíba</option>
                          <option value="PR">Paraná</option>
                          <option value="PE">Pernambuco</option>
                          <option value="PI">Piauí</option>
                          <option value="RJ">Rio de Janeiro</option>
                          <option value="RN">Rio Grande do Norte</option>
                          <option value="RS">Rio Grande do Sul</option>
                          <option value="RO">Rondônia</option>
                          <option value="RR">Roraima</option>
                          <option value="SC">Santa Catarina</option>
                          <option value="SP">São Paulo</option>
                          <option value="SE">Sergipe</option>
                          <option value="TO">Tocantins</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhum endereço cadastrado</h3>
                <p className="text-gray-500 text-lg">Clique em 'Adicionar Endereço' para começar</p>
              </div>
            )}
          </div>

          {/* Observações Gerais */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="bg-purple-100 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Observações Gerais</h2>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações adicionais sobre o cliente"
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 resize-none"
              />
            </div>
          </div>

        </form>
          </div>
        </div>
      </div>

      {/* Botões Flutuantes - Sempre Visíveis */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
        {/* Botão Voltar */}
        <button
          type="button"
          onClick={() => router.push('/cadastros')}
          disabled={isLoading}
          className="group relative px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px]"
          title="Voltar para Cadastros"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Voltar</span>
          {/* Tooltip para mobile */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 sm:hidden">
            Voltar
          </div>
        </button>

        {/* Botão Salvar */}
        <button
          type="submit"
          form="novo-cadastro-form"
          disabled={isLoading}
          className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px]"
          title={isEditMode ? "Atualizar Cliente" : "Salvar Cliente"}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">{isEditMode ? 'Atualizando...' : 'Salvando...'}</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">{isEditMode ? 'Atualizar' : 'Salvar'}</span>
            </>
          )}
          {/* Tooltip para mobile */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 sm:hidden">
            {isLoading ? (isEditMode ? 'Atualizando...' : 'Salvando...') : (isEditMode ? 'Atualizar' : 'Salvar')}
          </div>
        </button>
      </div>

      {/* Assistente de IA de Cadastros */}
      <CadastrosAIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />
    </div>
  );
}

// Componente principal com Suspense
export default function NovoClientePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <NovoClienteForm />
    </Suspense>
  );
}
