'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  Home,
  Users,
  Package,
  Bot,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Building2,
  Receipt,
  ChevronDown,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';

// Menu centralizado - ÚNICA FONTE DA VERDADE
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
  { id: 'cadastros', label: 'Cadastros', icon: Users, href: '/cadastros' },
  { id: 'produtos', label: 'Produtos', icon: Package, href: '/produtos' },
  { 
    id: 'vendas', 
    label: 'Vendas', 
    icon: ShoppingCart, 
    href: '/vendas',
    submenu: [
      { id: 'pedido-venda', label: 'Pedido de Venda', href: '/vendas' }
    ]
  },
  { 
    id: 'impostos', 
    label: 'Impostos', 
    icon: Receipt, 
    href: '/impostos',
    submenu: [
      { id: 'natureza-operacao', label: 'Naturezas de Operação', href: '/impostos/natureza-operacao' }
    ]
  },
  { id: 'assistentes', label: 'Assistentes IA', icon: Bot, href: '/assistentes', badge: 'IA' },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3, href: '/relatorios' },
  { 
    id: 'configuracoes', 
    label: 'Configurações', 
    icon: Settings, 
    href: '/configuracoes',
    submenu: [
      { id: 'prazos-pagamento', label: 'Prazos de Pagamento', href: '/configuracoes/prazos-pagamento' }
    ]
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const getActiveItem = () => {
    // Verificar se algum item do menu está ativo
    for (const item of menuItems) {
      if (pathname.startsWith(item.href)) {
        return item.id;
      }
      // Verificar submenus
      if (item.submenu) {
        for (const subItem of item.submenu) {
          if (pathname.startsWith(subItem.href)) {
            return subItem.id;
          }
        }
      }
    }
    return null;
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  const toggleSubmenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const activeItem = getActiveItem();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg border border-gray-200"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl font-bold text-gray-900">Fenix</h1>
                    <p className="text-sm text-gray-500">Sistema de Gestão</p>
                  </div>
                </div>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;
                  const hasSubmenu = item.submenu && item.submenu.length > 0;
                  const isExpanded = expandedMenus.has(item.id);
                  
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => {
                          if (hasSubmenu) {
                            toggleSubmenu(item.id);
                          } else {
                            handleNavigation(item.href);
                          }
                        }}
                        className={`${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`}
                      >
                        <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.label}
                        {item.badge && (
                          <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {hasSubmenu && (
                          <span className="ml-auto">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </button>
                      
                      {/* Submenu */}
                      {hasSubmenu && isExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.submenu.map((subItem) => {
                            const isSubActive = activeItem === subItem.id;
                            return (
                              <button
                                key={subItem.id}
                                onClick={() => handleNavigation(subItem.href)}
                                className={`${
                                  isSubActive
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                } group flex items-center px-2 py-1.5 text-sm font-medium rounded-md w-full text-left`}
                              >
                                <span className="ml-4">{subItem.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'email@exemplo.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">Fenix</h1>
                  <p className="text-sm text-gray-500">Sistema de Gestão</p>
                </div>
              </div>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isExpanded = expandedMenus.has(item.id);
                
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (hasSubmenu) {
                          toggleSubmenu(item.id);
                        } else {
                          handleNavigation(item.href);
                        }
                      }}
                      className={`${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {hasSubmenu && (
                        <span className="ml-auto">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {hasSubmenu && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.submenu.map((subItem) => {
                          const isSubActive = activeItem === subItem.id;
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => handleNavigation(subItem.href)}
                              className={`${
                                isSubActive
                                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                              } group flex items-center px-2 py-1.5 text-sm font-medium rounded-md w-full text-left`}
                            >
                              <span className="ml-4">{subItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'email@exemplo.com'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
