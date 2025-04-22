import type React from "react"
import { CartProvider } from "@/lib/hooks/use-cart"
import { Toaster } from "sonner"

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <CartProvider>
      {children}
      <Toaster />
    </CartProvider>
  )
}
