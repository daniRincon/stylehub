import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import prisma from "@/lib/prisma"
import { sendEmail, getPasswordResetTemplate } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    console.log("Solicitud de recuperación para:", email)

    // Buscar el cliente
    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Por seguridad, siempre devolvemos éxito aunque el email no exista
    if (!customer) {
      console.log("Email no encontrado:", email)
      return NextResponse.json({
        success: true,
        message: "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación.",
      })
    }

    // Eliminar tokens anteriores del mismo usuario
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email.toLowerCase(),
        type: "PASSWORD_RESET",
      },
    })

    // Crear nuevo token (expira en 1 hora)
    const token = uuidv4()
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        type: "PASSWORD_RESET",
        expires,
      },
    })

    console.log("Token de recuperación creado:", token)

    // Construir URL de recuperación
    const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get("host")}`
    const resetUrl = `${baseUrl}/restablecer-password?token=${token}`

    // Enviar email de recuperación
    try {
      const resetHtml = getPasswordResetTemplate(customer.name, resetUrl)

      const emailResult = await sendEmail({
        to: customer.email,
        subject: "Restablecer contraseña - StyleHub",
        html: resetHtml,
      })

      if (emailResult.success) {
        console.log(`Email de recuperación enviado con ${emailResult.provider}`)

        return NextResponse.json({
          success: true,
          message: "Se ha enviado un enlace de recuperación a tu correo electrónico.",
          provider: emailResult.provider,
        })
      } else {
        console.error("Error enviando email de recuperación:", emailResult.error)

        return NextResponse.json({
          success: false,
          message: "Error enviando el correo de recuperación. Inténtalo más tarde.",
          error: emailResult.error,
        })
      }
    } catch (emailError) {
      console.error("Error inesperado enviando email:", emailError)

      return NextResponse.json({
        success: false,
        message: "Error enviando el correo de recuperación. Inténtalo más tarde.",
      })
    }
  } catch (error) {
    console.error("Error en recuperación de contraseña:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
