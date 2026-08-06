import { Card, CardContent } from "@/components/ui/card";
import { formatMinutes } from "@/lib/utils";
import type { UserStats } from "@/types/models";
import { Flame, Clock, BookCheck, Target, TrendingUp } from "lucide-react";

interface StatsGridProps {
  stats: UserStats;
  streakDays: number;
}

export function StatsGrid({ stats, streakDays }: StatsGridProps) {
  const items = [
    { label: "Horas Estudadas", value: formatMinutes(stats.totalStudyMinutes), icon: Clock },
    { label: "Dias Consecutivos", value: `${streakDays} dias`, icon: Flame },
    { label: "Matérias Concluídas", value: stats.subjectsCompleted, icon: BookCheck },
    { label: "Questões Respondidas", value: stats.questionsAnswered, icon: Target },
    { label: "Taxa de Acertos", value: `${stats.accuracyRate}%`, icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="p-lg flex flex-col gap-sm">
            <Icon className="h-5 w-5 text-primary" />
            <span className="font-headline-lg text-headline-lg text-on-surface">{value}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
