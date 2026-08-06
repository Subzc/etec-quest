"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { StudyChart, type StudyChartPoint } from "@/components/dashboard/StudyChart";
import { getLevelProgress } from "@/lib/xp/engine";
import type { StudySession } from "@/types/models";

function last7DaysISO(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]!);
  }
  return days;
}

export default function DashboardPage() {
  const { profile } = useAuth();

  const { data: sessions } = useQuery({
    queryKey: ["studySessions", profile?.uid],
    enabled: !!profile,
    queryFn: async (): Promise<StudySession[]> => {
      const q = query(
        collection(db, "users", profile!.uid, "studySessions"),
        where("date", "in", last7DaysISO()),
        orderBy("date", "asc"),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudySession);
    },
  });

  if (!profile) return null;

  const { level, progressPercent } = getLevelProgress(profile.totalXP);

  const chartData: StudyChartPoint[] = last7DaysISO().map((date) => {
    const minutes =
      sessions
        ?.filter((s) => s.date === date)
        .reduce((sum, s) => sum + Math.floor(s.durationSeconds / 60), 0) ?? 0;
    const [, m, d] = date.split("-");
    return { date: `${d}/${m}`, minutes };
  });

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-display text-headline-lg text-on-background mb-xs">
          Olá, {profile.displayName}
        </h1>
        <p className="font-body-md text-[14px] text-on-surface-variant">
          Nível {level} · {progressPercent}% até o próximo nível
        </p>
      </div>

      <StatsGrid stats={profile.stats} streakDays={profile.streak.current} />

      <StudyChart data={chartData} />
    </div>
  );
}
