'use client';

import { useEffect, useState } from 'react';
import { OCRService, OCRProgress } from '@/services/ocr-service';
import { OCRParser, ParsedNFData } from '@/lib/ocr-parser';
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface OCRProcessingProps {
  imageFile: File;
  processedImageUrl: string;
  onComplete: (parsedData: ParsedNFData) => void;
  onError: (error: string) => void;
}

export default function OCRProcessing({
  imageFile,
  processedImageUrl,
  onComplete,
  onError
}: OCRProcessingProps) {
  const [progress, setProgress] = useState<OCRProgress>({
    status: 'initializing',
    progress: 0,
    message: 'Iniciando...'
  });
  const [showRawText, setShowRawText] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    processImage();
    
    return () => {
      OCRService.terminate();
    };
  }, []);

  const processImage = async () => {
    try {
      // 1. OCR
      setProgress({ status: 'loading', progress: 10, message: 'Carregando OCR...' });
      
      const ocrResult = await OCRService.processImage(
        processedImageUrl,
        (prog) => setProgress(prog)
      );

      setRawText(ocrResult.text);
      setProgress({ status: 'parsing', progress: 90, message: 'Analisando dados...' });

      // 2. Parse
      await new Promise(resolve => setTimeout(resolve, 500)); // UX delay
      const parsedData = OCRParser.parseNotaFiscal(ocrResult.text, ocrResult.confidence);

      // 3. Calcular score
      const finalScore = OCRParser.calculateConfidenceScore(parsedData);
      parsedData.confidence = finalScore;

      setProgress({ status: 'completed', progress: 100, message: 'Concluído!' });
      setIsComplete(true);

      // Aguardar 1s antes de prosseguir
      setTimeout(() => {
        onComplete(parsedData);
      }, 1000);

    } catch (error: any) {
      console.error('Erro no OCR:', error);
      setProgress({ 
        status: 'error', 
        progress: 0, 
        message: `Erro: ${error.message}` 
      });
      onError(error.message);
    }
  };

  const getProgressColor = () => {
    if (progress.status === 'error') return 'bg-red-500';
    if (isComplete) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStatusIcon = () => {
    if (progress.status === 'error') {
      return <AlertCircle className="w-8 h-8 text-red-500" />;
    }
    if (isComplete) {
      return <CheckCircle2 className="w-8 h-8 text-green-500" />;
    }
    return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
  };

  return (
    <div className="space-y-6">
      {/* Imagem sendo processada */}
      <div className="flex justify-center border rounded-lg overflow-hidden bg-gray-50 p-4">
        <img
          src={processedImageUrl}
          alt="Nota Fiscal"
          className="max-w-2xl w-full h-auto object-contain max-h-[600px]"
        />
      </div>

      {/* Status do processamento */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          {getStatusIcon()}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {progress.status === 'error' ? 'Erro no Processamento' :
               isComplete ? 'Processamento Concluído!' :
               'Processando Nota Fiscal...'}
            </h3>
            <p className="text-gray-600">{progress.message}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-blue-600">
              {Math.round(progress.progress)}%
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>

        {/* Etapas */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div className={progress.progress >= 30 ? 'text-green-600' : 'text-gray-400'}>
            <div className="font-medium">1. OCR</div>
            <div className="text-xs">Extraindo texto</div>
          </div>
          <div className={progress.progress >= 60 ? 'text-green-600' : 'text-gray-400'}>
            <div className="font-medium">2. Análise</div>
            <div className="text-xs">Identificando campos</div>
          </div>
          <div className={progress.progress >= 90 ? 'text-green-600' : 'text-gray-400'}>
            <div className="font-medium">3. Validação</div>
            <div className="text-xs">Verificando dados</div>
          </div>
        </div>
      </div>

      {/* Texto extraído (debug) */}
      {rawText && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {showRawText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showRawText ? 'Ocultar' : 'Ver'} texto extraído (debug)
          </button>
          
          {showRawText && (
            <pre className="mt-4 text-xs bg-white border rounded p-4 overflow-auto max-h-96">
              {rawText}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

