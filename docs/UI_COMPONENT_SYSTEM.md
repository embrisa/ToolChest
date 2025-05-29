# ToolChest UI Component System

> **Professional-grade UI components for modern web applications**  
> Built with Nunjucks templating, Apple-inspired design, and accessibility-first principles

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Design System](#design-system)
5. [Component Categories](#component-categories)
6. [Core Components Reference](#core-components-reference)
7. [Form Components Reference](#form-components-reference)
8. [Layout Components Reference](#layout-components-reference)
9. [Usage Patterns](#usage-patterns)
10. [Adding New Components](#adding-new-components)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)
13. [Technical Specifications](#technical-specifications)

---

## Overview

The ToolChest UI Component System is a comprehensive collection of reusable, accessible, and beautifully designed components for building modern web applications. Built on Nunjucks templating with Apple-inspired glass morphism design language, the library provides a consistent, professional foundation for user interfaces.

### Key Features

- **🎨 Apple-inspired Design** - Glass morphism, subtle shadows, and refined typography
- **📱 Mobile-first Responsive** - Optimized for all screen sizes and touch interactions
- **♿ Accessibility Compliant** - WCAG 2.1 AA standards with ARIA support
- **⚡ Performance Optimized** - Minimal CSS footprint with efficient rendering
- **🔧 Developer-friendly** - Simple API with comprehensive documentation
- **🌐 Cross-browser Compatible** - Safari, Chrome, Firefox, Edge support

### Design Principles

1. **Consistency** - Unified visual language across all components
2. **Accessibility** - Every component is keyboard navigable and screen reader friendly
3. **Performance** - Lightweight CSS and minimal JavaScript dependencies
4. **Modularity** - Components work independently or together
5. **Simplicity** - Clean APIs that are easy to understand and use

---

## Quick Start

### Installation

Import the central UI macros file in your Nunjucks template:

```nunjucks
{% from 'components/macros/ui-macros.njk' import 
   ContentContainer, Button, HeroSection, ToolCard, FormField, SearchInput %}
```

### Basic Usage

```nunjucks
{# Hero section #}
{{ HeroSection(title='Welcome to ToolChest', subtitle='Your privacy-focused toolkit') }}

{# Content container #}
{{ ContentContainer(variant='light', padding='lg') }}
  {# Tool card #}
  {{ ToolCard(tool={
    slug: 'base64-encoder',
    name: 'Base64 Encoder',
    description: 'Encode and decode Base64 data securely',
    iconClass: 'fas fa-code',
    tags: [{name: 'Encoding', color: '#6B7280'}]
  }) }}
  
  {# Button #}
  {{ Button(text='Get Started', variant='primary', size='lg', icon='fas fa-arrow-right') }}
{{ ContentContainer() }}
```

### Required Assets

Include the following CSS and JavaScript files:

```html
<!-- Core Styles -->
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/animation-utilities.css">

<!-- Interactive JavaScript -->
<script src="/js/interactive-components.js"></script>
<script src="/js/animation-utilities.js"></script>

<!-- FontAwesome Icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

---

## Architecture

```
src/templates/components/
├── macros/
│   └── ui-macros.njk          # Central import system
├── ui/                        # Core UI components
│   ├── ContentContainer.njk   # Foundation container
│   ├── Button.njk            # Interactive buttons
│   ├── IconContainer.njk     # Icon display
│   ├── HeroSection.njk       # Page headers
│   ├── ToolCard.njk          # Content cards
│   ├── TagBadge.njk          # Category indicators
│   ├── FormField.njk         # Form inputs
│   ├── DropZone.njk          # File uploads
│   ├── SearchInput.njk       # Search interfaces
│   ├── ResultDisplay.njk     # Operation results
│   └── EmptyState.njk        # Fallback displays
├── layout/                    # Layout components
│   ├── ResponsiveGrid.njk    # Grid systems
│   ├── Navigation.njk        # Navigation bars
│   ├── SectionDivider.njk    # Content separators
│   └── ErrorPage.njk         # Error displays
└── utilities/                 # Effect components
    ├── GradientText.njk      # Text effects
    ├── HoverIndicator.njk    # Interaction hints
    └── TransitionEffects.njk # Animations
```

---

## Design System

### Color Palette

The design system uses a sophisticated color scheme with CSS custom properties:

```css
/* Primary Colors */
--sand-50: #fdf7f0;    /* Light backgrounds */
--sand-100: #f7e6d3;   /* Subtle backgrounds */
--sand-200: #e8c5a0;   /* Gradient stops */
--sand-800: #8b4513;   /* Dark text */

/* Accent Colors */
--apple-blue: #007aff;  /* Primary actions */
--success: #34d399;     /* Success states */
--warning: #fbbf24;     /* Warning states */
--error: #ef4444;       /* Error states */

/* Neutral Colors */
--neutral-50: #f9fafb;  /* Lightest gray */
--neutral-500: #6b7280; /* Medium gray */
--neutral-900: #111827; /* Darkest gray */
```

### Typography

Font stack prioritizes system fonts for optimal performance:

```css
font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Scale:** `xs` (12px) → `7xl` (72px)  
**Weights:** `light` (300) → `black` (900)

### Spacing System

Consistent spacing using Tailwind-inspired scale:

```css
xs: 0.5rem (8px)   md: 1rem (16px)    xl: 1.5rem (24px)
sm: 0.75rem (12px)  lg: 1.25rem (20px) 2xl: 2rem (32px)
```

### Glass Morphism

Signature visual style with backdrop blur effects:

```css
backdrop-filter: blur(20px);
background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.2);
```

---

## Component Categories

### Core Components
Essential building blocks for any interface

- **ContentContainer** - Flexible content wrapper with glass morphism
- **Button** - Interactive buttons with variants and states
- **IconContainer** - Styled icon display with backgrounds
- **ResponsiveGrid** - Adaptive layout system

### Content Components
Components for displaying information

- **HeroSection** - Large promotional headers and tool pages
- **ToolCard** - Interactive cards for tools and features
- **TagBadge** - Category and status indicators
- **ResultDisplay** - Operation results and feedback
- **EmptyState** - No-content fallback displays

### Form Components
Interactive form elements

- **FormField** - Comprehensive form input system
- **DropZone** - Apple-style file upload with drag/drop
- **SearchInput** - Advanced search with live results

### Layout Components
Structural and navigational elements

- **Navigation** - Header navigation with search and mobile menu
- **Footer** - Site footer with links and branding
- **SectionDivider** - Content separation and organization
- **ErrorPage** - Professional error handling

### Utility Components
Effects and enhancements

- **GradientText** - Text with gradient effects and animation
- **HoverIndicator** - Subtle interaction hints
- **TransitionEffects** - Animation system with scroll triggers

---

## Core Components Reference

### ContentContainer

Flexible wrapper for content areas with consistent styling and glass morphism effects.

#### API Reference

```nunjucks
{{ ContentContainer(variant='light', padding='md', rounded=true, glass=true) }}
  <!-- Your content here -->
{{ ContentContainer() }}
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | string | `'light'` | Background style: `light`, `main`, `dark`, `transparent` |
| `padding` | string | `'md'` | Internal spacing: `sm`, `md`, `lg`, `xl` |
| `rounded` | boolean | `true` | Apply rounded corners |
| `glass` | boolean | `true` | Enable glass morphism effect |

#### Examples

```nunjucks
{# Light background with medium padding #}
{{ ContentContainer(variant='light', padding='md') }}
  <h2>Section Title</h2>
  <p>Section content goes here...</p>
{{ ContentContainer() }}

{# Dark background with large padding #}
{{ ContentContainer(variant='dark', padding='lg') }}
  <div class="text-white">Dark themed content</div>
{{ ContentContainer() }}

{# Transparent background without glass effect #}
{{ ContentContainer(variant='transparent', glass=false) }}
  <div>Minimal container</div>
{{ ContentContainer() }}
```

### Button

Interactive button component with multiple variants, sizes, and states.

#### API Reference

```nunjucks
{{ Button(text='Click me', variant='primary', size='md', icon='fas fa-check') }}
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | string | required | Button label text |
| `variant` | string | `'primary'` | Style: `primary`, `secondary`, `danger`, `outline`, `ghost` |
| `size` | string | `'md'` | Size: `sm`, `md`, `lg` |
| `icon` | string | `null` | FontAwesome icon class |
| `iconPosition` | string | `'left'` | Icon placement: `left`, `right` |
| `fullWidth` | boolean | `false` | Expand to full container width |
| `loading` | boolean | `false` | Show loading spinner |
| `disabled` | boolean | `false` | Disable interaction |
| `href` | string | `null` | Link destination (renders as `<a>`) |
| `type` | string | `'button'` | Button type for forms |

#### Specialized Variants

```nunjucks
{# Icon-only button #}
{{ IconButton(icon='fas fa-plus', variant='secondary', size='md') }}

{# Button group #}
{{ ButtonGroup(align='center') }}
  {{ Button(text='Option 1', variant='outline') }}
  {{ Button(text='Option 2', variant='outline') }}
  {{ Button(text='Option 3', variant='primary') }}
{{ ButtonGroup() }}
```

#### Examples

```nunjucks
{# Primary action button #}
{{ Button(text='Get Started', variant='primary', size='lg', icon='fas fa-arrow-right') }}

{# Secondary button with loading state #}
{{ Button(text='Processing...', variant='secondary', loading=true) }}

{# Danger button for destructive actions #}
{{ Button(text='Delete Account', variant='danger', icon='fas fa-trash') }}

{# Full-width button #}
{{ Button(text='Continue', variant='primary', fullWidth=true) }}

{# Link button #}
{{ Button(text='Learn More', variant='outline', href='/documentation') }}
```

### IconContainer

Styled container for icons with consistent backgrounds and sizing.

#### API Reference

```nunjucks
{{ IconContainer(size='lg', icon='fas fa-toolbox', variant='sand') }}
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `size` | string | `'md'` | Container size: `sm`, `md`, `lg`, `xl`, `2xl` |
| `icon` | string | required | FontAwesome icon class |
| `variant` | string | `'sand'` | Color scheme: `sand`, `apple-blue`, `sunset`, `neutral`, `transparent` |
| `rounded` | string | `'2xl'` | Border radius: `lg`, `xl`, `2xl`, `3xl` |
| `href` | string | `null` | Link destination |

#### Examples

```nunjucks
{# Tool icon for cards #}
{{ IconContainer(size='lg', icon='fas fa-code', variant='sand') }}

{# Status indicator icon #}
{{ IconContainer(size='sm', icon='fas fa-check', variant='success') }}

{# Clickable icon #}
{{ IconContainer(
  size='md', 
  icon='fas fa-settings', 
  variant='neutral',
  href='/settings'
) }}
```

### ResponsiveGrid

Adaptive grid layout system with breakpoint-based column control.

#### API Reference

```nunjucks
{{ ResponsiveGrid(cols={mobile: 1, md: 2, lg: 3}, gap='md') }}
  <div>Grid item 1</div>
  <div>Grid item 2</div>
  <div>Grid item 3</div>
{{ ResponsiveGrid() }}
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `cols` | object | `{mobile: 1, md: 2, lg: 3}` | Columns per breakpoint |
| `gap` | string | `'md'` | Grid gap: `sm`, `md`, `lg`, `xl` |

#### Examples

```nunjucks
{# Tool grid layout #}
{{ ResponsiveGrid(cols={mobile: 1, md: 2, lg: 3, xl: 4}, gap='lg') }}
  {% for tool in tools %}
    {{ ToolCard(tool=tool) }}
  {% endfor %}
{{ ResponsiveGrid() }}

{# Auto-sizing grid based on content #}
{{ AutoGrid(minWidth='280px', gap='lg') }}
  <div>Auto-sizing item 1</div>
  <div>Auto-sizing item 2</div>
{{ AutoGrid() }}
```

---

## Form Components Reference

### FormField

Comprehensive form field component supporting all input types with validation and accessibility.

#### API Reference

```nunjucks
{{ FormField(
  type='text', 
  name='username', 
  label='Username', 
  placeholder='Enter username', 
  required=true
) }}
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `'text'` | Input type: `text`, `email`, `password`, `textarea`, `select`, `checkbox`, `radio`, `file` |
| `name` | string | required | Form field name |
| `label` | string | `null` | Field label |
| `placeholder` | string | `null` | Placeholder text |
| `required` | boolean | `false` | Required field validation |
| `disabled` | boolean | `false` | Disable field |
| `value` | string | `null` | Default value |
| `options` | array | `null` | Options for select/radio fields |
| `helpText` | string | `null` | Help text below field |
| `errorMessage` | string | `null` | Validation error message |

#### Specialized Input Components

```nunjucks
{# Text inputs #}
{{ TextInput(name='title', label='Title', placeholder='Enter title') }}
{{ EmailInput(name='email', label='Email Address', required=true) }}
{{ PasswordInput(name='password', label='Password', showToggle=true) }}

{# Selection inputs #}
{{ SelectField(name='category', options=['Option 1', 'Option 2'], label='Category') }}
{{ RadioGroup(name='type', options=['Type A', 'Type B'], label='Select Type') }}

{# Text areas #}
{{ TextareaField(name='description', label='Description', rows=4) }}

{# Checkboxes #}
{{ CheckboxField(name='agree', label='I agree to the terms') }}
```

### DropZone

Apple-style file upload component with drag-and-drop functionality.

#### API Reference

```nunjucks
{{ DropZone(name='file', accept='image/*', multiple=true, maxSize='5MB') }}
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | required | Form field name |
| `accept` | string | `null` | Accepted file types |
| `multiple` | boolean | `false` | Allow multiple files |
| `maxSize` | string | `null` | Maximum file size (e.g., '5MB') |
| `maxFiles` | number | `null` | Maximum number of files |
| `required` | boolean | `false` | Required field validation |
| `preview` | boolean | `true` | Show file previews |

#### Specialized Variants

```nunjucks
{# Image upload with preview #}
{{ ImageDropZone(name='photo', multiple=false, required=true) }}

{# Document upload #}
{{ DocumentDropZone(name='documents', multiple=true, maxFiles=3) }}

{# Hero-style dropzone #}
{{ HeroDropZone(name='files', multiple=true, maxSize='100MB') }}
```

### SearchInput

Advanced search component with HTMX integration and live results.

#### API Reference

```nunjucks
{{ SearchInput(
  name='search', 
  placeholder='Search...', 
  target='#results', 
  endpoint='/search'
) }}
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | required | Form field name |
| `placeholder` | string | `'Search...'` | Placeholder text |
| `target` | string | `null` | HTMX target selector |
| `endpoint` | string | `null` | Search endpoint URL |
| `debounce` | number | `300` | Search delay in milliseconds |
| `minLength` | number | `1` | Minimum characters to trigger search |
| `maxResults` | number | `10` | Maximum results to display |

#### Specialized Variants

```nunjucks
{# Navigation search #}
{{ NavbarSearch(name='q', placeholder='Search tools...', target='#tool-grid') }}

{# Hero search #}
{{ HeroSearch(name='search', placeholder='What are you looking for?', showSearchButton=true) }}

{# Live search with autocomplete #}
{{ LiveSearch(name='livesearch', endpoint='/api/live-search', minLength=2) }}
```

---

## Layout Components Reference

### Navigation

Comprehensive navigation system with responsive behavior and search integration.

#### API Reference

```nunjucks
{{ Navbar({
  brand: { text: 'MyApp', href: '/', showLogo: true },
  search: { enabled: true, placeholder: 'Search...', width: 'md' },
  navigation: {
    items: [
      { text: 'Home', href: '/', active: true },
      { text: 'About', href: '/about', icon: 'fas fa-info' }
    ]
  }
}) }}
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `brand` | object | Brand configuration: `text`, `href`, `showLogo` |
| `search` | object | Search settings: `enabled`, `placeholder`, `width`, `endpoint` |
| `navigation` | object | Navigation items and mobile menu settings |
| `sticky` | boolean | Enable sticky positioning |
| `glass` | boolean | Apply glass morphism effect |

### ErrorPage

Professional error page system with auto-configuration by HTTP status code.

#### API Reference

```nunjucks
{{ ErrorPage({
  statusCode: 404,
  title: 'Page Not Found',
  message: 'The page you requested does not exist.',
  variant: 'illustrated'
}) }}
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `statusCode` | number | required | HTTP status code |
| `title` | string | auto | Error page title |
| `message` | string | auto | Error description |
| `variant` | string | `'modern'` | Visual style: `modern`, `minimal`, `illustrated` |
| `showBack` | boolean | `true` | Show back button |
| `showHome` | boolean | `true` | Show home button |

#### Shortcut Components

```nunjucks
{{ Error404(title='Custom 404', showBack=true) }}
{{ Error500(title='Server Error', showDetails=false) }}
{{ Error403(title='Access Denied', loginUrl='/login') }}
```

---

## Usage Patterns

### Pattern 1: Simple Component Usage

```nunjucks
{# Import what you need #}
{% from 'components/macros/ui-macros.njk' import ContentContainer, Button %}

{# Use with default settings #}
{{ ContentContainer() }}
  {{ Button(text='Click me') }}
{{ ContentContainer() }}
```

### Pattern 2: Customized Components

```nunjucks
{# Customize appearance and behavior #}
{{ ContentContainer(variant='dark', padding='xl', glass=false) }}
  {{ Button(
    text='Custom Button',
    variant='secondary',
    size='lg',
    icon='fas fa-star',
    fullWidth=true
  ) }}
{{ ContentContainer() }}
```

### Pattern 3: Complex Layouts

```nunjucks
{% from 'components/macros/ui-macros.njk' import ContentContainer, ResponsiveGrid, ToolCard %}

{{ ContentContainer(variant='light') }}
  {{ ResponsiveGrid(cols={mobile: 1, md: 2, lg: 3}, gap='lg') }}
    {% for tool in tools %}
      {{ ToolCard(tool=tool) }}
    {% endfor %}
  {{ ResponsiveGrid() }}
{{ ContentContainer() }}
```

### Pattern 4: Form Layouts

```nunjucks
{% from 'components/macros/ui-macros.njk' import ContentContainer, FormField, Button %}

{{ ContentContainer(variant='light', padding='lg') }}
  <form>
    {{ FormField(type='text', name='name', label='Full Name', required=true) }}
    {{ FormField(type='email', name='email', label='Email Address', required=true) }}
    {{ FormField(type='textarea', name='message', label='Message', rows=4) }}
    {{ Button(text='Send Message', variant='primary', fullWidth=true) }}
  </form>
{{ ContentContainer() }}
```

---

## Adding New Components

### Step 1: Create the Component File

Create a new `.njk` file in the appropriate category directory:

```nunjucks
{# src/templates/components/ui/MyComponent.njk #}

{#
  MyComponent
  Purpose: Brief description of what this component does
  
  Props:
  - title (string, required): The component title
  - variant ('primary' | 'secondary', default: 'primary'): Visual style
  - size ('sm' | 'md' | 'lg', default: 'md'): Component size
  - className (string, optional): Additional CSS classes
#}

{% macro MyComponent(title, variant='primary', size='md', className='') %}
  {# Define variant classes #}
  {% set variantClasses = {
    'primary': 'bg-sand-100 text-sand-800',
    'secondary': 'bg-neutral-100 text-neutral-800'
  } %}
  
  {# Define size classes #}
  {% set sizeClasses = {
    'sm': 'text-sm p-2',
    'md': 'text-base p-4',
    'lg': 'text-lg p-6'
  } %}
  
  <div class="my-component {{ variantClasses[variant] }} {{ sizeClasses[size] }} {{ className }}">
    <h3>{{ title }}</h3>
    {{ caller() if caller else '' }}
  </div>
{% endmacro %}
```

### Step 2: Add to ui-macros.njk

Import and re-export the component in the central macro file:

```nunjucks
{# Import the actual macro #}
{% from 'components/ui/MyComponent.njk' import MyComponent as _MyComponent %}

{# Re-export macro #}
{% macro MyComponent(title, variant='primary', size='md', className='') %}
  {{ _MyComponent(title, variant, size, className) }}
{% endmacro %}
```

### Step 3: Add CSS Styles

Add component styles to `src/public/css/main.css`:

```css
/* MyComponent Styles */
.my-component {
  border-radius: 0.75rem;
  transition: all 0.2s ease-out;
  backdrop-filter: blur(20px);
}

.my-component:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
```

### Step 4: Document Usage

Add usage examples to this documentation:

```nunjucks
{# Basic usage #}
{{ MyComponent(title='Hello World') }}

{# Advanced usage #}
{{ MyComponent(title='Custom Component', variant='secondary', size='lg') }}
  <p>Custom content inside the component</p>
{{ MyComponent() }}
```

---

## Best Practices

### Component Design

- **Keep components focused** - Each component should have a single responsibility
- **Use consistent naming** - Follow the established naming conventions
- **Provide sensible defaults** - Components should work with minimal configuration
- **Support customization** - Allow overriding of styles and behavior

### Parameter Design

```nunjucks
{# Good: Clear parameter names and types #}
{% macro Button(text, variant='primary', size='md', disabled=false) %}

{# Bad: Unclear or abbreviated names #}
{% macro Button(t, v='p', sz='m', dis=false) %}
```

### CSS Class Structure

```css
/* Good: Structured class naming */
.component-name {
  /* Base styles */
}

.component-name--variant-primary {
  /* Variant-specific styles */
}

.component-name__element {
  /* Sub-element styles */
}
```

### Accessibility Guidelines

1. **Use semantic HTML** - Components generate proper HTML5 elements
2. **Provide labels** - Always include `label` parameters for form fields
3. **Support keyboard navigation** - All interactive elements are keyboard accessible
4. **Include ARIA attributes** - Components automatically add appropriate ARIA labels
5. **Test with screen readers** - Verify content is properly announced

### Performance Optimization

1. **Minimize component nesting** - Use flat structures when possible
2. **Lazy load animations** - TransitionEffects support scroll-based triggering
3. **Optimize images** - Use appropriate file formats and sizes
4. **Cache static assets** - CSS and JS files should be cached
5. **Use CDN for icons** - FontAwesome loads from CDN for better performance

---

## Troubleshooting

### Common Issues

#### 1. "Cannot import 'ComponentName'" Error

**Problem**: Component is not properly exported from ui-macros.njk

**Solution**: Ensure the component is imported and re-exported:

```nunjucks
{# In ui-macros.njk #}
{% from 'components/ui/MyComponent.njk' import MyComponent as _MyComponent %}

{% macro MyComponent(params...) %}
  {{ _MyComponent(params...) }}
{% endmacro %}
```

#### 2. "Expected variable end" Error

**Problem**: Complex nested conditionals in template attributes

**Solution**: Break complex conditionals into separate variable assignments:

```nunjucks
{# Bad: Complex nested conditionals #}
<div class="{{ 'class1' if condition1 else ('class2' if condition2 else 'class3') }}">

{# Good: Separate variable assignment #}
{% if condition1 %}
  {% set classes = 'class1' %}
{% elif condition2 %}
  {% set classes = 'class2' %}
{% else %}
  {% set classes = 'class3' %}
{% endif %}
<div class="{{ classes }}">
```

#### 3. "Unexpected token: :" Error - Object Literal Syntax

**Problem**: JavaScript object literal syntax is not supported in Nunjucks templates

**This is a critical limitation that can cause confusing errors where the line number reported doesn't match the actual file.**

**❌ Problematic Patterns:**
```nunjucks
{# These will cause "unexpected token: :" errors #}

{# 1. Object literals in macro parameters #}
{% macro MyComponent(config={mobile: 1, md: 2, lg: 3}) %}

{# 2. Object literals in variable assignments #}
{% set gridCols = {mobile: 1, md: 2, lg: 3} %}

{# 3. Object literals in set statements #}
{% set colors = {'primary': '#ff0000', 'secondary': '#00ff00'} %}

{# 4. Complex object construction #}
{% set options = {name: 'value', count: 5} %}
```

**✅ Correct Approaches:**
```nunjucks
{# Use null defaults and conditional assignment #}
{% macro ResponsiveGrid(cols=null, gap='md') %}
  {% if not cols %}
    {% set mobileCol = 1 %}
    {% set mdCol = 2 %}
    {% set lgCol = 3 %}
  {% else %}
    {% set mobileCol = cols.mobile or 1 %}
    {% set mdCol = cols.md or 2 %}
    {% set lgCol = cols.lg or 3 %}
  {% endif %}
{% endmacro %}

{# Use conditional logic instead of object lookups #}
{% if gap == 'sm' %}
  {% set gapClass = 'gap-4' %}
{% elif gap == 'lg' %}
  {% set gapClass = 'gap-8' %}
{% else %}
  {% set gapClass = 'gap-6' %}
{% endif %}

{# Pass individual parameters instead of objects #}
{{ ResponsiveGrid(gap='lg') }}  {# ✅ Good #}
{{ ResponsiveGrid(cols=gridConfig, gap='lg') }}  {# ❌ Avoid if gridConfig contains object literals #}
```

**Debugging Tips for Object Literal Errors:**
1. **Line Number Mismatch**: If Nunjucks reports an error on a line that doesn't exist in your file, the error is likely in an imported component
2. **Check Imports**: Look at all `{% from %}` statements and check each imported component
3. **Search for Colons**: Use `grep -r ":" src/templates/` to find object literal patterns
4. **Simplify Incrementally**: Remove component imports one by one to isolate the problematic component
5. **Use Simple Variables**: Replace object literals with individual variables and conditional logic

**Safe Alternatives:**
```nunjucks
{# Instead of object literals, use individual variables #}
{% set primaryColor = '#ff0000' %}
{% set secondaryColor = '#00ff00' %}

{# Instead of object methods, use conditional statements #}
{% if variant == 'primary' %}
  {% set bgColor = primaryColor %}
{% else %}
  {% set bgColor = secondaryColor %}
{% endif %}

{# Pass data from the backend as structured objects #}
{# Let the controller/service handle object construction #}
{{ ToolCard(tool=tool) }}  {# tool object comes from backend #}
```

#### 4. Styles Not Applied

**Problem**: CSS classes not loading or conflicting

**Solutions**:
- Ensure CSS files are included in the correct order
- Check for CSS specificity conflicts
- Verify Tailwind classes are available
- Clear browser cache

#### 5. JavaScript Functionality Not Working

**Problem**: Interactive components not responding

**Solutions**:
- Include the interactive-components.js script
- Check browser console for JavaScript errors
- Ensure HTMX is loaded for dynamic components
- Verify event handlers are properly attached

#### 6. Grid Components Not Rendering Inside Container

**Problem**: Tool cards or other components render outside the grid container, causing layout issues

**This is a critical macro usage pattern that can be easily missed and is hard to debug.**

**Symptoms:**
- HTML shows empty `<div class="grid-cards"></div>` container
- Components render after the closing `</div>` tag instead of inside
- Grid CSS has no effect because components aren't in the grid container
- Layout appears broken with components stacking vertically

**Root Cause**: Incorrect usage of Nunjucks macro patterns with components that expect nested content

**❌ Incorrect Pattern:**
```nunjucks
{# This renders components OUTSIDE the grid container #}
{% macro ToolCardGrid(tools, variant='modern') %}
  {% if tools and tools|length > 0 %}
    {{ ResponsiveGrid(variant='cards') }}
      {% for tool in tools %}
        {{ ToolCard(tool=tool, variant=variant) }}
      {% endfor %}
    {{ ResponsiveGrid() }}
  {% endif %}
{% endmacro %}
```

**Resulting HTML:**
```html
<div class="grid-cards">
  <!-- Empty! -->
</div>
<!-- Components render here instead -->
<a href="/tool1" class="tool-card...">...</a>
<a href="/tool2" class="tool-card...">...</a>
```

**✅ Correct Pattern:**
```nunjucks
{# This renders components INSIDE the grid container #}
{% macro ToolCardGrid(tools, variant='modern') %}
  {% if tools and tools|length > 0 %}
    {% call ResponsiveGrid(variant='cards') %}
      {% for tool in tools %}
        {{ ToolCard(tool=tool, variant=variant) }}
      {% endfor %}
    {% endcall %}
  {% endif %}
{% endmacro %}
```

**Resulting HTML:**
```html
<div class="grid-cards">
  <a href="/tool1" class="tool-card...">...</a>
  <a href="/tool2" class="tool-card...">...</a>
  <a href="/tool3" class="tool-card...">...</a>
</div>
```

**Key Differences:**
1. **Use `{% call %}` instead of `{{ }}`** - The `call` syntax allows nested content
2. **Use `{% endcall %}` instead of second macro call** - Properly closes the macro with nested content
3. **The ResponsiveGrid macro expects nested content via `caller()`** - It won't work with the standard macro call syntax

**How ResponsiveGrid Works:**
```nunjucks
{% macro ResponsiveGrid(variant='cards', className='') %}
  <div class="{{ baseClasses }} {{ className }}">
    {{ caller() if caller else '' }}  {# This renders nested content #}
  </div>
{% endmacro %}
```

**General Rule for Container Components:**
- If a component is designed to wrap other content (like grids, containers, sections)
- And it uses `{{ caller() }}` in its implementation
- Then you MUST use the `{% call %}...{% endcall %}` syntax

**Debugging This Issue:**
1. **Check HTML output** - Look for empty containers followed by misplaced components
2. **Identify container components** - Look for macros that use `{{ caller() }}`
3. **Review macro usage** - Ensure container components use `{% call %}`
4. **Test incrementally** - Remove components one by one to isolate the issue

**Other Components That Require `{% call %}` Syntax:**
```nunjucks
{# ContentContainer #}
{% call ContentContainer(variant='light') %}
  <p>Content goes here</p>
{% endcall %}

{# AutoGrid #}
{% call AutoGrid(minWidth='280px') %}
  <div>Grid item 1</div>
  <div>Grid item 2</div>
{% endcall %}

{# ButtonGroup #}
{% call ButtonGroup(align='center') %}
  {{ Button(text='Option 1') }}
  {{ Button(text='Option 2') }}
{% endcall %}
```

**Prevention Tips:**
1. **Read component documentation** - Check if a component expects nested content
2. **Look for `caller()` in macro implementation** - This indicates `{% call %}` is required
3. **Test with simple content first** - Verify container components work before adding complex nested components
4. **Use browser DevTools** - Inspect HTML structure to verify components are in the right place

---

## Nunjucks Best Practices

### Template Organization

1. **Keep components simple** - Avoid complex object manipulation in templates
2. **Use backend data structures** - Let controllers prepare complex objects
3. **Prefer individual parameters** - Instead of passing large configuration objects
4. **Use conditional logic** - Replace object lookups with if/else statements

### Data Handling

```nunjucks
{# ✅ Preferred: Backend provides structured data #}
{% for tool in popularTools %}
  {{ ToolCard(tool=tool) }}
{% endfor %}

{# ✅ Good: Simple parameter passing #}
{{ Button(text='Click Me', variant='primary', size='lg') }}

{# ❌ Avoid: Complex object construction in templates #}
{% set buttonConfig = {text: 'Click Me', variant: 'primary', size: 'lg'} %}
{{ Button(config=buttonConfig) }}
```

### Error Prevention

1. **Test incrementally** - Add components one at a time
2. **Use linting** - Set up Nunjucks linting if available
3. **Document limitations** - Note any template constraints in component comments
4. **Validate in multiple browsers** - Test cross-browser compatibility

### Debugging Workflow

When encountering template errors:

1. **Check the exact error message** - Note line numbers and error types
2. **Identify the failing component** - Use the import elimination method
3. **Search for problematic patterns** - Look for object literals, complex expressions
4. **Simplify the component** - Remove complex logic step by step
5. **Test isolated components** - Create minimal test templates
6. **Document the solution** - Add notes for future reference

---

## Technical Specifications

### Browser Support

| Browser | Version | Support Level |
|---------|---------|---------------|
| Safari | 14+ | Full support with glass morphism |
| Chrome | 88+ | Full support |
| Firefox | 87+ | Full support with fallbacks |
| Edge | 88+ | Full support |

### Dependencies

- **Nunjucks** - Template engine (required)
- **FontAwesome** - Icon library (required)
- **Tailwind CSS** - Utility classes (via CDN)
- **HTMX** - Dynamic interactions (optional)

### File Structure

```
src/
├── templates/
│   └── components/
│       ├── ui/              # Core UI components
│       ├── layout/          # Layout components
│       ├── utilities/       # Utility components
│       └── macros/          # Central imports
├── public/
│   ├── css/
│   │   ├── main.css         # Core styles
│   │   └── animation-utilities.css
│   └── js/
│       ├── interactive-components.js
│       └── animation-utilities.js
```

### CSS Custom Properties

The component library uses CSS custom properties for theming:

```css
:root {
  /* Glass Morphism */
  --glass-bg: rgba(254, 247, 237, 0.08);
  --glass-border: rgba(254, 247, 237, 0.08);
  
  /* Colors */
  --sand-100: #f7e6d3;
  --sand-800: #8b4513;
  --apple-blue: #007aff;
  
  /* Spacing */
  --spacing-md: 1rem;
  --spacing-lg: 1.25rem;
  
  /* Typography */
  --font-size-lg: 1.125rem;
  --font-weight-semibold: 600;
  
  /* Effects */
  --backdrop-blur: blur(20px);
  --glass-border: rgba(255, 255, 255, 0.2);
}
```

### JavaScript API

Interactive components provide programmatic APIs:

```javascript
// Initialize dropzone
const dropzone = new DropZone('#file-upload', {
  accept: 'image/*',
  onUpload: (files) => console.log('Files uploaded:', files)
});

// Trigger animations
animationUtils.scrollReveal('.animate-on-scroll');
animationUtils.textAnimation('#animated-heading', 'typewriter');
```

### Component API Standards

All components follow these API patterns:

1. **Required parameters first** - Most important parameters come first
2. **Sensible defaults** - Components work with minimal configuration
3. **Consistent naming** - Similar parameters use the same names across components
4. **Optional className** - All components accept additional CSS classes
5. **Caller() support** - Components support nested content where appropriate

### File Naming Conventions

- **Component files**: PascalCase (e.g., `ContentContainer.njk`)
- **CSS classes**: kebab-case (e.g., `content-container`)
- **JavaScript functions**: camelCase (e.g., `initializeComponent`)
- **Asset files**: kebab-case (e.g., `main.css`, `interactive-components.js`)

---

This component system provides a comprehensive foundation for building consistent, accessible, and beautiful user interfaces in the ToolChest application. For questions or contributions, please refer to the main project documentation. 