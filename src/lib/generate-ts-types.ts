import type { FormField } from "@/types";

function fieldTypeString(field: FormField): string {
  switch (field.type) {
    case "short_text":
    case "long_text":
      return "string";
    case "number":
      return "number";
    case "date":
      return "Date";
    case "single_choice":
    case "select": {
      const values = (field.options ?? [])
        .map((o) => `'${o.value}'`)
        .join(" | ");
      return values || "string";
    }
    case "multiple_choice": {
      const values = (field.options ?? [])
        .map((o) => `'${o.value}'`)
        .join(" | ");
      return values ? `Array<${values}>` : "string[]";
    }
    case "linear_scale":
      return "number";
    case "divider":
      return "";
  }
}

export function generateTsTypes(fields: FormField[]): string {
  const dataFields = fields.filter((f) => f.type !== "divider");
  if (dataFields.length === 0) return "export interface FormValues {}";

  const lines = dataFields.map((field) => {
    const type = fieldTypeString(field);
    const optional = field.required ? "" : "?";
    const comment = field.label ? ` // ${field.label}` : "";
    return `  ${field.id}${optional}: ${type}${comment}`;
  });

  return `export interface FormValues {\n${lines.join("\n")}\n}`;
}
