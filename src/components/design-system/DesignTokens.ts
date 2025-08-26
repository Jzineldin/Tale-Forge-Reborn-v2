// Tale Forge Design System Tokens
// Centralized design system for consistent UI across all pages

export const DESIGN_TOKENS = {
  // Color System
  colors: {
    primary: 'rgb(245, 158, 11)', // amber-500
    primaryHover: 'rgb(217, 119, 6)', // amber-600
    primaryLight: 'rgb(251, 191, 36)', // amber-400
    
    background: {
      primary: 'rgb(15, 23, 42)', // slate-900
      secondary: 'rgb(30, 41, 59)', // slate-800
      tertiary: 'rgb(51, 65, 85)', // slate-700
    },
    
    glass: {
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(0, 0, 0, 0.2)',
      dark: 'rgba(0, 0, 0, 0.4)',
    },
    
    border: {
      primary: 'rgba(245, 158, 11, 0.1)', // amber with opacity
      secondary: 'rgba(255, 255, 255, 0.1)',
      tertiary: 'rgba(255, 255, 255, 0.2)',
    },
    
    text: {
      primary: 'rgb(255, 255, 255)',
      secondary: 'rgba(255, 255, 255, 0.9)',
      tertiary: 'rgba(255, 255, 255, 0.7)',
      muted: 'rgba(255, 255, 255, 0.6)',
    },
    
    status: {
      success: 'rgb(34, 197, 94)', // green-500
      warning: 'rgb(245, 158, 11)', // amber-500
      error: 'rgb(239, 68, 68)', // red-500
      info: 'rgb(59, 130, 246)', // blue-500
    }
  },

  // Typography
  fonts: {
    heading: '"Cinzel", serif',
    body: '"Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  
  // Spacing and Layout
  spacing: {
    containerBase: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    containerSmall: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
    containerLarge: 'max-w-8xl mx-auto px-4 sm:px-6 lg:px-8',
    
    section: 'py-8',
    sectionLarge: 'py-16',
    
    card: 'p-6',
    cardSmall: 'p-4',
    cardLarge: 'p-8 md:p-12',
  },

  // Visual Effects
  effects: {
    // Glass morphism effects
    glassEnhanced: 'glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20',
    glassMedium: 'backdrop-blur-md bg-white/5 border border-white/10',
    glassCard: 'glass-card backdrop-blur-md bg-white/5 border border-white/10',
    
    // Refined card effect (used in HomePage)
    refinedCard: 'refined-card bg-slate-900/20 border border-amber-400/10',
    
    // Shadows
    shadow: {
      small: 'shadow-lg shadow-black/25',
      medium: 'shadow-xl shadow-black/25',
      large: 'shadow-2xl shadow-black/30',
    },
    
    // Hover effects
    hover: {
      scale: 'hover:transform hover:scale-105 transition-all duration-300',
      glow: 'hover:shadow-amber-500/25 hover:border-amber-400/30',
      lift: 'hover:-translate-y-1 transition-transform duration-300',
    },
    
    // Animations
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    pulse: 'animate-pulse',
  },

  // Component Variants
  components: {
    button: {
      primary: 'bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300',
      secondary: 'glass-card text-white border-white/30 px-6 py-3 rounded-lg transition-all duration-300 hover:bg-white/10',
      ghost: 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 px-4 py-2 rounded-lg transition-all duration-300',
    },
    
    input: {
      standard: 'glass-card bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/60 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20',
    }
  },

  // Breakpoints (Tailwind-compatible)
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
};

// Utility functions for consistent styling
export const getGlassEffect = (variant: 'light' | 'medium' | 'dark' = 'medium') => {
  switch (variant) {
    case 'light': return DESIGN_TOKENS.effects.glassMedium;
    case 'dark': return DESIGN_TOKENS.effects.glassEnhanced;
    default: return DESIGN_TOKENS.effects.glassMedium;
  }
};

export const getContainerClasses = (size: 'small' | 'base' | 'large' = 'base') => {
  switch (size) {
    case 'small': return DESIGN_TOKENS.spacing.containerSmall;
    case 'large': return DESIGN_TOKENS.spacing.containerLarge;
    default: return DESIGN_TOKENS.spacing.containerBase;
  }
};

export const getButtonClasses = (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
  return DESIGN_TOKENS.components.button[variant];
};

// CSS Custom Properties Export (for use in CSS/SCSS)
export const CSS_VARIABLES = {
  '--color-primary': DESIGN_TOKENS.colors.primary,
  '--color-primary-hover': DESIGN_TOKENS.colors.primaryHover,
  '--font-heading': DESIGN_TOKENS.fonts.heading,
  '--font-body': DESIGN_TOKENS.fonts.body,
} as const;