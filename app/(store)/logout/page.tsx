"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, LogOut } from "lucide-react"
import Link from "next/link"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"

export default function LogoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    // Si no hay sesión, redirigir al inicio
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: "/",
      })
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando...</span>
          </div>
        </main>
        <StoreFooter />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Sesión cerrada</CardTitle>
              <CardDescription>Tu sesión ha sido cerrada exitosamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/">Volver al inicio</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">Iniciar sesión nuevamente</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <StoreFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1 flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <LogOut className="w-12 h-12 text-gold mx-auto mb-4" />
            <CardTitle>¿Cerrar sesión?</CardTitle>
            <CardDescription>¿Estás seguro de que quieres cerrar tu sesión?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Sesión actual:</p>
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
            </div>

            <div className="space-y-2">
              <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700">
                <LogOut className="mr-2 h-4 w-4" />
                Sí, cerrar sesión
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/cuenta">Cancelar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <StoreFooter />
    </div>
  )
}
