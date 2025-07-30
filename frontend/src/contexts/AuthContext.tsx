"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "../lib/axios";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // on mount, try to fetch current user
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
        const form = new URLSearchParams();
        form.append("username", email);
        form.append("password", password);

        const res = await api.post<{ access_token: string }>("/auth/login", form, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        setAccessToken(res.data.access_token);

        // fetch user profile
        const me = await api.get<User>("/users/me");
        setUser(me.data);
        router.push("/dashboard");
    };

    const signup = async (
        first_name: string,
        last_name: string,
        email: string,
        password: string,
        confirm_password: string,
        phone?: string
    ) => {
        await api.post("/auth/signup", {
            first_name,
            last_name,
            email,
            phone,
            password,
            confirm_password,
        });
        // after signup, redirect to verify page
        router.push(
            `/verify-email?email=${encodeURIComponent(email)}`
        );
    };

    const logout = async () => {
        await api.post("/auth/logout");
        clearAccessToken();
        setUser(null);
        router.push("/login");
    };

    const updateProfile = async (data: {
        first_name?: string;
        last_name?: string;
        phone?: string;
    }) => {
        const res = await api.put<User>("/users/me", data);
        setUser(res.data);
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, signup, logout, updateProfile, }}
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
