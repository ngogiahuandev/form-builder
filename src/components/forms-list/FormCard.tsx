"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FORM_COLORS } from "@/lib/form-appearance";
import { getFormFont } from "@/lib/form-fonts";
import { cn } from "@/lib/utils";
import type { StoredForm } from "@/types";

interface FormCardProps {
  form: StoredForm;
  onDelete: (id: string) => Promise<void>;
}

export function FormCard({ form, onDelete }: FormCardProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fieldCount = form.schema.fields.length;
  const title = form.schema.title || "Untitled Form";
  const primaryColorKey = form.schema.settings.primaryColor ?? "default";
  const formFont = getFormFont(form.schema.settings.fontFamily);
  const color = FORM_COLORS.find((c) => c.key === primaryColorKey);
  const showColorDot = color !== undefined && color.primary !== null;

  const handleCardClick = () => {
    router.push(`/forms/${form.id}`);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(form.id);
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "group relative cursor-pointer transition-shadow hover:shadow-md",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        )}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleCardClick();
        }}
        tabIndex={0}
        role="button"
        aria-label={`Open form: ${title}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle
              className="line-clamp-2 text-base leading-snug"
              style={{ fontFamily: formFont.fontFamily }}
            >
              {title}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Form actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={() => router.push(`/forms/${form.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            {showColorDot && (
              <span
                className="inline-block size-2.5 shrink-0 rounded-full ring-1 ring-black/10 ring-inset"
                style={{ backgroundColor: color!.hex }}
                aria-hidden
              />
            )}
            <span>
              {fieldCount} {fieldCount === 1 ? "field" : "fields"}
            </span>
            <span aria-hidden>·</span>
            <span>
              {formatDistanceToNow(new Date(form.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete form?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{title}&rdquo; will be permanently deleted. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteConfirm();
              }}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
