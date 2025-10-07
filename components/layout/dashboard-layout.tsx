"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"
import type { UserRole } from "@/lib/permissions"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: UserRole
}

export function DashboardLayout({ children, userRole = "company" }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={userRole} />
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
