import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CODE_LANGUAGE } from "@/lib/code-languages";
import { DEFAULT_FORM_FONT_KEY } from "@/lib/form-fonts";
import type {
  FieldType,
  FormField,
  FormSchema,
  FormSettings,
  HistoryEntry,
} from "@/types";

const INITIAL_SCHEMA: FormSchema = {
  id: "form-builder-default",
  title: "Untitled Form",
  description: "",
  fields: [],
  settings: {
    submitLabel: "Submit",
    successMessage: "Thank you for your response!",
    submitAlignment: "center",
    fontFamily: DEFAULT_FORM_FONT_KEY,
  },
};

const DEFAULT_LABELS = {
  short_text: "Short Answer",
  long_text: "Long Answer",
  single_choice: "Single Choice",
  multiple_choice: "Multiple Choice",
  number: "Number",
  date: "Date",
  select: "Select",
  linear_scale: "Linear Scale",
  divider: "Divider",
  email: "Email",
  phone: "Phone Number",
  url: "Website URL",
  rating: "Rating",
  time: "Time",
  yes_no: "Yes / No",
  heading: "Section Heading",
  description: "Add a description…",
  code: "Code",
} as const satisfies Record<FieldType, string>;

function buildDefaultField(type: FieldType): FormField {
  const base: FormField = {
    id: crypto.randomUUID(),
    type,
    label: DEFAULT_LABELS[type],
    required: false,
  };
  if (
    type === "single_choice" ||
    type === "multiple_choice" ||
    type === "select"
  ) {
    // Start with two starter options so the field is usable immediately.
    return {
      ...base,
      options: [
        {
          id: crypto.randomUUID(),
          label: "Option 1",
          value: "Option 1",
        },
        {
          id: crypto.randomUUID(),
          label: "Option 2",
          value: "Option 2",
        },
      ],
    };
  }
  if (type === "linear_scale") {
    return {
      ...base,
      validation: { scaleFrom: 1, scaleTo: 5, scaleJump: 1 },
    };
  }
  if (type === "heading") {
    return { ...base, headingLevel: "h2" as const, textAlign: "left" as const };
  }
  if (type === "description") {
    return { ...base, textAlign: "left" as const };
  }
  if (type === "code") {
    return { ...base, codeLanguage: DEFAULT_CODE_LANGUAGE };
  }
  return base;
}

function pushHistory(
  past: HistoryEntry[],
  schema: FormSchema,
  label: string,
): HistoryEntry[] {
  return [...past, { schema, label, timestamp: Date.now() }].slice(-50);
}

// Module-level deferred edit state — avoids polluting store with UI-only timers
let deferredSnapshot: FormSchema | null = null;
let deferredTimer: ReturnType<typeof setTimeout> | null = null;

function cancelDeferred() {
  if (deferredTimer) {
    clearTimeout(deferredTimer);
    deferredTimer = null;
  }
  deferredSnapshot = null;
}

interface FormBuilderState {
  schema: FormSchema;
  past: HistoryEntry[];
  future: HistoryEntry[];
  currentLabel: string;
  selectedFieldId: string | null;
  activeMode: "edit" | "preview" | "history";
}

interface FormBuilderActions {
  addField: (type: FieldType) => void;
  addFieldAt: (type: FieldType, insertAfterIndex: number) => void;
  removeField: (id: string) => void;
  duplicateField: (id: string) => void;
  /** Discrete change (toggle, select, calendar) — pushes history immediately. */
  updateField: (id: string, updates: Partial<FormField>) => void;
  /**
   * Typing input (text, number) — applies update live, debounces the history
   * push 800 ms after the last call. Only records history if the value changed.
   */
  updateFieldDeferred: (id: string, updates: Partial<FormField>) => void;
  updateFieldLabel: (id: string, label: string) => void;
  reorderFields: (fromIndex: number, toIndex: number) => void;
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
  updateSettings: (updates: Partial<FormSettings>) => void;
  undo: () => void;
  redo: () => void;
  jumpToHistory: (combinedIndex: number) => void;
  setSelectedFieldId: (id: string | null) => void;
  setActiveMode: (mode: "edit" | "preview" | "history") => void;
  resetForm: () => void;
}

export type FormBuilderStore = FormBuilderState & FormBuilderActions;

export const useFormBuilderStore = create<FormBuilderStore>()(
  persist(
    (set, get) => ({
      schema: INITIAL_SCHEMA,
      past: [],
      future: [],
      currentLabel: "Initial state",
      selectedFieldId: null,
      activeMode: "edit" as const,

      addField: (type) => {
        const newField = buildDefaultField(type);
        // Intentionally do NOT auto-select the new field — adding a field
        // should not pop the settings sheet. Users open settings explicitly
        // by clicking the block.
        set((state) => ({
          schema: {
            ...state.schema,
            fields: [...state.schema.fields, newField],
          },
          past: pushHistory(state.past, state.schema, state.currentLabel),
          future: [],
          currentLabel: `Added ${DEFAULT_LABELS[type]}`,
        }));
      },

      addFieldAt: (type, insertAfterIndex) => {
        const newField = buildDefaultField(type);
        set((state) => {
          const fields = [...state.schema.fields];
          fields.splice(insertAfterIndex, 0, newField);
          return {
            schema: { ...state.schema, fields },
            past: pushHistory(state.past, state.schema, state.currentLabel),
            future: [],
            currentLabel: `Added ${DEFAULT_LABELS[type]}`,
          };
        });
      },

      duplicateField: (id) =>
        set((state) => {
          const index = state.schema.fields.findIndex((f) => f.id === id);
          if (index === -1) return state;
          const original = state.schema.fields[index]!;
          const copy: FormField = {
            ...original,
            id: crypto.randomUUID(),
            label: `${original.label} - Duplicated`,
          };
          const fields = [...state.schema.fields];
          fields.splice(index + 1, 0, copy);
          return {
            schema: { ...state.schema, fields },
            past: pushHistory(state.past, state.schema, state.currentLabel),
            future: [],
            currentLabel: `Duplicated "${original.label}"`,
            selectedFieldId: copy.id,
          };
        }),

      removeField: (id) =>
        set((state) => {
          const field = state.schema.fields.find((f) => f.id === id);
          return {
            schema: {
              ...state.schema,
              fields: state.schema.fields.filter((f) => f.id !== id),
            },
            past: pushHistory(state.past, state.schema, state.currentLabel),
            future: [],
            currentLabel: `Removed "${field?.label ?? "field"}"`,
            selectedFieldId:
              state.selectedFieldId === id ? null : state.selectedFieldId,
          };
        }),

      updateField: (id, updates) =>
        set((state) => {
          // If a deferred edit was in progress, absorb its snapshot so discrete
          // actions don't create a duplicate history entry right after.
          const snapshot = deferredSnapshot ?? state.schema;
          cancelDeferred();
          const field = snapshot.fields.find((f) => f.id === id);
          return {
            schema: {
              ...state.schema,
              fields: state.schema.fields.map((f) =>
                f.id === id ? { ...f, ...updates } : f,
              ),
            },
            past: pushHistory(state.past, snapshot, state.currentLabel),
            future: [],
            currentLabel: `Updated "${field?.label ?? "field"}"`,
          };
        }),

      updateFieldDeferred: (id, updates) => {
        // Snapshot the state before the first keystroke of this edit session
        if (!deferredSnapshot) {
          deferredSnapshot = get().schema;
        }

        // Apply the change immediately so the UI stays responsive
        set((state) => ({
          schema: {
            ...state.schema,
            fields: state.schema.fields.map((f) =>
              f.id === id ? { ...f, ...updates } : f,
            ),
          },
        }));

        // Restart the debounce window
        if (deferredTimer) clearTimeout(deferredTimer);
        deferredTimer = setTimeout(() => {
          deferredTimer = null;
          const snapshot = deferredSnapshot;
          deferredSnapshot = null;
          if (!snapshot) return;

          const current = get();
          // Skip if nothing actually changed
          if (JSON.stringify(snapshot) === JSON.stringify(current.schema))
            return;

          const field = current.schema.fields.find((f) => f.id === id);
          set((s) => ({
            past: pushHistory(s.past, snapshot, s.currentLabel),
            future: [],
            currentLabel: `Updated "${field?.label ?? "field"}"`,
          }));
        }, 800);
      },

      // Label edits from TipTap — no history (TipTap has its own undo)
      updateFieldLabel: (id, label) =>
        set((state) => ({
          schema: {
            ...state.schema,
            fields: state.schema.fields.map((f) =>
              f.id === id ? { ...f, label } : f,
            ),
          },
        })),

      reorderFields: (fromIndex, toIndex) =>
        set((state) => {
          const fields = [...state.schema.fields];
          const moved = fields[fromIndex];
          if (!moved) return state;
          fields.splice(fromIndex, 1);
          fields.splice(toIndex, 0, moved);
          return {
            schema: { ...state.schema, fields },
            past: pushHistory(state.past, state.schema, state.currentLabel),
            future: [],
            currentLabel: "Reordered fields",
          };
        }),

      // Title / description from TipTap — no history (TipTap has its own undo)
      updateTitle: (title) =>
        set((state) => ({ schema: { ...state.schema, title } })),

      updateDescription: (description) =>
        set((state) => ({ schema: { ...state.schema, description } })),

      updateSettings: (updates) =>
        set((state) => ({
          schema: {
            ...state.schema,
            settings: { ...state.schema.settings, ...updates },
          },
          past: pushHistory(state.past, state.schema, state.currentLabel),
          future: [],
          currentLabel: "Updated settings",
        })),

      undo: () =>
        set((state) => {
          if (state.past.length === 0) return state;
          cancelDeferred();
          const past = [...state.past];
          const previous = past.pop()!;
          return {
            schema: previous.schema,
            currentLabel: previous.label,
            past,
            future: [
              {
                schema: state.schema,
                label: state.currentLabel,
                timestamp: Date.now(),
              },
              ...state.future,
            ].slice(0, 50),
            selectedFieldId: null,
          };
        }),

      redo: () =>
        set((state) => {
          if (state.future.length === 0) return state;
          cancelDeferred();
          const future = [...state.future];
          const next = future.shift()!;
          return {
            schema: next.schema,
            currentLabel: next.label,
            past: pushHistory(state.past, state.schema, state.currentLabel),
            future,
            selectedFieldId: null,
          };
        }),

      jumpToHistory: (combinedIndex) =>
        set((state) => {
          const combined = [
            ...state.past,
            {
              schema: state.schema,
              label: state.currentLabel,
              timestamp: Date.now(),
            },
            ...state.future,
          ];
          const target = combined[combinedIndex];
          const currentIdx = state.past.length;
          if (!target || combinedIndex === currentIdx) return state;
          cancelDeferred();
          return {
            schema: target.schema,
            currentLabel: target.label,
            past: combined.slice(0, combinedIndex),
            future: combined.slice(combinedIndex + 1),
            selectedFieldId: null,
          };
        }),

      setSelectedFieldId: (id) => set({ selectedFieldId: id }),
      setActiveMode: (mode) => set({ activeMode: mode }),

      resetForm: () => {
        cancelDeferred();
        set({
          schema: { ...INITIAL_SCHEMA, id: crypto.randomUUID() },
          past: [],
          future: [],
          currentLabel: "Initial state",
          selectedFieldId: null,
          activeMode: "edit",
        });
      },
    }),
    {
      name: "form-builder-state",
      version: 2,
      partialize: (state) => ({
        schema: state.schema,
        past: state.past,
        future: state.future,
        currentLabel: state.currentLabel,
      }),
      // Back-fill newly added settings keys on existing persisted state so
      // returning users don't crash on missing fields like `fontFamily`.
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<FormBuilderState> | undefined;
        if (!state?.schema) return state as FormBuilderState;
        if (version < 2) {
          const existing = state.schema.settings as
            | Partial<FormSettings>
            | undefined;
          state.schema = {
            ...state.schema,
            settings: {
              submitLabel: existing?.submitLabel ?? "Submit",
              successMessage:
                existing?.successMessage ?? "Thank you for your response!",
              submitAlignment: existing?.submitAlignment ?? "center",
              fontFamily: existing?.fontFamily ?? DEFAULT_FORM_FONT_KEY,
            },
          };
        }
        return state as FormBuilderState;
      },
    },
  ),
);
