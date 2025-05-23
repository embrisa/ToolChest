## `<TC>` | ToolChest UI Theme Documentation

**Version:** 4
**Last Updated:** January 2025
**Project Alignment:** ToolChest Project Architecture & UX Goals

### Mission

To deliver a privacy-respecting toolbox of utilities inside a sophisticated, Apple-inspired interface that combines warm sunset aesthetics with professional glass morphism. Built for fast Server-Side Rendering, graceful degradation with HTMX enhancement, and premium user experience across all devices.

-----

### 1\. Brand Essence & Design Philosophy

  * **Apple-Inspired Sophistication:** Clean, minimal interface with sophisticated glass morphism, subtle depth, and refined interactions
  * **Sunset-to-Sea Harmony:** Warm sand and sunset tones as primary palette, complemented by elegant blue accents for trust and sophistication
  * **Professional Warmth:** Balances approachable sunset warmth with business-grade refinement
  * **Invisible Interface:** Borders and UI chrome are present but nearly imperceptible, focusing attention on content
  * **Premium Glass Materials:** Advanced backdrop-filter effects with multi-layered shadows and inset highlights
  * **Utility-First Functionality:** Every design element serves a functional purpose while maintaining visual elegance

-----

### 2\. Enhanced Color System

Colors are managed via CSS custom properties in `src/public/css/main.css` with a comprehensive design token system for consistent application.

#### Primary Sand/Sunset Palette

| Token         | Hex       | Purpose                               |
| :------------ | :-------- | :------------------------------------ |
| `--sand-50`   | `#FEF7ED` | Lightest cream - card backgrounds     |
| `--sand-100`  | `#FDF2E3` | Very light beige - subtle highlights  |
| `--sand-200`  | `#FCE1C4` | Light beige - hover states           |
| `--sand-300`  | `#F9C896` | Warm sand - primary accents          |
| `--sand-400`  | `#F5A867` | Medium sand - primary buttons        |
| `--sand-500`  | `#E8955E` | Rich sand - active states            |
| `--sand-600`  | `#D67C47` | Deep sand - emphasis                 |
| `--sand-700`  | `#B85D2A` | Dark sand - headings                 |
| `--sand-800`  | `#8B4513` | Saddle brown - strong contrast       |

#### Complementary Sunset Orange

| Token           | Hex       | Purpose                           |
| :-------------- | :-------- | :-------------------------------- |
| `--sunset-400`  | `#FF8C42` | Warm orange - call-to-action     |
| `--sunset-500`  | `#FF7733` | Main orange - primary brand      |
| `--sunset-600`  | `#E55B22` | Deep orange - hover states       |
| `--sunset-700`  | `#CC4A1A` | Darker orange - active states    |

#### Professional Neutrals (High Contrast)

| Token           | Hex       | Purpose                           |
| :-------------- | :-------- | :-------------------------------- |
| `--neutral-50`  | `#FAFAF9` | Pure white alternative           |
| `--neutral-100` | `#F5F5F4` | Off-white backgrounds            |
| `--neutral-200` | `#E7E5E4` | Light borders                    |
| `--neutral-300` | `#D6D3D1` | Subtle borders                   |
| `--neutral-400` | `#A8A29E` | Muted text                       |
| `--neutral-500` | `#78716C` | Secondary text                   |
| `--neutral-600` | `#57534E` | Body text                        |
| `--neutral-700` | `#44403C` | Headings                         |
| `--neutral-800` | `#292524` | Strong headings                  |
| `--neutral-900` | `#1C1917` | Darkest text                     |

#### Dark Theme Foundation

| Token         | Hex       | Purpose                               |
| :------------ | :-------- | :------------------------------------ |
| `--dark-900`  | `#0F0A08` | Deep brown-black - main background    |
| `--dark-800`  | `#1A1510` | Slightly lighter - containers         |
| `--dark-700`  | `#2A221B` | Card backgrounds with transparency    |

#### Enhanced Gradient System

**Accent Gradient (Logo & Heroes):**
```css
--accent-gradient: linear-gradient(135deg,
    #FCD34D 0%,     /* Golden start */
    #F9C896 20%,    /* Warm sand */
    #F5A867 40%,    /* Medium sand */
    #E8955E 60%,    /* Rich sand */
    #6FB8FF 80%,    /* Sky blue hint */
    #338DFF 100%    /* Ocean blue end */
);
```

**Cosmic Background:**
```css
--spacey-bg: 
    radial-gradient(ellipse at 75% -10%, rgba(51, 141, 255, 0.3) 0%, transparent 60%),
    radial-gradient(circle at 25% 90%, rgba(111, 184, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 10% 80%, rgba(245, 168, 103, 0.2) 0%, transparent 40%),
    radial-gradient(circle at 90% 40%, rgba(252, 211, 77, 0.15) 0%, transparent 45%),
    radial-gradient(circle at 50% 70%, rgba(180, 83, 9, 0.1) 0%, transparent 35%),
    linear-gradient(135deg, var(--dark-900) 0%, var(--dark-800) 100%);
```

-----

### 3\. Typography System

  * **Primary Font:** `Inter` (weights 400, 600, 700, 800) with system font fallbacks
  * **Typography Scale:** CSS custom properties for consistent sizing
    - `--font-size-xs` through `--font-size-4xl`
    - Responsive scaling on larger screens
  * **Hierarchy:** Clear visual distinction using color and weight
    - H1: `--sand-100` - Lightest, most prominent
    - H2: `--sand-200` - Secondary headings
    - H3: `--sand-300` - Tertiary headings
    - Body: `--neutral-200` - High contrast readability
    - Muted: `--neutral-400` - Secondary information
  * **Line Height:** Optimized for readability (1.6 base, 1.7 on large screens)

-----

### 4\. Apple-Inspired Component Architecture

#### Glass Morphism Foundation
All components use sophisticated glass effects with:
- **Advanced Backdrop Filter:** 16-24px blur for premium feel
- **Multi-layered Shadows:** Inset highlights + depth shadows
- **Subtle Borders:** Ultra-low opacity (0.04-0.08) for structure without harshness
- **Warm Transparency:** Brown/amber base colors instead of cold grays

#### Core Components

**Logo (`.logo`):**
- Sunset-to-blue gradient with enhanced drop-shadow
- Smooth hover transitions with depth changes

**Content Containers (`.content-container`):**
- Apple-style glass with warm brown transparency
- Inset highlight on top edge
- Multi-layered shadow system for floating appearance

**Tool Cards (`.tool-card`):**
- Refined glass effect with subtle depth
- Blue-tinted hover borders for sophistication
- Smooth elevation on interaction

**Navigation (`.navbar`, Admin Sidebar):**
- Ultra-subtle borders (0.04 opacity)
- Warm glass backgrounds
- Apple-style focus and hover states

#### Form Elements
- **Refined Glass Inputs:** Inset shadows with sophisticated focus rings
- **Apple-Style Focus:** Soft blue glow instead of harsh outlines
- **Consistent Materials:** All form elements feel made from same "glass"
- **Professional Validation:** Subtle error states that don't jar

#### Button System
- **Primary:** Gradient backgrounds with inset highlights
- **Secondary:** Glass appearance with backdrop blur
- **Sophisticated Elevation:** Multi-layered shadows on hover
- **Smooth Interactions:** 0.2s ease transitions throughout

-----

### 5\. CSS Reset & Accessibility

#### Comprehensive Browser Reset
- **Complete Form Reset:** All input types, buttons, selects normalized
- **Cross-Browser Consistency:** Eliminates browser-specific styling
- **Accessibility-First:** Maintains focus states and screen reader support
- **Modern Approach:** Uses contemporary reset practices

#### Accessibility Features
- **High Contrast:** All text meets WCAG AA standards
- **Focus Management:** Visible focus indicators with proper contrast
- **Reduced Motion:** Respects user preferences for motion
- **Screen Reader Support:** Semantic HTML with proper ARIA labels
- **Keyboard Navigation:** Full keyboard accessibility

-----

### 6\. Design Token System

#### Spacing Scale
```css
--space-1: 0.25rem;    /* 4px - Tight spacing */
--space-2: 0.5rem;     /* 8px - Small gaps */
--space-3: 0.75rem;    /* 12px - Medium spacing */
--space-4: 1rem;       /* 16px - Standard spacing */
--space-6: 1.5rem;     /* 24px - Large spacing */
--space-8: 2rem;       /* 32px - Extra large */
--space-12: 3rem;      /* 48px - Section spacing */
```

#### Border Radius Scale
```css
--radius-sm: 0.375rem;  /* 6px - Small elements */
--radius-md: 0.5rem;    /* 8px - Standard */
--radius-lg: 0.75rem;   /* 12px - Cards */
--radius-xl: 1rem;      /* 16px - Containers */
```

#### Shadow System
```css
--shadow-sm: /* Subtle depth */
--shadow-md: /* Standard elevation */
--shadow-lg: /* Prominent floating */
--shadow-xl: /* Maximum elevation */
```

-----

### 7\. Performance & Technical Excellence

  * **SSR-First:** Nunjucks templates with CSS-only effects
  * **Progressive Enhancement:** HTMX for dynamic behavior
  * **Optimized Shadows:** Hardware-accelerated where possible
  * **Efficient Backdrop-Filter:** Strategic use for performance
  * **Mobile-Optimized:** Responsive spacing and interaction targets
  * **Build-Ready:** Can integrate with Tailwind build process if needed

-----

### 8\. Implementation Guidelines

#### CSS Architecture
- **Custom Properties:** All design tokens as CSS variables
- **Layered Approach:** Reset → Design System → Components → Utilities
- **Apple Overrides:** Strategic `!important` for Tailwind class overrides
- **Consistent Naming:** BEM-influenced with semantic component names

#### Component Development
- **Glass-First:** Start with backdrop-filter base
- **Subtle Borders:** Always use ultra-low opacity
- **Shadow Layers:** Combine inset highlights with depth shadows
- **Smooth Transitions:** 0.2s ease for all interactive states
- **Blue Accents:** Use for focus, active, and premium states

#### Responsive Considerations
- **Mobile-First:** Base styles optimized for small screens
- **Touch-Friendly:** Adequate spacing for touch interactions
- **Progressive Enhancement:** Advanced effects degrade gracefully

-----

### 9\. File Architecture

  * **Main Styles:** `src/public/css/main.css` (comprehensive system)
  * **Template Integration:** `src/templates/layouts/base.njk`
  * **Admin Theme:** Apple-style overrides in main CSS
  * **Component Templates:** `src/templates/components/`
  * **Consistent Integration:** Works seamlessly with existing Nunjucks/HTMX stack

-----

### 10\. Evolution Notes

**Version 4 Improvements:**
- Apple-inspired design philosophy implementation
- Enhanced sunset/sand palette with blue sophistication
- Comprehensive CSS reset for cross-browser consistency
- Ultra-subtle border treatment eliminating harsh whites
- Advanced glass morphism with multi-layered shadows
- Professional readability enhancements
- Sophisticated interaction design

**Maintained Principles:**
- Server-side rendering performance
- HTMX progressive enhancement compatibility
- Privacy-focused, no-registration approach
- Accessibility-first development
- Mobile-responsive design

This design system creates a premium, Apple-inspired experience that feels both warm and sophisticated, maintaining the sunset theme while achieving professional-grade refinement.