"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  increment,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { XP_RULES, checkLevelUp } from "@/lib/xp/engine";
import { todayISODate } from "@/lib/utils";
import type { UserProfile } from "@/types/models";

interface UseStudyTimerParams {
  userId: string;
  subjectId: string;
  moduleId?: string;
  lessonId?: string;
  onLevelUp?: (fromLevel: number, toLevel: number) => void;
}

/**
 * Cronômetro de estudo: ao iniciar, cria uma StudySession no Firestore.
 * A cada tick (1s) atualiza o estado local; ao pausar/parar, persiste a
 * duração final e credita XP proporcional aos minutos estudados,
 * atualizando o perfil do usuário (totalXP, nível, streak) numa transação.
 */
export function useStudyTimer({ userId, subjectId, moduleId, lessonId, onLevelUp }: UseStudyTimerParams) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const start = useCallback(async () => {
    const ref = await addDoc(collection(db, "users", userId, "studySessions"), {
      userId,
      subjectId,
      moduleId: moduleId ?? null,
      lessonId: lessonId ?? null,
      startedAt: serverTimestamp(),
      endedAt: null,
      durationSeconds: 0,
      xpEarned: 0,
      date: todayISODate(),
      source: "timer",
    });
    sessionIdRef.current = ref.id;
    setSeconds(0);
    setIsRunning(true);
  }, [userId, subjectId, moduleId, lessonId]);

  const stop = useCallback(async () => {
    setIsRunning(false);
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    const minutes = Math.floor(seconds / 60);
    const xpEarned = XP_RULES.perStudyMinutes(minutes);

    await updateDoc(doc(db, "users", userId, "studySessions", sessionId), {
      endedAt: serverTimestamp(),
      durationSeconds: seconds,
      xpEarned,
    });

    // Transação: credita XP, atualiza estatísticas e verifica level up
    const userRef = doc(db, "users", userId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists()) return;
      const profile = snap.data() as UserProfile;

      const { leveledUp, toLevel } = checkLevelUp(profile.totalXP, xpEarned);

      tx.update(userRef, {
        totalXP: increment(xpEarned),
        level: leveledUp ? toLevel : profile.level,
        "stats.totalStudyMinutes": increment(minutes),
        "stats.totalSessions": increment(1),
        updatedAt: serverTimestamp(),
      });

      if (leveledUp && onLevelUp) {
        onLevelUp(profile.level, toLevel);
      }
    });

    if (xpEarned > 0) {
      await addDoc(collection(db, "users", userId, "xpHistory"), {
        userId,
        amount: xpEarned,
        source: "study_time",
        refId: sessionId,
        createdAt: serverTimestamp(),
      });
    }

    sessionIdRef.current = null;
    setSeconds(0);
  }, [userId, seconds, onLevelUp]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);

  return { seconds, isRunning, start, pause, resume, stop };
}
