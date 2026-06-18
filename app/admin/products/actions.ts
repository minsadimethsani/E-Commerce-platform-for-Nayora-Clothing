"use server";

import { addProduct, removeProduct } from "@/lib/db";
import { revalidatePath } from "next/cache";

function generateSKU(productName: string, color: string, size: string | number): string {
  const cleanProd = productName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  const cleanColor = color.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const cleanSize = String(size).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `NYR-${cleanProd}-${cleanColor}-${cleanSize}`;
}

export async function createProductAction(prevState: any, formData: FormData) {
  // Extract fields
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const subCategory = formData.get("subCategory") as string;
  const price = Number(formData.get("price"));
  const quantityInput = Number(formData.get("quantity"));
  const image = formData.get("image") as string;
  const imagesRaw = formData.get("images") as string;
  const colorInput = formData.get("color") as string;
  const tag = formData.get("tag") as string;
  const variantsRaw = formData.get("variants") as string;
  const colorImagesRaw = formData.get("colorImages") as string;

  const errors: Record<string, string> = {};

  // Parse color images if available
  let colorImages: Record<string, string[]> = {};
  if (colorImagesRaw) {
    try {
      colorImages = JSON.parse(colorImagesRaw);
    } catch (e) {
      console.error("Failed to parse color images map", e);
    }
  }

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
  if ((!image || image.trim().length === 0) && Object.keys(colorImages).length === 0) {
    errors.image = "Product image (either main or color-specific uploader) is required.";
  }

  // Parse variants if available
  let rawVariants: any[] = [];
  if (variantsRaw) {
    try {
      rawVariants = JSON.parse(variantsRaw);
    } catch (e) {
      console.error("Failed to parse variants array", e);
    }
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

  // Format and validate variants
  const formattedVariants = rawVariants.map((v: any) => ({
    SKU_ID: generateSKU(name, v.color, v.size),
    color: String(v.color).trim(),
    size: isNaN(Number(v.size)) ? String(v.size).trim() : Number(v.size),
    stock_quantity: Number(v.stock_quantity) || 0
  }));

  // Re-calculate total quantity and color
  const totalQuantity = formattedVariants.length > 0
    ? formattedVariants.reduce((sum, v) => sum + v.stock_quantity, 0)
    : quantityInput;

  const baseColor = colorInput ? colorInput.trim() : (formattedVariants.length > 0 ? formattedVariants[0].color : "");

  if (isNaN(totalQuantity) || totalQuantity < 0) {
    errors.quantity = "Quantity must be a valid positive number.";
  }

  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
    return { success: false, errors, message: "Please fix the errors in the form." };
  }

  // Save to DB
  try {
    const firstColorImage = Object.values(colorImages)[0]?.[0];
    const finalMainImage = image ? image.trim() : (firstColorImage || "/hero.png");
    
    // Combine all images
    const allImagesList = [...images];
    Object.values(colorImages).forEach(imgUrls => {
      imgUrls.forEach(url => {
        if (!allImagesList.includes(url)) {
          allImagesList.push(url);
        }
      });
    });

    await addProduct({
      name: name.trim(),
      category,
      ...(subCategory && { subCategory: subCategory.trim() }),
      price,
      quantity: totalQuantity,
      image: finalMainImage,
      ...(allImagesList.length > 0 && { images: allImagesList }),
      ...(baseColor && { color: baseColor }),
      ...(tag && { tag: tag.trim() }),
      ...(formattedVariants.length > 0 && { variants: formattedVariants }),
      ...(Object.keys(colorImages).length > 0 && { colorImages })
    });

    revalidatePath("/", "layout");
    return { success: true, message: "Product added successfully!" };
  } catch (error) {
    console.error("Failed to add product:", error);
    return { success: false, message: "Failed to add product due to a server error." };
  }
}

export async function deleteProductAction(id: string | number) {
  await removeProduct(id);
  revalidatePath("/", "layout");
}
