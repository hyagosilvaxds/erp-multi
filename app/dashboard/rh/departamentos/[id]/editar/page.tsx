"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Users, Building2 } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import { departmentsApi, type Department, type UpdateDepartmentData } from '@/lib/api/departments'
import { employeesApi, type Employee } from '@/lib/api/employees'
import { Spinner } from "@/components/ui/spinner"

export default function EditarDepartamentoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const departmentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [department, setDepartment] = useState<Department | null>(null)
  const [allDepartments, setAllDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [parentId, setParentId] = useState('')
  const [managerId, setManagerId] = useState('')
  const [active, setActive] = useState(true)

  useEffect(() => {
    loadData()
  }, [departmentId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [dept, allDepts, emps] = await Promise.all([
        departmentsApi.getById(departmentId),
        departmentsApi.getAll(),
        employeesApi.getAll({ active: true, limit: 1000 })
      ])
      
      setDepartment(dept)
      setAllDepartments(allDepts)
      setEmployees(emps.data)
      
      setCode(dept.code)
      setName(dept.name)
      setDescription(dept.description || '')
      setParentId(dept.parentId || '')
      setManagerId(dept.managerId || '')
      setActive(dept.active)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar departamento',
        description: error.response?.data?.message || 'Não foi possível carregar o departamento.',
        variant: 'destructive',
      })
      router.push('/dashboard/rh/departamentos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim() || !name.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o código e o nome do departamento.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)

      const data: UpdateDepartmentData = {
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        parentId: parentId || undefined,
        managerId: managerId || undefined,
        active,
      }

      await departmentsApi.update(departmentId, data)

      toast({
        title: 'Departamento atualizado',
        description: 'O departamento foi atualizado com sucesso.',
      })

      router.push('/dashboard/rh/departamentos')
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar departamento',
        description: error.response?.data?.message || 'Não foi possível atualizar o departamento.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex h-[50vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </DashboardLayout>
    )
  }

  // Filtrar departamentos que não podem ser pai (evitar loops)
  const availableParents = allDepartments.filter(d => 
    d.id !== departmentId && 
    d.active &&
    !isDescendant(d.id, departmentId, allDepartments)
  )

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/rh/departamentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Departamento</h1>
            <p className="text-muted-foreground">Atualize as informações do departamento</p>
          </div>
          {department && (
            <Badge variant={department.active ? 'default' : 'secondary'} className="text-sm">
              {department.active ? 'Ativo' : 'Inativo'}
            </Badge>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {department && department._count && department._count.employees > 0 && (
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CardContent className="flex items-center gap-3 pt-6">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {department._count.employees} colaborador(es) neste departamento
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Alterações podem afetar os dados dos colaboradores
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {department && department._count && department._count.children > 0 && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <CardContent className="flex items-center gap-3 pt-6">
                <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    {department._count.children} sub-departamento(s)
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Não é possível excluir enquanto houver sub-departamentos
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informações do Departamento</CardTitle>
              <CardDescription>
                Atualize os dados do departamento. Campos marcados com * são obrigatórios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dados Básicos */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: TI, TI-DEV"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Código único para identificação do departamento
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Tecnologia da Informação"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva as responsabilidades e função do departamento..."
                  rows={4}
                />
              </div>

              {/* Hierarquia e Gestão */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Hierarquia e Gestão</h3>
                  <p className="text-sm text-muted-foreground">
                    Defina a estrutura hierárquica e o gestor responsável
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="parentId">Departamento Pai</Label>
                    <Select value={parentId || undefined} onValueChange={setParentId}>
                      <SelectTrigger id="parentId">
                        <SelectValue placeholder="Nenhum (departamento raiz)" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableParents.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs">{dept.code}</span>
                              <span>{dept.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Deixe em branco para criar um departamento raiz
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="managerId">Gestor do Departamento</Label>
                    <Select value={managerId || undefined} onValueChange={setManagerId}>
                      <SelectTrigger id="managerId">
                        <SelectValue placeholder="Selecione um colaborador" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            <div className="flex flex-col">
                              <span>{emp.name}</span>
                              <span className="text-xs text-muted-foreground">{emp.position}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Colaborador responsável pelo departamento
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Departamento Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Departamentos inativos não aparecem nas seleções
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sub-Departamentos */}
          {department?.children && department.children.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Sub-Departamentos</CardTitle>
                <CardDescription>
                  {department.children.length} sub-departamento(s) hierarquicamente abaixo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {department.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold">{child.code}</span>
                          <span className="font-medium">{child.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {child._count?.employees || 0} colaborador(es)
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/rh/departamentos/${child.id}/editar`}>
                          Editar
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Colaboradores */}
          {department?.employees && department.employees.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Colaboradores neste Departamento</CardTitle>
                <CardDescription>
                  {department.employees.length} colaborador(es) vinculado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {department.employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                        {employee.position && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {employee.position.name}
                          </p>
                        )}
                      </div>
                      <Badge variant={employee.active ? 'default' : 'secondary'}>
                        {employee.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/rh/departamentos')}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

// Helper para verificar se um departamento é descendente de outro
function isDescendant(deptId: string, ancestorId: string, allDepts: Department[]): boolean {
  const dept = allDepts.find(d => d.id === deptId)
  if (!dept || !dept.parentId) return false
  if (dept.parentId === ancestorId) return true
  return isDescendant(dept.parentId, ancestorId, allDepts)
}
