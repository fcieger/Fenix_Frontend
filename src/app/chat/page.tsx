'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Send, Trash2, Loader2, MoreVertical } from 'lucide-react';
import chatService, { ChatMessage } from '@/services/chat-service';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading, activeCompanyId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Carregar histórico ao montar componente (silenciosamente)
  useEffect(() => {
    loadHistory();
  }, []);

  // Auto-scroll para última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focar no input quando carregar
  useEffect(() => {
    if (!isLoadingHistory && messages.length === 0) {
      inputRef.current?.focus();
    }
  }, [isLoadingHistory, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const history = await chatService.getHistory();
      setMessages(history);
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
      // Se for 404 ou erro de conexão, apenas ignora (usuário novo ou backend offline)
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        setMessages([]);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    console.log('💬 Enviando mensagem:', {
      userMessage,
      activeCompanyId,
      userId: user?.id
    });

    // Adicionar mensagem do usuário imediatamente
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      userMessage,
      aiResponse: '',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      // Construir contexto das últimas mensagens
      const context = messages.slice(-5).flatMap(msg => [
        { role: 'user', content: msg.userMessage },
        { role: 'assistant', content: msg.aiResponse },
      ]);

      // Enviar para API com companyId ativo
      const response = await chatService.sendMessage({
        message: userMessage,
        context,
        companyId: activeCompanyId || undefined,
      });

      // Atualizar com resposta real
      const newMessage: ChatMessage = {
        id: `${Date.now()}`,
        userMessage,
        aiResponse: response.message,
        createdAt: new Date().toISOString(),
        tokensUsed: response.tokensUsed,
      };

      setMessages(prev => [...prev.slice(0, -1), newMessage]);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      let errorText = '';
      
      if (error.response?.status === 404) {
        errorText = `❌ **Chat IA não configurado**

O módulo de Chat IA ainda não está disponível. Para ativar:

**1. Instalar dependência no backend:**
\`\`\`
cd /home/fabio/projetos/fenix-backend
npm install openai
\`\`\`

**2. Configurar API Key da OpenAI:**
Obtenha em: https://platform.openai.com/api-keys

Adicione no terminal do backend:
\`\`\`
export OPENAI_API_KEY="sk-proj-sua-chave-aqui"
\`\`\`

**3. Criar tabela no banco:**
Execute o SQL em: \`/fenix-backend/migrations/create-chat-messages.sql\`

**4. Reiniciar backend:**
\`\`\`
npm run start:dev
\`\`\`

📚 Documentação completa: \`docs/CHAT_IA_INSTALACAO.md\``;
      } else if (error.code === 'ERR_NETWORK') {
        errorText = '❌ **Backend offline**\n\nO servidor backend não está respondendo. Verifique se está rodando na porta 3001.';
      } else {
        errorText = `❌ **Erro**: ${error.response?.data?.message || 'Não foi possível processar sua mensagem.'}`;
      }
      
      // Mostrar erro
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        userMessage,
        aiResponse: errorText,
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Deseja limpar todo o histórico de conversas?')) return;

    try {
      await chatService.clearHistory();
      setMessages([]);
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      alert('Erro ao limpar histórico');
    }
  };

  if (isAuthLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header do Chat */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Chat IA</h1>
                <p className="text-xs text-gray-500">Assistente inteligente do Fenix ERP</p>
              </div>
            </div>
            
            {messages.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-5 w-5 text-gray-600" />
                </button>
                
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={() => {
                          handleClearHistory();
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Limpar histórico
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-6">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className="space-y-3">
                    {/* Mensagem do usuário */}
                    <div className="flex justify-end">
                      <div className="max-w-[75%] md:max-w-[65%] bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-2.5 shadow-sm">
                        <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                          {message.userMessage}
                        </p>
                      </div>
                    </div>

                    {/* Resposta da IA */}
                    <div className="flex justify-start gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 max-w-[75%] md:max-w-[65%]">
                        <div className="bg-white rounded-2xl rounded-tl-md px-4 py-2.5 shadow-sm border border-gray-200">
                          <p className="text-sm md:text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {message.aiResponse}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex justify-start gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-md px-4 py-2.5 shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                        <span className="text-sm text-gray-500">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Fixo na Parte Inferior */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isSending}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 text-sm md:text-base transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center justify-center min-w-[60px]"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

