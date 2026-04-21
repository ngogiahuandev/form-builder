# Next.js + TypeScript Agent Coding Rules

## Core Principles

- **Type safety above all.** Never use `any`. Prefer `unknown` + narrowing when the type is truly uncertain.
- **Separation of concerns.** UI components render; hooks handle logic; utilities are pure functions.
- **Colocation.** Keep files close to where they're used. Don't create premature abstractions or god-folders.
- **Minimal surface area.** Export only what's needed. Default to non-exported helpers.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router (routes, layouts, pages)
│   ├── (auth)/             # Route groups for layout scoping
│   ├── api/                # Route handlers
│   └── globals.css
├── components/
│   ├── ui/                 # Primitives: Button, Input, Dialog, Card (dumb, stateless)
│   └── [feature]/          # Feature-specific composed components
├── hooks/                  # Shared custom hooks
├── lib/                    # Pure utilities, constants, configs
│   ├── utils.ts
│   ├── constants.ts
│   └── validators.ts
├── services/               # API client functions, external service wrappers
├── stores/                 # Zustand / state stores
└── types/                  # Shared type definitions (no runtime code)
    └── index.ts
```

### Rules

- **One component per file.** File name = component name in PascalCase.
- **Colocate hooks with features** when only used by one feature. Promote to `hooks/` when shared across 2+ features.
- **No barrel files** (`index.ts` that re-export everything). They break tree-shaking and slow builds. Exception: `types/index.ts` is fine.

---

## TypeScript Rules

### Strict Configuration

```jsonc
// tsconfig.json — these must be ON
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": false, // too noisy for most projects
    "forceConsistentCasingInFileNames": true,
  },
}
```

### Type Definitions

```typescript
// ✅ Use `interface` for object shapes that may be extended
interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

// ✅ Use `type` for unions, intersections, mapped types, and primitives
type AuthStatus = "authenticated" | "unauthenticated" | "loading";
type UserWithPosts = User & { posts: Post[] };

// ✅ Use `satisfies` for type-safe object literals with inferred specific types
const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  settings: "/settings",
} as const satisfies Record<string, string>;

// ❌ NEVER
const data: any = fetchSomething();
const items = response.data as ItemType[]; // blind assertion
```

### Generics

```typescript
// ✅ Constrain generics. Name them descriptively when non-obvious.
function getProperty<TObj, TKey extends keyof TObj>(obj: TObj, key: TKey): TObj[TKey] {
  return obj[key];
}

// ✅ Use generics in hooks for reusable logic
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] { ... }

// ❌ Don't over-generic. If there's only one concrete type, just use it.
```

### Discriminated Unions for State

```typescript
// ✅ Model async states explicitly — never use booleans
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

// ✅ Use in components with exhaustive narrowing
function renderState(state: AsyncState<User>) {
  switch (state.status) {
    case "idle":
      return null;
    case "loading":
      return <Spinner />;
    case "success":
      return <UserCard user={state.data} />;
    case "error":
      return <ErrorMessage error={state.error} />;
  }
  // No default — TypeScript will error if a case is missing
}
```

### Zod for Runtime Validation

```typescript
// ✅ Derive TypeScript types from Zod schemas — single source of truth
import { z } from "zod";

const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
});

type User = z.infer<typeof userSchema>;

// ✅ Validate at trust boundaries: API routes, form submissions, external data
export async function POST(req: Request) {
  const body = await req.json();
  const result = userSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }
  // result.data is fully typed
}
```

---

## Component Architecture

### Split: UI vs. Logic

```
components/
  vault/
    VaultList.tsx           # Pure UI — receives props, renders JSX
    VaultListContainer.tsx  # Wires hook to UI (optional, for complex cases)
    VaultCard.tsx           # Presentational sub-component
hooks/
  useVaults.ts              # Data fetching, mutations, state logic
```

### Component Rules

```typescript
// ✅ Props interface named <Component>Props. Destructure in signature.
interface VaultCardProps {
  vault: Vault;
  onDelete: (id: string) => void;
  className?: string;
}

export function VaultCard({ vault, onDelete, className }: VaultCardProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <h3 className="font-medium">{vault.name}</h3>
      <button onClick={() => onDelete(vault.id)}>Delete</button>
    </div>
  );
}

// ✅ Default export ONLY for pages/layouts (Next.js convention).
//    Named exports for everything else.

// ❌ Don't do this
export default function VaultCard() { ... } // in a non-page file
const VaultCard: React.FC<Props> = (props) => { ... } // don't use React.FC
```

### Server vs Client Components

```typescript
// ✅ Default to Server Components. Add "use client" only when you need:
//    - useState, useEffect, useRef, or other hooks
//    - Event handlers (onClick, onChange, onSubmit)
//    - Browser APIs (window, document, localStorage)
//    - Third-party client-only libraries

// ✅ Push "use client" to the leaves. Keep data fetching in server components.
// app/dashboard/page.tsx (SERVER — no directive)
export default async function DashboardPage() {
  const data = await fetchDashboardData(); // runs on server
  return <DashboardClient initialData={data} />;
}

// components/dashboard/DashboardClient.tsx
"use client";
export function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const [filter, setFilter] = useState("all");
  // interactive logic here
}

// ❌ Don't slap "use client" on the page just because one button needs onClick.
```

---

## Custom Hooks

### Rules

1. **One concern per hook.** `useVaultEncryption` not `useVaultEverything`.
2. **Return objects, not arrays** (unless it's a simple `[value, setter]` pair).
3. **Handle all states.** Every hook returning async data must expose loading, error, and data states.
4. **No side effects in render.** All side effects in `useEffect` or event handlers.

```typescript
// ✅ Clean hook pattern
interface UseVaultsReturn {
  vaults: Vault[];
  isLoading: boolean;
  error: Error | null;
  createVault: (name: string) => Promise<void>;
  deleteVault: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useVaults(): UseVaultsReturn {
  const [state, setState] = useState<AsyncState<Vault[]>>({ status: "idle" });

  const fetchVaults = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await vaultService.getAll();
      setState({ status: "success", data });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, []);

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  return {
    vaults: state.status === "success" ? state.data : [],
    isLoading: state.status === "loading",
    error: state.status === "error" ? state.error : null,
    createVault: async (name) => {
      /* ... */ await fetchVaults();
    },
    deleteVault: async (id) => {
      /* ... */ await fetchVaults();
    },
    refetch: fetchVaults,
  };
}
```

---

## API & Data Layer

### Server Actions (preferred for mutations)

```typescript
// app/actions/vault.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createVault(formData: FormData) {
  const name = formData.get("name");
  const parsed = createVaultSchema.safeParse({ name });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await db.vault.create({ data: parsed.data });
  revalidatePath("/vaults");
}
```

### Route Handlers (for external APIs, webhooks)

```typescript
// app/api/vaults/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("q") ?? "";

  const vaults = await vaultService.search(query);
  return NextResponse.json(vaults);
}

// ✅ Always validate input. Always type the response.
// ✅ Use NextRequest/NextResponse, not the raw Web API types.
```

### Service Layer

```typescript
// services/vault.service.ts
// Pure functions that call APIs. No React, no hooks, no state.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const vaultService = {
  async getAll(): Promise<Vault[]> {
    const res = await fetch(`${BASE_URL}/vaults`);
    if (!res.ok) throw new ApiError("Failed to fetch vaults", res.status);
    return vaultListSchema.parse(await res.json());
  },

  async getById(id: string): Promise<Vault> {
    const res = await fetch(`${BASE_URL}/vaults/${encodeURIComponent(id)}`);
    if (!res.ok) throw new ApiError("Vault not found", res.status);
    return vaultSchema.parse(await res.json());
  },
} as const;
```

---

## Error Handling

```typescript
// ✅ Custom error classes with context
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ✅ Use error boundaries at route segment level
// app/dashboard/error.tsx
"use client";
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// ✅ Try/catch in server components — don't let errors crash the page
// ❌ Never swallow errors silently: catch (e) { /* nothing */ }
```

---

## Styling (Tailwind CSS)

```typescript
// ✅ Use `cn()` utility for conditional classes (clsx + tailwind-merge)
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ Use in components
<div className={cn(
  "rounded-lg border p-4 transition-colors",
  isActive && "border-primary bg-primary/5",
  className, // allow parent overrides
)} />

// ❌ No inline style objects unless dynamic values (e.g., style={{ width: `${percent}%` }})
// ❌ No CSS modules or styled-components alongside Tailwind
```

---

## State Management

### Decision Tree

1. **URL state** → `useSearchParams`, route params. Best for filters, pagination, tabs.
2. **Server state** → React Server Components or SWR/TanStack Query.
3. **Local UI state** → `useState`. Dialogs open/closed, form inputs.
4. **Shared client state** → Zustand. Minimal, typed stores.

```typescript
// ✅ Zustand store — small, typed, single-purpose
import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

// ❌ Don't put server/fetched data in Zustand. That's what SWR/RSC is for.
// ❌ Don't create one giant store. Split by domain.
```

---

## Naming Conventions

| Thing             | Convention          | Example                        |
| ----------------- | ------------------- | ------------------------------ |
| Components        | PascalCase          | `VaultCard.tsx`                |
| Hooks             | camelCase, `use`    | `useVaults.ts`                 |
| Utilities         | camelCase           | `formatDate.ts`                |
| Types/Interfaces  | PascalCase          | `VaultEntry`                   |
| Constants         | SCREAMING_SNAKE     | `MAX_RETRY_COUNT`              |
| Route files       | kebab-case dirs     | `app/vault-settings/page.tsx`  |
| Env vars          | NEXT*PUBLIC* prefix | `NEXT_PUBLIC_API_URL`          |
| Boolean props     | `is/has/should`     | `isLoading`, `hasError`        |
| Event handlers    | `on` + Verb         | `onSubmit`, `onDelete`         |
| Handler functions | `handle` + Verb     | `handleSubmit`, `handleDelete` |

---

## Do / Don't Quick Reference

### Always Do

- Validate external data with Zod at trust boundaries
- Use discriminated unions instead of boolean flags for state
- Use `as const` for literal objects and `satisfies` for type-safe config
- Return early to avoid deep nesting
- Use `Promise.all` / `Promise.allSettled` for concurrent independent async ops
- Use absolute imports (`@/components/...`) via tsconfig paths
- Add `loading.tsx` and `error.tsx` to every route segment
- Use `Suspense` boundaries around async server components

### Never Do

- Use `any` — use `unknown` and narrow
- Use `as` type assertions — use type guards or Zod parsing
- Use `// @ts-ignore` or `// @ts-expect-error` without a ticket/issue link
- Use `useEffect` for data fetching (use server components, SWR, or TanStack Query)
- Use `useEffect` to sync derived state — compute it during render instead
- Mutate state directly — always return new references
- Use string concatenation for URLs — use `URL` or template literals with `encodeURIComponent`
- Put secrets in `NEXT_PUBLIC_` env vars
- Use `index.tsx` as a component filename — name it after what it is
