/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Eye, History, Redo2, SquarePen, Undo2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { Canvas } from "@/components/form-builder/Canvas";
import { ExportButton } from "@/components/form-builder/ExportButton";
import { FieldSettings } from "@/components/form-builder/FieldSettings";
import { FormHeader } from "@/components/form-builder/FormHeader";
import { HistoryPanel } from "@/components/form-builder/HistoryPanel";
import { ThemeToggle } from "@/components/form-builder/ThemeToggle";
import { FormPreview } from "@/components/form-builder/preview/FormPreview";

export function FormBuilder() {
  const { activeMode, setActiveMode, past, future, undo, redo } =
    useFormBuilderStore();
  const [mounted, setMounted] = useState(false);

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
      <Tabs
        value={activeMode}
        onValueChange={(v) =>
          setActiveMode(v as "edit" | "preview" | "history")
        }
        className="flex min-h-screen flex-col"
      >
        <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-10 border-b backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-3 py-3">
            <TabsList>
              <TabsTrigger value="edit">
                <SquarePen className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={undo}
                disabled={past.length === 0}
              >
                <Undo2 />
                <span className="sr-only">Undo</span>
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={redo}
                disabled={future.length === 0}
              >
                <Redo2 />
                <span className="sr-only">Redo</span>
              </Button>
              <ThemeToggle />
              <ExportButton />
            </div>
          </div>
        </header>

        <TabsContent value="edit" className="mt-0 flex-1">
          <main className="mx-auto max-w-3xl py-12">
            <FormHeader />
            <Canvas />
          </main>
          <FieldSettings />
        </TabsContent>

        <TabsContent value="preview" className="mt-0 flex-1">
          <main className="mx-auto max-w-3xl py-12">
            <FormPreview />
          </main>
        </TabsContent>

        <TabsContent value="history" className="mt-0 flex-1">
          <main className="mx-auto max-w-3xl py-12">
            <div className="mb-6 px-3">
              <h2 className="text-lg font-semibold">Change history</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Click any entry to restore to that state.
              </p>
            </div>
            <HistoryPanel />
          </main>
        </TabsContent>
      </Tabs>
    </div>
  );
}
