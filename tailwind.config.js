const flowbite = require("flowbite-react/tailwind");

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(151, 147, 235)',
        primaryLight: 'rgb(203, 224, 242)',
        secondary: 'rgb(235, 147, 151)',
        accent: 'rgb(100, 181, 246)',
      }
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}
