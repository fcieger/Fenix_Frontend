'use client';

import { useState } from 'react';
import { Search, Building2 } from 'lucide-react';

interface Banco {
  id: string;
  codigo: string;
  nome: string;
}

interface ListaBancosBrasilProps {
  onSelect: (banco: Banco) => void;
  selectedBanco?: Banco | null;
}

const bancos: Banco[] = [
  { id: '1', codigo: '001', nome: 'Banco do Brasil S.A.' },
  { id: '2', codigo: '104', nome: 'Caixa Econômica Federal' },
  { id: '3', codigo: '237', nome: 'Banco Bradesco S.A.' },
  { id: '4', codigo: '341', nome: 'Banco Itaú Unibanco S.A.' },
  { id: '5', codigo: '033', nome: 'Banco Santander (Brasil) S.A.' },
  { id: '6', codigo: '422', nome: 'Banco Safra S.A.' },
  { id: '7', codigo: '260', nome: 'Nu Pagamentos S.A. (Nubank)' },
  { id: '8', codigo: '336', nome: 'Banco C6 S.A.' },
  { id: '9', codigo: '290', nome: 'PagSeguro Internet S.A.' },
  { id: '10', codigo: '323', nome: 'Mercado Pago - Conta do Mercado Livre' },
  { id: '11', codigo: '077', nome: 'Banco Inter S.A.' },
  { id: '12', codigo: '756', nome: 'Sicoob' },
  { id: '13', codigo: '748', nome: 'Sicredi' },
  { id: '14', codigo: '041', nome: 'Banco do Estado do Rio Grande do Sul S.A.' },
  { id: '15', codigo: '070', nome: 'BRB - Banco de Brasília S.A.' },
  { id: '16', codigo: '999', nome: 'Outros' }
];

export default function ListaBancosBrasil({ onSelect, selectedBanco }: ListaBancosBrasilProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredBancos = bancos.filter(banco =>
    banco.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banco.codigo.includes(searchTerm)
  );

  const handleSelect = (banco: Banco) => {
    onSelect(banco);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Selecione um banco"
          value={selectedBanco ? `${selectedBanco.codigo} - ${selectedBanco.nome}` : searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
        />
      </div>

      {isOpen && (
        <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredBancos.length > 0 ? (
            filteredBancos.map((banco) => (
              <button
                key={banco.id}
                onClick={() => handleSelect(banco)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {banco.codigo} - {banco.nome}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              Nenhum banco encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
}
