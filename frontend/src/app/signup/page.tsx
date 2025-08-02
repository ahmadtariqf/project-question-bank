"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";

const signupSchema = z
  .object({
    first_name: z.string().min(1, "Required"),
    last_name: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    phone: z
      .string()
      .optional()
    //   .regex(/^[0-9]+$/, "Digits only")
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "At least 8 chars")
      .regex(/[A-Z]/, "One uppercase required")
      .regex(/\d/, "One number required")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "One symbol required"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords must match",
  });
type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signup } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      await signup(
        data.first_name,
        data.last_name,
        data.email,
        data.password,
        data.confirm_password,
        data.phone || undefined
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8  shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

        {/** First & Last **/}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {["first_name", "last_name"].map((field) => (
            <div key={field}>
              <label className="block mb-1">
                {field === "first_name" ? "First Name" : "Last Name"}
              </label>
              <input
                {...register(field as "first_name" | "last_name")}
                className="w-full border  px-3 py-2"
                disabled={isSubmitting}
              />
              {errors[field as keyof SignupForm] && (
                <p className="text-red-600 text-sm">
                  {errors[field as keyof SignupForm]?.message as string}
                </p>
              )}
            </div>
          ))}
        </div>

        {/** Email **/}
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full border  px-3 py-2"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/** Phone **/}
        <div className="mb-4">
          <label className="block mb-1">Phone (optional)</label>
          <input
            {...register("phone")}
            type="text"
            className="w-full border  px-3 py-2"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-red-600 text-sm">{errors.phone.message}</p>
          )}
        </div>

        {/** Password & Confirm **/}
        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <input
            {...register("password")}
            type="password"
            className="w-full border  px-3 py-2"
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password.message}</p>
          )}
        </div>
        <div className="mb-6">
          <label className="block mb-1">Confirm Password</label>
          <input
            {...register("confirm_password")}
            type="password"
            className="w-full border  px-3 py-2"
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
          className="w-full bg-blue-600 text-white py-2  hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing up…" : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
