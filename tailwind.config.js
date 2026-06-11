/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand primitives — Figma `0:1 Foundations` page.
        bg: '#0B0B0F',
        surface: '#15151C',
        surface2: '#1E1E27',
        border: '#2A2A36',
        ink: '#F5F5F7',
        muted: '#8A8A95',
        accent: '#7C5CFF',
        accentSoft: '#5B45C4',
        success: '#3FB984',
        danger: '#E5484D',

        // Semantic aliases — what components MUST consume (per Figma rule:
        // "Components MUST consume aliases, not brand primitives").
        'text-primary': '#F5F5F7',
        'text-muted': '#8A8A95',
        'text-inverse': '#0B0B0F',
        'surface-canvas': '#0B0B0F',
        'surface-raised': '#15151C',
        'surface-sunken': '#1E1E27',
        'border-default': '#2A2A36',
        'interactive-primary': '#7C5CFF',
        'interactive-primary-pressed': '#5B45C4',
        'feedback-success': '#3FB984',
        'feedback-danger': '#E5484D',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        display: ['Inter_600SemiBold'],
      },
      fontSize: {
        // Figma typography scale. Each tuple is [size, { lineHeight, fontWeight }].
        // NativeWind only reads the size and lineHeight — weight comes from
        // the matching fontFamily class (font-sans / font-medium / font-semibold).
        'display-2xl': ['60px', { lineHeight: '72px' }],
        'display-xl': ['48px', { lineHeight: '56px' }],
        'display-lg': ['36px', { lineHeight: '44px' }],
        'heading-lg': ['30px', { lineHeight: '38px' }],
        'heading-md': ['24px', { lineHeight: '32px' }],
        'heading-sm': ['20px', { lineHeight: '28px' }],
        'body-lg': ['18px', { lineHeight: '28px' }],
        'body-md': ['16px', { lineHeight: '24px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        'body-xs': ['12px', { lineHeight: '16px' }],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        // Figma elevation scale. Drop shadows on dark surfaces — use sparingly.
        'elev-0': 'none',
        'elev-1': '0 1px 2px rgba(0,0,0,0.4)',
        'elev-2': '0 4px 12px rgba(0,0,0,0.5)',
        'elev-3': '0 12px 32px rgba(0,0,0,0.6)',
      },
      transitionDuration: {
        instant: '0ms',
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
        accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
  plugins: [],
};
