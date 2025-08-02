"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../lib/axios";

const verifySchema = z.object({
  code: z.string().min(1, "Code is required"),
});
type VerifyForm = z.infer<typeof verifySchema>;

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyForm>({ resolver: zodResolver(verifySchema) });

  const onSubmit = async (data: VerifyForm) => {
    try {
      await api.post("/auth/verify-email", { email, code: data.code });
      alert("Email verified! Please log in.");
      router.push("/login");
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8  shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Verify Email
        </h1>
        <p className="mb-4 text-sm text-gray-600">
          Enter the code sent to <strong>{email}</strong>.
        </p>

        <div className="mb-4">
          <label className="block mb-1">Verification Code</label>
          <input
            {...register("code")}
            className="w-full border  px-3 py-2"
            disabled={isSubmitting}
          />
          {errors.code && (
            <p className="text-red-600 text-sm">{errors.code.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2  hover:bg-green-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Verifying…" : "Verify"}
        </button>
      </form>
    </div>
  );
}
