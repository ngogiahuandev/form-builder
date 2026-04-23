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
  | "heading"
  | "description"
  | "code";

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
  /** Maximum number of lines (newline-separated). Used by the `code` field. */
  maxLines?: number;
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
  /**
   * Horizontal alignment for display-only blocks (heading, description).
   * Defaults to "left".
   */
  textAlign?: "left" | "center" | "right";
  /** Default country code for phone fields (e.g. "US", "VN", "GB"). */
  defaultCountry?: string;
  /** Allowed domains for URL fields. Empty/undefined means any domain is accepted. */
  allowedDomains?: string[];
  /**
   * Language key (from CODE_LANGUAGES in `src/lib/code-languages.ts`) used
   * by the `code` field for syntax highlighting.
   */
  codeLanguage?: string;
}

export interface FormSettings {
  submitLabel: string;
  successMessage: string;
  submitAlignment: "left" | "center" | "right";
  /**
   * Key from FORM_FONTS (see `src/lib/form-fonts.ts`) controlling the font
   * applied to the entire form (edit canvas + preview).
   */
  fontFamily: string;
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
