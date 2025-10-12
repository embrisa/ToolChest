# tool-chest Testing Guide

This document provides comprehensive information about testing in the tool-chest project.

## Quick Start

### Test Commands

```bash
# Run all tests with automatic database setup
npm test

# Quick unit tests only (fastest)
npm run test:quick

# Run with coverage
npm run test:coverage

# Clean start (removes cached data)
rm -f test.db && npm test
```

## Testing Overview

tool-chest uses a multi-layered testing approach:

- **Unit Tests**: Component and function testing with Jest + React Testing Library
- **Integration Tests**: Testing component interactions and data flow
- **E2E Tests**: End-to-end user journey testing with Playwright
- **Accessibility Tests**: Automated a11y testing with jest-axe
- **Performance Tests**: Core Web Vitals and rendering performance

## Database Architecture

### Multi-Environment Support

| Environment | Database          | Schema File                 | Use Case          |
| ----------- | ----------------- | --------------------------- | ----------------- |
| Production  | PostgreSQL        | `prisma/schema.prisma`      | Live application  |
| Testing     | SQLite            | `prisma/schema.test.prisma` | Automated tests   |
| Development | PostgreSQL/SQLite | Auto-detected               | Local development |

### Testing Database Features

- No PostgreSQL server required for testing
- In-memory SQLite database created automatically
- Identical schema between environments
- Pre-seeded test data ready to use
- Automatic cleanup after tests

### Environment Variables

```bash
# Automatic (set by test scripts)
NODE_ENV=test
DATABASE_URL=file:./test.db
```

## Test Status

All unit and integration tests are currently passing. The previous issues regarding service mocking and database compatibility have been resolved. This indicates a healthy and stable test suite.

## Test Structure

```
├── src/
│   ├── app/__tests__/           # Page-level tests
│   ├── components/ui/__tests__/ # Component tests
│   └── utils/__tests__/         # Utility function tests
├── e2e/                         # End-to-end tests
├── scripts/
│   ├── setup-test-db.js         # Database setup
│   └── quick-test.sh            # All-in-one runner
└── jest.setup.js                # Jest configuration
```

## Homepage Testing

The homepage has comprehensive test coverage with 29 test cases covering:

- Loading states and error handling
- Content rendering and search functionality
- Tag filtering and empty states
- Accessibility compliance
- Responsive design
- Performance and integration

## Test Configuration

### Jest Setup

```javascript
// jest.setup.js
import '@testing-library/jest-dom'

// Mocks for Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Global mocks for browser APIs
global.ResizeObserver = jest.fn().mockImplementation(...)
global.IntersectionObserver = jest.fn().mockImplementation(...)
```

### Testing Library Setup

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);
```

## Testing Patterns

### Component Testing

```typescript
describe('ComponentName', () => {
  const defaultProps = { /* props */ }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with required props', () => {
    render(<ComponentName {...defaultProps} />)
    expect(screen.getByRole('...')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<ComponentName {...defaultProps} onClick={handleClick} />)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should have no accessibility violations', async () => {
    const { container } = render(<ComponentName {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Hook Testing

```typescript
import { renderHook } from "@testing-library/react";

describe("useCustomHook", () => {
  it("should return expected values", () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(expectedValue);
  });

  it("should handle state updates", () => {
    const { result } = renderHook(() => useCustomHook());
    act(() => {
      result.current.updateValue(newValue);
    });
    expect(result.current.value).toBe(newValue);
  });
});
```

## Mock Data

```typescript
const mockTools = [
  {
    id: "1",
    name: "Base64 Encoder",
    slug: "base64",
    description: "Encode and decode Base64 strings",
    tags: [{ id: "1", name: "Encoding", slug: "encoding" }],
    usageCount: 100,
  },
];

const mockTags = [
  { id: "1", name: "Encoding", slug: "encoding", toolCount: 3 },
];
```

## Common Issues & Solutions

| Error                     | Solution                                                     |
| ------------------------- | ------------------------------------------------------------ |
| `ENOENT: test.db`         | Run `npm run test:setup`                                     |
| `Prisma client not found` | Run `npx prisma generate --schema=prisma/schema.test.prisma` |
| `Multiple elements`       | Use `getAllBy*` instead of `getBy*`                          |
| `Component not rendering` | Check mock implementations                                   |

## Debugging Commands

```bash
# Verbose test output
npm test -- --verbose

# Run specific test file
npm test -- src/app/__tests__/page.test.tsx

# Run specific test case
npm test -- --testNamePattern="should render main heading"

# Debug database
sqlite3 test.db ".schema"
sqlite3 test.db "SELECT * FROM Tool;"
```

## Schema Compatibility

### PostgreSQL ↔ SQLite Mapping

| PostgreSQL  | SQLite    | Notes                 |
| ----------- | --------- | --------------------- |
| `serial`    | `INTEGER` | Auto-increment        |
| `uuid`      | `TEXT`    | String representation |
| `jsonb`     | `TEXT`    | JSON as string        |
| `timestamp` | `TEXT`    | ISO 8601 format       |

## Coverage Requirements

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Best Practices

1. **Test Structure**: Use descriptive test names, group with `describe` blocks, follow AAA pattern
2. **Accessibility**: Always include `jest-axe` tests, test keyboard navigation
3. **User-Centric**: Test user interactions, not implementation details
4. **Performance**: Test with large datasets, verify memory leak prevention
5. **Mocking**: Mock external dependencies, keep mocks simple, reset between tests

## Clipboard & Download Testing

### Unit/RTL (Jest)

- Clipboard: mock the clipboard API or fallback path.

```ts
// CopyExportBar: mock clipboard and assert copy feedback
Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
render(<CopyExportBar value="hello" />);
await user.click(screen.getByRole('button', { name: /copy result/i }));
expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
```

- Fallback copy (no secure context):

```ts
// Ensure document.execCommand('copy') is used by clipboard util fallback
document.execCommand = jest.fn(() => true) as any;
```

- Download: mock the blob downloader.

```ts
jest.mock('@/utils/file-processing', () => ({
  downloadBlob: jest.fn(),
}));
render(<CopyExportBar value="data" filename="out.txt" onDownloadData={() => 'data'} />);
await user.click(screen.getByRole('button', { name: /download result/i }));
expect(downloadBlob).toHaveBeenCalled();
```

### Playwright E2E

- Clipboard stubbing and fallback:

```ts
await page.evaluate(() => {
  // @ts-ignore
  if (!navigator.clipboard) navigator.clipboard = {} as any;
  // @ts-ignore
  navigator.clipboard.readText = async () => 'Hello Import Panel';
  // @ts-ignore
  document.execCommand = () => true; // fallback success
});
await page.getByRole('button', { name: /paste from clipboard/i }).click();
```

- Download assertion:

```ts
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: /download result/i }).click(),
]);
expect(download.suggestedFilename()).toMatch(/\.txt$/);
```

- File upload via picker:

```ts
await page.setInputFiles('input[type="file"]', path.join(__dirname, 'assets', 'file.txt'));
```

- Drag-and-drop and paste-a-file (Chromium-only patterns):

```ts
// Convert Node bytes -> browser Uint8Array and dispatch drop or paste with DataTransfer
await elementHandle.evaluate((el, { name, b64 }) => {
  const bytes = atob(b64).split('').map(c => c.charCodeAt(0));
  const file = new File([new Uint8Array(bytes)], name, { type: 'text/plain' });
  const dt = new DataTransfer();
  dt.items.add(file);
  const evt = new Event('drop', { bubbles: true });
  Object.defineProperty(evt, 'dataTransfer', { value: dt });
  el.dispatchEvent(evt);
}, { name: 'dropped.txt', b64 });
```

## Troubleshooting

### Common Test Failures

```typescript
// Wait for async operations
await waitFor(() => {
  expect(screen.getByText("Expected text")).toBeInTheDocument();
});

// Use findBy for async elements
const element = await screen.findByText("Async text");

// Ensure mocks are cleared
beforeEach(() => {
  jest.clearAllMocks();
});
```
