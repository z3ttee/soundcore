const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    `src/**/*.{js,ts,jsx,tsx}`,
    // include packages if not transpiling
    // "../../packages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          light: "#99daf7",
          DEFAULT: "#6dcaf3",
          dark: "#49bdf0"
        },
        body: {
          lighter: "#3d3d3d",
          light: "#2d2d2d",
          DEFAULT: "#191919",
          dark: "#000000"
        },
        white: {
          light: colors.white,
          DEFAULT: "#CCCCCC",
          dark: "#BBBBBB"
        }
      },
      margin: ({ theme }) => ({
        row: theme("spacing.6"),
        box: "16px",
        window: "24px",
      }),
      padding: ({ theme }) => ({
        row: theme("spacing.6"),
        box: "16px",
        window: "24px",
      }),
      gap: theme => ({
        row: theme("spacing.6")
      }),
    },
    fontSize: {
      xxs: ['0.65rem', { lineHeight: '1rem' }],
      xs: ['0.8rem', { lineHeight: '1rem' }],
      sm: ['0.9rem', { lineHeight: '1.1rem' }],
      base: ['0.98rem', { lineHeight: '1.25rem' }],
      md: ["18px", { lineHeight: "2rem" }],
      lg: ['1rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.5rem' }],
      '4xl': ['2.25rem', { lineHeight: '3rem' }],
      '5xl': ['3rem', { lineHeight: '4rem' }]
    },
    fontWeight: {
      light: '300',
      normal: '500',
      bold: '700'
    }
  },
  plugins: [],
};