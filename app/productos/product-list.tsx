"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { List, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Product {
  id: number;
  nombre: string;
  categoria: string;
  stock: number;
  descripcion: string;
  imagen: string;
}

const initialProducts: Product[] = [
  {
    id: 1,
    nombre: "Laptop Asus",
    categoria: "LAPTOPS",
    stock: 100,
    descripcion: "Descripción...",
    imagen: "/placeholder.svg?height=50&width=50",
  },
];

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const entries = parseInt(entriesPerPage, 10);
  const startIndex = (currentPage - 1) * entries;
  const endIndex = startIndex + entries;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / entries);

  return (
    <div className="bg-white rounded-md shadow">
      <div className="bg-[#4D4B5E] text-white p-4 rounded-t-md flex items-center">
        <List className="mr-2 h-5 w-5" />
        <h2 className="text-lg font-medium">LISTA DE PRODUCTOS</h2>
      </div>

      <div className="p-4">
        <div className="flex justify-between mb-4">
          <div className="flex items-center">
            <span className="mr-2">Mostrar</span>
            <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
              <SelectTrigger className="w-[80px]" aria-placeholder="10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-2">Entradas</span>
          </div>

          <div className="flex items-center">
            <span className="mr-2">Buscar:</span>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[200px]"
            />
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-center">{product.id}</TableCell>
                    <TableCell>{product.nombre}</TableCell>
                    <TableCell>{product.categoria}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.descripcion}</TableCell>
                    <TableCell>
                      <Image
                        src={product.imagen || "/placeholder.svg"}
                        alt={product.nombre}
                        width={50}
                        height={50}
                        className="w-10 h-10 object-cover"
                        loader={({ src }) => src}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-green-600"
                          aria-label="Ver imagen"
                        >
                          <ImageIcon className="h-4 w-4" />
                          <span className="sr-only">Ver imagen</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-amber-500"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              )}
              {Array.from({ length: Math.max(0, parseInt(entriesPerPage, 10) - paginatedProducts.length) }).map((_, index) => (
                <TableRow key={`empty-${index}`}>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}