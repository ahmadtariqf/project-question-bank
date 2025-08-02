"use client"

import { ReactNode, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Providers from "./Providers";
import { notFound } from "next/navigation";
import en from "../../messages/en.json";
import ar from "../../messages/ar.json";


import { AuthProvider } from "../contexts/AuthContext";
import { queryClient } from "../lib/queryClient";
import { setRefreshLoadingSetter } from "@/lib/api/refreshLoading";
import { ThemeProvider } from "../components/ThemeProvider";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import Navbar from "@/components/Navbar";
import PageTransitionSpinner from "@/components/PageTransitionSpinner";
import { LoadingProvider, useLoading } from "@/contexts/LoadingContext";
import GlobalLoadingSpinner from "@/components/GlobalLoadingSpinner";


// ...inside your component's JSX
export default function AppShell({ children, locale }: { children: ReactNode; locale: string }) {

  // Set the refresh loading state setter for API calls
  // This allows the API client to update the loading state during token refresh
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    setRefreshLoadingSetter(setRefreshLoading);
  }, []);

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body>
        <LoadingProvider>
          <GlobalLoadingSpinner />
          <PageTransitionSpinner />
          {refreshLoading && <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"><span>Refreshing session...</span></div>}
          <Toaster position="top-right" reverseOrder={false} />
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <PreferencesProvider>
                {/* <Providers locale={locale} messages={messages}> */}
                  <ThemeProvider>
                    <Navbar />
                    <div className="pt-14"> {/* Add top padding to offset fixed navbar */}
                        {children}
                    </div>
                  </ThemeProvider>
                {/* </Providers> */}
              </PreferencesProvider>
            </AuthProvider>
          </QueryClientProvider>
        </LoadingProvider>
      </body>
    </html >
  );
}

