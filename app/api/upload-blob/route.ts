import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es muy grande (máximo 5MB)" }, { status: 400 })
    }

    // Generar nombre único
    const timestamp = Date.now()
    const fileName = `product-${timestamp}-${file.name}`

    // Subir a Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url }, { status: 201 })
  } catch (error) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json(
      {
        error: "Error al subir archivo",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
