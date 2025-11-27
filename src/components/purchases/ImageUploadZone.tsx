'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, X, Loader2, FileText } from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  isPdf?: boolean;
}

interface ImageUploadZoneProps {
  onFileProcessed: (file: File, processedDataUrl: string) => void;
}

export default function ImageUploadZone({ onFileProcessed }: ImageUploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const updateFileStatus = (id: string, status: UploadedFile['status'], progress: number, error?: string) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, status, progress, error } : f
    ));
  };

  const convertPdfToImage = async (file: File): Promise<string> => {
    try {
      console.log('📄 Iniciando conversão do PDF:', file.name);
      
      // Importar PDF.js dinamicamente
      const pdfjsLib = await import('pdfjs-dist');
      console.log('✅ PDF.js carregado, versão:', pdfjsLib.version);
      
      // Configurar worker - usar unpkg que tem todas as versões
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      console.log('🔧 Worker configurado:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      
      // Ler arquivo como ArrayBuffer
      console.log('📖 Lendo arquivo PDF...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('✅ Arquivo lido, tamanho:', arrayBuffer.byteLength, 'bytes');
      
      // Carregar PDF
      console.log('📄 Carregando documento PDF...');
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      console.log('✅ PDF carregado, páginas:', pdf.numPages);
      
      // Pegar primeira página
      console.log('📄 Renderizando primeira página...');
      const page = await pdf.getPage(1);
      
      // Definir escala para boa qualidade
      const scale = 2.5;
      const viewport = page.getViewport({ scale });
      console.log('📐 Dimensões da página:', viewport.width, 'x', viewport.height);
      
      // Criar canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Não foi possível criar contexto do canvas');
      }
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Renderizar página
      console.log('🖼️ Renderizando página no canvas...');
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      console.log('✅ Página renderizada');
      
      // Aplicar mesmo processamento de imagem (aumentar contraste)
      console.log('🎨 Aplicando processamento de contraste...');
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const value = ((avg - 128) * 1.2) + 128;
        data[i] = data[i + 1] = data[i + 2] = value;
      }

      context.putImageData(imageData, 0, 0);
      console.log('✅ Contraste aplicado');
      
      const dataUrl = canvas.toDataURL('image/png');
      console.log('✅ Conversão completa, tamanho da imagem:', dataUrl.length, 'caracteres');
      
      return dataUrl;
    } catch (error: any) {
      console.error('❌ Erro detalhado ao converter PDF:', error);
      console.error('Stack:', error.stack);
      throw new Error(`Erro ao processar PDF: ${error.message}`);
    }
  };

  const preprocessImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        const maxSize = 2000;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Aumentar contraste
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const value = ((avg - 128) * 1.2) + 128;
            data[i] = data[i + 1] = data[i + 2] = value;
          }

          ctx.putImageData(imageData, 0, 0);
        }

        resolve(canvas.toDataURL());
      };

      img.onerror = () => reject(new Error('Erro ao processar imagem'));
      img.src = URL.createObjectURL(file);
    });
  };

  const processFile = async (uploadedFile: UploadedFile) => {
    console.log('🔄 Processando arquivo:', uploadedFile.file.name, 'PDF:', uploadedFile.isPdf);
    updateFileStatus(uploadedFile.id, 'processing', 0);

    try {
      let processedUrl: string;
      
      // Se for PDF, converter primeira página para imagem
      if (uploadedFile.isPdf) {
        console.log('📄 Convertendo PDF para imagem...');
        processedUrl = await convertPdfToImage(uploadedFile.file);
        console.log('✅ PDF convertido com sucesso');
      } else {
        console.log('🖼️ Pré-processando imagem...');
        processedUrl = await preprocessImage(uploadedFile.file);
        console.log('✅ Imagem processada com sucesso');
      }
      
      updateFileStatus(uploadedFile.id, 'processing', 50);

      // Notificar pai
      onFileProcessed(uploadedFile.file, processedUrl);
      
      updateFileStatus(uploadedFile.id, 'completed', 100);
    } catch (error: any) {
      console.error('❌ Erro ao processar arquivo:', error);
      updateFileStatus(uploadedFile.id, 'error', 0, error.message || 'Erro desconhecido');
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('📥 Arquivos recebidos:', acceptedFiles.length);
    
    const newFiles = acceptedFiles.map(file => {
      const isPdf = file.type === 'application/pdf';
      console.log('📁 Arquivo:', file.name, 'Tipo:', file.type, 'PDF:', isPdf);
      
      return {
        id: Math.random().toString(36),
        file,
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
        progress: 0,
        isPdf
      };
    });

    setFiles(prev => [...prev, ...newFiles]);

    // Processar automaticamente após adicionar aos arquivos
    setTimeout(() => {
      newFiles.forEach(processFile);
    }, 100);
  }, [onFileProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onDrop([file]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Zona de Upload */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">
          {isDragActive ? 'Solte o arquivo aqui' : 'Arraste a foto da nota fiscal ou PDF'}
        </h3>
        <p className="text-gray-600 mb-4">
          ou clique para selecionar do computador
        </p>
        <div className="flex gap-2 justify-center items-center text-sm text-gray-500">
          <span>Formatos aceitos:</span>
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">JPG</span>
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">PNG</span>
          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded font-semibold">PDF</span>
        </div>
        
        {/* Botão de Câmera (mobile) */}
        <div className="flex gap-4 justify-center mt-6">
          <label className="btn btn-outline cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100">
            <Camera className="w-5 h-5" />
            Tirar Foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Arquivos ({files.length})</h3>
          {files.map(file => (
            <div
              key={file.id}
              className="border rounded-lg p-4 flex items-center gap-4"
            >
              {file.isPdf ? (
                <div className="w-20 h-20 bg-red-50 rounded flex items-center justify-center">
                  <FileText className="w-10 h-10 text-red-500" />
                </div>
              ) : (
                <img
                  src={file.preview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{file.file.name}</p>
                  {file.isPdf && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-semibold">
                      PDF
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {(file.file.size / 1024).toFixed(1)} KB
                </p>
                
                {file.status === 'processing' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          file.isPdf ? 'bg-purple-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {file.isPdf ? 'Convertendo PDF...' : 'Processando...'} {file.progress}%
                    </p>
                  </div>
                )}
                
                {file.status === 'completed' && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Pronto para OCR
                  </p>
                )}
                
                {file.status === 'error' && (
                  <p className="text-sm text-red-600 mt-1">
                    ✗ {file.error}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeFile(file.id)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

