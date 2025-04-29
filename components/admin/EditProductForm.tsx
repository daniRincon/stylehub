"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Product } from "@/lib/types";
import { updateProduct } from "@/lib/api"; // Función para actualizar el producto en la base de datos
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const productSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  price: z.number().min(0, { message: "El precio debe ser mayor o igual a 0." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  stock: z.number().min(0, { message: "El stock debe ser mayor o igual a 0." }),
  category: z.enum(["camisas", "pantalones", "zapatos"]),
});

interface EditProductFormProps {
  product: Product;
}

const EditProductForm = ({ product }: EditProductFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof productSchema>>({
    defaultValues: product,
    resolver: zodResolver(productSchema),
  });

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    setLoading(true);
    try {
      let imageData: string | null = null;

      // Subir la imagen a Cloudinary o similar
      if (selectedImage) {
        // Aqui debes implementar la lógica para subir la imagen
        // y obtener la URL de la imagen subida
        imageData = await uploadImage(selectedImage);  // Implementa esta función
      }

      const response = await updateProduct({ ...data, image: imageData });
      if (response.success) {
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado con éxito.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Hubo un problema al actualizar el producto.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al actualizar el producto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block font-medium">Nombre del producto</label>
        <input
          type="text"
          className="mt-1 p-2 border rounded w-full"
          {...register("name")}
        />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block font-medium">Precio</label>
        <input
          type="number"
          className="mt-1 p-2 border rounded w-full"
          {...register("price", { valueAsNumber: true })}
        />
        {errors.price && <p className="text-red-500">{errors.price.message}</p>}
      </div>

      <div>
        <label className="block font-medium">Descripción</label>
        <textarea
          className="mt-1 p-2 border rounded w-full"
          rows={4}
          {...register("description")}
        />
        {errors.description && <p className="text-red-500">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block font-medium">Stock</label>
        <input
          type="number"
          className="mt-1 p-2 border rounded w-full"
          {...register("stock", { valueAsNumber: true })}
        />
        {errors.stock && <p className="text-red-500">{errors.stock.message}</p>}
      </div>

      <div>
        <label className="block font-medium">Categoría</label>
        <select className="mt-1 p-2 border rounded w-full" {...register("category")}>
          <option value="camisas">Camisas</option>
          <option value="pantalones">Pantalones</option>
          <option value="zapatos">Zapatos</option>
        </select>
        {errors.category && <p className="text-red-500">{errors.category.message}</p>}
      </div>

      <div>
        <label className="block font-medium">Imagen del producto</label>
        <input
          type="file"
          className="mt-1 p-2 border rounded w-full"
          onChange={handleImageChange}
        />
        {selectedImage && <p>Imagen seleccionada: {selectedImage.name}</p>}
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          className="bg-dark-green text-white w-full"
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Actualizar Producto"}
        </Button>
      </div>
    </form>
  );
};

const EditProductPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para obtener el producto desde la base de datos
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${slug}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Hubo un problema al cargar los detalles del producto.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Producto no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Editar Producto</h1>
        <EditProductForm product={product} />
      </div>
    </div>
  );
};

export default EditProductPage;