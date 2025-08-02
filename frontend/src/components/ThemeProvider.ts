import { useEffect } from "react";
import { usePreferencesContext } from "@/contexts/PreferencesContext";

import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { preferences, loading } = usePreferencesContext();

  useEffect(() => {
    if (loading) return;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const appliedTheme = preferences.theme === "light" || preferences.theme === "dark"
      ? preferences.theme
      : systemTheme;
    document.documentElement.setAttribute("data-theme", appliedTheme);
  }, [preferences, loading]);

  return children;
}