let defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "IBM Plex Sans KR",
          ...defaultTheme.fontFamily.sans
        ],
        serif: [
          "Hahmlet",
          ...defaultTheme.fontFamily.serif
        ]
      },
      textUnderlineOffset: {
        6: "6px"
      }
    }
  },
  variants: {},
  plugins: []
};
