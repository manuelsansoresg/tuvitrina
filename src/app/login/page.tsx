import LoginForm from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F172A] p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[400px] z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              TuVitrina<span className="text-blue-500">.</span>
            </h1>
          </Link>
          <p className="mt-2 text-slate-400">
            Bienvenido de nuevo
          </p>
        </div>

        <div className="backdrop-blur-xl bg-slate-900/70 rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Inicia Sesión</h2>
          <LoginForm />
          
          <div className="text-center mt-6">
            <p className="text-sm text-slate-400">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
