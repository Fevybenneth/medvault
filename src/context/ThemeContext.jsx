import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "medvault-theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

function getStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

function resolveTheme(theme) {
  if (theme === "system") {
    return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
  }
  return theme;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    resolveTheme(getStoredTheme()),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);

    if (theme !== "system") {
      setResolvedTheme(theme);
      return;
    }

    setResolvedTheme(resolveTheme("system"));

    const mql = window.matchMedia(MEDIA_QUERY);
    const handleChange = () => setResolvedTheme(resolveTheme("system"));
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
