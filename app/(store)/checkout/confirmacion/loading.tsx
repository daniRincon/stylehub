import { Loader2 } from "lucide-react"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold" />
          <p>Cargando información del pedido...</p>
        </div>
      </main>
      <StoreFooter />
    </div>
  )
}
