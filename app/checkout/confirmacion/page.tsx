"use client"

import Link from "next/link"
import { CheckCircle, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"

export default function ConfirmacionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h1>
            <p className="mb-6">
              Tu pedido ha sido recibido y está siendo procesado. Hemos enviado un correo electrónico con los detalles
              de tu compra.
            </p>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">Detalles del Pedido</h2>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-muted-foreground">Número de Pedido</p>
                  <p className="font-medium">#ORD-{Math.floor(100000 + Math.random() * 900000)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-medium">$149.97</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Método de Pago</p>
                  <p className="font-medium">Tarjeta de Crédito</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tienda">
                <Button className="bg-gold hover:bg-gold/90 text-white">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Continuar comprando
                </Button>
              </Link>

              <Link href="/cuenta/pedidos">
                <Button variant="outline">Ver mis pedidos</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
