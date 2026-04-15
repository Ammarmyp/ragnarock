# Ragnarock - Requirements Management Platform

A modern, feature-rich requirements management platform built with Next.js 15, React 19, and TanStack Query.

## 🚀 Features

- **Modern Tech Stack** - Built with Next.js 15 (App Router), React 19, and TypeScript
- **Server State Management** - TanStack Query for efficient data fetching and caching
- **Beautiful UI** - shadcn/ui components with Tailwind CSS
- **Dark Mode** - Full theme support with next-themes
- **Type-Safe** - End-to-end TypeScript for better DX
- **Modular Sidebar** - Role-based navigation with configurable menu items
- **Feature-First Architecture** - Scalable and maintainable code organization
- **URL State Management** - nuqs for managing filters and pagination in URLs

## 📋 Tech Stack

### Core
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

### State Management
- **[TanStack Query](https://tanstack.com/query)** - Server state management
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Global client state (when needed)
- **[nuqs](https://nuqs.47ng.com/)** - URL state management

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icons

### HTTP & API
- **[Axios](https://axios-http.com/)** - HTTP client with interceptors

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ragnarock
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router (routing only)
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing page
│   └── dashboard/          # Dashboard route
│
├── layouts/                # Page compositions & features
│   ├── dashboard/          # Dashboard layout
│   ├── home/               # Home layout
│   └── auth/               # Auth layouts (future)
│
├── components/             # Reusable components
│   ├── ui/                 # Atomic UI components (shadcn)
│   └── common/             # Composite components
│       └── app-sidebar.tsx # Main navigation sidebar
│
├── hooks/                  # Custom React hooks
│   └── use-projects.ts     # React Query hooks for projects
│
├── api/                    # API layer
│   ├── client.ts           # Axios instance
│   ├── endpoints.ts        # API endpoints
│   └── projects.api.ts     # Project API functions
│
├── providers/              # Context providers
│   ├── app-provider.tsx    # Unified provider wrapper
│   └── query-provider.tsx  # React Query provider
│
├── config/                 # Configuration
│   └── sidebar.config.tsx  # Sidebar navigation
│
├── types/                  # TypeScript types
│   └── index.ts            # Global types
│
└── utils/                  # Utility functions
    ├── cn.ts               # Class name utility
    └── helpers.ts          # Common helpers
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed architecture documentation.

## 🎯 Key Concepts

### 1. Feature-First Architecture

- **Pages (`app/`)** - Minimal routing logic only
- **Layouts (`layouts/`)** - Complex composition and business logic
- **Components (`components/`)** - Reusable UI elements

### 2. Data Fetching Pattern

```tsx
// API Layer (src/api/projects.api.ts)
export async function getProjects(params) {
  const response = await apiClient.get('/projects', { params })
  return response.data.data
}

// React Query Hook (src/hooks/use-projects.ts)
export function useProjects(params) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(params),
  })
}

// Component Usage
function ProjectList() {
  const { data, isLoading } = useProjects({ page: 1, limit: 10 })
  // Use data...
}
```

### 3. Role-Based Sidebar Navigation

The sidebar automatically filters navigation items based on user role:

```tsx
// Configuration (src/config/sidebar.config.tsx)
{
  title: "Dashboard",
  href: "/dashboard",
  icon: LayoutDashboard,
  roles: ["admin", "manager", "user", "viewer"],
}

// Usage in Layout
<DashboardLayout userRole="user" user={currentUser}>
  {children}
</DashboardLayout>
```

## 🔧 Development

### Adding a New Feature

1. **Create API service** (`src/api/feature.api.ts`)
2. **Create React Query hooks** (`src/hooks/use-feature.ts`)
3. **Create layout** (`src/layouts/feature/feature-layout.tsx`)
4. **Create page** (`src/app/feature/page.tsx`)
5. **Add to sidebar** (`src/config/sidebar.config.tsx`)

### Adding UI Components

```bash
# Install shadcn/ui components
npx shadcn@latest add button
npx shadcn@latest add card
# ... etc
```

### Code Style

- **TypeScript** - Strict mode enabled
- **ESLint** - For code quality
- **Prettier** - For code formatting (configure as needed)
- **Naming Conventions** - See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 🌐 API Integration

The project uses Axios with interceptors for centralized error handling:

```typescript
// Configure base URL in .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api

// API client automatically handles:
// - Authentication tokens (when implemented)
// - Request/response logging in dev
// - Global error handling
// - Response transformation
```

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Collapsible sidebar on mobile
- Responsive grid layouts
- Touch-friendly interactions

## 🔐 Future: Authentication

When implementing authentication:

1. Create auth API service (`src/api/auth.api.ts`)
2. Create auth context/provider
3. Add to `AppProvider`
4. Update API client to include tokens
5. Add route protection middleware
6. Update sidebar to use real user data

## 📝 Scripts

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
```

## 🤝 Contributing

1. Follow the architecture guidelines in [prompts/architecture.md](./prompts/architecture.md)
2. Maintain separation of concerns
3. Use TypeScript types from `src/types/`
4. Write reusable, composable components
5. Keep pages minimal (routing only)

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [TanStack Query](https://tanstack.com/query) - Powerful data fetching
- [Next.js](https://nextjs.org/) - Amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

**Built with ❤️ using modern web technologies**