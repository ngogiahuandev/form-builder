export type FieldType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "number"
  | "date"
  | "select"
  | "linear_scale"
  | "divider"
  | "email"
  | "phone"
  | "url"
  | "rating"
  | "time"
  | "yes_no"
  | "heading";

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
  headingLevel?: "h1" | "h2" | "h3";
  /** Default country code for phone fields (e.g. "US", "VN", "GB"). */
  defaultCountry?: string;
  /** Allowed domains for URL fields. Empty/undefined means any domain is accepted. */
  allowedDomains?: string[];
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
