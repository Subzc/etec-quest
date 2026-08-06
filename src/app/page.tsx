"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(firebaseUser ? "/dashboard" : "/login");
  }, [loading, firebaseUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <span className="font-label-sm text-label-sm text-on-surface-variant">Carregando...</span>
    </div>
  );
}
