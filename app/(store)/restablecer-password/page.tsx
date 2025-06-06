"use client"

import type React from "react"
import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, CheckCircle } from "lucide-react"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"

function RestablecerPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (!token) {
      toast.error("Token inválido")
      router.push("/login")
      return
    }
    setIsValidToken(true)
  }, [token, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cambiar la contraseña")
      }

      setPasswordChanged(true)
      toast.success("Contraseña cambiada exitosamente")
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(error.message || "Error al cambiar la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidToken) {
    return null
  }

  if (passwordChanged) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">¡Contraseña cambiada!</h1>
            <p className="text-gray-600 mb-6">Tu contraseña ha sido actualizada exitosamente.</p>
            <Button onClick={() => router.push("/login")} className="w-full bg-gold hover:bg-gold/90 text-white">
              Iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Nueva contraseña</h1>
        <p className="text-muted-foreground mt-2">Ingresa tu nueva contraseña</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando contraseña...
                </>
              ) : (
                "Cambiar contraseña"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Cargando</h2>
            <p className="text-gray-600">Preparando el formulario...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RestablecerPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <Suspense fallback={<LoadingFallback />}>
            <RestablecerPasswordContent />
          </Suspense>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
