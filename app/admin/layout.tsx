import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminClientLayout from "./AdminClientLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Define nav links based on role and privileges
  let allowedLinks = [
    { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  ];

  const hasPrivilege = (privilege: string) => {
    if (session.role === "super_admin") return true;
    return session.privileges?.includes(privilege);
  };

  if (hasPrivilege("manage_products") || session.role === "super_admin") {
    allowedLinks.push({ href: "/admin/products", label: "Manage Products", icon: "Package" });
    allowedLinks.push({ href: "/admin/inventory", label: "Inventory", icon: "Database" });
  }

  if (hasPrivilege("manage_orders") || session.role === "super_admin") {
    allowedLinks.push({ href: "/admin/orders", label: "Manage Orders", icon: "ShoppingCart" });
  }

  if (session.role === "super_admin" || session.role === "admin") {
    allowedLinks.push({ href: "/admin/users", label: "Manage Users", icon: "Users" });
  }

  return (
    <AdminClientLayout 
      session={session} 
      navLinks={allowedLinks}
    >
      {children}
    </AdminClientLayout>
  );
}
