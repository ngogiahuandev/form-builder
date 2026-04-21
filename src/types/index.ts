export type FieldType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "number"
  | "date"
  | "select"
  | "linear_scale"
  | "divider";

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minDate?: string;
  maxDate?: string;
  scaleFrom?: number;
  scaleTo?: number;
  scaleJump?: number;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: FormFieldOption[];
  variant?: "radio" | "select";
  validation?: FormFieldValidation;
  defaultValue?: string;
  defaultValues?: string[];
}

export interface FormSettings {
  submitLabel: string;
  successMessage: string;
  submitAlignment: "left" | "center" | "right";
}

export interface HistoryEntry {
  schema: FormSchema;
  label: string;
  timestamp: number;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
}
