"use server";

import { updateOrderStatus, OrderStatus } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    await updateOrderStatus(orderId, status as OrderStatus);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to update order status." };
  }
}
