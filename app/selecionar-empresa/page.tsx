"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, ChevronRight, Search, Users, Calendar, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Company {
  id: string
  name: string
  cnpj: string
  plan: string
  users: number
  lastAccess: string
  userRole: string
  department?: string
  logo?: string
}

export default function SelectCompanyPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const companies: Company[] = [
    {
      id: "1",
      name: "Tech Solutions LTDA",
      cnpj: "12.345.678/0001-90",
      plan: "Premium",
      users: 25,
      lastAccess: "Hoje às 14:30",
      userRole: "Administrador",
      department: "TI",
    },
    {
      id: "2",
      name: "Comércio Digital ME",
      cnpj: "98.765.432/0001-10",
      plan: "Básico",
      users: 8,
      lastAccess: "Ontem às 09:15",
      userRole: "Gerente de Vendas",
      department: "Vendas",
    },
    {
      id: "3",
      name: "Indústria Moderna S.A.",
      cnpj: "11.222.333/0001-44",
      plan: "Enterprise",
      users: 150,
      lastAccess: "15/01/2025",
      userRole: "Vendedor",
      department: "Comercial",
    },
  ]

  const filteredCompanies = companies.filter(
    (company) => company.name.toLowerCase().includes(searchTerm.toLowerCase()) || company.cnpj.includes(searchTerm),
  )

  const handleSelectCompany = (company: Company) => {
    localStorage.setItem("selectedCompany", JSON.stringify(company))
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Selecione uma Empresa</h1>
          <p className="mt-2 text-muted-foreground">Escolha qual empresa você deseja acessar</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 pl-10 text-base"
          />
        </div>

        {/* Companies List */}
        <div className="space-y-3">
          {filteredCompanies.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma empresa encontrada</p>
            </Card>
          ) : (
            filteredCompanies.map((company) => (
              <Card
                key={company.id}
                className="group cursor-pointer transition-all hover:border-primary hover:shadow-lg"
                onClick={() => handleSelectCompany(company)}
              >
                <div className="flex items-center gap-4 p-6">
                  {/* Logo */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-7 w-7" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{company.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {company.plan}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">CNPJ: {company.cnpj}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Seu cargo: <span className="font-medium text-foreground">{company.userRole}</span>
                      </span>
                      {company.department && (
                        <span className="flex items-center gap-1">Departamento: {company.department}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {company.users} usuários
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Último acesso: {company.lastAccess}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button variant="outline" onClick={() => router.push("/login")}>
            Voltar ao Login
          </Button>
          <Button variant="ghost" onClick={() => router.push("/admin")} className="text-muted-foreground">
            Acessar como Administrador
          </Button>
        </div>
      </div>
    </div>
  )
}
