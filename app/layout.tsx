import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientLayout from "@/components/client-layout";
import "./globals.css";

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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}