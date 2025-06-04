import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL("/confirmar-email?error=token_missing", request.url))
    }

    // Buscar el token de verificación
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: "EMAIL_VERIFICATION",
        used: false,
        expires: {
          gt: new Date(),
        },
      },
    })

    if (!verificationToken) {
      return NextResponse.redirect(new URL("/confirmar-email?error=token_invalid", request.url))
    }

    // Buscar el customer
    const customer = await prisma.customer.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!customer) {
      return NextResponse.redirect(new URL("/confirmar-email?error=user_not_found", request.url))
    }

    // Marcar el email como verificado
    await prisma.customer.update({
      where: { id: customer.id },
      data: { emailVerified: new Date() },
    })

    // Marcar el token como usado
    await prisma.verificationToken.update({
      where: { id: verificationToken.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    })

    // Enviar email de bienvenida
    try {
      await resend.emails.send({
        from: "StyleHub <onboarding@resend.dev>",
        to: customer.email,
        subject: "¡Bienvenido a StyleHub! Tu cuenta ha sido verificada",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; margin-bottom: 10px;">¡Bienvenido a StyleHub!</h1>
              <p style="color: #666; font-size: 18px;">Tu cuenta ha sido verificada exitosamente</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hola <strong>${customer.name}</strong>,</p>
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                ¡Excelente! Tu correo electrónico ha sido verificado correctamente. Ahora puedes disfrutar de todas las funciones de StyleHub:
              </p>
              
              <ul style="color: #666; line-height: 1.8; margin-bottom: 25px;">
                <li>Explorar nuestro catálogo completo de productos</li>
                <li>Realizar compras de forma segura</li>
                <li>Gestionar tu perfil y direcciones</li>
                <li>Recibir ofertas exclusivas</li>
                <li>Seguir el estado de tus pedidos</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a 
                  href="${process.env.NEXTAUTH_URL || "https://stylehub-phi.vercel.app"}" 
                  style="display: inline-block; background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;"
                >
                  Comenzar a comprar
                </a>
              </div>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
              <p style="color: #333; font-size: 14px; margin-bottom: 10px;">
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
              <p style="color: #333; font-size: 14px;">
                <strong>El equipo de StyleHub</strong>
              </p>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error("Error enviando email de bienvenida:", emailError)
      // No fallar la verificación por esto
    }

    return NextResponse.redirect(new URL("/confirmar-email?success=true", request.url))
  } catch (error) {
    console.error("Error al confirmar email:", error)
    return NextResponse.redirect(new URL("/confirmar-email?error=server_error", request.url))
  }
}
