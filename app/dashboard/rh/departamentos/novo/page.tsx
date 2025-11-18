"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import { departmentsApi, type CreateDepartmentData, type Department } from '@/lib/api/departments'
import { employeesApi, type Employee } from '@/lib/api/employees'

export default function NovoDepartamentoPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [parentId, setParentId] = useState('')
  const [managerId, setManagerId] = useState('')
  const [active, setActive] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoadingData(true)
      const [depts, emps] = await Promise.all([
        departmentsApi.getAll(),
        employeesApi.getAll({ active: true, limit: 1000 })
      ])
      setDepartments(depts)
      setEmployees(emps.data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.response?.data?.message || 'Não foi possível carregar os dados necessários.',
        variant: 'destructive',
      })
    } finally {
      setLoadingData(false)
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

      const data: CreateDepartmentData = {
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        parentId: parentId || undefined,
        managerId: managerId || undefined,
        active,
      }

      await departmentsApi.create(data)

      toast({
        title: 'Departamento criado',
        description: 'O departamento foi criado com sucesso.',
      })

      router.push('/dashboard/rh/departamentos')
    } catch (error: any) {
      toast({
        title: 'Erro ao criar departamento',
        description: error.response?.data?.message || 'Não foi possível criar o departamento.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

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
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Departamento</h1>
            <p className="text-muted-foreground">Cadastre um novo departamento na estrutura organizacional</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informações do Departamento</CardTitle>
              <CardDescription>
                Preencha os dados do departamento. Campos marcados com * são obrigatórios.
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
                    <Select value={parentId || undefined} onValueChange={setParentId} disabled={loadingData}>
                      <SelectTrigger id="parentId">
                        <SelectValue placeholder="Nenhum (departamento raiz)" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments
                          .filter(d => d.active)
                          .map((dept) => (
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
                    <Select value={managerId || undefined} onValueChange={setManagerId} disabled={loadingData}>
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
            <Button type="submit" disabled={saving || loadingData}>
              {saving ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Departamento
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
