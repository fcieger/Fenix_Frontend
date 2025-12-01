'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { api } from '@/config/api';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    carregarNotificacoes();
    // Atualizar a cada 30 segundos
    const interval = setInterval(carregarNotificacoes, 30000);
    return () => clearInterval(interval);
  }, []);

  const carregarNotificacoes = async () => {
    try {
      const [countRes, notifRes] = await Promise.all([
        api.get('/notifications/nao-lidas'),
        api.get('/notifications?limite=5'),
      ]);
      setCount(countRes.data.count);
      setNotifications(notifRes.data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
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

  const formatDate = (date: string) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {count > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Notificações</h3>
                {count > 0 && (
                  <span className="text-xs text-gray-500">{count} não lida{count !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.link || '/notificacoes'}
                    onClick={() => {
                      if (!notif.lida) marcarComoLida(notif.id);
                      setShowDropdown(false);
                    }}
                    className={`block p-4 hover:bg-gray-50 transition-colors border-b ${
                      !notif.lida ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <p className={`text-sm font-medium text-gray-900 ${!notif.lida ? 'font-semibold' : ''}`}>
                          {notif.titulo}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.mensagem}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
                      </div>
                      {!notif.lida && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 ml-2" />
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Nenhuma notificação
                </div>
              )}
            </div>

            <div className="p-3 border-t bg-gray-50">
              <Link
                href="/notificacoes"
                onClick={() => setShowDropdown(false)}
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todas as notificações
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}





