# Tale Forge Icon System

## Overview

The Tale Forge Icon System provides a consistent way to display icons throughout the application. It uses the `tale-forge-logo.png` asset and provides various sizes and animation options.

## Icon Component

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string | 'tale-forge' | The name of the icon to display |
| size | 'small' \| 'medium' \| 'large' \| number | 'medium' | The size of the icon |
| color | string | 'currentColor' | The color of the icon |
| className | string | '' | Additional CSS classes to apply |
| onClick | function | undefined | Click handler for the icon |
| ariaLabel | string | undefined | Accessible label for the icon |
| animated | boolean | false | Whether to apply a default animation |
| animationType | 'pulse' \| 'spin' \| 'bounce' \| 'none' | 'none' | Specific animation to apply |

### Usage Examples

```tsx
// Basic usage
<Icon name="tale-forge" />

// With size
<Icon name="tale-forge" size="large" />

// With custom size
<Icon name="tale-forge" size={48} />

// With animation
<Icon name="tale-forge" animated={true} animationType="pulse" />

// With click handler
<Icon name="tale-forge" onClick={() => console.log('Icon clicked!')} />

// With accessible label
<Icon name="tale-forge" ariaLabel="Tale Forge Logo" />
```

## Icon Sizes

### Favicon Sizes
- 16x16px - Standard browser favicon
- 32x32px - High DPI browser favicon
- 48x48px - Windows app icon
- 192x192px - Google Chrome mobile favicon
- 512x512px - Google Chrome maskable icon

### Web Application Sizes
- 24x24px - Toolbar icons
- 32x32px - Navigation icons
- 48x48px - Large navigation icons
- 64x64px - Dashboard icons
- 128x128px - Feature highlights

### Mobile App Sizes
- iOS App Store: 1024x1024px
- iOS App Icon: 180x180px (iPhone), 167x167px (iPad Pro), 152x152px (iPad)
- Android Play Store: 512x512px
- Android App Icon: 192x192px, 144x144px, 96x96px, 72x72px, 48x48px

## File Structure

```
tale-forge/frontend/public/icons/
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── favicon-48x48.png
├── favicon-192x192.png
├── favicon-512x512.png
├── apple-touch-icon.png
├── android-chrome-192x192.png
├── android-chrome-512x512.png
├── tale-forge-icon.png
├── tale-forge-icon-24x24.png
├── tale-forge-icon-32x32.png
├── tale-forge-icon-48x48.png
├── tale-forge-icon-64x64.png
├── tale-forge-icon-128x128.png
└── variations/
    ├── monochrome/
    ├── outline/
    ├── filled/
    └── seasonal/
```

## Animations

The Icon component supports several animation types:

- **Pulse**: A subtle pulsing effect (`animate-pulse`)
- **Spin**: Continuous rotation (`animate-spin`)
- **Bounce**: Bouncing effect (`animate-bounce`)

## Accessibility

All icons include proper alt text and can have ARIA labels applied for accessibility.

## Best Practices

1. Use appropriate icon sizes for different contexts
2. Ensure sufficient color contrast for accessibility
3. Use animations sparingly to avoid distraction
4. Always provide meaningful alt text or ARIA labels
5. Test icons across different devices and screen sizes

## Integration Points

1. **Primary Navigation**: Logo in the header
2. **Mobile Navigation**: Icons in the bottom navigation bar
3. **Secondary Navigation**: Icons for sub-navigation items
4. **Buttons**: Icons within buttons for visual cues
5. **Loading States**: Animated icons for loading indicators
6. **Error Pages**: Icons in 404/500 pages