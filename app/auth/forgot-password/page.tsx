"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "../actions";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type State = {
  error?: string;
  success?: boolean;
  message?: string;
};

const initialState: State = {
  error: "",
  success: false,
  message: "",
};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-serif text-[#2C241E] mb-3">Reset Password</h1>
        <p className="text-[#2C241E]/60 text-sm font-light">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {state?.success && state?.message && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-md text-sm flex items-center border border-green-200">
          <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
          {state.message}
        </div>
      )}

      {state?.error && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-md text-sm flex items-center border border-red-200">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-[#2C241E] mb-2">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="hello@nayora.com"
            className="w-full bg-transparent border-b border-[#2C241E]/30 px-0 py-3 text-[#2C241E] focus:outline-none focus:border-[#8C7162] transition-colors placeholder:text-[#2C241E]/30"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || state?.success}
          className="w-full py-4 bg-[#2C241E] text-[#FAF9F6] text-xs uppercase tracking-widest font-bold hover:bg-[#8C7162] transition-colors duration-300 disabled:opacity-70 mt-8"
        >
          {isPending ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-sm text-[#2C241E]/60">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-[#2C241E] font-semibold hover:text-[#8C7162] transition-colors">
            Back to Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
