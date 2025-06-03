import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"
import HeroSection from "@/components/store/hero-section"
import CategorySection from "@/components/store/category-section"
import NewsletterSection from "@/components/store/newsletter-section"
import FeaturedProducts from "@/components/store/featured-products"

// Forzar renderizado dinámico
export const dynamic = "force-dynamic"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1">
        <HeroSection />

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">Productos Destacados</h2>
              <p className="text-muted-foreground">Descubre nuestra selección de productos destacados</p>
            </div>
            <FeaturedProducts />
          </div>
        </section>

        <CategorySection />

        <section className="py-16 bg-cream">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">¿Por qué elegirnos?</h2>
              <p className="text-muted-foreground">Descubre por qué somos la mejor opción para tus compras</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Envío Gratis */}
              <div className="text-center">
                <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                    <line x1="12" y1="20" x2="12" y2="20"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Envío Gratis</h3>
                <p className="text-muted-foreground">En todos los pedidos superiores a $50</p>
              </div>

              {/* Calidad Garantizada */}
              <div className="text-center">
                <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Calidad Garantizada</h3>
                <p className="text-muted-foreground">Productos de la más alta calidad</p>
              </div>

              {/* Compra Segura */}
              <div className="text-center">
                <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gold"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Compra Segura</h3>
                <p className="text-muted-foreground">Transacciones 100% seguras</p>
              </div>
            </div>
          </div>
        </section>

        <NewsletterSection />
      </main>

      <StoreFooter />
    </div>
  )
}
