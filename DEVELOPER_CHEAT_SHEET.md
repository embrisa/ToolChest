# tool-chest AI Developer Reference

## 🚀 Tech Stack & Architecture

**tool-chest** is a Next.js 15+ web application providing privacy-focused computer tools with professional light mode design.

**Core Technologies:**

- **Framework:** Next.js 15+ (App Router)
- **Frontend:** React 18+ with TypeScript
- **Styling:** Tailwind CSS + Custom Design System
- **Database:** PostgreSQL + Prisma ORM
- **State Management:** React state + SWR for server state
- **Authentication:** Simple token-based admin auth
- **Testing:** Jest + React Testing Library + Playwright

**Key Commands:**

```bash
npm run dev              # Development server
npm run build           # Production build
npx prisma migrate dev  # Database migrations
npm test                # Unit tests
npm run test:e2e        # E2E tests

# Debugging Commands
DEBUG=prisma:query npm run dev    # Enable database query logging
npm run validate-env              # Check environment variables
npx prisma studio                # Database GUI (background service)
npm run lint -- --format=json    # Machine-readable lint output
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (tools/, admin/)
│   ├── tools/             # Tool pages (base64/, hash-generator/, etc.)
│   ├── admin/             # Admin area (auth/, dashboard/, tools/, tags/)
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/                # Base UI components
│   ├── layout/            # Header, Footer
│   ├── tools/             # Tool-specific components
│   └── admin/             # Admin components
├── hooks/                 # Custom React hooks
├── lib/                   # Core utilities
├── services/              # Business logic
├── types/                 # TypeScript definitions
└── utils/                 # Helper functions
```

---

## 🛠️ Core Development Patterns

### Path Aliases

Use `@/` prefix for all imports: `@/components/ui`, `@/services/tools`, `@/types/tools`

### Component Standards

- Always use `useId()` hook for generated component IDs (prevents hydration mismatches)
- Wrap tools in `<ErrorBoundary>` components
- Use `<ClientOnlyTool>` wrapper for hydration-safe client components
- Include proper TypeScript interfaces for all props

### Tool Categories

- **Encoding/Decoding**: Base64, URL encoding, HTML entities
- **Hashing/Crypto**: MD5, SHA variants, password generators
- **File Processing**: Format conversion, compression, image tools
- **Text Processing**: Formatting, validation, transformation
- **Development**: JSON formatting, regex testing, API tools
- **Utilities**: Unit conversion, calculators, generators

### Service Pattern

- Extend `BaseService` class for consistent error handling and caching
- Use `ToolService` for tool-specific operations
- Implement client-side processing for privacy (fallback to server for large files)

---

## 🧩 Shared UI Components Library

### Base UI Components (`@/components/ui`)

#### Core Interactive Components

- **`Button`** - Primary interactive element with 6 variants (`primary`, `secondary`, `ghost`, `danger`, `outline`, `gradient`)

  - Sizes: `sm`, `md`, `lg`, `xl`
  - Features: Loading states, icons, full-width mode
  - Usage: `<Button variant="primary" size="md" isLoading={loading}>Save</Button>`

- **`Input`** - Text input with validation and accessibility features

  - Built-in error states and ARIA support
  - Usage: `<Input placeholder="Enter text" aria-label="Search input" />`

- **`MultiSelect`** - Multi-value selection component with search and keyboard navigation

  - Usage: `<MultiSelect options={options} value={selected} onChange={setSelected} />`

- **`ColorPicker`** - Advanced color selection with multiple format support
  - Supports HSL, RGB, HEX formats with accessibility compliance

#### Layout & Structure Components

- **`Card`** - Flexible container with variants (`default`, `interactive`, `elevated`)
  - Sub-components: `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`
  - Padding options: `none`, `sm`, `md`, `lg`
  - Usage: `<Card variant="interactive"><CardTitle>Title</CardTitle><CardContent>Content</CardContent></Card>`

#### Loading & State Components

- **`Loading`** - Consistent loading indicators

  - `LoadingSkeleton` for content placeholders
  - Usage: `<Loading size="lg" />` or `<LoadingSkeleton />`

- **`SkeletonLoader`** - Multiple skeleton variants for different content types

  - `ToolCardSkeleton`, `TableSkeleton`, `FormSkeleton`, `DashboardSkeleton`
  - Usage: `<ToolCardSkeleton count={6} />`

- **`ProgressIndicator`** - Visual progress feedback for long operations

  - Usage: `<ProgressIndicator value={75} max={100} />`

- **`SuspenseFallback`** - Specialized fallbacks for different page types
  - `ToolPageFallback`, `ToolGridFallback`, `AdminTableFallback`
  - HOC: `withSuspense(Component, FallbackComponent)`

#### Performance & Optimization Components

- **`OptimizedImage`** - Next.js Image wrapper with performance optimizations

  - Variants: `ToolIcon`, `HeroImage`, `Thumbnail`
  - Usage: `<OptimizedImage src="/icon.png" alt="Tool icon" variant="ToolIcon" />`

- **`LazyLoader`** - Component lazy loading with preloading capabilities

  - HOC: `withLazyLoading(Component, LoadingComponent)`
  - Hook: `useComponentPreloader(componentImport)`

- **`PageTransition`** - Smooth page transitions with Router integration
  - Hooks: `usePageTransition()`, `useRouterTransition()`

#### Interaction & Feedback Components

- **`Alert`** - Reusable alert/message component with consistent styling across all tools

  - Variants: `error`, `warning`, `success`, `info`
  - Features: Built-in icons, optional titles, list support with `AlertList`
  - Usage: `<Alert variant="warning" title="Warning">Message</Alert>`

- **`Toast`** - Toast notification system with multiple severity levels

  - Functions: `createSuccessToast()`, `createErrorToast()`, `createWarningToast()`, `createCriticalToast()`
  - Usage: `<ToastContainer />` + `createSuccessToast("Operation completed")`

- **`AriaLiveRegion`** - Accessibility announcements for screen readers
  - Hook: `useAccessibilityAnnouncements()`
  - Usage: `<AriaLiveRegion />` + `announceToScreenReader("Status updated")`

#### Error Handling & Network Components

- **`NetworkErrorHandler`** - Automatic retry logic with backoff strategy

  - Components: `ToolLoadingError`, `AdminDataError`
  - Hooks: `useRetryWithBackoff()`, `useNetworkRetry()`

- **`WebVitals`** - Performance monitoring integration
  - Usage: `<WebVitals reportWebVitals={reportHandler} />`

### Layout Components (`@/components/layout`)

- **`Header`** - Main navigation with responsive design and tool search
- **`Footer`** - Site footer with links and branding

### Tool-Specific Shared Components (`@/components/tools`)

- **`ToolCard`** - Standardized tool display card with consistent styling
- **`SearchInput`** - Enhanced search with debouncing and accessibility
- **`TagFilter`** - Multi-select tag filtering with visual feedback
- **`FaviconPreview`** - Real-time favicon preview with multiple sizes
- **`PdfCustomizationPanel`** - Reusable PDF generation settings panel

### Tool Workflow Components (`@/components/ui`)

- **`ToolHeader`** - Consistent tool header with icon, title, and description

  - Features: Custom icons, gradient backgrounds, flexible styling
  - Usage: `<ToolHeader title="Base64 Tool" description="Encode and decode" iconText="B64" />`

- **`FileUpload`** - Drag-and-drop file upload with visual feedback

  - Features: Drag states, file validation, accessibility, custom styling
  - Usage: `<FileUpload onFileSelect={handleFile} accept="image/*" maxSize={10} />`

- **`FileInfo`** - Selected file information display with remove functionality

  - Features: File size formatting, type display, remove button
  - Usage: `<FileInfo file={selectedFile} onRemove={handleRemove} />`

- **`OptionGroup`** - Toggle button groups for tool settings

  - Features: Single selection, disabled states, custom styling
  - Usage: `<OptionGroup label="Mode" value={mode} options={modeOptions} onChange={setMode} />`

- **`ResultsPanel`** - Tool results display with copy/download actions

  - Features: Metadata display, action buttons, status feedback, badges
  - Usage: `<ResultsPanel title="Result" result={data} onCopy={copy} onDownload={download} />`

- **`ProgressCard`** - Operation progress with contextual messages
  - Features: Generic progress bar, stage messages, time estimates
  - Usage: `<ProgressCard progress={{progress: 75, stage: "processing"}} title="Encoding" />`

### Tool Page Template Components (`@/components/ui`)

- **`ToolPageTemplate`** - Complete tool page template combining all common elements

  - Features: Hero, privacy badge, feature grid, info section, animations
  - Usage: `<ToolPageTemplate title="Tool Name" description="..." infoSection={{...}}><ToolComponent /></ToolPageTemplate>`

- **`ToolPageLayout`** - Common layout structure with background patterns

  - Features: Background mesh, noise overlay, responsive container
  - Usage: `<ToolPageLayout><content /></ToolPageLayout>`

- **`ToolPageHero`** - Hero section with icon, title, and description

  - Features: Customizable icons, gradient text, responsive sizing
  - Usage: `<ToolPageHero title="Tool Name" description="..." iconText="T" />`

- **`PrivacyBadge`** - Privacy-first messaging with customizable colors

  - Features: Animated pulse, customizable styling, consistent messaging
  - Usage: `<PrivacyBadge message="🔒 Privacy-First • Client-Side Processing" />`

- **`FeatureCard`** - Individual feature display card

  - Features: Icon support, badges, hover effects, consistent styling
  - Usage: `<FeatureCard title="Feature" description="..." icon={<Icon />} />`

- **`FeatureGrid`** - Responsive grid layout for feature cards

  - Features: Responsive columns, optional title/description, animation delays
  - Usage: `<FeatureGrid features={[...]} columns={{md: 2, lg: 4}} />`

- **`ToolInfoSection`** - Information section with multiple subsections
  - Features: Two-column layout, custom icons, list items with icons
  - Usage: `<ToolInfoSection title="About" description="..." sections={[...]} />`

### Error Handling Components (`@/components/errors`)

- **`ErrorBoundary`** - React error boundary with recovery options
- **`ErrorPage`** - Standardized error page layouts
- **`ErrorTemplates`** - Pre-built error message templates
- **`ErrorRecoveryProvider`** - Context for error recovery actions

### Component Usage Patterns

#### Standard Tool Wrapper Pattern

```typescript
import { ErrorBoundary, Card, Button, Loading } from '@/components/ui';

export function MyTool() {
  return (
    <ErrorBoundary fallback={<ToolLoadingError />}>
      <Card variant="interactive">
        <CardHeader>
          <CardTitle>Tool Name</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tool content */}
        </CardContent>
        <CardFooter>
          <Button variant="primary" isLoading={processing}>
            Process
          </Button>
        </CardFooter>
      </Card>
    </ErrorBoundary>
  );
}
```

#### Form Component Pattern

```typescript
import { Input, Button, MultiSelect, Toast } from '@/components/ui';

export function ToolForm({ onSubmit }) {
  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Input Text"
        aria-describedby="input-help"
        aria-invalid={hasError}
      />
      <MultiSelect
        options={tagOptions}
        placeholder="Select tags..."
      />
      <Button type="submit" variant="primary" fullWidth>
        Submit
      </Button>
    </form>
  );
}
```

#### Loading State Pattern

```typescript
import { withSuspense, ToolPageFallback } from "@/components/ui";

const LazyTool = lazy(() => import("./MyTool"));

export const MyToolWithSuspense = withSuspense(LazyTool, ToolPageFallback);
```

---

## 🎨 Design System (Light Mode Only)

### Component Variants

- **Buttons**: `primary` (brand blue), `secondary` (neutral), `danger` (red)
- **Cards**: `default` (bg-neutral-50), `interactive` (hover effects), `error` (error state)
- **Backgrounds**: `bg-neutral-100` (page), `bg-neutral-50` (cards), `bg-neutral-25` (hover)

### Accessibility Requirements

- **WCAG AAA compliance** required
- **Contrast ratios**: 7:1+ for normal text, 4.5:1+ for large text
- **Text classes**: `text-primary` (9.2:1), `text-secondary` (7.1:1), `text-tertiary` (8.1:1)
- All interactive elements need `aria-label` and `aria-describedby`
- Form controls must include `aria-invalid` when applicable

### Responsive Design

- Use Tailwind responsive classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Container padding: `px-4 sm:px-6 lg:px-8`
- Responsive text: `text-sm sm:text-base lg:text-lg`

---

## 🔧 Tool Implementation Guidelines

### File Processing Standards

- **Large file threshold**: 5MB (show progress indicator)
- **Max file size**: 10MB
- **Download naming**: `toolchest_${toolName}_${timestamp}.${extension}`
- **Client-side first**: Process in browser for privacy, server fallback for large files

### Input Validation

- Use Zod schemas for all input validation
- Validate file size and MIME types
- Sanitize all user inputs

### Error Handling

- Use toast notifications for user feedback
- Implement proper error boundaries
- Consistent API error responses with appropriate HTTP status codes

---

## 🔐 Admin System

### Authentication

- Simple token-based auth using `ADMIN_SECRET_TOKEN` environment variable
- Middleware protection for `/admin` routes
- Cookie-based session management

### CRUD Operations

Standard REST API patterns:

- `GET /api/admin/tools` - List with filtering
- `POST /api/admin/tools` - Create
- `PUT /api/admin/tools/[id]` - Update
- `DELETE /api/admin/tools/[id]` - Delete

---

## 🚨 Hydration & SSR Critical Rules

### Prevent Hydration Mismatches

- **Never use**: `Math.random()`, `Date.now()`, or non-deterministic values
- **Always use**: `useId()` for component IDs
- **Client-only content**: Wrap in mount-aware components that render consistent fallbacks
- **Controlled inputs**: Always provide value (never mix defaultValue/value)
- **URL state**: Only access after component mounts

### Hydration-Safe Patterns

- Use `useState(false)` + `useEffect(() => setMounted(true), [])` for client-only content
- Provide consistent server/client rendering with fallback components
- Test all components for hydration compatibility

---

## ⚡ React Infinite Loop Prevention

### Critical Patterns That Cause Infinite Loops

- **Object dependencies in useEffect**: `useEffect(() => {}, [sortOptions, filters])` - objects recreate on every render
- **useEffect calling setState without proper deps**: Creates render → setState → render cycles
- **Error boundaries throwing in useEffect**: `useEffect(() => { if (error) throw error }, [error])`

### Prevention Rules

- **Memoize functions with useCallback**: Include specific primitive dependencies, not objects
- **Extract primitive values**: `[sortOptions.field, filters.search]` instead of `[sortOptions, filters]`
- **Never throw errors in useEffect**: Use error boundaries or immediate throwing in callbacks
- **Debug infinite loops**: Look for "Maximum update depth exceeded" error

### Safe Patterns

```typescript
// ❌ BAD - Object dependencies cause infinite loops
useEffect(() => {
  loadData();
}, [sortOptions, filters]);

// ✅ GOOD - Memoized function with primitive dependencies
const loadData = useCallback(async () => {
  // implementation
}, [sortOptions.field, sortOptions.direction, filters.search]);

useEffect(() => {
  loadData();
}, [loadData]);

// ❌ BAD - Error throwing in useEffect
const captureError = (error) => setError(error);
useEffect(() => {
  if (error) throw error;
}, [error]);

// ✅ GOOD - Immediate error throwing
const captureError = useCallback((error) => {
  throw error;
}, []);
```

---

## 📊 Performance Standards

### Core Web Vitals Targets

- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Lighthouse Score**: > 90 (all categories)
- **Accessibility Score**: > 95

### Optimization Techniques

- Use Next.js `Image` component with proper sizing and placeholders
- Implement code splitting with `dynamic()` imports
- SWR for data fetching with appropriate cache settings
- API routes include proper `Cache-Control` headers

---

## 🧪 Testing Requirements

### Test Coverage

- **Unit tests**: >80% coverage using Jest + React Testing Library
- **E2E tests**: Playwright for critical user flows
- **Accessibility tests**: jest-axe for WCAG compliance
- **Performance tests**: Lighthouse CI integration

### Testing Patterns

- Test component rendering and user interactions
- Mock external dependencies
- Test error states and loading states
- Verify accessibility compliance

### Automated Testing & Monitoring

```bash
# Headless testing for CI/CD
npm run test:e2e -- --headless
npm run test:a11y -- --reporter=json

# Performance monitoring
npm run lighthouse -- --output=json
npm run test:load                    # Load testing

# Health check automation
curl -f http://localhost:3000/api/health || exit 1
```

---

## 🔒 Security & Privacy

### Privacy-First Approach

- Process data client-side whenever possible
- Never store user data unnecessarily
- Clear processing happens in browser
- Server-side only for large file fallbacks

### Input Security

- Validate all file uploads (size, type, content)
- Sanitize user inputs
- Use proper CORS settings
- Rate limiting on API endpoints

---

## 🌍 Environment Configuration

### Required Variables

```bash
DATABASE_URL="postgresql://..."
ADMIN_SECRET_TOKEN="secure-token"
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"  # Optional
NEXT_PUBLIC_SITE_URL="https://..."  # Optional
```

### Development Setup

1. Clone repo and `npm install`
2. Copy `env.example` to `.env.local`
3. Run `npx prisma migrate dev`
4. Start with `npm run dev`

### Server Monitoring & Health Checks

```bash
# Monitor server logs in real-time
npm run dev | tee logs/dev.log

# Health check endpoints for monitoring
curl -s http://localhost:3000/api/health
curl -s http://localhost:3000/debug

# Database connection monitoring
npx prisma db pull --print > /dev/null && echo "DB OK" || echo "DB FAIL"

# Memory and performance monitoring
ps aux | grep node                   # Process monitoring
curl -s http://localhost:3000/api/tools -w "@curl-format.txt"
```

---

## 🐛 Server-Side Debugging & Monitoring

### Debug API Endpoints

- **`GET /debug`**: Comprehensive debugging page with structured data output
- **`GET /api/tools`**: Direct API testing endpoint
- **`GET /api/admin/tools`**: Admin API testing (with auth)
- **`GET /api/health`**: System health check endpoint

### Console/Terminal Debugging

- **Development server logs**: Monitor `npm run dev` output for errors
- **Database queries**: Enable Prisma logging with `DEBUG=prisma:query`
- **API call tracing**: Use `DEBUG=api:*` for request/response logging
- **Build analysis**: Run `npm run build` to catch static generation errors

### Server-Side Error Patterns

- **Database connection failures**: Check `DATABASE_URL` and connection pooling
- **Prisma client issues**: Verify `npx prisma generate` has been run
- **Environment variable problems**: Use `npm run validate-env`
- **Memory leaks**: Monitor process memory during long operations
- **API rate limiting**: Check response headers for rate limit status

### Automated Debugging Commands

```bash
# Check API health programmatically
curl -s http://localhost:3000/api/health | jq

# Test tool endpoints directly
curl -s http://localhost:3000/api/tools | jq '.length'

# Verify admin authentication
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/api/admin/tools

# Check database connection
npx prisma db pull --print

# Analyze build output
npm run build 2>&1 | grep -E "(error|warning|failed)"
```

### Debug Page Data Structure

The `/debug` endpoint returns structured JSON for programmatic analysis:

```json
{
  "mounted": boolean,
  "directApiCall": { "success": boolean, "data": array, "error": string },
  "swrHook": { "data": array, "error": object, "isLoading": boolean },
  "toolsHook": { "tools": array, "tags": array, "loading": boolean },
  "timestamp": string,
  "environment": string
}
```

### Log Analysis Patterns

- **Hydration mismatches**: Look for "Warning: Text content did not match" in console
- **API failures**: Monitor network tab or server logs for 4xx/5xx responses
- **Performance issues**: Check for "Slow query" warnings in Prisma logs
- **Memory issues**: Watch for "JavaScript heap out of memory" errors
- **Authentication problems**: Look for 401/403 responses in admin endpoints

---

## 📋 Quality Standards

### Code Quality

- TypeScript for all new code
- ESLint + Prettier formatting
- Proper ARIA labels for accessibility
- Use established component patterns
- Include unit tests for new features

### Pre-Commit Automation

```bash
# Automated quality checks
npm run type-check                   # TypeScript validation
npm run lint -- --format=json       # Machine-readable linting
npm test -- --coverage --json       # Test coverage output
npm run build 2>&1 | grep -c error  # Build error count

# Pre-commit hook validation
npm run validate                     # All quality checks
```

### Deployment Monitoring

```bash
# Automated deployment checks
npm run build                        # Build validation
npm run test:e2e -- --headless      # Headless E2E tests
npm run security-scan               # Security validation

# Health verification post-deployment
curl -f $DEPLOY_URL/api/health
curl -s $DEPLOY_URL/debug | jq '.environment'

# Database migration verification
npx prisma migrate status
```
