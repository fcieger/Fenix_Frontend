"use client";

import React, { useEffect, useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Warehouse, Plus, Search as SearchIcon, CheckCircle2, XCircle, Edit2, Trash2, Save, X, Building2, Settings, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveCompany } from "@/hooks/useActiveCompany";
import { useFeedback } from "@/contexts/feedback-context";

type LocalEstoque = {
  id: string;
  nome: string;
  codigo?: string;
  ativo: boolean;
  companyId: string;
  createdAt: string;
  is_default_company_local?: boolean;
};

export default function LocaisEstoquePage() {
  const { activeCompanyId } = useActiveCompany();
  const { openSuccess, openError, openConfirm } = useFeedback();
  const [items, setItems] = useState<LocalEstoque[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [defaultCompanyLocalId, setDefaultCompanyLocalId] = useState("");
  const [configCompanyId, setConfigCompanyId] = useState("");
  const [produtoPadraoProdutoId, setProdutoPadraoProdutoId] = useState("");
  const [produtoPadraoLocalId, setProdutoPadraoLocalId] = useState("");
  const [showConfig, setShowConfig] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCompanyId) params.set("companyId", activeCompanyId);
      if (search) params.set("search", search);
      const res = await fetch(`/api/stock/locais?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (json?.success) {
        setItems(json.data || []);
        // Debug: log para verificar se os locais estão sendo retornados
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Locais carregados:', {
            total: json.data?.length || 0,
            companyId: activeCompanyId,
            locais: json.data
          });
        }
      } else {
        console.error('❌ Erro ao carregar locais:', json.error);
        if (openError) openError('Erro', json.error || 'Erro ao carregar locais de estoque'); else alert(json.error || 'Erro ao carregar locais de estoque');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar locais:', error);
      if (openError) openError('Erro', 'Erro ao carregar locais: ' + error.message); else alert('Erro ao carregar locais: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [activeCompanyId, search, openError]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditId(null);
    setNome("");
    setCodigo("");
    setAtivo(true);
  };

  const submit = async () => {
    if (!nome || !activeCompanyId) {
      if (openError) openError('Erro', activeCompanyId ? "Preencha o nome" : "Nenhuma empresa selecionada"); else alert(activeCompanyId ? 'Preencha o nome' : 'Nenhuma empresa selecionada');
      return;
    }
    setSaving(true);
    try {
      const payload = { nome, codigo: codigo || undefined, ativo, companyId: activeCompanyId } as any;
      let res: Response;
      if (editId) {
        res = await fetch(`/api/stock/locais`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...payload }),
        });
      } else {
        res = await fetch(`/api/stock/locais`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const json = await res.json();
      if (!json?.success) {
        if (openError) openError('Erro', json?.error || "Erro ao salvar"); else alert(json?.error || 'Erro ao salvar');
        return;
      }
      setFormOpen(false);
      resetForm();
      load();
      if (openSuccess) openSuccess('Sucesso', editId ? 'Local atualizado com sucesso!' : 'Local criado com sucesso!');
    } catch (error: any) {
      if (openError) openError('Erro', 'Erro ao salvar local: ' + error.message); else alert('Erro ao salvar local: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (loc: LocalEstoque) => {
    setEditId(loc.id);
    setNome(loc.nome);
    setCodigo(loc.codigo || "");
    setAtivo(loc.ativo);
    setFormOpen(true);
  };

  const remove = async (id: string) => {
    const confirmed = await (openConfirm ? openConfirm({
      title: 'Confirmar exclusão',
      message: 'Tem certeza que deseja excluir este local de estoque? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    }) : Promise.resolve(confirm('Excluir local de estoque?')));
    if (!confirmed) return;
    
    const res = await fetch(`/api/stock/locais?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json?.success) {
      if (openError) openError('Erro', json?.error || "Erro ao excluir"); else alert(json?.error || 'Erro ao excluir');
      return;
    }
    load();
    if (openSuccess) openSuccess('Sucesso', 'Local excluído com sucesso!');
  };

  const setAsDefault = async (localId: string) => {
    if (!activeCompanyId) {
      if (openError) openError('Erro', 'Nenhuma empresa selecionada'); else alert('Nenhuma empresa selecionada');
      return;
    }
    try {
      const res = await fetch('/api/stock/locais/default-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: activeCompanyId, localId })
      });
      const json = await res.json();
      if (!json?.success) {
        if (openError) openError('Erro', json?.error || 'Erro ao definir como padrão'); else alert(json?.error || 'Erro ao definir como padrão');
        return;
      }
      // Recarregar a lista para atualizar o indicador de padrão
      load();
      if (openSuccess) openSuccess('Sucesso', 'Local definido como padrão com sucesso!');
    } catch (error: any) {
      if (openError) openError('Erro', 'Erro ao definir como padrão: ' + error.message); else alert('Erro ao definir como padrão: ' + error.message);
    }
  };

  

  // Calcular estatísticas
  const stats = {
    total: items.length,
    ativos: items.filter(l => l.ativo).length,
    inativos: items.filter(l => !l.ativo).length,
    comCodigo: items.filter(l => l.codigo).length,
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Locais de Estoque</h1>
              <p className="text-gray-600">Gerencie depósitos e locais padrão</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowConfig(!showConfig)}
                variant="outline"
                className="bg-white text-purple-700 hover:bg-purple-50 border-purple-200"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button
                onClick={() => { resetForm(); setFormOpen(true); }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Local
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Warehouse className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ativos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 rounded-xl">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inativos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Com Código</p>
                <p className="text-2xl font-bold text-gray-900">{stats.comCodigo}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar locais..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && load()}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <Button onClick={load} disabled={loading} variant="outline" className="border-gray-300">
                {loading ? "Carregando..." : "Buscar"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Configurações */}
        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Configurações de Locais Padrão</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowConfig(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Local padrão da Company</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Company ID</label>
                      <Input placeholder="companyId (UUID)" value={configCompanyId} onChange={(e) => setConfigCompanyId(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Local</label>
                      <select 
                        className="w-full h-10 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={defaultCompanyLocalId} 
                        onChange={(e)=>setDefaultCompanyLocalId(e.target.value)}
                      >
                        <option value="">Selecionar...</option>
                        {items.map((l)=>(<option key={l.id} value={l.id}>{l.nome}{l.codigo?` (${l.codigo})`:''}</option>))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={async ()=>{
                          if (!configCompanyId || !defaultCompanyLocalId) return alert('Preencha companyId e local');
                          const res = await fetch('/api/stock/locais/default-company', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ companyId: configCompanyId, localId: defaultCompanyLocalId })});
                          const j = await res.json();
                          if (!j?.success) return alert(j?.error || 'Erro ao definir padrão');
                          alert('Local padrão da company atualizado.');
                          setConfigCompanyId('');
                          setDefaultCompanyLocalId('');
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Salvar padrão
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Local padrão por Produto</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Produto ID</label>
                      <Input placeholder="produtoId (UUID)" value={produtoPadraoProdutoId} onChange={(e)=>setProdutoPadraoProdutoId(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Local</label>
                      <select 
                        className="w-full h-10 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={produtoPadraoLocalId} 
                        onChange={(e)=>setProdutoPadraoLocalId(e.target.value)}
                      >
                        <option value="">Selecionar...</option>
                        {items.map((l)=>(<option key={l.id} value={l.id}>{l.nome}{l.codigo?` (${l.codigo})`:''}</option>))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={async ()=>{
                          if (!produtoPadraoProdutoId || !produtoPadraoLocalId) return alert('Preencha produtoId e local');
                          const res = await fetch('/api/stock/products/local-padrao', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ produtoId: produtoPadraoProdutoId, localId: produtoPadraoLocalId })});
                          const j = await res.json();
                          if (!j?.success) return alert(j?.error || 'Erro ao definir padrão do produto');
                          alert('Local padrão do produto atualizado.');
                          setProdutoPadraoProdutoId('');
                          setProdutoPadraoLocalId('');
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Salvar padrão do produto
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulário de criação/edição - Modal */}
        <AnimatePresence>
          {formOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              onClick={() => {
                setFormOpen(false);
                resetForm();
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
                {/* Header com gradiente */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Warehouse className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          {editId ? 'Editar Local' : 'Novo Local de Estoque'}
                        </h2>
                        <p className="text-purple-100 text-sm mt-0.5">
                          {editId ? 'Atualize as informações do local' : 'Preencha os dados para criar um novo local'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFormOpen(false);
                        resetForm();
                      }}
                      className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Depósito Principal"
                      className="w-full h-11 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && nome) {
                          e.preventDefault();
                          submit();
                        }
                      }}
                      autoFocus
                    />
                    {!nome && (
                      <p className="text-xs text-gray-500 mt-1">Digite um nome para identificar o local</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      Código <span className="text-gray-400 text-xs font-normal">(opcional)</span>
                    </label>
                    <Input
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      placeholder="Ex: DEP01"
                      className="w-full h-11 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && nome) {
                          e.preventDefault();
                          submit();
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Código único para identificação rápida</p>
                  </div>

                  {editId && (
                    <div className="flex items-center gap-3 pt-2 pb-2">
                      <input
                        id="ativo"
                        type="checkbox"
                        checked={ativo}
                        onChange={(e) => setAtivo(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                      />
                      <label htmlFor="ativo" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Local ativo e disponível para uso
                      </label>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormOpen(false);
                      resetForm();
                    }}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={submit}
                    disabled={!nome || saving}
                    className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                  >
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Salvando...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editId ? "Salvar" : "Criar"}
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Carregando locais...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Padrão</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((loc) => (
                    <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{loc.nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{loc.codigo || "—"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {loc.ativo ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-800 px-2.5 py-0.5 text-xs font-medium">
                            <XCircle className="w-3 h-3" /> Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {loc.is_default_company_local ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 px-2.5 py-0.5 text-xs font-medium">
                            <Star className="w-3 h-3 fill-yellow-600" /> Padrão
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setAsDefault(loc.id)}
                            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
                          >
                            <Star className="w-3 h-3" /> Definir como padrão
                          </Button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => startEdit(loc)} 
                            className="inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => remove(loc.id)} 
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="w-3 h-3" /> Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum local encontrado</h3>
              <p className="text-gray-500 mb-4">Crie seu primeiro local de estoque para começar.</p>
              <Button 
                onClick={() => { resetForm(); setFormOpen(true); }} 
                className="bg-purple-600 hover:bg-purple-700 text-white inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Novo Local
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
