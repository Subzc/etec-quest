"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubjects, useModules } from "@/hooks/useSubjects";
import { DungeonCard } from "@/components/dungeons/DungeonCard";
import { Button } from "@/components/ui/button";
import { useStudyTimer } from "@/hooks/useStudyTimer";

function formatTimer(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function DungeonsPage() {
  const { profile } = useAuth();
  const { data: subjects, isLoading } = useSubjects(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = subjects?.find((s) => s.id === selectedId) ?? subjects?.[0];
  const { data: modules } = useModules(selected?.id);

  const timer = useStudyTimer({
    userId: profile?.uid ?? "",
    subjectId: selected?.id ?? "",
  });

  if (isLoading) {
    return <p className="text-on-surface-variant">Carregando dungeons...</p>;
  }

  if (!subjects || subjects.length === 0) {
    return (
      <div className="text-on-surface-variant">
        Nenhuma matéria publicada ainda. Peça a um administrador para criar dungeons no painel
        Mestre (Admin).
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full relative z-0 pb-xl">
      <header className="mb-xl">
        <h1 className="font-display text-headline-lg text-on-background mb-xs">
          Dungeons de Conhecimento
        </h1>
        <p className="font-body-md text-[14px] text-on-surface-variant max-w-lg">
          Selecione seu domínio de especialização e comece sua sessão de estudo.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <div className="lg:col-span-7 flex flex-col gap-md">
          {subjects.map((subject) => (
            <DungeonCard
              key={subject.id}
              subject={subject}
              masteryPercent={40} // TODO: calcular a partir de lições concluídas / total
              active={subject.id === selected?.id}
              onSelect={() => setSelectedId(subject.id)}
            />
          ))}
        </div>

        <div className="lg:col-span-5">
          {selected && (
            <div className="bg-surface-container/40 rounded-2xl border border-outline-variant/10 overflow-hidden">
              <div className="p-lg border-b border-outline-variant/10">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  {selected.dungeonTitle}
                </h2>
                <p className="text-[14px] text-on-surface-variant mt-xs">{selected.description}</p>
              </div>

              <div className="p-lg flex flex-col gap-md">
                <h3 className="font-headline-md text-[16px] text-on-surface">Módulos</h3>
                {(modules ?? []).map((m) => (
                  <div key={m.id} className="p-md rounded-xl bg-surface-container">
                    <p className="text-on-surface text-[15px]">{m.title}</p>
                    <p className="text-on-surface-variant text-[13px]">{m.description}</p>
                  </div>
                ))}
                {(!modules || modules.length === 0) && (
                  <p className="text-on-surface-variant text-[14px]">
                    Nenhum módulo cadastrado ainda para esta matéria.
                  </p>
                )}
              </div>

              <div className="p-md bg-surface-container-low border-t border-outline-variant/10 flex items-center gap-md">
                <span className="font-headline-md text-[24px] text-primary tabular-nums">
                  {formatTimer(timer.seconds)}
                </span>
                {!timer.isRunning ? (
                  <Button className="flex-1" onClick={timer.start}>
                    Entrar na Sessão de Estudo
                  </Button>
                ) : (
                  <Button className="flex-1" variant="destructive" onClick={timer.stop}>
                    Encerrar Sessão
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
