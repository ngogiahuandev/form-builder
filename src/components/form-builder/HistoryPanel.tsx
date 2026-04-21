/* eslint-disable react-hooks/purity */
"use client";

import { format } from "date-fns";
import { Clock, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormBuilderStore } from "@/stores/form-builder-store";

export function HistoryPanel() {
  const { past, future, currentLabel, schema, jumpToHistory } =
    useFormBuilderStore();

  const currentIndex = past.length;

  // Combined timeline: past entries + current + future entries
  const combined = [
    ...past,
    { schema, label: currentLabel, timestamp: Date.now() },
    ...future,
  ];

  if (combined.length <= 1 && past.length === 0 && future.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <Clock className="text-muted-foreground/40 size-8" />
        <p className="text-muted-foreground text-sm">
          No history yet. Make changes to see them here.
        </p>
      </div>
    );
  }

  // Show newest first
  const reversed = [...combined]
    .map((entry, idx) => ({ ...entry, originalIdx: idx }))
    .reverse();

  return (
    <div className="flex flex-col py-4">
      {reversed.map(({ label, timestamp, originalIdx }) => {
        const isCurrent = originalIdx === currentIndex;
        const isFuture = originalIdx > currentIndex;

        return (
          <button
            key={originalIdx}
            type="button"
            disabled={isCurrent}
            onClick={() => jumpToHistory(originalIdx)}
            className={cn(
              "group flex items-start gap-3 px-4 py-2.5 text-left text-sm transition-colors",
              isCurrent
                ? "bg-accent cursor-default"
                : "hover:bg-accent/60 cursor-pointer",
              isFuture && "opacity-50",
            )}
          >
            {/* Timeline dot */}
            <div className="mt-1 flex flex-col items-center">
              <div
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  isCurrent
                    ? "bg-primary"
                    : isFuture
                      ? "bg-muted-foreground/30"
                      : "bg-muted-foreground/50",
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate",
                  isCurrent ? "font-medium" : "text-muted-foreground",
                )}
              >
                {label}
                {isCurrent && (
                  <span className="text-primary ml-1.5 text-xs font-normal">
                    current
                  </span>
                )}
              </p>
              {timestamp > 0 && (
                <p className="text-muted-foreground/60 mt-0.5 text-xs">
                  {format(timestamp, "HH:mm:ss")}
                </p>
              )}
            </div>

            {!isCurrent && (
              <CornerDownLeft className="text-muted-foreground/0 group-hover:text-muted-foreground mt-0.5 size-3.5 shrink-0 transition-colors" />
            )}
          </button>
        );
      })}
    </div>
  );
}
