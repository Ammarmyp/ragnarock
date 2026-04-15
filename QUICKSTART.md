# Quick Start Guide

Get up and running with Ragnarock in 5 minutes!

## 🚀 Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd ragnarock

# 2. Install dependencies
pnpm install
# or
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local with your API URL
```

## ⚙️ Configuration

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🏃 Run the App

```bash
# Development mode
pnpm dev

# Production build
pnpm build
pnpm start
```

Visit [http://localhost:3000](http://localhost:3000)

## 📍 Routes

- `/` - Landing page
- `/dashboard` - Main dashboard (with sidebar navigation)

## 🎨 Adding UI Components

We use shadcn/ui for components:

```bash
# Add a new component
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add form
```

Browse components: https://ui.shadcn.com/docs/components

## 📝 Common Tasks

### Create a New Page

1. **Create the page component:**
   ```tsx
   // src/app/projects/page.tsx
   import { DashboardLayout } from "@/layouts/dashboard/dashboard-layout";
   
   export default function ProjectsPage() {
     return (
       <DashboardLayout>
         <div className="p-6">
           <h1 className="text-3xl font-bold">Projects</h1>
         </div>
       </DashboardLayout>
     );
   }
   ```

2. **Add to sidebar navigation:**
   ```tsx
   // src/config/sidebar.config.tsx
   {
     title: "Projects",
     href: "/projects",
     icon: FolderKanban,
     roles: ["admin", "manager", "user"],
   }
   ```

### Create an API Service

```typescript
// src/api/projects.api.ts
import apiClient from "./client";
import { PROJECT_ENDPOINTS } from "./endpoints";

export async function getProjects() {
  const response = await apiClient.get(PROJECT_ENDPOINTS.LIST);
  return response.data.data;
}
```

### Create a React Query Hook

```typescript
// src/hooks/use-projects.ts
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/api/projects.api";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });
}
```

### Use the Hook in a Component

```tsx
import { useProjects } from "@/hooks/use-projects";

export function ProjectList() {
  const { data, isLoading, error } = useProjects();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading projects</div>;

  return (
    <div>
      {data?.map((project) => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

## 🎯 Project Structure Quick Reference

```
src/
├── app/              → Pages (routing only)
├── layouts/          → Page compositions
├── components/       → Reusable UI
│   ├── ui/          → shadcn components
│   └── common/      → Custom components
├── hooks/           → React Query hooks
├── api/             → API services
├── providers/       → Context providers
├── config/          → App configuration
├── types/           → TypeScript types
└── utils/           → Helper functions
```

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/providers/app-provider.tsx` | All providers combined |
| `src/config/sidebar.config.tsx` | Navigation menu |
| `src/api/client.ts` | Axios configuration |
| `src/api/endpoints.ts` | API endpoint constants |
| `src/components/common/app-sidebar.tsx` | Main sidebar |
| `src/layouts/dashboard/dashboard-layout.tsx` | Dashboard wrapper |

## 🎨 Theming

Toggle dark mode with the theme switcher (already configured).

Customize colors in `src/app/globals.css`:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* ... more colors */
}
```

## 🧩 Adding New Features

Follow this pattern for any new feature:

1. **API Service** → `src/api/feature.api.ts`
2. **Types** → Add to `src/types/index.ts` or create `src/types/feature.types.ts`
3. **React Query Hook** → `src/hooks/use-feature.ts`
4. **Layout** (if needed) → `src/layouts/feature/`
5. **Page** → `src/app/feature/page.tsx`
6. **Sidebar Item** → Update `src/config/sidebar.config.tsx`

## 📚 Learn More

- [Project Architecture](./prompts/architecture.md) - Detailed architecture rules
- [Project Structure](./PROJECT_STRUCTURE.md) - Complete structure documentation
- [Next.js Docs](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com)

## 🐛 Troubleshooting

**Build errors?**
```bash
# Clean cache
rm -rf .next
pnpm install
pnpm build
```

**Type errors?**
```bash
# Check TypeScript
pnpm tsc --noEmit
```

**Lint errors?**
```bash
pnpm lint
```

## ✅ Next Steps

1. ✨ Explore the dashboard at `/dashboard`
2. 📖 Read [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
3. 🎨 Customize the theme and branding
4. 🔐 Implement authentication (when needed)
5. 🚀 Build your features!

---

**Happy coding! 🎉**