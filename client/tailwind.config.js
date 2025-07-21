/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx}"
    ],
    theme: {
      extend: {
        fontFamily: {
          hacker: ['"Share Tech Mono"', 'monospace'],
        },
        colors: {
          dark: '#121212',
          card: '#1e1e1e',
          neon: '#39ff14', // Neon green
        },
        boxShadow: {
          neon: '0 0 15px #39ff14',
        },
      },
    },
    plugins: [],
  };
  