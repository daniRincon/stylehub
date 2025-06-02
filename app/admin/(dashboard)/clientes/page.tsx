import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function ClientesPage() {
  const session = await getServerSession(authOptions);

  // Verificar si el usuario está autenticado y es administrador
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return <div>No autorizado. Solo administradores pueden acceder.</div>;
  }

  // Obtener clientes desde la base de datos
  const customers = await prisma.customer.findMany({
    select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Clientes</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Telefono</th>
              <th className="py-2 px-4 border-b">Direccion</th>
              <th className="py-2 px-4 border-b">Ciudad</th>
              <th className="py-2 px-4 border-b">Codigo Postal</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{customer.id}</td>
                <td className="py-2 px-4 border-b">{customer.name || "Sin nombre"}</td>
                <td className="py-2 px-4 border-b">{customer.email}</td>
                <td className="py-2 px-4 border-b">{customer.phone || "Sin telefono"}</td>
                <td className="py-2 px-4 border-b">{customer.address || "Sin direccion"}</td>
                <td className="py-2 px-4 border-b">{customer.city}</td>
                <td className="py-2 px-4 border-b">{customer.postalCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {customers.length === 0 && (
        <p className="mt-4 text-center">No hay clientes registrados.</p>
      )}
    </div>
  );
}