"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProfileFormData | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
    },
  });

  // Cargar los datos del usuario desde /api/user/profile al montar el componente
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) {
          throw new Error("Error al cargar el perfil");
        }
        const data = await response.json();
        const user = data.user;

        // Actualizar el estado local con los datos del usuario
        setCurrentUser({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          postalCode: user.postalCode || "",
        });

        // Actualizar los valores predeterminados del formulario
        reset({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          postalCode: user.postalCode || "",
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("No se pudo cargar tu información de perfil");
      }
    };

    fetchUserProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar el perfil");
      }

      // Actualizar el estado local con los datos devueltos
      setCurrentUser({
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || "",
        address: result.user.address || "",
        city: result.user.city || "",
        postalCode: result.user.postalCode || "",
      });

      // Actualizar los valores del formulario con los datos devueltos
      reset({
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || "",
        address: result.user.address || "",
        city: result.user.city || "",
        postalCode: result.user.postalCode || "",
      });

      toast.success("Perfil actualizado correctamente");
    } catch (error: any) {
      toast.error(error.message || "No se pudo actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar un mensaje de carga mientras se obtienen los datos
  if (!currentUser) {
    return (
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold" />
        <p>Cargando tu información...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sección de Información Actual */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Información Actual</h2>
        <div className="space-y-2">
          <p><strong>Nombre:</strong> {currentUser.name || "No especificado"}</p>
          <p><strong>Email:</strong> {currentUser.email || "No especificado"}</p>
          <p><strong>Teléfono:</strong> {currentUser.phone || "No especificado"}</p>
          <p><strong>Dirección:</strong> {currentUser.address || "No especificado"}</p>
          <p><strong>Ciudad:</strong> {currentUser.city || "No especificado"}</p>
          <p><strong>Código Postal:</strong> {currentUser.postalCode || "No especificado"}</p>
        </div>
      </div>

      {/* Formulario Editable */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" {...register("name")} placeholder="Tu nombre completo" />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="tu@email.com" />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" {...register("phone")} placeholder="+57 300 123 4567" />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" {...register("city")} placeholder="Tu ciudad" />
            {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" {...register("address")} placeholder="Tu dirección completa" />
            {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Código postal</Label>
            <Input id="postalCode" {...register("postalCode")} placeholder="110111" />
            {errors.postalCode && <p className="text-sm text-red-600">{errors.postalCode.message}</p>}
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="bg-gold hover:bg-gold/90">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
      </form>
    </div>
  );
}