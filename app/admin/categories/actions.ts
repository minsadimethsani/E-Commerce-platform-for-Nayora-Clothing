"use server";

import { createCategory, updateCategory, deleteCategory } from "@/lib/category-db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

// Check if user is authorized to manage products/categories
async function isAuthorized(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return session.role === "super_admin" || !!session.privileges?.includes("manage_products");
}

export async function createCategoryAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const authorized = await isAuthorized();
  if (!authorized) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const subCategoriesRaw = formData.getAll("subCategories") as string[];

  if (!name || !name.trim()) {
    return { error: "Category name is required." };
  }

  try {
    await createCategory(name.trim(), subCategoriesRaw);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { success: true, message: "Category created successfully!" };
  } catch (error: any) {
    return { error: error.message || "Failed to create category." };
  }
}

export async function updateCategoryAction(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const authorized = await isAuthorized();
  if (!authorized) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const subCategoriesRaw = formData.getAll("subCategories") as string[];

  if (!name || !name.trim()) {
    return { error: "Category name is required." };
  }

  try {
    await updateCategory(id, name.trim(), subCategoriesRaw);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { success: true, message: "Category updated successfully!" };
  } catch (error: any) {
    return { error: error.message || "Failed to update category." };
  }
}

export async function deleteCategoryAction(id: string) {
  const authorized = await isAuthorized();
  if (!authorized) {
    return { error: "Unauthorized" };
  }

  try {
    await deleteCategory(id);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { success: true, message: "Category deleted successfully!" };
  } catch (error: any) {
    return { error: error.message || "Failed to delete category." };
  }
}
