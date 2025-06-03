export interface SizeConfig {
    category: string
    gender: "HOMBRE" | "MUJER" | "UNISEX"
    sizes: string[]
    measurements?: {
      [size: string]: {
        busto?: string
        cintura?: string
        cadera?: string
      }
    }
  }
  
  export const SIZES_CONFIG: SizeConfig[] = [
    // HOMBRE - Prendas Superiores
    {
      category: "camisas",
      gender: "HOMBRE",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      measurements: {
        XS: { busto: "88-93", cintura: "73-78", cadera: "90-96" },
        S: { busto: "93-98", cintura: "78-83", cadera: "95-100" },
        M: { busto: "98-103", cintura: "83-88", cadera: "100-105" },
        L: { busto: "103-108", cintura: "88-93", cadera: "106-110" },
        XL: { busto: "108-113", cintura: "93-98", cadera: "110-115" },
        XXL: { busto: "113-118", cintura: "98-103", cadera: "115-120" },
      },
    },
    {
      category: "camisetas",
      gender: "HOMBRE",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    {
      category: "buzos",
      gender: "HOMBRE",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    {
      category: "chaquetas",
      gender: "HOMBRE",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    // HOMBRE - Prendas Inferiores
    {
      category: "pantalones",
      gender: "HOMBRE",
      sizes: ["XS/28", "S/30", "M/32", "L/34", "XL/36", "38"],
    },
    {
      category: "joggers",
      gender: "HOMBRE",
      sizes: ["XS/28", "S/30", "M/32", "L/34", "XL/36", "38"],
    },
    {
      category: "bermudas",
      gender: "HOMBRE",
      sizes: ["XS/28", "S/30", "M/32", "L/34", "XL/36", "38"],
    },
    {
      category: "boxers",
      gender: "HOMBRE",
      sizes: ["XS/28", "S/30", "M/32", "L/34", "XL/36", "38"],
    },
  
    // MUJER - Prendas Superiores
    {
      category: "camisas",
      gender: "MUJER",
      sizes: ["XS", "S", "M", "L", "XL"],
      measurements: {
        XS: { busto: "78-84", cintura: "62-68", cadera: "86-92" },
        S: { busto: "84-90", cintura: "68-74", cadera: "92-98" },
        M: { busto: "90-96", cintura: "74-80", cadera: "98-104" },
        L: { busto: "96-102", cintura: "80-86", cadera: "104-110" },
        XL: { busto: "102-108", cintura: "86-92", cadera: "110-116" },
      },
    },
    {
      category: "crop-tops",
      gender: "MUJER",
      sizes: ["XS", "S", "M", "L", "XL"],
    },
    {
      category: "chaquetas",
      gender: "MUJER",
      sizes: ["XS", "S", "M", "L", "XL"],
    },
    {
      category: "buzos",
      gender: "MUJER",
      sizes: ["XS", "S", "M", "L", "XL"],
    },
    {
      category: "vestidos",
      gender: "MUJER",
      sizes: ["XS", "S", "M", "L", "XL"],
    },
    {
      category: "tops",
      gender: "MUJER",
      sizes: ["XS", "S", "M", "L", "XL"],
    },
    // MUJER - Prendas Inferiores
    {
      category: "pantalones",
      gender: "MUJER",
      sizes: ["XS", "S/4", "S/6", "M/8", "L/10", "L/10"],
    },
    {
      category: "shorts",
      gender: "MUJER",
      sizes: ["XS", "S/4", "S/6", "M/8", "L/10", "L/10"],
    },
    {
      category: "leggings",
      gender: "MUJER",
      sizes: ["XS", "S/4", "S/6", "M/8", "L/10", "L/10"],
    },
    {
      category: "joggers",
      gender: "MUJER",
      sizes: ["XS", "S/4", "S/6", "M/8", "L/10", "L/10"],
    },
    {
      category: "faldas",
      gender: "MUJER",
      sizes: ["XS", "S/4", "S/6", "M/8", "L/10", "L/10"],
    },
  
    // ZAPATOS
    {
      category: "zapatos",
      gender: "HOMBRE",
      sizes: ["39", "40", "41", "42", "43", "44", "45"],
    },
    {
      category: "zapatos",
      gender: "MUJER",
      sizes: ["35", "36", "37", "38", "39", "40", "41"],
    },
  
    // ACCESORIOS (UNISEX)
    {
      category: "gorras",
      gender: "UNISEX",
      sizes: ["Única"],
    },
    {
      category: "bolsos",
      gender: "UNISEX",
      sizes: ["Única"],
    },
    {
      category: "relojes",
      gender: "UNISEX",
      sizes: ["Única"],
    },
  ]
  
  export function getSizesForCategory(categorySlug: string, gender: "HOMBRE" | "MUJER" | "UNISEX"): string[] {
    const config = SIZES_CONFIG.find((c) => c.category === categorySlug && (c.gender === gender || c.gender === "UNISEX"))
    return config?.sizes || ["XS", "S", "M", "L", "XL"]
  }
  
  export function getMeasurementsForSize(categorySlug: string, gender: "HOMBRE" | "MUJER" | "UNISEX", size: string) {
    const config = SIZES_CONFIG.find((c) => c.category === categorySlug && (c.gender === gender || c.gender === "UNISEX"))
    return config?.measurements?.[size]
  }
  
  export function getCategoriesWithSizes(): string[] {
    return [...new Set(SIZES_CONFIG.map((c) => c.category))]
  }
  