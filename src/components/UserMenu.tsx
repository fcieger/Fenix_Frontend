'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  User,
  Building2,
  Settings,
  Shield,
  Copy,
  ChevronDown,
  LogOut,
  FileText,
  CreditCard,
  Users,
  Handshake,
  MessageSquare,
  Award,
  FileSpreadsheet,
  Download,
  MoreHorizontal,
  CheckCircle,
  ArrowRightFromLine
} from 'lucide-react';

export default function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Debug: Log dos dados do usuário (apenas quando user muda)
  useEffect(() => {
    console.log('👤 UserMenu - Dados do usuário:', {
      name: user?.name,
      email: user?.email,
      id: user?.id,
      hasUser: !!user
    });
  }, [user]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const menuItems = [
    {
      title: 'Perfil',
      icon: User,
      href: '/perfil',
      description: 'Gerenciar dados pessoais'
    },
    {
      title: 'Empresa',
      icon: Building2,
      children: [
        {
          title: 'Plano e faturamento',
          href: '/empresa/plano',
          icon: CreditCard
        },
        {
          title: 'Dados da empresa',
          href: '/empresa/dados',
          icon: Building2
        },
        {
          title: 'Marca da empresa',
          href: '/empresa/marca',
          icon: Shield
        },
        {
          title: 'Meus usuários',
          href: '/empresa/usuarios',
          icon: Users
        }
      ]
    },
    {
      title: 'Configurações gerais',
      icon: Settings,
      children: [
        {
          title: 'Certificado digital',
          href: '/configuracoes/certificado',
          icon: Award
        },
        {
          title: 'Configurações de notas fiscais',
          href: '/configuracoes/notas-fiscais',
          icon: FileSpreadsheet
        },
        {
          title: 'Importar dados',
          href: '/configuracoes/importar',
          icon: Download
        },
        {
          title: 'Mais configurações...',
          href: '/configuracoes',
          icon: MoreHorizontal
        }
      ]
    }
  ];

  const bottomItems = [
    {
      title: 'Termos de uso',
      icon: FileText,
      href: '/termos'
    },
    {
      title: 'Sair',
      icon: LogOut,
      onClick: handleLogout,
      className: 'text-red-600 hover:text-red-700'
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Botão do usuário */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-violet-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuário'}</p>
          <p className="text-xs text-gray-500">{user?.email || 'email@exemplo.com'}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">FENIX</h3>
                <p className="text-sm text-purple-100">Sistema de Gestão</p>
              </div>
            </div>
          </div>

          {/* Informações do usuário */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{user?.name || 'Usuário'}</p>
                <p className="text-sm text-gray-600">{user?.email || 'email@exemplo.com'}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">ID: {user?.id || 'N/A'}</span>
                  <button
                    onClick={copyUserId}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                    title="Copiar ID"
                  >
                    {copied ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Menu principal */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.children ? (
                  // Item com submenu
                  <div className="px-4 py-2">
                    <div className="flex items-center space-x-3 py-2">
                      <item.icon className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">{item.title}</span>
                    </div>
                    <div className="ml-8 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <button
                          key={childIndex}
                          onClick={() => {
                            if (child.href) {
                              router.push(child.href);
                            } else if (child.onClick) {
                              child.onClick();
                            }
                            setIsOpen(false);
                          }}
                          className="flex items-center space-x-3 w-full text-left py-2 px-3 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          {child.icon && <child.icon className="w-4 h-4" />}
                          <span className="text-sm">{child.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Item simples
                  <button
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href);
                      }
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full text-left py-2 px-4 hover:bg-gray-50 transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">{item.title}</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Itens do rodapé */}
          <div className="border-t border-gray-100 py-2">
            {bottomItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (item.href) {
                    router.push(item.href);
                  } else if (item.onClick) {
                    item.onClick();
                  }
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-3 w-full text-left py-2 px-4 hover:bg-gray-50 transition-colors ${item.className || ''}`}
              >
                <item.icon className="w-5 h-5 text-gray-600" />
                <span className="font-semibold">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
