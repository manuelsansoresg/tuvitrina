import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen p-8 bg-slate-950 text-white">
      <h1 className="text-3xl font-bold mb-4 text-red-500">Panel de Administración</h1>
      <p>Gestión global de usuarios y tarjetas.</p>
    </div>
  )
}
