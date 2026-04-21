"use client";

import type { ReactNode } from "react";
import { FieldTypeIcon } from "@/components/form-builder/FieldTypeIcon";
import type { FormField } from "@/types";

interface PreviewFieldProps {
  field: FormField;
  error?: string;
  children: ReactNode;
}

export function PreviewField({ field, error, children }: PreviewFieldProps) {
  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-1.5">
        <FieldTypeIcon
          type={field.type}
          className="text-muted-foreground/50 shrink-0"
        />
        <span className="text-sm font-medium">{field.label}</span>
        {field.required && (
          <span className="text-destructive shrink-0 text-sm">*</span>
        )}
      </div>
      {field.helpText && (
        <p className="text-muted-foreground mt-0.5 pl-0 text-xs">
          {field.helpText}
        </p>
      )}
      <div className="mt-2 pl-0">{children}</div>
      {error && <p className="text-destructive mt-1 pl-0 text-sm">{error}</p>}
    </div>
  );
}
