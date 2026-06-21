import { getSession } from "@/lib/auth";
import { getAllRoles } from "@/lib/role-db";
import { redirect } from "next/navigation";
import RolesList from "./RolesList";
import RoleModal from "./RoleModal";

export default async function RoleManagement() {
  const session = await getSession();

  // Authorize: Only super_admin or users with manage_roles privilege
  if (session?.role !== "super_admin" && !session?.privileges?.includes("manage_roles")) {
    redirect("/admin");
  }

  const roles = await getAllRoles();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif text-neutral-900">Role Management</h1>
          <p className="mt-2 text-sm text-neutral-500 font-sans">
            Define custom access roles and configure modular dashboard permissions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 md:mr-16">
          <RoleModal />
        </div>
      </div>

      <RolesList roles={roles} />
    </div>
  );
}
