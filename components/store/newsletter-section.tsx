"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setIsLoading(true)

    try {
      // Simula el envío a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("¡Suscripción exitosa!", {
        description: "Gracias por suscribirte a nuestro boletín. Recibirás ofertas exclusivas.",
        duration: 4000,
      })

      setEmail("")
    } catch (error) {
      toast.error("Error al suscribirse", {
        description: "Por favor, inténtalo de nuevo más tarde.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-light-gold py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2 text-white">Suscríbete a Nuestro Boletín</h2>
          <p className="text-white/80 mb-6">
            Recibe las últimas noticias, ofertas exclusivas y novedades directamente en tu correo.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white"
              required
              disabled={isLoading}
            />
            <Button type="submit" className="bg-dark-green hover:bg-dark-green/90 text-white" disabled={isLoading}>
              {isLoading ? "Suscribiendo..." : "Suscribirse"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
