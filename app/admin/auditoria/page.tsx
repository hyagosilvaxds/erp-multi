"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, FileText, Edit, Trash2, Plus, Download, Filter } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Dados mockados de auditoria
const logsAuditoria = [
  {
    id: 1,
    dataHora: "2025-04-04 15:30:22",
    usuario: "João Silva",
    usuarioId: "user-001",
    empresa: "Tech Solutions LTDA",
    empresaId: "emp-001",
    acao: "CRIAR",
    modulo: "Lançamento Financeiro",
    registro: "LCT-2025-0123",
    descricao: "Criou lançamento: Pagamento Fornecedor ABC - R$ 5.000,00",
    dadosAnteriores: null,
    dadosNovos: {
      valor: 5000,
      data: "2025-04-04",
      descricao: "Pagamento Fornecedor ABC",
      contaContabil: "2.1.01",
      centroCusto: "Compras",
    },
    ip: "192.168.1.100",
  },
  {
    id: 2,
    dataHora: "2025-04-04 16:15:45",
    usuario: "Maria Santos",
    usuarioId: "user-002",
    empresa: "Tech Solutions LTDA",
    empresaId: "emp-001",
    acao: "EDITAR",
    modulo: "Lançamento Financeiro",
    registro: "LCT-2025-0120",
    descricao: "Alterou valor de R$ 3.200,00 para R$ 3.500,00 no lançamento LCT-2025-0120",
    dadosAnteriores: {
      valor: 3200,
      data: "2025-04-01",
      descricao: "Conta de Energia",
    },
    dadosNovos: {
      valor: 3500,
      data: "2025-04-01",
      descricao: "Conta de Energia - Ajustado",
    },
    ip: "192.168.1.105",
  },
  {
    id: 3,
    dataHora: "2025-04-04 16:20:10",
    usuario: "Maria Santos",
    usuarioId: "user-002",
    empresa: "Tech Solutions LTDA",
    empresaId: "emp-001",
    acao: "EDITAR",
    modulo: "Lançamento Financeiro",
    registro: "LCT-2025-0120",
    descricao: "Alterou data de 01/04/2025 para 03/04/2025 no lançamento LCT-2025-0120",
    dadosAnteriores: {
      valor: 3500,
      data: "2025-04-01",
      descricao: "Conta de Energia - Ajustado",
    },
    dadosNovos: {
      valor: 3500,
      data: "2025-04-03",
      descricao: "Conta de Energia - Ajustado",
    },
    ip: "192.168.1.105",
  },
  {
    id: 4,
    dataHora: "2025-04-04 09:45:00",
    usuario: "Admin Sistema",
    usuarioId: "admin-001",
    empresa: "Tech Solutions LTDA",
    empresaId: "emp-001",
    acao: "DESBLOQUEAR",
    modulo: "Período Contábil",
    registro: "PERIODO-2025-03",
    descricao: "Desbloqueou período 03/2025 para edições",
    dadosAnteriores: { bloqueado: true },
    dadosNovos: { bloqueado: false },
    ip: "192.168.1.1",
  },
  {
    id: 5,
    dataHora: "2025-04-03 18:30:00",
    usuario: "Admin Sistema",
    usuarioId: "admin-001",
    empresa: "Tech Solutions LTDA",
    empresaId: "emp-001",
    acao: "BLOQUEAR",
    modulo: "Período Contábil",
    registro: "PERIODO-2025-03",
    descricao: "Bloqueou período 03/2025 (fechamento mensal)",
    dadosAnteriores: { bloqueado: false },
    dadosNovos: { bloqueado: true },
    ip: "192.168.1.1",
  },
  {
    id: 6,
    dataHora: "2025-04-04 14:20:30",
    usuario: "Carlos Oliveira",
    usuarioId: "user-003",
    empresa: "Tech Solutions LTDA",
    empresaId: "emp-001",
    acao: "EXCLUIR",
    modulo: "Lançamento Financeiro",
    registro: "LCT-2025-0115",
    descricao: "Excluiu lançamento: Teste - R$ 100,00",
    dadosAnteriores: {
      valor: 100,
      data: "2025-04-01",
      descricao: "Teste",
      contaContabil: "1.1.01",
    },
    dadosNovos: null,
    ip: "192.168.1.110",
  },
  {
    id: 7,
    dataHora: "2025-04-04 10:15:00",
    usuario: "João Silva",
    usuarioId: "user-001",
    empresa: "Tech Solutions LTDA",
    empresaId: "emp-001",
    acao: "CONCILIAR",
    modulo: "Conciliação Bancária",
    registro: "EXT-BB-001",
    descricao: "Conciliou linha de extrato com lançamento LCT-2025-0118",
    dadosAnteriores: {
      conciliado: false,
      lancamentoVinculado: null,
    },
    dadosNovos: {
      conciliado: true,
      lancamentoVinculado: "LCT-2025-0118",
    },
    ip: "192.168.1.100",
  },
]

export default function LogsAuditoria() {
  const [filtroUsuario, setFiltroUsuario] = useState("todos")
  const [filtroAcao, setFiltroAcao] = useState("todos")
  const [filtroModulo, setFiltroModulo] = useState("todos")
  const [dataInicio, setDataInicio] = useState("2025-04-01")
  const [dataFim, setDataFim] = useState("2025-04-30")
  const [registroSelecionado, setRegistroSelecionado] = useState<any>(null)

  const logsFiltrados = logsAuditoria.filter((log) => {
    if (filtroUsuario !== "todos" && log.usuarioId !== filtroUsuario) return false
    if (filtroAcao !== "todos" && log.acao !== filtroAcao) return false
    if (filtroModulo !== "todos" && log.modulo !== filtroModulo) return false
    return true
  })

  const getBadgeVariant = (acao: string) => {
    switch (acao) {
      case "CRIAR":
        return "default"
      case "EDITAR":
        return "secondary"
      case "EXCLUIR":
        return "destructive"
      case "BLOQUEAR":
      case "DESBLOQUEAR":
        return "outline"
      case "CONCILIAR":
        return "default"
      default:
        return "secondary"
    }
  }

  const getIcone = (acao: string) => {
    switch (acao) {
      case "CRIAR":
        return <Plus className="h-3 w-3" />
      case "EDITAR":
        return <Edit className="h-3 w-3" />
      case "EXCLUIR":
        return <Trash2 className="h-3 w-3" />
      default:
        return <FileText className="h-3 w-3" />
    }
  }

  const handleExportar = () => {
    console.log("[v0] Exportando logs de auditoria:", { dataInicio, dataFim, filtroUsuario, filtroAcao, filtroModulo })
    // Implementação real geraria CSV/Excel
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Logs de Auditoria</h1>
          <p className="text-muted-foreground">Registros de todas as operações realizadas no sistema</p>
        </div>

        {/* Alerta Informativo */}
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Rastreabilidade Total</AlertTitle>
          <AlertDescription>
            Todas as alterações em lançamentos, valores e datas são registradas com informação de quem fez, quando e o
            que foi alterado. Os logs são imutáveis e mantidos por tempo indeterminado para fins de auditoria.
          </AlertDescription>
        </Alert>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refine a busca pelos logs de auditoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="user-001">João Silva</SelectItem>
                    <SelectItem value="user-002">Maria Santos</SelectItem>
                    <SelectItem value="user-003">Carlos Oliveira</SelectItem>
                    <SelectItem value="admin-001">Admin Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ação</Label>
                <Select value={filtroAcao} onValueChange={setFiltroAcao}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="CRIAR">Criar</SelectItem>
                    <SelectItem value="EDITAR">Editar</SelectItem>
                    <SelectItem value="EXCLUIR">Excluir</SelectItem>
                    <SelectItem value="BLOQUEAR">Bloquear</SelectItem>
                    <SelectItem value="DESBLOQUEAR">Desbloquear</SelectItem>
                    <SelectItem value="CONCILIAR">Conciliar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Módulo</Label>
                <Select value={filtroModulo} onValueChange={setFiltroModulo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Lançamento Financeiro">Lançamentos</SelectItem>
                    <SelectItem value="Período Contábil">Períodos</SelectItem>
                    <SelectItem value="Conciliação Bancária">Conciliação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={handleExportar}>
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Registros ({logsFiltrados.length})</CardTitle>
            <CardDescription>Histórico de operações realizadas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsFiltrados.map((log) => (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => setRegistroSelecionado(log)}
                  >
                    <TableCell className="font-mono text-xs">{log.dataHora}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{log.usuario}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(log.acao)} className="gap-1">
                        {getIcone(log.acao)}
                        {log.acao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.modulo}</TableCell>
                    <TableCell className="font-mono text-xs">{log.registro}</TableCell>
                    <TableCell className="text-sm">{log.descricao}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detalhes do Registro Selecionado */}
        {registroSelecionado && (
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalhes do Log</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setRegistroSelecionado(null)}>
                  Fechar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Data/Hora</Label>
                    <p className="font-mono text-sm">{registroSelecionado.dataHora}</p>
                  </div>
                  <div>
                    <Label>Usuário</Label>
                    <p className="text-sm">
                      {registroSelecionado.usuario} ({registroSelecionado.usuarioId})
                    </p>
                  </div>
                  <div>
                    <Label>Empresa</Label>
                    <p className="text-sm">{registroSelecionado.empresa}</p>
                  </div>
                  <div>
                    <Label>IP</Label>
                    <p className="font-mono text-sm">{registroSelecionado.ip}</p>
                  </div>
                </div>

                {registroSelecionado.dadosAnteriores && (
                  <div>
                    <Label>Dados Anteriores</Label>
                    <pre className="mt-2 rounded-lg bg-muted p-4 text-xs">
                      {JSON.stringify(registroSelecionado.dadosAnteriores, null, 2)}
                    </pre>
                  </div>
                )}

                {registroSelecionado.dadosNovos && (
                  <div>
                    <Label>Dados Novos</Label>
                    <pre className="mt-2 rounded-lg bg-muted p-4 text-xs">
                      {JSON.stringify(registroSelecionado.dadosNovos, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
