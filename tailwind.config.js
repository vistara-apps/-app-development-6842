/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220, 15%, 95%)',
        accent: 'hsl(160, 80%, 45%)',
        primary: 'hsl(210, 90%, 55%)',
        surface: 'hsl(0, 0%, 100%)',
        textPrimary: 'hsl(220, 15%, 15%)',
        textSecondary: 'hsl(220, 15%, 45%)',
        dark: {
          bg: 'hsl(220, 15%, 8%)',
          surface: 'hsl(220, 15%, 12%)',
          surfaceHover: 'hsl(220, 15%, 16%)',
          text: 'hsl(220, 15%, 95%)',
          textSecondary: 'hsl(220, 15%, 75%)',
          border: 'hsl(220, 15%, 20%)',
        }
      },
      borderRadius: {
        'lg': '18px',
        'md': '12px',
        'sm': '8px',
      },
      boxShadow: {
        'card': '0 4px 16px hsla(0, 0%, 0%, 0.08)',
        'card-dark': '0 4px 16px hsla(0, 0%, 0%, 0.3)',
      },
      spacing: {
        'lg': '24px',
        'md': '16px',
        'sm': '8px',
      }
    },
  },
  plugins: [],
}