import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FieldType, FormField, FormSchema, FormSettings } from "@/types";

const INITIAL_SCHEMA: FormSchema = {
  id: "form-builder-default",
  title: "Untitled Form",
  description: "",
  fields: [],
  settings: {
    submitLabel: "Submit",
    successMessage: "Thank you for your response!",
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

interface FormBuilderState {
  schema: FormSchema;
  selectedFieldId: string | null;
  activeMode: "edit" | "preview";
}

interface FormBuilderActions {
  addField: (type: FieldType) => void;
  addFieldAt: (type: FieldType, insertAfterIndex: number) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  reorderFields: (fromIndex: number, toIndex: number) => void;
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
  updateSettings: (updates: Partial<FormSettings>) => void;
  setSelectedFieldId: (id: string | null) => void;
  setActiveMode: (mode: "edit" | "preview") => void;
}

export type FormBuilderStore = FormBuilderState & FormBuilderActions;

export const useFormBuilderStore = create<FormBuilderStore>()(
  persist(
    (set) => ({
      schema: INITIAL_SCHEMA,
      selectedFieldId: null,
      activeMode: "edit" as const,

      addField: (type) => {
        const newField = buildDefaultField(type);
        set((state) => ({
          schema: {
            ...state.schema,
            fields: [...state.schema.fields, newField],
          },
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
            selectedFieldId: newField.id,
          };
        });
      },

      removeField: (id) =>
        set((state) => ({
          schema: {
            ...state.schema,
            fields: state.schema.fields.filter((f) => f.id !== id),
          },
          selectedFieldId:
            state.selectedFieldId === id ? null : state.selectedFieldId,
        })),

      updateField: (id, updates) =>
        set((state) => ({
          schema: {
            ...state.schema,
            fields: state.schema.fields.map((f) =>
              f.id === id ? { ...f, ...updates } : f,
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
          return { schema: { ...state.schema, fields } };
        }),

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
        })),

      setSelectedFieldId: (id) => set({ selectedFieldId: id }),
      setActiveMode: (mode) => set({ activeMode: mode }),
    }),
    {
      name: "form-builder-state",
      partialize: (state) => ({ schema: state.schema }),
    },
  ),
);
