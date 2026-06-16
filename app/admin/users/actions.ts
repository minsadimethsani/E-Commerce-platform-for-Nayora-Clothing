"use server";

import { createUser, getUserByEmail, UserRole } from "@/lib/user-db";
import { hashPassword, getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createEmployeeAction(prevState: any, formData: FormData) {
  const session = await getSession();
  if (session?.role !== "super_admin" && session?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as UserRole;
  
  // privileges from checkboxes
  const privileges = formData.getAll("privileges") as string[];
  
  if (!name || !email || !role) {
    return { error: "Name, email, and role are required." };
  }

  if (role === "super_admin" && session.role !== "super_admin") {
    return { error: "Only super_admin can create another super_admin." };
  }

  const existingEmail = await getUserByEmail(email);
  if (existingEmail) {
    return { error: "Email is already in use." };
  }

  // Temporary password logic
  const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
  const passwordHash = await hashPassword(tempPassword);

  await createUser({
    name,
    email,
    passwordHash,
    role,
    privileges,
    isFirstLogin: true // Force password change
  });

  revalidatePath("/admin/users");
  
  return { 
    success: true, 
    message: `Account created successfully! Temporary password: ${tempPassword}`
  };
}
