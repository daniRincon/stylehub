stylehub/
├── app/
│   ├── (store)/
│   │   ├── page.tsx
│   │   ├── categoria/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── cuenta/
│   │   │   ├── page.tsx
│   │   │   ├── pedidos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── perfil/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── productos/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx
│   │   │   └── editar/
│   │   │       └── [slug]/
│   │   │           └── page.tsx
│   │   ├── categorias/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── nueva/
│   │   │   │   └── page.tsx
│   │   │   └── editar/
│   │   │       └── [slug]/
│   │   │           └── page.tsx
│   │   ├── pedidos/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── usuarios/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx
│   │   │   └── editar/
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   └── configuracion/
│   │       └── page.tsx
│   ├── api/
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   └── [slug]/
│   │   │       └── route.ts
│   │   ├── categories/
│   │   │   ├── route.ts
│   │   │   └── [slug]/
│   │   │       └── route.ts
│   │   ├── users/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── orders/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── registro/
│   │       └── page.tsx
│   ├── producto/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── carrito/
│   │   └── page.tsx
│   ├── checkout/
│   │   ├── page.tsx
│   │   └── confirmacion/
│   │       └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── admin/
│   │   ├── admin-header.tsx
│   │   ├── admin-sidebar.tsx
│   │   ├── product-form.tsx
│   │   ├── category-form.tsx
│   │   ├── user-form.tsx
│   │   ├── order-details.tsx
│   │   └── dashboard/
│   │       ├── sales-chart.tsx
│   │       ├── recent-orders.tsx
│   │       └── stats-cards.tsx
│   ├── store/
│   │   ├── store-header.tsx
│   │   ├── store-footer.tsx
│   │   ├── hero-section.tsx
│   │   ├── category-section.tsx
│   │   ├── featured-products.tsx
│   │   ├── newsletter-section.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-card.tsx
│   │   ├── cart-item.tsx
│   │   └── checkout-form.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── ui/
│   │   └── ... (componentes de shadcn/ui)
│   └── theme-provider.tsx
├── lib/
│   ├── hooks/
│   │   ├── use-cart.tsx
│   │   ├── use-auth.tsx
│   │   └── use-toast.ts
│   ├── actions/
│   │   ├── product-actions.ts
│   │   ├── category-actions.ts
│   │   ├── user-actions.ts
│   │   └── order-actions.ts
│   ├── auth.ts
│   ├── prisma.ts
│   ├── formatters.ts
│   ├── validators.ts
│   ├── types.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts
├── public/
│   ├── logo.svg
│   └── images/
│       └── ... (imágenes del sitio)
├── types/
│   ├── next-auth.d.ts
│   └── index.ts
├── .env
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json