"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { subjectSchema, type SubjectInput } from "@/schemas/validation";
import {
  useSubjects,
  useCreateSubject,
  useDeleteSubject,
  useUpdateSubject,
} from "@/hooks/useSubjects";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminSubjectsPage() {
  const { profile } = useAuth();
  const { data: subjects } = useSubjects(false);
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { isPublished: false, order: 0 },
  });

  const onSubmit = async (data: SubjectInput) => {
    if (!profile) return;
    await createSubject.mutateAsync({ ...data, createdBy: profile.uid });
    reset();
  };

  return (
    <div className="flex flex-col gap-lg">
      <h1 className="font-display text-headline-lg text-on-background">Matérias & Dungeons</h1>

      <Card>
        <CardContent className="p-lg">
          <h2 className="font-headline-md text-[18px] text-on-surface mb-md">Nova matéria</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <input
              {...register("name")}
              placeholder="Nome (ex.: Álgebra)"
              className="bg-surface-container-high rounded-lg px-md py-sm text-on-surface"
            />
            <input
              {...register("dungeonTitle")}
              placeholder="Título da Dungeon (ex.: Fortaleza da Álgebra)"
              className="bg-surface-container-high rounded-lg px-md py-sm text-on-surface"
            />
            <textarea
              {...register("description")}
              placeholder="Descrição"
              className="bg-surface-container-high rounded-lg px-md py-sm text-on-surface md:col-span-2"
            />
            <input
              {...register("icon")}
              placeholder="Ícone (nome material-symbols)"
              className="bg-surface-container-high rounded-lg px-md py-sm text-on-surface"
            />
            <input
              {...register("color")}
              placeholder="Cor (token tailwind, ex.: primary)"
              className="bg-surface-container-high rounded-lg px-md py-sm text-on-surface"
            />
            <input
              type="number"
              {...register("order", { valueAsNumber: true })}
              placeholder="Ordem"
              className="bg-surface-container-high rounded-lg px-md py-sm text-on-surface"
            />
            <label className="flex items-center gap-sm text-on-surface-variant text-[14px]">
              <input type="checkbox" {...register("isPublished")} />
              Publicar imediatamente
            </label>

            {Object.values(errors).length > 0 && (
              <p className="text-error text-[13px] md:col-span-2">Verifique os campos obrigatórios.</p>
            )}

            <Button type="submit" disabled={isSubmitting} className="md:col-span-2">
              Criar matéria
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-sm">
        {(subjects ?? []).map((s) => (
          <Card key={s.id}>
            <CardContent className="p-md flex items-center justify-between">
              <div>
                <p className="text-on-surface font-headline-md text-[16px]">{s.dungeonTitle}</p>
                <p className="text-on-surface-variant text-[13px]">
                  {s.name} · {s.isPublished ? "Publicada" : "Rascunho"}
                </p>
              </div>
              <div className="flex gap-sm">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateSubject.mutate({ id: s.id, data: { isPublished: !s.isPublished } })}
                >
                  {s.isPublished ? "Ocultar" : "Publicar"}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteSubject.mutate(s.id)}>
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
