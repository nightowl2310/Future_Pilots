# Interactive Animations — Future Pilots Site

**Date:** 2026-06-22
**Scope:** Additive motion across `src/app/App.tsx`. No new dependencies (Framer Motion `motion/react` already installed). No content/structural changes.

## Goal

Add tasteful, subtle, professional interactive animations across the five pages
(Home, Workshops, About, Gallery, Contact). Calibrated for a school-facing
audience: gentle, fast (200–500ms), small travel distances. Must respect
`prefers-reduced-motion`.

## Design

### 1. Motion foundation (top of `App.tsx`)
- `useReducedMotion()` guard — when reduced motion is preferred, reveals and
  ambient loops collapse to instant/no-op.
- Shared variants: `fadeUp` (opacity 0→1, y 16→0, ~400ms ease-out),
  `staggerContainer` (children ~60ms apart).
- `<Reveal>` wrapper component using `whileInView` with
  `viewport={{ once: true, margin: "-80px" }}` — animates once on scroll-in.

### 2. Scroll-reveal entrances
- `SectionTitle` and each content grid (Why cards, journey steps, workshop
  cards, about cards, contact cards, gallery tiles) reveal with stagger on
  scroll. Hero keeps its existing entrance.

### 3. Hover/tap micro-interactions
- Cards: existing `y: -6` lift + soft shadow grow, low-stiffness spring.
- `CTA` + nav buttons: `whileHover` scale ~1.03 / `whileTap` ~0.97; arrow icon
  nudges right on hover.
- Icon badges (workshop domain icons, journey plane, contact icons): gentle
  rotate/scale on hover.

### 4. Image hover effects (Gallery)
- Tiles: hover zooms the inner gradient panel (~1.06) + slight tilt, `Eye` icon
  scales, label bar brightens. Built so a future real `<img>` inherits the zoom.
- Lightbox: `AnimatePresence` — backdrop fade + modal spring scale-in, fade-out
  on close.

### 5. Ambient/looping motion
- Hero blobs: slow infinite drift/scale loop. Logo plane: subtle continuous bob.
  Accent/bestseller badges: gentle periodic pulse. All disabled under reduced
  motion.

## Non-goals
- No new images/content, no routing changes, no new libraries, no refactor of
  unrelated code.
