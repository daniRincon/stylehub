"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Save, User, Mail, Phone, MapPin, Home } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
    address: string | null
    city: string | null
    postalCode: string | null
  }
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const router = useRouter()
  const { update } = useSession()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      postalCode: user?.postalCode || "",
    },
  })

  // Observar cambios en el formulario
  const watchedValues = watch()

  useEffect(() => {
    setHasChanges(isDirty)
  }, [isDirty])

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar el perfil")
      }

      // Actualizar la sesión con los nuevos datos
      await update({
        name: data.name,
        email: data.email,
      })

      toast.success("Perfil actualizado correctamente")
      setHasChanges(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    reset()
    setHasChanges(false)
    toast.info("Cambios descartados")
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre completo *
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Tu nombre completo"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-600 flex items-center gap-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="tu@email.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-600 flex items-center gap-1">{errors.email.message}</p>}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="+57 300 123 4567"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-sm text-red-600 flex items-center gap-1">{errors.phone.message}</p>}
          </div>

          {/* Ciudad */}
          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ciudad
            </Label>
            <Input
              id="city"
              {...register("city")}
              placeholder="Tu ciudad"
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && <p className="text-sm text-red-600 flex items-center gap-1">{errors.city.message}</p>}
          </div>

          {/* Dirección */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dirección
            </Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Tu dirección completa"
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && <p className="text-sm text-red-600 flex items-center gap-1">{errors.address.message}</p>}
          </div>

          {/* Código postal */}
          <div className="space-y-2">
            <Label htmlFor="postalCode">Código postal</Label>
            <Input
              id="postalCode"
              {...register("postalCode")}
              placeholder="110111"
              className={errors.postalCode ? "border-red-500" : ""}
            />
            {errors.postalCode && (
              <p className="text-sm text-red-600 flex items-center gap-1">{errors.postalCode.message}</p>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={isLoading || !hasChanges}
            className="bg-gold hover:bg-gold/90 flex-1 sm:flex-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>

          {hasChanges && (
            <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
              Descartar cambios
            </Button>
          )}
        </div>

        {hasChanges && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            Tienes cambios sin guardar. No olvides hacer clic en "Guardar cambios".
          </div>
        )}
      </form>
    </div>
  )
}
