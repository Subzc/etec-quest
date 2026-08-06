"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getLevelProgress } from "@/lib/xp/engine";
import { Card, CardContent } from "@/components/ui/card";
import { Castle, Lock } from "lucide-react";

const CITY_BUILDINGS = [
  { id: "casa", name: "Casa do Aventureiro", requiredLevel: 1 },
  { id: "biblioteca", name: "Biblioteca", requiredLevel: 3 },
  { id: "mercado", name: "Mercado", requiredLevel: 5 },
  { id: "forja", name: "Forja de Equipamentos", requiredLevel: 8 },
  { id: "arena", name: "Arena de Bosses", requiredLevel: 12 },
  { id: "torre", name: "Torre do Mestre", requiredLevel: 18 },
  { id: "castelo", name: "Castelo Real", requiredLevel: 25 },
];

export default function MapaDaCidadePage() {
  const { profile } = useAuth();
  if (!profile) return null;

  const { level } = getLevelProgress(profile.totalXP);

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-display text-headline-lg text-on-background mb-xs">
          Mapa da Cidade
        </h1>
        <p className="font-body-md text-[14px] text-on-surface-variant">
          Sua cidade cresce conforme você sobe de nível. Nível atual: {level}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
        {CITY_BUILDINGS.map((building) => {
          const unlocked = level >= building.requiredLevel;
          return (
            <Card key={building.id} className={!unlocked ? "opacity-50" : undefined}>
              <CardContent className="p-lg flex flex-col items-center gap-sm text-center">
                {unlocked ? (
                  <Castle className="h-10 w-10 text-primary" />
                ) : (
                  <Lock className="h-10 w-10 text-on-surface-variant" />
                )}
                <p className="text-on-surface font-headline-md text-[14px]">{building.name}</p>
                <p className="text-on-surface-variant text-[12px]">
                  {unlocked ? "Desbloqueada" : `Requer nível ${building.requiredLevel}`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
