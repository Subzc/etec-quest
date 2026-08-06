"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, doc, increment, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { XP_RULES, checkLevelUp } from "@/lib/xp/engine";
import type { Question, UserProfile } from "@/types/models";

interface AnswerParams {
  userId: string;
  question: Question;
  selectedOptionId?: string;
  selectedBoolean?: boolean;
  timeSpentSeconds: number;
  onLevelUp?: (fromLevel: number, toLevel: number) => void;
}

function isAnswerCorrect(q: Question, selectedOptionId?: string, selectedBoolean?: boolean) {
  if (q.type === "multiple_choice") return selectedOptionId === q.correctOptionId;
  if (q.type === "true_false") return selectedBoolean === q.correctBoolean;
  return false; // open_text exige correção manual/IA — não pontua automaticamente
}

export function useAnswerQuestion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      question,
      selectedOptionId,
      selectedBoolean,
      timeSpentSeconds,
      onLevelUp,
    }: AnswerParams) => {
      const correct = isAnswerCorrect(question, selectedOptionId, selectedBoolean);
      const xpEarned = correct ? XP_RULES.correctAnswer(question.difficulty) : 0;

      await addDoc(collection(db, "users", userId, "answers"), {
        userId,
        questionId: question.id,
        subjectId: question.subjectId,
        selectedOptionId: selectedOptionId ?? null,
        selectedBoolean: selectedBoolean ?? null,
        isCorrect: correct,
        xpEarned,
        answeredAt: serverTimestamp(),
        timeSpentSeconds,
      });

      const userRef = doc(db, "users", userId);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists()) return;
        const profile = snap.data() as UserProfile;

        const newCorrect = profile.stats.correctAnswers + (correct ? 1 : 0);
        const newAnswered = profile.stats.questionsAnswered + 1;
        const newAccuracy = newAnswered > 0 ? Math.round((newCorrect / newAnswered) * 100) : 0;

        const { leveledUp, toLevel } = checkLevelUp(profile.totalXP, xpEarned);

        tx.update(userRef, {
          totalXP: increment(xpEarned),
          level: leveledUp ? toLevel : profile.level,
          "stats.questionsAnswered": increment(1),
          "stats.correctAnswers": increment(correct ? 1 : 0),
          "stats.accuracyRate": newAccuracy,
          updatedAt: serverTimestamp(),
        });

        if (leveledUp && onLevelUp) onLevelUp(profile.level, toLevel);
      });

      return { correct, xpEarned };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["userProfile", vars.userId] });
    },
  });
}
