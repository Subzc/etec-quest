"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getLevelProgress } from "@/lib/xp/engine";
import { ProgressBar } from "@/components/ui/progress-bar";
import { User as UserIcon } from "lucide-react";

export function Header() {
  const { profile } = useAuth();
  if (!profile) return null;

  const { level, currentXP, xpToNextLevel, progressPercent } = getLevelProgress(profile.totalXP);

  return (
    <header className="fixed top-0 left-72 right-0 h-20 bg-background/80 backdrop-blur-md z-40 px-lg flex items-center justify-between">
      <div className="flex items-center gap-lg flex-1 max-w-xl">
        <div className="flex-1">
          <div className="flex justify-between items-end mb-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              NÍVEL {level}
            </span>
            <span className="font-label-sm text-label-sm text-primary">
              {currentXP} / {xpToNextLevel} XP
            </span>
          </div>
          <ProgressBar percent={progressPercent} />
        </div>
      </div>

      <div className="flex items-center gap-md ml-lg">
        <div className="text-right hidden sm:block">
          <div className="font-label-sm text-label-sm text-on-surface">{profile.username}</div>
          <div className="text-[10px] text-secondary font-bold uppercase tracking-widest">
            {profile.title}
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(173,198,255,0.15)] transition-transform hover:scale-105 cursor-pointer">
          <UserIcon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </header>
  );
}
