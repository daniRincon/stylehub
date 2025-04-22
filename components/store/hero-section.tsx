import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <div className="relative bg-dark-gray text-white">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/placeholder.svg?height=800&width=1600')",
          opacity: 0.4,
        }}
      />

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Descubre Tu Estilo en StyleHub</h1>
          <p className="text-lg mb-8">
            Encuentra las últimas tendencias en moda. Camisas, shorts, zapatos, gorras y pantalones de la mejor calidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/tienda">
              <Button className="bg-gold hover:bg-gold/90 text-white">Comprar Ahora</Button>
            </Link>
            <Link href="/categoria/camisas">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Ver Colección
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
