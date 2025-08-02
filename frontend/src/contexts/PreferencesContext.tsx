import { createContext, useContext } from "react";
import { usePreferences } from "@/lib/hooks/usePreferences";


type Preferences = {
  theme?: "light" | "dark";
  [key: string]: string | undefined;
};

const PreferencesContext = createContext<{ preferences: Preferences; loading: boolean }>({
  preferences: { theme: "light" }, // default theme
  loading: true,
});

import { ReactNode } from "react";

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { data: preferences = {}, isLoading: loading } = usePreferences();
  return (
    <PreferencesContext.Provider value={{ preferences, loading }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferencesContext() {
  return useContext(PreferencesContext);
}