import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export default function StoreFooter() {
  return (
    <footer className="bg-dark-gray text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SH</span>
              </div>
              <span className="text-xl font-bold">StyleHub</span>
            </div>
            <p className="text-gray-300 mb-4">
              Tu destino para la moda más actual. Encuentra las últimas tendencias en ropa y accesorios.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-300 hover:text-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-gold transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tienda" className="text-gray-300 hover:text-gold transition-colors">
                  Tienda
                </Link>
              </li>
              <li>
                <Link href="/categoria/camisas" className="text-gray-300 hover:text-gold transition-colors">
                  Camisas
                </Link>
              </li>
              <li>
                <Link href="/categoria/pantalones" className="text-gray-300 hover:text-gold transition-colors">
                  Pantalones
                </Link>
              </li>
              <li>
                <Link href="/categoria/zapatos" className="text-gray-300 hover:text-gold transition-colors">
                  Zapatos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-gold transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Atención al Cliente</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/cuenta" className="text-gray-300 hover:text-gold transition-colors">
                  Mi Cuenta
                </Link>
              </li>
              <li>
                <Link href="/cuenta/pedidos" className="text-gray-300 hover:text-gold transition-colors">
                  Mis Pedidos
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-gold transition-colors">
                  Política de Devoluciones
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-gold transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-gold transition-colors">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gold" />
                <span className="text-gray-300">Chocó, Colombia</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold" />
                <span className="text-gray-300">+57 (1) 234-5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold" />
                <span className="text-gray-300">info@stylehub.co</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">&copy; 2025 StyleHub. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
