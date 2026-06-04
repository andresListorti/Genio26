"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function getErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : "";
  if (msg.includes("email-already-in-use")) return "Este email ya está registrado.";
  if (msg.includes("invalid-email")) return "El email no es válido.";
  if (msg.includes("weak-password")) return "La contraseña debe tener al menos 6 caracteres.";
  if (msg.includes("popup-closed-by-user")) return "Inicio de sesión cancelado.";
  if (msg.includes("network-request-failed")) return "Error de conexión. Intentá de nuevo.";
  return "Ocurrió un error. Intentá de nuevo.";
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function RegisterPage() {
  const { signUp, signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  if (loading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signUp(email, password);
      router.replace("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      router.replace("/");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Form panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-16">
        <Link
          href="/"
          className="heading-display text-2xl tracking-[0.3em] mb-16 inline-block"
        >
          GENARO
        </Link>

        <h1 className="heading-display text-3xl mb-2">Crear cuenta</h1>
        <p className="text-sm text-muted mb-10">
          Registrate para guardar tus pedidos y más.
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="eyebrow block mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-foreground"
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="eyebrow block mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-foreground"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="eyebrow block mb-2">
              Confirmar contraseña
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-line bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-foreground"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-foreground text-background text-sm tracking-widest uppercase py-3 hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 border-t border-line" />
          <span className="eyebrow">o</span>
          <div className="flex-1 border-t border-line" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="border border-line text-foreground text-sm py-3 hover:bg-surface transition-colors flex items-center justify-center gap-3"
        >
          <GoogleIcon />
          Continuar con Google
        </button>

        <p className="mt-10 text-sm text-muted text-center">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="text-foreground underline underline-offset-2"
          >
            Iniciá sesión
          </Link>
        </p>
      </div>

      {/* Image panel */}
      <div className="hidden lg:block relative w-1/2 overflow-hidden">
        <Image
          src="/resources/pagina%20de%20acceso.jpg"
          alt="Zapatería Genaro"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
