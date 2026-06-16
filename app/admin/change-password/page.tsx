import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ChangePasswordPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-serif text-[#2C241E]">
          Welcome to Nayora Admin
        </h2>
        <p className="mt-2 text-center text-sm text-[#2C241E]/70">
          As this is your first time logging in, please change your password to continue.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-[#EAE5DF]">
          <ChangePasswordForm userId={session.userId} />
        </div>
      </div>
    </div>
  );
}
