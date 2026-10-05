import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        stake: {
          dark: "#0f212e",
          card: "#1a2c38",
          sidebar: "#1a2c38",
          border: "#213743",
          hover: "#2f4553",
          green: "#00e701",
          greenHover: "#00c701",
          muted: "#b1bad3",
          blue: "#1475e1",
          blueHover: "#0f5cbd",
        },
      },
    },
  },
  plugins: [],
};

export default config;
