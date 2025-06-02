import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import OrdersList from "@/components/account/orders-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis Pedidos</h1>
        <p className="text-muted-foreground">Revisa el estado y historial de tus pedidos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pedidos</CardTitle>
          <CardDescription>Aquí puedes ver todos tus pedidos realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersList userId={session?.user?.id} />
        </CardContent>
      </Card>
    </div>
  )
}
