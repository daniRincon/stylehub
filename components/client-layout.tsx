"use client";
import type React from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/lib/hooks/use-cart";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}