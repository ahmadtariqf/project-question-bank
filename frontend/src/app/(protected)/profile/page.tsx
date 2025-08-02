"use client";

import { useAuth } from "@/contexts/AuthContext";
import { FiUser, FiMail, FiPhone } from "react-icons/fi";
import { useEffect, useState } from "react";

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Convert hash to hex color
  const color = "#" + ((hash >> 24) & 0xFF).toString(16).padStart(2, "0") +
                      ((hash >> 16) & 0xFF).toString(16).padStart(2, "0") +
                      ((hash >> 8) & 0xFF).toString(16).padStart(2, "0");
  return color;
}

function timeAgo(date: string | Date) {
  if (!date) return "—";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec} seconds ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minutes ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hours ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} days ago`;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const initials = `${user?.first_name?.[0]?.toUpperCase() || ""}${user?.last_name?.[0]?.toUpperCase() || ""}`;
  const bgColor = stringToColor((user?.first_name || "") + (user?.last_name || ""));

  // Live "Last online" update
  const [lastOnline, setLastOnline] = useState(() =>
    user?.updated_at ? timeAgo(user.updated_at) : "—"
  );

  useEffect(() => {
    if (!user?.updated_at) return;
    const interval = setInterval(() => {
      setLastOnline(timeAgo(user.updated_at));
    }, 5000); // update every second
    return () => clearInterval(interval);
  }, [user?.updated_at]);

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <div className="max-w-6xl mx-auto my-8 p-4 md:p-8">
        <div className="md:flex md:space-x-6">
          {/* Sidebar/Profile Card */}
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <div className="bg-[var(--surface)] p-6 rounded-lg shadow border-t-4 border-[var(--accent)]">
              <div className="flex justify-center mb-4">
                <div
                  className="h-32 w-32 rounded-full flex items-center justify-center text-white text-7xl font-bold select-none"
                  style={{ backgroundColor: bgColor }}
                >
                  {initials}
                </div>
              </div>
              <h1 className="text-[var(--foreground)] font-bold text-xl text-center">{user?.first_name} {user?.last_name}</h1>
              <h3 className="text-[var(--muted)] text-center mt-1">{user?.role || "Member"}</h3>
              <p className="text-sm text-[var(--muted)] text-center mt-2">
                {user?.bio || "No bio available."}
              </p>
              <ul className="bg-[var(--input-bg)] text-[var(--muted)] mt-4 divide-y  shadow-sm">
                <li className="flex items-center py-3 px-3">
                  <span>Status</span>
                  <span className="ml-auto">
                    <span className="bg-[var(--accent)] py-1 px-2  text-white text-xs">Active</span>
                  </span>
                </li>
                <li className="flex items-center py-3 px-3">
                  <span>Member since</span>
                  <span className="ml-auto">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
                </li>
                <li className="flex items-center py-3 px-3">
                  <span>Last online</span>
                  <span className="ml-auto">{lastOnline}</span>
                </li>
              </ul>
            </div>
          </div>
          {/* Main Content */}
          <div className="w-full md:w-2/3">
            <div className="bg-[var(--surface)] p-6 shadow-sm mb-6">
              <div className="flex items-center space-x-2 font-semibold text-[var(--foreground)] mb-4">
                <FiUser className="text-[var(--accent)]" />
                <span className="tracking-wide">About</span>
              </div>
              <div className="text-[var(--muted)]">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-2 font-semibold">First Name</div>
                    <div className="px-4 py-2">{user?.first_name}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-2 font-semibold">Last Name</div>
                    <div className="px-4 py-2">{user?.last_name}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-2 font-semibold">Email</div>
                    <div className="px-4 py-2 flex items-center gap-2">
                      <FiMail className="text-[var(--accent)]" />
                      {user?.email}
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-2 font-semibold">Phone</div>
                    <div className="px-4 py-2 flex items-center gap-2">
                      <FiPhone className="text-[var(--accent)]" />
                      {user?.phone || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Add more sections here as needed, e.g. Experience, Education */}
          </div>
        </div>
      </div>
    </div>
  );
}
