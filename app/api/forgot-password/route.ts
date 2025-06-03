import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import prisma from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "El correo electrónico es requerido" }, { status: 400 })
    }

    // Verificar si el usuario existe
    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Siempre devolver éxito por seguridad (no revelar si el email existe)
    if (!customer) {
      return NextResponse.json({
        success: true,
        message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
      })
    }

    // Invalidar tokens anteriores de recuperación de contraseña
    await prisma.verificationToken.updateMany({
      where: {
        identifier: email.toLowerCase(),
        type: "PASSWORD_RESET",
        used: false,
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    })

    // Crear nuevo token de recuperación (expira en 1 hora)
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

    // Construir URL de recuperación
    const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get("host")}`
    const resetUrl = `${baseUrl}/restablecer-password?token=${token}`

    // Enviar email de recuperación
    await resend.emails.send({
      from: "no-reply@tutienda.com",
      to: email,
      subject: "Restablece tu contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #333; margin: 0;">Restablece tu contraseña</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e9ecef;">
            <h2>Hola ${customer.name},</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p>Si solicitaste este cambio, haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a 
                href="${resetUrl}" 
                style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;"
              >
                Restablecer Contraseña
              </a>
            </div>
            <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #007bff; background: #f8f9fa; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>⚠️ Importante:</strong></p>
              <ul style="margin: 10px 0; color: #856404;">
                <li>Este enlace expirará en 1 hora</li>
                <li>Solo puede ser usado una vez</li>
                <li>Si no solicitaste este cambio, ignora este correo</li>
              </ul>
            </div>
          </div>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; border-radius: 0 0 8px 8px;">
            <p style="margin: 0;">© 2024 Tu Tienda. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
    })
  } catch (error) {
    console.error("Error al enviar email de recuperación:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
