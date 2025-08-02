"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api/client";
import { setAccessToken, clearAccessToken } from "../lib/auth";

type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    is_active: boolean;
    email_verified: boolean;
    created_at: string;
    updated_at: string | null;
    preferences: {
        theme: "light" | "dark" | undefined;
    };
};

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (
        first_name: string,
        last_name: string,
        email: string,
        password: string,
        confirm_password: string,
        phone?: string
    ) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: {
        first_name?: string;
        last_name?: string;
        phone?: string;
    }) => Promise<void>;
    updatePreference: (key: string, value: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        api
            .get<User>("/users/me")
            .then((res) => setUser(res.data))
            .catch(() => {
                clearAccessToken();
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const form = new URLSearchParams();
            form.append("username", email);
            form.append("password", password);
            setLoading(true); 
            const res = await api.post<{ access_token: string }>("/auth/login", form, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            setAccessToken(res.data.access_token);

            const me = await api.get<User>("/users/me");
            setUser(me.data);
            setLoading(false);
            router.push("/dashboard");
        } catch (error: any) {
            throw error?.response?.data?.detail || "Login failed";
        }
    };

    const signup = async (
        first_name: string,
        last_name: string,
        email: string,
        password: string,
        confirm_password: string,
        phone?: string
    ) => {
        try {
            await api.post("/auth/signup", {
                first_name,
                last_name,
                email,
                phone,
                password,
                confirm_password,
            });
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (error: any) {
            throw error?.response?.data?.detail || "Signup failed";
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            // Optionally handle logout error
        }
        clearAccessToken();
        setUser(null);
        router.push("/login");
    };

    const updateProfile = async (data: {
        first_name?: string;
        last_name?: string;
        phone?: string;
    }) => {
        try {
            const res = await api.put<User>("/users/me", data);
            setUser(res.data);
        } catch (error: any) {
            throw error?.response?.data?.detail || "Profile update failed";
        }
    };

    const updatePreference = async (key: string, value: string) => {
        try {
            await api.put(`/users/me/preferences/${key}`, { key, value });
            // Re-fetch user to get updated preferences
            const me = await api.get<User>("/users/me");
            setUser(me.data);
        } catch (error: any) {
            throw error?.response?.data?.detail || "Preference update failed";
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, signup, logout, updateProfile, updatePreference }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return ctx;
}
