import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function StoreFooter() {
  return (
    <footer className="bg-dark-gray text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image src="/logoAMRILLO.png" alt="StyleHub" width={120} height={40} className="" />
            </Link>
            <p className="text-sm text-gray-300 mb-4">
              Tu destino para moda de calidad. Encuentra las mejores camisas, shorts, zapatos, gorras y pantalones.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Categorías</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categoria/camisas" className="text-gray-300 hover:text-white">
                  Camisas
                </Link>
              </li>
              <li>
                <Link href="/categoria/pantalones" className="text-gray-300 hover:text-white">
                  Pantalones
                </Link>
              </li>
              <li>
                <Link href="/categoria/shorts" className="text-gray-300 hover:text-white">
                  Shorts
                </Link>
              </li>
              <li>
                <Link href="/categoria/zapatos" className="text-gray-300 hover:text-white">
                  Zapatos
                </Link>
              </li>
              <li>
                <Link href="/categoria/gorras" className="text-gray-300 hover:text-white">
                  Gorras
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Información</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre-nosotros" className="text-gray-300 hover:text-white">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-white">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/preguntas-frecuentes" className="text-gray-300 hover:text-white">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/terminos-condiciones" className="text-gray-300 hover:text-white">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/politica-privacidad" className="text-gray-300 hover:text-white">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <address className="not-italic text-gray-300">
              <p className="mb-2">Calle Principal #123</p>
              <p className="mb-2">Ciudad, País</p>
              <p className="mb-2">Teléfono: +123 456 7890</p>
              <p className="mb-2">Email: info@stylehub.com</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} StyleHub. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
