"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminHomePage() {
  const { profile } = useAuth();

  if (profile && profile.role !== "admin") {
    return (
      <p className="text-error">Acesso restrito ao Mestre (Admin).</p>
    );
  }

  const sections = [
    { href: "/admin/subjects", label: "Matérias & Dungeons", desc: "Criar e editar matérias, módulos, lições e questões." },
  ];

  return (
    <div className="flex flex-col gap-lg">
      <h1 className="font-display text-headline-lg text-on-background">Painel do Mestre</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="hover:border-primary/40 transition-colors">
              <CardContent className="p-lg">
                <h3 className="font-headline-md text-[18px] text-on-surface mb-xs">{s.label}</h3>
                <p className="text-[13px] text-on-surface-variant">{s.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
