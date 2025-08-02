import { ReactNode } from "react";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import AppShell from "./AppShell"; // <-- Client component

import en from "../../messages/en.json";
import ar from "../../messages/ar.json";

const messagesMap: Record<string, any> = { en, ar };

// ...inside your component's JSX
export default async function RootLayout({ children }: { children: ReactNode }) {

  // Server-side: get locale from cookie or fallback
  const cookieStore = await cookies();
  // 1. Try to get from cookie
  let locale = cookieStore.get('NEXT_LOCALE')?.value || "en";

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body>
        <NextIntlClientProvider locale={locale}>
          <AppShell locale={locale}>{children}</AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

