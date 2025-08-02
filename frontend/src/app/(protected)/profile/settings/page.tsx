"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { usePreferences, useSetPreference } from "@/lib/hooks/usePreferences";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { FiUser, FiSettings, FiBell, FiEye } from "react-icons/fi";

const categories = [
	{
		key: "Account",
		icon: <FiUser />,
		desc: "Update your personal info.",
		fields: ["first_name", "last_name", "email", "phone"],
	},
	{
		key: "Appearance",
		icon: <FiEye />,
		desc: "Customize your theme.",
		fields: ["theme"],
	},
	{
		key: "Notifications",
		icon: <FiBell />,
		desc: "Manage notification settings.",
		fields: ["email_notifications", "sms_notifications"],
	},
	{
		key: "Accessibility",
		icon: <FiSettings />,
		desc: "Accessibility preferences.",
		fields: ["font_size", "contrast"],
	},
] as const;

type CategoryKey = typeof categories[number]["key"];

export default function SettingsPage() {
	const [activeCategory, setActiveCategory] = useState<CategoryKey>(
		categories[0].key
	);
	const { data: prefs, isLoading: prefsLoading } = usePreferences();
	const setPref = useSetPreference();
	const { user, updateProfile } = useAuth();
	const [profile, setProfile] = useState({
		first_name: user?.first_name ?? "",
		last_name: user?.last_name ?? "",
		email: user?.email ?? "",
		phone: user?.phone ?? "",
	});
	const [profileLoading, setProfileLoading] = useState(false);

	const handlePrefChange = async (key: string, value: string) => {
		try {
			await setPref.mutateAsync({ key, value });
			toast.success("Preference updated!");
		} catch {
			toast.error("Failed to update preference.");
		}
	};

	const handleProfileChange = (key: string, value: string) => {
		setProfile((prev) => ({ ...prev, [key]: value }));
	};

	const handleProfileSave = async () => {
		setProfileLoading(true);
		try {
			await updateProfile(profile);
			toast.success("Profile updated!");
		} catch {
			toast.error("Failed to update profile.");
		}
		setProfileLoading(false);
	};

	return (
		<div className="min-h-screen bg-[var(--background)] flex">
			{/* Sidebar */}
			<aside className="sticky top-0 h-screen w-100 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col py-6 px-0 shadow-sm">
				<h1 className="text-2xl font-bold mb-8 px-10 py-4 text-[var(--foreground)]">
					Settings
				</h1>
				<nav className="flex-1 space-y-3 px-4">
					{categories.map((cat) => (
						<button
							key={cat.key}
							className={`w-full flex flex-col items-start gap-1 px-6 py-3 rounded-lg font-medium transition-colors
              ${activeCategory === cat.key
								? "bg-[var(--accent-bg)] text-[var(--accent)] border-l-4 border-[var(--accent)] shadow"
								: "hover:bg-[var(--input-bg)] text-[var(--foreground)] border-l-4 border-transparent"
							}`}
							onClick={() => setActiveCategory(cat.key)}
							aria-current={
								activeCategory === cat.key ? "page" : undefined
							}
						>
							<span className="flex items-center gap-3">
								<span className="text-xl">{cat.icon}</span>
								<span>
									<span>{cat.key}</span>
									<span className="block text-xs font-normal text-[var(--muted)] text-left">
										{cat.desc} Fields to be updated:{" "}
										{cat.fields
											.map((field) => {
												const formatted = field.replace(/_/g, " ");
												return formatted.charAt(0).toUpperCase() + formatted.slice(1);
											})
											.join(", ")}
									</span>
								</span>
							</span>
						</button>
					))}
				</nav>
			</aside>

			{/* Main Content */}
			<main className="flex-1 px-8 py-8">
				<div className="w-full bg-[var(--surface)] rounded-xl shadow p-9 mx-auto">
					<h2 className="text-2xl font-bold mb-8 text-[var(--foreground)]">
						{activeCategory} Settings
					</h2>
					{activeCategory === "Account" ? (
						<form
							className="space-y-8"
							onSubmit={(e) => {
								e.preventDefault();
								handleProfileSave();
							}}
						>
							<div>
								<h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
									Profile
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block mb-2 text-sm font-medium text-[var(--muted)]">
											First Name
										</label>
										<Input
											type="text"
											onChange={(e) => handleProfileChange("first_name", e.target.value)}
											disabled={profileLoading}
											placeholder={user?.first_name ?? ""}
											className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--foreground)]"
											autoFocus
										/>
									</div>
									<div>
										<label className="block mb-2 text-sm font-medium text-[var(--muted)]">
											Last Name
										</label>
										<Input
											type="text"
											onChange={(e) =>
												handleProfileChange(
													"last_name",
													e.target.value
												)
											}
											disabled={profileLoading}
											placeholder={
												user?.last_name ?? ""
											}
											className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--foreground)]"
										/>
									</div>
								</div>
							</div>
							<div>
								<h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
									Personal Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block mb-2 text-sm font-medium text-[var(--muted)]">
											Email
										</label>
										<Input
											type="email"
											onChange={(e) =>
												handleProfileChange(
													"email",
													e.target.value
												)
											}
											disabled={profileLoading}
											placeholder={
												user?.email ?? ""
											}
											className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--foreground)]"
										/>
									</div>
									<div>
										<label className="block mb-2 text-sm font-medium text-[var(--muted)]">
											Phone
										</label>
										<Input
											type="text"
											onChange={(e) =>
												handleProfileChange(
													"phone",
													e.target.value
												)
											}
											disabled={profileLoading}
											placeholder={
												user?.phone ?? ""
											}
											className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--foreground)]"
										/>
									</div>
								</div>
							</div>
							<div className="flex justify-end gap-4 mt-8">
								<Button
									type="button"
									className="px-6 py-2 bg-[var(--input-bg)] text-[var(--foreground)] font-bold rounded cursor-pointer"
									disabled={profileLoading}
									onClick={() =>
										setProfile({
											first_name: user?.first_name ?? "",
											last_name: user?.last_name ?? "",
											email: user?.email ?? "",
											phone: user?.phone ?? "",
										})
									}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] font-bold rounded cursor-pointer"
									disabled={profileLoading}
								>
									{profileLoading ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</form>
					) : prefsLoading ? (
						<p className="text-[var(--muted)]">Loading…</p>
					) : (
						<form className="space-y-6">
							{categories
								.find((c) => c.key === activeCategory)!
								.fields.map((key) => (
									<div
										key={key}
										className="flex flex-col md:flex-row items-center gap-4"
									>
										<label className="w-40 font-medium capitalize text-[var(--muted)]">
											{key.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase())}
										</label>
										{key === "theme" ? (
											<select
												value={prefs?.theme ?? "light"}
												onChange={(e) =>
													handlePrefChange(
														"theme",
														e.target.value
													)
												}
												className="flex-1 px-2 py-2 border rounded bg-[var(--input-bg)] border-[var(--border)] focus:border-[var(--accent)] text-[var(--foreground)]"
											>
												<option value="light">Light</option>
												<option value="dark">Dark</option>
											</select>
										) : (
											<Input
												type="text"
												value={prefs?.[key] ?? ""}
												onChange={(e) =>
													handlePrefChange(key, e.target.value)
												}
												placeholder={prefs?.[key] ?? ""}
												className="flex-1 bg-[var(--input-bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--foreground)]"
											/>
										)}
									</div>
								))}
						</form>
					)}
				</div>
			</main>
		</div>
	);
}