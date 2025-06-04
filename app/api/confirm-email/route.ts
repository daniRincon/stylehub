import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendEmail, getWelcomeEmailTemplate } from "@/lib/email-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 })
    }

    console.log("Verificando token:", token)

    // Buscar el token de verificación
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: "EMAIL_VERIFICATION",
        expires: {
          gt: new Date(),
        },
      },
    })

    if (!verificationToken) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    console.log("Token válido encontrado para:", verificationToken.identifier)

    // Buscar el cliente
    const customer = await prisma.customer.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!customer) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Actualizar el cliente como verificado
    await prisma.customer.update({
      where: { id: customer.id },
      data: { emailVerified: new Date() },
    })

    // Eliminar el token usado
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    console.log("Email confirmado exitosamente para:", customer.email)

    // Enviar email de bienvenida
    try {
      const welcomeHtml = getWelcomeEmailTemplate(customer.name)

      const emailResult = await sendEmail({
        to: customer.email,
        subject: "¡Bienvenido a StyleHub! - Cuenta confirmada",
        html: welcomeHtml,
      })

      if (emailResult.success) {
        console.log(`Email de bienvenida enviado con ${emailResult.provider}`)
      }
    } catch (welcomeEmailError) {
      console.error("Error enviando email de bienvenida:", welcomeEmailError)
      // No fallar la confirmación por esto
    }

    // Redirigir a página de éxito
    const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get("host")}`
    return NextResponse.redirect(`${baseUrl}/login?confirmed=true`)
  } catch (error) {
    console.error("Error confirmando email:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
