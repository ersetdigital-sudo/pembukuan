---
inclusion: always
---

# Sanity Design System — Project Style Guide

Semua kode UI yang ditulis atau dimodifikasi di project ini WAJIB mengikuti Sanity design system berikut. Jangan gunakan warna, font, spacing, atau border-radius di luar token yang sudah didefinisikan.

## Color Tokens

### Light Mode
| Token | Value | Penggunaan |
|-------|-------|------------|
| primary | #f36458 | CTA utama, accent brand |
| secondary | #0052ef | Hover state, link aktif |
| background | #f7f7f7 | Background halaman |
| background-canvas | #f7f7f7 | Canvas level background |
| background-bone | #ffffff | Inset surfaces, card groups |
| surface | #ffffff | Default surface |
| surface-card | #ffffff | Card backgrounds |
| surface-dark | #212121 | Elevated dark surfaces, nav |
| surface-deep | #0b0b0b | Footer, deepest surfaces |
| foreground | #0b0b0b | Primary foreground |
| ink | #0b0b0b | Primary headings |
| body | #0b0b0b | Body text |
| charcoal | #0b0b0b | Captions, metadata |
| mute | #b9b9b9 | Disabled/muted elements |
| ash | #797979 | Secondary text |
| stone | #b9b9b9 | Placeholders |
| on-primary | #ffffff | Text di atas primary |
| on-secondary | #ffffff | Text di atas secondary |
| on-background | #0b0b0b | Text di atas background |
| on-surface | #0b0b0b | Text di atas surface |
| on-dark | #ffffff | Text di atas dark surface |
| on-dark-mute | #b9b9b9 | Secondary text di dark surface |
| hairline | #ededed | Border halus |
| hairline-strong | #212121 | Border tegas |
| divider | #ededed | Section divider |
| divider-dark | #212121 | Divider di dark surface |
| hero-warm | #f36458 | Hero gradient start |
| hero-glow | #55beff | Hero gradient mid |
| hero-pink | #e600ff | Hero gradient end |
| badge-success | #19d600 | Status sukses |
| badge-warning | #f59e0b | Status warning |
| badge-info | #55beff | Status info |
| link | #0052ef | Inline links |
| ring-focus | rgba(0, 82, 239, 0.15) | Focus ring |

### Dark Mode
| Token | Value |
|-------|-------|
| primary | #f36458 |
| secondary | #0052ef |
| background | #0b0b0b |
| background-canvas | #0b0b0b |
| background-bone | #212121 |
| surface | #212121 |
| surface-card | #212121 |
| surface-dark | #0b0b0b |
| surface-deep | #000000 |
| foreground | #ffffff |
| ink | #ffffff |
| body | #b9b9b9 |
| charcoal | #ffffff |
| mute | #797979 |
| ash | #b9b9b9 |
| stone | #797979 |
| on-primary | #ffffff |
| on-secondary | #ffffff |
| on-background | #ffffff |
| on-surface | #ffffff |
| on-dark | #ffffff |
| on-dark-mute | #b9b9b9 |
| hairline | #212121 |
| hairline-strong | #797979 |
| divider | #212121 |
| divider-dark | #353535 |
| hero-warm | #f36458 |
| hero-glow | #55beff |
| hero-pink | #e600ff |
| badge-success | #19d600 |
| badge-warning | #f59e0b |
| badge-info | #55beff |
| link | #55beff |
| ring-focus | rgba(0, 82, 239, 0.3) |

## Typography

### Font Families
- **Display & Body**: `'Space Grotesk', ui-sans-serif, system-ui, sans-serif`
- **Code & Technical**: `'IBM Plex Mono', ui-monospace, monospace`

### Scale
| Token | Size | Weight | Line Height | Letter Spacing | Penggunaan |
|-------|------|--------|-------------|----------------|------------|
| display-xl | 80px | 700 | 1.00 | -3.6px | Hero headlines |
| display-lg | 48px | 600 | 1.08 | -1.68px | Section headers besar |
| heading-lg | 38px | 600 | 1.10 | -1.14px | Section anchors |
| heading-md | 24px | 500 | 1.24 | -0.24px | Card titles, subsection |
| body-lg | 18px | 400 | 1.50 | -0.18px | Intro paragraphs |
| body-md | 16px | 400 | 1.50 | normal | Standard body text |
| body-sm | 15px | 400 | 1.50 | normal | Compact body text |
| button-md | 16px | 600 | 1.0 | normal | Button labels |
| button-sm | 11px (IBM Plex Mono) | 600 | 1.0 | 0.5px | Uppercase labels, tabs |
| caption | 13px | 400 | 1.50 | -0.13px | Metadata, tags |
| code-md | 15px (IBM Plex Mono) | 400 | 1.50 | normal | Code blocks |
| code-sm | 13px (IBM Plex Mono) | 500 | 1.50 | normal | Inline code |

### Prinsip Typography
- Display headings pakai negative letter-spacing yang agresif
- Hanya gunakan weight 400-700 (Space Grotesk)
- Uppercase + IBM Plex Mono untuk technical labels (button-sm)
- Heading line-height ketat (1.0-1.24), body longgar (1.50)

## Spacing (Base: 8px)

| Token | Value | Penggunaan |
|-------|-------|------------|
| xxs | 2px | Micro gaps |
| xs | 4px | Tight internal spacing |
| sm | 8px | Button padding, badge padding |
| md | 12px | Standard component gap |
| lg | 16px | Card spacing, section padding |
| xl | 24px | Large padding |
| xxl | 32px | Section padding, gutters |
| xxxl | 48px | Large section spacing |
| section | 96px | Hero padding, major breaks |
| band | 120px | Maximum separation |

## Border Radius

| Token | Value | Penggunaan |
|-------|-------|------------|
| none | 0 | Nav bars, full-bleed sections |
| xs | 3px | Inputs, subtle rounding |
| sm | 5px | Ghost buttons, small cards |
| md | 6px | Standard cards, modals |
| lg | 12px | Large cards, feature containers |
| full | 99999px | Primary buttons, badges, pills, tabs |

**Aturan**: TIDAK ADA radius antara 13px dan 99998px. Langsung dari `lg` (12px) ke `full` (pill).

## Component Specs

### Buttons
- **Primary**: bg primary, text on-primary, rounded full, height 44px, hover → bg secondary
- **Secondary**: bg surface-dark, text on-dark-mute, rounded full, height 44px, hover → bg secondary
- **Ghost**: bg surface-dark, text on-dark-mute, rounded sm, height 44px, hover → bg secondary
- **Outlined**: bg background-bone, text surface-deep, border 1px surface-deep, rounded full, height 44px

### Inputs
- **Text Input**: bg surface-dark, text on-dark-mute, rounded xs, height 44px, focus ring ring-focus
- **Search Input**: bg surface-dark, text on-dark-mute, rounded xs, height 44px

### Cards
- **Default**: bg surface-card, border 1px hairline, rounded md, padding xl
- **Feature**: bg surface-dark, rounded lg, padding xxl xxxl

### Navigation
- **Nav Bar**: bg surface-dark, text on-dark-mute, height 60px, rounded none
- **Link hover**: text → secondary

### Badges
- **Neutral**: bg background-bone, text surface-dark, rounded full
- **Filled**: bg surface-dark, text on-dark, rounded full
- **Success/Warning/Info**: bg badge-success/warning/info, text on-dark, rounded full

### Feedback
- **Modal**: bg surface-dark, rounded md, padding xxl, overlay 60% opacity
- **Alert**: bg surface-card, rounded md, left accent 3px (sesuai severity)
- **Tooltip**: bg surface-deep, text on-dark, rounded sm
- **Progress**: bg surface, fill primary, rounded full, height 8px

## Elevation (Colorimetric, bukan shadow)

- **Level 0**: Tidak ada shadow — depth via warna surface
- **Level 1**: Border-based containment (1px hairline)
- **Level 2**: Focus ring (ring-focus)
- **Level 3**: Modal overlay + border

## Aturan Implementasi

1. **WAJIB** gunakan CSS custom properties atau Tailwind config yang merujuk ke token di atas
2. **DILARANG** hardcode warna/spacing/font di luar token system
3. **Hover state** semua interactive elements → warna secondary (#0052ef)
4. **Dark mode** adalah default identity — bukan toggle
5. **Font loading**: Space Grotesk + IBM Plex Mono via Google Fonts
6. **Button primary** selalu pill (rounded-full), secondary actions bisa rounded-sm/md
7. **Spacing** harus kelipatan dari token (jangan pakai angka arbitrary)
8. **Card** tidak floating — pakai border hairline, bukan box-shadow
