'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, Sparkles, X, FileText, DollarSign, Settings, ArrowLeft, Check, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { apiService, ProdutoData } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import ProdutosAIAssistant from '@/components/ProdutosAIAssistant';

// Componente que usa useSearchParams
function NovoProdutoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, activeCompanyId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
  const [isEspecificacoesOpen, setIsEspecificacoesOpen] = useState(false);
  const [customUnits, setCustomUnits] = useState<string[]>([]);
  const [newUnit, setNewUnit] = useState('');
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [isCustomUnitsOpen, setIsCustomUnitsOpen] = useState(false);
  
  // Estados para edição
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Detectar modo de edição e preencher dados
  useEffect(() => {
    const edit = searchParams.get('edit');
    const id = searchParams.get('id');
    const data = searchParams.get('data');
    
    if (edit === 'true' && id && data) {
      try {
        const produtoData = JSON.parse(data);
        setIsEditMode(true);
        setEditId(id);
        
        // Preencher formData com os dados do produto
        setFormData({
          nome: produtoData.nome || '',
          descricao: produtoData.descricao || '',
          codigo: produtoData.codigo || '',
          codigoBarras: produtoData.codigoBarras || '',
          categoria: produtoData.categoria || '',
          marca: produtoData.marca || '',
          modelo: produtoData.modelo || '',
          unidadeMedida: produtoData.unidadeMedida || 'UN',
          ncm: produtoData.ncm || '',
          cest: produtoData.cest || '',
          origem: produtoData.origem || '0',
          precoCusto: produtoData.precoCusto ? produtoData.precoCusto.toString() : '',
          precoVenda: produtoData.precoVenda ? produtoData.precoVenda.toString() : '',
          margemLucro: produtoData.margemLucro ? produtoData.margemLucro.toString() : '',
          precoMinimo: produtoData.precoMinimo ? produtoData.precoMinimo.toString() : '',
          precoPromocional: produtoData.precoPromocional ? produtoData.precoPromocional.toString() : '',
          dataInicioPromocao: produtoData.dataInicioPromocao || '',
          dataFimPromocao: produtoData.dataFimPromocao || '',
          peso: produtoData.peso ? produtoData.peso.toString() : '',
          altura: produtoData.altura ? produtoData.altura.toString() : '',
          largura: produtoData.largura ? produtoData.largura.toString() : '',
          profundidade: produtoData.profundidade ? produtoData.profundidade.toString() : '',
          pesoLiquido: produtoData.pesoLiquido ? produtoData.pesoLiquido.toString() : '',
          pesoBruto: produtoData.pesoBruto ? produtoData.pesoBruto.toString() : '',
          alturaEmbalagem: produtoData.alturaEmbalagem ? produtoData.alturaEmbalagem.toString() : '',
          larguraEmbalagem: produtoData.larguraEmbalagem ? produtoData.larguraEmbalagem.toString() : '',
          profundidadeEmbalagem: produtoData.profundidadeEmbalagem ? produtoData.profundidadeEmbalagem.toString() : '',
          pesoEmbalagem: produtoData.pesoEmbalagem ? produtoData.pesoEmbalagem.toString() : '',
          quantidadePorEmbalagem: produtoData.quantidadePorEmbalagem ? produtoData.quantidadePorEmbalagem.toString() : '',
          tipoEmbalagem: produtoData.tipoEmbalagem || '',
          cor: produtoData.cor || '',
          tamanho: produtoData.tamanho || '',
          material: produtoData.material || '',
          voltagem: produtoData.voltagem || '',
          potencia: produtoData.potencia || '',
          capacidade: produtoData.capacidade || '',
          garantiaMeses: produtoData.garantiaMeses ? produtoData.garantiaMeses.toString() : '',
          certificacoes: produtoData.certificacoes || '',
          normasTecnicas: produtoData.normasTecnicas || '',
          fabricante: produtoData.fabricante || '',
          fornecedorPrincipal: produtoData.fornecedorPrincipal || '',
          paisOrigem: produtoData.paisOrigem || '',
          linkFichaTecnica: produtoData.linkFichaTecnica || '',
          observacoesTecnicas: produtoData.observacoesTecnicas || '',
        });
      } catch (error) {
        console.error('Erro ao parsear dados do produto:', error);
        setError('Erro ao carregar dados do produto para edição');
      }
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    // Dados Gerais
    nome: '',
    descricao: '',
    codigo: '',
    codigoBarras: '',
    categoria: '',
    marca: '',
    modelo: '',
    unidadeMedida: 'UN',
    
    // Classificação e Tributação
    ncm: '',
    cest: '',
    origem: '0',
    
    // Valores e Preços
    precoCusto: '',
    precoVenda: '',
    margemLucro: '',
    precoMinimo: '',
    precoPromocional: '',
    dataInicioPromocao: '',
    dataFimPromocao: '',
    
    // Dimensões e Peso
    peso: '',
    altura: '',
    largura: '',
    profundidade: '',
    pesoLiquido: '',
    pesoBruto: '',
    
    // Embalagem
    alturaEmbalagem: '',
    larguraEmbalagem: '',
    profundidadeEmbalagem: '',
    pesoEmbalagem: '',
    quantidadePorEmbalagem: '',
    tipoEmbalagem: '',
    
    // Características Físicas
    cor: '',
    tamanho: '',
    material: '',
    voltagem: '',
    potencia: '',
    capacidade: '',
    
    // Garantia e Certificações
    garantiaMeses: '',
    certificacoes: '',
    normasTecnicas: '',
    
    // Informações Adicionais
    fabricante: '',
    fornecedorPrincipal: '',
    paisOrigem: '',
    linkFichaTecnica: '',
    observacoesTecnicas: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const addCustomUnit = () => {
    if (newUnit.trim() && !customUnits.includes(newUnit.trim().toUpperCase())) {
      setCustomUnits(prev => [...prev, newUnit.trim().toUpperCase()]);
      setNewUnit('');
      setShowAddUnit(false);
    }
  };

  const removeCustomUnit = (unit: string) => {
    setCustomUnits(prev => prev.filter(u => u !== unit));
  };

  const handleUpdate = async (updateData: Partial<ProdutoData>) => {
    if (!editId || !user || !activeCompanyId) {
      setError('Dados de edição inválidos');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('fenix_token') || '';
      await apiService.updateProduto(editId, updateData, token);
      
      // Redirecionar para a listagem após sucesso
      router.push('/produtos');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      setError('Erro ao atualizar produto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !activeCompanyId) {
      setError('Usuário não autenticado');
      return;
    }

    // Validações obrigatórias
    const errors: string[] = [];

    if (!formData.nome.trim()) {
      errors.push('Nome do produto é obrigatório');
    }

    if (errors.length > 0) {
      setError(errors.join('. '));
      
      // Marcar campos com erro
      const newFieldErrors: {[key: string]: boolean} = {};
      if (!formData.nome.trim()) {
        newFieldErrors.nome = true;
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
      const produtoData: ProdutoData = {
        nome: formData.nome.trim(),
        descricao: formData.descricao?.trim() || undefined,
        sku: formData.codigo?.trim() || undefined,
        codigoBarras: formData.codigoBarras?.trim() || undefined,
        categoriaProduto: formData.categoria?.trim() || undefined,
        marca: formData.marca?.trim() || undefined,
        modelo: formData.modelo?.trim() || undefined,
        unidadeMedida: formData.unidadeMedida,
        ncm: formData.ncm?.trim() || undefined,
        cest: formData.cest?.trim() || undefined,
        origemProdutoSped: formData.origem,
        custo: formData.precoCusto ? parseFloat(formData.precoCusto.replace(/\D/g, '')) / 100 : undefined,
        preco: formData.precoVenda ? parseFloat(formData.precoVenda.replace(/\D/g, '')) / 100 : undefined,
        peso: formData.peso ? parseFloat(formData.peso) : undefined,
        altura: formData.altura ? parseFloat(formData.altura) : undefined,
        largura: formData.largura ? parseFloat(formData.largura) : undefined,
        profundidade: formData.profundidade ? parseFloat(formData.profundidade) : undefined,
        pesoLiquido: formData.pesoLiquido ? parseFloat(formData.pesoLiquido) : undefined,
        pesoBruto: formData.pesoBruto ? parseFloat(formData.pesoBruto) : undefined,
        alturaEmbalagem: formData.alturaEmbalagem ? parseFloat(formData.alturaEmbalagem) : undefined,
        larguraEmbalagem: formData.larguraEmbalagem ? parseFloat(formData.larguraEmbalagem) : undefined,
        profundidadeEmbalagem: formData.profundidadeEmbalagem ? parseFloat(formData.profundidadeEmbalagem) : undefined,
        pesoEmbalagem: formData.pesoEmbalagem ? parseFloat(formData.pesoEmbalagem) : undefined,
        quantidadePorEmbalagem: formData.quantidadePorEmbalagem ? parseInt(formData.quantidadePorEmbalagem) : undefined,
        tipoEmbalagem: formData.tipoEmbalagem?.trim() || undefined,
        cor: formData.cor?.trim() || undefined,
        tamanho: formData.tamanho?.trim() || undefined,
        material: formData.material?.trim() || undefined,
        voltagem: formData.voltagem?.trim() || undefined,
        potencia: formData.potencia?.trim() || undefined,
        capacidade: formData.capacidade?.trim() || undefined,
        garantiaMeses: formData.garantiaMeses ? parseInt(formData.garantiaMeses) : undefined,
        certificacoes: formData.certificacoes?.trim() || undefined,
        normasTecnicas: formData.normasTecnicas?.trim() || undefined,
        fabricante: formData.fabricante?.trim() || undefined,
        fornecedorPrincipal: formData.fornecedorPrincipal?.trim() || undefined,
        paisOrigem: formData.paisOrigem?.trim() || undefined,
        linkFichaTecnica: formData.linkFichaTecnica?.trim() || undefined,
        observacoesTecnicas: formData.observacoesTecnicas?.trim() || undefined,
        companyId: activeCompanyId,
      };

      const token = localStorage.getItem('fenix_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      if (isEditMode) {
        // Modo de edição - atualizar produto
        await handleUpdate(produtoData);
      } else {
        // Modo de criação - criar novo produto
        await apiService.createProduto(produtoData, token);
        
        // Redirecionar para a lista de produtos
        router.push('/produtos');
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      setError(error instanceof Error ? error.message : 'Erro ao salvar produto');
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
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {isEditMode ? 'Editar Produto' : 'Novo Produto'}
                  </h1>
                  <p className="text-purple-100 text-sm">
                    {isEditMode ? 'Edite as informações do produto' : 'Cadastre um novo produto no sistema'}
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
                onClick={() => router.push('/produtos')}
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

        <form id="novo-produto-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Dados Gerais */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Dados Gerais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Nome do Produto */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => {
                    handleInputChange('nome', e.target.value);
                    if (fieldErrors.nome) {
                      setFieldErrors(prev => ({ ...prev, nome: false }));
                    }
                  }}
                  placeholder="Digite o nome do produto"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 ${
                    fieldErrors.nome 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200'
                  }`}
                  required
                />
              </div>

              {/* Código */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Código
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  placeholder="Código do produto"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>

              {/* Descrição */}
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descrição detalhada do produto"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 resize-none"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Categoria
                </label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  placeholder="Categoria do produto"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>


              {/* Marca */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => handleInputChange('marca', e.target.value)}
                  placeholder="Marca do produto"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => handleInputChange('modelo', e.target.value)}
                  placeholder="Modelo do produto"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>

              {/* Unidade de Medida */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Unidade de Medida
                </label>
                <select
                  value={formData.unidadeMedida}
                  onChange={(e) => handleInputChange('unidadeMedida', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                >
                  <option value="UN">Unidade (UN)</option>
                  <option value="KG">Quilograma (KG)</option>
                  <option value="G">Grama (G)</option>
                  <option value="L">Litro (L)</option>
                  <option value="ML">Mililitro (ML)</option>
                  <option value="M">Metro (M)</option>
                  <option value="CM">Centímetro (CM)</option>
                  <option value="M2">Metro Quadrado (M²)</option>
                  <option value="M3">Metro Cúbico (M³)</option>
                  <option value="CX">Caixa (CX)</option>
                  <option value="PC">Peça (PC)</option>
                  <option value="DZ">Dúzia (DZ)</option>
                  <option value="GR">Grosa (GR)</option>
                  {customUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              {/* Código de Barras */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Código de Barras
                </label>
                <input
                  type="text"
                  value={formData.codigoBarras}
                  onChange={(e) => handleInputChange('codigoBarras', e.target.value)}
                  placeholder="Código de barras"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>
            </div>

            {/* Seção de Unidades Personalizadas - Ocupa toda a largura */}
            <div className="mt-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Settings className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Unidades Personalizadas</h4>
                        <p className="text-sm text-gray-600">Crie suas próprias unidades de medida</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {customUnits.length > 0 && (
                        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                          {customUnits.length} unidade{customUnits.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsCustomUnitsOpen(!isCustomUnitsOpen)}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-2 transition-colors"
                      >
                        {isCustomUnitsOpen ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            <span>Gerenciar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {isCustomUnitsOpen && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h5 className="text-md font-semibold text-gray-700">Adicionar Nova Unidade</h5>
                        <button
                          type="button"
                          onClick={() => setShowAddUnit(!showAddUnit)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center space-x-2"
                        >
                          <span>+</span>
                          <span>Nova Unidade</span>
                        </button>
                      </div>
                      
                      {showAddUnit && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex space-x-3">
                            <input
                              type="text"
                              value={newUnit}
                              onChange={(e) => setNewUnit(e.target.value.toUpperCase())}
                              placeholder="Digite a sigla da unidade (ex: PÇ, MT, etc.)"
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm"
                              maxLength={10}
                            />
                            <button
                              type="button"
                              onClick={addCustomUnit}
                              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              ✓ Adicionar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddUnit(false);
                                setNewUnit('');
                              }}
                              className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm font-medium"
                            >
                              ✕ Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {customUnits.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700">Unidades criadas:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                            {customUnits.map(unit => (
                              <div
                                key={unit}
                                className="group bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-purple-300 transition-colors flex items-center justify-between"
                              >
                                <span className="text-sm font-medium text-gray-700">{unit}</span>
                                <button
                                  type="button"
                                  onClick={() => removeCustomUnit(unit)}
                                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {customUnits.length === 0 && !showAddUnit && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Settings className="w-8 h-8 text-purple-400" />
                          </div>
                          <p className="text-gray-500 text-sm">Nenhuma unidade personalizada criada ainda</p>
                          <p className="text-gray-400 text-xs mt-1">Clique em "Nova Unidade" para começar</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Continuar com os outros campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            </div>
          </div>

          {/* Classificação e Tributação */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Classificação e Tributação</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* NCM */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  NCM
                </label>
                <input
                  type="text"
                  value={formData.ncm}
                  onChange={(e) => handleInputChange('ncm', e.target.value)}
                  placeholder="Código NCM"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>

              {/* CEST */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  CEST
                </label>
                <input
                  type="text"
                  value={formData.cest}
                  onChange={(e) => handleInputChange('cest', e.target.value)}
                  placeholder="Código CEST"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>

              {/* Origem */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Origem
                </label>
                <select
                  value={formData.origem}
                  onChange={(e) => handleInputChange('origem', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                >
                  <option value="0">0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8</option>
                  <option value="1">1 - Estrangeira - Importação direta, exceto a indicada no código 6</option>
                  <option value="2">2 - Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7</option>
                  <option value="3">3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%</option>
                  <option value="4">4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos de que tratam o Decreto-Lei nº 288/67</option>
                  <option value="5">5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%</option>
                  <option value="6">6 - Estrangeira - Importação direta, sem similar nacional, constante em lista de Resolução CAMEX e gás natural</option>
                  <option value="7">7 - Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista de Resolução CAMEX e gás natural</option>
                  <option value="8">8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%</option>
                </select>
              </div>

            </div>
          </div>

          {/* Valores e Preços */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Valores e Preços</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Preço de Custo */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Preço de Custo
                </label>
                <input
                  type="text"
                  value={formData.precoCusto}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const formatted = formatCurrency(value);
                    handleInputChange('precoCusto', formatted);
                  }}
                  placeholder="R$ 0,00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>

              {/* Preço de Venda */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Preço de Venda
                </label>
                <input
                  type="text"
                  value={formData.precoVenda}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const formatted = formatCurrency(value);
                    handleInputChange('precoVenda', formatted);
                  }}
                  placeholder="R$ 0,00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Especificações Técnicas e Dimensões */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Especificações Técnicas e Dimensões</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEspecificacoesOpen(!isEspecificacoesOpen)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <span className="text-sm font-medium">
                  {isEspecificacoesOpen ? 'Ocultar' : 'Mostrar'}
                </span>
                {isEspecificacoesOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              </div>

            {isEspecificacoesOpen && (
              <div className="space-y-8">
                {/* Dimensões e Peso */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Dimensões e Peso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.peso}
                    onChange={(e) => handleInputChange('peso', e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.altura}
                    onChange={(e) => handleInputChange('altura', e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Largura (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.largura}
                    onChange={(e) => handleInputChange('largura', e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Profundidade (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.profundidade}
                    onChange={(e) => handleInputChange('profundidade', e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Peso Líquido (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pesoLiquido}
                    onChange={(e) => handleInputChange('pesoLiquido', e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Peso Bruto (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pesoBruto}
                    onChange={(e) => handleInputChange('pesoBruto', e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Embalagem */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Embalagem</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Altura da Embalagem (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.alturaEmbalagem}
                    onChange={(e) => handleInputChange('alturaEmbalagem', e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Largura da Embalagem (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.larguraEmbalagem}
                    onChange={(e) => handleInputChange('larguraEmbalagem', e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Profundidade da Embalagem (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.profundidadeEmbalagem}
                    onChange={(e) => handleInputChange('profundidadeEmbalagem', e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Peso da Embalagem (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pesoEmbalagem}
                    onChange={(e) => handleInputChange('pesoEmbalagem', e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Quantidade por Embalagem
                  </label>
                  <input
                    type="number"
                    value={formData.quantidadePorEmbalagem}
                    onChange={(e) => handleInputChange('quantidadePorEmbalagem', e.target.value)}
                    placeholder="1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Tipo de Embalagem
                  </label>
                  <input
                    type="text"
                    value={formData.tipoEmbalagem}
                    onChange={(e) => handleInputChange('tipoEmbalagem', e.target.value)}
                    placeholder="Ex: Caixa, Saco, Garrafa"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Características Físicas */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Características Físicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Cor
                  </label>
                  <input
                    type="text"
                    value={formData.cor}
                    onChange={(e) => handleInputChange('cor', e.target.value)}
                    placeholder="Cor do produto"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Tamanho
                  </label>
                  <input
                    type="text"
                    value={formData.tamanho}
                    onChange={(e) => handleInputChange('tamanho', e.target.value)}
                    placeholder="Tamanho do produto"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Material
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => handleInputChange('material', e.target.value)}
                    placeholder="Material do produto"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Voltagem
                  </label>
                  <input
                    type="text"
                    value={formData.voltagem}
                    onChange={(e) => handleInputChange('voltagem', e.target.value)}
                    placeholder="Ex: 110V, 220V, Bivolt"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Potência
                  </label>
                  <input
                    type="text"
                    value={formData.potencia}
                    onChange={(e) => handleInputChange('potencia', e.target.value)}
                    placeholder="Ex: 100W, 1.5HP"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Capacidade
                </label>
                  <input
                    type="text"
                    value={formData.capacidade}
                    onChange={(e) => handleInputChange('capacidade', e.target.value)}
                    placeholder="Ex: 50L, 100kg"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Garantia e Certificações */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Garantia e Certificações</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Garantia (meses)
                  </label>
                  <input
                    type="number"
                    value={formData.garantiaMeses}
                    onChange={(e) => handleInputChange('garantiaMeses', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Certificações
                  </label>
                  <input
                    type="text"
                    value={formData.certificacoes}
                    onChange={(e) => handleInputChange('certificacoes', e.target.value)}
                    placeholder="Ex: ISO 9001, CE, ANATEL"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
          </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Normas Técnicas
                  </label>
                  <input
                    type="text"
                    value={formData.normasTecnicas}
                    onChange={(e) => handleInputChange('normasTecnicas', e.target.value)}
                    placeholder="Ex: ABNT NBR 12345, IEC 60950"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Informações Adicionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Fabricante
                  </label>
                  <input
                    type="text"
                    value={formData.fabricante}
                    onChange={(e) => handleInputChange('fabricante', e.target.value)}
                    placeholder="Nome do fabricante"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Fornecedor Principal
                  </label>
                  <input
                    type="text"
                    value={formData.fornecedorPrincipal}
                    onChange={(e) => handleInputChange('fornecedorPrincipal', e.target.value)}
                    placeholder="Nome do fornecedor"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
          </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    País de Origem
                  </label>
                  <input
                    type="text"
                    value={formData.paisOrigem}
                    onChange={(e) => handleInputChange('paisOrigem', e.target.value)}
                    placeholder="Ex: Brasil, China, EUA"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Link da Ficha Técnica
                  </label>
                  <input
                    type="url"
                    value={formData.linkFichaTecnica}
                    onChange={(e) => handleInputChange('linkFichaTecnica', e.target.value)}
                    placeholder="https://exemplo.com/ficha-tecnica"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Observações Técnicas
                  </label>
                  <textarea
                    value={formData.observacoesTecnicas}
                    onChange={(e) => handleInputChange('observacoesTecnicas', e.target.value)}
                    placeholder="Observações técnicas adicionais sobre o produto"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 resize-none"
                  />
                  </div>
                </div>
              </div>
            </div>
          )}
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
          onClick={() => router.push('/produtos')}
          disabled={isLoading}
          className="group relative px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px]"
          title="Voltar para Produtos"
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
          form="novo-produto-form"
                disabled={isLoading}
          className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px]"
          title={isEditMode ? "Atualizar Produto" : "Salvar Produto"}
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

      {/* IA Assistant Modal */}
      <ProdutosAIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)} 
      />
    </div>
  );
}

// Componente principal com Suspense
export default function NovoProdutoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <NovoProdutoForm />
    </Suspense>
  );
}