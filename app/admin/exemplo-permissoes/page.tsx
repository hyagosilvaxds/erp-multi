"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePermissions } from "@/hooks/use-permissions"
import {
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  CheckSquare,
} from "lucide-react"

/**
 * Página de exemplo demonstrando o uso do sistema de permissões
 * 
 * Esta página mostra como:
 * - Usar o hook usePermissions
 * - Verificar permissões específicas
 * - Renderizar componentes condicionalmente
 * - Exibir informações da role do usuário
 */
export default function ExemploPermissoesPage() {
  // IMPORTANTE: Em produção, a role viria de um contexto de autenticação
  // Ex: const { userRole } = useAuth()
  // Aqui estamos usando "financeiro" como exemplo
  const USER_ROLE = "financeiro" // Altere para testar: "admin", "rh", "contador", "investidor"

  const { can, canAccess, modules, isAdmin, isReadOnly, roleInfo } = usePermissions(USER_ROLE)

  return (
    <DashboardLayout userRole={USER_ROLE}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Exemplo: Sistema de Permissões</h1>
          <p className="text-muted-foreground">
            Demonstração de como usar o hook <code className="text-primary">usePermissions</code>
          </p>
        </div>

        {/* Informações da Role Atual */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <CardTitle>Sua Role Atual</CardTitle>
                <CardDescription>Informações sobre suas permissões</CardDescription>
              </div>
              <Badge variant={isAdmin ? "default" : "secondary"} className="text-sm">
                {roleInfo.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">{roleInfo.description}</p>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">É Administrador?</span>
                <span className="font-medium">{isAdmin ? "Sim" : "Não"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Somente Leitura?</span>
                <span className="font-medium">{isReadOnly ? "Sim" : "Não"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Módulos Acessíveis</span>
                <span className="font-medium">{modules.length} módulos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Módulos Acessíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Módulos que Você Pode Acessar</CardTitle>
            <CardDescription>Lista de módulos disponíveis para sua role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {modules.map((module) => (
                <div key={module} className="flex items-center gap-2 rounded-lg border border-border p-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium capitalize">{module}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissões por Módulo */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Módulo Financeiro
              </CardTitle>
              <CardDescription>Suas permissões no módulo financeiro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {canAccess("financeiro") ? (
                <>
                  <PermissionItem
                    icon={Eye}
                    label="Visualizar"
                    hasPermission={can("financeiro", "view")}
                  />
                  <PermissionItem
                    icon={Edit}
                    label="Criar/Editar"
                    hasPermission={can("financeiro", "create")}
                  />
                  <PermissionItem
                    icon={Trash2}
                    label="Excluir"
                    hasPermission={can("financeiro", "delete")}
                  />
                  <PermissionItem
                    icon={Download}
                    label="Exportar"
                    hasPermission={can("financeiro", "export")}
                  />
                  <PermissionItem
                    icon={Upload}
                    label="Importar"
                    hasPermission={can("financeiro", "import")}
                  />
                  <PermissionItem
                    icon={CheckSquare}
                    label="Aprovar"
                    hasPermission={can("financeiro", "approve")}
                  />

                  {/* Botões Condicionais */}
                  <div className="mt-4 space-y-2 pt-4 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">AÇÕES DISPONÍVEIS:</p>
                    {can("financeiro", "view") && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Lançamentos
                      </Button>
                    )}
                    {can("financeiro", "create") && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Novo Lançamento
                      </Button>
                    )}
                    {can("financeiro", "export") && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Dados
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>Você não tem acesso ao módulo Financeiro</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* RH */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Módulo RH
              </CardTitle>
              <CardDescription>Suas permissões no módulo de RH</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {canAccess("rh") ? (
                <>
                  <PermissionItem icon={Eye} label="Visualizar" hasPermission={can("rh", "view")} />
                  <PermissionItem icon={Edit} label="Criar/Editar" hasPermission={can("rh", "create")} />
                  <PermissionItem icon={Trash2} label="Excluir" hasPermission={can("rh", "delete")} />
                  <PermissionItem icon={Download} label="Exportar" hasPermission={can("rh", "export")} />

                  {/* Botões Condicionais */}
                  <div className="mt-4 space-y-2 pt-4 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">AÇÕES DISPONÍVEIS:</p>
                    {can("rh", "view") && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Colaboradores
                      </Button>
                    )}
                    {can("rh", "create") && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Adicionar Colaborador
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>Você não tem acesso ao módulo de RH</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Jurídico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Módulo Jurídico
              </CardTitle>
              <CardDescription>Suas permissões no módulo jurídico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {canAccess("juridico") ? (
                <>
                  <PermissionItem icon={Eye} label="Visualizar" hasPermission={can("juridico", "view")} />
                  <PermissionItem
                    icon={Edit}
                    label="Criar/Editar"
                    hasPermission={can("juridico", "create")}
                  />
                  <PermissionItem icon={Trash2} label="Excluir" hasPermission={can("juridico", "delete")} />
                  <PermissionItem
                    icon={Download}
                    label="Exportar"
                    hasPermission={can("juridico", "export")}
                  />

                  {/* Botões Condicionais */}
                  <div className="mt-4 space-y-2 pt-4 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">AÇÕES DISPONÍVEIS:</p>
                    {can("juridico", "view") && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Contratos
                      </Button>
                    )}
                    {can("juridico", "create") && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Novo Contrato
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>Você não tem acesso ao módulo Jurídico</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Módulo Documentos
              </CardTitle>
              <CardDescription>Suas permissões no módulo de documentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {canAccess("documentos") ? (
                <>
                  <PermissionItem
                    icon={Eye}
                    label="Visualizar"
                    hasPermission={can("documentos", "view")}
                  />
                  <PermissionItem
                    icon={Edit}
                    label="Criar/Editar"
                    hasPermission={can("documentos", "create")}
                  />
                  <PermissionItem
                    icon={Trash2}
                    label="Excluir"
                    hasPermission={can("documentos", "delete")}
                  />
                  <PermissionItem
                    icon={Download}
                    label="Exportar"
                    hasPermission={can("documentos", "export")}
                  />

                  {/* Botões Condicionais */}
                  <div className="mt-4 space-y-2 pt-4 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">AÇÕES DISPONÍVEIS:</p>
                    {can("documentos", "view") && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Documentos
                      </Button>
                    )}
                    {can("documentos", "create") && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Documento
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>Você não tem acesso ao módulo de Documentos</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Código de Exemplo */}
        <Card>
          <CardHeader>
            <CardTitle>Como Usar em Suas Páginas</CardTitle>
            <CardDescription>Copie este código para verificar permissões</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto">
              <code>{`"use client"
import { usePermissions } from "@/hooks/use-permissions"

export default function MinhaPage() {
  const { can, canAccess, isAdmin } = usePermissions("financeiro")
  
  // Verificar se pode acessar o módulo
  if (!canAccess("financeiro")) {
    return <div>Sem acesso</div>
  }
  
  return (
    <div>
      {/* Botão visível apenas para quem pode criar */}
      {can("financeiro", "create") && (
        <Button>Novo Lançamento</Button>
      )}
      
      {/* Botão visível apenas para quem pode exportar */}
      {can("financeiro", "export") && (
        <Button>Exportar</Button>
      )}
      
      {/* Mostrar algo apenas para admins */}
      {isAdmin && (
        <Button>Configurações Avançadas</Button>
      )}
    </div>
  )
}`}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Teste com Diferentes Roles */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Teste o sistema:</strong> Altere a constante <code>USER_ROLE</code> no código desta página
            para "admin", "rh", "juridico", "contador" ou "investidor" e veja as permissões mudarem dinamicamente!
          </AlertDescription>
        </Alert>
      </div>
    </DashboardLayout>
  )
}

/**
 * Componente auxiliar para exibir status de permissão
 */
function PermissionItem({
  icon: Icon,
  label,
  hasPermission,
}: {
  icon: any
  label: string
  hasPermission: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      {hasPermission ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-red-600" />
      )}
    </div>
  )
}
