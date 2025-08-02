import { createContext, useContext, useState, useEffect } from "react";
import { registerGlobalLoadingSetter } from "@/lib/api/globalLoading";

const LoadingContext = createContext<{ loading: boolean }>({ loading: false });

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    registerGlobalLoadingSetter(setLoading);
  }, []);

  return (
    <LoadingContext.Provider value={{ loading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}