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
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Datos de ejemplo para los gráficos
const salesData = [
  { name: "Ene", ventas: 4000000, pedidos: 240 },
  { name: "Feb", ventas: 3000000, pedidos: 180 },
  { name: "Mar", ventas: 5000000, pedidos: 300 },
  { name: "Abr", ventas: 2780000, pedidos: 167 },
  { name: "May", ventas: 1890000, pedidos: 113 },
  { name: "Jun", ventas: 2390000, pedidos: 143 },
  { name: "Jul", ventas: 3490000, pedidos: 209 },
]

const categoryData = [
  { name: "Camisas", value: 35, color: "#B78732" },
  { name: "Pantalones", value: 25, color: "#2C4926" },
  { name: "Shorts", value: 15, color: "#B79F5E" },
  { name: "Zapatos", value: 20, color: "#444242" },
  { name: "Gorras", value: 5, color: "#EFD9AB" },
]

const topProducts = [
  { name: "Camisa Casual Azul", ventas: 45, ingresos: 2250000 },
  { name: "Pantalón Deportivo", ventas: 38, ingresos: 1900000 },
  { name: "Zapatos Casuales", ventas: 32, ingresos: 3200000 },
  { name: "Short Deportivo", ventas: 28, ingresos: 1400000 },
  { name: "Gorra Snapback", ventas: 25, ingresos: 750000 },
]

// Formateador para pesos colombianos
const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value)

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Gráfico de Ventas Mensuales */}
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
                <YAxis tickFormatter={(value) => formatCOP(value)} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "ventas" ? formatCOP(Number(value)) : value,
                    name === "ventas" ? "Ventas" : "Pedidos",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="#B78732"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  name="Ventas"
                />
                <Line type="monotone" dataKey="pedidos" stroke="#2C4926" strokeWidth={2} name="Pedidos" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Ventas por Categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Productos Más Vendidos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => value.toString()} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "ingresos" ? formatCOP(Number(value)) : value,
                    name === "ingresos" ? "Ingresos" : "Ventas",
                  ]}
                />
                <Bar dataKey="ventas" fill="#B78732" name="Ventas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Ingresos por Producto */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={(value) => formatCOP(value)} />
                <Tooltip formatter={(value) => formatCOP(Number(value))} />
                <Bar dataKey="ingresos" fill="#2C4926" name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
