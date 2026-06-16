"use server";

import { getUserByEmail, getUserByPhone, createUser, User, updateUser } from "@/lib/user-db";
import { hashPassword, comparePasswords, createSession, destroySession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;
    const callbackUrl = formData.get("callbackUrl") as string || "/";

    if (!identifier || !password) {
      return { error: "Please enter both email/phone and password." };
    }

    // Check email first, then phone
    let user = await getUserByEmail(identifier);
    if (!user) {
      user = await getUserByPhone(identifier);
    }

    if (!user) {
      return { error: "Invalid credentials." };
    }

    const isValid = await comparePasswords(password, user.passwordHash);
    if (!isValid) {
      return { error: "Invalid credentials." };
    }

    await createSession({
      userId: user.id!,
      email: user.email,
      role: user.role,
      privileges: user.privileges || [],
      isFirstLogin: user.isFirstLogin
    });

    if (user.isFirstLogin && (user.role === 'admin' || user.role === 'employee')) {
      return { success: true, redirectUrl: "/admin/change-password" };
    }

    if (user.role === 'customer') {
      return { success: true, redirectUrl: callbackUrl.startsWith('/auth') ? '/' : callbackUrl };
    } else {
      // Force admins to the dashboard unless their callback URL was ALREADY an admin page
      const destUrl = callbackUrl.startsWith('/admin') ? callbackUrl : '/admin';
      return { success: true, redirectUrl: destUrl };
    }
  } catch (err: any) {
    console.error("Login action error:", err);
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function signupAction(prevState: any, formData: FormData) {
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

  try {
    await createSession({
      userId: newUser.id!,
      email: newUser.email,
      role: newUser.role,
      privileges: newUser.privileges || [],
      isFirstLogin: newUser.isFirstLogin
    });

    return { success: true, redirectUrl: callbackUrl.startsWith('/auth') ? '/' : callbackUrl };
  } catch (err: any) {
    console.error("Signup action error:", err);
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function logoutAction() {
  await destroySession();
  return { success: true };
}

export async function changePasswordAction(prevState: any, formData: FormData) {
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

    // Also update session
    await createSession({
      userId,
      email: "updated@example.com", // will be refreshed by next login, or we can fetch user
      role: "employee", // placeholder, will just force relogin or we can fetch real
      isFirstLogin: false
    });

    // Best practice: force them to login again or we can just update the session properly
    await destroySession();
    return { success: true, redirectUrl: "/auth/login?message=Password changed successfully. Please login again." };
  } catch (err: any) {
    console.error("Change password action error:", err);
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function forgotPasswordAction(prevState: any, formData: FormData) {
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
