'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from '@/hooks/use-toast'
import { fgtsTablesApi, type FGTSRate } from '@/lib/api/tax-tables'
import { apiClient } from '@/lib/api/client'
import { authApi } from '@/lib/api/auth'

interface Position {
  id: string
  name: string
  code: string
}

export default function NovaFGTSPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [loadingPositions, setLoadingPositions] = useState(true)
  const [referenceYear, setReferenceYear] = useState(new Date().getFullYear())
  const [active, setActive] = useState(true)
  const [rates, setRates] = useState<FGTSRate[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [availablePositions, setAvailablePositions] = useState<Position[]>([])

  useEffect(() => {
    loadPositions()
  }, [])

  useEffect(() => {
    // Atualizar posições disponíveis quando rates mudar
    const usedPositionIds = rates.map(r => r.positionId)
    setAvailablePositions(positions.filter(p => !usedPositionIds.includes(p.id)))
  }, [rates, positions])

  const loadPositions = async () => {
    try {
      setLoadingPositions(true)
      const company = authApi.getSelectedCompany()
      if (!company?.id) {
        throw new Error('Nenhuma empresa selecionada')
      }

      const response = await apiClient.get('/positions', {
        headers: {
          'x-company-id': company.id,
        },
      })
      
      setPositions(response.data)
      setAvailablePositions(response.data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar cargos',
        description: error.response?.data?.message || 'Não foi possível carregar os cargos.',
        variant: 'destructive',
      })
    } finally {
      setLoadingPositions(false)
    }
  }

  const handleAddRate = () => {
    if (availablePositions.length === 0) {
      toast({
        title: 'Sem cargos disponíveis',
        description: 'Todos os cargos já foram adicionados ou não há cargos cadastrados.',
        variant: 'destructive',
      })
      return
    }

    setRates([...rates, { 
      positionId: availablePositions[0].id,
      monthlyRate: 8.0, 
      terminationRate: 40.0 
    }])
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
        description: 'Adicione pelo menos um cargo com alíquotas de FGTS.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      await fgtsTablesApi.create({
        year: referenceYear,
        active,
        rates: rates.map(({ positionId, monthlyRate, terminationRate }) => ({
          positionId,
          monthlyRate,
          terminationRate,
        })),
      })

      toast({
        title: 'Tabela criada',
        description: 'A tabela de FGTS foi criada com sucesso.',
      })

      router.push('/dashboard/rh/tabelas-fiscais')
    } catch (error: any) {
      toast({
        title: 'Erro ao criar tabela',
        description: error.response?.data?.message || 'Não foi possível criar a tabela.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i)

  const getPositionById = (id: string) => {
    return positions.find(p => p.id === id)
  }

  const getAvailablePositionsForRate = (currentPositionId: string) => {
    const usedPositionIds = rates.map(r => r.positionId).filter(id => id !== currentPositionId)
    return positions.filter(p => !usedPositionIds.includes(p.id))
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
              <h1 className="text-3xl font-bold tracking-tight">Nova Tabela de FGTS</h1>
              <p className="text-muted-foreground">
                Configure as alíquotas de FGTS por cargo
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Tabela</CardTitle>
              <CardDescription>
                Defina o ano de referência e status da tabela
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="referenceYear">Ano de Referência *</Label>
                  <Select
                    value={referenceYear.toString()}
                    onValueChange={(value) => setReferenceYear(parseInt(value))}
                  >
                    <SelectTrigger id="referenceYear">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="active">Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="active"
                      checked={active}
                      onCheckedChange={setActive}
                    />
                    <Label htmlFor="active" className="font-normal">
                      {active ? 'Ativa' : 'Inativa'}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Alíquotas por Cargo</CardTitle>
                  <CardDescription>
                    Configure as alíquotas mensais e de rescisão para cada cargo
                  </CardDescription>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddRate}
                  disabled={loadingPositions || availablePositions.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Cargo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingPositions ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando cargos...
                </div>
              ) : positions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Nenhum cargo cadastrado. Cadastre cargos primeiro.
                  </p>
                  <Link href="/dashboard/rh/cargos">
                    <Button type="button">
                      Ir para Cargos
                    </Button>
                  </Link>
                </div>
              ) : rates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum cargo adicionado. Clique em "Adicionar Cargo" para começar.
                </div>
              ) : (
                rates.map((rate, index) => {
                  const position = getPositionById(rate.positionId)
                  const availableForThis = getAvailablePositionsForRate(rate.positionId)
                  
                  return (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label>Cargo *</Label>
                              <Select
                                value={rate.positionId}
                                onValueChange={(value) => handleRateChange(index, 'positionId', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableForThis.map((pos) => (
                                    <SelectItem key={pos.id} value={pos.id}>
                                      {pos.code} - {pos.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Alíquota Mensal (%) *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={rate.monthlyRate}
                                onChange={(e) => handleRateChange(index, 'monthlyRate', parseFloat(e.target.value))}
                                placeholder="8.0"
                                required
                              />
                              <p className="text-xs text-muted-foreground">
                                CLT: 8% | Aprendiz: 2% | Estagiário: 0%
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label>Alíquota Rescisão (%) *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={rate.terminationRate}
                                onChange={(e) => handleRateChange(index, 'terminationRate', parseFloat(e.target.value))}
                                placeholder="40.0"
                                required
                              />
                              <p className="text-xs text-muted-foreground">
                                Demissão sem justa causa: 40%
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveRate(index)}
                            className="mt-8"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/dashboard/rh/tabelas-fiscais">
              <Button type="button" variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading || loadingPositions}>
              {loading ? 'Salvando...' : 'Salvar Tabela'}
            </Button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  )
}
