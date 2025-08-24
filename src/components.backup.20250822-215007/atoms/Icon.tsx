import React from 'react';

interface IconProps {
  name?: string;
  size?: 'small' | 'medium' | 'large' | number;
  color?: string;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
  animated?: boolean;
  animationType?: 'pulse' | 'spin' | 'bounce' | 'none';
  variation?: 'default' | 'filled' | 'outline' | 'monochrome' | 'seasonal';
}

// Add inline SVG support for common icons to prevent broken image placeholders
type SvgProps = { name: string; size: number; color: string; className?: string };

const SvgIcon: React.FC<SvgProps> = ({ name, size, color, className }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `${className || ''} inline-block`,
  } as React.SVGProps<SVGSVGElement>;

  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 12l9-9 9 9" />
          <path d="M9 21V9h6v12" />
        </svg>
      );
    case 'star':
      return (
        <svg {...common}>
          <polygon points="12 2 15 8.5 22 9.3 17 14 18.5 21 12 17.7 5.5 21 7 14 2 9.3 9 8.5" />
        </svg>
      );
    case 'quote':
    case 'quote-left':
    case 'quote-right':
      return (
        <svg {...common}>
          <path d="M7 17h4V7H5v6h2v4z" />
          <path d="M17 17h4V7h-6v6h2v4z" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 10-12 0v4c0 1.5-.8 2.8-2 3.5L4 17h16c-1.2-.7-2-2-2-3.5V8" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      );
    case 'user':
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case 'book':
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M4 4h13.5A2.5 2.5 0 0120 6.5V20" />
          <path d="M4 4v15.5A2.5 2.5 0 006.5 22H20" />
        </svg>
      );
    case 'key':
      return (
        <svg {...common}>
          <circle cx="7" cy="12" r="3" />
          <path d="M10 12h11" />
          <path d="M18 9l3 3-3 3" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'help-circle':
    case 'help':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    default:
      return null;
  }
};

const Icon: React.FC<IconProps> = ({
  name = 'tale-forge',
  size = 'medium',
  color = 'currentColor',
  className = '',
  onClick,
  ariaLabel,
  animated = false,
  animationType = 'none',
  variation = 'default',
}) => {
  // Map size presets to actual pixel values
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  };

  const actualSize = typeof size === 'number' ? size : sizeMap[size];

  // Define animation classes
  const getAnimationClasses = () => {
    if (!animated && animationType === 'none') return '';
    
    switch (animationType) {
      case 'pulse':
        return 'animate-pulse';
      case 'spin':
        return 'animate-spin';
      case 'bounce':
        return 'animate-bounce';
      default:
        return animated ? 'animate-pulse' : '';
    }
  };

  const animationClasses = getAnimationClasses();

  // Prefer inline SVGs for common icons (except the main tale-forge brand image)
  if (name !== 'tale-forge') {
    const inline = (
      <SvgIcon
        name={name}
        size={actualSize}
        color={color}
        className={`${className} ${animationClasses}`}
      />
    );
    if (inline) {
      return inline;
    }
  }

  // Construct the icon path based on the name and variation
  const getIconPath = () => {
    // For the tale-forge logo, use the main icon
    if (name === 'tale-forge') {
      if (variation === 'default') {
        return '/icons/tale-forge-icon.png';
      } else {
        return `/icons/variations/${variation}/tale-forge-icon.png`;
      }
    }
    
    // For other icons, try to find a matching icon with the specified variation
    if (variation === 'default') {
      return `/icons/${name}.png`;
    } else {
      return `/icons/variations/${variation}/${name}.png`;
    }
  };

  const iconPath = getIconPath();

  return (
    <img
      src={iconPath}
      alt={ariaLabel || `${name} icon`}
      width={actualSize}
      height={actualSize}
      className={`${className} ${animationClasses} inline-block`}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ color }}
      onError={(e) => {
        // Hide broken image if asset missing; inline SVGs handle most icons above
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

export default Icon;