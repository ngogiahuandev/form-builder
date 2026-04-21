<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Form Builder Component — Plan

A Tally-inspired, Notion-like form builder component built with shadcn/ui. Users click to add blocks, reorder them, configure each field inline, and export the result as typed JSON.

## Core Design Principles

- **Block-based**: every field is a "block" — same mental model as Notion
- **Inline editing**: click any block to edit label, placeholder, settings inline
- **No modal hell**: configuration lives in a side panel or inline, not popups
- **shadcn/ui only**: all primitives come from shadcn — no extra UI libraries
- **JSON-first**: the entire form is a serializable schema; TypeScript types are derived from it

---

## Supported Field Types

| Type | Description | Use cases |
|---|---|---|
| `short_text` | Single-line text input | Name, email, title |
| `long_text` | Multi-line textarea | Descriptions, feedback |
| `single_choice` | Radio buttons OR dropdown (user picks the variant) | One answer from a list |
| `multiple_choice` | Checkboxes | Multiple answers from a list |
| `number` | Numeric input | Age, quantity, score |
| `date` | Date picker | Birthdate, deadline |

Single choice and multiple choice share the same options schema (list of `{ id, label, value }`). The `variant` field on single choice controls whether it renders as radio buttons or a dropdown.

---

## Data Model

### Field schema (prose, no code)

Each field has:
- `id` — unique string
- `type` — one of the six types above
- `label` — the question text
- `placeholder` — optional hint inside the input
- `helpText` — optional description below the label
- `required` — boolean
- `options` — array of `{ id, label, value }` — only for single/multiple choice
- `variant` — only for single choice: `"radio"` or `"select"`
- `validation` — optional `{ min, max }` for number; no extras needed for others

The form schema wraps fields with a `title`, optional `description`, and export `settings` (submit label, success message).

JSON export is this schema verbatim. TypeScript types are generated from it at export time.

---

## Implementation Phases

### Phase 1 — Schema + Context

- [ ] Define `types.ts` with FieldType union and all interfaces
- [ ] Define `constants.ts` with default values per field type
- [ ] Build `FormBuilderContext` with `useReducer`
- [ ] Actions: `ADD_FIELD`, `REMOVE_FIELD`, `UPDATE_FIELD`, `REORDER_FIELDS`, `UPDATE_SETTINGS`

### Phase 2 — Canvas & Block Row

- [ ] `Canvas.tsx`: renders `FieldBlock` for each field in order
- [ ] `FieldBlock.tsx`: drag handle, type icon, inline label edit, delete button
- [ ] Drag-to-reorder with HTML5 DnD (no external lib)
- [ ] Selected block highlighted; click to open settings panel

### Phase 3 — Block Palette

- [ ] `BlockPalette.tsx`: shadcn `Popover` triggered by "+ Add field" button
- [ ] Shows all 6 field types with icon + name + description
- [ ] Clicking a type dispatches `ADD_FIELD` with sensible defaults and closes palette

### Phase 4 — Field Settings Panel

- [ ] `FieldSettings.tsx`: renders in a side panel when a block is selected
- [ ] Common: label, placeholder, help text, required toggle
- [ ] Single/Multiple choice: add, remove, reorder options inline
- [ ] Single choice: radio vs dropdown variant switch
- [ ] Number: min/max inputs

### Phase 5 — Preview Mode

- [ ] `FormPreview.tsx`: full rendered form, no edit controls
- [ ] Edit ↔ Preview toggle via shadcn `Tabs` in the builder header
- [ ] Each field type has a matching preview renderer under `preview/fields/`

### Phase 6 — Export

- [ ] `ExportButton.tsx`: dropdown with Copy JSON and Download JSON options
- [ ] Also generates a TypeScript `FormValues` interface from the schema
- [ ] Copy-to-clipboard uses the browser Clipboard API; download creates a `.json` file

---

## shadcn Components Used

| Purpose | shadcn component |
|---|---|
| Settings side panel | `Sheet` |
| Add field menu | `Popover` |
| Field label editing | `Input` (inline, no border) |
| Required toggle | `Switch` |
| Variant toggle (radio/select) | `RadioGroup` or `Select` |
| Options list editor | `Input` + `Button` rows |
| Export actions | `DropdownMenu` |
| Edit/Preview toggle | `Tabs` |
| Date picker | `Calendar` + `Popover` |
| Notifications | `Sonner` toast |

---

## Constraints & Notes

- No form submission logic — builder and schema only
- Drag-and-drop uses native HTML5 DnD, no external DnD library
- All state in React context + `useReducer`, no Zustand or Jotai
- Self-contained — can be dropped into any Next.js page as `<FormBuilder />`
- Tailwind v4 + shadcn conventions throughout
