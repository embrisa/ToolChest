# ToolChest Next.js Project Structure

## Overview
This document outlines the folder structure and naming conventions for the ToolChest Next.js application.

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── api/               # API routes
│   ├── tools/             # Tool-specific pages
│   ├── admin/             # Admin area pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Base UI components (Button, Input, etc.)
│   ├── forms/             # Form-specific components
│   ├── layout/            # Layout components (Header, Footer, etc.)
│   ├── tools/             # Tool-specific components
│   └── index.ts           # Barrel exports
├── hooks/                 # Custom React hooks
│   ├── useTools.ts        # Global tools data fetching hook
│   ├── useToolsWithState.ts # Enhanced tools hook with state management
│   ├── useUrlState.ts     # URL state synchronization hook
│   ├── tools/             # Tool-specific hooks
│   ├── admin/             # Admin-specific hooks
│   ├── core/              # Core/shared hooks
│   └── index.ts           # Barrel exports
├── lib/                   # Core utilities and configurations
│   ├── prisma.ts          # Prisma client configuration
│   └── env.ts             # Environment validation
├── services/              # Business logic services
│   ├── tools/             # Tool-related services
│   ├── admin/             # Admin-related services
│   ├── core/              # Core services
│   └── index.ts           # Barrel exports
├── types/                 # TypeScript type definitions
│   ├── api/               # API-related types
│   ├── tools/             # Tool-related types
│   ├── admin/             # Admin-related types
│   └── index.ts           # Barrel exports
└── utils/                 # Utility functions
    ├── validation/        # Validation utilities
    ├── formatting/        # Formatting utilities
    ├── file-processing/   # File processing utilities
    └── index.ts           # Barrel exports
```

## Naming Conventions

### Files and Folders
- **Folders**: Use kebab-case (e.g., `file-processing`, `admin-dashboard`)
- **React Components**: Use PascalCase (e.g., `Button.tsx`, `ToolCard.tsx`)
- **Utilities/Services**: Use camelCase (e.g., `formatBytes.ts`, `toolService.ts`)
- **Types**: Use PascalCase with descriptive names (e.g., `ToolData.ts`, `ApiResponse.ts`)

### Component Organization
- **UI Components**: Generic, reusable components (Button, Input, Card)
- **Form Components**: Form-specific components with validation
- **Layout Components**: Header, Footer, Navigation, Sidebar
- **Tool Components**: Tool-specific UI components

### Hook Organization
- **Global Hooks**: Commonly used hooks at top level (useTools, useUrlState, useToolsWithState)
- **Feature-Specific Hooks**: Organized in subdirectories by domain (tools/, admin/, core/)
- **Shared Hooks**: Cross-cutting concerns in core/ subdirectory

### Import Patterns
```typescript
// Preferred: Use barrel exports
import { Button, Input } from '@/components/ui';
import { validateEmail } from '@/utils/validation';
import { ToolService } from '@/services/tools';

// Avoid: Direct file imports when barrel exports exist
import { Button } from '@/components/ui/Button';
```

## Path Aliases
The following TypeScript path aliases are configured:

- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/types/*` → `./src/types/*`
- `@/utils/*` → `./src/utils/*`
- `@/services/*` → `./src/services/*`
- `@/hooks/*` → `./src/hooks/*`

## Best Practices

### Component Structure
```typescript
// ComponentName.tsx
import { ComponentProps } from '@/types';

interface ComponentNameProps {
  // Props definition
}

export function ComponentName({ ...props }: ComponentNameProps) {
  // Component implementation
}

export default ComponentName;
```

### Service Structure
```typescript
// serviceName.ts
import { ServiceType } from '@/types';

export class ServiceName {
  // Service implementation
}

export const serviceInstance = new ServiceName();
```

### Hook Structure
```typescript
// useHookName.ts
import { useState, useEffect } from 'react';

export function useHookName() {
  // Hook implementation
  return { /* hook return values */ };
}
```

## File Organization Rules

1. **Single Responsibility**: Each file should have a single, clear purpose
2. **Barrel Exports**: Use index.ts files for clean imports
3. **Type Collocation**: Keep types close to their usage when possible
4. **Shared Types**: Place shared types in the appropriate types/ subdirectory
5. **Test Files**: Place test files adjacent to the code they test with `.test.ts` or `.spec.ts` suffix

## Future Considerations

- **Feature-based Organization**: As the app grows, consider organizing by feature rather than by type
- **Shared Libraries**: Extract common utilities to shared packages if needed
- **Micro-frontends**: Structure allows for future micro-frontend architecture if needed 