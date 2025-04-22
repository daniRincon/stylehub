"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    // Simula el envío a la API
    setSuccessMessage("¡Gracias por suscribirte a nuestro boletín!")

    setEmail("")

    // Borra el mensaje después de unos segundos
    setTimeout(() => {
      setSuccessMessage("")
    }, 4000)
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
            />
            <Button type="submit" className="bg-dark-green hover:bg-dark-green/90 text-white">
              Suscribirse
            </Button>
          </form>

          {successMessage && (
            <p className="mt-4 text-white font-medium">{successMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}
