"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import type { InventoryItem } from "@/types/models";
import { Backpack } from "lucide-react";

export default function InventarioPage() {
  const { profile } = useAuth();

  const { data: items, isLoading } = useQuery({
    queryKey: ["inventory", profile?.uid],
    enabled: !!profile,
    queryFn: async (): Promise<InventoryItem[]> => {
      const snap = await getDocs(collection(db, "users", profile!.uid, "inventory"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as InventoryItem);
    },
  });

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-display text-headline-lg text-on-background mb-xs">Inventário</h1>
        <p className="font-body-md text-[14px] text-on-surface-variant">
          Itens, equipamentos e recompensas conquistadas na sua jornada.
        </p>
      </div>

      {isLoading && <p className="text-on-surface-variant">Carregando inventário...</p>}

      {!isLoading && (!items || items.length === 0) && (
        <Card>
          <CardContent className="p-xl flex flex-col items-center gap-md text-center">
            <Backpack className="h-10 w-10 text-on-surface-variant" />
            <p className="text-on-surface font-headline-md text-[16px]">
              Seu inventário está vazio
            </p>
            <p className="text-on-surface-variant text-[13px] max-w-sm">
              Continue estudando nas dungeons para desbloquear itens e equipamentos conforme sobe
              de nível.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {items?.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-md flex flex-col items-center gap-sm">
              <Backpack className="h-8 w-8 text-primary" />
              <p className="text-on-surface text-[13px] text-center">{item.itemId}</p>
              <p className="text-on-surface-variant text-[12px]">x{item.quantity}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
