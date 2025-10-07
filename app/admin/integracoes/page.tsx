"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Database,
  Upload,
  Download,
  Mail,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Settings,
  Plug,
  RefreshCw,
  FileText,
  Building2,
  Shield,
  Cloud,
} from "lucide-react"

export default function IntegracoesPage() {
  const [bancoIntegracaoAtiva, setBancoIntegracaoAtiva] = useState(true)
  const [armazenamentoTipo, setArmazenamentoTipo] = useState<"local" | "s3" | "drive">("local")
  const [emailAtivo, setEmailAtivo] = useState(false)
  const [autoExportContabilidade, setAutoExportContabilidade] = useState(false)

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Integrações</h1>
          <p className="text-muted-foreground">Configure integrações bancárias, armazenamento e serviços externos</p>
        </div>

        {/* Status das Integrações */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bancos</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {bancoIntegracaoAtiva ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-semibold">3 Conectados</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-semibold">Desconectado</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">{armazenamentoTipo === "local" ? "Local" : armazenamentoTipo === "s3" ? "Amazon S3" : "Google Drive"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">E-mail</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {emailAtivo ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-semibold">Configurado</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-semibold">Não Configurado</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contabilidade</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold">Ativo</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Configuração */}
        <Tabs defaultValue="bancos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bancos">Bancos</TabsTrigger>
            <TabsTrigger value="armazenamento">Armazenamento</TabsTrigger>
            <TabsTrigger value="contabilidade">Contabilidade</TabsTrigger>
            <TabsTrigger value="email">E-mail</TabsTrigger>
          </TabsList>

          {/* Bancos/Extratos */}
          <TabsContent value="bancos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Importação de Extratos Bancários</CardTitle>
                <CardDescription>Configure a importação automática via OFX/CSV de bancos parceiros</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Importação Automática</Label>
                    <p className="text-sm text-muted-foreground">Sincronizar extratos bancários automaticamente</p>
                  </div>
                  <Switch checked={bancoIntegracaoAtiva} onCheckedChange={setBancoIntegracaoAtiva} />
                </div>

                {/* Bancos Configurados */}
                <div className="space-y-4">
                  <Label className="text-base">Bancos Conectados</Label>
                  
                  {/* Itaú */}
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                        <Building2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-semibold">Itaú Empresas</p>
                        <p className="text-sm text-muted-foreground">OFX • Última sincronização: Hoje às 14:30</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950">
                        Ativo
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Banco Inter */}
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                        <Building2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-semibold">Banco Inter</p>
                        <p className="text-sm text-muted-foreground">CSV • Última sincronização: Ontem às 08:15</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950">
                        Ativo
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Banco do Brasil */}
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                        <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold">Banco do Brasil</p>
                        <p className="text-sm text-muted-foreground">OFX • Última sincronização: 02/10/2025</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950">
                        Ativo
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Plug className="mr-2 h-4 w-4" />
                    Conectar Novo Banco
                  </Button>
                </div>

                {/* Formatos Suportados */}
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <Label className="mb-2 block text-sm font-semibold">Formatos Suportados</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>OFX (Open Financial Exchange)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-primary" />
                      <span>CSV (Comma-Separated Values)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Itaú (formato nativo)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Banco Inter (API)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Armazenamento */}
          <TabsContent value="armazenamento" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Armazenamento de Arquivos</CardTitle>
                <CardDescription>
                  Escolha onde armazenar documentos, anexos e arquivos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base">Tipo de Armazenamento</Label>

                  {/* Local Storage */}
                  <div
                    onClick={() => setArmazenamentoTipo("local")}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                      armazenamentoTipo === "local"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                        <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">Armazenamento Local (Buckets Nativos)</p>
                          <Badge variant="outline">Padrão</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Arquivos armazenados no servidor da aplicação. Ideal para começar rapidamente.
                        </p>
                        {armazenamentoTipo === "local" && (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Espaço Usado</span>
                              <span className="font-medium">8.5 GB / 100 GB</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div className="h-full w-[8.5%] bg-primary transition-all" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amazon S3 */}
                  <div
                    onClick={() => setArmazenamentoTipo("s3")}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                      armazenamentoTipo === "s3"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                        <Cloud className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">Amazon S3</p>
                          <Badge variant="secondary">Escalável</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Armazenamento na nuvem da AWS. Escalável, seguro e com alta disponibilidade.
                        </p>
                        {armazenamentoTipo === "s3" && (
                          <div className="mt-4 grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="s3-bucket">Bucket Name</Label>
                              <Input id="s3-bucket" placeholder="meu-bucket-erp" />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="s3-region">Região</Label>
                              <Select defaultValue="us-east-1">
                                <SelectTrigger id="s3-region">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                                  <SelectItem value="sa-east-1">SA East (São Paulo)</SelectItem>
                                  <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="s3-access-key">Access Key ID</Label>
                              <Input id="s3-access-key" type="password" placeholder="••••••••••••••••" />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="s3-secret-key">Secret Access Key</Label>
                              <Input id="s3-secret-key" type="password" placeholder="••••••••••••••••••••••••" />
                            </div>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Testar Conexão
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Google Drive */}
                  <div
                    onClick={() => setArmazenamentoTipo("drive")}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                      armazenamentoTipo === "drive"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                        <Cloud className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">Google Drive</p>
                          <Badge variant="secondary">Em Breve</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Integração com Google Drive para armazenamento em nuvem (em desenvolvimento).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Salvar Configurações de Armazenamento
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contabilidade */}
          <TabsContent value="contabilidade" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exportação para Contabilidade</CardTitle>
                <CardDescription>
                  Configure exportações padronizadas (CSV/Excel/TXT) para escritórios de contabilidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Exportação Automática</Label>
                    <p className="text-sm text-muted-foreground">Gerar arquivos automaticamente no final do mês</p>
                  </div>
                  <Switch checked={autoExportContabilidade} onCheckedChange={setAutoExportContabilidade} />
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="formato-contabil">Formato de Exportação</Label>
                    <Select defaultValue="excel">
                      <SelectTrigger id="formato-contabil">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV (Separado por vírgula)</SelectItem>
                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                        <SelectItem value="txt">TXT (Formato Fixo)</SelectItem>
                        <SelectItem value="sped">SPED Contábil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="layout-contabil">Layout do Arquivo</Label>
                    <Select defaultValue="padrao">
                      <SelectTrigger id="layout-contabil">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="padrao">Padrão ERP Multi</SelectItem>
                        <SelectItem value="dominio">Domínio Sistemas</SelectItem>
                        <SelectItem value="senior">Senior Sistemas</SelectItem>
                        <SelectItem value="totvs">TOTVS Protheus</SelectItem>
                        <SelectItem value="sap">SAP Business One</SelectItem>
                        <SelectItem value="custom">Layout Customizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email-contador">E-mail do Contador</Label>
                    <Input
                      id="email-contador"
                      type="email"
                      placeholder="contador@escritorio.com.br"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="dia-exportacao">Dia de Exportação Automática</Label>
                    <Select defaultValue="ultimo">
                      <SelectTrigger id="dia-exportacao">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ultimo">Último dia útil do mês</SelectItem>
                        <SelectItem value="1">Dia 1 do mês seguinte</SelectItem>
                        <SelectItem value="5">Dia 5 do mês seguinte</SelectItem>
                        <SelectItem value="10">Dia 10 do mês seguinte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dados Inclusos */}
                <div className="rounded-lg border border-border p-4">
                  <Label className="mb-3 block text-base">Dados Inclusos na Exportação</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="export-lancamentos" className="cursor-pointer font-normal">
                        Lançamentos Contábeis
                      </Label>
                      <Switch id="export-lancamentos" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="export-contas" className="cursor-pointer font-normal">
                        Plano de Contas
                      </Label>
                      <Switch id="export-contas" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="export-centros" className="cursor-pointer font-normal">
                        Centros de Custo
                      </Label>
                      <Switch id="export-centros" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="export-extratos" className="cursor-pointer font-normal">
                        Extratos Bancários
                      </Label>
                      <Switch id="export-extratos" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="export-folha" className="cursor-pointer font-normal">
                        Folha de Pagamento
                      </Label>
                      <Switch id="export-folha" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Exportação Agora
                  </Button>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurar Layout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Exportações */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Exportações</CardTitle>
                <CardDescription>Últimas exportações realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">lancamentos_setembro_2025.xlsx</p>
                        <p className="text-xs text-muted-foreground">Exportado em 01/10/2025 às 08:00</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">lancamentos_agosto_2025.xlsx</p>
                        <p className="text-xs text-muted-foreground">Exportado em 01/09/2025 às 08:00</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">lancamentos_julho_2025.xlsx</p>
                        <p className="text-xs text-muted-foreground">Exportado em 01/08/2025 às 08:00</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* E-mail */}
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de E-mail</CardTitle>
                <CardDescription>
                  Configure o servidor SMTP para envio automático de relatórios e informes aos investidores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Envio Automático de E-mails</Label>
                    <p className="text-sm text-muted-foreground">Ativar notificações e relatórios por e-mail</p>
                  </div>
                  <Switch checked={emailAtivo} onCheckedChange={setEmailAtivo} />
                </div>

                {emailAtivo && (
                  <>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="smtp-host">Servidor SMTP</Label>
                        <Input id="smtp-host" placeholder="smtp.gmail.com" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="smtp-port">Porta</Label>
                          <Input id="smtp-port" placeholder="587" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="smtp-encryption">Criptografia</Label>
                          <Select defaultValue="tls">
                            <SelectTrigger id="smtp-encryption">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tls">TLS</SelectItem>
                              <SelectItem value="ssl">SSL</SelectItem>
                              <SelectItem value="none">Nenhuma</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="smtp-user">Usuário (E-mail)</Label>
                        <Input id="smtp-user" type="email" placeholder="noreply@empresa.com.br" />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="smtp-pass">Senha</Label>
                        <Input id="smtp-pass" type="password" placeholder="••••••••••••" />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="smtp-from">Nome do Remetente</Label>
                        <Input id="smtp-from" placeholder="ERP Multi - Sua Empresa" />
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar E-mail de Teste
                    </Button>

                    {/* Envios Automáticos */}
                    <div className="rounded-lg border border-border p-4">
                      <Label className="mb-3 block text-base">Envios Automáticos</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-relatorio-mensal" className="cursor-pointer font-normal">
                            Relatório Mensal para Investidores
                          </Label>
                          <Switch id="email-relatorio-mensal" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-informe-rendimentos" className="cursor-pointer font-normal">
                            Informe de Rendimentos (Anual)
                          </Label>
                          <Switch id="email-informe-rendimentos" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-alerta-vencimento" className="cursor-pointer font-normal">
                            Alertas de Vencimento (Contas a Pagar)
                          </Label>
                          <Switch id="email-alerta-vencimento" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-alerta-documentos" className="cursor-pointer font-normal">
                            Alertas de Documentos Vencidos
                          </Label>
                          <Switch id="email-alerta-documentos" />
                        </div>
                      </div>
                    </div>

                    {/* Template de E-mail */}
                    <div className="space-y-2">
                      <Label htmlFor="email-template">Template do E-mail</Label>
                      <Textarea
                        id="email-template"
                        rows={6}
                        placeholder="Olá {NOME_INVESTIDOR},&#10;&#10;Segue em anexo o relatório mensal de {MES}/{ANO}.&#10;&#10;Atenciosamente,&#10;Equipe {NOME_EMPRESA}"
                      />
                      <p className="text-xs text-muted-foreground">
                        Variáveis disponíveis: {"{NOME_INVESTIDOR}"}, {"{MES}"}, {"{ANO}"}, {"{NOME_EMPRESA}"}
                      </p>
                    </div>
                  </>
                )}

                <Button className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Salvar Configurações de E-mail
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
