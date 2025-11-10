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
import { ArrowLeft, Save, Users } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import { positionsApi, type Position, type UpdatePositionData } from '@/lib/api/positions'
import { Spinner } from "@/components/ui/spinner"

export default function EditarCargoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const positionId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [minSalary, setMinSalary] = useState('')
  const [maxSalary, setMaxSalary] = useState('')
  const [cbo, setCbo] = useState('')
  const [active, setActive] = useState(true)

  useEffect(() => {
    loadPosition()
  }, [positionId])

  const loadPosition = async () => {
    try {
      setLoading(true)
      const data = await positionsApi.getById(positionId)
      setPosition(data)
      
      setCode(data.code)
      setName(data.name)
      setDescription(data.description || '')
      setMinSalary(data.minSalary?.toString() || '')
      setMaxSalary(data.maxSalary?.toString() || '')
      setCbo(data.cbo || '')
      setActive(data.active)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar cargo',
        description: error.response?.data?.message || 'Não foi possível carregar o cargo.',
        variant: 'destructive',
      })
      router.push('/dashboard/rh/cargos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim() || !name.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o código e o nome do cargo.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)

      const data: UpdatePositionData = {
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        minSalary: minSalary ? parseFloat(minSalary) : undefined,
        maxSalary: maxSalary ? parseFloat(maxSalary) : undefined,
        cbo: cbo.trim() || undefined,
        active,
      }

      await positionsApi.update(positionId, data)

      toast({
        title: 'Cargo atualizado',
        description: 'O cargo foi atualizado com sucesso.',
      })

      router.push('/dashboard/rh/cargos')
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar cargo',
        description: error.response?.data?.message || 'Não foi possível atualizar o cargo.',
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

  return (
    <DashboardLayout userRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/rh/cargos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Cargo</h1>
            <p className="text-muted-foreground">Atualize as informações do cargo</p>
          </div>
          {position && (
            <Badge variant={position.active ? 'default' : 'secondary'} className="text-sm">
              {position.active ? 'Ativo' : 'Inativo'}
            </Badge>
          )}
        </div>

        {/* Info Card */}
        {position && position._count && position._count.employees > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="flex items-center gap-3 pt-6">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Este cargo possui {position._count.employees} colaborador(es) vinculado(s)
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Alterações podem afetar os dados dos colaboradores
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cargo</CardTitle>
              <CardDescription>
                Atualize os dados do cargo. Campos marcados com * são obrigatórios.
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
                    placeholder="Ex: DEV-SR"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Código único para identificação do cargo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Desenvolvedor Sênior"
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
                  placeholder="Descreva as responsabilidades e requisitos do cargo..."
                  rows={4}
                />
              </div>

              {/* Faixa Salarial */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Faixa Salarial</h3>
                  <p className="text-sm text-muted-foreground">
                    Defina a faixa salarial de referência para este cargo
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minSalary">Salário Mínimo (R$)</Label>
                    <Input
                      id="minSalary"
                      type="number"
                      step="0.01"
                      min="0"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxSalary">Salário Máximo (R$)</Label>
                    <Input
                      id="maxSalary"
                      type="number"
                      step="0.01"
                      min="0"
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>

              {/* CBO */}
              <div className="space-y-2">
                <Label htmlFor="cbo">CBO (Código Brasileiro de Ocupações)</Label>
                <Input
                  id="cbo"
                  value={cbo}
                  onChange={(e) => setCbo(e.target.value)}
                  placeholder="Ex: 2124-05"
                />
                <p className="text-xs text-muted-foreground">
                  Código oficial do Ministério do Trabalho para este cargo
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Cargo Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Cargos inativos não aparecem na seleção de colaboradores
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

          {/* Colaboradores */}
          {position?.employees && position.employees.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Colaboradores neste Cargo</CardTitle>
                <CardDescription>
                  {position.employees.length} colaborador(es) com este cargo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {position.employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {employee.salary.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </p>
                        <Badge variant={employee.active ? 'default' : 'secondary'} className="text-xs mt-1">
                          {employee.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
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
              onClick={() => router.push('/dashboard/rh/cargos')}
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
