"use client";

import React, { useEffect, useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Save, ArrowLeft, ClipboardList, Warehouse, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useActiveCompany } from "@/hooks/useActiveCompany";
import { useFeedback } from "@/contexts/feedback-context";
import { useRouter, useParams } from "next/navigation";

type ItemInv = { 
  id: string; 
  inventarioId: string; 
  produtoId: string;
  produto_nome?: string;
  produto_sku?: string;
  qtdSistema: number; 
  qtdContada: number; 
  diferenca: number;
  observacoes?: string;
};

type Inventario = {
  id: string;
  localId: string;
  local_nome?: string;
  status: string;
  observacao?: string;
  createdAt: string;
};

export default function InventarioEditarPage() {
  const router = useRouter();
  const params = useParams();
  const { activeCompanyId } = useActiveCompany();
  const { openSuccess, openConfirm } = useFeedback();
  
  const [inventario, setInventario] = useState<Inventario | null>(null);
  const [itens, setItens] = useState<ItemInv[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const id = params?.id as string;
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/estoque/inventarios/${id}`, { cache: 'no-store' });
      const json = await res.json();
      if (!json?.success) {
        openSuccess("Erro", json?.error || 'Erro ao carregar inventário');
        router.push('/estoque/inventario');
        return;
      }
      
      setInventario(json.data.inventario);
      setItens(json.data.itens || []);
    } catch (e) {
      console.error("Erro ao carregar inventário:", e);
      openSuccess("Erro", "Erro ao carregar inventário");
      router.push('/estoque/inventario');
    } finally {
      setLoading(false);
    }
  }, [params?.id, router, openSuccess]);

  useEffect(() => {
    load();
  }, [load]);

  const updateItemContagem = (itemId: string, value: string) => {
    setItens(prev => prev.map(item => {
      if (item.id === itemId) {
        // Permitir string vazia ou qualquer valor numérico válido
        let qtdContada: number | null = null;
        if (value !== '' && value !== null && value !== undefined) {
          const numValue = Number(value);
          if (!isNaN(numValue) && numValue >= 0) {
            qtdContada = numValue;
          }
        }
        const diferenca = qtdContada !== null ? qtdContada - item.qtdSistema : 0;
        return { ...item, qtdContada, diferenca };
      }
      return item;
    }));
  };

  const salvar = async () => {
    if (!inventario || !activeCompanyId) return;
    
    // Primeiro, salvar todas as contagens atualizadas (incluindo zero)
    const itensComContagem = itens.filter(item => {
      const qtd = item.qtdContada;
      return qtd !== null && qtd !== undefined && qtd !== '';
    });
    
    if (itensComContagem.length === 0) {
      openSuccess("Atenção", "Nenhuma contagem foi preenchida");
      return;
    }

    setSaving(true);
    try {
      // Salvar contagens via API
      const payload = {
        itens: itensComContagem.map(item => ({
          produtoId: item.produtoId,
          qtdContada: Number(item.qtdContada) || 0,
          observacoes: item.observacoes || null
        }))
      };
      
      const resContagens = await fetch(`/api/estoque/inventarios/${inventario.id}/contagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const jsonContagens = await resContagens.json();
      if (!jsonContagens?.success) {
        openSuccess("Erro", jsonContagens?.error || 'Erro ao salvar contagens');
        return;
      }
      
      // Recarregar itens atualizados
      const resReload = await fetch(`/api/estoque/inventarios/${inventario.id}`, { cache: 'no-store' });
      const jsonReload = await resReload.json();
      if (jsonReload?.success) {
        setItens(jsonReload.data.itens || []);
      }
      
      // Identificar itens com diferença usando os dados recarregados
      const itensRecarregados = jsonReload?.success ? jsonReload.data.itens || [] : itens;
      const itensComDiferenca = itensRecarregados.filter((item: ItemInv) => {
        const diferenca = Math.abs((item.qtdContada || 0) - item.qtdSistema);
        return diferenca > 0.001; // Tolerância para diferenças mínimas
      });

      if (itensComDiferenca.length === 0) {
        openSuccess("Sucesso", "Contagens salvas! Não há diferenças para aplicar.");
        return;
      }

      const confirmou = await openConfirm(
        "Aplicar Inventário",
        `Deseja aplicar as diferenças encontradas em ${itensComDiferenca.length} item(ns)? Serão gerados movimentos de ajuste para cada diferença.`
      );
      
      if (!confirmou) {
        openSuccess("Sucesso", "Contagens salvas com sucesso!");
        return;
      }
      
      // Para cada item com diferença, criar dois movimentos:
      // 1. Saída para zerar o saldo atual
      // 2. Entrada para ajustar ao valor contado
      
      for (const item of itensComDiferenca) {
        const qtdSistema = Number(item.qtdSistema) || 0;
        const qtdContada = Number(item.qtdContada) || 0;
        
        // Movimento 1: Saída para zerar
        if (qtdSistema > 0) {
          const resSaida = await fetch('/api/estoque/movimentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              produtoId: item.produtoId,
              tipo: 'saida',
              qtd: qtdSistema,
              localOrigemId: inventario.localId,
              localDestinoId: null,
              custoUnitario: 0,
              origem: 'inventario',
              origemId: inventario.id,
              dataMov: new Date().toISOString(),
              companyId: activeCompanyId
            })
          });
          const jsonSaida = await resSaida.json();
          if (!jsonSaida?.success) {
            console.error('Erro ao criar movimento de saída:', jsonSaida);
          }
        }
        
        // Movimento 2: Entrada para ajustar ao valor contado
        if (qtdContada > 0) {
          const resEntrada = await fetch('/api/estoque/movimentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              produtoId: item.produtoId,
              tipo: 'entrada',
              qtd: qtdContada,
              localOrigemId: null,
              localDestinoId: inventario.localId,
              custoUnitario: 0,
              origem: 'inventario',
              origemId: inventario.id,
              dataMov: new Date().toISOString(),
              companyId: activeCompanyId
            })
          });
          const jsonEntrada = await resEntrada.json();
          if (!jsonEntrada?.success) {
            console.error('Erro ao criar movimento de entrada:', jsonEntrada);
          }
        }
      }

      // Atualizar status do inventário
      await fetch(`/api/estoque/inventarios/${inventario.id}/aplicar`, { method: 'POST' });
      
      openSuccess("Sucesso", "Inventário aplicado com sucesso!");
      router.push('/estoque/inventario');
    } catch (e) {
      console.error("Erro ao aplicar inventário:", e);
      openSuccess("Erro", "Erro ao aplicar inventário");
    } finally {
      setSaving(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
      ABERTO: { 
        label: 'Aberto', 
        icon: <AlertCircle className="w-4 h-4" />, 
        color: 'text-blue-700', 
        bgColor: 'bg-blue-100' 
      },
      APLICADO: { 
        label: 'Aplicado', 
        icon: <Package className="w-4 h-4" />, 
        color: 'text-green-700', 
        bgColor: 'bg-green-100' 
      },
      CANCELADO: { 
        label: 'Cancelado', 
        icon: <AlertCircle className="w-4 h-4" />, 
        color: 'text-red-700', 
        bgColor: 'bg-red-100' 
      },
    };
    return labels[status.toUpperCase()] || { 
      label: status, 
      icon: <AlertCircle className="w-4 h-4" />, 
      color: 'text-gray-700', 
      bgColor: 'bg-gray-100' 
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando inventário...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!inventario) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Inventário não encontrado</h2>
            <Button onClick={() => router.push('/estoque/inventario')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const statusConfig = getStatusLabel(inventario.status);
  const itensComDiferenca = itens.filter(item => Math.abs(item.diferenca) > 0.001);
  const itensComContagem = itens.filter(item => {
    const qtd = item.qtdContada;
    return qtd !== null && qtd !== undefined && qtd !== '';
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/estoque/inventario')}
                className="border-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Inventário</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4" />
                    <span>{inventario.local_nome || inventario.localId}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>
            {inventario.status?.toUpperCase() === 'ABERTO' && (
              <Button
                onClick={salvar}
                disabled={saving || itensComContagem.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar e Aplicar
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold text-gray-900">{itens.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Itens com Diferença</p>
                <p className="text-2xl font-bold text-gray-900">{itensComDiferenca.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Itens Sem Diferença</p>
                <p className="text-2xl font-bold text-gray-900">{itens.length - itensComDiferenca.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabela de Itens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {itens.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item no inventário</h3>
              <p className="text-gray-500">
                Este inventário não possui itens para contagem.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd Sistema</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd Contada</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Diferença</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {itens.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.produto_nome || item.produtoId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.produto_sku || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900 font-medium">{Number(item.qtdSistema).toFixed(3)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-end">
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            value={item.qtdContada == null ? "" : String(item.qtdContada)}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateItemContagem(item.id, val);
                            }}
                            className="w-32 h-9 text-right border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="0.000"
                            disabled={inventario.status?.toUpperCase() !== 'ABERTO'}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-semibold flex items-center justify-end gap-1 ${
                          Number(item.diferenca) < 0 
                            ? 'text-red-600' 
                            : Number(item.diferenca) > 0 
                            ? 'text-green-600' 
                            : 'text-gray-600'
                        }`}>
                          {Number(item.diferenca) < 0 && <TrendingDown className="w-4 h-4" />}
                          {Number(item.diferenca) > 0 && <TrendingUp className="w-4 h-4" />}
                          {Number(item.diferenca) === 0 && <Minus className="w-4 h-4" />}
                          {Number(item.diferenca).toFixed(3)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}

