/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'genshin-dark': '#0B101E', 
        'genshin-gold': '#D3BC8E',
        'genshin-blue': '#4D7D9A',
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'shooting-star': 'shooting-star 5s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        'shooting-star': {
          '0%': { transform: 'translateX(0) translateY(0) rotate(45deg)', opacity: '1' },
          '100%': { transform: 'translateX(-1000px) translateY(1000px) rotate(45deg)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
