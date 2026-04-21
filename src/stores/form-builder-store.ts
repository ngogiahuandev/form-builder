import { create } from "zustand";
import { persist } from "zustand/middleware";
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
    submitAlignment: "left",
  },
};

const DEFAULT_LABELS = {
  short_text: "Short Answer",
  long_text: "Long Answer",
  single_choice: "Single Choice",
  multiple_choice: "Multiple Choice",
  number: "Number",
  date: "Date",
} as const satisfies Record<FieldType, string>;

function buildDefaultField(type: FieldType): FormField {
  const base: FormField = {
    id: crypto.randomUUID(),
    type,
    label: DEFAULT_LABELS[type],
    required: false,
  };
  if (type === "single_choice" || type === "multiple_choice") {
    return { ...base, options: [], variant: "radio" };
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
  updateField: (id: string, updates: Partial<FormField>) => void;
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
}

export type FormBuilderStore = FormBuilderState & FormBuilderActions;

export const useFormBuilderStore = create<FormBuilderStore>()(
  persist(
    (set) => ({
      schema: INITIAL_SCHEMA,
      past: [],
      future: [],
      currentLabel: "Initial state",
      selectedFieldId: null,
      activeMode: "edit" as const,

      addField: (type) => {
        const newField = buildDefaultField(type);
        set((state) => ({
          schema: {
            ...state.schema,
            fields: [...state.schema.fields, newField],
          },
          past: pushHistory(state.past, state.schema, state.currentLabel),
          future: [],
          currentLabel: `Added ${DEFAULT_LABELS[type]}`,
          selectedFieldId: newField.id,
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
            selectedFieldId: newField.id,
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
          const field = state.schema.fields.find((f) => f.id === id);
          return {
            schema: {
              ...state.schema,
              fields: state.schema.fields.map((f) =>
                f.id === id ? { ...f, ...updates } : f,
              ),
            },
            past: pushHistory(state.past, state.schema, state.currentLabel),
            future: [],
            currentLabel: `Updated "${field?.label ?? "field"}"`,
          };
        }),

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
    }),
    {
      name: "form-builder-state",
      partialize: (state) => ({ schema: state.schema }),
    },
  ),
);
