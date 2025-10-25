'use client';

import { BookOpen, Plus, Download, Search, Filter } from 'lucide-react';

export default function ContaContabilPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BookOpen className="h-8 w-8 text-purple-600 mr-3" />
                Plano de Contas
              </h1>
              <p className="text-gray-600 mt-1">Gestão do plano de contas contábeis</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Plano de Contas</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Plano de contas será implementado aqui</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

