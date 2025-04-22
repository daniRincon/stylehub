import Link from "next/link"

const categories = [
  {
    name: "Camisas",
    image: "/placeholder.svg?height=400&width=300",
    slug: "camisas",
  },
  {
    name: "Pantalones",
    image: "/placeholder.svg?height=400&width=300",
    slug: "pantalones",
  },
  {
    name: "Shorts",
    image: "/placeholder.svg?height=400&width=300",
    slug: "shorts",
  },
  {
    name: "Zapatos",
    image: "/placeholder.svg?height=400&width=300",
    slug: "zapatos",
  },
  {
    name: "Gorras",
    image: "/placeholder.svg?height=400&width=300",
    slug: "gorras",
  },
]

export default function CategorySection() {
  return (
    <div className="bg-cream py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Categorías</h2>
          <p className="text-muted-foreground">Explora nuestra variedad de productos</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link key={category.slug} href={`/categoria/${category.slug}`} className="category-card">
              <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-dark-gray/40 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
