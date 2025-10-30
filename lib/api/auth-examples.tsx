/**
 * EXEMPLOS DE USO DA API DE AUTENTICAÇÃO
 * 
 * Este arquivo contém exemplos de como usar as funções de autenticação
 * em diferentes partes da aplicação.
 */

import { authApi, type Company, type Permission } from '@/lib/api/auth'

// ============================================
// 1. EXEMPLO: Verificar se usuário está autenticado
// ============================================
export function ExemploVerificarAuth() {
  const isAuthenticated = authApi.isAuthenticated()
  
  if (!isAuthenticated) {
    // Redirecionar para login
    window.location.href = '/login'
  }
}

// ============================================
// 2. EXEMPLO: Obter dados do usuário
// ============================================
export function ExemploObterUsuario() {
  const user = authApi.getUser()
  
  if (user) {
    console.log('Nome:', user.name)
    console.log('Email:', user.email)
    console.log('Empresas:', user.companies)
  }
}

// ============================================
// 3. EXEMPLO: Obter empresas do usuário
// ============================================
export function ExemploObterEmpresas() {
  const companies = authApi.getCompanies()
  
  if (companies) {
    companies.forEach((company: Company) => {
      console.log('Empresa:', company.nomeFantasia)
      console.log('Razão Social:', company.razaoSocial)
      console.log('CNPJ:', company.cnpj)
      console.log('Role:', company.role.name)
      console.log('Permissões:', company.role.permissions.length)
    })
  }
}

// ============================================
// 3.1. EXEMPLO: Buscar empresas da API
// ============================================
export async function ExemploBuscarEmpresasAPI() {
  try {
    const companies = await authApi.getUserCompanies()
    console.log('Empresas carregadas:', companies)
    return companies
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
  }
}

// ============================================
// 4. EXEMPLO: Selecionar empresa e verificar permissões
// ============================================
export function ExemploSelecionarEmpresa(company: Company) {
  // Selecionar empresa
  authApi.setSelectedCompany(company)
  
  // Obter empresa selecionada
  const selectedCompany = authApi.getSelectedCompany()
  console.log('Empresa selecionada:', selectedCompany?.nomeFantasia)
  
  // Obter permissões da empresa selecionada
  const permissions = authApi.getSelectedCompanyPermissions()
  console.log('Permissões:', permissions)
}

// ============================================
// 5. EXEMPLO: Verificar se usuário tem permissão específica
// ============================================
export function ExemploVerificarPermissao(resource: string, action: string) {
  const permissions = authApi.getSelectedCompanyPermissions()
  
  const hasPermission = permissions.some(
    (p: Permission) => p.resource === resource && p.action === action
  )
  
  return hasPermission
}

// ============================================
// 6. EXEMPLO: Hook personalizado para usar em componentes
// ============================================
import { useState, useEffect } from 'react'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(authApi.getUser())
  const [selectedCompany, setSelectedCompany] = useState(authApi.getSelectedCompany())

  useEffect(() => {
    setIsAuthenticated(authApi.isAuthenticated())
  }, [])

  const selectCompany = (company: Company) => {
    authApi.setSelectedCompany(company)
    setSelectedCompany(company)
  }

  const logout = () => {
    authApi.logout()
  }

  const hasPermission = (resource: string, action: string) => {
    const permissions = authApi.getSelectedCompanyPermissions()
    return permissions.some(
      (p: Permission) => p.resource === resource && p.action === action
    )
  }

  return {
    isAuthenticated,
    user,
    selectedCompany,
    selectCompany,
    logout,
    hasPermission,
  }
}

// ============================================
// 7. EXEMPLO: Componente que usa o hook
// ============================================
export function ExemploComponenteComAuth() {
  const { isAuthenticated, user, selectedCompany, logout, hasPermission } = useAuth()

  if (!isAuthenticated) {
    return <div>Por favor, faça login</div>
  }

  const canCreateUsers = hasPermission('users', 'create')

  return (
    <div>
      <h1>Bem-vindo, {user?.name}</h1>
      {selectedCompany && (
        <p>Empresa: {selectedCompany.nomeFantasia}</p>
      )}
      {canCreateUsers && (
        <button>Criar Usuário</button>
      )}
      <button onClick={logout}>Sair</button>
    </div>
  )
}

// ============================================
// 8. EXEMPLO: Atualizar perfil do usuário
// ============================================
export async function ExemploAtualizarPerfil() {
  try {
    const updatedUser = await authApi.getProfile()
    console.log('Perfil atualizado:', updatedUser)
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
  }
}

// ============================================
// 9. EXEMPLO: Middleware para proteger rotas
// ============================================
export function protegerRota() {
  if (typeof window !== 'undefined') {
    const isAuthenticated = authApi.isAuthenticated()
    
    if (!isAuthenticated) {
      window.location.href = '/login'
      return false
    }
    
    return true
  }
  return false
}

// ============================================
// 10. EXEMPLO: Verificar role do usuário
// ============================================
export function verificarRole(roleName: string): boolean {
  const selectedCompany = authApi.getSelectedCompany()
  return selectedCompany?.role.name === roleName
}
