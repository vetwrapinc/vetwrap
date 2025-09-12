/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        night: '#0A0A0F',
        accent: {
          blue: '#5FB7FA',
          amber: '#FFB26A'
        }
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        space: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        dmserif: ['DM Serif Display', 'serif']
      },
      boxShadow: {
        glow: '0 0 24px rgba(95,183,250,0.35)',
        innerGlow: 'inset 0 0 24px rgba(255,178,106,0.25)'
      },
      backdropBlur: {
        xs: '2px'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(10px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(10px) rotate(-360deg)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        orbit: 'orbit 14s linear infinite',
        shimmer: 'shimmer 3s linear infinite'
      },
      backgroundImage: {
        orbital: 'radial-gradient(1200px 600px at 10% -10%, rgba(95,183,250,0.18), transparent 60%), radial-gradient(1000px 500px at 110% 10%, rgba(255,178,106,0.14), transparent 60%)',
        glass: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
      },
      borderColor: {
        glass: 'rgba(255,255,255,0.12)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
};

