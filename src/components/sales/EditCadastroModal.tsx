'use client';

import { useState, useEffect } from 'react';
import { X, Save, RefreshCw, User, Mail, Phone, MapPin, Building } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { apiService } from '@/lib/api';

interface EditCadastroModalProps {
  isOpen: boolean;
  onClose: () => void;
  cadastroData: any;
  onSuccess: () => void;
}

export default function EditCadastroModal({ 
  isOpen, 
  onClose, 
  cadastroData, 
  onSuccess 
}: EditCadastroModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cadastroData) {
      setFormData({
        nomeRazaoSocial: cadastroData.nomeRazaoSocial || '',
        nomeFantasia: cadastroData.nomeFantasia || '',
        email: cadastroData.email || '',
        telefoneComercial: cadastroData.contatos?.[0]?.telefoneComercial || '',
        celular: cadastroData.contatos?.[0]?.celular || '',
        pessoaContato: cadastroData.contatos?.[0]?.pessoaContato || '',
        cargo: cadastroData.contatos?.[0]?.cargo || '',
        enderecos: cadastroData.enderecos || [{
          tipo: 'Comercial',
          logradouro: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
          principal: true
        }]
      });
    }
  }, [cadastroData]);

  const handleSave = async () => {
    if (!token || !cadastroData?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const updateData = {
        nomeRazaoSocial: formData.nomeRazaoSocial.trim(),
        nomeFantasia: formData.nomeFantasia?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        pessoaContato: formData.pessoaContato?.trim() || undefined,
        telefoneComercial: formData.telefoneComercial?.replace(/\D/g, '') || undefined,
        celular: formData.celular?.replace(/\D/g, '') || undefined,
        cargo: formData.cargo?.trim() || undefined,
        enderecos: formData.enderecos
      };

      await apiService.updateCadastro(cadastroData.id, updateData, token);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erro ao atualizar cadastro:', err);
      setError(err.message || 'Erro ao salvar cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEnderecoChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      enderecos: prev.enderecos.map((endereco: any, i: number) => 
        i === index ? { ...endereco, [field]: value } : endereco
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Editar {formData.nomeRazaoSocial || 'Cadastro'}
              </h2>
              <p className="text-purple-100 text-sm">
                Atualize as informações do cadastro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Dados Básicos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                Dados Básicos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome/Razão Social *
                  </label>
                  <input
                    type="text"
                    value={formData.nomeRazaoSocial || ''}
                    onChange={(e) => handleInputChange('nomeRazaoSocial', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Digite o nome ou razão social"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    value={formData.nomeFantasia || ''}
                    onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Digite o nome fantasia"
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                Contato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Digite o email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pessoa de Contato
                  </label>
                  <input
                    type="text"
                    value={formData.pessoaContato || ''}
                    onChange={(e) => handleInputChange('pessoaContato', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nome da pessoa de contato"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone Comercial
                  </label>
                  <input
                    type="text"
                    value={formData.telefoneComercial || ''}
                    onChange={(e) => handleInputChange('telefoneComercial', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="(11) 9999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Celular
                  </label>
                  <input
                    type="text"
                    value={formData.celular || ''}
                    onChange={(e) => handleInputChange('celular', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.cargo || ''}
                    onChange={(e) => handleInputChange('cargo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Cargo da pessoa de contato"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Endereço
              </h3>
              
              {formData.enderecos?.map((endereco: any, index: number) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logradouro
                    </label>
                    <input
                      type="text"
                      value={endereco.logradouro || ''}
                      onChange={(e) => handleEnderecoChange(index, 'logradouro', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      value={endereco.numero || ''}
                      onChange={(e) => handleEnderecoChange(index, 'numero', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={endereco.bairro || ''}
                      onChange={(e) => handleEnderecoChange(index, 'bairro', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Centro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={endereco.cidade || ''}
                      onChange={(e) => handleEnderecoChange(index, 'cidade', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="São Paulo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={endereco.estado || ''}
                      onChange={(e) => handleEnderecoChange(index, 'estado', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="SP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={endereco.cep || ''}
                      onChange={(e) => handleEnderecoChange(index, 'cep', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="01234-567"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !formData.nomeRazaoSocial?.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}


























