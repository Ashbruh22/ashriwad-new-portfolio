---
trigger: always_on
---

---
name: uiux-designer
description: "Use this skill when designing UI components, choosing color palettes, implementing responsive layouts, or reviewing code for UX issues. For landing pages, dashboards, e-commerce, SaaS, and mobile apps. Provides 50+ design styles, 97 color palettes, 57 font pairings, and stack-specific guidelines for React, Vue, Next.js, Flutter, SwiftUI, and more."
---

# UIUX Designer - Design Intelligence & Guidelines

Comprehensive design reference and decision guide for web and mobile applications. Contains 50+ styles, 97 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 12 technology stacks. Includes a priority-based recommendation matrix.

## Overview

Reference these essential intelligence guidelines whenever you are:
- Designing new user interface components, interactive design systems, or landing pages
- Selecting harmonious color palettes, accessibility-compliant themes, and font pairings
- Reviewing existing source code for hidden UX issues, usability bottlenecks, or anti-patterns
- Architecting high-conversion landing pages, complex enterprise dashboards, or mobile apps
- Implementing WCAG accessibility standards, touch guidelines, and responsive layouts

## Rule Categories by Priority

| Priority | Category | Impact Level | Target Domain | Core Requirement |
|:---|:---|:---|:---|:---|
| 1 | Accessibility | CRITICAL | `ux` | WCAG AAA/AA compliance, high contrast, aria |
| 2 | Touch & Interaction | CRITICAL | `ux` | Tap targets 44px+, instant state feedback |
| 3 | Performance | HIGH | `ux` | Sub-100ms interactions, layout stability |
| 4 | Layout & Responsive | HIGH | `ux` | Fluid grids, breakpoint design, vertical flow |
| 5 | Typography & Color | MEDIUM | `typography`, `color` | Hierarchy, legibility, 60-30-10 color rule |
| 6 | Animation | MEDIUM | `ux` | 150-300ms transitions, GPU acceleration |
| 7 | Style Selection | MEDIUM | `style`, `product` | Visual consistency, brand personality match |
| 8 | Charts & Data | LOW | `chart` | Data density balance, readable chart types |

## Quick Reference Guide

### 1. Accessibility Guidelines (CRITICAL)

- `color-contrast` - Minimum 4.5:1 ratio for normal body text, 3:1 for large headings (18pt+)
- `focus-states` - Provide high-contrast, double-ring visible focus outlines for keyboard users
- `alt-text` - Informative alt text for meaningful images; empty `alt=""` for decorative icons
- `aria-labels` - Explicit `aria-label` attributes for icon-only buttons, close triggers, and links
- `keyboard-nav` - Logical tab order following visual layout without trapped focus loops
- `form-labels` - Explicit standard html `<label>` tags with matching `for` / `id` attributes

### 2. Touch & Interaction Rules (CRITICAL)

- `touch-target-size` - Minimum 44x44px interactive boundaries for all touch elements
- `hover-vs-tap` - Ensure primary actions do not rely on hover states on touch screens
- `loading-buttons` - Disable inputs and display inline spinners during async network operations
- `error-feedback` - Inline, descriptive validation messaging adjacent to problematic inputs
- `cursor-pointer` - Add explicit `cursor: pointer` styling to all clickable interactive cards

### 3. Performance Standards (HIGH)

- `image-optimization` - Modern WebP/AVIF formats, responsive `srcset`, and native `lazy` loading
- `reduced-motion` - Respect user system preferences via `@media (prefers-reduced-motion: reduce)`
- `content-jumping` - Reserve explicit spatial aspects/dimensions to prevent layout shifts (CLS)

### 4. Layout & Responsive Grids (HIGH)

- `viewport-meta` - Enforce `<meta name="viewport" content="width=device-width, initial-scale=1">`
- `readable-font-size` - Minimum 16px root body text size on mobile viewports to avoid auto-zoom
- `horizontal-scroll` - Prevent unintended horizontal page overflow across all screen dimensions
- `z-index-management` - Maintain disciplined z-index scales (`10`, `20`, `30`, `50`, `100`)

### 5. Typography & Color Harmony (MEDIUM)

- `line-height` - Maintain 1.5 to 1.75 line-height ratio for long-form narrative text blocks
- `line-length` - Restrict body text column width between 65 to 75 characters maximum
- `font-pairing` - Harmonize distinctive header fonts with clean, legible sans-serif body type

### 6. Animation & Micro-Interactions (MEDIUM)

- `duration-timing` - Target fast 150-300ms durations using standard cubic-bezier easing
- `transform-performance` - Animate exclusively using hardware-accelerated transform & opacity
- `loading-states` - Use skeleton placeholder screens for structural content loading states

### 7. Style Selection & Aesthetics (MEDIUM)

- `style-match` - Align visual choices directly with core target audience expectations
- `consistency` - Enforce identical radius, shadow, and border design tokens globally
- `no-emoji-icons` - Always employ professional SVG icons rather than native device emojis

### 8. Data Visualization & Charts (LOW)

- `chart-type` - Match metric types accurately (e.g., line charts for continuous time series)
- `color-guidance` - Utilize colorblind-safe sequential or qualitative palette configurations
- `data-table` - Provide structured semantic data tables as accessible fallback alternatives

---

## Environment Prerequisites

Verify that a valid Python runtime environment is available on the target system:

```bash
python3 --version || python --version


