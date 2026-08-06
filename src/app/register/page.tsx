"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { registerSchema, type RegisterInput } from "@/schemas/validation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const { registerWithEmail } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    setSubmitting(true);
    try {
      await registerWithEmail(data);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? "Não foi possível criar sua conta." : "Erro desconhecido.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-md">
      <Card className="w-full max-w-md">
        <CardContent className="p-xl">
          <h1 className="font-display text-headline-lg text-on-background mb-xs">Criar Conta</h1>
          <p className="font-body-md text-[14px] text-on-surface-variant mb-lg">
            Comece sua jornada no ETEC Quest.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
            {(["displayName", "username", "email", "password", "confirmPassword"] as const).map(
              (field) => (
                <div key={field}>
                  <input
                    {...register(field)}
                    type={field.includes("password") ? "password" : "text"}
                    placeholder={
                      {
                        displayName: "Nome completo",
                        username: "Nome de usuário",
                        email: "E-mail",
                        password: "Senha",
                        confirmPassword: "Confirmar senha",
                      }[field]
                    }
                    className="w-full bg-surface-container-high rounded-lg px-md py-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors[field] && (
                    <p className="text-error text-[12px] mt-xs">{errors[field]?.message}</p>
                  )}
                </div>
              ),
            )}

            {error && <p className="text-error text-[13px]">{error}</p>}

            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Criando..." : "Criar conta"}
            </Button>
          </form>

          <p className="text-[13px] mt-lg text-on-surface-variant">
            Já tem conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
