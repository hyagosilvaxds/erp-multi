"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Bell, Search, Moon, Sun, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/lib/permissions"

interface NavbarProps {
  sidebarCollapsed?: boolean
  userRole?: UserRole
}

export function Navbar({ sidebarCollapsed = false, userRole = "company" }: NavbarProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [notifications] = useState([
    { id: 1, title: "Nova venda registrada", time: "5 min atrás", unread: true },
    { id: 2, title: "Relatório mensal disponível", time: "1 hora atrás", unread: true },
    { id: 3, title: "Backup concluído", time: "2 horas atrás", unread: false },
  ])

  const [selectedCompany, setSelectedCompany] = useState<any>(null)

  // Carregar o tema do localStorage ao montar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Aplicar o tema e salvar no localStorage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    if (userRole === "company") {
      const company = localStorage.getItem("selectedCompany")
      if (company) {
        setSelectedCompany(JSON.parse(company))
      }
    }
  }, [userRole])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header
      className="fixed top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-6 transition-all"
      style={{
        left: sidebarCollapsed ? "4rem" : "16rem",
        width: sidebarCollapsed ? "calc(100% - 4rem)" : "calc(100% - 16rem)",
      }}
    >
      {/* Search */}
      <div className="flex flex-1 items-center gap-4">
        {!isAdminRoute && (
          <>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" placeholder="Buscar..." className="pl-10" />
            </div>

            {userRole === "company" && selectedCompany && (
              <div className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 lg:flex">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {selectedCompany.nomeFantasia || selectedCompany.razaoSocial}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Clock */}
        <div className="hidden flex-col items-end md:flex">
          <div className="font-mono text-sm font-semibold tabular-nums text-foreground">{formatTime(currentTime)}</div>
          <div className="text-xs capitalize text-muted-foreground">{formatDate(currentTime)}</div>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications 
        {!isAdminRoute && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificações</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount} novas
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="text-sm font-medium">{notification.title}</span>
                    {notification.unread && <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-sm text-primary">
                Ver todas as notificações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}*/}
      </div>
    </header>
  )
}
