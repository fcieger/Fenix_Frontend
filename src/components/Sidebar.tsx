'use client';

import { useState, useEffect } from 'react';
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
  ShoppingCart,
  Shield,
  FileText,
  DollarSign,
  CreditCard,
  TrendingUp,
  Banknote,
  Calculator,
  History,
  BookOpen,
  Target,
  Store
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
      { id: 'vendas-dashboard', label: 'Dashboard', href: '/vendas/dashboard' },
      { id: 'pedido-venda', label: 'Pedido de Venda', href: '/vendas' },
      { id: 'orcamentos', label: 'Orçamentos', href: '/orcamentos' }
    ]
  },
  { 
    id: 'frente-caixa', 
    label: 'Frente de Caixa', 
    icon: Store, 
    href: '/frente-caixa',
    submenu: [
      { id: 'frente-caixa-dashboard', label: 'Dashboard', href: '/frente-caixa/dashboard' },
      { id: 'frente-caixa-pdv', label: 'Frente de Caixa', href: '/frente-caixa' }
    ]
  },
  { 
    id: 'compras', 
    label: 'Compras', 
    icon: ShoppingCart, 
    href: '/compras',
    submenu: [
      { id: 'compras-dashboard', label: 'Dashboard', href: '/compras/dashboard' },
      { id: 'pedido-compra', label: 'Pedido de Compra', href: '/compras' }
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
  { id: 'nfe', label: 'Notas Fiscais', icon: FileText, href: '/nfe' },
  { 
    id: 'estoque',
    label: 'Estoque',
    icon: Package,
    href: '/estoque',
    submenu: [
      { id: 'estoque-saldos', label: 'Itens e Saldos', href: '/estoque/saldos' },
      { id: 'estoque-kardex', label: 'Lançamentos (Kardex)', href: '/estoque/kardex' },
      { id: 'estoque-lancamento', label: 'Lançamento Manual', href: '/estoque/lancamento' },
      { id: 'estoque-inventario', label: 'Inventário', href: '/estoque/inventario' },
      { id: 'estoque-locais', label: 'Locais de Estoque', href: '/estoque/locais' },
    ]
  },
  { 
    id: 'financeiro', 
    label: 'Financeiro', 
    icon: DollarSign, 
    href: '/financeiro',
    submenu: [
      { id: 'financeiro-dashboard', label: 'Dashboard', href: '/financeiro' },
      { id: 'banco', label: 'Banco', href: '/financeiro/banco' },
      { id: 'titulos-em-aberto', label: 'Títulos em Aberto', href: '/financeiro/titulos-em-aberto' },
      { id: 'contas-pagar', label: 'Contas a Pagar', href: '/financeiro/contas-pagar' },
      { id: 'contas-receber', label: 'Contas a Receber', href: '/financeiro/contas-receber' },
      { id: 'fluxo-caixa', label: 'Fluxo de Caixa', href: '/financeiro/fluxo-caixa' },
      { id: 'historico', label: 'Histórico', href: '/financeiro/historico' },
      { id: 'conta-contabil', label: 'Conta Contábil', href: '/financeiro/conta-contabil' },
      { id: 'centro-custo', label: 'Centro de Custo', href: '/financeiro/centro-custo' },
      { id: 'forma-pagamento', label: 'Formas de Pagamento', href: '/financeiro/forma-pagamento' },
      { id: 'prazos-pagamento', label: 'Prazos de Pagamento', href: '/configuracoes/prazos-pagamento' }
    ]
  },
  { 
    id: 'credito', 
    label: 'Crédito', 
    icon: CreditCard,
    href: '/credito',
    submenu: [
      { id: 'credito-dashboard', label: 'Dashboard', href: '/credito' },
      { id: 'credito-solicitar', label: 'Solicitar Crédito', href: '/credito/solicitar' },
      { id: 'credito-solicitacoes', label: 'Minhas Solicitações', href: '/credito/minhas-solicitacoes' },
      { id: 'credito-documentacao', label: 'Documentação', href: '/credito/documentacao' },
      { id: 'credito-propostas', label: 'Propostas', href: '/credito/propostas' },
      { id: 'credito-capital-giro', label: 'Capital de Giro', href: '/credito/capital-giro' },
      { id: 'credito-antecipacao', label: 'Antecipação', href: '/credito/antecipacao' }
    ]
  },
  { 
    id: 'aumente-vendas', 
    label: 'AUMENTE SUAS VENDAS', 
    icon: TrendingUp,
    href: '/licitacoes',
    submenu: [
      { id: 'licitacoes-dashboard', label: 'Licitações', href: '/licitacoes' },
      { id: 'licitacoes-matches', label: 'Matches IA', href: '/licitacoes/matches', badge: 'IA' },
      { id: 'licitacoes-alertas', label: 'Meus Alertas', href: '/licitacoes/alertas' }
    ]
  },
  { id: 'cursos-sebrae', label: 'Cursos Sebrae', icon: BookOpen, href: '/cursos-sebrae' },
  { id: 'assistentes', label: 'Assistentes IA', icon: Bot, href: '/assistentes', badge: 'IA' },
  { id: 'chat-ia', label: 'Chat IA', icon: Bot, href: '/chat', badge: 'NOVO' },
  { 
    id: 'relatorios', 
    label: 'Relatórios', 
    icon: BarChart3, 
    href: '/relatorios',
    submenu: [
      { id: 'relatorios-dashboard', label: 'Visão Geral', href: '/relatorios' },
      { id: 'relatorios-vendas', label: 'Vendas', href: '/relatorios/vendas' },
      { id: 'relatorios-compras', label: 'Compras', href: '/relatorios/compras' },
      { id: 'relatorios-financeiro', label: 'Financeiro', href: '/relatorios/financeiro' },
      { id: 'relatorios-estoque', label: 'Estoque', href: '/relatorios/estoque' },
      { id: 'relatorios-fiscal', label: 'Fiscal', href: '/relatorios/fiscal' },
      { id: 'relatorios-caixa', label: 'Frente de Caixa', href: '/relatorios/caixa' },
      { id: 'relatorios-geral', label: 'Geral', href: '/relatorios/geral' }
    ]
  },
  { 
    id: 'configuracoes', 
    label: 'Configurações', 
    icon: Settings, 
    href: '/configuracoes',
    submenu: [
      { id: 'configuracoes-nfe', label: 'Configurações NFe', href: '/configuracoes/nfe' },
      { id: 'certificado-digital', label: 'Certificado Digital', href: '/configuracoes/certificado' }
    ]
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Manter menu financeiro expandido quando estiver na área financeira
  useEffect(() => {
    if (pathname.startsWith('/financeiro')) {
      setExpandedMenus(prev => new Set([...prev, 'financeiro']));
    }
    // Manter menu vendas expandido quando estiver na área de vendas
    if (pathname.startsWith('/vendas') || pathname.startsWith('/orcamentos')) {
      setExpandedMenus(prev => new Set([...prev, 'vendas']));
    }
    // Manter menu compras expandido quando estiver na área de compras
    if (pathname.startsWith('/compras')) {
      setExpandedMenus(prev => new Set([...prev, 'compras']));
    }
    // Manter menu frente de caixa expandido quando estiver na área de frente de caixa
    if (pathname.startsWith('/frente-caixa')) {
      setExpandedMenus(prev => new Set([...prev, 'frente-caixa']));
    }
    // Manter menu crédito expandido quando estiver na área de crédito
    if (pathname.startsWith('/credito')) {
      setExpandedMenus(prev => new Set([...prev, 'credito']));
    }
    // Manter menu licitações expandido quando estiver na área de licitações
    if (pathname.startsWith('/licitacoes')) {
      setExpandedMenus(prev => new Set([...prev, 'aumente-vendas']));
    }
    // Manter menu relatórios expandido quando estiver na área de relatórios
    if (pathname.startsWith('/relatorios')) {
      setExpandedMenus(prev => new Set([...prev, 'relatorios']));
    }
  }, [pathname]);

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
    // Só fecha o menu em dispositivos móveis
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
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
              <div className="flex-shrink-0 flex items-center px-4 mb-2">
                <div className="flex items-center w-full p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Fenix</h1>
                    <p className="text-xs text-gray-600 font-medium">Sistema de Gestão</p>
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
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-gray-900'
                        } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg w-full text-left transition-all duration-200`}
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
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-purple-50 hover:text-gray-700'
                                } group flex items-center px-2 py-2 text-sm font-medium rounded-lg w-full text-left transition-all duration-200`}
                              >
                                <span className="ml-4">{subItem.label}</span>
                                {subItem.badge && (
                                  <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {subItem.badge}
                                  </span>
                                )}
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
            <div className="flex-shrink-0 border-t border-gray-200 p-3">
              <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'email@exemplo.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40">
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 border-r-2 border-purple-100 shadow-xl">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-2">
              <div className="flex items-center w-full p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Fenix</h1>
                  <p className="text-xs text-gray-600 font-medium">Sistema de Gestão</p>
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
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-gray-900'
                      } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg w-full text-left transition-all duration-200`}
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
                                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm'
                                  : 'text-gray-500 hover:bg-purple-50 hover:text-gray-700'
                              } group flex items-center px-2 py-2 text-sm font-medium rounded-lg w-full text-left transition-all duration-200`}
                            >
                              <span className="ml-4">{subItem.label}</span>
                              {subItem.badge && (
                                <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                  {subItem.badge}
                                </span>
                              )}
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
          <div className="flex-shrink-0 border-t border-gray-200 p-3">
            <div className="flex items-center w-full p-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'email@exemplo.com'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
