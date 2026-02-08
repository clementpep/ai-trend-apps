# Poup's AI Hub - Branding Kit

A comprehensive guide to the premium glass-3D design system used in Poup's AI Hub.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Glass Effects](#glass-effects)
4. [Buttons](#buttons)
5. [Cards](#cards)
6. [Backgrounds & Halos](#backgrounds--halos)
7. [Icons](#icons)
8. [Animations](#animations)
9. [Spacing & Layout](#spacing--layout)
10. [CSS Variables Reference](#css-variables-reference)

---

## Color Palette

### Primary Colors

| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| **Glow Blue** | `217 91% 60%` | `#3B82F6` | Primary actions, CTAs, highlights |
| **Glow Purple** | `271 81% 56%` | `#8B5CF6` | Secondary glow, accents, gradients |

### Background Colors

| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| **OLED Black** | `240 10% 2%` | `#050508` | Main background |
| **Surface Dark** | `240 10% 4%` | `#0A0A0D` | Cards, modals |

### Text Colors

| Name | Opacity | Usage |
|------|---------|-------|
| **White** | 100% | Headlines, important text |
| **White** | 80% | Body text |
| **White** | 60% | Secondary text, descriptions |
| **White** | 40% | Muted text, placeholders |

### Accent Colors

| Name | Color | Usage |
|------|-------|-------|
| **Success Green** | `#4ADE80` | Success states, active indicators |
| **Error Red** | `#F87171` | Errors, destructive actions |

---

## Typography

### Font Family

```css
font-family: 'Inter', sans-serif;
```

**Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
```

### Font Weights

| Weight | Name | Usage |
|--------|------|-------|
| 300 | Light | Body text, descriptions |
| 400 | Regular | Standard text |
| 500 | Medium | Navigation, labels |
| 600 | Semibold | Buttons, emphasis |
| 700 | Bold | Subheadings |
| 800 | Extrabold | Headlines |

### Heading Styles

```css
h1, h2, h3, h4, h5, h6 {
  font-weight: 800;
  letter-spacing: -0.05em;
}
```

### Text Gradients

**Primary Gradient (White fade):**
```css
.text-gradient {
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Accent Gradient (Blue to Purple):**
```css
.text-gradient-accent {
  background: linear-gradient(135deg, hsl(217 91% 60%), hsl(271 81% 56%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## Glass Effects

### Standard Glass Card

The signature effect: semi-transparent background with blur and gradient borders.

```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  transform: scale(1.02) translateY(-4px);
  backdrop-filter: blur(30px);
  box-shadow:
    0 0 40px hsl(217 91% 60% / 0.2),
    0 0 80px hsl(271 81% 56% / 0.15),
    0 0 120px hsl(217 91% 60% / 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}
```

### Auth Modal Glass

Premium modal with enhanced blur and gradient border.

```css
.auth-modal-glass {
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 80px hsl(217 91% 60% / 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Gradient border effect */
.auth-modal-glass::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, hsl(217 91% 60% / 0.3), hsl(271 81% 56% / 0.2), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

### Glass Navigation

Subtle navigation bar with blur.

```css
.glass-nav {
  background: rgba(5, 5, 8, 0.8);
  backdrop-filter: blur(30px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
```

---

## Buttons

### Primary CTA Button (Subscribe)

Gradient background with animated border and glow effects.

```css
.hero-cta-primary {
  padding: 1.25rem 2.5rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 1.125rem;
  color: white;
  background: linear-gradient(135deg, hsl(217 91% 60%), hsl(271 81% 56%));
  box-shadow:
    0 8px 30px hsl(217 91% 60% / 0.4),
    0 0 60px hsl(271 81% 56% / 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.3),
    inset 0 -2px 0 rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-cta-primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    0 12px 40px hsl(217 91% 60% / 0.5),
    0 0 80px hsl(271 81% 56% / 0.4),
    0 0 120px hsl(217 91% 60% / 0.2);
}

/* Light sweep animation */
.hero-cta-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.8s ease;
}

.hero-cta-primary:hover::before {
  left: 100%;
}

/* Animated border */
.hero-cta-primary::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: inherit;
  padding: 3px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), hsl(217 91% 60%), hsl(271 81% 56%), rgba(255, 255, 255, 0.6));
  background-size: 300% 300%;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: premiumBorderFlow 4s ease infinite;
}

@keyframes premiumBorderFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Secondary CTA Button (Glass)

Semi-transparent glass button with animated border.

```css
.hero-cta-secondary {
  padding: 1.25rem 2.5rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 1.125rem;
  color: white;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 15px hsl(217 91% 60% / 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}

.hero-cta-secondary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.4),
    0 0 40px hsl(217 91% 60% / 0.4),
    0 0 60px hsl(271 81% 56% / 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}
```

### Profile Button (Small Circle)

```css
.profile-button-glass {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.profile-button-glass:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow:
    0 0 20px hsl(217 91% 60% / 0.3),
    0 4px 15px rgba(0, 0, 0, 0.2);
}
```

---

## Cards

### Feature Card

```css
.feature-card {
  padding: 2rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}
```

### 3D Number Badge

Used in "How it Works" section.

```css
.number-badge-3d {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.5rem;
  color: white;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  transform: perspective(500px) rotateX(5deg);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Color variants */
.number-badge-primary {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 25px hsl(217 91% 60% / 0.25);
  border-color: hsl(217 91% 60% / 0.3);
}

.number-badge-secondary {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 25px hsl(271 81% 56% / 0.25);
  border-color: hsl(271 81% 56% / 0.3);
}

.number-badge-green {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 25px rgba(74, 222, 128, 0.25);
  border-color: rgba(74, 222, 128, 0.3);
}
```

---

## Backgrounds & Halos

### Main Background

```css
body {
  background-color: #050508;
}
```

### Gradient Halos

Soft radial gradients for depth and visual interest.

```css
/* Blue Halo */
.halo-blue {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, hsl(217 91% 60% / 0.15), transparent 70%);
  filter: blur(48px);
  pointer-events: none;
}

/* Purple Halo */
.halo-purple {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, hsl(271 81% 56% / 0.12), transparent 70%);
  filter: blur(48px);
  pointer-events: none;
}
```

### Section Divider

```css
.gradient-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, hsl(217 91% 60% / 0.3), hsl(271 81% 56% / 0.3), transparent);
}
```

---

## Icons

### Icon Library

**Primary:** [Phosphor Icons](https://phosphoricons.com/) (Light weight)

```bash
npm install @phosphor-icons/react
```

**Usage:**
```tsx
import { User, Envelope, Lock, ArrowRight } from '@phosphor-icons/react';

<User size={20} weight="light" />
```

### Secondary (Lucide for specific cases)

```bash
npm install lucide-react
```

### Icon Styling

- Default size: 20px for navigation, 24px for feature icons
- Weight: Light (Phosphor)
- Color: `text-white/70` for inactive, `text-white` for active

### Icon Glass Container

```css
.icon-glass {
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 10px 30px rgba(0, 0, 0, 0.3);
}
```

---

## Animations

### Framer Motion Presets

**Fade Up:**
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
```

**Scale In:**
```tsx
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.5 }}
```

**Stagger Children:**
```tsx
// Parent
variants={{
  animate: { transition: { staggerChildren: 0.1 } }
}}

// Child
variants={{
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}}
```

### CSS Animations

**Pulse (Status indicator):**
```css
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

**Spin (Loading):**
```css
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

**Border Glow Animation:**
```css
@keyframes borderGlow {
  0%, 100% {
    background: linear-gradient(135deg, hsl(217 91% 60% / 0.6), hsl(271 81% 56% / 0.3), hsl(217 91% 60% / 0.6));
  }
  50% {
    background: linear-gradient(135deg, hsl(271 81% 56% / 0.6), hsl(217 91% 60% / 0.3), hsl(271 81% 56% / 0.6));
  }
}
```

---

## Spacing & Layout

### Container

```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

@media (min-width: 1024px) {
  .container {
    max-width: calc(100% - 6rem);
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: calc(100% - 10rem);
  }
}

@media (min-width: 1536px) {
  .container {
    max-width: 1400px;
  }
}
```

### Section Padding

- Mobile: `py-16` (4rem)
- Desktop: `py-24` (6rem)

### Card Border Radius

- Small (inputs, badges): `0.75rem` (12px)
- Medium (buttons): `9999px` (pill)
- Large (cards, modals): `1.5rem` (24px)

---

## CSS Variables Reference

```css
:root {
  /* Core Theme */
  --background: 240 10% 2%;
  --foreground: 0 0% 100%;

  /* Primary & Secondary */
  --primary: 217 91% 60%;
  --secondary: 271 81% 56%;

  /* Glass Variables */
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border-top: rgba(255, 255, 255, 0.3);
  --glass-border-side: rgba(255, 255, 255, 0.12);
  --glass-blur: 20px;

  /* Glow Colors */
  --glow-blue: 217 91% 60%;
  --glow-purple: 271 81% 56%;

  /* Border Radius */
  --radius: 1rem;
}
```

---

## Usage Examples

### Complete Card Example

```tsx
<div className="glass-card rounded-3xl p-8 relative overflow-hidden">
  {/* Gradient background accent */}
  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />

  {/* Icon */}
  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
    <Icon size={24} weight="light" className="text-white" />
  </div>

  {/* Content */}
  <h3 className="text-xl font-semibold text-white mb-2">Title</h3>
  <p className="text-white/60 text-sm">Description text here.</p>
</div>
```

### Complete Button Example

```tsx
<button className="hero-cta-button hero-cta-primary">
  Get Started
  <ArrowRight className="w-5 h-5" />
</button>
```

---

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Phosphor Icons (primary), Lucide React (secondary)
- **3D:** Spline (@splinetool/react-spline)
- **Fonts:** Inter (Google Fonts)

---

*Created for Poup's AI Hub - A premium glass-3D design system for modern web applications.*
