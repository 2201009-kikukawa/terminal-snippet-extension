/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/webview/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ▼▼▼【ここから追加】▼▼▼
      keyframes: {
        "accordion-down": {
          from: { height: "0px" }, // "0" ではなく "0px"
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0px" }, // "0" ではなく "0px"
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      // ▲▲▲【ここまで追加】▲▲▲
    },
  },
  plugins: [],
}

