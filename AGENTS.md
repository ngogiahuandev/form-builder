<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Form Builder Component — Plan

A Tally-inspired, Notion-like form builder built with shadcn/ui, TipTap v2, React Hook Form, Zod, and Zustand. Users click to add blocks, reorder them, configure each field inline, and export the result as typed JSON + a Zod schema. State persists to localStorage automatically.

## Tech Stack

| Layer              | Library                         | Role                                                     |
| ------------------ | ------------------------------- | -------------------------------------------------------- |
| UI primitives      | shadcn/ui + Tailwind v4         | All inputs, panels, popovers                             |
| Rich text editing  | TipTap v2                       | Form title, field labels, long text preview              |
| Builder state      | Zustand + `persist` middleware  | Form schema stored in localStorage                       |
| Preview form state | React Hook Form + `zodResolver` | Drives the preview mode form                             |
| Validation schema  | Zod                             | Generated at runtime from the form schema; also exported |

## State Architecture

Two separate state layers, cleanly separated:

**Builder state (Zustand + persist)**

- Owns the `FormSchema` — fields, title, description, settings
- Persisted to `localStorage` under key `form-builder-state`
- Actions: `addField`, `removeField`, `updateField`, `reorderFields`, `updateSettings`
- UI-only state (selected field id, edit/preview mode) lives here too but is excluded from persistence

**Preview state (React Hook Form)**

- Created fresh each time the user enters Preview mode
- Zod schema is generated dynamically from the current `FormSchema`
- `useForm({ resolver: zodResolver(generatedSchema) })`
- Thrown away when returning to Edit mode

## How TipTap Fits

- **Form title + description** — TipTap editors, plain text only, no toolbar
- **Field labels** — TipTap single-line editors; `Enter` key intercepted to prevent new paragraphs
- **Long text field in preview** — TipTap with basic formatting (bold, italic, bullet list)
- TipTap content is stored as plain strings in the Zustand store (extracted via `editor.getText()` for labels, `editor.getHTML()` for long text)

## How Zod Fits

The `generateZodSchema(fields)` function maps each field to a Zod type:

- `short_text` → `z.string().min(1)` if required, else `z.string().optional()`
- `long_text` → same as short_text
- `number` → `z.number().min(n).max(n)` (min/max from validation settings)
- `date` → `z.coerce.date()`
- `single_choice` → `z.enum([...values])` if required, else `z.enum([...]).optional()`
- `multiple_choice` → `z.array(z.enum([...values])).min(1)` if required

This schema is used by React Hook Form in preview, and also serialized as a TypeScript string for the export.

---

## Supported Field Types

| Type              | Description                                 | Use cases                    |
| ----------------- | ------------------------------------------- | ---------------------------- |
| `short_text`      | Single-line text input                      | Name, email, title           |
| `long_text`       | Multi-line rich text (TipTap)               | Descriptions, feedback       |
| `single_choice`   | Radio buttons OR dropdown (`variant` field) | One answer from a list       |
| `multiple_choice` | Checkboxes                                  | Multiple answers from a list |
| `number`          | Numeric input                               | Age, quantity, score         |
| `date`            | Date picker                                 | Birthdate, deadline          |

Single choice and multiple choice share the same options schema (`{ id, label, value }[]`). The `variant` field on single choice controls whether it renders as radio buttons or a dropdown.

---

## Data Model

Each field has:

- `id` — unique string (crypto.randomUUID)
- `type` — one of the six types above
- `label` — the question text (stored as plain string, edited via TipTap)
- `placeholder` — optional hint inside the input
- `helpText` — optional description below the label
- `required` — boolean
- `options` — array of `{ id, label, value }` — only for single/multiple choice
- `variant` — only for single choice: `"radio"` or `"select"`
- `validation` — optional `{ min, max }` for number only

The form schema wraps fields with a `title`, optional `description`, and `settings` (submit label, success message).

JSON export is this schema verbatim. The Zod schema is generated from it and exported as a TypeScript string.

---

## Implementation Phases

### Phase 1 — Types + Zustand Store

- [ ] Define `types.ts` with FieldType union and all interfaces
- [ ] Define `constants.ts` with default field values per type
- [ ] Build Zustand store with `persist` middleware (localStorage)
- [ ] Store actions: `addField`, `removeField`, `updateField`, `reorderFields`, `updateSettings`
- [ ] Separate transient UI state (selected field, active mode) from persisted schema state

### Phase 2 — Canvas & Block Row

- [ ] `Canvas.tsx`: renders `FieldBlock` for each field in order
- [ ] `FieldBlock.tsx`: drag handle, TipTap label editor, type icon, delete button
- [ ] TipTap single-line extension for field labels (intercept Enter key)
- [ ] Drag-to-reorder with HTML5 DnD (no external lib)
- [ ] Selected block highlighted; click to open settings panel

### Phase 3 — Block Palette

- [ ] `BlockPalette.tsx`: shadcn `Popover` triggered by "+ Add field" button
- [ ] Shows all 6 field types with icon + name + short description
- [ ] Clicking a type calls `addField` with sensible defaults and closes palette

### Phase 4 — Field Settings Panel

- [ ] `FieldSettings.tsx`: shadcn `Sheet` opens when a block is selected
- [ ] Common: label, placeholder, help text, required toggle
- [ ] Single/Multiple choice: add, remove, reorder options inline
- [ ] Single choice: radio vs dropdown variant switch
- [ ] Number: min/max inputs

### Phase 5 — Preview Mode

- [ ] `FormPreview.tsx`: full rendered form driven by React Hook Form + generated Zod schema
- [ ] Edit ↔ Preview toggle via shadcn `Tabs` in the builder header
- [ ] Each field type renders with the matching shadcn input + RHF `Controller`
- [ ] Validation errors shown inline using RHF `formState.errors`

### Phase 6 — Export

- [ ] `ExportButton.tsx`: shadcn `DropdownMenu` with Copy JSON and Download JSON
- [ ] Also generates and exports the Zod schema as a `.ts` string
- [ ] Copy uses browser Clipboard API; download creates a `.json` / `.ts` file

---

## shadcn Components Used

| Purpose                       | shadcn component         |
| ----------------------------- | ------------------------ |
| Settings side panel           | `Sheet`                  |
| Add field menu                | `Popover`                |
| Required toggle               | `Switch`                 |
| Variant toggle (radio/select) | `RadioGroup` or `Select` |
| Options list editor           | `Input` + `Button` rows  |
| Export actions                | `DropdownMenu`           |
| Edit/Preview toggle           | `Tabs`                   |
| Date picker                   | `Calendar` + `Popover`   |
| Notifications                 | `Sonner` toast           |

---

## Constraints & Notes

- No form submission logic — builder and schema only
- Drag-and-drop uses native HTML5 DnD, no external DnD library
- Builder state in Zustand with localStorage persistence; no useReducer/Context
- Preview state in React Hook Form only — created fresh per preview session
- Self-contained — can be dropped into any Next.js page as `<FormBuilder />`
- Tailwind v4 + shadcn conventions throughout
