"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FIELD_TYPES } from "@/lib/field-types";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FieldType } from "@/types";
import { FieldTypeIcon } from "@/components/form-builder/FieldTypeIcon";

export function BlockPalette() {
  const addField = useFormBuilderStore((s) => s.addField);
  const [open, setOpen] = useState(false);

  const handleSelect = (type: FieldType) => {
    addField(type);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-2"
        >
          <Plus className="h-4 w-4" />
          Add field
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="flex flex-col gap-0.5">
          {FIELD_TYPES.map(({ type, label, description }) => (
            <button
              key={type}
              onClick={() => handleSelect(type)}
              className="hover:bg-accent flex items-start gap-3 rounded-md px-3 py-2 text-left transition-colors"
            >
              <FieldTypeIcon
                type={type}
                className="text-muted-foreground mt-0.5 shrink-0"
              />
              <div>
                <p className="text-sm leading-none font-medium">{label}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
