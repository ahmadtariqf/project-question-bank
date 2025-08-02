"use client";

import { useLoading } from "@/contexts/LoadingContext";

// Add this spinner component in the same file or as a separate file
export default function GlobalLoadingSpinner() {
  const { loading } = useLoading();
  if (!loading) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="animate-spin -full h-10 w-10 border-t-2 border-b-2 border-[var(--accent)]"></div>
    </div>
  );
}
