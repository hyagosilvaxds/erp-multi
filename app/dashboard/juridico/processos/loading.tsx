import { Loading } from "@/components/ui/loading"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function ProcessosLoading() {
  return (
    <DashboardLayout>
      <Loading message="Carregando processos..." />
    </DashboardLayout>
  )
}
