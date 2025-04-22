import Link from "next/link"
import { Button } from "@/components/ui/button"
import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"
import FeaturedProducts from "@/components/store/featured-products"
import CategorySection from "@/components/store/category-section"
import HeroSection from "@/components/store/hero-section"
import NewsletterSection from "@/components/store/newsletter-section"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1">
        <HeroSection />

        <CategorySection />

        <div className="container mx-auto py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Productos Destacados</h2>
            <p className="text-muted-foreground">Descubre nuestra colección de productos destacados</p>
          </div>

          <FeaturedProducts />

          <div className="text-center mt-8">
            <Link href="/tienda">
              <Button className="bg-gold hover:bg-gold/90 text-white">Ver todos los productos</Button>
            </Link>
          </div>
        </div>

        <NewsletterSection />
      </main>

      <StoreFooter />
    </div>
  )
}
