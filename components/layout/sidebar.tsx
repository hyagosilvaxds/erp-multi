"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { authApi } from "@/lib/api/auth"
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  Package,
  PackageCheck,
  BarChart3,
  CreditCard,
  ShoppingCart,
  LogOut,
  RefreshCw,
  Shield,
  Wallet,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  UserPlus,
  DollarSign,
  PieChart,
  UserCircle,
  MapPin,
  FolderOpen,
  Plug,
  Scale,
  ArrowRightLeft,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UserRole } from "@/lib/permissions"
import { canAccessModule, getAccessibleModules } from "@/lib/permissions"

interface SidebarProps {
  userRole?: UserRole
}

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", module: "admin" },
  { icon: Building2, label: "Empresas", href: "/admin/empresas", module: "admin" },
  { icon: Users, label: "Usuários", href: "/admin/usuarios", module: "admin" },
  { icon: Shield, label: "Roles", href: "/admin/roles", module: "admin" },
  // Integrações e Assinaturas ocultadas
  // Relatórios (admin) ocultada
  // Configurações (admin) ocultada
]

const companyMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", module: "dashboard" },
  {
    icon: Wallet,
    label: "Financeiro",
    href: "/dashboard/financeiro",
    module: "financeiro",
    submenu: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/financeiro" },
      { icon: CreditCard, label: "Contas Bancárias", href: "/dashboard/financeiro/contas" },
      { icon: FolderOpen, label: "Categorias", href: "/dashboard/financeiro/categorias" },
      { icon: FileSpreadsheet, label: "Extratos", href: "/dashboard/financeiro/extratos" },
      { icon: RefreshCw, label: "Conciliação", href: "/dashboard/financeiro/conciliacao" },
      { icon: Receipt, label: "Lançamentos", href: "/dashboard/financeiro/lancamentos" },
      { icon: TrendingUp, label: "Contas a Pagar/Receber", href: "/dashboard/financeiro/contas-pagar-receber" },
      { icon: BarChart3, label: "Relatórios", href: "/dashboard/financeiro/relatorios" },
    ],
  },
  {
    icon: UserPlus,
    label: "Investidores SCP",
    href: "/dashboard/investidores",
    module: "investidores",
    submenu: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/investidores" },
      { icon: Users, label: "Investidores", href: "/dashboard/investidores/novo" },
      { icon: Briefcase, label: "Projetos", href: "/dashboard/investidores/projetos" },
      { icon: DollarSign, label: "Aportes", href: "/dashboard/investidores/aportes" },
      { icon: PieChart, label: "Políticas", href: "/dashboard/investidores/politicas" },
      { icon: TrendingUp, label: "Distribuições", href: "/dashboard/investidores/distribuicoes" },
      { icon: FileSpreadsheet, label: "Relatórios", href: "/dashboard/investidores/relatorios" },
    ],
  },
  {
    icon: UserCircle,
    label: "RH",
    href: "/dashboard/rh",
    module: "rh",
    submenu: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/rh" },
      { icon: Users, label: "Colaboradores", href: "/dashboard/rh/colaboradores" },
      { icon: Building2, label: "Departamentos", href: "/dashboard/rh/departamentos" },
      { icon: UserPlus, label: "Cargos", href: "/dashboard/rh/cargos" },
      { icon: DollarSign, label: "Proventos & Descontos", href: "/dashboard/rh/proventos-descontos" },
      { icon: FileText, label: "Folha de Pagamento", href: "/dashboard/rh/folha" },
      { icon: Receipt, label: "Tabelas Fiscais", href: "/dashboard/rh/tabelas-fiscais" },
    ],
  },
  {
    icon: Scale,
    label: "Jurídico",
    href: "/dashboard/juridico",
    module: "juridico",
    submenu: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/juridico" },
      { icon: FileText, label: "Documentos", href: "/dashboard/juridico/documentos" },
      { icon: FolderOpen, label: "Categorias", href: "/dashboard/juridico/categorias" },
    ],
  },
  {
    icon: FolderOpen,
    label: "Documentos",
    href: "/dashboard/documentos",
    module: "documentos",
    submenu: [
      { icon: LayoutDashboard, label: "Hub de Documentos", href: "/dashboard/documentos" },
      { icon: FileText, label: "Busca Avançada", href: "/dashboard/documentos/busca" },
      { icon: Shield, label: "Alertas de Validade", href: "/dashboard/documentos/alertas" },
    ],
  },
  { icon: ShoppingCart, label: "Vendas", href: "/dashboard/vendas", module: "vendas" },
  {
    icon: Package,
    label: "Produtos",
    href: "/dashboard/produtos",
    module: "produtos",
    submenu: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/produtos" },
      { icon: Package, label: "Lista de Produtos", href: "/dashboard/produtos/lista" },
      { icon: PackageCheck, label: "Estoque", href: "/dashboard/produtos/estoque" },
      { icon: Settings, label: "Configurações", href: "/dashboard/produtos/configuracoes" },
    ],
  },
  { icon: Users, label: "Clientes", href: "/dashboard/clientes", module: "clientes" },
  { icon: FileText, label: "Relatórios", href: "/dashboard/relatorios", module: "relatorios" },
  { icon: Settings, label: "Configurações", href: "/dashboard/configuracoes", module: "configuracoes" },
]

export function Sidebar({ userRole = "company" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()
  const router = useRouter()
  
  console.log('📊 Sidebar - userRole recebido:', userRole)
  console.log('📊 Sidebar - pathname:', pathname)
  
  const menuItems = userRole === "admin" ? adminMenuItems : companyMenuItems

  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  useEffect(() => {
    console.log('🔄 Sidebar useEffect - userRole:', userRole)
    // Carregar usuário logado
    const user = authApi.getUser()
    setCurrentUser(user)

    if (userRole === "company") {
      const company = localStorage.getItem("selectedCompany")
      if (company) {
        const parsedCompany = JSON.parse(company)
        setSelectedCompany(parsedCompany)
        
        // Extrair permissões do usuário
        const permissions = parsedCompany?.role?.permissions || []
        const permissionNames = permissions.map((p: any) => `${p.resource}.${p.action}`)
        setUserPermissions(permissionNames)
        
        console.log('🔐 Permissões do usuário:', permissionNames)
      }
    }
  }, [userRole])

  const handleChangeCompany = () => {
    router.push("/selecionar-empresa")
  }

  const handleLogout = () => {
    authApi.logout()
  }

  const toggleSubmenu = (href: string) => {
    setExpandedMenus((prev) => (prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]))
  }

  const isSubmenuActive = (submenu: any[]) => {
    return submenu.some((item) => pathname === item.href)
  }

  // Verificar se o usuário tem permissão para acessar o módulo de documentos
  const hasDocumentsPermission = (): boolean => {
    // Admin sempre tem acesso
    if (userRole === "admin") return true
    
    // Se não estiver no modo company, mostrar
    if (userRole !== "company") return true
    
    // Verificar permissão de documents.read no backend
    return userPermissions.includes('documents.read') || 
           userPermissions.includes('documents.view')
  }

  // Verificar se o módulo deve ser exibido
  const shouldShowModule = (module: string): boolean => {
    // Apenas ocultar o módulo de documentos se não tiver permissão
    if (module === 'documentos') {
      return hasDocumentsPermission()
    }
    
    // Todos os outros módulos são exibidos
    return true
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">ERP Multi</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent", collapsed && "mx-auto")}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {!collapsed && userRole === "company" && selectedCompany && (
          <div className="border-b border-sidebar-border p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto w-full justify-start gap-2 p-2 hover:bg-sidebar-accent">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="truncate text-sm font-medium text-sidebar-foreground">
                      {selectedCompany.nomeFantasia || selectedCompany.razaoSocial}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{selectedCompany.cnpj}</p>
                  </div>
                  <RefreshCw className="h-3 w-3 shrink-0 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Empresa Atual</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleChangeCompany}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Trocar de Empresa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {menuItems
            .filter((item) => shouldShowModule(item.module))
            .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
          const hasSubmenu = Array.isArray((item as any).submenu)
            const isExpanded = expandedMenus.includes(item.href)
          const hasActiveSubmenu = hasSubmenu && isSubmenuActive((item as any).submenu)

            return (
              <div key={item.href}>
                {hasSubmenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        hasActiveSubmenu
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronLeft className={cn("h-4 w-4 transition-transform", isExpanded && "-rotate-90")} />
                        </>
                      )}
                    </button>
                    {!collapsed && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-2">
                        {((item as any).submenu || []).map((subitem: any) => {
                          const SubIcon = subitem.icon
                          const isSubActive = pathname === subitem.href
                          return (
                            <Link
                              key={subitem.href}
                              href={subitem.href}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                isSubActive
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                              )}
                            >
                              <SubIcon className="h-4 w-4 shrink-0" />
                              <span>{subitem.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      collapsed && "justify-center",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        {/* User Info */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto w-full justify-start gap-3 p-0 hover:bg-transparent">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="text-sm font-semibold">
                      {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="truncate text-sm font-medium text-sidebar-foreground">
                      {currentUser?.name || 'Usuário'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {currentUser?.email || 'email@exemplo.com'}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </aside>
  )
}
