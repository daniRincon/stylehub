"use client"

import type React from "react"

import { useState } from "react"
import { Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  customer: {
    id: string
    name: string
  }
}

interface ProductReviewsProps {
  reviews: Review[]
  productId: string
}

export default function ProductReviews({ reviews, productId }: ProductReviewsProps) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Verificar si el usuario ya ha dejado una reseña
  const hasReviewed = session?.user && reviews.some((review) => review.customer.id === session.user.id)

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast.error("Debes iniciar sesión para dejar una reseña")
      return
    }

    if (rating === 0) {
      toast.error("Por favor selecciona una calificación")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar la reseña")
      }

      toast.success("Reseña enviada correctamente")

      // Recargar la página para mostrar la nueva reseña
      window.location.reload()
    } catch (error) {
      console.error("Error al enviar reseña:", error)
      toast.error("No se pudo enviar la reseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Renderizar estrellas para la calificación
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? "text-gold fill-gold" : "text-gray-300"}`} />
    ))
  }

  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-8">
      {/* Lista de reseñas */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="bg-muted rounded-full p-2 mr-3">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{review.customer.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
              </div>
              <div className="flex mb-2">{renderStars(review.rating)}</div>
              {review.comment && <p>{review.comment}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay reseñas para este producto todavía.</p>
        </div>
      )}

      {/* Formulario para dejar una reseña */}
      {session && !hasReviewed ? (
        <div className="mt-8 border-t pt-8">
          <h3 className="text-lg font-medium mb-4">Deja tu reseña</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <p className="mb-2">Calificación:</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer ${
                      star <= (hoveredStar || rating) ? "text-gold fill-gold" : "text-gray-300"
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                  />
                ))}
              </div>
            </div>

            <div>
              <Textarea
                placeholder="Escribe tu comentario aquí..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            <Button type="submit" className="bg-gold hover:bg-gold/90 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar reseña"}
            </Button>
          </form>
        </div>
      ) : session && hasReviewed ? (
        <div className="mt-8 border-t pt-8">
          <p className="text-center text-muted-foreground">Ya has dejado una reseña para este producto.</p>
        </div>
      ) : (
        <div className="mt-8 border-t pt-8">
          <p className="text-center text-muted-foreground">
            <Button variant="link" className="text-gold p-0" onClick={() => (window.location.href = "/login")}>
              Inicia sesión
            </Button>{" "}
            para dejar una reseña.
          </p>
        </div>
      )}
    </div>
  )
}
