/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        body: {
          lighter: "#3d3d3d",
          light: "#2d2d2d",
          DEFAULT: "#191919",
          dark: "#000000"
        },
        accent: {
          DEFAULT: "#ffbf50"
        },
        font: {
          secondary: "#7b7b7b",
          DEFAULT: "#d4d4d4",
          tertiary: "#434343"
        },
        error: {
          light: "#cd6262",
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
      spacing: {
        window: "24px",
        box: "16px"
      },
      margin: ({ theme }) => ({
        row: theme("spacing.6"),
      }),
      padding: ({ theme }) => ({
        row: theme("spacing.6"),
      }),
      gap: theme => ({
        row: theme("spacing.6")
      }),
      minWidth: theme => ({
        ...theme("spacing")
      }),
      minHeight: theme => ({
        ...theme("spacing")
      }),
      maxWidth: theme => ({
        ...theme("spacing")
      }),
      backgroundImage: theme => ({
        "divider": "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%);",
        "collection": "linear-gradient(130deg, rgba(255,191,80,0.7) -20%, rgba(166,150,121,0.5) 100%)"
      }),
      gridTemplateColumns: {
        autofit: "repeat(auto-fit, minmax(0, 1fr))"
      },
      scale: {
        "97": "97%",
        "99": "99%"
      },
      keyframes: theme => ({
        skeleton: {
          "0%, 100%": { backgroundColor: theme("colors.body.light") },
          "50%": { backgroundColor: theme("colors.body.lighter") }
        },
        progressInc: {
          "0%": { left: "-5%", width: "5%" },
          "100%": { left: "130%", width: "100%" }
        },
        progressDec: {
          "0%": { left: "-80%", width: "80%" },
          "100%": { left: "110%", width: "10%" }
        }
      }),
      animation: {
        skeleton: "skeleton 2s ease-in-out infinite",
        progressInc: "progressInc 2s infinite",
        progressDec: "progressDec 2s 0.45s infinite"
      }
    },
    screens: {
      'sm': '540px', // >= Tablet
      'md': '780px', // >= Laptop
      'lg': '1000px', // >= Desktop
      'xl': '1200px', // >= Bigger Desktop
      '2xl': '1550px'
    },
    fontSize: {
      xs: ["10px", { lineHeight: "0.96rem" }],
      sm: ["12px", { lineHeight: "1.1rem" }],
      base: ["14px", { lineHeight: "1.5rem" }],
      md: ["18px", { lineHeight: "2rem" }],
      lg: ["24px", { lineHeight: "2.2rem" }],
      xl: ["31px", { lineHeight: "2.8rem" }],
      "2xl": ["39px", { lineHeight: "3.5rem" }],
      "3xl": ["48px", { lineHeight: "4.3rem" }],
      "4xl": ["56px", { lineHeight: "5.0rem" }],
    },
    fontWeight: {
      light: 400,
      normal: 500,
      semi: 600,
      bold: 700
    },
    borderRadius: {
      none: "0",
      sm: "4px",
      DEFAULT: "8px",
      md: "12px",
      full: "9999px"
    }
  },
  plugins: [
    require("@tailwindcss/line-clamp")
  ]
}
