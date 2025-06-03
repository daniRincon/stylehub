import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token y contraseña son requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Buscar el token de recuperación
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: "PASSWORD_RESET",
        used: false,
        expires: {
          gt: new Date(), // Token no expirado
        },
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        {
          error: "Token inválido, expirado o ya utilizado",
        },
        { status: 400 },
      )
    }

    // Buscar el cliente
    const customer = await prisma.customer.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!customer) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Actualizar la contraseña del cliente
    await prisma.customer.update({
      where: { id: customer.id },
      data: { password: hashedPassword },
    })

    // Marcar el token como usado
    await prisma.verificationToken.update({
      where: { id: verificationToken.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    })

    // Invalidar todos los otros tokens de recuperación para este usuario
    await prisma.verificationToken.updateMany({
      where: {
        identifier: verificationToken.identifier,
        type: "PASSWORD_RESET",
        used: false,
        id: {
          not: verificationToken.id,
        },
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Contraseña restablecida exitosamente",
    })
  } catch (error) {
    console.error("Error al restablecer contraseña:", error)
    return NextResponse.json({ error: "Error al restablecer la contraseña" }, { status: 500 })
  }
}
