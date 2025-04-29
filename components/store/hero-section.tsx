import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <div className="relative bg-dark-gray text-white">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1605859465655-84c45e14a0af?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
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
              <Button className="bg-dark-green  text-white hover:bg-gold/50">Comprar Ahora</Button>
            </Link>
            <Link href="/categoria/camisas">
              <Button variant="outline" className="border-white text-dark-green hover:bg-dark-green/50">
                Ver Colección
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
