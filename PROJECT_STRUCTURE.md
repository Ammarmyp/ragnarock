# Project Structure Documentation

This document explains the architecture, directory structure, and development patterns for the Ragnarock application.

## 🏗️ Architecture Overview

Ragnarock follows a **Feature-First Architecture** with Next.js App Router. The core principle is separation of concerns:

- **`app/`** - Routing only (minimal logic)
- **`layouts/`** - Page composition and feature modules
- **`components/`** - Reusable UI components
- **`api/`** - Centralized API layer
- **`hooks/`** - Custom React hooks
- **`providers/`** - Context providers
- **`types/`** - TypeScript type definitions

## 📁 Directory Structure

```
src/
├── app/                         # Next.js App Router (Routing Layer)
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home/landing page
│   └── dashboard/
│       └── page.tsx             # Dashboard route (uses DashboardLayout)
│
├── layouts/                     # Page Compositions & Feature Modules
│   ├── dashboard/
│   │   └── dashboard-layout.tsx # Main dashboard structure
│   ├── home/
│   │   └── home-layout.tsx      # Landing page layout
│   └── auth/                    # Auth-related layouts (future)
│
├── components/                  # Reusable Components
│   ├── ui/                      # Atomic UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── sidebar.tsx
│   │   └── ...
│   └── common/                  # Composite components
│       └── app-sidebar.tsx      # Main navigation sidebar
│
├── hooks/                       # Custom React Hooks
│   └── use-projects.ts          # React Query hooks for projects
│
├── api/                         # API Layer
│   ├── client.ts                # Axios instance & interceptors
│   ├── endpoints.ts             # API endpoint constants
│   └── projects.api.ts          # Project API functions
│
├── providers/                   # Context Providers
│   ├── app-provider.tsx         # Unified provider wrapper
│   ├── query-provider.tsx       # React Query provider
│   └── index.tsx                # Provider exports
│
├── config/                      # Configuration Files
│   └── sidebar.config.tsx       # Sidebar navigation config
│
├── types/                       # TypeScript Types
│   └── index.ts                 # Global type definitions
│
├── utils/                       # Utility Functions
│   ├── cn.ts                    # Class name utility
│   └── helpers.ts               # Common helpers
│
└── lib/                         # Core Libraries
    └── providers/
        └── themes-provider.tsx  # Theme provider
```

## 🎯 Key Concepts

### 1. Routing vs Composition

**Pages in `app/` are thin wrappers:**

```tsx
// ❌ DON'T: Complex logic in app/page.tsx
export default function Page() {
  const [state, setState] = useState()
  // ... lots of logic
  return <div>...</div>
}

// ✅ DO: Import layout from layouts/
export default function Page() {
  return <DashboardLayout />
}
```

**Composition happens in `layouts/`:**

```tsx
// src/layouts/dashboard/dashboard-layout.tsx
export function DashboardLayout({ children }) {
  // Complex logic, state, effects here
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>{children}</main>
    </SidebarProvider>
  )
}
```

### 2. Data Fetching Pattern

**API Layer** (`src/api/`) - Pure API functions:

```tsx
// src/api/projects.api.ts
export async function getProjects(params) {
  const response = await apiClient.get('/projects', { params })
  return response.data.data
}
```

**React Query Hooks** (`src/hooks/`) - Consume API functions:

```tsx
// src/hooks/use-projects.ts
export function useProjects(params) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(params),
  })
}
```

**Components** - Use hooks, not API directly:

```tsx
// In your component
function ProjectList() {
  const { data, isLoading } = useProjects({ page: 1, limit: 10 })
  // Use data...
}
```

### 3. State Management

- **Server State** → React Query (via hooks in `src/hooks/`)
- **Global Client State** → Zustand (when needed)
- **Local Component State** → useState/useReducer
- **URL State** → nuqs (for filters, pagination, etc.)

### 4. Component Hierarchy

```
UI Components (src/components/ui/)
    ↓ Used by
Common Components (src/components/common/)
    ↓ Used by
Layouts (src/layouts/)
    ↓ Used by
Pages (src/app/)
```

## 🔧 Provider Setup

All providers are composed in `AppProvider`:

```tsx
// src/providers/app-provider.tsx
export function AppProvider({ children }) {
  return (
    <QueryProvider>              {/* React Query */}
      <ThemesProvider>           {/* Dark mode */}
        <NuqsAdapter>            {/* URL state */}
          <TooltipProvider>      {/* Radix tooltips */}
            {children}
            <Toaster />          {/* Toast notifications */}
          </TooltipProvider>
        </NuqsAdapter>
      </ThemesProvider>
    </QueryProvider>
  )
}
```

Used once in root layout:

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
```

## 🧭 Sidebar Navigation

The sidebar uses a role-based configuration system:

**Configuration** (`src/config/sidebar.config.tsx`):

```tsx
export const sidebarConfig = {
  navGroups: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          roles: ["admin", "manager", "user", "viewer"],
        },
      ],
    },
  ],
}
```

**Component** (`src/components/common/app-sidebar.tsx`):

```tsx
export function AppSidebar({ userRole, user }) {
  const config = getFilteredSidebarConfig(userRole)
  // Renders filtered navigation based on role
}
```

**Usage in Layout**:

```tsx
<DashboardLayout userRole="user" user={currentUser}>
  {children}
</DashboardLayout>
```

## 📝 Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| React Components | `camelCase.tsx` | `dashboard-layout.tsx` |
| Hooks | `camelCase.ts` starting with `use` | `use-projects.ts` |
| API Services | `domain.api.ts` | `projects.api.ts` |
| Types | `domain.types.ts` | `project.types.ts` |
| Utilities | `camelCase.ts` or `kebab-case.ts` | `helpers.ts`, `format-date.ts` |
| Config | `name.config.ts` | `sidebar.config.tsx` |

## 🎨 Styling

- **Utility-first** with Tailwind CSS
- **Theme variables** in CSS custom properties
- **No hardcoded colors** - use theme tokens
- **Class composition** with `cn()` utility

```tsx
import { cn } from "@/utils/cn"

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className
)} />
```

## 🚀 Creating New Features

### Example: Adding a "Teams" feature

1. **Create API service** (`src/api/teams.api.ts`):
```tsx
export async function getTeams() { ... }
export async function createTeam(data) { ... }
```

2. **Create React Query hooks** (`src/hooks/use-teams.ts`):
```tsx
export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })
}
```

3. **Create layout** (`src/layouts/teams/teams-layout.tsx`):
```tsx
export function TeamsLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
```

4. **Create page** (`src/app/teams/page.tsx`):
```tsx
export default function TeamsPage() {
  const { data } = useTeams()
  return <TeamsLayout>...</TeamsLayout>
}
```

5. **Add to sidebar** (`src/config/sidebar.config.tsx`):
```tsx
{
  title: "Teams",
  href: "/teams",
  icon: Users,
  roles: ["admin", "manager"],
}
```

## 🔐 Future: Authentication Integration

When implementing auth:

1. Create auth context/provider
2. Add to `AppProvider`
3. Use `userRole` and `user` from context in `AppSidebar`
4. Add route protection middleware
5. Update API client to include auth tokens

## 📚 Best Practices

### ✅ DO

- Keep pages in `app/` minimal (routing only)
- Put complex logic in `layouts/`
- Use React Query for server state
- Define all API calls in `src/api/`
- Use TypeScript types from `src/types/`
- Filter sidebar nav by user role

### ❌ DON'T

- Write API calls directly in components
- Hardcode API endpoints (use `src/api/endpoints.ts`)
- Put business logic in UI components
- Hardcode colors (use theme variables)
- Create circular dependencies

## 🛠️ Development Workflow

1. **Start dev server**: `pnpm dev`
2. **View app**: http://localhost:3000
3. **React Query Devtools**: Available in development mode
4. **Check types**: TypeScript checks happen automatically

## 📦 Key Dependencies

- **Next.js 15** - React framework
- **React 19** - UI library
- **TanStack Query** - Server state management
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Axios** - HTTP client
- **Zustand** - Client state (when needed)
- **nuqs** - URL state management
- **next-themes** - Dark mode support

## 🎓 Learning Resources

- [Architecture Document](./prompts/architecture.md) - Detailed architecture rules
- [Sidebar Patterns](./prompts/sidebar.prompt.md) - Sidebar implementation guide
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [TanStack Query](https://tanstack.com/query/latest) - Data fetching
- [shadcn/ui](https://ui.shadcn.com) - Component library

---

**Last Updated**: 2024
**Maintainer**: Development Team