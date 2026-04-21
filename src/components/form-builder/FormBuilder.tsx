/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { Canvas } from "@/components/form-builder/Canvas";
import { ExportButton } from "@/components/form-builder/ExportButton";
import { FieldSettings } from "@/components/form-builder/FieldSettings";
import { FormHeader } from "@/components/form-builder/FormHeader";
import { ThemeToggle } from "@/components/form-builder/ThemeToggle";
import { FormPreview } from "@/components/form-builder/preview/FormPreview";

export function FormBuilder() {
  const { activeMode, setActiveMode } = useFormBuilderStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="bg-muted/30 min-h-screen animate-pulse" />;
  }

  return (
    <div className="bg-background min-h-screen">
      <Tabs
        value={activeMode}
        onValueChange={(v) => setActiveMode(v as "edit" | "preview")}
        className="flex min-h-screen flex-col"
      >
        <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-10 border-b backdrop-blur">
          {/* pl-15 = px-4 outer + pl-11 form indent, keeps tabs aligned with form title */}
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 pl-15">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <ExportButton />
            </div>
          </div>
        </header>

        <TabsContent value="edit" className="mt-0 flex-1">
          <main className="mx-auto max-w-3xl px-4 py-12">
            <FormHeader />
            <Canvas />
          </main>
          <FieldSettings />
        </TabsContent>

        <TabsContent value="preview" className="mt-0 flex-1">
          <main className="mx-auto max-w-3xl px-4 py-12">
            <FormPreview />
          </main>
        </TabsContent>
      </Tabs>
    </div>
  );
}
