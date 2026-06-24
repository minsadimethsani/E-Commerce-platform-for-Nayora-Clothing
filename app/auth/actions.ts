"use server";

import { getUserByEmail, getUserByPhone, createUser, updateUser } from "@/lib/user-db";
import { hashPassword, comparePasswords } from "@/lib/auth";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";

export interface ActionResponse {
  error?: string;
  success?: boolean;
  redirectUrl?: string;
  message?: string;
}

export async function loginAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  try {
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;
    const callbackUrl = formData.get("callbackUrl") as string || "/";

    if (!identifier || !password) {
      return { error: "Please enter both email/phone and password." };
    }

    // Get user to determine redirection path beforehand
    let user = await getUserByEmail(identifier);
    if (!user) {
      user = await getUserByPhone(identifier);
    }

    if (!user) {
      return { error: "Please create an account " };
    }

    const isPasswordCorrect = await comparePasswords(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return { error: " Invalid credentials" };
    }

    let redirectUrl = "/";
    if (user.isFirstLogin && (user.role === 'admin' || user.role === 'employee')) {
      redirectUrl = "/admin/change-password";
    } else if (user.role === 'customer') {
      redirectUrl = callbackUrl.startsWith('/auth') ? '/' : callbackUrl;
    } else {
      redirectUrl = callbackUrl.startsWith('/admin') ? callbackUrl : '/admin';
    }

    // Perform NextAuth sign in
    await signIn("credentials", {
      identifier,
      password,
      redirectTo: redirectUrl,
    });

    return { success: true, redirectUrl };
  } catch (err: any) {
    if (isRedirectError(err)) {
      throw err; // bubble up redirect errors so Next.js handles navigation
    }

    if (err instanceof AuthError) {
      if (err.type === "CredentialsSignin") {
        return { error: " Invalid credentials" };
      }
      return { error: err.message || " Invalid credentials" };
    }

    console.error("Login action error:", err);
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function signupAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const callbackUrl = formData.get("callbackUrl") as string || "/";

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  const existingEmail = await getUserByEmail(email);
  if (existingEmail) {
    return { error: "Email is already in use." };
  }

  if (phone) {
    const phoneRegex = /^(?:07\d{8}|\+94\d{9})$/;
    if (!phoneRegex.test(phone)) {
      return { error: "Please enter a valid phone number " };
    }
    const existingPhone = await getUserByPhone(phone);
    if (existingPhone) {
      return { error: "Phone number is already in use." };
    }
  }

  const passwordHash = await hashPassword(password);

  const newUser = await createUser({
    name,
    email,
    phone,
    passwordHash,
    role: "customer",
    isFirstLogin: false,
    privileges: []
  });

  const redirectUrl = `/auth/login?message=${encodeURIComponent("Account created successfully. Please sign in.")}&callbackUrl=${encodeURIComponent(callbackUrl)}`;
  return { success: true, redirectUrl };
}

export async function logoutAction() {
  try {
    await signOut({ redirectTo: "/auth/login" });
  } catch (err: any) {
    if (isRedirectError(err)) {
      throw err;
    }
    console.error("Logout error:", err);
  }
  return { success: true };
}

export async function changePasswordAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  try {
    const newPassword = formData.get("password") as string;
    const userId = formData.get("userId") as string;

    if (!newPassword || newPassword.length < 8) {
      return { error: "Password must be at least 8 characters long." };
    }

    const passwordHash = await hashPassword(newPassword);

    await updateUser(userId, {
      passwordHash,
      isFirstLogin: false
    });

    // Sign out user and force relogin
    await signOut({ redirectTo: "/auth/login?message=Password changed successfully. Please login again." });
    return { success: true, redirectUrl: "/auth/login?message=Password changed successfully. Please login again." };
  } catch (err: any) {
    if (isRedirectError(err)) {
      throw err;
    }
    console.error("Change password action error:", err);
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function forgotPasswordAction(prevState: any, formData: FormData): Promise<ActionResponse> {
  const email = formData.get("email") as string;
  
  if (!email) {
    return { error: "Email is required." };
  }

  const user = await getUserByEmail(email);
  if (!user) {
    // For security, do not reveal if email exists or not
    return { success: true, message: "If an account with that email exists, a reset link has been sent." };
  }

  // TODO: Integrate Resend here later as requested.
  // We'll simulate success for now.
  
  return { success: true, message: "If an account with that email exists, a reset link has been sent." };
}
