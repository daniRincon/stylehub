"use client"; // Marca este archivo como un componente cliente

import Link from "next/link";
import Image from "next/image";

const categories = [
    {
        name: "Camisas",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        slug: "camisas",
    },
    {
        name: "Pantalones",
        image: "https://images.unsplash.com/photo-1714729382668-7bc3bb261662?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        slug: "pantalones",
    },
    {
        name: "Shorts",
        image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        slug: "shorts",
    },
    {
        name: "Zapatos",
        image: "https://images.unsplash.com/photo-1603808033176-9d134e6f2c74?q=80&w=2030&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        slug: "zapatos",
    },
    {
        name: "Gorras",
        image: "https://plus.unsplash.com/premium_photo-1668046095310-37d901cf7e7e?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        slug: "gorras",
    },
];

export default function CategorySection() {

    // Define la función loader aquí, dentro del componente cliente:
    const imageLoader = ({ src }: { src: string }) => {
        return src;
    };

    return (
        <div className="bg-cream py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-2">Categorías</h2>
                    <p className="text-muted-foreground">Explora nuestra variedad de productos</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.slug}
                            href={`/categoria/${category.slug}`}
                            className="category-card"
                            aria-label={`Ir a la categoría ${category.name}`}
                        >
                            <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
                                <Image
                                    src={category.image || "/placeholder.svg"}
                                    alt={category.name}
                                    width={400}
                                    height={600}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    loader={imageLoader} // Usa la función loader definida aquí
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
    );
}