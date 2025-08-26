// Design System Components Export
export { default as FloatingElements } from './FloatingElements';
export { default as PageHeader } from './PageHeader';
export { default as StandardPage } from './StandardPage';
export { default as UnifiedCard, MetricCard, ActionCard, StatusCard } from './UnifiedCard';

// Design Tokens and Utilities
export { 
  DESIGN_TOKENS, 
  getGlassEffect, 
  getContainerClasses, 
  getButtonClasses,
  CSS_VARIABLES 
} from './DesignTokens';

// Types for design system
export interface DesignSystemProps {
  variant?: 'glass' | 'enhanced' | 'refined' | 'solid';
  size?: 'small' | 'medium' | 'large';
  padding?: 'small' | 'medium' | 'large';
  hover?: boolean;
  centered?: boolean;
}