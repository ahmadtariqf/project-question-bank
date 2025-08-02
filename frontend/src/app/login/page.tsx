"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { FiMail, FiLock } from "react-icons/fi";
import { useState } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import Input from "@/components/Input";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      
      await login(data.email, data.password);
      setErrorMsg(""); // Clear error on success
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>From Login Page...</p>
      </div>
    );
  }

  return (
    <section className="flex justify-center items-center h-screen bg-gray-800">
      <div className="max-w-md w-full bg-gray-900 rounded-lg p-6 space-y-6 shadow-lg">
        <div className="mb-4 text-center">
          <p className="text-gray-400">Sign In</p>
          <h2 className="text-2xl font-bold text-white mt-1">Join our community</h2>
        </div>
        {errorMsg && (
          <div className="mb-2 text-center">
            <span className="text-red-500 text-sm">{errorMsg}</span>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiMail />
              </span>
              <Input
                {...register("email")}
                type="email"
                placeholder="Email"
                className="w-full pl-10 p-4 text-sm bg-gray-50 focus:outline-none border border-gray-200 text-gray-600"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiLock />
              </span>
              <Input
                {...register("password")}
                type="password"
                placeholder="Password"
                className="w-full pl-10 p-4 text-sm bg-gray-50 focus:outline-none border border-gray-200 text-gray-600"
                disabled={isSubmitting}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          <div>
            <Button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-sm font-bold text-gray-50 transition duration-200 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in…" : "Sign In"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-row items-center">
              <Input
                type="checkbox"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                id="remember"
                disabled={isSubmitting}
              />
              <label htmlFor="remember" className="ml-2 text-sm font-normal text-gray-400">
                Remember me
              </label>
            </div>
            <div>
              <a className="text-sm text-blue-600 hover:underline" href="#">
                Forgot password?
              </a>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
