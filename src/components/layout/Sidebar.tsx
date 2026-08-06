"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Map,
  Castle,
  Backpack,
  Trophy,
  ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  { path: "/mapa-da-cidade", label: "MAPA DA CIDADE", icon: Map },
  { path: "/dungeons", label: "DUNGEONS", icon: Castle },
  { path: "/inventario", label: "INVENTÁRIO", icon: Backpack },
  { path: "/ranking", label: "RANKING", icon: Trophy },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-container-low/40 backdrop-blur-xl border-r border-outline-variant/10 z-50 flex flex-col p-lg">
      <div className="flex items-center gap-md mb-xl">
        <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center">
          <Castle className="h-5 w-5 text-primary" />
        </div>
        <span className="font-headline-md text-headline-md tracking-tight text-on-surface">
          ETEC Quest
        </span>
      </div>

      <nav className="flex-1 space-y-xs">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = pathname?.startsWith(path);
          return (
            <Link
              key={path}
              href={path}
              className={cn(
                "flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all group",
                active && "bg-primary-container/20 text-primary font-semibold",
              )}
            >
              <Icon className="h-5 w-5 text-primary/70 group-hover:text-primary" />
              <span className="font-label-sm text-label-sm">{label}</span>
            </Link>
          );
        })}

        {profile?.role === "admin" && (
          <div className="pt-lg border-t border-outline-variant/20 mt-lg">
            <Link
              href="/admin"
              className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all group"
            >
              <ShieldUser className="h-5 w-5 text-secondary/70 group-hover:text-secondary" />
              <span className="font-label-sm text-label-sm">MESTRE (ADMIN)</span>
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
