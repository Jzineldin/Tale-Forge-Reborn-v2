# 🎨 Tale-Forge Unified Design System

## Overview
This unified design system ensures consistent styling across all pages, matching the magical aesthetic of your HomePage.

## Key Components

### 1. **PageLayout** 
Wraps entire pages with consistent background, floating elements, and spacing.

```tsx
import { PageLayout } from '@/components/layout';

// Basic usage
<PageLayout>
  {/* Your page content */}
</PageLayout>

// Advanced usage
<PageLayout 
  variant="hero"           // 'default' | 'hero' | 'story' | 'minimal'
  maxWidth="lg"           // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showFloatingElements    // Boolean - magical floating particles
  noPadding              // Boolean - remove default padding
  className="custom-class"
>
  {/* Content */}
</PageLayout>
```

### 2. **CardLayout**
Consistent glass morphism cards matching HomePage design.

```tsx
import { CardLayout } from '@/components/layout';

<CardLayout 
  variant="default"    // 'default' | 'hero' | 'elevated' | 'flat'
  padding="lg"        // 'sm' | 'md' | 'lg' | 'xl'
  hoverable           // Boolean - enable hover effects
  bordered={true}     // Boolean - show border
>
  {/* Card content */}
</CardLayout>
```

### 3. **TypographyLayout**
Consistent typography using design system classes.

```tsx
import { TypographyLayout } from '@/components/layout';

<TypographyLayout 
  variant="hero"      // 'hero' | 'section' | 'card' | 'body' | 'caption'
  as="h1"            // HTML element to render
  align="center"     // 'left' | 'center' | 'right'
  color="primary"    // 'primary' | 'secondary' | 'muted' | 'amber' | 'white'
  className="mb-4"
>
  Your Text Here
</TypographyLayout>
```

## Design System Classes

### Core Classes (Clean, No Mixing)
- **Glass Effects**: `.glass-card`, `.glass-enhanced`, `.glass`
- **Typography**: 
  - Hero: `.title-hero`
  - Sections: `.title-section`
  - Cards: `.title-card`, `.title-card-amber`, `.title-card-small`
  - Body: `.text-body`, `.text-body-sm`, `.text-body-xs`
  - Stats: `.stat-value`, `.stat-value-large`, `.stat-value-green`, `.stat-value-blue`, `.stat-label`, `.stat-label-sm`
- **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`
- **Containers**: `.container-sm`, `.container-md`, `.container-lg`

### CSS Variables
All colors, spacing, and effects use CSS variables from `src/index.css`:
- `--color-primary` (Amber #f59e0b)
- `--glass-bg`, `--glass-border` 
- `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`

## ⚠️ **DO NOT MIX TAILWIND WITH DESIGN SYSTEM CLASSES**

**WRONG** ❌:
```tsx
<h3 className="title-card text-amber-400 mb-1">  {/* DON'T mix classes */}
<p className="text-body text-sm">              {/* DON'T mix classes */}
```

**CORRECT** ✅:
```tsx
<h3 className="title-card-amber mb-1">  {/* Use dedicated variants */}
<p className="text-body-sm">            {/* Use dedicated variants */}
```

## Usage Examples

### Before (Inconsistent + Mixed Classes)
```tsx
const MyPage = () => (
  <div className="min-h-screen p-8">
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h1 className="text-2xl font-bold text-gray-900">Title</h1>
      <p className="text-gray-600 text-sm">Content</p>  {/* Mixed classes! */}
    </div>
  </div>
);
```

### After (Clean Design System)
```tsx
import { PageLayout, CardLayout, TypographyLayout } from '@/components/layout';

const MyPage = () => (
  <PageLayout maxWidth="lg" showFloatingElements>
    <CardLayout variant="default" padding="lg" hoverable>
      <TypographyLayout variant="section" as="h1" className="mb-4">
        Title
      </TypographyLayout>
      <TypographyLayout variant="body" color="secondary">
        Content
      </TypographyLayout>
    </CardLayout>
  </PageLayout>
);
```

## Automatic CSS Fixes

The system automatically fixes common inconsistencies:
- Gray backgrounds → Glass morphism
- Standard text colors → Design system colors  
- Plain buttons → Glass-styled buttons
- Basic cards → Glass cards
- Missing floating elements added to `.page-content`

## Migration Guide

1. **Import the components**:
   ```tsx
   import { PageLayout, CardLayout, TypographyLayout } from '@/components/layout';
   ```

2. **Wrap pages with PageLayout**:
   ```tsx
   // Replace
   <div className="page-content">
   
   // With
   <PageLayout maxWidth="lg">
   ```

3. **Convert cards**:
   ```tsx
   // Replace
   <div className="bg-white rounded-lg p-6">
   
   // With  
   <CardLayout variant="default" padding="lg">
   ```

4. **Update typography**:
   ```tsx
   // Replace
   <h1 className="text-2xl font-bold">
   
   // With
   <TypographyLayout variant="section" as="h1">
   ```

## Benefits

✅ **Consistent Look**: All pages match HomePage aesthetic  
✅ **Automatic Fixes**: Legacy styles auto-enhanced  
✅ **Type Safety**: Full TypeScript support  
✅ **Maintainable**: Central design system  
✅ **Performant**: CSS variables and optimized classes  
✅ **Responsive**: Mobile-first design  

## Quick Start

For new pages, use this template:

```tsx
import React from 'react';
import { PageLayout, CardLayout, TypographyLayout } from '@/components/layout';

const NewPage: React.FC = () => {
  return (
    <PageLayout maxWidth="lg" showFloatingElements>
      <CardLayout variant="default" padding="lg">
        <TypographyLayout variant="hero" as="h1" align="center" className="mb-8">
          Page Title
        </TypographyLayout>
        
        <TypographyLayout variant="body" className="mb-6">
          Your content here...
        </TypographyLayout>
      </CardLayout>
    </PageLayout>
  );
};

export default NewPage;
```

This ensures perfect consistency with your HomePage design! ✨