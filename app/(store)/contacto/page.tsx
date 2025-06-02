import StoreHeader from "@/components/store/store-header"
import StoreFooter from "@/components/store/store-footer"
import ContactForm from "@/components/store/contact-form"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-2">Contacto</h1>
            <p className="text-muted-foreground">Estamos aquí para ayudarte. Contáctanos si tienes alguna pregunta.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-xl font-bold mb-6">Envíanos un mensaje</h2>
              <ContactForm />
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6">Información de contacto</h2>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-cream rounded-full p-3 mr-4">
                      <MapPin className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Dirección</h3>
                      <p className="text-muted-foreground">Calle Principal #123, Ciudad, País</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-cream rounded-full p-3 mr-4">
                      <Phone className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Teléfono</h3>
                      <p className="text-muted-foreground">+123 456 7890</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-cream rounded-full p-3 mr-4">
                      <Mail className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <p className="text-muted-foreground">info@stylehub.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-cream rounded-full p-3 mr-4">
                      <Clock className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Horario de atención</h3>
                      <p className="text-muted-foreground">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                      <p className="text-muted-foreground">Sábados: 10:00 AM - 2:00 PM</p>
                      <p className="text-muted-foreground">Domingos: Cerrado</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Nuestra ubicación</h2>
                <div className="aspect-[16/9] w-full bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.952912260219!2d3.375295414770757!3d6.5276316452784755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos!5e0!3m2!1sen!2sng!4v1567723392506!5m2!1sen!2sng"
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
