"use client";

import { useActionState, useEffect, useRef } from "react";
import { subscribeToNewsletterAction } from "@/app/actions/newsletter";
import { Loader2, CheckCircle2 } from "lucide-react";

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

export default function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletterAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state?.success]);

  return (
    <div className="w-full max-w-md mx-auto font-sans">
      {state?.success ? (
        <div className="p-6 rounded-lg bg-[#FAF9F6]/10 border border-[#FAF9F6]/20 text-center animate-in fade-in zoom-in-95 duration-500">
          <CheckCircle2 className="w-8 h-8 text-[#D4C3B3] mx-auto mb-3" />
          <h4 className="text-lg font-serif text-white mb-2">Welcome to the Inner Circle</h4>
          <p className="text-sm text-[#FAF9F6]/70 leading-relaxed font-light">
            {state.message}
          </p>
        </div>
      ) : (
        <form ref={formRef} action={formAction} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <input
              type="email"
              name="email"
              required
              disabled={isPending}
              placeholder="Your email address"
              className="flex-1 bg-transparent border-b border-[#FAF9F6]/30 px-4 py-3 text-[#FAF9F6] focus:outline-none focus:border-[#FAF9F6] transition-colors rounded-none placeholder-[#FAF9F6]/40 text-sm font-light disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-3 bg-[#FAF9F6] text-[#2C241E] text-xs uppercase tracking-widest font-bold hover:bg-[#D4C3B3] hover:text-[#2C241E] transition-all duration-300 disabled:opacity-50 flex items-center justify-center min-w-[130px] cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#2C241E]" />
              ) : (
                "Subscribe"
              )}
            </button>
          </div>
          
          {state?.error && (
            <p className="text-[#D4C3B3] text-xs text-left px-1 mt-1 font-light animate-in slide-in-from-top-1">
              {state.error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
