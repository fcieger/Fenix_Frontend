'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Clock,
  Calendar,
  Settings,
  DollarSign,
  CalendarDays,
  Percent,
  Target
} from 'lucide-react';
import { apiService, PrazoPagamentoData } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

interface PrazoPagamentoAIProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (prazo: PrazoPagamentoData) => void;
  context?: {
    tipo: 'produto' | 'cadastro';
    nome?: string;
    valor?: number;
    descricao?: string;
  };
}

export default function PrazoPagamentoAI({ 
  isOpen, 
  onClose, 
  onSuccess,
  context 
}: PrazoPagamentoAIProps) {
  const { token } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedPrazo, setGeneratedPrazo] = useState<PrazoPagamentoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Função para gerar prazo via IA
  const generatePrazo = async () => {
    if (!prompt.trim()) {
      setError('Digite uma descrição do prazo de pagamento');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Simular geração de IA (aqui você integraria com uma API real de IA)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Gerar prazo baseado no prompt
      const prazo = generatePrazoFromPrompt(prompt, context);
      setGeneratedPrazo(prazo);
    } catch (err) {
      setError('Erro ao gerar prazo de pagamento');
    } finally {
      setIsGenerating(false);
    }
  };

  // Função para salvar o prazo gerado
  const savePrazo = async () => {
    if (!generatedPrazo || !token) return;

    setIsSaving(true);
    try {
      const result = await apiService.createPrazoPagamento(generatedPrazo, token);
      console.log('✅ Prazo salvo com sucesso:', result);
      
      if (onSuccess) {
        onSuccess(generatedPrazo);
      }
      
      // Reset form
      setPrompt('');
      setGeneratedPrazo(null);
      onClose();
    } catch (err: any) {
      setError('Erro ao salvar prazo de pagamento');
      console.error('❌ Erro ao salvar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Função para processar comandos naturais
  const processNaturalCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    console.log('🔍 Processando comando:', command);
    console.log('🔍 Comando em lowercase:', lowerCommand);
    
    // Padrões para diferentes tipos de comandos
    const patterns = {
      // Padrão: "30 60 90 dias" ou "30/60/90 dias" ou "30-60-90 dias" ou "30, 60, 90 dias"
      parcelasDias: /(\d+)\s*[,/\- ]\s*(\d+)\s*[,/\- ]\s*(\d+)\s*dias?/i,
      
      // Padrão: "3 parcelas de 30 dias"
      parcelasIntervalo: /(\d+)\s*parcelas?\s*(?:de\s*)?(\d+)\s*dias?/i,
      
      // Padrão: "30 dias" (prazo simples)
      prazoSimples: /(\d+)\s*dias?/i,
      
      // Padrão: "à vista" ou "a vista"
      avista: /à\s*vista|a\s*vista/i,
      
      // Padrão: "entrada de X% e resto em Y dias"
      entradaResto: /entrada\s*(?:de\s*)?(\d+)%\s*(?:e\s*)?(?:resto|restante)\s*(?:em\s*)?(\d+)\s*dias?/i,
    };
    
    // Tentar encontrar padrões
    let match;
    
    // 1. Parcelas com dias específicos (ex: "30 60 90 dias", "30/60/90 dias", "30-60-90 dias", "30, 60, 90 dias")
    console.log('🔍 Testando padrão parcelasDias:', patterns.parcelasDias);
    console.log('🔍 Testando comando:', lowerCommand);
    match = lowerCommand.match(patterns.parcelasDias);
    console.log('🔍 Resultado do match parcelasDias:', match);
    
    if (match) {
      console.log('✅ Match encontrado para parcelasDias:', match);
      const diasArray = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      const percentualPorParcela = Math.floor(100 / diasArray.length);
      const percentualRestante = 100 - (percentualPorParcela * diasArray.length);
      
      const parcelas = diasArray.map((dias, index) => ({
        numero: index + 1,
        dias: dias,
        percentual: percentualPorParcela + (index === 0 ? percentualRestante : 0),
        descricao: `${index + 1}ª parcela`
      }));
      
      // Gerar nome baseado nos dias
      const nomePrazo = diasArray.join('/') + ' dias';
      
      console.log('✅ Parcelas geradas:', parcelas);
      console.log('✅ Nome do prazo:', nomePrazo);
      return {
        nome: nomePrazo,
        tipo: 'personalizado',
        configuracoes: { parcelas }
      };
    }
    
    // 2. Parcelas com intervalo (ex: "3 parcelas de 30 dias")
    if (match = lowerCommand.match(patterns.parcelasIntervalo)) {
      const numeroParcelas = parseInt(match[1]);
      const intervaloDias = parseInt(match[2]);
      
      // Gerar nome baseado no intervalo
      const nomePrazo = `${numeroParcelas}x ${intervaloDias} dias`;
      
      console.log('✅ Parcelas com intervalo geradas:', { numeroParcelas, intervaloDias });
      console.log('✅ Nome do prazo:', nomePrazo);
      return {
        nome: nomePrazo,
        tipo: 'parcelas',
        configuracoes: {
          numeroParcelas,
          intervaloDias,
          percentualEntrada: 0,
          percentualParcelas: Math.round(100 / numeroParcelas)
        }
      };
    }
    
    // 3. Prazo simples (ex: "30 dias")
    if (match = lowerCommand.match(patterns.prazoSimples)) {
      const dias = parseInt(match[1]);
      
      // Gerar nome baseado nos dias
      const nomePrazo = `${dias} dias`;
      
      console.log('✅ Prazo simples gerado:', { dias });
      console.log('✅ Nome do prazo:', nomePrazo);
      return {
        nome: nomePrazo,
        tipo: 'dias',
        configuracoes: {
          dias,
          percentualEntrada: 0,
          percentualRestante: 100
        }
      };
    }
    
    // 4. À vista
    if (lowerCommand.match(patterns.avista)) {
      console.log('✅ À vista gerado');
      return {
        nome: 'À vista',
        tipo: 'dias',
        configuracoes: {
          dias: 0,
          percentualEntrada: 100,
          percentualRestante: 0
        }
      };
    }
    
    // 5. Entrada + resto (ex: "entrada de 30% e resto em 60 dias")
    if (match = lowerCommand.match(patterns.entradaResto)) {
      const percentualEntrada = parseInt(match[1]);
      const diasResto = parseInt(match[2]);
      
      // Gerar nome baseado na entrada e dias
      const nomePrazo = `${percentualEntrada}% entrada + ${diasResto} dias`;
      
      console.log('✅ Entrada e resto gerados:', { percentualEntrada, diasResto });
      console.log('✅ Nome do prazo:', nomePrazo);
      return {
        nome: nomePrazo,
        tipo: 'dias',
        configuracoes: {
          dias: diasResto,
          percentualEntrada,
          percentualRestante: 100 - percentualEntrada
        }
      };
    }
    
    // Se nenhum padrão foi encontrado
    console.log('⚠️ Nenhum padrão encontrado, retornando null');
    console.log('⚠️ Comando original:', command);
    console.log('⚠️ Comando lowercase:', lowerCommand);
    return null;
  };

  // Função para gerar prazo baseado no prompt (simulação de IA)
  const generatePrazoFromPrompt = (prompt: string, context?: any): PrazoPagamentoData => {
    const promptLower = prompt.toLowerCase();
    
    // Primeiro tentar processar como comando natural
    const naturalCommand = processNaturalCommand(prompt);
    
    let nome = 'Novo Prazo';
    let tipo: 'dias' | 'parcelas' | 'personalizado' = 'dias';
    let configuracoes: any = {
      dias: 30,
      percentualEntrada: 0,
      percentualRestante: 100,
      numeroParcelas: 2,
      intervaloDias: 30,
      percentualParcelas: 50,
      parcelas: []
    };

    if (naturalCommand) {
      // Usar comando natural processado
      nome = naturalCommand.nome || 'Novo Prazo';
      tipo = naturalCommand.tipo;
      configuracoes = naturalCommand.configuracoes;
    } else {
      // Fallback para detecção baseada em palavras-chave
      if (promptLower.includes('parcela') || promptLower.includes('parcelado')) {
        tipo = 'parcelas';
        const parcelasMatch = promptLower.match(/(\d+)\s*parcela/);
        if (parcelasMatch) {
          const numParcelas = parseInt(parcelasMatch[1]);
          configuracoes.numeroParcelas = numParcelas;
          configuracoes.percentualParcelas = 100 / numParcelas;
        }
      } else if (promptLower.includes('personalizado') || promptLower.includes('especial')) {
        tipo = 'personalizado';
        configuracoes.parcelas = [
          { numero: 1, dias: 0, percentual: 30, descricao: 'Entrada' },
          { numero: 2, dias: 30, percentual: 35, descricao: '1ª Parcela' },
          { numero: 3, dias: 60, percentual: 35, descricao: '2ª Parcela' }
        ];
      }

      // Detectar dias
      const diasMatch = promptLower.match(/(\d+)\s*dia/);
      if (diasMatch) {
        configuracoes.dias = parseInt(diasMatch[1]);
      }

      // Detectar percentuais
      if (promptLower.includes('entrada')) {
        const entradaMatch = promptLower.match(/(\d+)%\s*entrada/);
        if (entradaMatch) {
          const percentualEntrada = parseInt(entradaMatch[1]);
          configuracoes.percentualEntrada = percentualEntrada;
          configuracoes.percentualRestante = 100 - percentualEntrada;
        }
      }
    }

    return {
      nome,
      descricao: `Prazo gerado via IA: ${prompt}`,
      tipo,
      configuracoes,
      ativo: true,
      padrao: false,
      observacoes: `Gerado automaticamente via IA em ${new Date().toLocaleString('pt-BR')}`
    };
  };

  // Função para formatar valor
  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Função para calcular vencimentos (similar à do componente de teste)
  const calcularVencimentos = (prazo: PrazoPagamentoData) => {
    const dataVenda = new Date();
    const valorTotal = context?.valor || 100;
    const { tipo, configuracoes } = prazo;

    const vencimentos = [];

    if (tipo === 'dias') {
      const { dias, percentualEntrada, percentualRestante } = configuracoes;
      
      if (percentualEntrada && percentualEntrada > 0) {
        vencimentos.push({
          numero: 1,
          descricao: 'Entrada',
          valor: (valorTotal * percentualEntrada) / 100,
          dataVencimento: dataVenda,
          dias: 0
        });
      }

      if (percentualRestante && percentualRestante > 0) {
        const dataVencimento = new Date(dataVenda);
        dataVencimento.setDate(dataVencimento.getDate() + dias);
        
        vencimentos.push({
          numero: vencimentos.length + 1,
          descricao: 'Restante',
          valor: (valorTotal * percentualRestante) / 100,
          dataVencimento: dataVencimento,
          dias: dias
        });
      }
    } else if (tipo === 'parcelas') {
      const { numeroParcelas, intervaloDias, percentualEntrada, percentualParcelas } = configuracoes;
      
      if (percentualEntrada && percentualEntrada > 0) {
        vencimentos.push({
          numero: 1,
          descricao: 'Entrada',
          valor: (valorTotal * percentualEntrada) / 100,
          dataVencimento: dataVenda,
          dias: 0
        });
      }

      const valorParcela = (valorTotal * percentualParcelas) / 100;
      for (let i = 0; i < numeroParcelas; i++) {
        const dataVencimento = new Date(dataVenda);
        dataVencimento.setDate(dataVencimento.getDate() + (i + 1) * intervaloDias);
        
        vencimentos.push({
          numero: vencimentos.length + 1,
          descricao: `${i + 1}ª Parcela`,
          valor: valorParcela,
          dataVencimento: dataVencimento,
          dias: (i + 1) * intervaloDias
        });
      }
    } else if (tipo === 'personalizado') {
      const { parcelas } = configuracoes;
      
      parcelas.forEach((parcela: any, index: number) => {
        const dataVencimento = new Date(dataVenda);
        dataVencimento.setDate(dataVencimento.getDate() + parcela.dias);
        
        vencimentos.push({
          numero: index + 1,
          descricao: parcela.descricao || `${index + 1}ª Parcela`,
          valor: (valorTotal * parcela.percentual) / 100,
          dataVencimento: dataVencimento,
          dias: parcela.dias
        });
      });
    }

    return vencimentos;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">IA - Gerador de Prazos de Pagamento</h2>
                  <p className="text-purple-100 text-sm">
                    Descreva o prazo desejado e nossa IA criará automaticamente
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {!generatedPrazo ? (
              /* Input Section */
              <div className="space-y-6">
                <div>
                  <Label htmlFor="prompt" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Descreva o prazo de pagamento desejado
                  </Label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: '30 60 90 dias', '30/60/90 dias', '30-60-90 dias', '30, 60, 90 dias', '3 parcelas de 30 dias', '30 dias', 'à vista'"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 resize-none transition-all duration-200"
                    rows={4}
                  />
                </div>

                {context && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-blue-900 mb-2">Contexto:</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      {context.nome && <p><strong>Item:</strong> {context.nome}</p>}
                      {context.valor && <p><strong>Valor:</strong> {formatarValor(context.valor)}</p>}
                      {context.descricao && <p><strong>Descrição:</strong> {context.descricao}</p>}
                    </div>
                  </div>
                )}

                {/* Exemplos de comandos */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    Exemplos de comandos que a IA entende:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-900">Parcelas específicas:</p>
                        <p className="text-gray-600">"30 60 90 dias"</p>
                        <p className="text-gray-600">"30/60/90 dias"</p>
                        <p className="text-gray-600">"30-60-90 dias"</p>
                        <p className="text-gray-600">"30, 60, 90 dias"</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-900">Parcelas com intervalo:</p>
                        <p className="text-gray-600">"3 parcelas de 30 dias"</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-900">Prazo simples:</p>
                        <p className="text-gray-600">"30 dias"</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-900">À vista:</p>
                        <p className="text-gray-600">"à vista"</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-900">Entrada + resto:</p>
                        <p className="text-gray-600">"entrada de 30% e resto em 60 dias"</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-900">Personalizado:</p>
                        <p className="text-gray-600">"personalizado"</p>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <p className="text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </p>
                  </motion.div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={generatePrazo}
                    disabled={isGenerating || !prompt.trim()}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Gerar Prazo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Generated Prazo Section */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Prazo Gerado com Sucesso!</h3>
                      <p className="text-sm text-gray-600">Revise e ajuste se necessário</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setGeneratedPrazo(null)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Gerar Novo
                  </Button>
                </div>

                {/* Prazo Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configuração */}
                  <Card className="p-6 bg-white border-2 border-gray-100 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-600" />
                      Configuração
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-semibold text-gray-600">Nome</Label>
                        <p className="text-gray-900 font-medium">{generatedPrazo.nome}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-600">Tipo</Label>
                        <p className="text-gray-900 font-medium capitalize">{generatedPrazo.tipo}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-600">Descrição</Label>
                        <p className="text-gray-900">{generatedPrazo.descricao}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Preview do Cronograma */}
                  <Card className="p-6 bg-white border-2 border-gray-100 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Preview do Cronograma
                    </h4>
                    <div className="space-y-2">
                      {calcularVencimentos(generatedPrazo).map((vencimento, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                              {vencimento.numero}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{vencimento.descricao}</p>
                              <p className="text-sm text-gray-600">
                                {vencimento.dias === 0 ? 'À vista' : `${vencimento.dias} dias`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatarValor(vencimento.valor)}</p>
                            <p className="text-sm text-gray-600">
                              {vencimento.dataVencimento.toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={savePrazo}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Salvar Prazo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
