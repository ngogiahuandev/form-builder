export type FieldType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "number"
  | "date";

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
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
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
}
