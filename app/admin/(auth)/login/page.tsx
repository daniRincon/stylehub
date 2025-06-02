"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Shield } from "lucide-react"

export default function AdminLoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Redirigir si ya está autenticado como admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      toast.success("Ya estás autenticado como administrador")
      router.push(callbackUrl)
      router.refresh()
    }
  }, [status, session, router, callbackUrl])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        userType: "admin",
        callbackUrl,
      })

      console.log("SignIn result:", result)

      if (result?.error) {
        toast.error(result.error || "Credenciales incorrectas")
        return
      }

      if (result?.ok) {
        toast.success("Inicio de sesión exitoso")
        setTimeout(() => {
          router.push(callbackUrl)
          router.refresh()
        }, 500)
      } else {
        toast.error("Error inesperado al iniciar sesión")
        console.error("SignIn failed:", result)
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      toast.error("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  // Solo mostrar loading si NextAuth está cargando
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-gold to-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <Shield className="h-8 w-8 text-gold" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-dark-gray mb-2">Panel de Administración</h1>
          <p className="text-dark-gray/70">Ingresa tus credenciales para acceder</p>
        </div>

        {/* Formulario */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gold/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-dark-gray font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@stylehub.com"
                value={formData.email}
                onChange={handleChange}
                className="h-12 border-2 border-gray-200 focus:border-gold transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-dark-gray font-medium">
                  Contraseña
                </Label>
                <Link
                  href="/admin/recuperar-password"
                  className="text-sm text-gold hover:text-gold/80 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="h-12 border-2 border-gray-200 focus:border-gold transition-colors"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gold hover:bg-gold/90 text-white font-medium text-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-dark-gray/70">
              ¿No tienes una cuenta?{" "}
              <Link href="/admin/register" className="text-gold hover:text-gold/80 font-medium transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-cream rounded-lg border border-gold/20">
            <p className="text-xs text-dark-gray/60 text-center">
              🔒 Acceso restringido solo para administradores autorizados
            </p>
          </div>
        </div>

        {/* Link para volver a la tienda */}
        <div className="text-center mt-6">
          <Link href="/" className="text-dark-gray/70 hover:text-dark-gray text-sm transition-colors">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  )
}
