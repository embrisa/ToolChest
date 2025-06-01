# tool-chest Developer Cheat Sheet

## 🚀 Quick Start

### Project Overview

**tool-chest** is a Next.js 14+ web application providing essential computer tools with a focus on privacy, accessibility, and performance. The platform serves as a comprehensive collection of utilities for various computer tasks, from encoding and file conversion to text processing and beyond. The application features a professional light mode design optimized for productivity and accessibility.

**Tech Stack:**

- **Framework:** Next.js 14+ (App Router)
- **Frontend:** React 18+ with TypeScript
- **Styling:** Tailwind CSS + Custom Design System
- **Database:** PostgreSQL + Prisma ORM
- **State Management:** React state + SWR for server state
- **Authentication:** Simple token-based admin auth
- **Testing:** Jest + React Testing Library + Playwright

### Quick Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript validation

# Database
npx prisma migrate dev  # Run migrations
npx prisma generate     # Generate Prisma client
npx prisma studio       # Open Prisma Studio

# Testing
npm test                # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:a11y       # Run accessibility tests
npm run validate        # Run all quality checks

# Setup
npm run setup           # Initial project setup
npm run validate-env    # Validate environment variables
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── tools/         # Tool APIs
│   │   └── admin/         # Admin APIs
│   ├── tools/             # Tool pages
│   │   ├── base64/        # Base64 encoder/decoder
│   │   ├── hash-generator/ # Hash generator
│   │   ├── favicon-generator/ # Favicon generator
│   │   └── markdown-to-pdf/ # Markdown to PDF converter
│   ├── admin/             # Admin area
│   │   ├── auth/          # Authentication
│   │   ├── dashboard/     # Dashboard
│   │   ├── tools/         # Tool management
│   │   ├── tags/          # Tag management
│   │   ├── analytics/     # Analytics
│   │   └── monitoring/    # System monitoring
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Base UI (Button, Input, Card)
│   ├── layout/            # Layout (Header, Footer)
│   ├── tools/             # Tool-specific components
│   ├── admin/             # Admin components
│   └── errors/            # Error handling components
├── hooks/                 # Custom React hooks
├── lib/                   # Core utilities
├── services/              # Business logic
├── types/                 # TypeScript definitions
└── utils/                 # Helper functions
```

---

## 🛠️ Development Patterns

### Tool Categories

Tools are organized into logical categories for better user experience:

- **Encoding/Decoding**: Base64, URL encoding, HTML entities, etc.
- **Hashing/Crypto**: MD5, SHA variants, password generators, etc.
- **File Processing**: Format conversion, compression, image tools, etc.
- **Text Processing**: Formatting, validation, transformation, etc.
- **Development**: JSON formatting, regex testing, API tools, etc.
- **Utilities**: Unit conversion, calculators, generators, etc.

## 🛠️ Development Patterns

### Path Aliases

```typescript
import { Button } from "@/components/ui";
import { ToolService } from "@/services/tools";
import { ToolData } from "@/types/tools";
import { formatBytes } from "@/utils/formatting";
```

### Component Patterns

```typescript
// Standard Component
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  return <div>...</div>;
}

// With Error Boundary
export default function ToolPage() {
  return (
    <ErrorBoundary>
      <ToolComponent />
    </ErrorBoundary>
  );
}

// With Loading State
export default function DataComponent() {
  const { data, error, isLoading } = useSWR('/api/data', fetcher);

  if (isLoading) return <SkeletonLoader />;
  if (error) return <ErrorPage error={error} />;
  return <DataDisplay data={data} />;
}
```

### Service Pattern

```typescript
// Base Service
export class BaseService {
  protected cache = new Map();
  protected handleError(error: Error) {
    /* ... */
  }
}

// Tool Service
export class ToolService extends BaseService {
  async getAllTools(filters?: ToolFilters) {
    // Implementation with caching
  }
}
```

---

## 🎨 UI Standards

### Component Variants

```typescript
// Button Variants for Light Mode
<Button variant="primary" size="lg">Primary Action</Button>    // Brand blue with white text
<Button variant="secondary" size="md">Secondary</Button>      // Neutral with dark text
<Button variant="danger" size="sm">Delete</Button>           // Error red with white text

// Card Types with Light Mode Backgrounds
<Card variant="default">    // bg-neutral-50 (elevated light surface)
<Card variant="interactive"> // Hover to bg-neutral-25 (subtle highlight)
<Card variant="error">      // Error state with proper contrast

// Light Mode Background Classes
className="bg-neutral-100"  // Page background (professional muted gray)
className="bg-neutral-50"   // Card/surface background (elevated)
className="bg-neutral-25"   // Hover states (bright highlights)
className="bg-neutral-150"  // Secondary/recessed surfaces
```

### Responsive Design

```typescript
// Tailwind Classes
className =
  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
className = "px-4 sm:px-6 lg:px-8"; // Container padding
className = "text-sm sm:text-base lg:text-lg"; // Responsive text
```

### Accessibility & Contrast Requirements

```typescript
// Enhanced contrast text classes (WCAG AAA compliant - Light Mode Only)
<h1 className="text-primary">Primary heading</h1>      // 9.2:1 contrast
<p className="text-secondary">Secondary content</p>    // 7.1:1 contrast
<span className="text-tertiary">Supporting text</span> // 8.1:1 contrast
<small className="text-muted">Muted text</small>       // 4.8:1 contrast

// Light mode background hierarchy
<div className="bg-neutral-100">Page background</div>         // Primary (muted gray)
<div className="bg-neutral-50">Card/surface background</div>  // Elevated (light)
<div className="bg-neutral-25">Hover states</div>            // Interactive highlights
<div className="bg-neutral-150">Secondary surface</div>      // Recessed areas

// Required for all interactive elements
<button
  aria-label="Clear search input"
  aria-describedby="search-help-text"
  className="btn-primary" // Enhanced contrast for light mode
>

// Form controls optimized for light theme
<input
  aria-invalid={hasError}
  aria-describedby="error-message"
  className="input-field" // Light mode optimized contrast
/>

// Loading states with proper announcements
<div aria-live="polite" aria-busy="true">
  Loading content...
</div>
```

---

## 🔧 Tool Implementation Guide

### Client-Side Processing Pattern

```typescript
// 1. Define types
export interface ToolInputData {
  text?: string;
  file?: File;
  options: ToolOptions;
}

// 2. Create service
export class ToolService {
  async processClientSide(input: ToolInputData): Promise<ToolResult> {
    // Privacy-first: process in browser
  }

  async processServerSide(input: ToolInputData): Promise<ToolResult> {
    // Fallback for large files
  }
}

// 3. Component with progress
export function ToolComponent() {
  const [progress, setProgress] = useState<ProgressState>();

  const handleProcess = async (input: ToolInputData) => {
    const isLargeFile = input.file && input.file.size > LARGE_FILE_THRESHOLD;

    if (isLargeFile) {
      // Show progress indicator
      setProgress({ message: "Processing...", percentage: 0 });
    }

    const result = await toolService.processClientSide(input);
    // Handle result...
  };
}
```

### File Processing Standards

```typescript
// File validation
const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Download naming convention
const filename = `toolchest_${toolName}_${timestamp}.${extension}`;

// Progress for large operations
if (fileSize > LARGE_FILE_THRESHOLD) {
  showProgressIndicator();
}
```

---

## 🔐 Admin System

### Authentication

```typescript
// Simple token-based auth
const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN;

// Middleware protection
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check admin cookie
  }
}

// Login flow (light mode optimized)
<form onSubmit={handleLogin}>
  <input
    type="password"
    placeholder="Admin token"
    value={token}
    onChange={(e) => setToken(e.target.value)}
    className="input-field" // Light mode styling
  />
</form>
```

### CRUD Operations

```typescript
// Admin API pattern
// GET /api/admin/tools - List with filtering
// POST /api/admin/tools - Create new
// GET /api/admin/tools/[id] - Get specific
// PUT /api/admin/tools/[id] - Update
// DELETE /api/admin/tools/[id] - Delete

// With validation
const result = await adminToolService.create(formData);
if (!result.success) {
  setErrors(result.errors);
  return;
}
```

---

## 🧪 Testing Patterns

### Unit Tests

```typescript
// Component testing
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});

// Hook testing
import { renderHook } from '@testing-library/react';
import { useToolsWithState } from '@/hooks/useToolsWithState';

test('fetches tools data', async () => {
  const { result } = renderHook(() => useToolsWithState());
  // Test hook behavior
});
```

### E2E Tests

```typescript
// Playwright tests
import { test, expect } from "@playwright/test";

test("base64 tool encodes text correctly", async ({ page }) => {
  await page.goto("/tools/base64");
  await page.fill('[data-testid="text-input"]', "Hello World");
  await page.click('[data-testid="encode-button"]');
  await expect(page.locator('[data-testid="result"]')).toContainText(
    "SGVsbG8gV29ybGQ=",
  );
});
```

### Accessibility Tests

```typescript
// A11y validation
import { axe, toHaveNoViolations } from 'jest-axe';

test('page has no accessibility violations', async () => {
  const { container } = render(<HomePage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 📊 Performance Standards

### Core Web Vitals & Accessibility Targets

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Lighthouse Score:** > 90 (all categories)
- **Accessibility Score:** > 95 (WCAG AAA compliance)
- **Contrast Ratios:** 7:1+ for normal text, 4.5:1+ for large text

### Optimization Techniques

```typescript
// Image optimization
import Image from 'next/image';

<Image
  src="/tool-icon.png"
  alt="Tool description"
  width={48}
  height={48}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/..." // Low-quality placeholder
/>

// Code splitting
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  ssr: false,
  loading: () => <DashboardSkeleton />
});

// Data fetching with SWR
const { data, error } = useSWR(
  '/api/tools',
  fetcher,
  {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  }
);
```

### Caching Strategy

```typescript
// API routes with caching
export async function GET() {
  const data = await getToolsData();

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

// ISR for static content
export const revalidate = 300; // 5 minutes
```

---

## 🚨 Error Handling

### Error Boundary Pattern

```typescript
// Component level
<ErrorBoundary fallback={<ErrorPage />}>
  <ToolComponent />
</ErrorBoundary>

// Page level
export default function ToolPage() {
  return (
    <ErrorRecoveryProvider>
      <ToolContent />
    </ErrorRecoveryProvider>
  );
}
```

### Toast Notifications

```typescript
import { toast } from "@/components/ui/Toast";

// Success
toast.success("File processed successfully!");

// Error with retry
toast.error("Processing failed", {
  action: {
    label: "Retry",
    onClick: () => retryOperation(),
  },
});
```

### API Error Handling

```typescript
// Consistent error responses
return Response.json(
  { error: "Validation failed", details: validationErrors },
  { status: 400 },
);

// Client-side error handling
try {
  const result = await apiCall();
} catch (error) {
  if (error.status === 429) {
    // Handle rate limiting
  } else if (error.status >= 500) {
    // Handle server errors
  }
}
```

---

## 🔒 Security & Privacy

### Input Validation

```typescript
// Zod schemas for validation
const ToolInputSchema = z.object({
  text: z.string().max(1000000),
  file: z.instanceof(File).optional(),
  options: z.object({...})
});

// File validation
const validateFile = (file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('File type not allowed');
  }
};
```

### Privacy-First Processing

```typescript
// Client-side processing (preferred)
const processLocally = async (data: string) => {
  // Process entirely in browser
  return btoa(data); // Example: Base64 encoding
};

// Server-side fallback (only when necessary)
const processOnServer = async (data: FormData) => {
  // Only for large files or complex operations
  return await fetch("/api/process", { method: "POST", body: data });
};
```

---

## 🌍 Environment Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/toolchest"

# Admin Authentication
ADMIN_SECRET_TOKEN="your-secure-admin-token"

# Optional
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_SITE_URL="https://toolchest.dev"
```

### Development Setup

```bash
# 1. Clone and install
git clone <repo>
cd toolchest
npm install

# 2. Environment setup
cp env.example .env.local
# Edit .env.local with your values

# 3. Database setup
npx prisma migrate dev
npx prisma generate

# 4. Start development
npm run dev
```

---

## 📋 Quality Checklist

### Before Commit

- [ ] TypeScript compiles without errors
- [ ] ESLint passes with zero warnings
- [ ] Prettier formatting applied
- [ ] Unit tests pass with >80% coverage
- [ ] Accessibility tests pass (light mode)
- [ ] Manual testing completed (light mode UI)

### Before Deploy

- [ ] Build succeeds without warnings
- [ ] E2E tests pass
- [ ] Performance tests meet targets
- [ ] Security scan passes
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Light mode styling verified

---

## 🔧 Development Standards

### Code Quality Guidelines

- Use TypeScript for all new code
- Follow existing component patterns
- Include proper ARIA labels for accessibility
- Add unit tests for new functionality
- Update documentation for API changes

### Development Workflow

```bash
# Feature development
git checkout -b feature/new-tool
git commit -m "feat: add new tool with accessibility support"
git push origin feature/new-tool
```

### Quality Checklist

- [ ] Code follows project patterns
- [ ] Accessibility requirements met
- [ ] Performance impact assessed
- [ ] Tests cover new functionality
- [ ] Documentation updated
- [ ] Error handling implemented
