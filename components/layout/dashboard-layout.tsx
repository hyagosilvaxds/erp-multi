"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"
import type { UserRole } from "@/lib/permissions"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: UserRole
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const [effectiveUserRole, setEffectiveUserRole] = useState<UserRole>('company')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // REGRA DEFINITIVA: A rota determina TUDO
    // Se começar com /admin -> sempre admin
    // Qualquer outra rota -> sempre company
    const detectedRole: UserRole = pathname?.startsWith('/admin') ? 'admin' : 'company'
    
    console.log('🔍 DashboardLayout - pathname:', pathname)
    console.log('🎯 DashboardLayout - userRole detectado:', detectedRole)
    
    setEffectiveUserRole(detectedRole)
  }, [pathname])

  // Durante o primeiro render (antes de mounted), usar 'company' como padrão seguro
  const displayRole = mounted ? effectiveUserRole : 'company'

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={displayRole} />
      <Navbar sidebarCollapsed={sidebarCollapsed} />
      <main
        className="pt-16 transition-all"
        style={{
          marginLeft: sidebarCollapsed ? "4rem" : "16rem",
        }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
