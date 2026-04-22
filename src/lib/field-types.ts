import type { FieldType } from "@/types";

export interface FieldTypeMeta {
  type: FieldType;
  label: string;
  description: string;
  examples: string;
}

export const FIELD_TYPES: FieldTypeMeta[] = [
  {
    type: "short_text",
    label: "Short Text",
    description: "A single-line free text input.",
    examples: "Full name, Job title, City",
  },
  {
    type: "long_text",
    label: "Long Text",
    description: "A multi-line text area for longer responses.",
    examples: "Bio, Feedback, Cover letter",
  },
  {
    type: "email",
    label: "Email",
    description: "Text input that validates email format.",
    examples: "Work email, Contact address",
  },
  {
    type: "phone",
    label: "Phone",
    description: "International phone number with country code picker.",
    examples: "Mobile number, Contact phone",
  },
  {
    type: "url",
    label: "URL",
    description: "Text input that validates a web address.",
    examples: "Website, Portfolio, LinkedIn",
  },
  {
    type: "number",
    label: "Number",
    description: "Numeric input with optional min/max range.",
    examples: "Age, Quantity, Score, Budget",
  },
  {
    type: "date",
    label: "Date",
    description: "Date picker with optional min/max range.",
    examples: "Birthdate, Deadline, Event date",
  },
  {
    type: "time",
    label: "Time",
    description: "Time-of-day picker (HH:MM).",
    examples: "Meeting time, Opening hours",
  },
  {
    type: "single_choice",
    label: "Single Choice",
    description: "Radio buttons or a dropdown — pick exactly one.",
    examples: "Gender, Country, Priority level",
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    description: "Checkboxes — pick one or more options.",
    examples: "Interests, Skills, Dietary needs",
  },
  {
    type: "select",
    label: "Select",
    description: "Compact dropdown for a single selection.",
    examples: "Department, Language, Status",
  },
  {
    type: "rating",
    label: "Rating",
    description: "Clickable star rating (1 to N stars).",
    examples: "Product rating, Service quality",
  },
  {
    type: "yes_no",
    label: "Yes / No",
    description: "Simple binary toggle — yes or no.",
    examples: "Agree to terms, Subscribe, Attending",
  },
  {
    type: "linear_scale",
    label: "Linear Scale",
    description: "Numeric scale between a min and max value.",
    examples: "NPS score, Satisfaction (1–10)",
  },
  {
    type: "heading",
    label: "Heading",
    description: "Non-input text block to label a section.",
    examples: "Section title, Instructions",
  },
  {
    type: "divider",
    label: "Divider",
    description: "A horizontal line to visually separate sections.",
    examples: "Between form sections",
  },
];
