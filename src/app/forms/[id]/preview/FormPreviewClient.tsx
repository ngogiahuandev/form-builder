"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formDb } from "@/services/form-db";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { buildFormAreaStyle } from "@/lib/form-appearance";
import { getFormFont } from "@/lib/form-fonts";
import { FormPreview } from "@/components/form-builder/preview/FormPreview";
import type { StoredForm } from "@/types";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; form: StoredForm }
  | { status: "not-found" };

interface Props {
  id: string;
}

export function FormPreviewClient({ id }: Props) {
  const loadFromDb = useFormBuilderStore((s) => s.loadFromDb);
  const schema = useFormBuilderStore((s) => s.schema);
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

  const formFont = getFormFont(schema.settings.fontFamily);
  const formAreaStyle = buildFormAreaStyle(
    formFont.fontFamily,
    schema.settings.borderRadius ?? 4,
    schema.settings.primaryColor ?? "default",
  );

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-3xl py-12" style={formAreaStyle}>
        <FormPreview />
      </main>

      <div className="fixed bottom-6 left-6">
        <Button variant="outline" asChild>
          <Link href={`/forms/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to editor
          </Link>
        </Button>
      </div>
    </div>
  );
}
