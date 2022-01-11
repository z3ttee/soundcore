const colors = require("tailwindcss/colors")

module.exports = {
    prefix: '',
    content: [
      './src/**/*.{html,ts,scss}',
    ],
    darkMode: 'class', // or 'media' or 'class'
    theme: {
      extend: {
        gridTemplateColumns: ({ theme }) => ({
          drawer: 'auto minmax(0, 1fr)',
          drawerClosed: 'auto',
          songs: 'repeat(auto-fill, minmax(' + theme("width.36") + ', 1fr))',
          uploads: 'repeat(auto-fill, minmax(' + theme("width.80") + ', 1fr))',
          auto: 'repeat(auto-fill, 1fr)'
        }),
        gridAutoColumns: ({ theme }) => ({
          'songs-hr': 'minmax(' + theme("width.36") + ', 1fr))'
        }),
        colors: {
          background: {
            light: "#1b2027",
            DEFAULT: "#181c22",
            dark: "#14181d"
          },
          primary: {
            light: "#272e38",
            DEFAULT: "#232932",
            dark: "#1b2027"
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
          'content-gradient': "linear-gradient(180deg, " + theme('colors.accent.dark') + " 0%, " + theme('colors.background.dark') + " 30%);",
          'gr-success': "linear-gradient(60deg, " + theme('colors.success.light') + " 0%, " + theme('colors.success.dark') + " 100%);",
          'gr-info': "linear-gradient(60deg, " + theme('colors.info.light') + " 0%, " + theme('colors.info.dark') + " 100%);",
          'gr-warn': "linear-gradient(60deg, " + theme('colors.warn.light') + " 0%, " + theme('colors.warn.dark') + " 100%);",
          'gr-error': "linear-gradient(60deg, " + theme('colors.error.light') + " 0%, " + theme('colors.error.dark') + " 100%);"
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