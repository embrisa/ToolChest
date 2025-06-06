# Internationalization (i18n) Usage Examples

This guide provides practical code examples for using `next-intl` in the Tool Chest project. All examples are based on real implementations from the codebase and demonstrate both server-side and client-side patterns.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Page Components](#page-components)
3. [Tool Components](#tool-components)
4. [Admin Components](#admin-components)
5. [Form Components](#form-components)
6. [Error Handling](#error-handling)
7. [Dynamic Content](#dynamic-content)
8. [Layout Components](#layout-components)
9. [Database Integration](#database-integration)
10. [Advanced Patterns](#advanced-patterns)

## Basic Usage

### Client Components

```typescript
"use client";
import { useTranslations } from "next-intl";

export function BasicClientComponent() {
  const t = useTranslations("common");

  return (
    <div>
      <button className="btn-primary">
        {t("actions.save")}
      </button>
      <span className="status">
        {t("ui.status.ready")}
      </span>
    </div>
  );
}
```

### Server Components

```typescript
import { getTranslations } from "next-intl/server";

export default async function BasicServerComponent() {
  const t = await getTranslations("common");

  return (
    <div>
      <h1>{t("navigation.home")}</h1>
      <p>{t("ui.status.loading")}</p>
    </div>
  );
}
```

## Page Components

### Homepage (Server Component)

```typescript
// src/app/page.tsx
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("pages.home");
  const tCommon = await getTranslations("common");

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          {t("hero.title")}
        </h1>
        <p className="hero-description">
          {t("hero.description")}
        </p>
        <button className="cta-button">
          {tCommon("actions.getStarted")}
        </button>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <h2>{t("stats.title")}</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">15+</span>
            <span className="stat-label">{t("stats.toolsAvailable")}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">{t("stats.clientSideProcessing")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// Generate metadata
export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations("pages.home");

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}
```

### Tools Listing Page (Client Component)

```typescript
// src/app/tools/page.tsx
"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ToolsPage() {
  const t = useTranslations("pages.tools");
  const tCommon = useTranslations("common");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="tools-page">
      <header className="page-header">
        <h1>{t("hero.title")}</h1>
        <p>{t("hero.description")}</p>
      </header>

      <div className="tools-search">
        <input
          type="text"
          placeholder={t("search.placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button className="search-button">
          {tCommon("actions.search")}
        </button>
      </div>

      <div className="tools-stats">
        <p>{t("stats.totalTools", { count: 15 })}</p>
        <p>{t("stats.categories", { count: 5 })}</p>
      </div>
    </div>
  );
}
```

### Error Pages

```typescript
// src/app/not-found.tsx
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const t = await getTranslations("pages.error.notFound");
  const tCommon = await getTranslations("common");

  return (
    <div className="error-page">
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>

      <div className="error-actions">
        <Link href="/" className="btn-primary">
          {t("actions.goHome")}
        </Link>
        <Link href="/tools" className="btn-secondary">
          {tCommon("navigation.tools")}
        </Link>
      </div>

      <div className="error-suggestions">
        <h2>{t("suggestions.title")}</h2>
        <ul>
          <li>{t("suggestions.checkUrl")}</li>
          <li>{t("suggestions.useSearch")}</li>
          <li>{t("suggestions.browseTools")}</li>
        </ul>
      </div>
    </div>
  );
}
```

## Tool Components

### Base64 Tool Component

```typescript
// src/components/tools/Base64Tool.tsx
"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Mode = "encode" | "decode";
type Variant = "standard" | "urlSafe";

export function Base64Tool() {
  const tCommon = useTranslations("common");
  const tTools = useTranslations("tools.common");
  const tBase64 = useTranslations("tools.base64");

  const [mode, setMode] = useState<Mode>("encode");
  const [variant, setVariant] = useState<Variant>("standard");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!input.trim()) {
      setError(tCommon("validation.emptyInput"));
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Set status message
      const statusMessage = tCommon("ui.status.processing");
      console.log(statusMessage);

      // Process the input (implementation details omitted)
      const result = await processBase64(input, mode, variant);
      setOutput(result);

    } catch (err) {
      setError(tCommon("errors.processingFailed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      // Show success message
      console.log(tCommon("ui.status.copied"));
    } catch (err) {
      setError(tCommon("errors.generic"));
    }
  };

  return (
    <div className="base64-tool">
      <div className="tool-header">
        <h2>{tBase64("tool.title")}</h2>
        <p>{tBase64("tool.description")}</p>
      </div>

      {/* Mode Selection */}
      <div className="mode-selection">
        <label>{tTools("ui.modes.label")}</label>
        <div className="mode-buttons">
          <button
            className={mode === "encode" ? "active" : ""}
            onClick={() => setMode("encode")}
          >
            {tCommon("ui.modes.encode")}
          </button>
          <button
            className={mode === "decode" ? "active" : ""}
            onClick={() => setMode("decode")}
          >
            {tCommon("ui.modes.decode")}
          </button>
        </div>
      </div>

      {/* Variant Selection */}
      <div className="variant-selection">
        <label>{tBase64("tool.variants.label")}</label>
        <select
          value={variant}
          onChange={(e) => setVariant(e.target.value as Variant)}
        >
          <option value="standard">
            {tBase64("tool.variants.standard")}
          </option>
          <option value="urlSafe">
            {tBase64("tool.variants.urlSafe")}
          </option>
        </select>
      </div>

      {/* Input */}
      <div className="input-section">
        <label>{tTools("ui.inputTypes.text")}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tBase64("tool.placeholders.input")}
          disabled={isProcessing}
        />
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcess}
        disabled={isProcessing || !input.trim()}
        className="process-button"
      >
        {isProcessing
          ? tCommon("ui.status.processing")
          : tCommon("ui.modes." + mode)
        }
      </button>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="output-section">
          <label>{tTools("ui.labels.result")}</label>
          <textarea value={output} readOnly />
          <div className="output-actions">
            <button onClick={handleCopy}>
              {tCommon("ui.actions.copy")}
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="privacy-notice">
        <p>{tCommon("privacy.clientSideProcessing")}</p>
      </div>
    </div>
  );
}
```

### Hash Generator Tool

```typescript
// src/components/tools/HashGeneratorTool.tsx
"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function HashGeneratorTool() {
  const tCommon = useTranslations("common");
  const tTools = useTranslations("tools.common");
  const tHash = useTranslations("tools.hash-generator");

  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [algorithm, setAlgorithm] = useState("sha256");
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="hash-generator-tool">
      <div className="tool-header">
        <h2>{tHash("tool.title")}</h2>
        <p>{tHash("tool.description")}</p>
      </div>

      {/* Input Type Selection */}
      <div className="input-type-selection">
        <div className="input-type-buttons">
          <button
            className={inputType === "text" ? "active" : ""}
            onClick={() => setInputType("text")}
          >
            {tCommon("ui.inputTypes.text")}
          </button>
          <button
            className={inputType === "file" ? "active" : ""}
            onClick={() => setInputType("file")}
          >
            {tCommon("ui.inputTypes.file")}
          </button>
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="algorithm-selection">
        <label>{tHash("tool.algorithm.label")}</label>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
        >
          <option value="sha256">{tHash("tool.algorithm.sha256")}</option>
          <option value="sha512">{tHash("tool.algorithm.sha512")}</option>
          <option value="md5">{tHash("tool.algorithm.md5")}</option>
        </select>
      </div>

      {/* Input Section */}
      {inputType === "text" ? (
        <div className="text-input-section">
          <label>{tCommon("ui.inputTypes.text")}</label>
          <textarea
            placeholder={tHash("tool.placeholders.textInput")}
          />
        </div>
      ) : (
        <div className="file-input-section">
          <label>{tCommon("ui.inputTypes.file")}</label>
          <div className="file-drop-zone">
            {tHash("tool.placeholders.fileInput")}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        className="generate-button"
        disabled={isProcessing}
      >
        {isProcessing
          ? tCommon("ui.status.processing")
          : tCommon("ui.modes.generate")
        }
      </button>
    </div>
  );
}
```

## Admin Components

### Admin Dashboard

```typescript
// src/app/admin/dashboard/page.tsx
import { getTranslations } from "next-intl/server";

export default async function AdminDashboard() {
  const t = await getTranslations("pages.admin.dashboard");
  const tCommon = await getTranslations("common");

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{t("stats.totalTools")}</h3>
          <span className="stat-number">15</span>
        </div>
        <div className="stat-card">
          <h3>{t("stats.totalTags")}</h3>
          <span className="stat-number">8</span>
        </div>
        <div className="stat-card">
          <h3>{t("stats.recentUsage")}</h3>
          <span className="stat-number">1,234</span>
        </div>
      </div>

      <div className="quick-actions">
        <h2>{t("quickActions.title")}</h2>
        <div className="action-buttons">
          <button className="btn-primary">
            {t("quickActions.addTool")}
          </button>
          <button className="btn-secondary">
            {t("quickActions.manageTags")}
          </button>
          <button className="btn-secondary">
            {tCommon("actions.refresh")}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Tool Management Form

```typescript
// src/components/admin/ToolForm.tsx
"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ToolFormData {
  nameKey: string;
  descriptionKey: string;
  slug: string;
  enabled: boolean;
}

export function ToolForm() {
  const t = useTranslations("components.forms");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("pages.admin.tools");

  const [formData, setFormData] = useState<ToolFormData>({
    nameKey: "",
    descriptionKey: "",
    slug: "",
    enabled: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.nameKey.trim()) {
      newErrors.nameKey = t("validation.required");
    }

    if (!formData.slug.trim()) {
      newErrors.slug = t("validation.required");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit form (implementation omitted)
      console.log(tCommon("ui.status.saving"));
      // ... submit logic

    } catch (error) {
      setErrors({ general: tCommon("errors.savingFailed") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tool-form">
      <h2>{tAdmin("form.title")}</h2>

      <form onSubmit={handleSubmit}>
        {/* Name Key Field */}
        <div className="form-field">
          <label>{t("labels.nameKey")}</label>
          <input
            type="text"
            value={formData.nameKey}
            onChange={(e) => setFormData({
              ...formData,
              nameKey: e.target.value
            })}
            placeholder={t("placeholders.nameKey")}
          />
          {errors.nameKey && (
            <span className="error">{errors.nameKey}</span>
          )}
        </div>

        {/* Description Key Field */}
        <div className="form-field">
          <label>{t("labels.descriptionKey")}</label>
          <textarea
            value={formData.descriptionKey}
            onChange={(e) => setFormData({
              ...formData,
              descriptionKey: e.target.value
            })}
            placeholder={t("placeholders.descriptionKey")}
          />
        </div>

        {/* Slug Field */}
        <div className="form-field">
          <label>{t("labels.slug")}</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({
              ...formData,
              slug: e.target.value
            })}
            placeholder={t("placeholders.slug")}
          />
          {errors.slug && (
            <span className="error">{errors.slug}</span>
          )}
        </div>

        {/* Enabled Toggle */}
        <div className="form-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({
                ...formData,
                enabled: e.target.checked
              })}
            />
            {t("labels.enabled")}
          </label>
        </div>

        {/* Submit Actions */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting
              ? tCommon("ui.status.saving")
              : tCommon("actions.save")
            }
          </button>
          <button
            type="button"
            className="btn-secondary"
          >
            {tCommon("actions.cancel")}
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="form-error">
            {errors.general}
          </div>
        )}
      </form>
    </div>
  );
}
```

## Form Components

### File Upload Component

```typescript
// src/components/ui/FileUpload.tsx
"use client";
import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
}

export function FileUpload({
  onFileSelect,
  acceptedTypes = [],
  maxSize = 10 * 1024 * 1024 // 10MB
}: FileUploadProps) {
  const tCommon = useTranslations("common");
  const tUI = useTranslations("components.ui");

  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return tCommon("validation.fileTooLarge", {
        maxSize: formatFileSize(maxSize)
      });
    }

    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      return tCommon("validation.unsupportedFileType");
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="file-upload">
      <div
        className={`drop-zone ${isDragOver ? "drag-over" : ""}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <input
          type="file"
          onChange={handleInputChange}
          accept={acceptedTypes.join(",")}
          className="file-input"
        />

        <div className="drop-zone-content">
          <div className="upload-icon">📁</div>
          <p className="upload-text">
            {tUI("fileUpload.dropZoneText")}
          </p>
          <p className="upload-subtext">
            {tUI("fileUpload.orClickToSelect")}
          </p>

          {acceptedTypes.length > 0 && (
            <p className="accepted-types">
              {tUI("fileUpload.acceptedTypes")}: {acceptedTypes.join(", ")}
            </p>
          )}

          <p className="max-size">
            {tUI("fileUpload.maxSize", {
              size: formatFileSize(maxSize)
            })}
          </p>
        </div>
      </div>

      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
```

## Error Handling

### Error Boundary Component

```typescript
// src/components/errors/ErrorBoundary.tsx
"use client";
import { useTranslations } from "next-intl";
import { Component, ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error }: { error?: Error }) {
  const tCommon = useTranslations("common");
  const tError = useTranslations("pages.error");

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="error-boundary">
      <div className="error-content">
        <h2>{tError("boundary.title")}</h2>
        <p>{tError("boundary.description")}</p>

        {error && (
          <details className="error-details">
            <summary>{tError("boundary.technicalDetails")}</summary>
            <pre>{error.message}</pre>
          </details>
        )}

        <div className="error-actions">
          <button onClick={handleRetry} className="btn-primary">
            {tCommon("ui.actions.tryAgain")}
          </button>
          <a href="/" className="btn-secondary">
            {tCommon("navigation.home")}
          </a>
        </div>
      </div>
    </div>
  );
}
```

## Dynamic Content

### Content with Variables

```typescript
// String interpolation examples
const tCommon = useTranslations("common");
const tTools = useTranslations("tools.common");

// Simple variable substitution
const fileSize = "5MB";
const message = tCommon("validation.fileTooLarge", { maxSize: fileSize });

// Count-based pluralization
const toolCount = 15;
const statsMessage = tTools("stats.toolsCount", { count: toolCount });

// Multiple variables
const progress = { current: 3, total: 10 };
const progressMessage = tTools("ui.progress", {
  current: progress.current,
  total: progress.total,
});

// Date formatting
const lastUpdate = new Date();
const updateMessage = tCommon("time.lastUpdated", {
  date: lastUpdate.toLocaleDateString(),
});
```

### Conditional Rendering

```typescript
function StatusMessage({ status, count }: { status: string; count: number }) {
  const tCommon = useTranslations("common");
  const tTools = useTranslations("tools.common");

  const getStatusMessage = () => {
    switch (status) {
      case "loading":
        return tCommon("ui.status.loading");
      case "processing":
        return tCommon("ui.status.processing");
      case "success":
        return tTools("ui.status.success");
      case "error":
        return tCommon("errors.generic");
      default:
        return tCommon("ui.status.ready");
    }
  };

  const getCountMessage = () => {
    if (count === 0) {
      return tTools("ui.noItems");
    } else if (count === 1) {
      return tTools("ui.oneItem");
    } else {
      return tTools("ui.multipleItems", { count });
    }
  };

  return (
    <div className="status-message">
      <span className="status">{getStatusMessage()}</span>
      <span className="count">{getCountMessage()}</span>
    </div>
  );
}
```

## Layout Components

### Header with Navigation

```typescript
// src/components/layout/Header.tsx
"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const t = useTranslations("components.layout");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-brand">
          <Link href="/">
            <span className="brand-text">{t("header.brand")}</span>
          </Link>
        </div>

        <nav className="header-nav">
          <div className="nav-links">
            <Link href="/" className="nav-link">
              {t("header.nav.home")}
            </Link>
            <Link href="/tools" className="nav-link">
              {t("header.nav.allTools")}
            </Link>
          </div>
        </nav>

        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={t("header.mobileMenu.toggle")}
        >
          ☰
        </button>

        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("header.nav.home")}
            </Link>
            <Link
              href="/tools"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("header.nav.allTools")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
```

## Database Integration

### Tool Card with Database Translations

```typescript
// src/components/tools/ToolCard.tsx
"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface Tool {
  id: string;
  slug: string;
  nameKey: string;
  descriptionKey: string;
  enabled: boolean;
  tags: Array<{
    id: string;
    nameKey: string;
  }>;
}

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const tDatabase = useTranslations("database");
  const tCommon = useTranslations("common");

  // Get translated tool name and description from database keys
  const toolName = tDatabase(`tools.${tool.nameKey}.name`);
  const toolDescription = tDatabase(`tools.${tool.nameKey}.description`);

  return (
    <div className="tool-card">
      <div className="tool-card-header">
        <h3>{toolName}</h3>
        <div className="tool-tags">
          {tool.tags.map((tag) => (
            <span key={tag.id} className="tag">
              {tDatabase(`tags.${tag.nameKey}.name`)}
            </span>
          ))}
        </div>
      </div>

      <div className="tool-card-body">
        <p>{toolDescription}</p>
      </div>

      <div className="tool-card-footer">
        <Link
          href={`/tools/${tool.slug}`}
          className="btn-primary"
        >
          {tCommon("actions.tryTool")}
        </Link>

        <div className="tool-info">
          <span className="privacy-badge">
            {tCommon("privacy.clientSideProcessing")}
          </span>
        </div>
      </div>
    </div>
  );
}
```

## Advanced Patterns

### Custom Hook for Tool Translations

```typescript
// src/hooks/useToolTranslations.ts
import { useTranslations } from "next-intl";

export function useToolTranslations(toolSlug?: string) {
  const tCommon = useTranslations("common");
  const tToolsCommon = useTranslations("tools.common");
  const tToolSpecific = useTranslations(
    toolSlug ? `tools.${toolSlug}` : "tools.common"
  );
  const tDatabase = useTranslations("database");

  return {
    // Common translations
    common: tCommon,

    // Tool UI patterns
    ui: tToolsCommon,

    // Tool-specific translations
    tool: tToolSpecific,

    // Database entities
    database: tDatabase,

    // Convenience methods
    getToolName: (nameKey: string) => tDatabase(`tools.${nameKey}.name`),
    getToolDescription: (descriptionKey: string) =>
      tDatabase(`tools.${descriptionKey}.description`),
    getTagName: (nameKey: string) => tDatabase(`tags.${nameKey}.name`),

    // Status helpers
    getStatusMessage: (status: string) => {
      switch (status) {
        case "processing": return tCommon("ui.status.processing");
        case "success": return tCommon("ui.status.success");
        case "error": return tCommon("ui.status.error");
        default: return tCommon("ui.status.ready");
      }
    },
  };
}

// Usage in component
function MyToolComponent({ toolSlug }: { toolSlug: string }) {
  const { common, ui, tool, getStatusMessage } = useToolTranslations(toolSlug);
  const [status, setStatus] = useState("ready");

  return (
    <div>
      <h1>{tool("tool.title")}</h1>
      <button>{common("actions.process")}</button>
      <div className="status">
        {getStatusMessage(status)}
      </div>
    </div>
  );
}
```

### Loading States with Suspense

```typescript
// src/app/tools/[slug]/loading.tsx
import { getTranslations } from "next-intl/server";

export default async function ToolLoading() {
  const t = await getTranslations("pages.loading");

  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p>{t("page.loadingTool")}</p>
    </div>
  );
}

// src/app/tools/[slug]/page.tsx
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import ToolComponent from "./ToolComponent";

export default async function ToolPage({
  params
}: {
  params: { slug: string }
}) {
  const t = await getTranslations("pages.tools");

  return (
    <div className="tool-page">
      <Suspense fallback={<ToolLoadingSkeleton />}>
        <ToolComponent slug={params.slug} />
      </Suspense>
    </div>
  );
}

function ToolLoadingSkeleton() {
  const t = useTranslations("pages.loading");

  return (
    <div className="tool-skeleton">
      <div className="skeleton-header" />
      <div className="skeleton-content" />
      <p>{t("tool.loadingInterface")}</p>
    </div>
  );
}
```

---

These examples demonstrate the full range of `next-intl` usage patterns in the Tool Chest project. For more specific implementation details, refer to the [Contributor Guide](./i18n-contributor-guide.md) or examine the actual component implementations in the codebase.
