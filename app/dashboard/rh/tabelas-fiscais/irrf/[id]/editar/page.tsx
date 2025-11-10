'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from '@/hooks/use-toast'
import { irrfTablesApi, type IRRFRange } from '@/lib/api/tax-tables'

export default function EditarIRRFPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const tableId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [referenceYear, setReferenceYear] = useState<number>(new Date().getFullYear())
  const [active, setActive] = useState(true)
  const [dependentDeduction, setDependentDeduction] = useState(189.59)
  const [ranges, setRanges] = useState<IRRFRange[]>([])

  useEffect(() => {
    loadTable()
  }, [tableId])

  const loadTable = async () => {
    try {
      setLoading(true)
      const table = await irrfTablesApi.getById(tableId)
      setReferenceYear(table.year)
      setActive(table.active)
      setDependentDeduction(table.dependentDeduction)
      setRanges(table.ranges)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar tabela',
        description: error.response?.data?.message || 'Não foi possível carregar a tabela.',
        variant: 'destructive',
      })
      router.push('/dashboard/rh/tabelas-fiscais')
    } finally {
      setLoading(false)
    }
  }

  const handleAddRange = () => {
    setRanges([...ranges, { minValue: 0, maxValue: 0, rate: 0, deduction: 0 }])
  }

  const handleRemoveRange = (index: number) => {
    setRanges(ranges.filter((_, i) => i !== index))
  }

  const handleRangeChange = (index: number, field: keyof IRRFRange, value: number | null) => {
    const newRanges = [...ranges]
    newRanges[index] = { ...newRanges[index], [field]: value }
    setRanges(newRanges)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (ranges.length === 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Adicione pelo menos uma faixa de IRRF.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)

      await irrfTablesApi.update(tableId, {
        active,
        ranges,
        dependentDeduction,
      })

      toast({
        title: 'Tabela atualizada',
        description: 'A tabela de IRRF foi atualizada com sucesso.',
      })

      router.push('/dashboard/rh/tabelas-fiscais')
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar tabela',
        description: error.response?.data?.message || 'Não foi possível atualizar a tabela.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const months = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
  ]

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i)

  if (loading) {
    return (
      <DashboardLayout userRole="company">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Carregando tabela...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="company">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/rh/tabelas-fiscais">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Editar Tabela de IRRF</h1>
              <p className="text-muted-foreground">
                Atualize as faixas, alíquotas e deduções de Imposto de Renda
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Tabela</CardTitle>
              <CardDescription>
                Ano de referência e status da tabela (ano não pode ser alterado)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Input value={referenceYear} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Dedução por Dependente (R$) *</Label>
                  <Input type="number" step="0.01" value={dependentDeduction} onChange={(e) => setDependentDeduction(parseFloat(e.target.value))} required />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch checked={active} onCheckedChange={setActive} />
                    <Label className="font-normal">{active ? 'Ativa' : 'Inativa'}</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Faixas de IRRF</CardTitle>
                <Button type="button" variant="outline" onClick={handleAddRange}>
                  <Plus className="h-4 w-4 mr-2" />Adicionar Faixa
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ranges.map((range, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                          <Label>De (R$) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={range.minValue}
                            onChange={(e) => handleRangeChange(index, 'minValue', parseFloat(e.target.value))}
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Até (R$) {index === ranges.length - 1 && '(null = sem limite)'}</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={range.maxValue === null ? '' : range.maxValue}
                            onChange={(e) => handleRangeChange(index, 'maxValue', e.target.value === '' ? null : parseFloat(e.target.value))}
                            placeholder="Deixe vazio para sem limite"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Alíquota (%) *</Label>
                          <Input type="number" step="0.01" value={range.rate} onChange={(e) => handleRangeChange(index, 'rate', parseFloat(e.target.value))} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Dedução (R$) *</Label>
                          <Input type="number" step="0.01" value={range.deduction} onChange={(e) => handleRangeChange(index, 'deduction', parseFloat(e.target.value))} required />
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveRange(index)} className="mt-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/dashboard/rh/tabelas-fiscais">
              <Button type="button" variant="outline" disabled={saving}>Cancelar</Button>
            </Link>
            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  )
}
