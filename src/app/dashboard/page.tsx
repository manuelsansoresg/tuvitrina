import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) redirect("/api/auth/signin")

  return (
    <div className="min-h-screen p-8 bg-slate-950 text-white">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Bienvenido, {session.user?.email}</p>
      <div className="mt-8 p-6 bg-slate-900 rounded-xl border border-slate-800">
        <h2 className="text-xl font-bold mb-4">Tu Tarjeta Digital</h2>
        <p className="text-slate-400">Aquí podrás gestionar tu tarjeta.</p>
        {/* Here we would add forms using the server actions */}
      </div>
    </div>
  )
}
