"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Settings, ListFilter, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function ProdutosListaPage() {
  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lista de Produtos</h1>
            <p className="text-muted-foreground">Visualize e gerencie todos os produtos cadastrados</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/produtos/configuracoes">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Button>
            </Link>
            <Button>
              <Package className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        </div>

        {/* Em desenvolvimento */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
            <CardDescription>
              Esta funcionalidade está em desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Em breve!</h3>
              <p className="text-muted-foreground mb-6">
                A listagem completa de produtos estará disponível em breve.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/dashboard/produtos">
                  <Button variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Ver Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/produtos/configuracoes">
                  <Button>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurar Categorias e Unidades
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
