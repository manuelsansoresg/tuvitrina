import RegisterForm from "@/components/auth/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F172A] p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[500px] z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              TuVitrina<span className="text-blue-500">.</span>
            </h1>
          </Link>
          <p className="mt-2 text-slate-400">
            Crea tu tarjeta digital profesional en minutos
          </p>
        </div>

        <div className="backdrop-blur-xl bg-slate-900/70 rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
