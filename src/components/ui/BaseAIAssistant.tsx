"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, ArrowLeft, Sparkles, LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: string;
}

interface BaseAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  initialMessage?: string;
  inputPlaceholder?: string;
  onProcessInput: (userInput: string) => Promise<any>;
  onApplyData?: (data: any) => void;
  applyButtonText?: string;
  applyButtonTextLoading?: string;
}

export function BaseAIAssistant({
  isOpen,
  onClose,
  title,
  description = "Assistente inteligente",
  icon: Icon = Bot,
  initialMessage = "Olá! Sou seu assistente de IA. Descreva o que você precisa e eu vou ajudá-lo.",
  inputPlaceholder = "Descreva o que você precisa...",
  onProcessInput,
  onApplyData,
  applyButtonText = "Aplicar ao Formulário",
  applyButtonTextLoading = "Aplicando...",
}: BaseAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: initialMessage,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset messages when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: "1",
          type: "ai",
          content: initialMessage,
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setInputValue("");
      (window as any).generatedData = null;
    }
  }, [isOpen, initialMessage]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Simular processamento da IA
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Processar input usando a função fornecida
      const processedData = await onProcessInput(userMessage.content);

      // Criar mensagem de resposta da IA
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: processedData.message || "Dados processados com sucesso!",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Armazenar dados processados para aplicação
      (window as any).generatedData = processedData.data;
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyData = async () => {
    const data = (window as any).generatedData;
    if (!data) return;

    setIsSaving(true);

    try {
      if (onApplyData) {
        onApplyData(data);

        const successMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: "ai",
          content: "✅ Dados aplicados ao formulário! Revise e salve.",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, successMessage]);

        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao aplicar dados:", error);

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "ai",
        content: "❌ Erro ao aplicar os dados. Tente novamente.",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                  <p className="text-sm text-white text-opacity-90">
                    {description}
                  </p>
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
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex max-w-[80%] ${
                      message.type === "user"
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    {message.type === "ai" && (
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 shrink-0">
                        <Bot className="w-4 h-4 text-purple-600" />
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.type === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>

                      {/* Botão Aplicar Dados - apenas para mensagens da IA com dados processados */}
                      {message.type === "ai" &&
                        (window as any).generatedData &&
                        onApplyData && (
                          <div className="mt-3 flex justify-center">
                            <button
                              onClick={handleApplyData}
                              disabled={isSaving}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm"
                            >
                              <Sparkles
                                className={`w-4 h-4 ${
                                  isSaving ? "animate-spin" : ""
                                }`}
                              />
                              <span>
                                {isSaving
                                  ? applyButtonTextLoading
                                  : applyButtonText}
                              </span>
                            </button>
                          </div>
                        )}

                      <p
                        className={`text-xs mt-1 ${
                          message.type === "user"
                            ? "text-purple-100"
                            : "text-gray-500"
                        }`}
                      >
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
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
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
                  placeholder={inputPlaceholder}
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
