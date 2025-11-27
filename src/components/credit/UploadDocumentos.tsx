'use client';

import { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { uploadDocumento } from '@/services/credit';
import { TipoDocumento } from '@/types/credit';

interface UploadDocumentosProps {
  solicitacaoId: string;
  onUploadSuccess?: () => void;
}

interface FileUpload {
  id: string;
  file: File;
  tipo: TipoDocumento;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function UploadDocumentos({ solicitacaoId, onUploadSuccess }: UploadDocumentosProps) {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tiposDocumento: { value: TipoDocumento; label: string }[] = [
    { value: 'documento_socio_1', label: 'CPF, CNH ou RG vigente - Sócio I' },
    { value: 'documento_socio_2', label: 'CPF, CNH ou RG vigente - Sócio II' },
    { value: 'comprovante_endereco_empresa', label: 'Comprovante Endereço - Empresa' },
    { value: 'comprovante_endereco_socio_1', label: 'Comprovante Endereço - Sócio I' },
    { value: 'comprovante_endereco_socio_2', label: 'Comprovante Endereço - Sócio II' },
    { value: 'contrato_social', label: 'Contrato Social Consolidado' },
    { value: 'fotos_empresa', label: 'Fotos da Empresa' },
    { value: 'ir_socio_1', label: 'IR - Sócio I' },
    { value: 'ir_socio_2', label: 'IR - Sócio II' },
    { value: 'comprovante_estado_civil', label: 'Comprovante de Estado Civil' },
    { value: 'declaracao_faturamento', label: 'Declaração de Faturamento' },
    { value: 'extrato_conta_corrente', label: 'Extrato Conta Corrente' },
    { value: 'certidao_negativa', label: 'Certidão Negativa' },
    { value: 'balanco_patrimonial', label: 'Balanço Patrimonial' },
    { value: 'dre', label: 'DRE' },
    { value: 'outros', label: 'Outros' },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      // Validar tipo
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert(`Arquivo ${file.name} não é um tipo válido (apenas PDF, JPG, PNG)`);
        return false;
      }

      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`Arquivo ${file.name} é muito grande (máximo 10MB)`);
        return false;
      }

      return true;
    });

    const fileUploads: FileUpload[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      tipo: 'outros',
      status: 'pending',
      progress: 0,
    }));

    setFiles([...files, ...fileUploads]);
  };

  const updateFileTipo = (id: string, tipo: TipoDocumento) => {
    setFiles(files.map((f) => (f.id === id ? { ...f, tipo } : f)));
  };

  const removeFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const uploadFile = async (fileUpload: FileUpload) => {
    try {
      // Atualizar status
      setFiles(files.map((f) =>
        f.id === fileUpload.id ? { ...f, status: 'uploading', progress: 50 } : f
      ));

      await uploadDocumento(solicitacaoId, fileUpload.tipo, fileUpload.file);

      // Sucesso
      setFiles(files.map((f) =>
        f.id === fileUpload.id ? { ...f, status: 'success', progress: 100 } : f
      ));

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      setFiles(files.map((f) =>
        f.id === fileUpload.id
          ? { ...f, status: 'error', progress: 0, error: error.response?.data?.message || 'Erro no upload' }
          : f
      ));
    }
  };

  const uploadAll = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    
    for (const file of pendingFiles) {
      await uploadFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-700 font-medium mb-2">
          Clique para selecionar ou arraste arquivos aqui
        </p>
        <p className="text-sm text-gray-500">
          PDF, JPG ou PNG até 10MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Arquivos ({files.length})
            </h3>
            <button
              onClick={uploadAll}
              disabled={files.filter((f) => f.status === 'pending').length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              Enviar Todos
            </button>
          </div>

          {files.map((fileUpload) => (
            <div
              key={fileUpload.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start flex-1">
                  <File className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {fileUpload.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileUpload.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {fileUpload.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {fileUpload.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  {fileUpload.status === 'uploading' && (
                    <Loader className="h-5 w-5 text-blue-600 animate-spin" />
                  )}
                  {fileUpload.status === 'pending' && (
                    <button
                      onClick={() => removeFile(fileUpload.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {fileUpload.status === 'pending' && (
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tipo de Documento *
                  </label>
                  <select
                    value={fileUpload.tipo}
                    onChange={(e) => updateFileTipo(fileUpload.id, e.target.value as TipoDocumento)}
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {tiposDocumento.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {fileUpload.status === 'error' && fileUpload.error && (
                <div className="text-xs text-red-600 mt-2">
                  {fileUpload.error}
                </div>
              )}

              {fileUpload.status === 'success' && (
                <div className="text-xs text-green-600 mt-2">
                  ✓ Enviado com sucesso
                </div>
              )}

              {fileUpload.status === 'uploading' && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${fileUpload.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


