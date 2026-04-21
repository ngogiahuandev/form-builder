import type { FieldType } from "@/types";

export interface FieldTypeMeta {
  type: FieldType;
  label: string;
  description: string;
}

export const FIELD_TYPES: FieldTypeMeta[] = [
  {
    type: "short_text",
    label: "Short Text",
    description: "Name, email, title",
  },
  {
    type: "long_text",
    label: "Long Text",
    description: "Descriptions, feedback",
  },
  {
    type: "single_choice",
    label: "Single Choice",
    description: "One answer from a list",
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    description: "Multiple answers",
  },
  { type: "number", label: "Number", description: "Age, quantity, score" },
  { type: "date", label: "Date", description: "Birthdate, deadline" },
];
