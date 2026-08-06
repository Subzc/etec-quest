"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { getLevelProgress } from "@/lib/xp/engine";
import type { UserProfile } from "@/types/models";
import { Trophy } from "lucide-react";

export default function RankingPage() {
  const { profile } = useAuth();

  const { data: topUsers, isLoading } = useQuery({
    queryKey: ["ranking-global"],
    queryFn: async (): Promise<UserProfile[]> => {
      const q = query(collection(db, "users"), orderBy("totalXP", "desc"), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as UserProfile);
    },
  });

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-display text-headline-lg text-on-background mb-xs">Ranking</h1>
        <p className="font-body-md text-[14px] text-on-surface-variant">
          Os aventureiros com mais XP acumulado no ETEC Quest.
        </p>
      </div>

      {isLoading && <p className="text-on-surface-variant">Carregando ranking...</p>}

      {!isLoading && (!topUsers || topUsers.length === 0) && (
        <p className="text-on-surface-variant">
          Ainda não há aventureiros suficientes para montar um ranking.
        </p>
      )}

      <div className="flex flex-col gap-sm">
        {topUsers?.map((user, index) => {
          const { level } = getLevelProgress(user.totalXP);
          const isMe = user.uid === profile?.uid;
          return (
            <Card key={user.uid} className={isMe ? "border border-primary/40" : undefined}>
              <CardContent className="p-md flex items-center gap-md">
                <div className="w-8 text-center font-headline-md text-[18px] text-on-surface-variant">
                  {index < 3 ? <Trophy className="h-5 w-5 text-secondary inline" /> : index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-on-surface font-headline-md text-[15px]">
                    {user.username} {isMe && <span className="text-primary text-[12px]">(você)</span>}
                  </p>
                  <p className="text-on-surface-variant text-[13px]">
                    Nível {level} · {user.title}
                  </p>
                </div>
                <span className="text-primary font-headline-md text-[16px] tabular-nums">
                  {user.totalXP} XP
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
