"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Subject, SubjectModule, Lesson, Question } from "@/types/models";
import type { SubjectInput, ModuleInput, LessonInput, QuestionInput } from "@/schemas/validation";

// ---- Matérias -------------------------------------------------------------

export function useSubjects(onlyPublished = true) {
  return useQuery({
    queryKey: ["subjects", onlyPublished],
    queryFn: async (): Promise<Subject[]> => {
      const base = collection(db, "subjects");
      const q = onlyPublished
        ? query(base, where("isPublished", "==", true), orderBy("order", "asc"))
        : query(base, orderBy("order", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Subject);
    },
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SubjectInput & { createdBy: string }) => {
      const ref = await addDoc(collection(db, "subjects"), {
        ...input,
        totalModules: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SubjectInput> }) => {
      await updateDoc(doc(db, "subjects", id), { ...data, updatedAt: serverTimestamp() });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteDoc(doc(db, "subjects", id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

// ---- Módulos ---------------------------------------------------------------

export function useModules(subjectId: string | undefined) {
  return useQuery({
    queryKey: ["modules", subjectId],
    enabled: !!subjectId,
    queryFn: async (): Promise<SubjectModule[]> => {
      const q = query(
        collection(db, "subjects", subjectId!, "modules"),
        orderBy("order", "asc"),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SubjectModule);
    },
  });
}

export function useCreateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ModuleInput) => {
      const ref = await addDoc(collection(db, "subjects", input.subjectId, "modules"), {
        ...input,
        totalLessons: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["modules", vars.subjectId] }),
  });
}

// ---- Lições ------------------------------------------------------------------

export function useLessons(subjectId: string | undefined, moduleId: string | undefined) {
  return useQuery({
    queryKey: ["lessons", subjectId, moduleId],
    enabled: !!subjectId && !!moduleId,
    queryFn: async (): Promise<Lesson[]> => {
      const q = query(
        collection(db, "subjects", subjectId!, "modules", moduleId!, "lessons"),
        orderBy("order", "asc"),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lesson);
    },
  });
}

export function useCreateLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: LessonInput) => {
      const ref = await addDoc(
        collection(db, "subjects", input.subjectId, "modules", input.moduleId, "lessons"),
        { ...input, totalQuestions: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
      );
      return ref.id;
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["lessons", vars.subjectId, vars.moduleId] }),
  });
}

// ---- Questões ------------------------------------------------------------------

export function useQuestions(subjectId: string | undefined, moduleId: string | undefined, lessonId: string | undefined) {
  return useQuery({
    queryKey: ["questions", subjectId, moduleId, lessonId],
    enabled: !!subjectId && !!moduleId && !!lessonId,
    queryFn: async (): Promise<Question[]> => {
      const q = query(
        collection(
          db,
          "subjects",
          subjectId!,
          "modules",
          moduleId!,
          "lessons",
          lessonId!,
          "questions",
        ),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Question);
    },
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: QuestionInput) => {
      if (!input.lessonId) throw new Error("lessonId é obrigatório para questões de lição");
      const ref = await addDoc(
        collection(
          db,
          "subjects",
          input.subjectId,
          "modules",
          input.moduleId,
          "lessons",
          input.lessonId,
          "questions",
        ),
        { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
      );
      return ref.id;
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["questions", vars.subjectId, vars.moduleId, vars.lessonId] }),
  });
}
