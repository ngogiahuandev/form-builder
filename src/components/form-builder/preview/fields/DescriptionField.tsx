"use client";

import { cn } from "@/lib/utils";
import type { FormField } from "@/types";

interface DescriptionFieldProps {
  field: FormField;
}

const TEXT_ALIGN_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

export function DescriptionField({ field }: DescriptionFieldProps) {
  const align = field.textAlign ?? "left";

  if (!field.label) return null;

  return (
    <div className="px-3 py-2">
      <p
        className={cn(
          "text-muted-foreground text-sm leading-relaxed",
          TEXT_ALIGN_CLASSES[align],
        )}
      >
        {field.label}
      </p>
    </div>
  );
}
