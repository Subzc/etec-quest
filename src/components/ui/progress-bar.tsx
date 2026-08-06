"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percent: number; // 0-100
  className?: string;
  glow?: boolean;
}

export function ProgressBar({ percent, className, glow = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      className={cn(
        "h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden",
        glow && "shadow-[0_0_8px_rgba(173,198,255,0.1)]",
        className,
      )}
    >
      <motion.div
        className={cn("h-full bg-primary", glow && "shadow-[0_0_12px_rgba(173,198,255,0.5)]")}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
