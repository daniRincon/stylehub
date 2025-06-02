"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Shield, CheckCircle, Eye, EyeOff } from "lucide-react"

export default function AdminRegisterPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio")
      return false
    }

    if (!formData.email.trim()) {
      toast.error("El correo electrónico es obligatorio")
      return false
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Correo electrónico no válido")
      return false
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) return

    if (!validateForm()) return

    setIsLoading(true)

    try {
      console.log("=== INICIO REGISTRO FRONTEND ===")
      console.log("Datos del formulario:", {
        name: formData.name,
        email: formData.email,
        password: formData.password ? "***" : "NO_PASSWORD",
      })

      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: "ADMIN",
        }),
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        if (response.status === 400 && data.error?.includes("email")) {
          toast.error("Ya existe un administrador con este correo electrónico")
        } else {
          toast.error(data.error || "Error al registrar administrador")
        }
        return
      }

      toast.success("¡Registro exitoso! Redirigiendo al login...")

      // Limpiar formulario
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      })

      // Redirigir al login después de un breve delay
      setTimeout(() => {
        router.push("/admin/login")
      }, 2000)
    } catch (error: any) {
      console.error("Error al registrar:", error)
      toast.error("Error de conexión. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const password = formData.password
    if (password.length === 0) return { strength: 0, text: "", color: "" }
    if (password.length < 6) return { strength: 1, text: "Muy débil", color: "text-red-500" }
    if (password.length < 8) return { strength: 2, text: "Débil", color: "text-orange-500" }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      return { strength: 3, text: "Media", color: "text-yellow-500" }
    return { strength: 4, text: "Fuerte", color: "text-green-500" }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta de Administrador</h1>
          <p className="text-gray-600">Regístrate para acceder al panel de administración</p>
        </div>

        {/* Formulario */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Nombre completo
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Tu nombre completo"
                value={formData.name}
                onChange={handleChange}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@empresa.com"
                value={formData.email}
                onChange={handleChange}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength === 1
                          ? "bg-red-500 w-1/4"
                          : passwordStrength.strength === 2
                            ? "bg-orange-500 w-2/4"
                            : passwordStrength.strength === 3
                              ? "bg-yellow-500 w-3/4"
                              : passwordStrength.strength === 4
                                ? "bg-green-500 w-full"
                                : "w-0"
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.text}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/admin/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Iniciar sesión
              </Link>
            </p>
          </div>

          {/* Información de seguridad */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 text-center">🔒 Tu cuenta será creada con permisos de administrador</p>
          </div>
        </div>

        {/* Link para volver a la tienda */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm transition-colors">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  )
}
