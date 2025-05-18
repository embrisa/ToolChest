## `<TC>` | ToolChest UI Theme Documentation

**Version:** 3
**Last Updated:** May 22, 2025
**Project Alignment:** ToolChest Project Architecture & UX Goals

### Mission

To deliver a privacy-respecting toolbox of utilities inside a calm-futuristic interface that loads fast (Server-Side Rendered), degrades gracefully (HTMX-enhanced), and looks gorgeous on any device.

-----

### 1\. Brand Essence

  * **Sunrise-to-Sea Gradient:** This core visual signals approachability and optimism (sunrise hues) transitioning to innovation and depth (oceanic hues). It's the primary accent.
  * **Simple Markup (`<TC>`):** The logo mark embodies simplicity and recognizability.
  * **Apple-Inspired Translucency:** UI elements feature frosted glass effects with subtle borders and shadows for an elegant, modern feel.
  * **Cosmic Background:** A layered spacey background with distant stars for depth and atmosphere.
  * **Utility-first Layouts:** UI elements like cards, filters, and upload zones are designed to feel like tools on a workbench – functional and clear.

-----

### 2\. Expanded Colour System

Colors are primarily managed via CSS variables in `src/public/css/main.css` and can be extended into `tailwind.config.js` if a Tailwind build process is active.

#### CSS Color Tokens (`:root` in `src/public/css/main.css`)

| Token         | Hex       | Role                          |
| :------------ | :-------- | :---------------------------- |
| `--sand-50`   | `#FFEDCC` | Lightest sandy bg for cards   |
| `--sand-300`  | `#FFC57E` | Peach accent (focus states)   |
| `--ocean-100` | `#B7DFFF` | Hover overlays, dropzone hover |
| `--ocean-400` | `#6FB8FF` | Primary link colour, icons    |
| `--ocean-700` | `#338DFF` | Active / selected nav, badges |
| `--navy-900`  | `#00141F` | Default background            |
| `--navy-800`  | `#021D2C` | Container backgrounds (w/alpha) |
| `--danger`    | `#FF4D4F` | Error states, 4xx pages       |
| `--success`   | `#22C55E` | Success toast                 |
| `--gray-700`  | `#4B5563` | Muted body copy               |

#### Accent Gradient (`--accent-gradient` in `src/public/css/main.css`)

```css
:root {
  --accent-gradient: linear-gradient(120deg,
      #FFB860 0%,   /* sand */
      #FFC57E 15%,  /* peach */
      #B7DFFF 40%,  /* light ocean */
      #6FB8FF 65%,  /* sky */
      #338DFF 85%,  /* azure */
      #001F4D 100%  /* navy */
  );
}
```

This gradient is used for the logo text and potentially other key hero elements.

#### Spacey Background (`--spacey-bg` in `src/public/css/main.css`)

```css
:root {
  --spacey-bg: radial-gradient(ellipse at 75% -10%, #338DFF 0%, #00141F 60%),
               radial-gradient(circle at 10% 80%, rgba(51, 141, 255, 0.1) 0%, transparent 30%),
               radial-gradient(circle at 90% 40%, rgba(255, 197, 126, 0.08) 0%, transparent 35%);
}
```

The main site background uses these layered radial gradients to create a cosmic, spacey feeling.

#### Tailwind Color Configuration (Reference for `tailwind.config.js`)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        sand:  {50:'#FFEDCC',300:'#FFC57E'},
        ocean: {100:'#B7DFFF',400:'#6FB8FF',700:'#338DFF'},
        navy:  {900:'#00141F',800:'#021D2C'},
        danger: '#FF4D4F', // Optional: if using Tailwind directly for these
        success: '#22C55E',
        // gray: {700: '#4B5563'}, // Can be an override if needed
      }
    }
  }
}
```

*Note: The ToolChest project currently uses Tailwind via CDN. This configuration is for reference or future build-process integration.*

-----

### 3\. Typography

  * **Primary Font:** `Inter` (weights 400, 600, 800). Imported via CDN in the main layout file (`src/templates/layouts/base.njk`).
  * **Display / Logo:** `Inter`, 800 weight. Size: `clamp(3rem, 8vw, 8rem)`. Applied via `.logo` class.
  * **Headings:** `Inter`, 600 weight. Responsive sizing (e.g., 1.75rem base, 2.25rem on larger screens).
  * **Body:** `Inter`, 400 weight. Responsive sizing (e.g., 1rem base, 1.125rem on larger screens). Default color: `text-white` on main background, `var(--gray-700)` for muted copy.
  * **Monospace:** `ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace`. Used for code snippets, Base64 output, etc.

Styles are defined in `src/public/css/main.css` and through Tailwind utility classes.

-----

### 4\. Core Components & Styling Guide

Component Nunjucks templates are located in `src/templates/components/` and page-specific templates in `src/templates/pages/`. Custom CSS is in `src/public/css/main.css`.

  * **Logo (`components/logo.njk`):**
      * HTML: `<a href="/" class="logo lg:text-7xl text-5xl font-extrabold">&lt;TC&gt;</a>`
      * CSS (`.logo`): Uses `--accent-gradient` with `background-clip: text` and a subtle white `drop-shadow`.
  * **Content Container (`.content-container`):**
      * Frosted glass effect with: `background-color: rgba(2, 29, 44, 0.6); backdrop-filter: blur(20px);`
      * Very subtle border: `border: 1px solid rgba(183, 223, 255, 0.08);`
      * Soft shadow: `box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);`
      * Rounded corners: `border-radius: 1rem;`
  * **Navigation Bar (`components/navbar.njk`):**
      * Translucent bar with strong blur: `backdrop-blur-2xl bg-navy-800/30`
      * Subtle top border: `border-b border-ocean-400/10`
      * Includes the logo and an HTMX-enabled search input with rounded corners
  * **Tool Card (`.tool-card`):**
      * Translucent background: `background-color: rgba(2, 29, 44, 0.5);`
      * Subtle border and shadow: `border: 1px solid rgba(183, 223, 255, 0.05); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);`
      * Hover: `transform: translateY(-4px) scale(1.01); background-color: rgba(2, 29, 44, 0.65);`
      * Icon: `{{ tool.iconClass }}` (Font Awesome), `text-ocean-400`.
      * Title: `font-semibold text-lg text-white`.
      * Description: `text-sm text-gray-400`
  * **Drop Zone (Base64 Tool, `.dropzone`):**
      * Subtle dashed border: `border: 1px dashed rgba(111, 184, 255, 0.4);`
      * Frosted glass effect: `backdrop-filter: blur(10px); background-color: rgba(183, 223, 255, 0.03);`
      * Hover: Subtle highlight and shadow: `background-color: rgba(183, 223, 255, 0.1); border-color: rgba(111, 184, 255, 0.6); box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);`
  * **Buttons (`btn-primary`):**
      * Translucent background: `background-color: rgba(51, 141, 255, 0.7);`
      * Subtle glass effect: `backdrop-filter: blur(5px); border: 1px solid rgba(183, 223, 255, 0.1);`
      * Soft shadow: `box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);`
      * Hover: Subtle lift and color change: `background-color: rgba(255, 197, 126, 0.7); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);`
  * **Error Pages (`pages/error.njk`, `components/error-message.njk`):**
      * Status Code: `text-6xl font-black text-danger`.
      * Title: `text-2xl font-semibold text-white`.
      * Message: `text-gray-300`.
      * HTMX error fragment uses the red palette with reduced opacity.

-----

### 5\. Utility Classes (Tailwind CSS)

Developers should leverage Tailwind's utility-first approach, incorporating the theme's color palette.

  * **Frosted Glass Container:**
    `backdrop-blur-md bg-navy-800/40 border border-ocean-400/10 shadow-lg rounded-lg`
  * **Gradient Text (alternative to `.logo` style):**
    `bg-gradient-to-br from-[#FFB860] via-[#6FB8FF] to-[#001F4D] bg-clip-text text-transparent`
  * **Card Hover Lift (Tailwind equivalent for `.tool-card` hover):**
    `transition transform hover:-translate-y-1 hover:shadow-lg hover:bg-navy-800/65`
  * **Tag Badge (Tailwind equivalent for `.tag-badge`):**
    `bg-ocean-700/20 text-ocean-400 rounded-full text-xs px-2 py-0.5`

-----

### 6\. Performance & Accessibility

  * **SSR First:** Nunjucks for core markup; gradient is pure CSS.
  * **HTMX:** Additive for progressive enhancement; site fully functional without JS.
  * **Reduced Motion:** Animations and transitions respect `prefers-reduced-motion` (see `main.css` for an example).
  * **Contrast:** Aim for WCAG AA. Ensure text has sufficient contrast against translucent backgrounds.
  * **Backdrop Filter Support:** For browsers that don't support backdrop-filter, the backgrounds have enough opacity to ensure readability.
  * **ARIA & Semantics:** Ensure inputs are focusable, labelled (or `aria-describedby` for hints), and semantic HTML is used.

-----

### 7\. Key File Locations

  * **Custom CSS & Variables:** `src/public/css/main.css`
  * **Main Layout:** `src/templates/layouts/base.njk`
  * **Reusable Components:** `src/templates/components/`
  * **Page Templates:** `src/templates/pages/`
  * **Tailwind Configuration (if used with build step):** `tailwind.config.js` (root)

-----

### 8\. Development Notes

  * Always refer to the original theme document for specific implementation details if ambiguity arises.
  * When modifying elements, prioritize using existing CSS variables and Tailwind classes configured with the theme's palette.
  * Ensure new components or significant changes are responsive and tested across different viewport sizes.
  * Maintain consistency with the established visual language ("calm-futuristic", "Apple-inspired", "utility-first").
  * For forms and interactive elements, use the frosted glass styling with subtle borders and shadows.