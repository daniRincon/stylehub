-- Enum para roles del panel de administración
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'VENDEDOR');

-- Enum para estados de pedidos
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- Tabla: Usuarios del panel (Admins/Vendedores)
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'VENDEDOR',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla: Clientes de la tienda
CREATE TABLE "Customer" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla: Categorías
CREATE TABLE "Category" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "image" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla: Imágenes de Categoría
CREATE TABLE "CategoryImage" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL REFERENCES "Category"("id") ON DELETE CASCADE
);

-- Tabla: Productos
CREATE TABLE "Product" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "price" DECIMAL(12, 0) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT FALSE,
    "categoryId" TEXT NOT NULL REFERENCES "Category"("id"),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla: Imágenes de Producto
CREATE TABLE "ProductImage" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla: Pedidos
CREATE TABLE "Order" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "customerId" TEXT NOT NULL REFERENCES "Customer"("id"),
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total" DECIMAL(12, 0) NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla: Items de pedido
CREATE TABLE "OrderItem" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "Product"("id"),
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(12, 0) NOT NULL
);

