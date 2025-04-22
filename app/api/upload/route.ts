import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { existsSync } from "fs"
import prisma from "@/lib/prisma"  // Asegúrate de tener prisma importado

// POST /api/upload - Subir una imagen y guardar la URL en la base de datos
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const productId = formData.get("productId") as string

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    if (!productId) {
      return NextResponse.json({ error: "No se proporcionó el ID del producto" }, { status: 400 })
    }

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Crear nombre de archivo único
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    // Directorio destino
    const productsDir = join(process.cwd(), "public", "uploads", "products")

    // Crear el directorio si no existe
    if (!existsSync(productsDir)) {
      await mkdir(productsDir, { recursive: true })
    }

    // Ruta del archivo
    const filePath = join(productsDir, fileName)

    // Escribir el archivo
    const fileBuffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(fileBuffer))

    // URL pública para mostrar en el frontend
    const fileUrl = `/uploads/products/${fileName}`

    // Registrar la URL de la imagen en la base de datos
    await prisma.productImage.create({
      data: {
        url: fileUrl,
        productId: productId, // Asociamos la imagen con el producto correspondiente
      },
    })

    return NextResponse.json({ url: fileUrl }, { status: 201 })
  } catch (error) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
