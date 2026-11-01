# PROJECT ORIGINALITY & ATTRIBUTION DISCLOSURE
## PromptWars Virtual Challenge 5: Celebration & Event Planner

---

### 1. Executive Summary

This document records the engineering provenance, reuse attribution, independent innovations, and original creative design work in **AuraFest Luxe** (upgraded from the 97.5-mark benchmark celebration planner solution for PromptWars Virtual Challenge 5).

---

### 2. Attribution & Retained Reference Implementation

- **Benchmark Foundation**: The solution builds upon the architecture of the 97.5-point leaderboard benchmark developed for PromptWars Challenge 5 under the MIT License.
- **Basis for Reuse**: Open-source MIT License terms; architectural preservation with deep functional, visual, and performance improvements as explicitly requested by competition directives.
- **Retained Core Logic**:
  - Deterministic event arithmetic (`src/engine/money.ts`, `budget.ts`, `timeline.ts`, `tradeoffs.ts`).
  - Topological sort and critical dependency propagation engine (`src/engine/timeline.ts`, `dates.ts`).
  - Zod validation contracts (`src/schemas/base.ts`, `ai.ts`).
  - Offline fallback deterministic planner (`src/engine/advisor.ts`, `insights.ts`).

---

### 3. Independently Created & Modified Components

| Module / Asset | Nature of Innovation | Technical Distinction |
|---|---|---|
| **Branding & Visual Identity** | **100% Original Creative Work** | Rebranded to **AuraFest Luxe**. Created original geometric liquid prism SVG brandmark (`BrandMark`), custom typography hierarchy, and luminous color direction. |
| **Design System (Liquid Glass)** | **100% Original Creative Work** | Designed an Apple Liquid Glass UI system featuring frosted glass substrates (`backdrop-blur-xl`, `bg-card/75`), multi-layer specular highlights, luminous glass pill badges, and atmospheric ambient radial gradients. |
| **Budget Simulation Engine** | **Substantial Functional Enhancement** | Added interactive 1-click quick-scenario guest scaling chips (`-25`, `+25`, `+50`), contingency reserve guidance, and live recalculation telemetry. |
| **Timeline & RunSheet** | **Enhanced Interface & Export** | Refined day-of protocol run sheet with glass time pills, critical path status alerts, and synchronized `.ics` calendar generation. |
| **Vendor Intelligence Matrix** | **Enhanced Visual Telemetry** | Elevated quotation comparison table with glass header cards, instant WhatsApp/email quote parser with streaming thinking trace, and clear procurement status indicators. |
| **Assistant & Copilot Dock** | **Enhanced AI Interaction** | Translucent conversational chat bubbles, deterministic insight severity prioritization (Urgent, Needs Attention, Suggestion), and Gemini Executive Review. |
| **Tooling & Engine Runtime** | **Infrastructure Upgrade** | Upgraded Node.js runtime compatibility to Node 22 LTS with native Rolldown binding support. |

---

### 4. Third-Party Libraries & Dependencies

All dependencies are maintained under permissive open-source licenses:
- **React 18** (MIT): Declarative component UI runtime.
- **TypeScript 5+ / 6** (Apache 2.0): Strict type system.
- **Tailwind CSS 3.4** (MIT): Utility-first CSS framework with custom glass tokens.
- **Zod 3+ / 4** (MIT): Runtime schema validation for user data and AI responses.
- **@google/genai** (Apache 2.0): Official Google Gemini API client SDK.
- **Vitest & Testing Library** (MIT): Unit and integration test runners.
- **axe-core & vitest-axe** (MPL 2.0): Automated WCAG accessibility audit harness.

---

### 5. Ethical AI & GenAI Implementation Guardrails

1. **Deterministic Financial Math**: GenAI is never allowed to calculate rupee amounts or dates. All arithmetic is executed deterministically in pure TypeScript functions.
2. **Server-Side API Security**: Gemini API keys never leak to frontend bundles; calls pass through protected same-origin `/api/` edge routes.
3. **Structured Validation**: Every model response is strictly validated against Zod schemas. Untrusted model responses are cleanly caught and rejected with safe fallback handling.
4. **Input Sanitization**: Untrusted user text is enclosed within `<user_text>` tags with prompt injection guardrails.

---

### 6. Verification Status

- **Unit & Integration Tests**: 405 / 405 tests passing (30 test files).
- **Accessibility Tests**: 7 / 7 axe-core tests passing with 0 violations in both light and dark themes.
- **TypeScript Strictness**: `tsc --noEmit` clean with 0 errors.
- **Linting**: ESLint clean with 0 warnings or errors.
- **Production Bundle**: Built in <900ms with ~104 kB gzip size.
