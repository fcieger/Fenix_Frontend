'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Package, DollarSign, Hash, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { API_CONFIG } from '@/config/api';

interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  ncm?: string;
  cfop?: string;
  unidade?: string;
  valorUnitario: number;
  estoqueAtual?: number;
  categoria?: string;
  marca?: string;
  peso?: number;
  dimensoes?: string;
}

interface ProdutoSearchDialogProps {
  onProdutoSelect: (produto: Produto) => void;
  children: React.ReactNode;
}

export default function ProdutoSearchDialog({ onProdutoSelect, children }: ProdutoSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, activeCompanyId } = useAuth();

  const searchProdutos = async (term: string) => {
    if (!term || term.length < 2) {
      setProdutos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/produtos?search=${encodeURIComponent(term)}&companyId=${activeCompanyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }

      const data = await response.json();
      setProdutos(data.produtos || []);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError('Erro ao buscar produtos. Tente novamente.');
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProdutos(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleProdutoSelect = (produto: Produto) => {
    onProdutoSelect(produto);
    setOpen(false);
    setSearchTerm('');
    setProdutos([]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getEstoqueStatus = (estoque?: number) => {
    if (estoque === undefined) return { label: 'N/A', color: 'bg-gray-100 text-gray-800' };
    if (estoque === 0) return { label: 'Sem estoque', color: 'bg-red-100 text-red-800' };
    if (estoque < 10) return { label: 'Baixo estoque', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Em estoque', color: 'bg-green-100 text-green-800' };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Produto
          </DialogTitle>
          <DialogDescription>
            Digite o código, descrição ou NCM do produto para buscar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Digite o código, descrição ou NCM..."
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
                <span className="ml-2 text-gray-600">Buscando produtos...</span>
              </div>
            ) : produtos.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>NCM</TableHead>
                    <TableHead>CFOP</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead className="text-center">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map((produto) => {
                    const estoqueStatus = getEstoqueStatus(produto.estoqueAtual);
                    
                    return (
                      <TableRow key={produto.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="font-mono text-sm font-semibold">
                            {produto.codigo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {produto.descricao}
                            </div>
                            {produto.categoria && (
                              <div className="text-sm text-gray-600">
                                {produto.categoria}
                              </div>
                            )}
                            {produto.marca && (
                              <div className="text-xs text-gray-500">
                                Marca: {produto.marca}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {produto.ncm || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {produto.cfop || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {produto.unidade || 'UN'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold text-green-600">
                              {formatCurrency(produto.valorUnitario)}
                            </div>
                            {produto.peso && (
                              <div className="text-xs text-gray-500">
                                Peso: {produto.peso}kg
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {produto.estoqueAtual !== undefined && (
                              <div className="text-sm font-mono">
                                {produto.estoqueAtual.toFixed(2)}
                              </div>
                            )}
                            <Badge className={estoqueStatus.color}>
                              {estoqueStatus.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => handleProdutoSelect(produto)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={produto.estoqueAtual === 0}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Selecionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : searchTerm.length >= 2 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum produto encontrado</p>
                <p className="text-sm">Tente uma busca diferente</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Digite pelo menos 2 caracteres para buscar</p>
                <p className="text-sm">Código, descrição ou NCM</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}










