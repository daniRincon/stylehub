import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import prisma from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "El correo electrónico es obligatorio" }, { status: 400 })
    }

    // Verificar si el cliente existe
    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!customer) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    // Si ya está verificado, no es necesario reenviar
    if (customer.emailVerified) {
      return NextResponse.json({ message: "El correo ya está verificado" }, { status: 200 })
    }

    // Eliminar tokens anteriores
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email.toLowerCase(),
        type: "EMAIL_VERIFICATION",
      },
    })

    // Crear nuevo token
    const token = uuidv4()
    const expires = new Date()
    expires.setHours(expires.getHours() + 24)

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        type: "EMAIL_VERIFICATION",
        expires,
      },
    })

    // Construir URL de confirmación
    const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get("host")}`
    const confirmationUrl = `${baseUrl}/api/confirm-email?token=${token}`

    // Enviar email de confirmación
    await resend.emails.send({
      from: "StyleHub <onboarding@resend.dev>",
      to: email,
      subject: "Confirma tu correo electrónico - StyleHub",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Confirma tu correo electrónico</h1>
          <p>Hola ${customer.name},</p>
          <p>Has solicitado un nuevo enlace para confirmar tu correo electrónico. Por favor haz clic en el siguiente enlace:</p>
          <p>
            <a 
              href="${confirmationUrl}" 
              style="display: inline-block; background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;"
            >
              Confirmar mi correo electrónico
            </a>
          </p>
          <p>Si no has solicitado este enlace, puedes ignorar este mensaje.</p>
          <p>El enlace expirará en 24 horas.</p>
          <p><strong>El equipo de StyleHub</strong></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: "Correo de confirmación reenviado" }, { status: 200 })
  } catch (error) {
    console.error("Error al reenviar confirmación:", error)
    return NextResponse.json({ error: "Error al reenviar confirmación" }, { status: 500 })
  }
}
