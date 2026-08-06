"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { loginSchema, type LoginInput } from "@/schemas/validation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithEmail(data.email, data.password);
      router.push("/dashboard");
    } catch {
      setError("E-mail ou senha inválidos.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch {
      setError("Não foi possível entrar com o Google.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-md">
      <Card className="w-full max-w-md">
        <CardContent className="p-xl">
          <h1 className="font-display text-headline-lg text-on-background mb-xs">ETEC Quest</h1>
          <p className="font-body-md text-[14px] text-on-surface-variant mb-lg">
            Entre para continuar sua jornada.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
            <div>
              <input
                {...register("email")}
                type="email"
                placeholder="E-mail"
                className="w-full bg-surface-container-high rounded-lg px-md py-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.email && <p className="text-error text-[12px] mt-xs">{errors.email.message}</p>}
            </div>
            <div>
              <input
                {...register("password")}
                type="password"
                placeholder="Senha"
                className="w-full bg-surface-container-high rounded-lg px-md py-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.password && (
                <p className="text-error text-[12px] mt-xs">{errors.password.message}</p>
              )}
            </div>

            {error && <p className="text-error text-[13px]">{error}</p>}

            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <Button variant="secondary" size="lg" className="mt-md" onClick={handleGoogle}>
            Entrar com Google
          </Button>

          <div className="flex justify-between mt-lg text-[13px]">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Esqueci minha senha
            </Link>
            <Link href="/register" className="text-primary hover:underline">
              Criar conta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
