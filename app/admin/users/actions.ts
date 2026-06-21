"use server";

import { createUser, updateUser, deleteUser, getUserByEmail, UserRole } from "@/lib/user-db";
import { getRoleById } from "@/lib/role-db";
import { hashPassword, getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function createEmployeeAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  const isSuperAdmin = session?.role === "super_admin";
  const hasUserPrivilege = session?.privileges?.includes("manage_users");

  if (!isSuperAdmin && !hasUserPrivilege) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const roleId = formData.get("roleId") as string;
  const systemRoleInput = formData.get("systemRole") as string;

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  const existingEmail = await getUserByEmail(email);
  if (existingEmail) {
    return { error: "Email is already in use." };
  }

  let finalRole: UserRole = "employee";
  let finalRoleId = "";
  let privileges: string[] = [];

  if (systemRoleInput === "super_admin") {
    if (!isSuperAdmin) {
      return { error: "Only super_admin can create another super_admin." };
    }
    finalRole = "super_admin";
  } else {
    if (!roleId) {
      return { error: "Please select an access role." };
    }
    const role = await getRoleById(roleId);
    if (!role) {
      return { error: "Selected role not found." };
    }
    finalRole = "employee";
    finalRoleId = role.id!;
    privileges = role.permissions || [];
  }

  const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
  const passwordHash = await hashPassword(tempPassword);

  try {
    await createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: finalRole,
      roleId: finalRoleId || undefined,
      privileges,
      isFirstLogin: true
    });

    revalidatePath("/admin/users");
    return { 
      success: true, 
      message: `Account created successfully! Temporary password: ${tempPassword}`
    };
  } catch (error: any) {
    return { error: error.message || "Failed to create user." };
  }
}

export async function updateUserAction(userId: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  const isSuperAdmin = session?.role === "super_admin";
  const hasUserPrivilege = session?.privileges?.includes("manage_users");

  if (!isSuperAdmin && !hasUserPrivilege) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const roleId = formData.get("roleId") as string;
  const systemRoleInput = formData.get("systemRole") as string;

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  try {
    let finalRole: UserRole = "employee";
    let finalRoleId = "";
    let privileges: string[] = [];

    if (systemRoleInput === "super_admin") {
      if (!isSuperAdmin) {
        return { error: "Only super_admin can assign super_admin role." };
      }
      finalRole = "super_admin";
    } else {
      if (!roleId) {
        return { error: "Please select an access role." };
      }
      const role = await getRoleById(roleId);
      if (!role) {
        return { error: "Selected role not found." };
      }
      finalRole = "employee";
      finalRoleId = role.id!;
      privileges = role.permissions || [];
    }

    await updateUser(userId, {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: finalRole,
      roleId: finalRoleId,
      privileges,
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User updated successfully!" };
  } catch (error: any) {
    return { error: error.message || "Failed to update user." };
  }
}

export async function deleteUserAction(userId: string) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const isSuperAdmin = session.role === "super_admin";
  const hasUserPrivilege = session.privileges?.includes("manage_users");

  if (!isSuperAdmin && !hasUserPrivilege) {
    return { error: "Unauthorized" };
  }

  if (userId === session.userId) {
    return { error: "You cannot delete your own account." };
  }

  try {
    await deleteUser(userId);
    revalidatePath("/admin/users");
    return { success: true, message: "User deleted successfully!" };
  } catch (error: any) {
    return { error: error.message || "Failed to delete user." };
  }
}
