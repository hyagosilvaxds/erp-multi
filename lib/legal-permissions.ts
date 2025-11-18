/**
 * Módulo de Permissões do Jurídico
 * 
 * Este arquivo define permissões específicas para o módulo jurídico,
 * mapeando para o sistema de permissões base.
 */

import { hasPermission } from './permissions'

export type LegalPermission = 'legal.read' | 'legal.create' | 'legal.update' | 'legal.delete'

/**
 * Mapeamento de permissões do módulo legal para o sistema base
 */
const LEGAL_PERMISSION_MAP: Record<LegalPermission, { module: string; action: string }> = {
  'legal.read': { module: 'juridico', action: 'view' },
  'legal.create': { module: 'juridico', action: 'create' },
  'legal.update': { module: 'juridico', action: 'edit' },
  'legal.delete': { module: 'juridico', action: 'delete' },
}

/**
 * Verifica se o usuário tem uma permissão específica do módulo jurídico
 * 
 * @param permission - Permissão do módulo legal (ex: 'legal.read')
 * @param userRole - Role do usuário (opcional, se não informado busca do localStorage)
 * @returns boolean indicando se o usuário tem a permissão
 */
export function hasLegalPermission(permission: LegalPermission, userRole?: string): boolean {
  const mapping = LEGAL_PERMISSION_MAP[permission]
  if (!mapping) return false

  // Se não tem userRole, busca do localStorage
  const role = userRole || (typeof window !== 'undefined' ? localStorage.getItem('userRole') : null)
  if (!role) return false

  return hasPermission(mapping.module as any, mapping.action as any, role as any)
}

/**
 * Hook para verificar múltiplas permissões do módulo legal
 * 
 * @param permissions - Array de permissões para verificar
 * @returns Objeto com cada permissão e seu status
 */
export function useLegalPermissions(permissions: LegalPermission[]) {
  const result: Record<string, boolean> = {}
  
  permissions.forEach(permission => {
    result[permission] = hasLegalPermission(permission)
  })
  
  return result
}

/**
 * Verifica se o usuário pode visualizar categorias
 */
export function canViewCategories(userRole?: string): boolean {
  return hasLegalPermission('legal.read', userRole)
}

/**
 * Verifica se o usuário pode criar categorias
 */
export function canCreateCategories(userRole?: string): boolean {
  return hasLegalPermission('legal.create', userRole)
}

/**
 * Verifica se o usuário pode editar categorias
 */
export function canUpdateCategories(userRole?: string): boolean {
  return hasLegalPermission('legal.update', userRole)
}

/**
 * Verifica se o usuário pode excluir categorias
 */
export function canDeleteCategories(userRole?: string): boolean {
  return hasLegalPermission('legal.delete', userRole)
}
