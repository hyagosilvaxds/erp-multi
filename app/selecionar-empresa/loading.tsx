import { Loading } from "@/components/ui/loading"

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loading message="Carregando empresas disponíveis..." />
    </div>
  )
}
