"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "../actions";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

const initialState = {
  error: "",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const message = searchParams?.get("message");
  
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state?.success && state?.redirectUrl) {
      window.location.href = state.redirectUrl;
    }
  }, [state]);

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-serif text-[#2C241E] mb-3">Welcome Back</h1>
        <p className="text-[#2C241E]/60 text-sm font-light">
          Sign in to access your curated wardrobe and exclusive offers.
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-md text-sm border border-green-200">
          {message}
        </div>
      )}

      {state?.error && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-md text-sm flex items-center border border-red-200">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        
        <div>
          <label htmlFor="identifier" className="block text-xs font-semibold uppercase tracking-widest text-[#2C241E] mb-2">
            Email or Phone Number
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            placeholder="hello@nayora.com"
            className="w-full bg-transparent border-b border-[#2C241E]/30 px-0 py-3 text-[#2C241E] focus:outline-none focus:border-[#8C7162] transition-colors placeholder:text-[#2C241E]/30"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-[#2C241E]">
              Password
            </label>
            <Link href="/auth/forgot-password" className="text-xs text-[#8C7162] hover:text-[#2C241E] transition-colors font-medium">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full bg-transparent border-b border-[#2C241E]/30 px-0 py-3 text-[#2C241E] focus:outline-none focus:border-[#8C7162] transition-colors placeholder:text-[#2C241E]/30"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 bg-[#2C241E] text-[#FAF9F6] text-xs uppercase tracking-widest font-bold hover:bg-[#8C7162] transition-colors duration-300 disabled:opacity-70 mt-8"
        >
          {isPending ? "Authenticating..." : "Sign In"}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-sm text-[#2C241E]/60">
          Don't have an account?{" "}
          <Link href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-[#2C241E] font-semibold hover:text-[#8C7162] transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
