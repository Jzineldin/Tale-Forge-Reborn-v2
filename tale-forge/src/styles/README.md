# Tale Forge Design System

This directory contains the organized CSS design system for Tale Forge.

## Files Structure

```
src/styles/
├── tale-forge-design-system.css  # Main design system classes
└── README.md                     # This documentation
```

## Design System Classes

### 🎨 Typography

#### `.fantasy-heading`
The main heading class for titles and important text.

**Usage:**
```html
<!-- Main Title -->
<h1 class="fantasy-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-6 sm:mb-8 text-center">
  TALE FORGE
</h1>

<!-- Subtitle -->
<h2 class="fantasy-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 tracking-wide">
  CREATE MAGICAL STORIES TOGETHER!
</h2>

<!-- Section Header -->
<h3 class="fantasy-heading text-2xl sm:text-3xl">
  Section Title
</h3>
```

**Features:**
- Cinzel font family
- Golden color (#fbbf24)
- Text shadow for readability
- Subtle glow effect

### 🔘 Buttons

#### `.fantasy-cta`
Primary call-to-action button with golden gradient.

**Usage:**
```html
<button class="fantasy-cta px-8 py-4 text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300">
  Start Creating Stories
</button>
```

**Features:**
- Cinzel font family
- Golden gradient background
- Hover effects with transform
- Inset highlights

#### `.btn-magical`
Alternative button with colorful gradient effect.

**Usage:**
```html
<button class="btn-magical px-6 py-3 text-base rounded-lg">
  Magical Action
</button>
```

**Features:**
- Multi-color gradient (gold, blue, purple)
- Smooth hover animations
- Subtle shadow effects

### 🪟 Glass Effects

#### `.glass`
Basic glassmorphism effect for general use.

**Usage:**
```html
<div class="glass p-4 rounded-lg">
  Basic glass content
</div>
```

#### `.glass-hero-container`
Special glass effect for hero sections with golden border.

**Usage:**
```html
<div class="glass-hero-container p-8 rounded-xl">
  Hero section content
</div>
```

#### `.glass-card`
Standard glassmorphism effect for cards and containers.

**Usage:**
```html
<div class="glass-card p-6 rounded-lg">
  Card content here
</div>
```

#### `.glass-enhanced`
Stronger glass effect for important elements with hover effects.

**Usage:**
```html
<div class="glass-enhanced p-6 border border-amber-500/30">
  Enhanced glass content
</div>
```

### ✨ Text Effects

#### Text Shadows
- `.text-shadow-sm` - Small shadow
- `.text-shadow-md` - Medium shadow  
- `.text-shadow-lg` - Large shadow
- `.text-shadow-xl` - Extra large shadow

**Usage:**
```html
<p class="text-white/90 text-shadow-lg">
  Text with shadow for readability
</p>
```

### 🎭 Animations

#### `.magical-pulse`
Subtle breathing/pulsing effect.

#### `.magical-float`
Gentle floating animation.

**Usage:**
```html
<div class="magical-float">
  Floating element
</div>
```

## Color Palette

### Golden Colors (Primary)
- `#fbbf24` - Main golden color
- `#f59e0b` - Medium golden
- `#d97706` - Dark golden
- `#b45309` - Darker golden

### Glass Effects
- `rgba(30, 41, 59, 0.25)` - Standard glass background
- `rgba(0, 0, 0, 0.4)` - Enhanced glass background
- `rgba(255, 255, 255, 0.2)` - Glass borders

## Font Stack

### Primary (Fantasy/Headings)
```css
font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
```

### Secondary (Body Text)
```css
font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
```

## Best Practices

1. **Always use `.fantasy-heading`** for main titles and CTAs
2. **Use `.fantasy-cta`** for primary action buttons
3. **Apply text shadows** to white text over cosmic background
4. **Use glass effects** sparingly for important UI elements
5. **Maintain consistent spacing** with Tailwind utilities

## Responsive Design

All classes are designed to work with Tailwind's responsive prefixes:
- `sm:` - 640px and up
- `md:` - 768px and up  
- `lg:` - 1024px and up
- `xl:` - 1280px and up
- `2xl:` - 1536px and up

## Integration

The design system is automatically imported in `src/index.css`:

```css
@import './styles/tale-forge-design-system.css';
```

No additional imports needed in components.
