/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { filterAndRank } from "@/lib/field-search";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FieldType } from "@/types";
import { FieldTypeIcon } from "@/components/form-builder/FieldTypeIcon";

export function BlockPalette() {
  const addField = useFormBuilderStore((s) => s.addField);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  const handleSelect = (type: FieldType) => {
    addField(type);
    setOpen(false);
  };

  const results = filterAndRank(debouncedQuery);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className="text-muted-foreground hover:text-foreground gap-2"
        >
          <Plus className="h-4 w-4" />
          Add field
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search fields…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              No fields match &ldquo;{debouncedQuery}&rdquo;
            </CommandEmpty>
            <CommandGroup>
              {results.map(({ type, label, description, examples }) => (
                <HoverCard key={type} openDelay={400} closeDelay={0}>
                  <CommandItem onSelect={() => handleSelect(type)}>
                    <HoverCardTrigger asChild>
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <FieldTypeIcon
                          type={type}
                          className="text-muted-foreground shrink-0"
                        />
                        <span className="font-medium">{label}</span>
                      </div>
                    </HoverCardTrigger>
                  </CommandItem>
                  <HoverCardContent side="right" align="start" className="w-60">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <FieldTypeIcon
                          type={type}
                          className="text-foreground h-5 w-5"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-tight font-semibold">
                          {label}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs leading-snug">
                          {description}
                        </p>
                        <p className="text-muted-foreground/70 mt-2 text-xs">
                          e.g. {examples}
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
