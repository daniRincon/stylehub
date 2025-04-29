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
    const type = formData.get("type") as string // 'product' o 'category'
    const id = formData.get("id") as string // productId o categoryId dependiendo del tipo

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    if (!type || !id) {
      return NextResponse.json({ error: "Faltan parámetros (type o id)" }, { status: 400 })
    }

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Crear nombre de archivo único
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    // Directorio destino dependiendo del tipo (producto o categoría)
    const uploadsDir = join(process.cwd(), "public", "uploads", type === "product" ? "products" : "categories")

    // Crear el directorio si no existe
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Ruta del archivo
    const filePath = join(uploadsDir, fileName)

    // Escribir el archivo
    const fileBuffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(fileBuffer))

    // URL pública para mostrar en el frontend
    const fileUrl = `/uploads/${type === "product" ? "products" : "categories"}/${fileName}`

    // Registrar la URL de la imagen en la base de datos dependiendo del tipo
    if (type === "product") {
      await prisma.productImage.create({
        data: {
          url: fileUrl,
          productId: id, // Asociamos la imagen con el producto correspondiente
        },
      })
    } else if (type === "category") {
      await prisma.categoryImage.create({
        data: {
          url: fileUrl,
          categoryId: id, // Asociamos la imagen con la categoría correspondiente
        },
      })
    } else {
      return NextResponse.json({ error: "Tipo no válido (debe ser 'product' o 'category')" }, { status: 400 })
    }

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
