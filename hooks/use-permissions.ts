"use client"

import { useCallback, useMemo } from "react"
import {
  type UserRole,
  type PermissionModule,
  type PermissionAction,
  hasPermission,
  canAccessModule,
  getAccessibleModules,
  getModuleActions,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
} from "@/lib/permissions"

/**
 * Hook para gerenciar permissões do usuário
 * 
 * @example
 * const { can, canAccess, modules } = usePermissions("financeiro")
 * 
 * if (can("financeiro", "edit")) {
 *   // Mostrar botão editar
 * }
 */
export function usePermissions(userRole: UserRole) {
  // Verifica se tem permissão para uma ação específica
  const can = useCallback(
    (module: PermissionModule, action: PermissionAction): boolean => {
      return hasPermission(userRole, module, action)
    },
    [userRole]
  )

  // Verifica se pode acessar um módulo
  const canAccess = useCallback(
    (module: PermissionModule): boolean => {
      return canAccessModule(userRole, module)
    },
    [userRole]
  )

  // Lista de módulos acessíveis
  const modules = useMemo(() => {
    return getAccessibleModules(userRole)
  }, [userRole])

  // Ações disponíveis para um módulo
  const getActions = useCallback(
    (module: PermissionModule): PermissionAction[] => {
      return getModuleActions(userRole, module)
    },
    [userRole]
  )

  // Informações da role
  const roleInfo = useMemo(
    () => ({
      label: ROLE_LABELS[userRole],
      description: ROLE_DESCRIPTIONS[userRole],
    }),
    [userRole]
  )

  // Verifica se é admin
  const isAdmin = useMemo(() => userRole === "admin", [userRole])

  // Verifica se tem acesso de leitura apenas
  const isReadOnly = useMemo(() => {
    // Contador e Investidor são read-only em financeiro
    return userRole === "contador" || userRole === "investidor"
  }, [userRole])

  return {
    can,
    canAccess,
    modules,
    getActions,
    roleInfo,
    isAdmin,
    isReadOnly,
    userRole,
  }
}

/**
 * Hook para proteger componentes baseado em permissões
 * 
 * @example
 * const ProtectedButton = withPermission("financeiro", "edit", 
 *   <Button>Editar</Button>
 * )
 */
export function usePermissionGuard(
  userRole: UserRole,
  module: PermissionModule,
  action: PermissionAction
) {
  const hasAccess = useMemo(
    () => hasPermission(userRole, module, action),
    [userRole, module, action]
  )

  return {
    hasAccess,
    renderIfAllowed: (component: React.ReactNode) => (hasAccess ? component : null),
  }
}
