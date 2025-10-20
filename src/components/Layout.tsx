'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useCompanyLogo } from '@/hooks/useCompanyLogo';
import { usePageContext } from '@/hooks/usePageContext';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import PrazoPagamentoAI from './PrazoPagamentoAI';
import { Bell, Search, Menu, Building2, Sparkles } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const { logo } = useCompanyLogo();
  const pageContext = usePageContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Debug: Log da logo (apenas quando logo muda)
  useEffect(() => {
    console.log('🏢 Layout - Logo da empresa:', logo ? 'Presente' : 'Ausente');
  }, [logo]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Search Bar */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Company Logo */}
              {logo && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                    <img
                      src={logo}
                      alt="Logo da empresa"
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user?.companies?.[0]?.name || 'Empresa'}
                  </span>
                </div>
              )}
              
              {/* Notification Bell */}
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
                <Bell className="w-5 h-5" />
              </button>
              
              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>

      {/* AI Floating Button */}
      <button
        onClick={() => setIsAIOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-40 group"
        title="Gerar Prazo de Pagamento com IA"
      >
        <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
      </button>

      {/* AI Modal */}
      <PrazoPagamentoAI
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onSuccess={() => {
          setIsAIOpen(false);
          // Aqui você pode adicionar uma notificação de sucesso
        }}
        context={pageContext}
      />
    </div>
  );
}
