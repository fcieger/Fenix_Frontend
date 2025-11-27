'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ImageUploadZone from '@/components/purchases/ImageUploadZone';
import OCRProcessing from '@/components/purchases/OCRProcessing';
import NFDataReview from '@/components/purchases/NFDataReview';
import { ParsedNFData } from '@/lib/ocr-parser';
import { NFProcessor, ProcessingResult } from '@/services/nf-processor';
import { criarPedidoCompra } from '@/services/purchase-orders-service';
import { ArrowLeft, Sparkles, CheckCircle2, Upload, Search, FileCheck, Cog, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'upload' | 'ocr' | 'review' | 'processing' | 'success';

const steps = [
  { key: 'upload' as Step, label: 'Upload', icon: Upload, description: 'Envie a foto' },
  { key: 'ocr' as Step, label: 'OCR', icon: Search, description: 'Extraindo dados' },
  { key: 'review' as Step, label: 'Revisão', icon: FileCheck, description: 'Confirme os dados' },
  { key: 'processing' as Step, label: 'Processamento', icon: Cog, description: 'Criando pedido' },
  { key: 'success' as Step, label: 'Concluído', icon: CheckCircle, description: 'Sucesso!' }
];

export default function IALancarCompraPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('upload');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedNFData | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [createdPedidoId, setCreatedPedidoId] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');

  const companyId = user?.companies?.[0]?.id || '';

  // Inicializar token do localStorage apenas no cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('fenix_token') || '';
      setToken(storedToken);
    }
  }, []);

  // Handlers
  const handleFileProcessed = (file: File, processedUrl: string) => {
    setCurrentFile(file);
    setProcessedImageUrl(processedUrl);
    setStep('ocr');
  };

  const handleOCRComplete = (data: ParsedNFData) => {
    setParsedData(data);
    setStep('review');
  };

  const handleOCRError = (error: string) => {
    toast.error('Erro no OCR', {
      description: error
    });
    setStep('upload');
  };

  const handleConfirmData = async (editedData: ParsedNFData) => {
    setStep('processing');

    try {
      // 1. Processar fornecedor e produtos (SEM criar automaticamente)
      const processor = new NFProcessor(companyId, token);
      const result = await processor.process(editedData, false); // false = não criar automaticamente

      if (!result.success) {
        // Verificar se precisa de input do usuário
        if (result.needsUserInput) {
          // Exibir avisos específicos
          if (result.warnings && result.warnings.length > 0) {
            toast.warning('Ação necessária', {
              description: result.warnings.join('\n'),
              duration: 8000
            });
          }

          // Voltar para review para usuário corrigir
          setStep('review');

          // TODO: Adicionar interface de seleção de fornecedor/products
          if (result.missingFornecedor) {
            toast.error('Fornecedor não encontrado', {
              description: 'Cadastre o fornecedor primeiro ou selecione um existente na tela de revisão',
              duration: 6000
            });
          }

          if (result.missingProdutos && result.missingProdutos.length > 0) {
            toast.error(`${result.missingProdutos.length} produto(s) não encontrado(s)`, {
              description: 'Cadastre os produtos primeiro ou selecione equivalentes na tela de revisão',
              duration: 6000
            });
          }

          return;
        }

        // Outros erros
        toast.error('Erro ao processar dados', {
          description: result.errors?.join('\n')
        });
        setStep('review');
        return;
      }

      setProcessingResult(result);

      // Mostrar warnings se houver
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          toast.success(warning);
        });
      }

      // 2. Criar pedido de compra
      if (result.pedidoCompra) {
        const pedidoCriado = await criarPedidoCompra(result.pedidoCompra);

        setCreatedPedidoId(pedidoCriado.id);
        setStep('success');

        toast.success('Pedido de compra criado!', {
          description: `Pedido #${pedidoCriado.numero || pedidoCriado.id} criado com sucesso`
        });
      }

    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast.error('Erro ao criar pedido', {
        description: error.message
      });
      setStep('review');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setCurrentFile(null);
    setProcessedImageUrl('');
    setParsedData(null);
    setProcessingResult(null);
    setCreatedPedidoId(null);
  };

  const getCurrentStepIndex = () => steps.findIndex(s => s.key === step);
  const isStepCompleted = (stepIndex: number) => getCurrentStepIndex() > stepIndex;
  const isStepActive = (stepIndex: number) => getCurrentStepIndex() === stepIndex;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="relative"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent mb-2">
                IA: Lançar Compra
              </h1>
              <p className="text-gray-600 text-lg">
                Tire uma foto da nota fiscal e deixe a IA processar tudo automaticamente
              </p>
            </div>
          </div>
        </motion.div>

        {/* Indicador de Etapas Modernizado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {steps.map((stepItem, idx) => {
                  const Icon = stepItem.icon;
                  const completed = isStepCompleted(idx);
                  const active = isStepActive(idx);

                  return (
                    <div key={stepItem.key} className="flex items-center flex-1">
                      <motion.div
                        className="flex flex-col items-center flex-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <motion.div
                          className={`
                            relative w-14 h-14 rounded-full flex items-center justify-center
                            transition-all duration-300
                            ${active
                              ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50 scale-110'
                              : completed
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }
                          `}
                          animate={active ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 2, repeat: active ? Infinity : 0 }}
                        >
                          <Icon className="w-6 h-6" />
                          {completed && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.div>
                        <div className="mt-3 text-center">
                          <p className={`text-sm font-semibold ${active ? 'text-purple-700' : completed ? 'text-green-700' : 'text-gray-500'}`}>
                            {stepItem.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {stepItem.description}
                          </p>
                        </div>
                      </motion.div>
                      {idx < steps.length - 1 && (
                        <div className="flex-1 mx-4 h-0.5 relative">
                          <div className={`absolute inset-0 ${completed ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gray-200'}`} />
                          {active && !completed && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.5 }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conteúdo por Etapa */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-8">
                {step === 'upload' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        📸 Tire ou envie uma foto da nota fiscal
                      </h2>
                      <p className="text-gray-600 text-lg">
                        Quanto melhor a qualidade da foto, mais preciso será o resultado
                      </p>
                    </div>
                    <ImageUploadZone onFileProcessed={handleFileProcessed} />
                  </motion.div>
                )}

                {step === 'ocr' && currentFile && (
                  <OCRProcessing
                    imageFile={currentFile}
                    processedImageUrl={processedImageUrl}
                    onComplete={handleOCRComplete}
                    onError={handleOCRError}
                  />
                )}

                {step === 'review' && parsedData && (
                  <NFDataReview
                    parsedData={parsedData}
                    onConfirm={handleConfirmData}
                    onCancel={handleReset}
                  />
                )}

                {step === 'processing' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block mb-6"
                    >
                      <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Processando...</h2>
                    <p className="text-gray-600 text-lg">
                      Validando fornecedor, criando produtos e gerando pedido de compra
                    </p>
                    <div className="mt-8 flex justify-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-3 h-3 bg-purple-600 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 'success' && processingResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30">
                        <CheckCircle2 className="w-20 h-20 text-white" />
                      </div>
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6"
                    >
                      🎉 Pedido Criado com Sucesso!
                    </motion.h2>

                    {/* Resumo */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="max-w-2xl mx-auto space-y-4 mb-10"
                    >
                      <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
                        <CardContent className="p-6">
                          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <span className="text-2xl">📦</span>
                            Fornecedor
                          </h3>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-800 text-lg font-medium">
                              {processingResult.fornecedor?.nome}
                            </p>
                            {processingResult.fornecedor?.isNew && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full font-semibold shadow-md"
                              >
                                NOVO
                              </motion.span>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
                        <CardContent className="p-6">
                          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="text-2xl">🛒</span>
                            Produtos ({processingResult.produtos?.length || 0})
                          </h3>
                          <div className="space-y-2">
                            {processingResult.produtos?.slice(0, 3).map((p, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <p className="text-sm text-gray-700 font-medium">
                                  {p.nome}
                                </p>
                                {p.isNew && (
                                  <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full font-semibold">
                                    NOVO
                                  </span>
                                )}
                              </motion.div>
                            ))}
                            {(processingResult.produtos?.length || 0) > 3 && (
                              <p className="text-sm text-gray-500 mt-2 text-center">
                                + {(processingResult.produtos?.length || 0) - 3} mais produtos
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Ações */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex gap-4 justify-center"
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleReset}
                        className="px-8"
                      >
                        Lançar Outra Nota
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => router.push(`/purchases/${createdPedidoId}`)}
                        className="px-8 shadow-lg shadow-purple-500/30"
                      >
                        Ver Pedido de Compra
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
}

