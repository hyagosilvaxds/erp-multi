"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, FileText, Save, Table } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function ImportarExtrato() {
  const router = useRouter()
  const [etapa, setEtapa] = useState<"upload" | "mapear" | "preview">("upload")
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [tipoArquivo, setTipoArquivo] = useState<"ofx" | "csv" | "colar">("ofx")
  const [contaSelecionada, setContaSelecionada] = useState("")
  const [textoColado, setTextoColado] = useState("")

  // Dados mockados para preview
  const [linhasPreview] = useState([
    { data: "2025-03-01", descricao: "PIX RECEBIDO - CLIENTE ABC", valor: 5000, tipo: "credito" },
    { data: "2025-03-02", descricao: "TED ENVIADO - FORNECEDOR XYZ", valor: -3500, tipo: "debito" },
    { data: "2025-03-03", descricao: "PAGAMENTO BOLETO", valor: -1200, tipo: "debito" },
  ])

  const [mapeamento, setMapeamento] = useState({
    data: "coluna_1",
    descricao: "coluna_2",
    valor: "coluna_3",
    tipo: "coluna_4",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArquivo(e.target.files[0])
    }
  }

  const handleProximaEtapa = () => {
    if (etapa === "upload") {
      setEtapa("mapear")
    } else if (etapa === "mapear") {
      setEtapa("preview")
    }
  }

  const handleImportar = () => {
    console.log("[v0] Importando extrato:", { arquivo, contaSelecionada, mapeamento })
    router.push("/dashboard/financeiro/extratos")
  }

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/financeiro/extratos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Importar Extrato</h1>
            <p className="text-muted-foreground">Importe extratos OFX, CSV ou cole uma tabela</p>
          </div>
        </div>

      {/* Indicador de Etapas */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${etapa === "upload" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            1
          </div>
          <span className={etapa === "upload" ? "font-medium text-foreground" : "text-muted-foreground"}>Upload</span>
        </div>
        <div className="h-px w-12 bg-border" />
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${etapa === "mapear" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            2
          </div>
          <span className={etapa === "mapear" ? "font-medium text-foreground" : "text-muted-foreground"}>Mapear</span>
        </div>
        <div className="h-px w-12 bg-border" />
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${etapa === "preview" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            3
          </div>
          <span className={etapa === "preview" ? "font-medium text-foreground" : "text-muted-foreground"}>Preview</span>
        </div>
      </div>

      {/* Etapa 1: Upload */}
      {etapa === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Selecione o Arquivo</CardTitle>
            <CardDescription>Escolha como deseja importar o extrato bancário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Conta Bancária */}
            <div className="space-y-2">
              <Label htmlFor="conta">Conta Bancária *</Label>
              <Select value={contaSelecionada} onValueChange={setContaSelecionada} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bb-1234">Banco do Brasil - Ag: 1234-5 | Cc: 12345-6</SelectItem>
                  <SelectItem value="itau-5678">Itaú - Ag: 5678-9 | Cc: 98765-4</SelectItem>
                  <SelectItem value="santander-9012">Santander - Ag: 9012-3 | Cc: 54321-0</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Importação */}
            <div className="space-y-2">
              <Label>Tipo de Importação</Label>
              <div className="grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setTipoArquivo("ofx")}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${tipoArquivo === "ofx" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="font-medium">Arquivo OFX</span>
                  <span className="text-xs text-muted-foreground">Formato padrão bancário</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoArquivo("csv")}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${tipoArquivo === "csv" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <Table className="h-8 w-8 text-primary" />
                  <span className="font-medium">Arquivo CSV</span>
                  <span className="text-xs text-muted-foreground">Planilha exportada</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoArquivo("colar")}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${tipoArquivo === "colar" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="font-medium">Colar Tabela</span>
                  <span className="text-xs text-muted-foreground">Copiar e colar dados</span>
                </button>
              </div>
            </div>

            {/* Upload de Arquivo */}
            {(tipoArquivo === "ofx" || tipoArquivo === "csv") && (
              <div className="space-y-2">
                <Label htmlFor="arquivo">Arquivo</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="arquivo"
                    type="file"
                    accept={tipoArquivo === "ofx" ? ".ofx" : ".csv"}
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {arquivo && (
                    <Badge variant="secondary" className="gap-1">
                      <FileText className="h-3 w-3" />
                      {arquivo.name}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Colar Texto */}
            {tipoArquivo === "colar" && (
              <div className="space-y-2">
                <Label htmlFor="texto">Cole os Dados da Tabela</Label>
                <Textarea
                  id="texto"
                  placeholder="Cole aqui os dados copiados do extrato bancário..."
                  rows={10}
                  value={textoColado}
                  onChange={(e) => setTextoColado(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Cole os dados diretamente do PDF ou planilha. Cada linha deve conter: data, descrição e valor.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleProximaEtapa} disabled={!contaSelecionada || (!arquivo && !textoColado)}>
                Próxima Etapa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Etapa 2: Mapear Colunas */}
      {etapa === "mapear" && (
        <Card>
          <CardHeader>
            <CardTitle>Mapear Colunas</CardTitle>
            <CardDescription>Configure como as colunas do arquivo correspondem aos campos do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Data da Transação</Label>
                <Select value={mapeamento.data} onValueChange={(v) => setMapeamento({ ...mapeamento, data: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coluna_1">Coluna 1</SelectItem>
                    <SelectItem value="coluna_2">Coluna 2</SelectItem>
                    <SelectItem value="coluna_3">Coluna 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Select
                  value={mapeamento.descricao}
                  onValueChange={(v) => setMapeamento({ ...mapeamento, descricao: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coluna_1">Coluna 1</SelectItem>
                    <SelectItem value="coluna_2">Coluna 2</SelectItem>
                    <SelectItem value="coluna_3">Coluna 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Valor</Label>
                <Select value={mapeamento.valor} onValueChange={(v) => setMapeamento({ ...mapeamento, valor: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coluna_1">Coluna 1</SelectItem>
                    <SelectItem value="coluna_2">Coluna 2</SelectItem>
                    <SelectItem value="coluna_3">Coluna 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo (Crédito/Débito)</Label>
                <Select value={mapeamento.tipo} onValueChange={(v) => setMapeamento({ ...mapeamento, tipo: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coluna_1">Coluna 1</SelectItem>
                    <SelectItem value="coluna_2">Coluna 2</SelectItem>
                    <SelectItem value="coluna_3">Coluna 3</SelectItem>
                    <SelectItem value="auto">Detectar automaticamente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Save className="h-4 w-4" />
                <span>Este mapeamento será salvo e reutilizado nas próximas importações desta conta</span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setEtapa("upload")}>
                Voltar
              </Button>
              <Button onClick={handleProximaEtapa}>Visualizar Preview</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Etapa 3: Preview */}
      {etapa === "preview" && (
        <Card>
          <CardHeader>
            <CardTitle>Preview da Importação</CardTitle>
            <CardDescription>Confira os dados antes de importar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium">Data</th>
                      <th className="p-3 text-left text-sm font-medium">Descrição</th>
                      <th className="p-3 text-right text-sm font-medium">Valor</th>
                      <th className="p-3 text-center text-sm font-medium">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhasPreview.map((linha, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="p-3 text-sm">{new Date(linha.data).toLocaleDateString("pt-BR")}</td>
                        <td className="p-3 text-sm">{linha.descricao}</td>
                        <td
                          className={`p-3 text-right text-sm font-medium ${linha.tipo === "credito" ? "text-green-600" : "text-red-600"}`}
                        >
                          {Math.abs(linha.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={linha.tipo === "credito" ? "default" : "secondary"} className="text-xs">
                            {linha.tipo === "credito" ? "Crédito" : "Débito"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-foreground">
                <strong>{linhasPreview.length} linhas</strong> serão importadas para a conta{" "}
                <strong>Banco do Brasil</strong>
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setEtapa("mapear")}>
                Voltar
              </Button>
              <Button onClick={handleImportar}>
                <Upload className="mr-2 h-4 w-4" />
                Importar Extrato
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  )
}
