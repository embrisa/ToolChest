## `<TC>` | ToolChest UI Theme Documentation

**Version:** 2
**Last Updated:** May 18, 2025
**Project Alignment:** ToolChest Project Architecture & UX Goals

### Mission

To deliver a privacy-respecting toolbox of utilities inside a calm-futuristic interface that loads fast (Server-Side Rendered), degrades gracefully (HTMX-enhanced), and looks gorgeous on any device.

-----

### 1\. Brand Essence

  * **Sunrise-to-Sea Gradient:** This core visual signals approachability and optimism (sunrise hues) transitioning to innovation and depth (oceanic hues). It's the primary accent.
  * **Simple Markup (`<TC>`):** The logo mark embodies simplicity and recognizability.
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

#### Radial Backdrop (Applied to `<body>` in `src/templates/layouts/base.njk`)

The main site background uses a radial gradient:
`bg-[radial-gradient(ellipse_at_75%_-10%,#338DFF_0%,#00141F_60%)]`

#### Tailwind Color Configuration (Reference for `tailwind.config.js`)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        sand:  {50:'#FFEDCC',300:'#FFC57E'},
        ocean: {100:'#B7DFFF',400:'#6FB8FF',700:'#338DFF'},
        navy:  {900:'#00141F'},
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
  * **Navigation Bar (`components/navbar.njk`):**
      * Uses `backdrop-blur`, `border-white/10`, sticky positioning.
      * Includes the logo and an HTMX-enabled search input (`bg-ocean-100/30`).
  * **Tool Card (e.g., `components/tool_card.njk`):**
      * Rounded, `bg-white/5` background.
      * Hover: `transform: translateY(-4px) scale(1.01); box-shadow-lg;`.
      * Icon: `{{ tool.iconClass }}` (Font Awesome), `text-ocean-400`.
      * Title: `font-semibold text-lg text-white`.
      * Description: `text-sm text-gray-400` (or `var(--gray-700)`).
      * Tags (`.tag-badge`): `text-xs rounded-full px-2 py-0.5 bg-ocean-700/20 text-ocean-400`.
  * **Drop Zone (Base64 Tool, in `pages/base64.njk` or similar):**
      * CSS (`.dropzone`): Dashed border (`var(--ocean-400)`), padding, rounded corners.
      * Hover: `background: var(--ocean-100);`.
  * **Error Pages (`pages/error.njk`, `components/error-message.njk`):**
      * Status Code: `text-6xl font-black text-danger`.
      * Title: `text-2xl font-semibold text-white`.
      * Message: `text-gray-300`.
      * HTMX error fragment uses the red palette (`--danger`).

-----

### 5\. Utility Classes (Tailwind CSS)

Developers should leverage Tailwind's utility-first approach, incorporating the theme's color palette.

  * **Gradient Text (alternative to `.logo` style):**
    `bg-gradient-to-br from-[#FFB860] via-[#6FB8FF] to-[#001F4D] bg-clip-text text-transparent`
  * **Card Hover Lift (Tailwind equivalent for `.tool-card` hover):**
    `transition transform hover:-translate-y-1 hover:shadow-lg`
  * **Tag Badge (Tailwind equivalent for `.tag-badge`):**
    `bg-ocean-700/20 text-ocean-400 rounded-full text-xs px-2 py-0.5`

-----

### 6\. Performance & Accessibility

  * **SSR First:** Nunjucks for core markup; gradient is pure CSS.
  * **HTMX:** Additive for progressive enhancement; site fully functional without JS.
  * **Reduced Motion:** Animations and transitions should respect `prefers-reduced-motion` (see `main.css` for an example).
  * **Contrast:** Aim for WCAG AA. Gradient text on dark backgrounds generally passes. Use `text-shadow` for thin light-colored glyphs if needed.
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
  * Maintain consistency with the established visual language ("calm-futuristic", "utility-first").