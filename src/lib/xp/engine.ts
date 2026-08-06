/**
 * Motor de XP / Nível do ETEC Quest.
 *
 * Curva de XP: cada nível exige mais XP que o anterior (crescimento
 * quadrático suave), similar a RPGs clássicos. Ajuste BASE e GROWTH
 * para recalibrar a progressão sem tocar em nenhuma outra parte do app.
 */

const BASE_XP = 500; // XP necessário para ir do nível 1 -> 2
const GROWTH = 1.12; // fator de crescimento por nível

/** XP necessário para completar o `level` informado (ex.: level=1 -> XP p/ chegar ao 2). */
export function xpRequiredForLevel(level: number): number {
  if (level < 1) return 0;
  return Math.round(BASE_XP * Math.pow(GROWTH, level - 1));
}

/** Dado o XP total acumulado, retorna nível atual, XP dentro do nível e XP necessário para o próximo. */
export function getLevelProgress(totalXP: number): {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  progressPercent: number;
} {
  let level = 1;
  let remaining = totalXP;

  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
  }

  const xpToNextLevel = xpRequiredForLevel(level);
  const progressPercent = xpToNextLevel > 0 ? Math.min(100, Math.round((remaining / xpToNextLevel) * 100)) : 0;

  return { level, currentXP: remaining, xpToNextLevel, progressPercent };
}

/** Regras de quanto XP cada ação concede. Fica tudo centralizado aqui — nada hardcoded na UI. */
export const XP_RULES = {
  /** XP por bloco de minutos estudados (cronômetro). */
  perStudyMinutes: (minutes: number) => Math.floor(minutes / 10) * 15, // 15 XP a cada 10 min
  correctAnswer: (difficulty: "easy" | "medium" | "hard") =>
    ({ easy: 10, medium: 20, hard: 35 }[difficulty]),
  lessonCompleted: (xpReward: number) => xpReward,
  moduleCompleted: 100,
  bossDefeated: (xpReward: number) => xpReward,
  dailyQuest: (xpReward: number) => xpReward,
  weeklyQuest: (xpReward: number) => xpReward,
  achievement: (xpReward: number) => xpReward,
  mockExam: (xpReward: number) => xpReward,
};

/** Verifica se, ao ganhar `xpGained`, o usuário sobe de nível — e quantos níveis de uma vez. */
export function checkLevelUp(
  totalXPBefore: number,
  xpGained: number,
): { leveledUp: boolean; fromLevel: number; toLevel: number } {
  const before = getLevelProgress(totalXPBefore).level;
  const after = getLevelProgress(totalXPBefore + xpGained).level;
  return { leveledUp: after > before, fromLevel: before, toLevel: after };
}
