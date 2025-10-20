'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, ArrowLeft, Sparkles } from 'lucide-react';
import { apiService } from '@/lib/api';

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: string;
}

interface CadastrosAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CadastrosAIAssistant({ isOpen, onClose }: CadastrosAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Olá! Sou seu Assistente de IA de Cadastros. Descreva o cadastro que você gostaria de criar e eu vou ajudá-lo a gerar todos os dados necessários.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simular processamento da IA
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Processar apenas o que o usuário enviou
      const processedData = await processUserInput(inputValue);

      // Criar mensagem inteligente baseada nos dados processados
      const tiposDetectados = Object.entries(processedData.tiposCliente)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
          const tipos = {
            cliente: 'Cliente',
            vendedor: 'Vendedor',
            fornecedor: 'Fornecedor',
            funcionario: 'Funcionário',
            transportadora: 'Transportadora',
            prestadorServico: 'Prestador de Serviço'
          };
          return tipos[key as keyof typeof tipos];
        })
        .join(', ');

      // Criar mensagem detalhada com dados extraídos
      let content = `Perfeito! Identifiquei e extraí os seguintes dados:\n\n`;
      
      content += `**Nome/Razão Social:** ${processedData.userInput}\n`;
      content += `**Tipo de Pessoa:** ${processedData.tipoPessoa}\n`;
      content += `**Tipos de Cadastro:** ${tiposDetectados}\n\n`;
      
      // Mostrar dados extraídos se existirem
      if (processedData.extractedData) {
        const data = processedData.extractedData;
        
        if (data.cnpj) {
          content += `**CNPJ:** ${data.cnpj}\n`;
        }
        if (data.cpf) {
          content += `**CPF:** ${data.cpf}\n`;
        }
        if (data.email) {
          content += `**Email:** ${data.email}\n`;
        }
        if (data.telefone) {
          content += `**Telefone:** ${data.telefone}\n`;
        }
        if (data.cep) {
          content += `**CEP:** ${data.cep}\n`;
        }
        if (data.endereco) {
          content += `**Endereço:** ${data.endereco}`;
          if (data.numero) content += `, ${data.numero}`;
          content += `\n`;
        }
        if (data.bairro) {
          content += `**Bairro:** ${data.bairro}\n`;
        }
        if (data.cidade) {
          content += `**Cidade:** ${data.cidade}`;
          if (data.estado) content += ` - ${data.estado}`;
          content += `\n`;
        }
        if (data.nomeFantasia) {
          content += `**Nome Fantasia:** ${data.nomeFantasia}\n`;
        }
        if (data.inscricaoEstadual) {
          content += `**Inscrição Estadual:** ${data.inscricaoEstadual}\n`;
        }
        if (data.inscricaoMunicipal) {
          content += `**Inscrição Municipal:** ${data.inscricaoMunicipal}\n`;
        }
      }
      
      content += `\nClique em "Cadastrar na IA" para salvar!`;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);

      // Armazenar dados processados para aplicação
      (window as any).generatedCadastroData = processedData;

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processUserInput = async (userInput: string) => {
    console.log('🔍 Processando input:', userInput);
    
    // Extrair campos específicos do texto
    const extractedData = extractFieldsFromText(userInput);
    console.log('📋 Dados extraídos:', extractedData);
    
    // Se encontrou CNPJ, consultar API CNPJA
    if (extractedData.cnpj) {
      console.log('🏢 CNPJ encontrado, consultando API...', extractedData.cnpj);
      try {
        const cnpjData = await consultarCNPJA(extractedData.cnpj);
        console.log('✅ Dados da API recebidos:', cnpjData);
        
        if (cnpjData) {
          return {
            userInput: cnpjData.nome || extractedData.nome || 'Nome não encontrado',
            originalInput: userInput,
            tiposCliente: extractedData.tiposCliente,
            tipoPessoa: 'Pessoa Jurídica',
            extractedData: {
              ...extractedData,
              ...cnpjData,
              cnpj: extractedData.cnpj
            },
            processedAt: new Date().toISOString()
          };
        } else {
          console.log('❌ Nenhum dado retornado da API');
        }
      } catch (error) {
        console.error('❌ Erro ao consultar CNPJ:', error);
      }
    } else {
      console.log('ℹ️ Nenhum CNPJ encontrado no texto');
    }

    return {
      userInput: extractedData.nome || 'Nome não identificado',
      originalInput: userInput,
      tiposCliente: extractedData.tiposCliente,
      tipoPessoa: extractedData.tipoPessoa,
      extractedData,
      processedAt: new Date().toISOString()
    };
  };

  const extractFieldsFromText = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Extrair CNPJ
    const cnpjMatch = text.match(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/);
    const cnpj = cnpjMatch ? cnpjMatch[0].replace(/\D/g, '') : null;
    
    // Extrair CPF
    const cpfMatch = text.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/);
    const cpf = cpfMatch ? cpfMatch[0].replace(/\D/g, '') : null;
    
    // Extrair CEP
    const cepMatch = text.match(/\b\d{5}-?\d{3}\b/);
    const cep = cepMatch ? cepMatch[0].replace(/\D/g, '') : null;
    
    // Extrair telefone
    const telefoneMatch = text.match(/\b\(?\d{2}\)?\s?\d{4,5}-?\d{4}\b/);
    const telefone = telefoneMatch ? telefoneMatch[0] : null;
    
    // Extrair email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const email = emailMatch ? emailMatch[0] : null;
    
    // Extrair nome (remover verbos e artigos)
    let nome = text
      .replace(/\b(cadastre|cadastrar|crie|criar|inclua|incluir|adicione|adicionar|insira|inserir|registre|registrar)\b/gi, '')
      .replace(/\b(o|a|os|as|um|uma|uns|umas)\b/gi, '')
      .replace(/\b(da|do|das|dos|de|em|na|no|nas|nos|para|com|por|sobre|entre|através|mediante)\b/gi, '')
      .replace(/\b(cnpj|cpf|endereço|endereco|telefone|email|fone|tel)\b/gi, '')
      .replace(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, '') // Remove CNPJ
      .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '') // Remove CPF
      .replace(/\b\d{5}-?\d{3}\b/g, '') // Remove CEP
      .replace(/\b\(?\d{2}\)?\s?\d{4,5}-?\d{4}\b/g, '') // Remove telefone
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '') // Remove email
      .replace(/\s+/g, ' ')
      .trim();

    // Identificar tipo de cadastro com melhor detecção
    let tiposCliente = {
      cliente: false,
      vendedor: false,
      fornecedor: false,
      funcionario: false,
      transportadora: false,
      prestadorServico: false
    };

    console.log('🔍 Analisando texto para tipos de cadastro:', lowerText);

    // Detectar TRANSPORTADORA (prioridade alta)
    if (lowerText.includes('transportadora') || lowerText.includes('transportador') || 
        lowerText.includes('frete') || lowerText.includes('fretamento') ||
        lowerText.includes('entrega') || lowerText.includes('entregador') ||
        lowerText.includes('logística') || lowerText.includes('logistica') ||
        lowerText.includes('logistic') || lowerText.includes('transporte') ||
        lowerText.includes('caminhão') || lowerText.includes('caminhao') ||
        lowerText.includes('motorista') || lowerText.includes('expedição') ||
        lowerText.includes('expedicao') || lowerText.includes('distribuição') ||
        lowerText.includes('distribuicao')) {
      tiposCliente.transportadora = true;
      console.log('✅ Detectado: TRANSPORTADORA');
    }

    // Detectar FORNECEDOR
    if (lowerText.includes('fornecedor') || lowerText.includes('fornece') || 
        lowerText.includes('venda') || lowerText.includes('vendedor') ||
        lowerText.includes('comercial') || lowerText.includes('distribuidor') ||
        lowerText.includes('atacado') || lowerText.includes('atacadista') ||
        lowerText.includes('fabricante') || lowerText.includes('produtor')) {
      tiposCliente.fornecedor = true;
      console.log('✅ Detectado: FORNECEDOR');
    }

    // Detectar VENDEDOR
    if (lowerText.includes('vendedor') || lowerText.includes('vende') || 
        lowerText.includes('representante') || lowerText.includes('comercial') ||
        lowerText.includes('vendas') || lowerText.includes('vendedora')) {
      tiposCliente.vendedor = true;
      console.log('✅ Detectado: VENDEDOR');
    }

    // Detectar FUNCIONÁRIO
    if (lowerText.includes('funcionário') || lowerText.includes('funcionario') || 
        lowerText.includes('colaborador') || lowerText.includes('empregado') ||
        lowerText.includes('trabalhador') || lowerText.includes('operário') ||
        lowerText.includes('operario') || lowerText.includes('assalariado')) {
      tiposCliente.funcionario = true;
      console.log('✅ Detectado: FUNCIONÁRIO');
    }

    // Detectar PRESTADOR DE SERVIÇO
    if (lowerText.includes('prestador') || lowerText.includes('serviço') || 
        lowerText.includes('servico') || lowerText.includes('consultor') ||
        lowerText.includes('técnico') || lowerText.includes('tecnico') ||
        lowerText.includes('assessor') || lowerText.includes('consultoria') ||
        lowerText.includes('terceirizado') || lowerText.includes('terceirizada')) {
      tiposCliente.prestadorServico = true;
      console.log('✅ Detectado: PRESTADOR DE SERVIÇO');
    }

    // Detectar CLIENTE (padrão se nenhum outro for detectado)
    if (lowerText.includes('cliente') || lowerText.includes('compra') || 
        lowerText.includes('comprador') || lowerText.includes('consumidor') ||
        lowerText.includes('usuário') || lowerText.includes('usuario')) {
      tiposCliente.cliente = true;
      console.log('✅ Detectado: CLIENTE');
    }

    // Se nenhum tipo foi detectado, marcar como cliente por padrão
    if (!Object.values(tiposCliente).some(v => v)) {
      tiposCliente.cliente = true;
      console.log('ℹ️ Nenhum tipo detectado, definindo como CLIENTE por padrão');
    }

    console.log('📋 Tipos de cadastro detectados:', tiposCliente);

    // Detectar tipo de pessoa
    let tipoPessoa = 'Pessoa Física';
    if (cnpj || lowerText.includes('empresa') || lowerText.includes('ltda') || lowerText.includes('s.a') || lowerText.includes('s/a') || 
        lowerText.includes('me') || lowerText.includes('eireli') || lowerText.includes('sociedade') || 
        lowerText.includes('corporação') || lowerText.includes('corporacao')) {
      tipoPessoa = 'Pessoa Jurídica';
    }

    return {
      nome,
      cnpj,
      cpf,
      cep,
      telefone,
      email,
      endereco: null,
      numero: null,
      bairro: null,
      cidade: null,
      estado: null,
      nomeFantasia: null,
      inscricaoEstadual: null,
      inscricaoMunicipal: null,
      tiposCliente,
      tipoPessoa
    };
  };

  const consultarCNPJA = async (cnpj: string) => {
    try {
      console.log('🔗 Consultando API CNPJ para CNPJ:', cnpj);
      
      // Usar a mesma API que funciona na tela de novos cadastros
      const response = await fetch(`https://open.cnpja.com/office/${cnpj}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Status da resposta:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Dados recebidos da API CNPJ:', data);
      
      // Extrair dados no mesmo formato usado na tela de novos cadastros
      return {
        nome: data.company.name,
        nomeFantasia: data.alias,
        cnpj: data.taxId,
        endereco: data.address.street,
        numero: data.address.number,
        bairro: data.address.district,
        cidade: data.address.city,
        estado: data.address.state,
        cep: data.address.zip,
        telefone: data.phones?.find((p: any) => p.type === 'LANDLINE')?.number || '',
        celular: data.phones?.find((p: any) => p.type === 'MOBILE')?.number || '',
        email: data.emails?.[0]?.address || '',
        inscricaoEstadual: '', // Não disponível na API
        inscricaoMunicipal: '' // Não disponível na API
      };
    } catch (error) {
      console.error('❌ Erro ao consultar CNPJ:', error);
      return null;
    }
  };

  const handleApplyData = async () => {
    const data = (window as any).generatedCadastroData;
    if (!data) return;

    setIsSaving(true);
    
    try {
      // Preparar dados para envio - usando dados processados inteligentemente
      const extractedData = data.extractedData || {};
      
      const cadastroData = {
        nomeRazaoSocial: data.userInput,
        tipoPessoa: data.tipoPessoa as "Pessoa Física" | "Pessoa Jurídica",
        nomeFantasia: extractedData.nomeFantasia || (data.tipoPessoa === 'Pessoa Jurídica' ? data.userInput : ''),
        // Corrigir: Separar CPF e CNPJ baseado no tipo de pessoa
        cpf: data.tipoPessoa === 'Pessoa Física' ? (extractedData.cpf || '') : undefined,
        cnpj: data.tipoPessoa === 'Pessoa Jurídica' ? (extractedData.cnpj || '') : undefined,
        ie: extractedData.inscricaoEstadual || undefined,
        im: extractedData.inscricaoMunicipal || undefined,
        email: extractedData.email || undefined,
        telefoneComercial: extractedData.telefone || undefined,
        // Corrigir: Estruturar endereço como array de objetos
        enderecos: (extractedData.endereco || extractedData.logradouro) ? [{
          tipo: 'Comercial',
          logradouro: extractedData.endereco || extractedData.logradouro || '',
          numero: extractedData.numero || 'S/N',
          complemento: extractedData.complemento || '',
          bairro: extractedData.bairro || '',
          cidade: extractedData.cidade || '',
          estado: extractedData.estado || '',
          cep: extractedData.cep || '',
          principal: true
        }] : [],
        observacoes: `Cadastrado via IA: ${data.originalInput}`,
        tiposCliente: data.tiposCliente
      };

      // Salvar no banco de dados
      // Obter token do localStorage ou usar um token padrão
      const token = localStorage.getItem('fenix_token') || '';
      await apiService.createCadastro(cadastroData, token);
      
      // Adicionar mensagem de sucesso
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: '✅ Cadastro salvo com sucesso! Redirecionando para a listagem...',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, successMessage]);
      
      // Fechar modal e redirecionar após um pequeno delay
      setTimeout(() => {
        onClose();
        // Redirecionar para a página de cadastros
        window.location.href = '/cadastros';
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao salvar cadastro:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: '❌ Erro ao salvar o cadastro. Tente novamente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Assistente de IA de Cadastros</h2>
                <p className="text-sm text-white text-opacity-90">Criação inteligente de cadastros</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Área de conversa */}
        <div className="flex-1 p-6 overflow-y-auto max-h-96">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Botão Cadastrar na IA - apenas para mensagens da IA com dados processados */}
                    {message.type === 'ai' && (window as any).generatedCadastroData && (
                      <div className="mt-3 flex justify-center">
                        <button
                          onClick={handleApplyData}
                          disabled={isSaving}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm"
                        >
                          <Sparkles className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                          <span>{isSaving ? 'Salvando...' : 'Cadastrar na IA'}</span>
                        </button>
                      </div>
                    )}
                    
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Área de input */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Descreva o cadastro que você quer criar..."
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Pressione Enter para enviar • Shift+Enter para nova linha
              </p>
            </div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>


          {/* Botão voltar */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
