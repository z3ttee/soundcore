const colors = require("tailwindcss/colors")

module.exports = {
    prefix: '',
    content: [
      './src/**/*.{html,ts,scss}',
    ],
    darkMode: 'class', // or 'media' or 'class'
    theme: {
      extend: {
        gridTemplateColumns: {
          drawer: 'auto minmax(0, 1fr)',
          drawerClosed: 'auto'
        },
        colors: {
          background: {
            light: "#1b2027",
            DEFAULT: "#181c22",
            dark: "#14181d"
          },
          primary: {
            light: "#272e38",
            DEFAULT: "#272e38",
            dark: "#14181d"
          },
          accent: {
            light: "#FFD97E",
            DEFAULT: "#FFCD69",
            dark: "#FFBF50"
          },
          error: {
            light: "#D25D5D",
            DEFAULT: "#c75151",
            dark: "#B94848"
          },
          warn: {
            light: "#FBC06E",
            DEFAULT: "#f0ad4e",
            dark: "#DE9939"
          },
          success: {
            light: "#66A55B",
            DEFAULT: "#538d4a",
            dark: "#497E40"
          },
          info: {
            light: "#378FC2",
            DEFAULT: "#277cad",
            dark: "#23719E"
          }
        },
        backgroundImage: theme => ({
          'sidebar-gradient': "linear-gradient(60deg, " + theme('colors.primary.dark') + " 0%, " + theme('colors.primary.light') + " 100%);",
          'player-gradient': "linear-gradient(-2deg, " + theme('colors.primary.dark') + " 0%, " + theme('colors.primary.light') + " 70%);",
          'content-gradient': "linear-gradient(180deg, " + theme('colors.accent.dark') + " 0%, " + theme('colors.background.dark') + " 30%);"
        })
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        white: {
          light: colors.white,
          DEFAULT: "#CCCCCC",
          dark: "#BBBBBB"
        }
      },
      screens: {
        '2xl': {'min-width': '1550px'},
        'xl': {'min-width': '1200px'},  // Desktop
        'lg': {'min-width': '1000px'},
        'md': {'min-width': '780px'},   // Tablet
        'sm': {'min-width': '540px'}    // Mobile
      },
      fontSize: {
        xs: ['0.8rem', { lineHeight: '1rem' }],
        sm: ['0.9rem', { lineHeight: '1.1rem' }],
        base: ['0.98rem', { lineHeight: '1.25rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }]
      },
      fontWeight: {
        light: '300',
        normal: '500',
        bold: '700'
      },
    },
    variants: {
      extend: {},
    },
    plugins: [
      require("@tailwindcss/line-clamp")
    ]
};