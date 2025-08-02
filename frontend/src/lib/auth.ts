import api from "./api/client";

// Store access token in memory (or localStorage for persistence)
// This is a simple implementation; consider using a more secure storage solution for production
// such as HttpOnly cookies or secure storage mechanisms.
// For simplicity, this example uses a variable, but you can adapt it to your needs.
// Note: This is not secure for production use; consider using HttpOnly cookies or secure storage
// mechanisms for sensitive data. 
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken || localStorage.getItem("access_token");
}

export function setAccessToken(token: string) {
  accessToken = token;
  localStorage.setItem("access_token", token);
}

export function clearAccessToken() {
  accessToken = null;
  localStorage.removeItem("access_token");
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch (e) {
    // Ignore errors, just proceed
    console.error("Logout API call failed, proceeding to clear session.");
  }
  clearAccessToken();
  window.location.href = "/login";
}

export async function getUserFromSession(sessionToken: string) {
  try {
    const res = await api.get("/auth/session", {
      headers: {
        Cookie: `session_token=${sessionToken}`,
      },
      withCredentials: true,
    });
    return res.data;
  } catch {
    return null;
  }
}

// export async function getUserFromSession(sessionToken: string) {
//   const res = await fetch(`${process.env.BACKEND_URL}/auth/session`, {
//     headers: {
//       Cookie: `session_token=${sessionToken}`,
//     },
//     credentials: "include",
//   });
//   if (!res.ok) return null;
//   return await res.json();
// }