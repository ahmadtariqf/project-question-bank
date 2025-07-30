"use client";

import { useForm } from "react-hook-form";
import { useAuth } from "../../../contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePreferences, useSetPreference } from "../../../lib/hooks/usePreferences";
import { useState } from "react";

const profileSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  phone: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name,
      last_name: user?.last_name,
      phone: user?.phone || "",
    },
  });

  const onSubmitProfile = async (data: ProfileForm) => {
    await updateProfile(data);
    alert("Profile updated!");
    reset(data);
  };

  // Preferences
  const { data: prefs, isLoading: loadingPrefs } = usePreferences();
  const setPref = useSetPreference();
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const onAddPref = async () => {
    if (!newKey) return alert("Key required");
    await setPref.mutateAsync({ key: newKey, value: newValue });
    setNewKey("");
    setNewValue("");
  };

  return (
    <div className="p-8 space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
        <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4 max-w-md">
          {(["first_name", "last_name"] as const).map((field) => (
            <div key={field}>
              <label className="block mb-1">
                {field === "first_name" ? "First Name" : "Last Name"}
              </label>
              <input
                {...register(field)}
                className="w-full border rounded px-3 py-2"
                disabled={isSubmitting}
              />
              {errors[field] && (
                <p className="text-red-600 text-sm">{errors[field]?.message}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block mb-1">Phone</label>
            <input
              {...register("phone")}
              className="w-full border rounded px-3 py-2"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm">{errors.phone.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Preferences</h2>

        {loadingPrefs ? (
          <p>Loading preferences…</p>
        ) : (
          <div className="space-y-4 max-w-lg">
            {prefs?.map((p) => (
              <div key={p.key} className="flex items-center space-x-2">
                <span className="w-32 font-medium">{p.key}</span>
                <input
                  type="text"
                  defaultValue={p.value}
                  className="flex-1 border rounded px-2 py-1"
                  onBlur={(e) =>
                    setPref.mutate({ key: p.key, value: e.currentTarget.value })
                  }
                />
                {setPref.isLoading && <span>Saving…</span>}
              </div>
            ))}

            <div className="mt-6 space-y-2">
              <h3 className="font-medium">Add New Preference</h3>
              <div className="flex space-x-2">
                <input
                  placeholder="Key"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="border rounded px-2 py-1 flex-1"
                />
                <input
                  placeholder="Value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="border rounded px-2 py-1 flex-1"
                />
                <button
                  onClick={onAddPref}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
