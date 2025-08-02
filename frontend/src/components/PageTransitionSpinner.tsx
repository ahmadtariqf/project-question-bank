import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransitionSpinner() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 400); // simulate transition
    return () => clearTimeout(timeout);
  }, [pathname]);

  return loading ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 pointer-events-none">
      <div className="animate-spin -full h-10 w-10 border-t-2 border-b-2 border-[var(--accent)]"></div>
    </div>
  ) : null;
}