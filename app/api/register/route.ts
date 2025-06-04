import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import prisma from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Verificar que Resend esté configurado
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY no está configurado")
      return NextResponse.json({ error: "Configuración de email no disponible" }, { status: 500 })
    }

    try {
      // Enviar email de confirmación
      const emailResult = await resend.emails.send({
        from: "StyleHub <onboarding@resend.dev>", // Usar el dominio por defecto de Resend
        to: email,
        subject: "Confirma tu correo electrónico - StyleHub",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin-bottom: 10px;">¡Bienvenido a StyleHub!</h1>
              <p style="color: #666; font-size: 16px;">Confirma tu correo electrónico para completar tu registro</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hola <strong>${name}</strong>,</p>
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Gracias por registrarte en StyleHub. Para completar tu registro y acceder a todas nuestras funciones, 
                por favor confirma tu correo electrónico haciendo clic en el botón de abajo:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a 
                  href="${confirmationUrl}" 
                  style="display: inline-block; background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;"
                >
                  Confirmar mi correo electrónico
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 25px;">
                Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:
              </p>
              <p style="color: #4F46E5; font-size: 14px; word-break: break-all;">
                ${confirmationUrl}
              </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
              <p style="color: #999; font-size: 14px; margin-bottom: 10px;">
                Si no has creado una cuenta en StyleHub, puedes ignorar este mensaje.
              </p>
              <p style="color: #999; font-size: 14px;">
                Este enlace expirará en 24 horas por seguridad.
              </p>
              <p style="color: #333; font-size: 14px; margin-top: 20px;">
                <strong>El equipo de StyleHub</strong>
              </p>
            </div>
          </div>
        `,
      })

      console.log("Email enviado exitosamente:", emailResult)

      return NextResponse.json(
        {
          success: true,
          message: "Usuario registrado correctamente. Revisa tu correo para confirmar tu cuenta.",
          emailSent: true,
        },
        { status: 201 },
      )
    } catch (emailError) {
      console.error("Error al enviar email:", emailError)

      // Aún así devolver éxito porque el usuario fue creado
      return NextResponse.json(
        {
          success: true,
          message:
            "Usuario registrado correctamente, pero hubo un problema enviando el correo de confirmación. Puedes solicitar un nuevo enlace.",
          emailSent: false,
        },
        { status: 201 },
      )
    }
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
