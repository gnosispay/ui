import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gp-icon-active": "#84AB4E",
        "gp-icon-inactive": "#BCBBB5",
        "gp-bg-app": "#FDFDFC",
        "gp-bg-subtle": "#FCFBF9",
        "gp-border": "#E2E1DE",
        "gp-text-hc": "#21201C",
        "gp-text-lc": "#63635E",
        primary: "#0E0E07",
        secondary: "#6E6C62",
        "gp-sand": "#F9F6F0",
        "green-brand-light": "#EDF3C0",
        "green-brand": "#CDDF52",
        "green-brand-dark": "#919E3A",
        "low-contrast": "#D4D0C5",
        "medium-contrast": "#85827A",
        "high-contrast": "#1B1A16",
        tertiary: "#F0EBDE",
        warning: "#D49913",
        danger: "#C53030",
        "warning-yellow": "#FFF5DC",
        "bg-secondary": "#FCF9F2",
        success: "#5AA472",
      },
      boxShadow: {
        "gp-container":
          "0px 2px 4px 0px rgba(61, 65, 47, 0.04), 0px 8px 8px 0px rgba(61, 65, 47, 0.03), 0px 17px 10px 0px rgba(61, 65, 47, 0.02), 0px 30px 12px 0px rgba(61, 65, 47, 0.01), 0px 47px 13px 0px rgba(61, 65, 47, 0.00)",
        "gp-card":
          "0px 6.17021px 13.88298px 0px rgba(0, 0, 0, 0.10), 0px 24.68085px 24.68085px 0px rgba(0, 0, 0, 0.09), 0px 55.53192px 33.93617px 0px rgba(0, 0, 0, 0.05), 0px 98.7234px 40.10638px 0px rgba(0, 0, 0, 0.01), 0px 154.25533px 43.19149px 0px rgba(0, 0, 0, 0.00)",
      },
      fontFamily: {
        brand: ["Obviously Wide", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@headlessui/tailwindcss"),
  ],
};
export default config;
