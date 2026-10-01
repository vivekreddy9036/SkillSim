import { useEffect, useState } from "react";
import { applyTheme, getInitialTheme, type Theme } from "../theme.js";
import { SunIcon, MoonIcon } from "./Icons.js";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="flex items-center justify-center h-7 w-7 rounded-md text-ink-dim hover:text-ink hover:bg-surface-3/60 transition-colors"
    >
      {theme === "dark" ? <SunIcon size={15} /> : <MoonIcon size={15} />}
    </button>
  );
}
