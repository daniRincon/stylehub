import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ReactNode } from "react";
import AccountSidebar from "@/components/account/account-sidebar";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex">
        <div className="w-64 mr-8">
          <AccountSidebar />
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}