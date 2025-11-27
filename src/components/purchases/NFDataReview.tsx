'use client';

import { useState } from 'react';
import { ParsedNFData } from '@/lib/ocr-parser';
import { CheckCircle2, AlertCircle, Edit2, Plus, Trash2 } from 'lucide-react';

interface NFDataReviewProps {
  parsedData: ParsedNFData;
  onConfirm: (editedData: ParsedNFData) => void;
  onCancel: () => void;
}

export default function NFDataReview({ parsedData, onConfirm, onCancel }: NFDataReviewProps) {
  const [data, setData] = useState(parsedData);
  const [isEditing, setIsEditing] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleEditItem = (index: number, field: string, value: any) => {
    const newItens = [...data.itens];
    newItens[index] = { ...newItens[index], [field]: value };
    setData({ ...data, itens: newItens });
  };

  const handleRemoveItem = (index: number) => {
    const newItens = data.itens.filter((_, i) => i !== index);
    setData({ ...data, itens: newItens });
  };

  const handleAddItem = () => {
    const newItens = [...data.itens, {
      descricao: 'Novo produto',
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0
    }];
    setData({ ...data, itens: newItens });
  };

  return (
    <div className="space-y-6">
      {/* Header com confiança */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Revisão dos Dados Extraídos</h2>
            <p className="text-gray-600">
              Verifique se os dados foram extraídos corretamente antes de prosseguir
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${getConfidenceColor(data.confidence)}`}>
            {data.confidence >= 80 ? <CheckCircle2 className="w-4 h-4" /> : 
             <AlertCircle className="w-4 h-4" />}
            <span className="font-semibold">Confiança: {data.confidence.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Dados do Fornecedor */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            📦 Fornecedor
            {!data.fornecedor.cnpj && !data.fornecedor.razaoSocial && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Incompleto</span>
            )}
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50"
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? 'Salvar' : 'Editar'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">CNPJ</label>
            {isEditing ? (
              <input
                type="text"
                value={data.fornecedor.cnpj || ''}
                onChange={(e) => setData({
                  ...data,
                  fornecedor: { ...data.fornecedor, cnpj: e.target.value }
                })}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            ) : (
              <p className="mt-1 text-gray-900">
                {data.fornecedor.cnpj || <span className="text-red-500">Não identificado</span>}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Razão Social</label>
            {isEditing ? (
              <input
                type="text"
                value={data.fornecedor.razaoSocial || ''}
                onChange={(e) => setData({
                  ...data,
                  fornecedor: { ...data.fornecedor, razaoSocial: e.target.value }
                })}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            ) : (
              <p className="mt-1 text-gray-900">
                {data.fornecedor.razaoSocial || <span className="text-red-500">Não identificado</span>}
              </p>
            )}
          </div>

          {data.fornecedor.telefone && (
            <div>
              <label className="text-sm font-medium text-gray-700">Telefone</label>
              <p className="mt-1 text-gray-900">{data.fornecedor.telefone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Dados da Nota */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">📄 Nota Fiscal</h3>
        
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Número</label>
            <p className="mt-1 text-gray-900 font-mono">
              {data.nota.numero || <span className="text-gray-400">-</span>}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Série</label>
            <p className="mt-1 text-gray-900">
              {data.nota.serie || <span className="text-gray-400">-</span>}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Data Emissão</label>
            <p className="mt-1 text-gray-900">
              {data.nota.dataEmissao || <span className="text-gray-400">-</span>}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Valor Total</label>
            <p className="mt-1 text-gray-900 font-semibold text-lg">
              {data.nota.valorTotal 
                ? `R$ ${data.nota.valorTotal.toFixed(2)}` 
                : <span className="text-gray-400">-</span>
              }
            </p>
          </div>
        </div>

        {data.nota.chaveAcesso && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">Chave de Acesso</label>
            <p className="mt-1 text-xs font-mono text-gray-700 bg-gray-50 p-2 rounded">
              {data.nota.chaveAcesso}
            </p>
          </div>
        )}
      </div>

      {/* Produtos */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            🛒 Produtos ({data.itens.length})
          </h3>
          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
            Adicionar Item
          </button>
        </div>

        {data.itens.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
            <p>Nenhum produto identificado</p>
            <p className="text-sm">Clique em "Adicionar Item" para incluir manualmente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Qtd</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Un</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Vl. Unit.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.itens.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.codigo || ''}
                          onChange={(e) => handleEditItem(index, 'codigo', e.target.value)}
                          className="w-24 border rounded px-2 py-1 text-sm"
                          placeholder="Código"
                        />
                      ) : (
                        <span className="text-sm font-mono">{item.codigo || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.descricao}
                          onChange={(e) => handleEditItem(index, 'descricao', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="text-sm">{item.descricao}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.quantidade || ''}
                          onChange={(e) => handleEditItem(index, 'quantidade', parseFloat(e.target.value))}
                          className="w-20 border rounded px-2 py-1 text-sm"
                          step="0.01"
                        />
                      ) : (
                        <span className="text-sm">{item.quantidade || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{item.unidade || 'UN'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.valorUnitario || ''}
                          onChange={(e) => handleEditItem(index, 'valorUnitario', parseFloat(e.target.value))}
                          className="w-24 border rounded px-2 py-1 text-sm"
                          step="0.01"
                        />
                      ) : (
                        <span className="text-sm">
                          {item.valorUnitario ? `R$ ${item.valorUnitario.toFixed(2)}` : '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold">
                        {item.valorTotal ? `R$ ${item.valorTotal.toFixed(2)}` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right font-semibold">
                    Total:
                  </td>
                  <td className="px-4 py-3 font-bold text-lg">
                    R$ {data.itens.reduce((sum, item) => sum + (item.valorTotal || 0), 0).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Alertas */}
      {data.confidence < 70 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900">Atenção: Baixa Confiança</h4>
              <p className="text-sm text-yellow-800 mt-1">
                O OCR teve dificuldade em extrair alguns dados. Revise cuidadosamente antes de prosseguir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={onCancel}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={() => onConfirm(data)}
          disabled={!data.fornecedor.cnpj && !data.fornecedor.razaoSocial}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Confirmar e Processar
        </button>
      </div>
    </div>
  );
}



