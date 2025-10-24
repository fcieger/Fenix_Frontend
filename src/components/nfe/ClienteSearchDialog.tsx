'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, User, MapPin, Phone, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { API_CONFIG } from '@/config/api';

interface Cliente {
  id: string;
  nome: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  cnpj?: string;
  cpf?: string;
  ie?: string;
  im?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  indicadorIE?: string;
}

interface ClienteSearchDialogProps {
  onClienteSelect: (cliente: Cliente) => void;
  children: React.ReactNode;
}

export default function ClienteSearchDialog({ onClienteSelect, children }: ClienteSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, activeCompanyId } = useAuth();

  const searchClientes = async (term: string) => {
    if (!term || term.length < 2) {
      setClientes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/clientes?search=${encodeURIComponent(term)}&companyId=${activeCompanyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar clientes');
      }

      const data = await response.json();
      setClientes(data.clientes || []);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError('Erro ao buscar clientes. Tente novamente.');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchClientes(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleClienteSelect = (cliente: Cliente) => {
    onClienteSelect(cliente);
    setOpen(false);
    setSearchTerm('');
    setClientes([]);
  };

  const formatDocument = (cnpj?: string, cpf?: string) => {
    if (cnpj) {
      return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    if (cpf) {
      return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    }
    return '';
  };

  const getIndicadorIELabel = (indicador?: string) => {
    switch (indicador) {
      case '1': return 'Contribuinte ICMS';
      case '2': return 'Isento';
      case '9': return 'Não Contribuinte';
      default: return 'Não informado';
    }
  };

  const getIndicadorIEColor = (indicador?: string) => {
    switch (indicador) {
      case '1': return 'bg-green-100 text-green-800';
      case '2': return 'bg-yellow-100 text-yellow-800';
      case '9': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Cliente
          </DialogTitle>
          <DialogDescription>
            Digite o nome, CNPJ/CPF ou razão social do cliente para buscar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Digite o nome, CNPJ/CPF ou razão social..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600">Buscando clientes...</span>
              </div>
            ) : clientes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>IE</TableHead>
                    <TableHead className="text-center">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900">
                            {cliente.razaoSocial || cliente.nome}
                          </div>
                          {cliente.nomeFantasia && (
                            <div className="text-sm text-gray-600">
                              {cliente.nomeFantasia}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {formatDocument(cliente.cnpj, cliente.cpf)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span>
                              {cliente.logradouro && cliente.numero && 
                                `${cliente.logradouro}, ${cliente.numero}`
                              }
                            </span>
                          </div>
                          {cliente.bairro && (
                            <div className="text-gray-600">{cliente.bairro}</div>
                          )}
                          {cliente.municipio && cliente.uf && (
                            <div className="text-gray-600">
                              {cliente.municipio} - {cliente.uf}
                            </div>
                          )}
                          {cliente.cep && (
                            <div className="text-gray-500 font-mono">
                              CEP: {cliente.cep}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {cliente.telefone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{cliente.telefone}</span>
                            </div>
                          )}
                          {cliente.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="truncate max-w-32" title={cliente.email}>
                                {cliente.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {cliente.ie && (
                            <div className="text-sm font-mono">{cliente.ie}</div>
                          )}
                          <Badge className={getIndicadorIEColor(cliente.indicadorIE)}>
                            {getIndicadorIELabel(cliente.indicadorIE)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          onClick={() => handleClienteSelect(cliente)}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Selecionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : searchTerm.length >= 2 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum cliente encontrado</p>
                <p className="text-sm">Tente uma busca diferente</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Digite pelo menos 2 caracteres para buscar</p>
                <p className="text-sm">Nome, CNPJ/CPF ou razão social</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}















