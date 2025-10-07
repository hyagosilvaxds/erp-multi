"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Download, Trash2, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

// Dados mockados
const extratosImportados = [
  {
    id: 1,
    conta: "Banco do Brasil - 1234-5",
    arquivo: "extrato_bb_marco_2025.ofx",
    dataImportacao: "2025-04-01T10:30:00",
    periodo: "01/03/2025 - 31/03/2025",
    linhas: 145,
    conciliadas: 120,
    status: "processado",
  },
  {
    id: 2,
    conta: "Itaú - 5678-9",
    arquivo: "extrato_itau_marco.csv",
    dataImportacao: "2025-04-02T14:15:00",
    periodo: "01/03/2025 - 31/03/2025",
    linhas: 98,
    conciliadas: 98,
    status: "processado",
  },
  {
    id: 3,
    conta: "Santander - 9012-3",
    arquivo: "extrato_santander_fev.ofx",
    dataImportacao: "2025-03-05T09:20:00",
    periodo: "01/02/2025 - 28/02/2025",
    linhas: 87,
    conciliadas: 75,
    status: "parcial",
  },
]

export default function Extratos() {
  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Extratos Bancários</h1>
            <p className="text-muted-foreground">Importe e gerencie extratos bancários</p>
          </div>
        <Link href="/dashboard/financeiro/extratos/importar">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Importar Extrato
          </Button>
        </Link>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Extratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{extratosImportados.length}</div>
            <p className="text-xs text-muted-foreground">Arquivos importados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linhas Importadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {extratosImportados.reduce((acc, e) => acc + e.linhas, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Transações no total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conciliação</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.round(
                (extratosImportados.reduce((acc, e) => acc + e.conciliadas, 0) /
                  extratosImportados.reduce((acc, e) => acc + e.linhas, 0)) *
                  100,
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">Linhas conciliadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Extratos */}
      <Card>
        <CardHeader>
          <CardTitle>Extratos Importados</CardTitle>
          <CardDescription>Histórico de importações realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {extratosImportados.map((extrato) => (
              <div
                key={extrato.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{extrato.arquivo}</p>
                      <Badge variant={extrato.status === "processado" ? "default" : "secondary"} className="text-xs">
                        {extrato.status === "processado" ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Processado
                          </>
                        ) : (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            Parcial
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{extrato.conta}</p>
                    <p className="text-xs text-muted-foreground">
                      Período: {extrato.periodo} | {extrato.linhas} linhas | {extrato.conciliadas} conciliadas
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Importado em {new Date(extrato.dataImportacao).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" title="Baixar arquivo">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
