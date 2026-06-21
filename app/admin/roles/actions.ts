"use server";

import { createRole, updateRole, deleteRole, getRoleById } from "@/lib/role-db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function createRoleAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  const isSuperAdmin = session?.role === "super_admin";
  const hasRolePrivilege = session?.privileges?.includes("manage_roles");

  if (!isSuperAdmin && !hasRolePrivilege) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const permissions = formData.getAll("permissions") as string[];

  if (!name) {
    return { error: "Role name is required." };
  }

  try {
    await createRole({
      name: name.trim(),
      permissions,
    });

    revalidatePath("/admin/roles");
    return { success: true, message: "Role created successfully!" };
  } catch (error: any) {
    return { error: error.message || "Failed to create role." };
  }
}

export async function updateRoleAction(roleId: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  const isSuperAdmin = session?.role === "super_admin";
  const hasRolePrivilege = session?.privileges?.includes("manage_roles");

  if (!isSuperAdmin && !hasRolePrivilege) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const permissions = formData.getAll("permissions") as string[];

  if (!name) {
    return { error: "Role name is required." };
  }

  try {
    await updateRole(roleId, {
      name: name.trim(),
      permissions,
    });

    revalidatePath("/admin/roles");
    revalidatePath("/admin/users");
    return { success: true, message: "Role updated successfully!" };
  } catch (error: any) {
    return { error: error.message || "Failed to update role." };
  }
}

export async function deleteRoleAction(roleId: string) {
  const session = await getSession();
  const isSuperAdmin = session?.role === "super_admin";
  const hasRolePrivilege = session?.privileges?.includes("manage_roles");

  if (!isSuperAdmin && !hasRolePrivilege) {
    return { error: "Unauthorized" };
  }

  try {
    await deleteRole(roleId);
    revalidatePath("/admin/roles");
    return { success: true, message: "Role deleted successfully!" };
  } catch (error: any) {
    return { error: error.message || "Failed to delete role." };
  }
}
