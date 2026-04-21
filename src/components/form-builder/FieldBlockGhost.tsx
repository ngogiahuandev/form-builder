"use client";

import type { FormField } from "@/types";
import { FieldTypeIcon } from "@/components/form-builder/FieldTypeIcon";
import { FieldEditPreview } from "@/components/form-builder/FieldEditPreview";

interface FieldBlockGhostProps {
  field: FormField;
}

export function FieldBlockGhost({ field }: FieldBlockGhostProps) {
  return (
    <div className="bg-background rounded-md px-3 py-2 opacity-50">
      <div className="flex items-center gap-1.5">
        <FieldTypeIcon
          type={field.type}
          className="text-muted-foreground/50 shrink-0"
        />
        <span className="text-sm font-medium">{field.label || "Question"}</span>
        {field.required && (
          <span className="text-destructive shrink-0 text-sm">*</span>
        )}
      </div>
      {field.helpText && (
        <p className="text-muted-foreground mt-0.5 pl-5 text-xs">
          {field.helpText}
        </p>
      )}
      <div className="pl-5">
        <FieldEditPreview field={field} />
      </div>
    </div>
  );
}
