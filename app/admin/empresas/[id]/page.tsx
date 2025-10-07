"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Building2,
  Save,
  Upload,
  Image as ImageIcon,
  Palette,
  FileSpreadsheet,
  Folder,
  Briefcase,
  Plug,
  LogIn,
} from "lucide-react"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function EmpresaDetalhesPage({ params }: { params: { id: string } }) {
  // Dados mockados da empresa
  const empresa = {
    id: params.id,
    name: "Tech Solutions Ltda",
    cnpj: "12.345.678/0001-90",
    regimeTributario: "Lucro Presumido",
    status: "active",
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin/empresas">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{empresa.name}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground font-mono text-sm">{empresa.cnpj}</p>
                  <Badge variant="outline">{empresa.regimeTributario}</Badge>
                  <Badge variant="default">Ativo</Badge>
                </div>
              </div>
            </div>
          </div>
          <Button>
            <LogIn className="mr-2 h-4 w-4" />
            Entrar na Empresa
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="identidade" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="identidade">
              <Palette className="mr-2 h-4 w-4" />
              Identidade
            </TabsTrigger>
            <TabsTrigger value="planocontas">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Plano de Contas
            </TabsTrigger>
            <TabsTrigger value="centroscusto">
              <Folder className="mr-2 h-4 w-4" />
              Centros de Custo
            </TabsTrigger>
            <TabsTrigger value="projetos">
              <Briefcase className="mr-2 h-4 w-4" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="integracoes">
              <Plug className="mr-2 h-4 w-4" />
              Integrações
            </TabsTrigger>
            <TabsTrigger value="geral">
              <Building2 className="mr-2 h-4 w-4" />
              Geral
            </TabsTrigger>
          </TabsList>

          {/* Tab: Identidade Visual */}
          <TabsContent value="identidade" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo e Identidade Visual</CardTitle>
                <CardDescription>
                  Faça upload do logo da empresa. Será usado em relatórios e documentos PDF.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <Label>Logo Principal</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Clique para fazer upload ou arraste o arquivo
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG ou SVG (max. 2MB)</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label>Logo Secundário (opcional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">Upload opcional</p>
                      <p className="text-xs text-muted-foreground">Para versão monocromática</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="corPrimaria">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input id="corPrimaria" type="color" defaultValue="#0066cc" className="w-20" />
                      <Input defaultValue="#0066cc" placeholder="#0066cc" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="corSecundaria">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input id="corSecundaria" type="color" defaultValue="#00cc66" className="w-20" />
                      <Input defaultValue="#00cc66" placeholder="#00cc66" />
                    </div>
                  </div>
                </div>

                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Identidade Visual
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Plano de Contas */}
          <TabsContent value="planocontas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Plano de Contas Simplificado</CardTitle>
                    <CardDescription>
                      Ative ou desative contas conforme necessário. Contas sugeridas estão pré-configuradas.
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Importar Plano
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Ativo */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-green-500/10 text-green-600 font-bold">
                          A
                        </div>
                        <div>
                          <p className="font-semibold">ATIVO</p>
                          <p className="text-xs text-muted-foreground">Conta Sintética</p>
                        </div>
                      </div>
                      <Badge variant="default">Ativa</Badge>
                    </div>

                    <div className="ml-8 space-y-2">
                      {[
                        { codigo: "1.1", nome: "Ativo Circulante", tipo: "Sintética" },
                        { codigo: "1.1.1", nome: "Disponível", tipo: "Sintética" },
                        { codigo: "1.1.1.001", nome: "Caixa", tipo: "Analítica" },
                        { codigo: "1.1.1.002", nome: "Bancos", tipo: "Analítica" },
                        { codigo: "1.1.2", nome: "Contas a Receber", tipo: "Analítica" },
                      ].map((conta) => (
                        <div
                          key={conta.codigo}
                          className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                              {conta.codigo}
                            </code>
                            <span className="text-sm">{conta.nome}</span>
                            <Badge variant="outline" className="text-xs">
                              {conta.tipo}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              Editar
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              Desativar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Passivo */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-red-500/10 text-red-600 font-bold">
                          P
                        </div>
                        <div>
                          <p className="font-semibold">PASSIVO</p>
                          <p className="text-xs text-muted-foreground">Conta Sintética</p>
                        </div>
                      </div>
                      <Badge variant="default">Ativa</Badge>
                    </div>
                  </div>

                  {/* Receitas */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/10 text-blue-600 font-bold">
                          R
                        </div>
                        <div>
                          <p className="font-semibold">RECEITAS</p>
                          <p className="text-xs text-muted-foreground">Conta Sintética</p>
                        </div>
                      </div>
                      <Badge variant="default">Ativa</Badge>
                    </div>
                  </div>

                  {/* Despesas */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-500/10 text-orange-600 font-bold">
                          D
                        </div>
                        <div>
                          <p className="font-semibold">DESPESAS</p>
                          <p className="text-xs text-muted-foreground">Conta Sintética</p>
                        </div>
                      </div>
                      <Badge variant="default">Ativa</Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </Button>
                  <Button variant="outline">Adicionar Nova Conta</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Centros de Custo */}
          <TabsContent value="centroscusto" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Centros de Custo</CardTitle>
                    <CardDescription>Gerencie os centros de custo da empresa</CardDescription>
                  </div>
                  <Button>Novo Centro de Custo</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: 1, codigo: "CC001", nome: "Administrativo", status: "ativo" },
                    { id: 2, codigo: "CC002", nome: "Comercial", status: "ativo" },
                    { id: 3, codigo: "CC003", nome: "Operacional", status: "ativo" },
                    { id: 4, codigo: "CC004", nome: "TI e Infraestrutura", status: "ativo" },
                    { id: 5, codigo: "CC005", nome: "Marketing", status: "arquivado" },
                  ].map((centro) => (
                    <div
                      key={centro.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Folder className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                              {centro.codigo}
                            </code>
                            <span className="font-medium">{centro.nome}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {centro.status === "ativo" ? "Centro de custo ativo" : "Arquivado"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={centro.status === "ativo" ? "default" : "secondary"}>
                          {centro.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={centro.status === "ativo" ? "" : "text-green-600"}
                        >
                          {centro.status === "ativo" ? "Arquivar" : "Reativar"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Projetos */}
          <TabsContent value="projetos" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Projetos</CardTitle>
                    <CardDescription>Gerencie os projetos da empresa</CardDescription>
                  </div>
                  <Button>Novo Projeto</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      id: 1,
                      nome: "Projeto Alpha",
                      responsavel: "João Silva",
                      inicio: "2025-01-15",
                      fim: "2025-06-30",
                      status: "em andamento",
                    },
                    {
                      id: 2,
                      nome: "Projeto Beta",
                      responsavel: "Maria Santos",
                      inicio: "2025-02-01",
                      fim: "2025-12-31",
                      status: "em andamento",
                    },
                    {
                      id: 3,
                      nome: "Projeto Gamma",
                      responsavel: "Pedro Costa",
                      inicio: "2024-10-01",
                      fim: "2025-03-31",
                      status: "concluído",
                    },
                  ].map((projeto) => (
                    <div
                      key={projeto.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{projeto.nome}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>Responsável: {projeto.responsavel}</span>
                            <span>•</span>
                            <span>
                              {new Date(projeto.inicio).toLocaleDateString("pt-BR")} -{" "}
                              {new Date(projeto.fim).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={projeto.status === "em andamento" ? "default" : "secondary"}
                        >
                          {projeto.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Integrações */}
          <TabsContent value="integracoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrações Bancárias</CardTitle>
                <CardDescription>Configure a importação automática de extratos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { banco: "Banco do Brasil", status: "conectado", ultimaSync: "2025-04-04 08:30" },
                  { banco: "Itaú", status: "conectado", ultimaSync: "2025-04-04 08:15" },
                  { banco: "Santander", status: "desconectado", ultimaSync: null },
                ].map((integracao) => (
                  <div
                    key={integracao.banco}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Plug className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{integracao.banco}</p>
                        {integracao.ultimaSync && (
                          <p className="text-xs text-muted-foreground">
                            Última sincronização: {integracao.ultimaSync}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={integracao.status === "conectado" ? "default" : "secondary"}>
                        {integracao.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {integracao.status === "conectado" ? "Configurar" : "Conectar"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Armazenamento de Documentos</CardTitle>
                <CardDescription>Configure onde os documentos serão armazenados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Provedor de Armazenamento</Label>
                  <Select defaultValue="local">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Armazenamento Local</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                      <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">Configurar Armazenamento</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integração Contábil</CardTitle>
                <CardDescription>Conecte com sistema de contabilidade externo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sistema Contábil</Label>
                  <Select defaultValue="nenhum">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Nenhum</SelectItem>
                      <SelectItem value="dominio">Domínio Sistemas</SelectItem>
                      <SelectItem value="sage">Sage</SelectItem>
                      <SelectItem value="totvs">TOTVS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">Configurar Integração</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Geral */}
          <TabsContent value="geral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
                <CardDescription>Dados básicos da empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Razão Social</Label>
                    <Input defaultValue={empresa.name} />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input defaultValue={empresa.cnpj} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Regime Tributário</Label>
                    <Select defaultValue="lucro-presumido">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simples-nacional">Simples Nacional</SelectItem>
                        <SelectItem value="lucro-presumido">Lucro Presumido</SelectItem>
                        <SelectItem value="lucro-real">Lucro Real</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select defaultValue="active">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
