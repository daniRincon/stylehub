"use client"

import dynamic from "next/dynamic"

// Importa los gráficos de forma dinámica con SSR desactivado
const DashboardCharts = dynamic(() => import("@/components/admin/dashboard-charts"), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg"></div>,
})

export default function DashboardClient() {
  return <DashboardCharts />
}
