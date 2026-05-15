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
        // Dark, calm palette. No bright/sexual colors — health-adjacent positioning.
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
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
