import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import prisma from "@/lib/prisma"
import { sendEmail, getEmailConfirmationTemplate, checkEmailConfiguration } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    console.log("Datos recibidos:", { name, email, password: "***" })

    // Validaciones básicas
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Verificar si el email ya está registrado
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingCustomer) {
      return NextResponse.json({ error: "Este correo electrónico ya está registrado" }, { status: 400 })
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear el cliente
    const customer = await prisma.customer.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        emailVerified: null, // Inicialmente no verificado
      },
    })

    console.log("Cliente creado:", customer.id)

    // Crear token de verificación (expira en 24 horas)
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

    console.log("Token de verificación creado:", token)

    // Construir URL de confirmación
    const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get("host")}`
    const confirmationUrl = `${baseUrl}/api/confirm-email?token=${token}`

    console.log("URL de confirmación:", confirmationUrl)

    // Verificar configuración de email
    const emailConfig = checkEmailConfiguration()
    console.log("Configuración de email:", emailConfig)

    if (!emailConfig.hasAnyProvider) {
      console.error("No hay proveedores de email configurados")
      return NextResponse.json(
        {
          success: true,
          message: "Usuario registrado correctamente. Configuración de email pendiente.",
          emailSent: false,
          confirmationUrl: confirmationUrl,
        },
        { status: 201 },
      )
    }

    // Intentar enviar email de confirmación
    try {
      const emailHtml = getEmailConfirmationTemplate(name, confirmationUrl)

      const emailResult = await sendEmail({
        to: email,
        subject: "Confirma tu correo electrónico - StyleHub",
        html: emailHtml,
      })

      if (emailResult.success) {
        console.log(`Email enviado exitosamente con ${emailResult.provider}`)

        return NextResponse.json(
          {
            success: true,
            message: "Usuario registrado correctamente. Revisa tu correo para confirmar tu cuenta.",
            emailSent: true,
            provider: emailResult.provider,
          },
          { status: 201 },
        )
      } else {
        console.error("Error enviando email:", emailResult.error)

        return NextResponse.json(
          {
            success: true,
            message: "Usuario registrado correctamente. Usa este enlace para confirmar tu cuenta:",
            emailSent: false,
            confirmationUrl: confirmationUrl,
            error: emailResult.error,
          },
          { status: 201 },
        )
      }
    } catch (emailError) {
      console.error("Error inesperado enviando email:", emailError)

      return NextResponse.json(
        {
          success: true,
          message: "Usuario registrado correctamente, pero hubo un problema enviando el correo de confirmación.",
          emailSent: false,
          confirmationUrl: confirmationUrl,
        },
        { status: 201 },
      )
    }
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
