'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, 
  Search, 
  Loader2, 
  PlayCircle, 
  Trash2, 
  ShoppingCart, 
  User, 
  DollarSign,
  Package,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/toast';

interface VendaSuspensa {
  id: string;
  nome: string;
  dados: any;
  dataSuspensao: string;
  usuario_nome?: string;
}

interface ListaVendasSuspensasProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caixaId: string;
  companyId: string;
  token: string;
  onRecuperar: (vendaSuspensa: VendaSuspensa) => void;
}

export function ListaVendasSuspensas({
  open,
  onOpenChange,
  caixaId,
  companyId,
  token,
  onRecuperar
}: ListaVendasSuspensasProps) {
  const { success, error: showError } = useToast();
  const [vendasSuspensas, setVendasSuspensas] = useState<VendaSuspensa[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      carregarVendasSuspensas();
    }
  }, [open]);

  const carregarVendasSuspensas = async () => {
    if (!token || !companyId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/caixa/vendas-suspensas?company_id=${companyId}&caixa_id=${caixaId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setVendasSuspensas(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar vendas suspensas:', err);
      showError('Erro', 'Erro ao carregar vendas suspensas');
    } finally {
      setLoading(false);
    }
  };

  const excluirVenda = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta venda suspensa?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/caixa/vendas-suspensas/${id}?company_id=${companyId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao excluir venda');
      }

      success('Venda excluída!', 'A venda suspensa foi removida');
      carregarVendasSuspensas();
    } catch (err: any) {
      console.error('Erro ao excluir venda:', err);
      showError('Erro', err.message || 'Erro ao excluir venda');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h atrás`;
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const vendasFiltradas = vendasSuspensas.filter(venda => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return venda.nome.toLowerCase().includes(term);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            Vendas Suspensas
          </DialogTitle>
          <DialogDescription>
            Recupere ou exclua vendas que foram pausadas
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
                <span className="ml-3 text-gray-600">Carregando...</span>
              </div>
            ) : vendasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium text-lg mb-2">
                  {vendasSuspensas.length === 0 
                    ? 'Nenhuma venda suspensa'
                    : 'Nenhuma venda encontrada'}
                </p>
                <p className="text-sm text-gray-400">
                  {vendasSuspensas.length === 0
                    ? 'Vendas pausadas aparecerão aqui'
                    : 'Tente outro termo de busca'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {vendasFiltradas.map((venda, index) => {
                    const quantidadeItens = venda.dados?.itens?.length || 0;
                    const valorTotal = venda.dados?.itens?.reduce((sum: number, item: any) => sum + item.valorTotal, 0) || 0;
                    const clienteNome = venda.dados?.cliente?.nome || 'Cliente Avulso';

                    return (
                      <motion.div
                        key={venda.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900 mb-1">
                                  {venda.nome}
                                </h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(venda.dataSuspensao)}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <User className="h-4 w-4" />
                                <span className="truncate">{clienteNome}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Package className="h-4 w-4" />
                                <span>{quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-semibold text-gray-900">{formatCurrency(valorTotal)}</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => excluirVenda(venda.id)}
                                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  onRecuperar(venda);
                                  onOpenChange(false);
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Recuperar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Rodapé */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-gray-600">
              {vendasSuspensas.length} venda{vendasSuspensas.length !== 1 ? 's' : ''} suspensa{vendasSuspensas.length !== 1 ? 's' : ''}
            </p>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



