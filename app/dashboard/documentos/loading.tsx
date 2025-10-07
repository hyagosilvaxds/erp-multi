import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Loading } from "@/components/ui/loading"

export default function LoadingPage() {
  return (
    <DashboardLayout userRole="company">
      <Loading message="Carregando documentos..." />
    </DashboardLayout>
  )
}

