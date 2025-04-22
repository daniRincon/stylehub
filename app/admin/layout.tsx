import type React from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />

      <div className="flex-1 ml-[240px]">
        <AdminHeader />

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
