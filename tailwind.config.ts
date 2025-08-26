import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1440px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				'display': ['Cinzel', 'serif'],
				'mono': ['JetBrains Mono', 'monospace']
			},
			colors: {
				// Primary Amber/Orange colors
				amber: {
					50: '#fffbeb',
					100: '#fef3c7',
					200: '#fde68a',
					300: '#fcd34d',
					400: '#fbbf24',
					500: '#f59e0b',
					600: '#d97706',
					700: '#b45309',
					800: '#92400e',
					900: '#78350f'
				},
				// Dark backgrounds
				slate: {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#1e293b',
					900: '#0f172a',
					950: '#020617'
				},
				// Semantic colors using CSS variables
				primary: {
					DEFAULT: '#f59e0b',
					hover: '#d97706',
					active: '#b45309',
					foreground: '#ffffff'
				},
				background: {
					DEFAULT: '#0f172a',
					secondary: '#1e293b',
					card: 'rgba(30, 41, 59, 0.5)'
				},
				text: {
					primary: '#ffffff',
					secondary: '#e2e8f0',
					muted: '#94a3b8'
				},
				border: {
					DEFAULT: 'rgba(255, 255, 255, 0.1)',
					strong: 'rgba(245, 158, 11, 0.3)'
				}
			},
			backdropBlur: {
				xs: '2px',
				sm: '4px',
				md: '8px',
				lg: '12px',
				xl: '16px'
			},
			borderRadius: {
				lg: '0.75rem',
				md: '0.5rem',
				sm: '0.375rem',
				xl: '1rem',
				'2xl': '1.5rem'
			},
			boxShadow: {
				'glow-amber': '0 4px 12px rgba(245, 158, 11, 0.25)',
				'glow-amber-lg': '0 6px 20px rgba(245, 158, 11, 0.35)',
				'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
