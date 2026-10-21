"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

type Mode = "ADMIN" | "CUSTOMER"

// Cambia una sesión de administrador entre modo admin y modo cliente sin volver a iniciar sesión
export function useSwitchMode() {
  const { data: session, update } = useSession()
  const [isSwitching, setIsSwitching] = useState(false)

  const canSwitch = !!session?.user?.isAdmin

  const switchMode = async (mode: Mode, redirectTo: string) => {
    setIsSwitching(true)
    try {
      const updated = await update({ mode })
      if (updated?.user.role !== mode) {
        throw new Error("No se pudo cambiar de modo")
      }
      // Recarga completa para que el middleware y los componentes de servidor vean la nueva sesión
      window.location.href = redirectTo
    } catch (error) {
      console.error("Error al cambiar de modo:", error)
      toast.error("No se pudo cambiar de modo. Intenta nuevamente.")
      setIsSwitching(false)
    }
  }

  return { canSwitch, isSwitching, switchMode }
}
