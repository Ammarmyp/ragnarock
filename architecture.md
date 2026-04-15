# Project Architecture & Coding Standards

This document defines the core principles, structural rules, and architectural boundaries for this Next.js project. **All generated code, refactoring, and feature additions must strictly adhere to these guidelines.**

## 🧠 1. Core Principles

Before writing or modifying any code, ensure it aligns with these foundational rules:

- **Separation of Concerns:** Keep UI rendering, business logic, state management, and data fetching isolated. Components should primarily handle UI representation.
- **Feature-Based Modularity:** Group code by feature or domain (e.g., `dashboard`, `tables`, `forms`) rather than just by technical file type. Localize components, hooks, and utilities to their specific feature unless they are proven to be globally reusable.
- **Single Source of Truth:**
  - **State:** Use React Query for server state; minimal Zustand for global client state and tanstack react query for server side state.
  - **Theme/Styles:** Rely on `tailwind.config.ts` and CSS variables. No hardcoded hex codes in components.
  - **API:** All network requests and endpoint definitions live exclusively in the `src/api` directory.
- **Predictable Naming Conventions:**
  - React Components/Layouts: `camelCase.tsx` (e.g., `dashboard-layout.tsx`).
  - Hooks: `camelCase` starting with `use` (e.g., `usePagination.ts`).
  - Utilities/API/Types: `camelCase` or `kebab-case` with descriptive suffixes (e.g., `formatDate.ts`, `projects.api.ts`, `user.types.ts`).
- **AI-Readable Patterns:** No "magic" imports, circular dependencies, or convoluted abstractions. Favor explicit, readable code over overly clever, implicit logic.

---

## 📁 2. Directory Structure

This project uses the Next.js App Router with a **Feature-First Architecture** combined with a shared core.

The `app/` directory is strictly for Next.js routing. All composition, complex logic, and UI structures live in `layouts/` and `components/`.

```text
src/
├── app/                         # 🚦 NEXT.JS ROUTING (Minimal logic)
│   ├── layout.tsx               # Root layout (Providers injected here)
│   ├── page.tsx                 # Root entry point
│   ├── dashboard/
│   │   └── page.tsx             # Calls <DashboardLayout />
│   └── (auth)/
│       └── login/page.tsx       # Calls <AuthLayout />
│
├── layouts/                     # 🧩 PAGE STRUCTURES & FEATURE MODULES
│   ├── dashboard/               # Domain: Dashboard
│   │   ├── DashboardLayout.tsx  # Main composition component
│   │   ├── sidebar/             # Domain-specific components
│   │   ├── header/
│   │   └── widgets/
│   ├── forms/                   # Domain: Form flows
│   │   ├── FormLayout.tsx
│   │   ├── fields/
│   │   └── sections/
│   ├── tables/                  # Domain: Data grids
│   │   ├── TableLayout.tsx
│   │   ├── components/
│   │   └── hooks/               # Hooks specific to this domain
│   ├── home/
│   │   └── HomeLayout.tsx
│   └── auth/
│       └── AuthLayout.tsx
│
├── components/                  # 🔁 GLOBAL REUSABLE COMPONENTS
│   ├── ui/                      # Design system (Atomic, pure, dump components)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── index.ts
│   └── common/                  # Composite reusable components
│       ├── DataTable/
│       ├── Form/
│       ├── EmptyState.tsx
│       └── Loader.tsx
│
├── hooks/                       # 🔁 GLOBAL HOOKS
│   ├── useDebounce.ts
│   ├── useToggle.ts
│   └── usePagination.ts
│
├── api/                         # 🌐 CENTRALIZED API LAYER
│   ├── client.ts                # Axios instance configuration
│   ├── endpoints.ts             # Dictionary of API routes
│   ├── requirements.api.ts      # Domain-specific API calls
│   ├── projects.api.ts
│   └── auth.api.ts
│
├── lib/                         # ⚙️ CORE LIBRARIES & ADAPTERS             
│   └── logger.ts
│
├── utils/                       # 🛠 GLOBAL HELPERS (Pure functions)
│   ├── cn.ts                    # Tailwind class merger (clsx + twMerge)
│   ├── formatDate.ts
│   └── helpers.ts
│
├── types/                       # 📦 GLOBAL TYPES & INTERFACES ( any type defination should be inhere )
│   ├── api.types.ts
│   ├── user.types.ts
│   └── index.ts
│
├── providers/                   # 🌍 GLOBAL CONTEXT PROVIDERS
│   ├── query-provider.tsx
│   ├── theme-provider.tsx
│   └── index.tsx                # Master Provider composing all others
│

```

---

## 🛠 3. Execution Rules for AI

When generating code for this repository, you must adhere to these boundaries:

1. **Routing vs. Composition (`app/` vs `layouts/`):**
  - Do **not** place complex logic, excessive DOM elements, or heavy state inside `src/app/.../page.tsx`.
    - Pages in `app/` should act only as wrappers that handle Server-Side parameters/search params, metadata, and import their respective layout/composition component from `src/layouts/`.
2. **Global UI vs. Feature UI (`components/` vs `layouts/...`):**
  - If a component is highly specific to a single page or domain (e.g., `RevenueChart`), put it inside the relevant folder within `src/layouts/`.
    - If a component is universally reusable (e.g., `Button`, `Dialog`), it belongs in `src/components/ui/` or `src/components/common/`.
3. **Data Fetching:**
  - All external API calls must be defined as functions inside `src/api/`. Do not write `fetch` or `axios` calls directly inside components.
    - Use React Query  to consume these API functions within feature hooks ( useRequirements.ts for react query related things imported the services in src/api).

