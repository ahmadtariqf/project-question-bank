"use client";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

function getCurrentLocale() {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  return match ? match[1] : "en";
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    setLocale(getCurrentLocale());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    if (newLocale === locale) return;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/`;
    setLocale(newLocale);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      disabled={isPending}
    >
      <option value="en">English</option>
      <option value="ar">العربية</option>
    </select>
  );
}