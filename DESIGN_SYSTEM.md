# AuraFest Liquid Glass Design System

## Architectural Token & Component Specification

---

### 1. Design Philosophy

AuraFest Luxe introduces an **Apple Liquid Glass** design aesthetic tailored for high-stakes celebration planning:

- **Translucency with Purpose**: Glass panels let atmospheric depth shine through while keeping typography, data tables, and financial amounts 100% legible.
- **Luminous Optical Edges**: Thin specular borders with subtle gradient highlights simulate physical refracted light.
- **Ambient Chromatic Glow**: Atmospheric radial gradients in royal amethyst (`#7c3aed`), jade turquoise (`#0d9488`), and warm champagne gold (`#f59e0b`) create dimensionality behind frosted surfaces.
- **Strict Accessibility**: Contrast ratios conform to WCAG 2.2 AA (4.5:1 minimum for text). Forced colors and `prefers-contrast: more` are fully supported.

---

### 2. Design Tokens

#### Color Tokens (RGB values for alpha channel flexibility)

| Token        | Light Theme                   | Dark Theme                      | Purpose                      |
| ------------ | ----------------------------- | ------------------------------- | ---------------------------- |
| `--paper`    | `246 248 252` (Porcelain)     | `11 15 25` (Obsidian)           | Viewport background          |
| `--card`     | `255 255 255` (Pure White)    | `20 27 45` (Midnight Navy)      | Glass card substrate         |
| `--field`    | `255 255 255`                 | `28 38 62`                      | Input & table row background |
| `--ink`      | `15 23 42` (Deep Slate)       | `248 250 252` (Alabaster)       | Primary text                 |
| `--ink-soft` | `71 85 105` (Muted Slate)     | `186 199 217` (Soft Pearl)      | Secondary text               |
| `--line`     | `226 232 240`                 | `43 56 82`                      | Glass border contours        |
| `--accent`   | `124 58 237` (Royal Amethyst) | `167 139 250` (Luminous Violet) | Primary brand highlight      |
| `--ok`       | `22 101 52` (Emerald Forest)  | `52 211 153` (Mint Jade)        | Verified & on-track states   |
| `--warn`     | `185 28 28` (Crimson Amber)   | `251 113 133` (Coral Flame)     | Over-budget & alert states   |

#### Category Jewel Swatches

- **Venue**: Royal Amethyst (`rgb(124 58 237)`)
- **Catering**: Warm Saffron Gold (`rgb(217 119 6)`)
- **Decor**: Jade Turquoise (`rgb(13 148 136)`)
- **Photography**: Sapphire Blue (`rgb(37 99 235)`)
- **Entertainment**: Rose Quartz (`rgb(219 39 119)`)
- **Misc**: Graphite Slate (`rgb(100 116 139)`)
- **Contingency**: Amber Shield (`rgb(180 83 9)`)

---

### 3. Glass Component Classes

- `.card`: Frosted glass container with `backdrop-blur-md`, subtle specular bevel, and responsive lift on hover.
- `.btn-primary`: Luminous gradient button with specular top highlight and glow shadow.
- `.btn-secondary`: Translucent glass button with frosted backdrop and hover sheen.
- `.input`: Crisp frosted glass input with glowing amethyst focus ring.
- `.badge-verified`: Emerald glass pill with checkmark icon.
- `.badge-warn`: Crimson glass pill for delay or budget risk.
- `.badge-estimate`: Slate glass pill for unconfirmed budget allocations.

---

### 4. Accessibility & Reduced Motion

- **Contrast Checked**: Every text-background pair passes automated axe-core audits.
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce`, dropping animation times to `0.01ms`.
- **Keyboard Traversal**: Full arrow key navigation across tab lists (`Home`, `End`, `ArrowLeft`, `ArrowRight`).
