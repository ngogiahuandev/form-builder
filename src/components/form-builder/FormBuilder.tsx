/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Eye, History, Redo2, RotateCcw, Undo2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAutoSave } from "@/hooks/use-auto-save";
import type { SaveStatus } from "@/hooks/use-auto-save";
import { buildFormAreaStyle } from "@/lib/form-appearance";
import { getFormFont } from "@/lib/form-fonts";
import { cn } from "@/lib/utils";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { Canvas } from "@/components/form-builder/Canvas";
import { ExportButton } from "@/components/form-builder/ExportButton";
import { FieldSettings } from "@/components/form-builder/FieldSettings";
import { FormHeader } from "@/components/form-builder/FormHeader";
import { FormSettingsPanel } from "@/components/form-builder/FormSettingsPanel";
import { HistoryPanel } from "@/components/form-builder/HistoryPanel";
import { ThemeToggle } from "@/components/form-builder/ThemeToggle";

interface FormBuilderProps {
  /** ID of the form currently loaded in the store. */
  formId: string;
  /** Preserved from IndexedDB so auto-save can write it back correctly. */
  createdAt: number;
}

function SaveStatusBadge({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  const label =
    status === "saving"
      ? "Saving…"
      : status === "saved"
        ? "Saved"
        : "Save failed";

  return (
    <span
      className={cn(
        "text-xs font-medium transition-colors",
        status === "saving" && "text-muted-foreground",
        status === "saved" && "text-green-600 dark:text-green-400",
        status === "error" && "text-destructive",
      )}
    >
      {label}
    </span>
  );
}

export function FormBuilder({ formId, createdAt }: FormBuilderProps) {
  const { schema, past, future, undo, redo, resetForm } = useFormBuilderStore();

  const { saveStatus } = useAutoSave({ formId, createdAt });

  const [mounted, setMounted] = useState(false);

  const formFont = getFormFont(schema.settings.fontFamily);
  const formAreaStyle = buildFormAreaStyle(
    formFont.fontFamily,
    schema.settings.borderRadius ?? 4,
    schema.settings.primaryColor ?? "default",
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).isContentEditable) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((mod && e.shiftKey && e.key === "z") || (mod && e.key === "y")) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  if (!mounted) {
    return <div className="bg-muted/30 min-h-screen animate-pulse" />;
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-10 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="gap-1.5">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Forms
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={resetForm}
              className="text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4" />
              Clear all
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <SaveStatusBadge status={saveStatus} />
            <Button
              variant="outline"
              size="icon"
              onClick={undo}
              disabled={past.length === 0}
            >
              <Undo2 />
              <span className="sr-only">Undo</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={redo}
              disabled={future.length === 0}
            >
              <Redo2 />
              <span className="sr-only">Redo</span>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="History">
                  <History className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col overflow-hidden p-0">
                <SheetHeader className="px-4 pt-5 pb-2">
                  <SheetTitle>Change history</SheetTitle>
                  <p className="text-muted-foreground text-sm">
                    Click any entry to restore to that state.
                  </p>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  <HistoryPanel />
                </div>
              </SheetContent>
            </Sheet>

            <FormSettingsPanel />
            <ThemeToggle />
            <ExportButton />

            <Button variant="default" asChild>
              <Link href={`/forms/${formId}/preview`}>
                <Eye className="h-4 w-4" />
                Preview
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl py-12" style={formAreaStyle}>
        {/* key forces TipTap to re-mount when switching between forms */}
        <FormHeader key={schema.id} />
        <Canvas />
      </main>
      <FieldSettings />
    </div>
  );
}
