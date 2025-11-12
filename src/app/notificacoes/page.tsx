'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { api } from '@/config/api';

interface Notification {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link?: string;
  lida: boolean;
  lidaEm?: string;
  createdAt: string;
}

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'nao_lidas' | 'lidas'>('todas');

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      await carregarNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      await api.post('/notifications/read-all');
      await carregarNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const excluir = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta notificação?')) return;

    try {
      await api.delete(`/notifications/${id}`);
      await carregarNotificacoes();
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    }
  };

  const notificacoesFiltradas = notifications.filter((n) => {
    if (filtro === 'nao_lidas') return !n.lida;
    if (filtro === 'lidas') return n.lida;
    return true;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const naoLidas = notifications.filter(n => !n.lida).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Bell className="h-8 w-8 mr-3 text-blue-600" />
          Notificações
        </h1>
        <p className="text-gray-600 mt-2">
          Acompanhe todas as atualizações e alertas do sistema
        </p>
      </div>

      {/* Filtros e Ações */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex space-x-2">
            {[
              { value: 'todas', label: 'Todas' },
              { value: 'nao_lidas', label: `Não Lidas (${naoLidas})` },
              { value: 'lidas', label: 'Lidas' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltro(f.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtro === f.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {naoLidas > 0 && (
            <button
              onClick={marcarTodasComoLidas}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {/* Lista de Notificações */}
      {notificacoesFiltradas.length > 0 ? (
        <div className="bg-white rounded-lg shadow divide-y">
          {notificacoesFiltradas.map((notif) => (
            <div
              key={notif.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                !notif.lida ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {notif.link ? (
                    <Link
                      href={notif.link}
                      onClick={() => !notif.lida && marcarComoLida(notif.id)}
                      className="block"
                    >
                      <h3 className={`font-medium text-gray-900 mb-1 ${!notif.lida ? 'font-semibold' : ''}`}>
                        {notif.titulo}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{notif.mensagem}</p>
                      <p className="text-xs text-gray-400">{formatDate(notif.createdAt)}</p>
                    </Link>
                  ) : (
                    <>
                      <h3 className={`font-medium text-gray-900 mb-1 ${!notif.lida ? 'font-semibold' : ''}`}>
                        {notif.titulo}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{notif.mensagem}</p>
                      <p className="text-xs text-gray-400">{formatDate(notif.createdAt)}</p>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {!notif.lida && (
                    <button
                      onClick={() => marcarComoLida(notif.id)}
                      className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                      title="Marcar como lida"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => excluir(notif.id)}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filtro === 'nao_lidas' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
          </h3>
          <p className="text-gray-600">
            {filtro === 'nao_lidas'
              ? 'Você está em dia com todas as notificações!'
              : 'Quando houver novidades, você verá aqui.'}
          </p>
        </div>
      )}
    </div>
  );
}



