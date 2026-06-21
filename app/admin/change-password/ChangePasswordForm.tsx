"use client";

import { useActionState, useEffect } from "react";
import { changePasswordAction, ActionResponse } from "@/app/auth/actions";
import { AlertCircle } from "lucide-react";

const initialState: ActionResponse = {
  error: "",
};



export default function ChangePasswordForm({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  useEffect(() => {
    if (state?.success && state?.redirectUrl) {
      window.location.href = state.redirectUrl;
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="userId" value={userId} />

      {state?.error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md text-sm flex items-center border border-red-200">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#2C241E]">
          New Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#8C7162] focus:border-[#8C7162] sm:text-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2C241E] hover:bg-[#8C7162] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C241E] transition-colors disabled:opacity-70"
        >
          {isPending ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
}
