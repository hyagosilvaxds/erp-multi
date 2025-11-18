"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from '@/hooks/use-toast'
import { positionsApi, type CreatePositionData } from '@/lib/api/positions'

export default function NovoCargoPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [minSalary, setMinSalary] = useState('')
  const [maxSalary, setMaxSalary] = useState('')
  const [cbo, setCbo] = useState('')
  const [active, setActive] = useState(true)

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

      const data: CreatePositionData = {
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        minSalary: minSalary ? parseFloat(minSalary) : undefined,
        maxSalary: maxSalary ? parseFloat(maxSalary) : undefined,
        cbo: cbo.trim() || undefined,
        active,
      }

      await positionsApi.create(data)

      toast({
        title: 'Cargo criado',
        description: 'O cargo foi criado com sucesso.',
      })

      router.push('/dashboard/rh/cargos')
    } catch (error: any) {
      toast({
        title: 'Erro ao criar cargo',
        description: error.response?.data?.message || 'Não foi possível criar o cargo.',
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
            <Link href="/dashboard/rh/cargos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Cargo</h1>
            <p className="text-muted-foreground">Cadastre um novo cargo na empresa</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cargo</CardTitle>
              <CardDescription>
                Preencha os dados do cargo. Campos marcados com * são obrigatórios.
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
                  Salvar Cargo
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
