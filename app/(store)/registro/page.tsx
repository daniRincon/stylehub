"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Loader2, CheckCircle, Mail, AlertCircle } from "lucide-react"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RegistroPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Si hay una sesión activa y es un ADMIN, mostrar mensaje
  const isAdmin = session?.user?.role === "ADMIN"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      // Si hay una sesión activa, cerrarla primero
      if (session) {
        await signOut({ redirect: false })
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar usuario")
      }

      // Mostrar mensaje de confirmación en lugar de redirigir
      setRegistrationSuccess(true)
      setRegisteredEmail(formData.email)
      toast.success("Registro exitoso. Por favor verifica tu correo electrónico.")
    } catch (error: any) {
      console.error("Error al registrar:", error)
      toast.error(error.message || "Error al registrar usuario")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      // Si hay una sesión activa, cerrarla primero
      if (session) {
        await signOut({ redirect: false })
      }

      await signIn("google", {
        callbackUrl: "/cuenta",
      })
    } catch (error) {
      console.error("Error con Google OAuth:", error)
      toast.error("Error al registrarse con Google")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ redirect: false })
      toast.success("Sesión cerrada correctamente")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  // Si el registro fue exitoso, mostrar pantalla de confirmación
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />

        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">¡Registro exitoso!</h1>
                <p className="text-gray-600 mb-6">
                  Hemos enviado un correo de confirmación a <strong>{registeredEmail}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Por favor revisa tu bandeja de entrada y haz clic en el enlace de confirmación para activar tu cuenta.
                </p>
                <Button onClick={() => router.push("/login")} className="w-full bg-gold hover:bg-gold/90 text-white">
                  Ir a iniciar sesión
                </Button>
                <p className="mt-4 text-sm text-gray-500">
                  ¿No recibiste el correo? Revisa tu carpeta de spam o{" "}
                  <button
                    className="text-gold hover:underline"
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/resend-confirmation", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: registeredEmail }),
                        })

                        if (response.ok) {
                          toast.success("Correo de confirmación reenviado")
                        } else {
                          toast.error("Error al reenviar el correo")
                        }
                      } catch (error) {
                        toast.error("Error al reenviar el correo")
                      }
                    }}
                  >
                    solicita otro
                  </button>
                </p>
              </div>
            </div>
          </div>
        </main>

        <StoreFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">Crear una cuenta</h1>
              <p className="text-muted-foreground mt-2">Regístrate para acceder a todas las funciones</p>
            </div>

            {isAdmin && (
              <Alert variant="warning" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sesión de administrador activa</AlertTitle>
                <AlertDescription>
                  Actualmente tienes una sesión activa como administrador. Puedes cerrar esta sesión antes de
                  registrarte como cliente.
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
                      {isSigningOut ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Cerrar sesión de administrador"
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
              {/* Botón de Google */}
              <Button
                type="button"
                variant="outline"
                className="w-full mb-4"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Registrarse con Google
              </Button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">O regístrate con</span>
                </div>
              </div>

              {/* Formulario de registro */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
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
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Registrarse con email
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/login" className="text-gold hover:underline">
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
