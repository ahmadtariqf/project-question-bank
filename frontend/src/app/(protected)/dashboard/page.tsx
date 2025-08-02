"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.first_name}!</h1>
      <p className="text-gray-700">
        This is your dashboard. From here you can:
      </p>
      <ul className="list-disc list-inside mt-3 space-y-1">
        <li>View and take quizzes</li>
        <li>Manage your profile and preferences</li>
        <li>…and much more as we build out the app</li>
      </ul>
    </div>
  );
}
