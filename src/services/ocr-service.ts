import Tesseract, { createWorker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  lines: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

export interface OCRProgress {
  status: string;
  progress: number;
  message: string;
}

export class OCRService {
  private static worker: Tesseract.Worker | null = null;

  /**
   * Inicializar worker do Tesseract (reutilizável)
   */
  static async initWorker() {
    if (this.worker) return this.worker;

    // Criar worker SEM logger para evitar DataCloneError
    this.worker = await createWorker('por');

    return this.worker;
  }

  /**
   * Processar imagem com OCR
   */
  static async processImage(
    image: File | string,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<OCRResult> {
    try {
      console.log('🔍 Iniciando OCR...');
      
      if (onProgress) {
        onProgress({
          status: 'initializing',
          progress: 10,
          message: 'Inicializando OCR...'
        });
      }

      // Obter worker (cria se não existir)
      const worker = await this.initWorker();
      console.log('✅ Worker OCR pronto');

      if (onProgress) {
        onProgress({
          status: 'loading',
          progress: 30,
          message: 'Carregando modelo de idioma...'
        });
      }

      // Pequeno delay para UI
      await new Promise(resolve => setTimeout(resolve, 500));

      if (onProgress) {
        onProgress({
          status: 'recognizing',
          progress: 50,
          message: 'Reconhecendo texto na imagem...'
        });
      }

      console.log('📖 Reconhecendo texto...');
      const { data } = await worker.recognize(image);
      console.log('✅ Texto reconhecido');
      console.log('📊 Dados retornados:', {
        hasText: !!data.text,
        hasConfidence: data.confidence !== undefined,
        hasLines: !!data.lines,
        linesLength: data.lines?.length
      });

      if (onProgress) {
        onProgress({
          status: 'processing',
          progress: 90,
          message: 'Processando resultado...'
        });
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      if (onProgress) {
        onProgress({
          status: 'completed',
          progress: 100,
          message: 'OCR concluído!'
        });
      }

      // Validar e retornar dados
      const result: OCRResult = {
        text: data.text || '',
        confidence: data.confidence || 0,
        lines: (data.lines || []).map(line => ({
          text: line.text || '',
          confidence: line.confidence || 0,
          bbox: line.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 }
        }))
      };

      console.log('✅ Resultado processado:', {
        textLength: result.text.length,
        confidence: result.confidence,
        linesCount: result.lines.length
      });

      return result;
    } catch (error) {
      console.error('❌ Erro no OCR:', error);
      console.error('Stack trace completo:', (error as Error).stack);
      throw new Error('Erro ao processar imagem com OCR: ' + (error as Error).message);
    }
  }

  /**
   * Pré-processar imagem para melhorar OCR
   */
  static async preprocessImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Redimensionar se muito grande (melhor performance)
        const maxWidth = 2000;
        const maxHeight = 2000;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem
        ctx?.drawImage(img, 0, 0, width, height);

        // Aumentar contraste (melhora OCR)
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            // Converter para escala de cinza
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // Aumentar contraste
            const contrast = 1.5;
            const value = ((avg - 128) * contrast) + 128;
            
            data[i] = value;     // R
            data[i + 1] = value; // G
            data[i + 2] = value; // B
          }

          ctx.putImageData(imageData, 0, 0);
        }

        resolve(canvas.toDataURL());
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Limpar worker (liberar memória)
   */
  static async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

