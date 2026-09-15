import React, { createContext, useContext, useEffect, useState } from "react";
import { Theme as CarbonTheme } from "@carbon/react";

const ThemeContext = createContext({
  theme: "dark",
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
  carbonTheme: "g100",
});

const STORAGE_KEY = "mova_theme_preference";

export function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("mova_theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    if (savedTheme === "white" || savedTheme === "g10") return "light";
    if (savedTheme === "g100" || savedTheme === "g90") return "dark";

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch (e) {}
  return "dark"; // Default enterprise dark baseline
}

export function applyTheme(theme) {
  const root = document.documentElement;
  const isDark = theme === "dark";
  const carbonTheme = isDark ? "g100" : "white";

  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", isDark ? "dark" : "light");
  root.setAttribute("data-carbon-theme", carbonTheme);

  try {
    localStorage.setItem(STORAGE_KEY, theme);
    localStorage.setItem("mova_theme", theme);
    localStorage.setItem("mova_carbon_theme", carbonTheme);
  } catch (e) {}
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Initial setup & sync
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    // Normalise any carbon aliases
    let target = newTheme;
    if (target === "g100" || target === "g90") target = "dark";
    if (target === "white" || target === "g10") target = "light";

    if (target !== "dark" && target !== "light") return;
    if (target === theme) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || prefersReducedMotion) {
      applyTheme(target);
      setThemeState(target);
      return;
    }

    document.startViewTransition(() => {
      applyTheme(target);
      setThemeState(target);
    });
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        carbonTheme: theme === "dark" ? "g100" : "white",
        toggleTheme,
        setTheme,
      }}
    >
      <CarbonTheme theme={theme === "dark" ? "g100" : "white"} className="min-h-screen">
        {children}
      </CarbonTheme>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

