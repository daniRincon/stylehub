import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

interface UpdateProfileRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { email: token.email },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        postalCode: customer.postalCode,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json() as UpdateProfileRequest;
    const { name, email, phone, address, city, postalCode } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "El nombre y el email son obligatorios" }, { status: 400 });
    }

    // Verificar si el email ya existe (si es diferente al actual)
    if (email !== token.email) {
      const existingUser = await prisma.customer.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json({ error: "Este email ya está en uso" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.customer.update({
      where: { email: token.email },
      data: {
        name,
        email,
        phone,
        address,
        city,
        postalCode,
      },
    });

    return NextResponse.json({
      message: "Perfil actualizado correctamente",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        postalCode: updatedUser.postalCode,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
