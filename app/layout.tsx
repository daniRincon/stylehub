import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/lib/hooks/use-cart";  // Importa el CartProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StyleHub - Tienda de Ropa",
  description: "Tienda de ropa con camisas, shorts, zapatos, gorras y pantalones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <CartProvider>  {/* Envuelve los children con CartProvider */}
            {children}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
