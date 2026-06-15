"use server";

import { addProduct, removeProduct } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createProductAction(prevState: any, formData: FormData) {
  // Extract fields
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const subCategory = formData.get("subCategory") as string;
  const price = Number(formData.get("price"));
  const quantity = Number(formData.get("quantity"));
  const image = formData.get("image") as string;
  const imagesRaw = formData.get("images") as string;
  const color = formData.get("color") as string;
  const tag = formData.get("tag") as string;

  const errors: Record<string, string> = {};

  // Backend Validations
  if (!name || name.trim().length < 3) {
    errors.name = "Product name must be at least 3 characters long.";
  }
  if (!category) {
    errors.category = "Category is required.";
  }
  if (isNaN(price) || price <= 0) {
    errors.price = "Price must be a valid number greater than 0.";
  }
  if (isNaN(quantity) || quantity < 0) {
    errors.quantity = "Quantity must be a valid positive number.";
  }
  if (!image || image.trim().length === 0) {
    errors.image = "Image is required.";
  }

  // Parse images if available
  let images: string[] = [];
  if (imagesRaw) {
    try {
      images = JSON.parse(imagesRaw);
    } catch (e) {
      console.error("Failed to parse images array", e);
    }
  }

  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
    return { success: false, errors, message: "Please fix the errors in the form." };
  }

  // Save to DB
  try {
    await addProduct({
      name: name.trim(),
      category,
      ...(subCategory && { subCategory: subCategory.trim() }),
      price,
      quantity,
      image: image.trim(),
      ...(images.length > 0 && { images }),
      ...(color && { color: color.trim() }),
      ...(tag && { tag: tag.trim() }),
    });

    revalidatePath("/", "layout");
    return { success: true, message: "Product added successfully!" };
  } catch (error) {
    return { success: false, message: "Failed to add product due to a server error." };
  }
}

export async function deleteProductAction(id: string | number) {
  await removeProduct(id);
  revalidatePath("/", "layout");
}
