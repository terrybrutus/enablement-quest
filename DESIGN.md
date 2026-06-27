# Design Brief

## Direction

Enablement Quest: The Learning Systems Lab — a dark, immersive top-down RPG learning experience where players explore a modern organization, interact with workplace characters, and complete case missions to earn learning artifacts.

## Tone

Retro-futuristic workplace RPG: dark charcoal environments with warm amber/teal accents, clean tech-modern UI overlays, and subtle glow effects that feel inviting and intellectual rather than generic corporate.

## Differentiation

A learning game that doesn't look like a courseware template — it looks like a real RPG with intentional visual hierarchy, glowing quest markers, and cinematic dialogue panels.

## Color Palette

| Token      | OKLCH           | Role                                |
| ---------- | --------------- | ----------------------------------- |
| background | 0.145 0.014 260 | deep charcoal game canvas           |
| foreground | 0.95 0.01 260   | primary text, UI labels             |
| card       | 0.18 0.014 260  | panels, dialogue boxes, quest log   |
| primary    | 0.75 0.15 190   | teal accent — interactive elements  |
| accent     | 0.75 0.15 190   | same as primary for consistency     |
| muted      | 0.22 0.02 260   | secondary surfaces, inactive states |
| destructive| 0.55 0.2 25     | errors, blocked actions             |
| success    | 0.65 0.18 145   | quest completion, positive states   |
| warning    | 0.75 0.15 85    | hints, incomplete objectives        |
| border     | 0.28 0.02 260   | panel borders, dividers             |
| ring       | 0.75 0.15 190   | focus rings, selection glow         |

## Typography

- Display: Space Grotesk — game title, splash screen, zone headers
- Body: DM Sans — dialogue text, quest descriptions, UI labels
- Mono: Geist Mono — quest log metadata, artifact details
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold`, label `text-sm font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Layered game UI: flat dark canvas at bottom, elevated card panels with `shadow-subtle`, active/selected elements with `shadow-glow`. No page-level shadows — all depth is within the game overlay.

## Structural Zones

| Zone           | Background       | Border         | Notes                                       |
| -------------- | ---------------- | -------------- | ------------------------------------------- |
| Game Canvas    | bg-background    | —              | Full-viewport tile-based world              |
| HUD Bar        | bg-card/80       | border-b       | Top overlay: zone name, key hints           |
| Dialogue Panel | bg-card          | border         | Bottom overlay: character portrait + text   |
| Quest Log      | bg-card          | border-l       | Slide-out left panel                        |
| Artifacts      | bg-card          | border-r       | Slide-out right panel                       |
| Title Splash   | bg-background/95 | —              | Centered overlay on first load              |

## Spacing & Rhythm

Game UI uses tight spacing (4-8px gaps inside panels, 12-16px padding). Content panels use 16-24px padding. No large page margins — the game fills the viewport.

## Component Patterns

- Buttons: rounded-md, bg-primary, text-primary-foreground, hover:bg-primary/90, shadow-glow on primary CTAs
- Cards: rounded-lg, bg-card, border border-border, shadow-subtle
- Badges: rounded-full, small text, bg-muted text-muted-foreground for inactive; bg-success text-success-foreground for complete
- Waypoint Markers: rounded-full, animate-pulse-glow, bg-warning with ring

## Motion

- Entrance: fade-in for panels and splash screen (0.4s ease-out)
- Slide: slide-in-left for quest log, slide-in-right for artifacts panel
- Hover: transition-smooth on all interactive elements
- Decorative: float animation on waypoint markers, pulse-glow on active quest objectives

## Constraints

- Dark mode only — no light mode for this game UI
- No raw color literals in components — use semantic tokens only
- No full-page gradients — depth through panel layering and glow effects
- Keep game canvas unstyled by Tailwind — UI overlays only

## Signature Detail

Glowing teal waypoint markers with `animate-pulse-glow` that guide the player through the learning journey — turning corporate onboarding into a discoverable adventure.
