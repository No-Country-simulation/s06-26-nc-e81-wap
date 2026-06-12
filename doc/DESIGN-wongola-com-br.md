# Design System Inspired by Wongola

> Auto-extracted from `https://www.wongola.com.br/index.html` on 2026-06-09

## 1. Visual Theme & Atmosphere

Refined dark mode with muted tones — cinematic and premium.

The hero section leads with "Conquiste o futuro conosco" followed by "O programa Black in Tech é a iniciativa da Wongola 
      para impulsionar a presença e a representa".

**Key Characteristics:**
- Lato as the heading font
- ui-sans-serif as the body font for all running text
- Dark background (#151515) as the primary canvas
- Primary accent `#888888` used for CTAs and brand highlights
- 2 shadow level(s) detected — tinted shadows
- Rounded corners (12px+) creating a friendly, approachable feel
- Tags: dark, rounded, monochrome, bold-typography, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#888888`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#aaaaaa`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#151515`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#ffffff`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text
- **Text Primary** (`#ffffff`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#999999`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#222222`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#222222` | `--palette-1` | section | large | text-light |
| 2 | `#ffffff` | `--palette-2` | block | large | text-dark |
| 3 | `#000000` | `--palette-3` | button | medium | text-light |

## 3. Typography Rules

- **Heading Font:** `Lato`, sans-serif
- **Body Font:** `ui-sans-serif`, sans-serif

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H2 | Lato | 85px | 700 | 106.25px | normal |
| H3 | Lato | 14px | 600 | 22.75px | normal |
| Body | Lato | 24px | 400 | 36px | normal |
| Small | ui-sans-serif | 14px | 400 | 20px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `85px` | headings |
| H1 | `64px` | headings |
| H2 | `48px` | headings |
| H3 | `36px` | headings |
| H4 | `24px` | headings |
| Body L | `20px` | body / supporting text |
| Body | `18px` | body / supporting text |
| Small | `16px` | body / supporting text |
| XS | `14px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #151515;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
```

### Card

```css
.card {
  background: #f8f5ee;
  border-radius: 24px;
  padding: 96px;
}
```

## 5. Layout Principles

- **Base spacing unit:** `8px` — use multiples (16px, 24px, 32px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `8px` | element |
| spacing-2 | `24px` | card |
| spacing-3 | `96px` | section |
| spacing-4 | `12px` | element |
| spacing-5 | `16px` | element |
| spacing-6 | `80px` | section |
| spacing-7 | `48px` | card |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-button | `12px` | button |
| radius-button | `8px` | button |
| radius-button | `6px` | button |
| radius-card | `24px` | card |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Low | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation |
| Low | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation |


## 7. Do's and Don'ts

### Do
- Use `#151515` as the primary background color
- Use `Lato` for all headings and `ui-sans-serif` for body text
- Use `#888888` as the single dominant accent/CTA color
- Maintain `8px` as the base spacing unit — all gaps should be multiples
- Keep the overall feel dark — use dark surfaces throughout
- Use rounded corners (`12px`+) consistently for all interactive elements
- Make headlines large and bold — typography is the hero element
- Stick to grayscale + `#888888` accent — avoid color overload
- Apply the shadow system for elevation — use the extracted shadow values

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute Lato/ui-sans-serif with generic alternatives
- Don't use irregular spacing — stick to 8px grid
- Don't introduce bright white surfaces — they break the dark palette
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't add additional saturated colors beyond the primary accent
- Don't use pure black (#000000) for text — use `#ffffff` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 8px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #151515
Text:        #ffffff
Accent:      #888888
Secondary:   #aaaaaa
Border:      #222222
```

### Example Prompts

1. "Build a hero section with a `#151515` background, `Lato` heading in `#ffffff`, and a `#888888` CTA button."
2. "Create a pricing card using background `#ffffff`, border `#222222`, `ui-sans-serif` for text, and 24px padding."
3. "Design a navigation bar — `#151515` background, `#ffffff` links, `#888888` for active state."
4. "Build a feature grid with 3 columns, 24px gap, each card using the card component style."
5. "Create a footer with `#ffffff` background, `#ffffff` text, and 16px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct
