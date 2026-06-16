"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signupAction } from "../actions";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

const initialState = {
  error: "",
};

function SignupForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  useEffect(() => {
    if (state?.success && state?.redirectUrl) {
      window.location.href = state.redirectUrl;
    }
  }, [state]);

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-serif text-[#2C241E] mb-3">Create Account</h1>
        <p className="text-[#2C241E]/60 text-sm font-light">
          Join Nayora to curate your personal style and experience premium shopping.
        </p>
      </div>

      {state?.error && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-md text-sm flex items-center border border-red-200">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        
        <div>
          <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-widest text-[#2C241E] mb-1">
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="John Doe"
            className="w-full bg-transparent border-b border-[#2C241E]/30 px-0 py-2.5 text-[#2C241E] focus:outline-none focus:border-[#8C7162] transition-colors placeholder:text-[#2C241E]/30"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-[#2C241E] mb-1">
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="hello@nayora.com"
            className="w-full bg-transparent border-b border-[#2C241E]/30 px-0 py-2.5 text-[#2C241E] focus:outline-none focus:border-[#8C7162] transition-colors placeholder:text-[#2C241E]/30"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-widest text-[#2C241E] mb-1">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="w-full bg-transparent border-b border-[#2C241E]/30 px-0 py-2.5 text-[#2C241E] focus:outline-none focus:border-[#8C7162] transition-colors placeholder:text-[#2C241E]/30"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-[#2C241E] mb-1">
            Password *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Min. 8 characters"
            className="w-full bg-transparent border-b border-[#2C241E]/30 px-0 py-2.5 text-[#2C241E] focus:outline-none focus:border-[#8C7162] transition-colors placeholder:text-[#2C241E]/30"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 bg-[#2C241E] text-[#FAF9F6] text-xs uppercase tracking-widest font-bold hover:bg-[#8C7162] transition-colors duration-300 disabled:opacity-70 mt-6"
        >
          {isPending ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-[#2C241E]/60">
          Already have an account?{" "}
          <Link href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-[#2C241E] font-semibold hover:text-[#8C7162] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
