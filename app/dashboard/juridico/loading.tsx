import { Loading } from "@/components/ui/loading"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function JuridicoLoading() {
  return (
    <DashboardLayout>
      <Loading message="Carregando módulo jurídico..." />
    </DashboardLayout>
  )
}
