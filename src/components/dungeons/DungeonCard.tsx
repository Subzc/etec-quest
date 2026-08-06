"use client";

import { cn } from "@/lib/utils";
import type { Subject } from "@/types/models";
import { Layers } from "lucide-react";

interface DungeonCardProps {
  subject: Subject;
  masteryPercent: number;
  active: boolean;
  onSelect: () => void;
}

export function DungeonCard({ subject, masteryPercent, active, onSelect }: DungeonCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative bg-surface-container/60 backdrop-blur-xl rounded-2xl p-lg cursor-pointer overflow-hidden shadow-lg border transition-all duration-300 hover:shadow-primary/20",
        active ? "border-primary/30 hover:border-primary/50" : "border-outline-variant/10",
      )}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_12px_rgba(173,198,255,0.8)]" />
      )}
      <div className="flex flex-col sm:flex-row gap-lg items-start sm:items-center relative z-10">
        <div className="w-20 h-20 shrink-0 bg-gradient-to-br from-surface-container-high to-surface-container-highest rounded-xl flex items-center justify-center shadow-inner">
          <Layers className="h-10 w-10 text-primary" />
        </div>
        <div className="flex-1 w-full min-w-0">
          <h3 className="font-headline-lg text-headline-lg text-on-surface truncate group-hover:text-primary transition-colors">
            {subject.dungeonTitle}
          </h3>
          <p className="font-body-md text-[14px] text-on-surface-variant mt-xs line-clamp-2">
            {subject.description}
          </p>
          <div className="mt-sm h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary shadow-[0_0_8px_rgba(173,198,255,0.5)]"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
