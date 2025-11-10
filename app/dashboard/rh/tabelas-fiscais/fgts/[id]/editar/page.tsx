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
import { fgtsTablesApi, type FGTSRate, type FGTSCategory } from '@/lib/api/tax-tables'

export default function EditarFGTSPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const tableId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [referenceYear, setReferenceYear] = useState(new Date().getFullYear())
  const [referenceMonth, setReferenceMonth] = useState(new Date().getMonth() + 1)
  const [active, setActive] = useState(true)
  const [rates, setRates] = useState<FGTSRate[]>([])

  useEffect(() => {
    loadTable()
  }, [tableId])

  const loadTable = async () => {
    try {
      setLoading(true)
      const table = await fgtsTablesApi.getById(tableId)
      setReferenceYear(table.referenceYear)
      setReferenceMonth(table.referenceMonth)
      setActive(table.active)
      setRates(table.rates)
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

  const handleAddRate = () => {
    setRates([...rates, { category: 'CLT', monthlyRate: 0, rescissionRate: 0 }])
  }

  const handleRemoveRate = (index: number) => {
    setRates(rates.filter((_, i) => i !== index))
  }

  const handleRateChange = (index: number, field: keyof FGTSRate, value: any) => {
    const newRates = [...rates]
    newRates[index] = { ...newRates[index], [field]: value }
    setRates(newRates)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rates.length === 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Adicione pelo menos uma categoria de FGTS.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)

      await fgtsTablesApi.update(tableId, {
        referenceYear,
        referenceMonth,
        active,
        rates,
      })

      toast({
        title: 'Tabela atualizada',
        description: 'A tabela de FGTS foi atualizada com sucesso.',
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
  const categories = [
    { value: 'CLT', label: 'CLT' },
    { value: 'APRENDIZ', label: 'Aprendiz' },
    { value: 'DOMESTICO', label: 'Doméstico' },
  ]

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
              <h1 className="text-3xl font-bold tracking-tight">Editar Tabela de FGTS</h1>
              <p className="text-muted-foreground">
                Atualize as alíquotas de FGTS por categoria de trabalhador
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Tabela</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Ano de Referência *</Label>
                  <Select value={referenceYear.toString()} onValueChange={(v) => setReferenceYear(parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {years.map((year) => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mês de Referência *</Label>
                  <Select value={referenceMonth.toString()} onValueChange={(v) => setReferenceMonth(parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {months.map((m) => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
                <CardTitle>Alíquotas por Categoria</CardTitle>
                <Button type="button" variant="outline" onClick={handleAddRate}>
                  <Plus className="h-4 w-4 mr-2" />Adicionar Categoria
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {rates.map((rate, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Categoria *</Label>
                          <Select value={rate.category} onValueChange={(v) => handleRateChange(index, 'category', v as FGTSCategory)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Alíquota Mensal (%) *</Label>
                          <Input type="number" step="0.01" value={rate.monthlyRate} onChange={(e) => handleRateChange(index, 'monthlyRate', parseFloat(e.target.value))} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Alíquota Rescisão (%) *</Label>
                          <Input type="number" step="0.01" value={rate.rescissionRate} onChange={(e) => handleRateChange(index, 'rescissionRate', parseFloat(e.target.value))} required />
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveRate(index)} className="mt-8">
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
