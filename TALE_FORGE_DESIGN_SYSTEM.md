# Tale Forge Design System Documentation

## Overview

Tale Forge uses a comprehensive design system built on **Tailwind CSS** with custom CSS variables and a unified component architecture. The system emphasizes **glassmorphism effects**, **orange/amber color schemes**, and **fantasy-themed typography** while maintaining mobile-first responsive design principles.

## Technical Implementation

- **CSS Framework**: Tailwind CSS with custom configuration
- **Styling Approach**: Hybrid CSS variables + Tailwind utility classes
- **Component System**: Unified `tf-*` prefixed classes with shadcn/ui compatibility
- **Responsive Strategy**: Mobile-first with progressive enhancement
- **Browser Support**: Modern browsers with webkit prefixes for glassmorphism

## Color Palette & Theming

### Primary Brand Colors

```css
/* Primary Amber/Orange Scheme */
--tf-primary: #f59e0b;           /* Main brand color */
--tf-primary-dark: #d97706;      /* Darker variant */
--tf-primary-light: #fcd34d;     /* Lighter variant */

/* Gold Accents */
--tf-gold: #D4AF37;              /* Rich gold */
--tf-gold-dark: #B8860B;         /* Dark gold */
--tf-gold-light: #F5E6A3;        /* Light gold */

/* Tale Forge Specific Colors */
--tale-forge-gold: #F4D03F;      /* Custom gold */
--tale-forge-orange: #FF9500;    /* Custom orange */
--tale-forge-orange-hover: #E6851A; /* Orange hover state */
```

### Secondary Colors

```css
--tf-blue: #3B82F6;              /* Kid-friendly blue */
--tf-green: #10B981;             /* Kid-friendly green */
--tf-purple: #8B5CF6;            /* Kid-friendly purple */
--tf-pink: #F472B6;              /* Kid-friendly pink */
--tf-orange: #FB923C;            /* Secondary orange */
--tf-red: #EF4444;               /* Error/danger red */
```

### Text Colors

```css
--tf-text-primary: #FFFFFF;      /* Primary white text */
--tf-text-secondary: rgba(255, 255, 255, 0.8); /* Secondary text */
--tf-text-muted: rgba(255, 255, 255, 0.6);     /* Muted text */
--tf-text-subtle: rgba(255, 255, 255, 0.4);    /* Subtle text */
--tf-text-dark: #1F2937;         /* Dark text for light backgrounds */
--tf-text-inverse: #000000;      /* Inverse text */
```

### Background Colors

```css
--tf-bg-primary: rgba(15, 23, 42, 0.9);        /* Primary dark background */
--tf-bg-secondary: rgba(30, 41, 59, 0.8);      /* Secondary background */
--tf-bg-overlay: rgba(0, 0, 0, 0.5);           /* Overlay background */
--tf-bg-card: rgba(15, 23, 42, 0.4);           /* Glass card background */
--tf-bg-card-hover: rgba(15, 23, 42, 0.6);     /* Card hover state */
--tf-bg-glass: rgba(255, 255, 255, 0.1);       /* Glass effect */
--tf-bg-surface: rgba(30, 41, 59, 0.3);        /* Surface background */
```

### Border Colors

```css
--tf-border-primary: rgba(255, 255, 255, 0.3);    /* Primary borders */
--tf-border-secondary: rgba(245, 158, 11, 0.5);   /* Secondary borders */
--tf-border-focus: rgba(245, 158, 11, 0.8);       /* Focus state borders */
--tf-border-subtle: rgba(255, 255, 255, 0.1);     /* Subtle borders */
```

## Typography System

### Font Families

```css
/* Primary Font Stack */
--tf-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Fantasy/Heading Fonts */
--tf-font-serif: 'Cinzel', Georgia, 'Times New Roman', serif;
--tf-font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
```

**Font Usage:**
- **Inter**: Primary font for all UI elements, body text, buttons, and navigation
- **Cinzel**: Fantasy serif font for headings and magical titles
- **Playfair Display**: Alternative serif for special headings (legacy)
- **Crimson Text**: Italic serif for subtitles and special text

### Font Sizes (Mobile-First)

```css
--tf-text-xs: 0.75rem;      /* 12px - Small labels */
--tf-text-sm: 0.875rem;     /* 14px - Secondary text */
--tf-text-base: 1rem;       /* 16px - Body text (mobile safe) */
--tf-text-lg: 1.125rem;     /* 18px - Large body text */
--tf-text-xl: 1.25rem;      /* 20px - Small headings */
--tf-text-2xl: 1.5rem;      /* 24px - Medium headings */
--tf-text-3xl: 1.875rem;    /* 30px - Large headings */
--tf-text-4xl: 2.25rem;     /* 36px - Hero text mobile */
--tf-text-5xl: 3rem;        /* 48px - Hero text desktop */
--tf-text-6xl: 3.75rem;     /* 60px - Display text */
--tf-text-7xl: 4.5rem;      /* 72px - Large display */
--tf-text-8xl: 6rem;        /* 96px - Massive display */
```

### Font Weights

```css
--tf-weight-light: 300;
--tf-weight-normal: 400;
--tf-weight-medium: 500;
--tf-weight-semibold: 600;
--tf-weight-bold: 700;
--tf-weight-extrabold: 800;
--tf-weight-black: 900;
```

### Line Heights

```css
--tf-leading-tight: 1.2;     /* Headings */
--tf-leading-normal: 1.5;    /* Body text */
--tf-leading-relaxed: 1.6;   /* Comfortable reading */
--tf-leading-loose: 1.8;     /* Very relaxed */
```

### Typography Classes

```css
.text-hero {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--tf-text-primary);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.text-heading {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--tf-text-primary);
}

.text-body {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
  color: var(--tf-text-primary);
}
```

## Spacing System

```css
--tf-space-xs: 0.25rem;   /* 4px - Minimal spacing */
--tf-space-sm: 0.5rem;    /* 8px - Small spacing */
--tf-space-md: 1rem;      /* 16px - Base spacing unit */
--tf-space-lg: 1.5rem;    /* 24px - Large spacing */
--tf-space-xl: 2rem;      /* 32px - Extra large spacing */
--tf-space-2xl: 3rem;     /* 48px - Section spacing */
--tf-space-3xl: 4rem;     /* 64px - Page spacing */
--tf-space-4xl: 6rem;     /* 96px - Hero spacing */
```

## Border Radius

```css
--tf-radius-sm: 8px;      /* Small radius */
--tf-radius-md: 12px;     /* Medium radius */
--tf-radius-lg: 16px;     /* Large radius */
--tf-radius-xl: 24px;     /* Extra large radius */
--tf-radius-full: 9999px; /* Full radius (pills) */
```

## Shadows & Effects

```css
--tf-shadow-sm: 0 4px 20px rgba(0, 0, 0, 0.15);
--tf-shadow-md: 0 8px 32px rgba(0, 0, 0, 0.3);
--tf-shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.4);
--tf-shadow-glow: 0 0 20px rgba(245, 158, 11, 0.1);
--tf-shadow-focus: 0 0 0 3px rgba(245, 158, 11, 0.1);
```

## Transitions & Animations

```css
--tf-transition-fast: 0.15s ease-in-out;     /* Quick interactions */
--tf-transition-normal: 0.3s ease-in-out;    /* Standard transitions */
--tf-transition-slow: 0.5s ease-in-out;      /* Deliberate animations */
--tf-transition-bounce: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## Button Components & Styling

### Base Button System

All buttons use the unified `tf-btn` class system with consistent styling:

```css
.tf-btn {
  /* Base button styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--tf-space-sm);
  font-family: var(--tf-font-sans);
  font-weight: var(--tf-weight-semibold);
  font-size: var(--tf-text-base);
  line-height: var(--tf-leading-normal);
  border-radius: var(--tf-radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--tf-transition-normal);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  touch-action: manipulation;

  /* Mobile-first sizing */
  min-height: 44px;
  min-width: 44px;
  padding: var(--tf-space-md) var(--tf-space-lg);
}
```

### Button Variants

#### Primary Button
```css
.tf-btn-primary {
  background: linear-gradient(135deg, var(--tf-primary), var(--tf-primary-dark));
  color: var(--tf-text-primary);
  box-shadow: var(--tf-shadow-sm);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.tf-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--tf-primary-dark), #b45309);
  transform: translateY(-1px);
  box-shadow: var(--tf-shadow-md);
}
```

#### Secondary Button
```css
.tf-btn-secondary {
  background: transparent;
  color: var(--tf-primary);
  border: 2px solid var(--tf-primary);
  box-shadow: var(--tf-shadow-sm);
}

.tf-btn-secondary:hover:not(:disabled) {
  background: var(--tf-primary);
  color: var(--tf-text-primary);
  transform: translateY(-1px);
}
```

#### Ghost Button
```css
.tf-btn-ghost {
  background: rgba(15, 23, 42, 0.3);
  color: var(--tf-primary-light);
  border: 2px solid var(--tf-primary-light);
  backdrop-filter: blur(8px);
}

.tf-btn-ghost:hover:not(:disabled) {
  background: rgba(251, 191, 36, 0.15);
  border-color: var(--tf-primary);
  color: var(--tf-text-primary);
  transform: translateY(-1px);
}
```

### Orange Gradient Button Variants

#### Deep Orange Button (Most Orange)
```css
.tf-btn-orange {
  background: linear-gradient(135deg, #ea580c, #fb923c, #fdba74);
  color: white;
  border: none;
  box-shadow: var(--tf-shadow-sm);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.tf-btn-orange:hover:not(:disabled) {
  background: linear-gradient(135deg, #c2410c, #ea580c, #fb923c);
  transform: translateY(-1px);
  box-shadow: var(--tf-shadow-md);
}
```

#### Orange-Amber Button (Regular Orange)
```css
.tf-btn-orange-amber {
  background: linear-gradient(135deg, #f59e0b, #fbbf24, #fcd34d);
  color: white;
  border: none;
  box-shadow: var(--tf-shadow-sm);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.tf-btn-orange-amber:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706, #f59e0b, #fbbf24);
  transform: translateY(-1px);
  box-shadow: var(--tf-shadow-md);
}
```

#### Yellow-Orange Button (Yellowish Orange)
```css
.tf-btn-yellow-orange {
  background: linear-gradient(135deg, #fbbf24, #fcd34d, #fde68a);
  color: #92400e;
  border: none;
  box-shadow: var(--tf-shadow-sm);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.tf-btn-yellow-orange:hover:not(:disabled) {
  background: linear-gradient(135deg, #f59e0b, #fbbf24, #fcd34d);
  color: white;
  transform: translateY(-1px);
  box-shadow: var(--tf-shadow-md);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
```

### Button Sizes

```css
/* Default size is base tf-btn */
.tf-btn-sm {
  min-height: 36px;
  padding: var(--tf-space-sm) var(--tf-space-md);
  font-size: var(--tf-text-sm);
}

.tf-btn-lg {
  min-height: 52px;
  padding: var(--tf-space-lg) var(--tf-space-xl);
  font-size: var(--tf-text-lg);
}

.tf-btn-icon {
  min-height: 44px;
  min-width: 44px;
  padding: var(--tf-space-md);
  aspect-ratio: 1;
}
```

### Button States

```css
.tf-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.tf-btn:focus {
  outline: none;
  box-shadow: var(--tf-shadow-focus);
}

.tf-btn:active {
  transform: scale(0.95);
}
```

## Glass Container Styling (Landing Page Signature)

The glass container system is the signature visual element of Tale Forge, providing a consistent glassmorphism aesthetic across all pages.

### Base Glass Container

```css
.glass-enhanced {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.glass-enhanced:hover {
  background: rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

### Glass Card Variants

#### Standard Glass Card
```css
.glass-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
```

#### Hero Glass Container
```css
.glass-hero {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

#### Glass Input Fields
```css
.glass-input {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(8px) !important;
  border-radius: 8px;
  color: white !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.3s ease;
}

.glass-input::placeholder {
  color: rgba(255, 255, 255, 0.7) !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}

.glass-input:focus {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  outline: none;
}
```

### Glass Container Usage Examples

#### Landing Page Hero Section
```html
<div class="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl p-6 md:p-8 lg:p-10">
  <!-- Hero content -->
</div>
```

#### Story Card Container
```html
<div class="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-lg">
  <!-- Story card content -->
</div>
```

#### Feature Section
```html
<div class="glass-enhanced rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12">
  <!-- Feature content -->
</div>
```

### Mobile Glass Optimizations

```css
@media (max-width: 768px) {
  .glass-enhanced {
    background: rgba(0, 0, 0, 0.3) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
  }

  .glass-hero {
    background: rgba(0, 0, 0, 0.3) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
  }

  .glass-input {
    background: rgba(0, 0, 0, 0.3) !important;
    backdrop-filter: blur(8px) !important;
    border: 2px solid rgba(255, 255, 255, 0.2) !important;
  }
}
```

## Component Architecture

### Form Elements

#### Input Fields
```css
.tf-input {
  width: 100%;
  min-height: 44px;
  padding: var(--tf-space-md);
  font-family: var(--tf-font-sans);
  font-size: var(--tf-text-base);
  line-height: var(--tf-leading-normal);
  color: var(--tf-text-primary);
  background: var(--tf-bg-card);
  border: 1px solid var(--tf-border-primary);
  border-radius: var(--tf-radius-md);
  transition: all var(--tf-transition-normal);
}

.tf-input:focus {
  background: var(--tf-bg-card-hover);
  border-color: var(--tf-border-focus);
  box-shadow: var(--tf-shadow-focus);
  outline: none;
}
```

#### Form Labels
```css
.tf-label {
  font-size: var(--tf-text-sm);
  font-weight: var(--tf-weight-medium);
  color: var(--tf-text-secondary);
  margin-bottom: var(--tf-space-xs);
  display: block;
}
```

### Card Components

#### Base Card System
```css
.tf-card {
  background: var(--tf-bg-card);
  border: 1px solid var(--tf-border-primary);
  border-radius: var(--tf-radius-lg);
  box-shadow: var(--tf-shadow-sm);
  overflow: hidden;
  transition: all var(--tf-transition-normal);
}

.tf-card:hover {
  background: var(--tf-bg-card-hover);
  border-color: var(--tf-border-secondary);
  box-shadow: var(--tf-shadow-md);
  transform: translateY(-2px);
}

.tf-card-header {
  padding: var(--tf-space-lg);
  border-bottom: 1px solid var(--tf-border-primary);
}

.tf-card-content {
  padding: var(--tf-space-lg);
}

.tf-card-footer {
  padding: var(--tf-space-lg);
  border-top: 1px solid var(--tf-border-primary);
  background: var(--tf-bg-surface);
}
```

#### Story Card Variants
```css
.story-card-container {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(8px);
  background: linear-gradient(135deg, rgba(30, 30, 40, 0.7), rgba(20, 20, 30, 0.8));
  border: 1px solid rgba(255, 191, 0, 0.2);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 191, 0, 0.1) inset;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  min-height: 200px;
}

/* Landscape variant */
.story-card.landscape {
  aspect-ratio: 16/9;
}

/* Portrait variant */
.story-card.portrait {
  aspect-ratio: 3/4;
}

/* Compact variant */
.story-card.compact {
  padding: var(--tf-space-sm);
}

/* Featured variant */
.story-card.featured {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--tf-shadow-lg);
}
```

### Navigation Elements

#### Header Styling
```css
.header-glassmorphic {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--tf-z-header);
}
```

#### Navigation Links
```css
.nav-link {
  color: var(--tf-text-secondary);
  text-decoration: none;
  padding: var(--tf-space-sm) var(--tf-space-md);
  border-radius: var(--tf-radius-sm);
  transition: all var(--tf-transition-normal);
  font-weight: var(--tf-weight-medium);
}

.nav-link:hover {
  color: var(--tf-text-primary);
  background: var(--tf-bg-glass);
}

.nav-link.active {
  color: var(--tf-primary);
  background: rgba(245, 158, 11, 0.1);
}
```

## Responsive Breakpoints & Mobile Adaptations

### Breakpoint System

```css
/* Mobile First Breakpoints */
/* xs: 0px - 640px (default) */
/* sm: 641px - 768px */
/* md: 769px - 1024px */
/* lg: 1025px - 1280px */
/* xl: 1281px - 1536px */
/* 2xl: 1537px+ */
```

### Mobile-First Responsive Utilities

```css
/* Mobile Only (0-640px) */
@media (max-width: 640px) {
  .tf-mobile-only { display: block !important; }
  .tf-desktop-only { display: none !important; }

  /* Mobile button adjustments */
  .tf-btn {
    min-height: 48px;
    font-size: var(--tf-text-base);
  }

  /* Mobile typography */
  .tf-text-responsive {
    font-size: var(--tf-text-base) !important;
  }

  /* Mobile spacing */
  .tf-container {
    padding-left: var(--tf-space-md);
    padding-right: var(--tf-space-md);
  }
}

/* Desktop (641px+) */
@media (min-width: 641px) {
  .tf-mobile-only { display: none !important; }
  .tf-desktop-only { display: block !important; }
}
```

### Mobile Typography Scaling

```css
@media (max-width: 768px) {
  /* Heading size adjustments */
  h1 {
    font-size: 1.875rem !important;
    line-height: 1.2 !important;
  }

  h2 {
    font-size: 1.5rem !important;
    line-height: 1.3 !important;
  }

  h3 {
    font-size: 1.25rem !important;
    line-height: 1.4 !important;
  }

  /* Body text mobile optimization */
  p, .text-base {
    font-size: 0.875rem !important;
    line-height: 1.5 !important;
  }

  /* Small text mobile readability */
  .text-sm {
    font-size: 0.8125rem !important;
    line-height: 1.4 !important;
  }
}
```

### Mobile Component Adaptations

```css
@media (max-width: 768px) {
  /* Container padding adjustments */
  .container {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  /* Section spacing mobile optimization */
  .section {
    padding-top: 32px !important;
    padding-bottom: 32px !important;
  }

  /* Grid layout mobile adjustments */
  .grid {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }

  /* Story card mobile optimizations */
  .story-card {
    height: 280px;
    padding: 16px;
  }

  /* Form inputs mobile optimization */
  input[type="text"],
  input[type="email"],
  input[type="password"],
  textarea,
  select {
    font-size: 16px !important; /* Prevents zoom on iOS */
    min-height: 44px !important;
    padding: 0.75rem !important;
    border-radius: 0.5rem !important;
  }
}
```

### Small Mobile Devices (320px - 480px)

```css
@media (max-width: 480px) {
  /* Hero section optimizations */
  .tale-forge-title {
    font-size: 1.75rem !important;
    line-height: 1.1 !important;
    margin-bottom: 0.5rem !important;
  }

  /* Button optimizations */
  button {
    font-size: 0.875rem !important;
    padding: 0.5rem 0.75rem !important;
    min-height: 48px !important;
  }

  /* Container padding */
  .container {
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
  }

  /* Story card adjustments */
  .story-card {
    height: 260px;
    padding: 12px;
  }
}
```

## Animation System

### Keyframe Animations

```css
@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes magical-float {
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(5deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(5px) rotate(-5deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

@keyframes loader-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
```

### Animation Classes

```css
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

.animate-magical-float {
  animation: magical-float 4s ease-in-out infinite;
}

.animate-pulse-bob {
  animation: pulse 1.2s infinite, loader-bob 1.2s infinite;
}
```

## Z-Index System

```css
--tf-z-base: 0;           /* Base layer */
--tf-z-dropdown: 10;      /* Dropdowns */
--tf-z-sticky: 20;        /* Sticky elements */
--tf-z-header: 30;        /* Site header */
--tf-z-overlay: 40;       /* Overlays */
--tf-z-modal: 50;         /* Modals */
--tf-z-popover: 60;       /* Popovers */
--tf-z-tooltip: 70;       /* Tooltips */
--tf-z-toast: 80;         /* Toast notifications */
--tf-z-max: 9999;         /* Maximum z-index */
```

### Mobile Z-Index Management

```css
@media (max-width: 768px) {
  .header { z-index: 40 !important; }
  .mobile-nav { z-index: 50 !important; }
  .feedback-widget { z-index: 45 !important; }
  .dropdown { z-index: 9999 !important; }
  .modal { z-index: 10000 !important; }
  .tooltip { z-index: 10001 !important; }
}
```

## Utility Classes

### Text Shadows for Readability

```css
.text-shadow-sm {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.text-shadow-md {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
}

.text-shadow-lg {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3);
}
```

### Spacing Utilities

```css
/* Space-Y utilities (vertical spacing between children) */
.tf-space-y-sm > * + * { margin-top: var(--tf-space-sm); }
.tf-space-y-md > * + * { margin-top: var(--tf-space-md); }
.tf-space-y-lg > * + * { margin-top: var(--tf-space-lg); }
.tf-space-y-xl > * + * { margin-top: var(--tf-space-xl); }
.tf-space-y-2xl > * + * { margin-top: var(--tf-space-2xl); }
```

## Implementation Guidelines

### CSS Framework Integration

1. **Tailwind CSS**: Primary framework with custom configuration
2. **CSS Variables**: Design tokens defined in `:root` for consistency
3. **Component Classes**: Unified `tf-*` prefixed classes for components
4. **Responsive Design**: Mobile-first approach with progressive enhancement

### File Structure

```
src/styles/
├── global.css                    # Base styles and Tailwind imports
├── unified-design-system.css     # Main design system file
├── design-tokens.css             # CSS variables and tokens
├── magical-theme.css             # Fantasy theme styles
├── components.css                # Component-specific styles
├── mobile-first-optimizations.css # Mobile optimizations
└── custom-styles.css             # Legacy and custom styles
```

### Usage Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Prefer utility classes** for spacing and layout
3. **Use glass containers** for consistent visual hierarchy
4. **Apply mobile-first responsive design** principles
5. **Maintain accessibility** with proper focus states and contrast
6. **Use semantic HTML** with appropriate ARIA labels

### Browser Support

- **Modern browsers** (Chrome 88+, Firefox 87+, Safari 14+, Edge 88+)
- **Webkit prefixes** included for glassmorphism effects
- **Graceful degradation** for older browsers without backdrop-filter support

This design system ensures visual consistency across all Tale Forge pages while maintaining the signature glassmorphism aesthetic and orange/amber color scheme that defines the brand identity.
```
```
```
