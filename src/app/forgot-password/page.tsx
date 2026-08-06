"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/validation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch {
      setError("Não foi possível enviar o e-mail de recuperação.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-md">
      <Card className="w-full max-w-md">
        <CardContent className="p-xl">
          <h1 className="font-display text-headline-lg text-on-background mb-xs">
            Recuperar Senha
          </h1>
          <p className="font-body-md text-[14px] text-on-surface-variant mb-lg">
            Informe seu e-mail para receber o link de redefinição.
          </p>

          {sent ? (
            <p className="text-primary text-[14px]">
              Enviamos um link de recuperação para o seu e-mail.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
              <div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="E-mail"
                  className="w-full bg-surface-container-high rounded-lg px-md py-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.email && (
                  <p className="text-error text-[12px] mt-xs">{errors.email.message}</p>
                )}
              </div>
              {error && <p className="text-error text-[13px]">{error}</p>}
              <Button type="submit" size="lg" disabled={isSubmitting}>
                Enviar link
              </Button>
            </form>
          )}

          <Link href="/login" className="text-primary text-[13px] hover:underline block mt-lg">
            Voltar para o login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
