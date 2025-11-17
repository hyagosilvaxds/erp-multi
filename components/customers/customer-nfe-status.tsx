'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Customer } from '@/lib/api/customers'
import { validateCustomerForNFe } from '@/lib/validations/nfe-validations'

interface CustomerNFeStatusProps {
  customer: Customer
  showLabel?: boolean
}

export function CustomerNFeStatus({ 
  customer, 
  showLabel = true 
}: CustomerNFeStatusProps) {
  const validation = validateCustomerForNFe(customer)

  if (validation.valid) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 border-green-500 text-green-700 bg-green-50">
              <CheckCircle2 className="h-3 w-3" />
              {showLabel && 'Apto para NF-e'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cliente possui todos os dados necessários para emissão de NF-e</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1 border-amber-500 text-amber-700 bg-amber-50">
            <AlertCircle className="h-3 w-3" />
            {showLabel && 'Dados incompletos'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            {validation.errors.length > 0 && (
              <div>
                <p className="font-semibold text-red-600">Erros:</p>
                <ul className="list-disc pl-4 text-xs">
                  {validation.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div>
                <p className="font-semibold text-amber-600">Avisos:</p>
                <ul className="list-disc pl-4 text-xs">
                  {validation.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
