"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForms } from "@/hooks/use-forms";
import { FormCard } from "@/components/forms-list/FormCard";

export function FormsListClient() {
  const router = useRouter();
  const { forms, isLoading, error, createForm, deleteForm } = useForms();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const id = await createForm();
      router.push(`/forms/${id}`);
    } catch {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <header>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-3">
          <h1 className="text-xl font-semibold">Forms</h1>
          <Button onClick={() => void handleCreate()} disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? "Creating…" : "New form"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl py-8">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-muted h-32 animate-pulse rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && error !== null && (
          <div className="py-12 text-center">
            <p className="text-destructive text-sm">
              Failed to load forms: {error.message}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.refresh()}
            >
              Retry
            </Button>
          </div>
        )}

        {!isLoading && error === null && forms.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="bg-muted rounded-full p-4">
              <FileText className="text-muted-foreground h-8 w-8" />
            </div>
            <div>
              <h3 className="font-medium">No forms yet</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Create your first form to get started.
              </p>
            </div>
            <Button onClick={() => void handleCreate()} disabled={isCreating}>
              <Plus className="mr-2 h-4 w-4" />
              Create form
            </Button>
          </div>
        )}

        {!isLoading && error === null && forms.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <FormCard key={form.id} form={form} onDelete={deleteForm} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
