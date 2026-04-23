"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { formDb } from "@/services/form-db";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { FormBuilder } from "@/components/form-builder/FormBuilder";
import type { StoredForm } from "@/types";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; form: StoredForm }
  | { status: "not-found" };

interface FormEditorClientProps {
  id: string;
}

export function FormEditorClient({ id }: FormEditorClientProps) {
  const loadFromDb = useFormBuilderStore((s) => s.loadFromDb);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    void formDb.getById(id).then((stored) => {
      if (cancelled) return;
      if (!stored) {
        setState({ status: "not-found" });
        return;
      }
      loadFromDb(stored);
      setState({ status: "ready", form: stored });
    });

    return () => {
      cancelled = true;
    };
  }, [id, loadFromDb]);

  if (state.status === "not-found") notFound();

  if (state.status === "loading") {
    return <div className="bg-muted/30 min-h-screen animate-pulse" />;
  }

  // FormBuilder only mounts after loadFromDb has populated the store, so
  // useAutoSave inside it subscribes after the initial load — no spurious write.
  return <FormBuilder formId={id} createdAt={state.form.createdAt} />;
}
