/**
 * Sistema de Permissões - Modelo Simples e Prático
 * 
 * Roles disponíveis:
 * - Admin: acesso total ao sistema
 * - Financeiro: ver/editar financeiro, exportar, sem RH/Jurídico
 * - RH: ver/editar pessoas e folha, sem financeiro
 * - Jurídico: ver/editar documentos jurídicos, criar pastas, sem financeiro
 * - Contador: leitura em financeiro + exportações, sem RH
 * - Investidor: leitura de relatórios liberados + informes
 */

export type UserRole = "admin" | "financeiro" | "rh" | "juridico" | "contador" | "investidor" | "company"

export type PermissionModule = 
  | "dashboard"
  | "financeiro"
  | "rh"
  | "juridico"
  | "documentos"
  | "investidores"
  | "vendas"
  | "produtos"
  | "clientes"
  | "relatorios"
  | "configuracoes"
  | "admin"

export type PermissionAction = "view" | "create" | "edit" | "delete" | "export" | "import" | "approve"

/**
 * Matriz de permissões por role
 */
export const PERMISSIONS_MATRIX: Record<UserRole, Partial<Record<PermissionModule, PermissionAction[]>>> = {
  admin: {
    // Admin tem acesso total a tudo
    dashboard: ["view", "export"],
    financeiro: ["view", "create", "edit", "delete", "export", "import", "approve"],
    rh: ["view", "create", "edit", "delete", "export"],
    juridico: ["view", "create", "edit", "delete", "export"],
    documentos: ["view", "create", "edit", "delete", "export"],
    investidores: ["view", "create", "edit", "delete", "export", "approve"],
    vendas: ["view", "create", "edit", "delete", "export", "approve"],
    produtos: ["view", "create", "edit", "delete", "export"],
    clientes: ["view", "create", "edit", "delete", "export"],
    relatorios: ["view", "export"],
    configuracoes: ["view", "edit"],
    admin: ["view", "create", "edit", "delete"],
  },
  
  financeiro: {
    // Financeiro: ver/editar financeiro, exportar, SEM RH/Jurídico
    dashboard: ["view"],
    financeiro: ["view", "create", "edit", "delete", "export", "import"],
    documentos: ["view"], // Apenas documentos financeiros
    investidores: ["view"], // Visualização apenas
    vendas: ["view"], // Visualização de vendas para contexto
    relatorios: ["view", "export"],
  },
  
  rh: {
    // RH: ver/editar pessoas e folha, SEM financeiro
    dashboard: ["view"],
    rh: ["view", "create", "edit", "delete", "export"],
    documentos: ["view", "create"], // Documentos de RH
    relatorios: ["view", "export"], // Relatórios de RH
  },
  
  juridico: {
    // Jurídico: ver/editar documentos jurídicos, criar pastas, SEM financeiro
    dashboard: ["view"],
    juridico: ["view", "create", "edit", "delete", "export"],
    documentos: ["view", "create", "edit", "delete"], // Total controle de documentos
    relatorios: ["view", "export"], // Relatórios jurídicos
  },
  
  contador: {
    // Contador: leitura em financeiro + exportações, SEM RH
    dashboard: ["view"],
    financeiro: ["view", "export"], // Apenas leitura e exportação
    documentos: ["view"], // Visualização de documentos financeiros
    investidores: ["view"], // Visualização para contexto contábil
    relatorios: ["view", "export"],
  },
  
  investidor: {
    // Investidor: leitura de relatórios liberados + informes
    dashboard: ["view"],
    investidores: ["view"], // Apenas seus próprios dados
    relatorios: ["view", "export"], // Relatórios liberados
    documentos: ["view"], // Documentos liberados
  },

  company: {
    // Company (padrão): acesso básico aos módulos da empresa
    dashboard: ["view", "export"],
    financeiro: ["view", "create", "edit", "delete", "export", "import"],
    rh: ["view", "create", "edit", "delete", "export"],
    juridico: ["view", "create", "edit", "export"],
    documentos: ["view", "create", "edit", "delete", "export"],
    investidores: ["view", "create", "edit", "delete", "export"],
    vendas: ["view", "create", "edit", "delete", "export"],
    produtos: ["view", "create", "edit", "delete", "export"],
    clientes: ["view", "create", "edit", "delete", "export"],
    relatorios: ["view", "export"],
    configuracoes: ["view", "edit"],
  },
}

/**
 * Verifica se um usuário tem permissão para uma ação em um módulo
 */
export function hasPermission(
  userRole: UserRole,
  module: PermissionModule,
  action: PermissionAction
): boolean {
  const rolePermissions = PERMISSIONS_MATRIX[userRole]
  
  if (!rolePermissions) return false
  
  const modulePermissions = rolePermissions[module]
  
  if (!modulePermissions) return false
  
  return modulePermissions.includes(action)
}

/**
 * Retorna todos os módulos que um usuário pode acessar
 */
export function getAccessibleModules(userRole: UserRole): PermissionModule[] {
  const rolePermissions = PERMISSIONS_MATRIX[userRole]
  
  if (!rolePermissions) return []
  
  return Object.keys(rolePermissions) as PermissionModule[]
}

/**
 * Verifica se um usuário pode acessar um módulo (qualquer ação)
 */
export function canAccessModule(userRole: UserRole, module: PermissionModule): boolean {
  const rolePermissions = PERMISSIONS_MATRIX[userRole]
  
  if (!rolePermissions) return false
  
  return module in rolePermissions
}

/**
 * Retorna as ações permitidas para um módulo
 */
export function getModuleActions(userRole: UserRole, module: PermissionModule): PermissionAction[] {
  const rolePermissions = PERMISSIONS_MATRIX[userRole]
  
  if (!rolePermissions) return []
  
  return rolePermissions[module] || []
}

/**
 * Labels amigáveis para roles
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  financeiro: "Financeiro",
  rh: "Recursos Humanos",
  juridico: "Jurídico",
  contador: "Contador",
  investidor: "Investidor",
  company: "Empresa",
}

/**
 * Descrições das roles
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Acesso total ao sistema",
  financeiro: "Acesso completo ao financeiro, exportações e documentos financeiros. Sem acesso a RH e Jurídico.",
  rh: "Gerenciamento de colaboradores, folha de pagamento e documentos de RH. Sem acesso ao financeiro.",
  juridico: "Gerenciamento de documentos jurídicos, contratos e processos. Sem acesso ao financeiro.",
  contador: "Acesso de leitura ao financeiro com permissão de exportação. Ideal para escritórios de contabilidade.",
  investidor: "Acesso restrito aos relatórios e informes dos projetos autorizados.",
  company: "Acesso padrão aos módulos da empresa",
}

/**
 * Ícones para cada módulo
 */
export const MODULE_ICONS: Record<PermissionModule, string> = {
  dashboard: "LayoutDashboard",
  financeiro: "Wallet",
  rh: "UserCircle",
  juridico: "Scale",
  documentos: "FolderOpen",
  investidores: "UserPlus",
  vendas: "ShoppingCart",
  produtos: "Package",
  clientes: "Users",
  relatorios: "BarChart3",
  configuracoes: "Settings",
  admin: "Shield",
}

/**
 * Labels para módulos
 */
export const MODULE_LABELS: Record<PermissionModule, string> = {
  dashboard: "Dashboard",
  financeiro: "Financeiro",
  rh: "Recursos Humanos",
  juridico: "Jurídico",
  documentos: "Documentos",
  investidores: "Investidores",
  vendas: "Vendas",
  produtos: "Produtos",
  clientes: "Clientes",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
  admin: "Administração",
}

/**
 * Labels para ações
 */
export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "Visualizar",
  create: "Criar",
  edit: "Editar",
  delete: "Excluir",
  export: "Exportar",
  import: "Importar",
  approve: "Aprovar",
}
