import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferencesContext } from "@/contexts/PreferencesContext";
import { useState, useRef } from "react";
import { useSetPreference } from "@/lib/hooks/usePreferences";
import Button from "@/components/Button";
import { FiUser, FiSettings, FiLogOut, FiMoon, FiSun, FiHome } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import LanguageSwitcher from "@/components/LanguageSwitcher";


export default function Navbar() {
    const { user, logout } = useAuth();
    const { preferences } = usePreferencesContext();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const closeTimeout = useRef<NodeJS.Timeout | null>(null);

    const currentTheme = preferences.theme === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    const setPref = useSetPreference();

    const handleThemeSwitch = async () => {
        await setPref.mutateAsync({ key: "theme", value: nextTheme });
    };

    // Dropdown open/close helpers for better UX
    const handleMouseEnter = () => {
        if (closeTimeout.current) clearTimeout(closeTimeout.current);
        setUserMenuOpen(true);
    };
    const handleMouseLeave = () => {
        closeTimeout.current = setTimeout(() => setUserMenuOpen(false), 180);
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-[#131826] border-b border-[#e2e8f0] z-50 shadow-lg" role="navigation" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center font-bold text-white text-2xl tracking-tight">
                    <span className="mr-2"><FiHome /></span>
                    QuizForge
                </Link>
                {/* Center Links */}
                <div className="hidden md:flex flex-1 justify-center gap-12">
                    <Link href="/dashboard" className="flex items-center gap-2 text-white font-semibold text-lg hover:text-[#3bb2f6] transition">
                        <MdDashboard className="text-xl" />
                        Dashboard
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-2 text-white font-semibold text-lg hover:text-[#3bb2f6] transition">
                        <div className="px-10 mb-4">
                            <LanguageSwitcher />
                        </div>
                    </Link>
                </div>
                {/* Right Side */}
                <div className="flex items-center gap-4">
                    {/* User Dropdown */}
                    {user ? (
                        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                            <button
                                className="flex items-center gap-2 px-4 py-2  bg-[#232946] text-white font-bold transition border border-[#3bb2f6]"
                                aria-haspopup="true"
                                aria-expanded={userMenuOpen}
                            >
                                <FiUser className="text-lg" />
                                {user.first_name}
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {userMenuOpen && (
                                <div
                                    className="absolute top-full right-0 w-64 bg-[#232946] border border-[#3bb2f6] shadow-xl z-20 py-4 px-3
                                                transition-all duration-200 ease-out animate-dropdown"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                    style={{ minWidth: "240px" }}
                                >
                                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 -md text-white hover:bg-[#3bb2f6] hover:text-white transition font-medium" onClick={() => setUserMenuOpen(false)}>
                                        <FiUser className="text-lg" />
                                        Profile
                                    </Link>
                                    <Link href="/profile/settings" className="flex items-center gap-2 px-4 py-2 -md text-white hover:bg-[#3bb2f6] hover:text-white transition font-medium" onClick={() => setUserMenuOpen(false)}>
                                        <FiSettings className="text-lg" />
                                        Settings
                                    </Link>
                                    <Button
                                        type="button"
                                        onClick={handleThemeSwitch}
                                        aria-label="Switch theme"
                                        className="w-full flex items-center gap-2 text-left px-4 py-2 mt-2 border border-[#3bb2f6] bg-[#232946] text-[#3bb2f6] hover:bg-[#3bb2f6] hover:text-white transition -md font-medium  cursor-pointer"
                                    >
                                        {currentTheme === "dark" ? <FiMoon className="text-lg" /> : <FiSun className="text-lg" />}
                                        {currentTheme === "dark" ? "Dark" : "Light"} Mode
                                    </Button>
                                    <div className="my-3 border-t border-dashed border-[#3bb2f6]" />
                                    <Button
                                        type="button"
                                        onClick={logout}
                                        className="w-full flex items-center gap-2 text-left px-4 py-2 bg-[#232946] text-white hover:bg-[#232946] font-bold -md transition  cursor-pointer"
                                        style={{ fontWeight: "bold", letterSpacing: "0.5px" }}
                                    >
                                        <FiLogOut className="text-lg" />
                                        Logout
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="px-4 py-2  bg-[#3bb2f6] text-white hover:bg-[#2563eb] transition font-semibold flex items-center gap-2">
                            <FiUser className="text-lg" />
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}