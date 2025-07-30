"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../lib/axios";

const resetSchema = z
  .object({
    code: z.string().min(1, "Code is required"),
    new_password: z
      .string()
      .min(8, "At least 8 chars")
      .regex(/[A-Z]/, "One uppercase required")
      .regex(/\d/, "One number required")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "One symbol required"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords must match",
  });
type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    try {
      await api.post("/auth/reset-password", {
        email,
        code: data.code,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });
      alert("Password reset! Please log in.");
      router.push("/login");
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Reset Password
        </h1>
        <p className="mb-4 text-sm text-gray-600">
          We emailed a code to <strong>{email}</strong>.
        </p>

        <div className="mb-4">
          <label className="block mb-1">Reset Code</label>
          <input
            {...register("code")}
            className="w-full border rounded px-3 py-2"
            disabled={isSubmitting}
          />
          {errors.code && (
            <p className="text-red-600 text-sm">{errors.code.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1">New Password</label>
          <input
            {...register("new_password")}
            type="password"
            className="w-full border rounded px-3 py-2"
            disabled={isSubmitting}
          />
          {errors.new_password && (
            <p className="text-red-600 text-sm">
              {errors.new_password.message}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block mb-1">Confirm Password</label>
          <input
            {...register("confirm_password")}
            type="password"
            className="w-full border rounded px-3 py-2"
            disabled={isSubmitting}
          />
          {errors.confirm_password && (
            <p className="text-red-600 text-sm">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Resetting…" : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
