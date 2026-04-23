"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formDb } from "@/services/form-db";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FormBuilderStore } from "@/stores/form-builder-store";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const SAVE_DELAY_MS = 1_000;

function extractPersistable(s: FormBuilderStore) {
  return {
    schema: s.schema,
    past: s.past,
    future: s.future,
    currentLabel: s.currentLabel,
  };
}

interface UseAutoSaveParams {
  formId: string;
  createdAt: number;
}

export function useAutoSave({ formId, createdAt }: UseAutoSaveParams): {
  saveStatus: SaveStatus;
} {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Holds data that's been scheduled but not yet flushed, so we can
  // flush it synchronously on unmount to avoid losing in-flight edits.
  const pendingRef = useRef<ReturnType<typeof extractPersistable> | null>(null);

  const persist = useCallback(
    async (data: ReturnType<typeof extractPersistable>) => {
      setSaveStatus("saving");
      try {
        await formDb.save({
          id: formId,
          ...data,
          createdAt,
          updatedAt: Date.now(),
        });
        setSaveStatus("saved");
      } catch (err) {
        console.error("[useAutoSave] Failed to save form:", err);
        setSaveStatus("error");
      }
    },
    [formId, createdAt],
  );

  useEffect(() => {
    const unsubscribe = useFormBuilderStore.subscribe((curr, prev) => {
      // Skip if only UI-only state changed (selectedFieldId, activeMode).
      if (
        curr.schema === prev.schema &&
        curr.past === prev.past &&
        curr.future === prev.future &&
        curr.currentLabel === prev.currentLabel
      ) {
        return;
      }

      setSaveStatus("idle");
      if (timerRef.current !== null) clearTimeout(timerRef.current);

      const snapshot = extractPersistable(curr);
      pendingRef.current = snapshot;

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        pendingRef.current = null;
        void persist(snapshot);
      }, SAVE_DELAY_MS);
    });

    return () => {
      unsubscribe();
      // Flush any pending save immediately on unmount to prevent data loss
      // when the user navigates away before the debounce fires.
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        if (pendingRef.current !== null) {
          void persist(pendingRef.current);
          pendingRef.current = null;
        }
      }
    };
  }, [persist]);

  return { saveStatus };
}
