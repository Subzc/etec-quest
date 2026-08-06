"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !firebaseUser) router.replace("/login");
  }, [loading, firebaseUser, router]);

  if (loading || !firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="font-label-sm text-label-sm text-on-surface-variant">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-72 w-full min-h-screen">
        <Header />
        <main className="pt-20 p-lg w-full bg-background">{children}</main>
      </div>
    </div>
  );
}
