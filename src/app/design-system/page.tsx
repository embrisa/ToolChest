import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { SkeletonLoader, ToolCardSkeleton, TableSkeleton, FormSkeleton } from "@/components/ui/SkeletonLoader";
import { Loading } from "@/components/ui/Loading";

import { Toast, createSuccessToast, createErrorToast, createWarningToast } from "@/components/ui/Toast";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  CodeBracketIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  StarIcon,
  HeartIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  AdjustmentsHorizontalIcon,
  SwatchIcon,
  PhotoIcon,
  ClockIcon,
  BoltIcon,
  EyeIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import { InteractiveMultiSelect } from "./InteractiveMultiSelect";
import { InteractiveColorPicker } from "./InteractiveColorPicker";

export const metadata: Metadata = {
  title: "Complete Design System | tool-chest",
  description:
    "Comprehensive design system showcasing our full UI component library with enhanced accessibility, modern aesthetics, and developer-focused examples",
};

// Mock data for demonstrations
const mockSelectOptions = [
  { id: "1", label: "React", description: "JavaScript library for building user interfaces" },
  { id: "2", label: "Vue", description: "Progressive framework for building UIs" },
  { id: "3", label: "Angular", description: "Platform for building mobile and desktop web applications" },
  { id: "4", label: "Svelte", description: "Cybernetically enhanced web apps" },
  { id: "5", label: "Next.js", description: "React framework with hybrid static & server rendering" },
];

const mockProgress = {
  stage: "processing" as const,
  progress: 65,
  bytesProcessed: 6500000,
  totalBytes: 10000000,
  estimatedTimeRemaining: 25,
};

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Enhanced Header */}
      <header className="border-b border-neutral-200 bg-neutral-25/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container-wide section-spacing-sm">
          <div className="flex items-start justify-between">
            <div className="max-w-4xl">
              <h1 className="text-display text-5xl lg:text-6xl font-bold text-primary mb-6">
                Complete UI Component Library
              </h1>
              <p className="text-body text-lg text-secondary max-w-3xl leading-relaxed">
                A comprehensive showcase of our entire UI component library, featuring enhanced
                accessibility, WCAG AAA compliance, modern interactions, and developer-focused APIs.
              </p>
            </div>

          </div>
        </div>
      </header>

      <main className="container-wide section-spacing-lg space-y-32">
        {/* Foundation Components */}
        <section>
          <div className="mb-12">
            <h2 className="text-title text-4xl font-bold text-primary mb-6 flex items-center">
              <CubeIcon className="w-10 h-10 mr-4 text-brand-500" />
              Foundation Components
            </h2>
            <p className="text-body text-lg text-secondary max-w-4xl">
              Core building blocks that form the foundation of our design system.
              These components are used throughout the application and maintain consistent styling and behavior.
            </p>
          </div>

          {/* Button System */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">Button Components</h3>

            {/* Button Variants */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-primary mb-4">Variants</h4>
              <div className="flex flex-wrap gap-4 mb-6">
                <Button variant="primary" size="lg">Primary Action</Button>
                <Button variant="secondary" size="lg">Secondary Action</Button>
                <Button variant="outline" size="lg">Outline Action</Button>
                <Button variant="ghost" size="lg">Ghost Action</Button>
                <Button variant="danger" size="lg">Danger Action</Button>
                <Button variant="gradient" size="lg">Gradient Magic</Button>
              </div>
              <div className="text-sm text-secondary space-y-1">
                <p>• All variants maintain 4.5:1+ contrast ratios</p>
                <p>• 44×44px minimum touch targets</p>
                <p>• Enhanced focus indicators and keyboard navigation</p>
              </div>
            </div>

            {/* Button Sizes */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-primary mb-4">Sizes</h4>
              <div className="flex flex-wrap items-end gap-4 mb-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            {/* Button States */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-primary mb-4">States & Features</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card padding="md">
                  <h5 className="font-semibold text-primary mb-3">Loading State</h5>
                  <Button isLoading loadingText="Processing..." className="w-full">
                    Submit
                  </Button>
                </Card>
                <Card padding="md">
                  <h5 className="font-semibold text-primary mb-3">With Icon</h5>
                  <Button icon={<StarIcon />} className="w-full">
                    Favorite
                  </Button>
                </Card>
                <Card padding="md">
                  <h5 className="font-semibold text-primary mb-3">Disabled State</h5>
                  <Button disabled className="w-full">
                    Disabled
                  </Button>
                </Card>
                <Card padding="md">
                  <h5 className="font-semibold text-primary mb-3">Full Width</h5>
                  <Button fullWidth>
                    Full Width
                  </Button>
                </Card>
              </div>
            </div>
          </div>

          {/* Input System */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">Input Components</h3>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Input
                  label="Standard Input"
                  placeholder="Enter your text..."
                  helperText="This is a helpful description"
                />

                <Input
                  label="Required Field"
                  placeholder="This field is required"
                  isRequired
                />

                <Input
                  label="Success State"
                  variant="success"
                  defaultValue="Valid input"
                  helperText="Great! This looks good."
                />

                <Input
                  label="Error State"
                  variant="error"
                  defaultValue="invalid-email"
                  error="Please enter a valid email address"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <label className="form-label">Textarea Example</label>
                  <textarea
                    className="input-field min-h-[120px] resize-y"
                    placeholder="Multi-line input with consistent styling..."
                  />
                </div>

                <div>
                  <label className="form-label">Select Dropdown</label>
                  <select className="input-field">
                    <option>Enhanced accessibility options</option>
                    <option>Option with proper contrast</option>
                    <option>WCAG AAA compliant choices</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card System */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">Card Components</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card variant="default" padding="md">
                <CardHeader>
                  <CardTitle>Standard Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Enhanced spacing with proper background hierarchy and subtle shadows for optimal content presentation.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card variant="interactive" padding="md">
                <CardHeader>
                  <CardTitle>Interactive Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Hover effects with elevation changes. Background transitions for enhanced visual feedback.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="secondary">Hover Me</Button>
                </CardFooter>
              </Card>

              <Card variant="glass" padding="md" className="backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Glass Effect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Modern glassmorphism with backdrop blur and subtle transparency effects.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline">Transparent</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Advanced Input Components */}
        <section>
          <div className="mb-12">
            <h2 className="text-title text-4xl font-bold text-primary mb-6 flex items-center">
              <AdjustmentsHorizontalIcon className="w-10 h-10 mr-4 text-accent-500" />
              Advanced Input Components
            </h2>
            <p className="text-body text-lg text-secondary max-w-4xl">
              Sophisticated input components for complex data entry and selection scenarios,
              with full accessibility support and smooth interactions.
            </p>
          </div>

          {/* Multi Select */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">Multi-Select Component</h3>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-primary mb-4">Interactive Multi-Select</h4>
                <InteractiveMultiSelect options={mockSelectOptions} />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-primary mb-4">Features</h4>
                <div className="text-sm text-secondary space-y-2">
                  <p>• ✅ Keyboard navigation (Arrow keys, Enter, Escape)</p>
                  <p>• ✅ Search/filter functionality</p>
                  <p>• ✅ Maximum selection limits</p>
                  <p>• ✅ Screen reader announcements</p>
                  <p>• ✅ Focus management</p>
                  <p>• ✅ Touch-friendly on mobile</p>
                </div>
              </div>
            </div>
          </div>

          {/* Color Picker */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">Color Picker Component</h3>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <InteractiveColorPicker />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-primary mb-4">Features</h4>
                <div className="text-sm text-secondary space-y-2">
                  <p>• ✅ Preset color swatches</p>
                  <p>• ✅ Custom color picker</p>
                  <p>• ✅ Hex value input</p>
                  <p>• ✅ Transparent background support</p>
                  <p>• ✅ Live preview</p>
                  <p>• ✅ Keyboard accessible</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback & Status Components */}
        <section>
          <div className="mb-12">
            <h2 className="text-title text-4xl font-bold text-primary mb-6 flex items-center">
              <BoltIcon className="w-10 h-10 mr-4 text-success-500" />
              Feedback & Status Components
            </h2>
            <p className="text-body text-lg text-secondary max-w-4xl">
              Components for communicating system status, progress, and user feedback
              with clear visual hierarchy and accessibility support.
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">Progress Indicators</h3>

            <div className="space-y-8">
              <Card padding="lg">
                <h4 className="font-semibold text-primary mb-6">File Processing Progress</h4>
                <ProgressIndicator
                  progress={mockProgress}
                  label="File Upload"
                />
              </Card>

              <div className="grid md:grid-cols-2 gap-8">
                <Card padding="md">
                  <h4 className="font-semibold text-primary mb-4">Loading Spinners</h4>
                  <div className="flex space-x-6 items-center">
                    <Loading size="sm" />
                    <Loading size="md" />
                    <Loading size="lg" />
                  </div>
                </Card>

                <Card padding="md">
                  <h4 className="font-semibold text-primary mb-4">Features</h4>
                  <div className="text-sm text-secondary space-y-1">
                    <p>• Real-time progress updates</p>
                    <p>• Estimated time remaining</p>
                    <p>• Screen reader announcements</p>
                    <p>• Bytes processed display</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Toast Notifications */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">Toast Notifications</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card padding="md" className="border-l-4 border-l-success-500 bg-success-50">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckIcon className="w-5 h-5 text-success-600" />
                  <span className="font-semibold text-success-900">Success Toast</span>
                </div>
                <p className="text-sm text-success-800">
                  Operation completed successfully with auto-dismiss.
                </p>
              </Card>

              <Card padding="md" className="border-l-4 border-l-warning-500 bg-warning-50">
                <div className="flex items-center space-x-2 mb-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-warning-600" />
                  <span className="font-semibold text-warning-900">Warning Toast</span>
                </div>
                <p className="text-sm text-warning-800">
                  Important notice requiring attention.
                </p>
              </Card>

              <Card padding="md" className="border-l-4 border-l-error-500 bg-error-50">
                <div className="flex items-center space-x-2 mb-3">
                  <XMarkIcon className="w-5 h-5 text-error-600" />
                  <span className="font-semibold text-error-900">Error Toast</span>
                </div>
                <p className="text-sm text-error-800">
                  Error with actionable guidance.
                </p>
              </Card>

              <Card padding="md" className="border-l-4 border-l-brand-500 bg-brand-50">
                <div className="flex items-center space-x-2 mb-3">
                  <HeartIcon className="w-5 h-5 text-brand-600" />
                  <span className="font-semibold text-brand-900">Info Toast</span>
                </div>
                <p className="text-sm text-brand-800">
                  Helpful information and updates.
                </p>
              </Card>
            </div>

            <div className="mt-8">
              <p className="text-sm text-secondary mb-4">
                Toast notifications support actions, persistence, custom duration, and accessibility features.
              </p>
            </div>
          </div>
        </section>

        {/* Loading & Skeleton States */}
        <section>
          <div className="mb-12">
            <h2 className="text-title text-4xl font-bold text-primary mb-6 flex items-center">
              <ClockIcon className="w-10 h-10 mr-4 text-warning-500" />
              Loading & Skeleton States
            </h2>
            <p className="text-body text-lg text-secondary max-w-4xl">
              Sophisticated loading states and skeleton screens that maintain layout structure
              and provide excellent user experience during data fetching.
            </p>
          </div>

          {/* Skeleton Components */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">Skeleton Loading Components</h3>

            <div className="space-y-12">
              {/* Basic Skeletons */}
              <div>
                <h4 className="font-semibold text-primary mb-6">Basic Skeleton Elements</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card padding="md">
                    <h5 className="text-sm font-medium text-secondary mb-3">Text Skeleton</h5>
                    <SkeletonLoader variant="text" lines={3} />
                  </Card>

                  <Card padding="md">
                    <h5 className="text-sm font-medium text-secondary mb-3">Avatar Skeleton</h5>
                    <div className="flex items-center space-x-3">
                      <SkeletonLoader variant="circular" className="w-12 h-12" />
                      <SkeletonLoader variant="text" className="h-4 w-24" />
                    </div>
                  </Card>

                  <Card padding="md">
                    <h5 className="text-sm font-medium text-secondary mb-3">Button Skeleton</h5>
                    <SkeletonLoader variant="button" className="w-32 h-10" />
                  </Card>

                  <Card padding="md">
                    <h5 className="text-sm font-medium text-secondary mb-3">Image Skeleton</h5>
                    <SkeletonLoader variant="rectangular" className="w-full h-24" />
                  </Card>
                </div>
              </div>

              {/* Specialized Skeletons */}
              <div>
                <h4 className="font-semibold text-primary mb-6">Specialized Skeleton Layouts</h4>

                <div className="space-y-8">
                  <div>
                    <h5 className="text-sm font-medium text-secondary mb-4">Tool Card Skeleton</h5>
                    <ToolCardSkeleton count={3} />
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-secondary mb-4">Table Skeleton</h5>
                    <TableSkeleton rows={4} columns={4} />
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-secondary mb-4">Form Skeleton</h5>
                    <FormSkeleton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance & Optimization Components */}
        <section>
          <div className="mb-12">
            <h2 className="text-title text-4xl font-bold text-primary mb-6 flex items-center">
              <CpuChipIcon className="w-10 h-10 mr-4 text-error-500" />
              Performance & Optimization
            </h2>
            <p className="text-body text-lg text-secondary max-w-4xl">
              High-performance components optimized for Core Web Vitals,
              with intelligent loading strategies and image optimization.
            </p>
          </div>

          {/* Optimized Image */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">Optimized Images</h3>

            <div className="grid md:grid-cols-2 gap-8">
              <Card padding="md">
                <h4 className="font-semibold text-primary mb-4">Responsive Images</h4>
                <div className="space-y-4">
                  <OptimizedImage
                    src="/api/placeholder/400/200"
                    alt="Example optimized image"
                    width={400}
                    height={200}
                    className="rounded-lg"
                    priority
                  />
                  <p className="text-sm text-secondary">
                    Automatic WebP/AVIF conversion, responsive sizing, and lazy loading
                  </p>
                </div>
              </Card>

              <Card padding="md">
                <h4 className="font-semibold text-primary mb-4">Features</h4>
                <div className="text-sm text-secondary space-y-2">
                  <p>• ✅ Automatic format optimization (WebP/AVIF)</p>
                  <p>• ✅ Responsive image sizing</p>
                  <p>• ✅ Lazy loading with intersection observer</p>
                  <p>• ✅ Blur placeholder support</p>
                  <p>• ✅ Priority loading for above-fold images</p>
                  <p>• ✅ Accessibility with proper alt text</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Performance Monitoring */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">Performance Monitoring</h3>

            <Card padding="lg">
              <h4 className="font-semibold text-primary mb-6">Core Web Vitals Tracking</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success-600 mb-2">2.1s</div>
                  <div className="text-sm font-medium text-primary">LCP</div>
                  <div className="text-xs text-secondary">Largest Contentful Paint</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success-600 mb-2">85ms</div>
                  <div className="text-sm font-medium text-primary">FID</div>
                  <div className="text-xs text-secondary">First Input Delay</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success-600 mb-2">0.05</div>
                  <div className="text-sm font-medium text-primary">CLS</div>
                  <div className="text-xs text-secondary">Cumulative Layout Shift</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Accessibility */}
        <section>
          <div className="mb-12">
            <h2 className="text-title text-4xl font-bold text-primary mb-6 flex items-center">
              <EyeIcon className="w-10 h-10 mr-4 text-accent-500" />
              Accessibility & Design
            </h2>
            <p className="text-body text-lg text-secondary max-w-4xl">
              Professional light theme design with accessibility features
              that exceed WCAG AAA standards.
            </p>
          </div>

          {/* Design System */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">Design Standards</h3>

            <div className="grid md:grid-cols-1 gap-8">
              <Card padding="md">
                <h4 className="font-semibold text-primary mb-4">Accessibility Features</h4>
                <div className="text-sm text-secondary space-y-2">
                  <p>• ✅ Optimized light mode design</p>
                  <p>• ✅ Enhanced contrast ratios (7:1+)</p>
                  <p>• ✅ WCAG AAA compliance</p>
                  <p>• ✅ Consistent visual hierarchy</p>
                  <p>• ✅ Focus indicators throughout</p>
                  <p>• ✅ Professional light theme</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Color System Reference */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">Enhanced Color System</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Brand Colors */}
              <Card padding="md" className="border-l-4 border-l-brand-500">
                <div className="w-12 h-12 bg-brand-500 rounded-lg mb-4"></div>
                <h4 className="font-semibold text-primary">Brand</h4>
                <p className="text-sm text-secondary">#0ea5e9</p>
                <p className="text-xs text-tertiary">Trust, Technology</p>
              </Card>

              {/* Accent Colors */}
              <Card padding="md" className="border-l-4 border-l-accent-500">
                <div className="w-12 h-12 bg-accent-500 rounded-lg mb-4"></div>
                <h4 className="font-semibold text-primary">Accent</h4>
                <p className="text-sm text-secondary">#d946ef</p>
                <p className="text-xs text-tertiary">Innovation, Creativity</p>
              </Card>

              {/* Success Colors */}
              <Card padding="md" className="border-l-4 border-l-success-500">
                <div className="w-12 h-12 bg-success-500 rounded-lg mb-4"></div>
                <h4 className="font-semibold text-primary">Success</h4>
                <p className="text-sm text-secondary">#22c55e</p>
                <p className="text-xs text-tertiary">Confirmations, Success</p>
              </Card>

              {/* Warning Colors */}
              <Card padding="md" className="border-l-4 border-l-warning-500">
                <div className="w-12 h-12 bg-warning-500 rounded-lg mb-4"></div>
                <h4 className="font-semibold text-primary">Warning</h4>
                <p className="text-sm text-secondary">#f59e0b</p>
                <p className="text-xs text-tertiary">Cautions, Notices</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Developer Experience */}
        <section>
          <div className="mb-12">
            <h2 className="text-title text-4xl font-bold text-primary mb-6 flex items-center">
              <CodeBracketIcon className="w-10 h-10 mr-4 text-success-500" />
              Developer Experience
            </h2>
            <p className="text-body text-lg text-secondary max-w-4xl">
              TypeScript-first components with comprehensive APIs, excellent developer experience,
              and extensive customization options.
            </p>
          </div>

          {/* Component API Examples */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">Component APIs</h3>

            <Card padding="lg" className="bg-neutral-800 text-neutral-100">
              <h4 className="font-semibold text-white mb-6">Button Component Example</h4>
              <pre className="text-code bg-neutral-900 text-neutral-100 p-6 rounded-xl overflow-x-auto text-sm">
                {`import { Button } from '@/components/ui/Button';

// Basic usage
<Button variant="primary" size="lg">
  Primary Action
</Button>

// With loading state
<Button 
  variant="secondary" 
  isLoading 
  loadingText="Processing..."
>
  Submit Form
</Button>

// With icon
<Button 
  variant="gradient" 
  icon={<StarIcon />}
  iconPosition="left"
>
  Add to Favorites
</Button>`}
              </pre>
            </Card>
          </div>

          {/* TypeScript Support */}
          <div className="mb-16">
            <h3 className="text-heading text-2xl font-semibold text-primary mb-8">TypeScript Support</h3>

            <div className="grid md:grid-cols-2 gap-8">
              <Card padding="md">
                <h4 className="font-semibold text-primary mb-4">Full Type Safety</h4>
                <div className="text-sm text-secondary space-y-2">
                  <p>• ✅ Comprehensive TypeScript interfaces</p>
                  <p>• ✅ Strict prop validation</p>
                  <p>• ✅ IntelliSense support</p>
                  <p>• ✅ Export of all component types</p>
                  <p>• ✅ Generic type support where applicable</p>
                </div>
              </Card>

              <Card padding="md">
                <h4 className="font-semibold text-primary mb-4">Import Structure</h4>
                <div className="text-xs font-mono bg-neutral-100 p-4 rounded-lg">
                  <p>src/components/ui/</p>
                  <p>├── Button.tsx</p>
                  <p>├── Input.tsx</p>
                  <p>├── Card.tsx</p>
                  <p>├── MultiSelect.tsx</p>
                  <p>├── ColorPicker.tsx</p>
                  <p>└── index.ts</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="text-center section-spacing-lg border-t border-neutral-200">
          <div className="mb-8">
            <h2 className="text-title text-3xl font-bold text-primary mb-6">
              Ready to Build with Our Component Library?
            </h2>
            <p className="text-body text-lg text-secondary max-w-4xl mx-auto leading-relaxed">
              Our comprehensive UI component library provides everything you need to build
              beautiful, accessible, and performant user interfaces. All components are
              TypeScript-first, WCAG AAA compliant, and optimized for modern web standards.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Button variant="gradient" size="xl" icon={<CodeBracketIcon />}>
              Start Building
            </Button>
            <Button variant="outline" size="xl" icon={<DocumentTextIcon />}>
              View Documentation
            </Button>
            <Button variant="secondary" size="xl" icon={<SwatchIcon />}>
              Design Tokens
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
