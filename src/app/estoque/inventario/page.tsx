"use client";

import React, { useEffect, useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Plus, X, CheckCircle2, Clock, AlertCircle, ClipboardList, Warehouse } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveCompany } from "@/hooks/useActiveCompany";
import { useFeedback } from "@/contexts/feedback-context";
import { useRouter } from "next/navigation";

type Inventario = { 
  id: string; 
  localId: string; 
  local_nome?: string;
  status: string; 
  observacao?: string; 
  createdAt: string;
  total_itens?: number;
  itens_com_diferenca?: number;
};

type LocalEstoque = {
  id: string;
  nome: string;
  codigo?: string;
};

export default function InventarioPage() {
  const router = useRouter();
  const { activeCompanyId } = useActiveCompany();
  const { openSuccess, openConfirm } = useFeedback();
  
  const [localId, setLocalId] = useState("");
  const [observacao, setObservacao] = useState("");
  const [lista, setLista] = useState<Inventario[]>([]);
  const [locais, setLocais] = useState<LocalEstoque[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const loadLocais = useCallback(async () => {
    if (!activeCompanyId) return;
    try {
      const res = await fetch(`/api/estoque/locais?companyId=${activeCompanyId}`, { cache: "no-store" });
      const json = await res.json();
      if (json?.success) setLocais(json.data || []);
    } catch (e) {
      console.error("Erro ao carregar locais:", e);
    }
  }, [activeCompanyId]);

  useEffect(() => {
    loadLocais();
  }, [loadLocais]);

  const load = useCallback(async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/estoque/inventarios?companyId=${activeCompanyId}`, { cache: 'no-store' });
      const json = await res.json();
      if (json?.success) {
        setLista(json.data || []);
      }
    } catch (e) {
      console.error("Erro ao carregar inventários:", e);
    } finally {
      setLoading(false);
    }
  }, [activeCompanyId]);

  useEffect(() => {
    load();
  }, [load]);

  const criar = async () => {
    if (!localId || !activeCompanyId) {
      openSuccess("Erro", "Selecione um local de estoque");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/estoque/inventarios', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          localId, 
          companyId: activeCompanyId,
          observacao: observacao || null,
          precalcularQtdSistema: true
        }) 
      });
      const json = await res.json();
      if (!json?.success) {
        openSuccess("Erro", json?.error || 'Erro ao criar inventário');
        return;
      }
      openSuccess("Sucesso", "Inventário criado com sucesso!");
      await load();
      setFormOpen(false);
      setLocalId("");
      setObservacao("");
    } catch (e) {
      console.error("Erro ao criar inventário:", e);
      openSuccess("Erro", "Erro ao criar inventário");
    } finally {
      setLoading(false);
    }
  };

  const abrir = (id: string) => {
    router.push(`/estoque/inventario/${id}`);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
      ABERTO: { 
        label: 'Aberto', 
        icon: <Clock className="w-4 h-4" />, 
        color: 'text-blue-700', 
        bgColor: 'bg-blue-100' 
      },
      APLICADO: { 
        label: 'Aplicado', 
        icon: <CheckCircle2 className="w-4 h-4" />, 
        color: 'text-green-700', 
        bgColor: 'bg-green-100' 
      },
      CANCELADO: { 
        label: 'Cancelado', 
        icon: <X className="w-4 h-4" />, 
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventário de Estoque</h1>
              <p className="text-gray-600">Gerencie contagens físicas e ajustes de estoque</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <ClipboardList className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </motion.div>

        {/* Botão Criar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-end"
        >
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Inventário
          </Button>
        </motion.div>

        {/* Lista de Inventários */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {lista.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum inventário encontrado</h3>
              <p className="text-gray-500">
                Clique em "Novo Inventário" para criar um novo inventário de contagem.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observação</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lista.map((inv) => {
                    const statusConfig = getStatusLabel(inv.status);
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Warehouse className="w-4 h-4 text-gray-400" />
                            <div className="text-sm font-medium text-gray-900">{inv.local_nome || inv.localId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{inv.observacao || <span className="text-gray-400">—</span>}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{formatDate(inv.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => abrir(inv.id)}
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            Abrir
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Modal Criar Inventário */}
        <AnimatePresence>
          {formOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              onClick={() => {
                setFormOpen(false);
                setLocalId("");
                setObservacao("");
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Novo Inventário</h2>
                        <p className="text-purple-100 text-sm mt-0.5">Preencha os dados para criar um novo inventário</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFormOpen(false);
                        setLocalId("");
                        setObservacao("");
                      }}
                      className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      Local de Estoque <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full h-11 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={localId}
                      onChange={(e) => setLocalId(e.target.value)}
                    >
                      <option value="">Selecione um local</option>
                      {locais.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.nome} {l.codigo ? `(${l.codigo})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Observação <span className="text-gray-400 text-xs font-normal">(opcional)</span>
                    </label>
                    <Input
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      placeholder="Ex: Inventário mensal - Depósito principal"
                      className="w-full h-11 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormOpen(false);
                      setLocalId("");
                      setObservacao("");
                    }}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={criar}
                    disabled={!localId || loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Criando...
                      </div>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
