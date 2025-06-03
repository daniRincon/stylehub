"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"

export default function ConfirmarEmailPage() {
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const error = searchParams.get("error")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (success === "true") {
      setStatus("success")
      setMessage("¡Tu correo electrónico ha sido confirmado correctamente!")
    } else if (error) {
      setStatus("error")
      switch (error) {
        case "token-invalido":
          setMessage("El enlace de confirmación no es válido.")
          break
        case "token-no-encontrado":
          setMessage("El enlace de confirmación ha expirado o ya ha sido utilizado.")
          break
        case "token-expirado":
          setMessage("El enlace de confirmación ha expirado. Solicita uno nuevo.")
          break
        case "error-servidor":
          setMessage("Ha ocurrido un error en el servidor. Inténtalo de nuevo más tarde.")
          break
        default:
          setMessage("Ha ocurrido un error al confirmar tu correo electrónico.")
      }
    } else {
      setStatus("loading")
      setMessage("Procesando tu solicitud...")
    }
  }, [success, error])

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                {status === "loading" && (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mb-4"></div>
                    <h2 className="text-xl font-semibold mb-2">Procesando</h2>
                    <p className="text-gray-600">Estamos verificando tu correo electrónico...</p>
                  </div>
                )}

                {status === "success" && (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">¡Correo confirmado!</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <p className="text-gray-600 mb-6">Ahora puedes iniciar sesión en tu cuenta.</p>
                    <Link href="/login">
                      <Button className="bg-gold hover:bg-gold/90 text-white">Iniciar sesión</Button>
                    </Link>
                  </div>
                )}

                {status === "error" && (
                  <div className="flex flex-col items-center">
                    {error === "token-expirado" ? (
                      <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
                    ) : (
                      <XCircle className="h-16 w-16 text-red-500 mb-4" />
                    )}
                    <h2 className="text-xl font-semibold mb-2">Error de confirmación</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="space-y-4">
                      <Link href="/login">
                        <Button variant="outline" className="w-full">
                          Iniciar sesión
                        </Button>
                      </Link>
                      <Link href="/registro">
                        <Button className="w-full bg-gold hover:bg-gold/90 text-white">Volver al registro</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
