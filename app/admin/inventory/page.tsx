import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import InventoryClient from "./InventoryClient";

export default async function InventoryPage() {
  const session = await getSession();

  // Authorize: Only super_admin or users with manage_inventory privilege
  if (session?.role !== "super_admin" && !session?.privileges?.includes("manage_inventory")) {
    redirect("/admin");
  }

  return <InventoryClient />;
}
