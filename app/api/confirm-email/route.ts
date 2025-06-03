import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL("/confirmar-email?error=token-invalido", request.url))
    }

    // Buscar el token en la base de datos
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: "EMAIL_VERIFICATION",
        used: false,
      },
    })

    if (!verificationToken) {
      return NextResponse.redirect(new URL("/confirmar-email?error=token-no-encontrado", request.url))
    }

    // Verificar que el token no haya expirado
    if (new Date() > verificationToken.expires) {
      return NextResponse.redirect(new URL("/confirmar-email?error=token-expirado", request.url))
    }

    // Actualizar el cliente como verificado
    await prisma.customer.update({
      where: { email: verificationToken.identifier },
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
    const customer = await prisma.customer.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (customer) {
      await resend.emails.send({
        from: "no-reply@tutienda.com",
        to: customer.email,
        subject: "¡Bienvenido a nuestra tienda!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">¡Bienvenido a nuestra tienda!</h1>
            <p>Hola ${customer.name},</p>
            <p>Tu cuenta ha sido verificada correctamente. Ahora puedes iniciar sesión y disfrutar de todos nuestros productos.</p>
            <p>¡Gracias por registrarte!</p>
            <p>El equipo de la tienda</p>
          </div>
        `,
      })
    }

    return NextResponse.redirect(new URL("/confirmar-email?success=true", request.url))
  } catch (error) {
    console.error("Error al confirmar email:", error)
    return NextResponse.redirect(new URL("/confirmar-email?error=error-servidor", request.url))
  }
}
