import { Loading } from "@/components/ui/loading"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function ContratosLoading() {
  return (
    <DashboardLayout>
      <Loading message="Carregando contratos..." />
    </DashboardLayout>
  )
}
