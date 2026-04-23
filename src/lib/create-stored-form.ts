import {
  DEFAULT_BORDER_RADIUS,
  DEFAULT_FORM_COLOR_KEY,
} from "@/lib/form-appearance";
import { DEFAULT_FORM_FONT_KEY } from "@/lib/form-fonts";
import type { StoredForm } from "@/types";

export function createStoredForm(title = "Untitled Form"): StoredForm {
  const id = crypto.randomUUID();
  const now = Date.now();
  return {
    id,
    schema: {
      id,
      title,
      description: "",
      fields: [],
      settings: {
        submitLabel: "Submit",
        successMessage: "Thank you for your response!",
        submitAlignment: "center",
        fontFamily: DEFAULT_FORM_FONT_KEY,
        borderRadius: DEFAULT_BORDER_RADIUS,
        primaryColor: DEFAULT_FORM_COLOR_KEY,
      },
    },
    past: [],
    future: [],
    currentLabel: "Initial state",
    createdAt: now,
    updatedAt: now,
  };
}
