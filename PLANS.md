# Form Builder — Plans & Roadmap

## Currently Implemented (v1)

### Field Types (9)

| Type              | Description                        |
| ----------------- | ---------------------------------- |
| `short_text`      | Single-line text input             |
| `long_text`       | Multi-line rich textarea           |
| `single_choice`   | Radio buttons or dropdown          |
| `multiple_choice` | Checkboxes                         |
| `number`          | Numeric input with min/max         |
| `date`            | Date picker with range constraints |
| `select`          | Dropdown select                    |
| `linear_scale`    | Slider/scale (e.g. 1–10)           |
| `divider`         | Visual horizontal separator        |

### Form Settings

- Submit button label, alignment (left/center/right)
- Success message toast on submit
- Form title + description (TipTap editors)
- Undo/redo history (50 entries)
- JSON + TypeScript export

---

## Phase 2 — New Field Types

### Fields to Add

| Type      | Description                           | Library                           |
| --------- | ------------------------------------- | --------------------------------- |
| `email`   | Email input with format validation    | Native HTML + Zod `.email()`      |
| `phone`   | Phone input with country selector     | `react-phone-number-input`        |
| `url`     | URL input with format validation      | Native HTML + Zod `.url()`        |
| `rating`  | Star rating (1–5) using lucide `Star` | lucide-react `Star` icon          |
| `time`    | Time-only picker (HH:MM)              | Native HTML `<input type="time">` |
| `yes_no`  | Binary Yes/No toggle buttons          | shadcn/ui `Button`                |
| `heading` | Decorative heading block (h1/h2/h3)   | HTML heading elements             |

### Implementation Checklist

- [x] `src/types/index.ts` — add 7 new types to `FieldType` union, add `headingLevel` to `FormField`
- [x] `src/lib/field-types.ts` — add `FieldTypeMeta` entries for each new type
- [x] `src/components/form-builder/FieldTypeIcon.tsx` — map new types to lucide icons
- [x] `src/lib/generate-zod-schema.ts` — add Zod cases for each new type
- [x] `src/lib/generate-ts-types.ts` — add TypeScript type strings for each new type
- [x] `src/stores/form-builder-store.ts` — add `DEFAULT_LABELS` entries
- [x] Create `EmailField.tsx` preview component
- [x] Create `PhoneField.tsx` preview component (react-phone-number-input)
- [x] Create `UrlField.tsx` preview component
- [x] Create `RatingField.tsx` preview component (lucide Star icons)
- [x] Create `TimeField.tsx` preview component
- [x] Create `YesNoField.tsx` preview component
- [x] Create `HeadingField.tsx` preview component (non-input, no RHF)
- [x] `FormPreview.tsx` — add render cases for all new types
- [x] `FieldEditPreview.tsx` — add editor-canvas previews for all new types
- [x] `FieldSettings.tsx` — add settings panels for each new type

### Zod Schema Mapping

| Type      | Zod Shape                                         |
| --------- | ------------------------------------------------- | ----------------------------------- |
| `email`   | `z.string().email()` / `.optional()`              |
| `phone`   | `z.string().min(1)` / `.optional()`               |
| `url`     | `z.string().url()` / `.optional()`                |
| `rating`  | `z.coerce.number().min(1).max(5)` / `.optional()` |
| `time`    | `z.string().regex(/^([01]\d                       | 2[0-3]):([0-5]\d)$/)`/`.optional()` |
| `yes_no`  | `z.enum(["yes", "no"])` / `.optional()`           |
| `heading` | excluded (non-input, like `divider`)              |

---

## Phase 3 — Block Palette Search

### Feature: Debounced Search in "Add field" Popover

- Search input at the top of the `BlockPalette` popover
- Debounce: 300 ms after the user stops typing
- Empty query shows all field types in original order
- Non-empty query filters and ranks by score

### Search Algorithm (score-based)

```
score(fieldMeta, query):
  q = query.toLowerCase()
  label = meta.label.toLowerCase()
  desc  = meta.description.toLowerCase()

  if label === q         → 100  (exact match)
  if label.startsWith(q) → 80   (prefix match in label)
  if label.includes(q)   → 60   (substring in label)
  if desc.startsWith(q)  → 40   (prefix match in description)
  if desc.includes(q)    → 20   (substring in description)
  if isSubsequence(q, label) → 10  (fuzzy: all chars in order)
  if isSubsequence(q, desc)  →  5  (fuzzy in description)
  else                   →  0  (no match, hidden)
```

`isSubsequence` checks that every character of the query appears in the target string in order — handles common typos like "srt" → "short text".

Results with score > 0 are shown, sorted descending by score.

---

## Phase 4 — Branding & Appearance (Planned)

| Feature            | Description                                      |
| ------------------ | ------------------------------------------------ |
| Cover image        | Full-width banner at the top of the form         |
| Logo               | Brand logo in the form header                    |
| Theme color        | Primary accent color (buttons, focus rings)      |
| Background         | Solid color or gradient background               |
| Font family        | Curated picker (Inter, Lato, Merriweather, etc.) |
| Button style       | Rounded / Pill / Square variants                 |
| Field border style | Outlined / Underline / Filled                    |

---

## Phase 5 — Form Behavior (Planned)

| Feature            | Description                                       |
| ------------------ | ------------------------------------------------- |
| Progress bar       | Show completion % at the top of the form          |
| Multi-page/steps   | Group fields into pages with Next/Back navigation |
| Conditional logic  | Show/hide fields based on previous answers        |
| Question numbering | Auto-number fields (Q1, Q2, …)                    |
| Close date         | Stop accepting responses after a date             |
| Response limit     | Max number of submissions allowed                 |
| Redirect on submit | Go to a URL instead of showing success message    |
