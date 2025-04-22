// components/admin/dashboard-charts.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts"

// Función para formatear en pesos colombianos
const formatCOP = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value)
}

// Datos de ejemplo
const salesData = [
  { name: "Ene", ventas: 4000000 },
  { name: "Feb", ventas: 3000000 },
  { name: "Mar", ventas: 5000000 },
  { name: "Abr", ventas: 2780000 },
  { name: "May", ventas: 1890000 },
  { name: "Jun", ventas: 2390000 },
  { name: "Jul", ventas: 3490000 },
]

const categoryData = [
  { name: "Camisas", value: 35 },
  { name: "Pantalones", value: 25 },
  { name: "Shorts", value: 15 },
  { name: "Zapatos", value: 20 },
  { name: "Gorras", value: 5 },
]

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Ventas Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) => formatCOP(value)}
                />
                <Tooltip
                  formatter={(value) => formatCOP(Number(value))}
                  labelFormatter={(label) => `Mes: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="ventas" stroke="#B78732" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${value} ventas`}
                  labelFormatter={(label) => `Categoría: ${label}`}
                />
                <Bar dataKey="value" fill="#2C4926" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
