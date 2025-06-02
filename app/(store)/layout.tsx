import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ReactNode } from "react";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  // No redirigimos aquí, ya que subrutas como /cuenta tienen su propio layout
  return <>{children}</>;
}