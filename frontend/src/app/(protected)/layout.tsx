import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  // 1. Read the session cookie
  const cookieStore = await cookies();
  // const { user, loading } = useAuth();
  const session = cookieStore.get("session_token")?.value;
  console.log("Session token:", session);
  const user = session ? getUserFromSession(session) : null;
  // console.log("User from session:", user);

  
  if (!session) {
    redirect("/login");
  }

  // While we’re checking auth, don’t flash protected content
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking Auth...</p>
      </div>
    );
  }

  // 4. Render children with user info (pass as prop if needed)
  return <>{children}</>;
}
