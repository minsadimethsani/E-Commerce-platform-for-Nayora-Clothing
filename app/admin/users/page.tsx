import { getSession } from "@/lib/auth";
import { getAllEmployees, UserRole } from "@/lib/user-db";
import { getAllRoles } from "@/lib/role-db";
import { redirect } from "next/navigation";
import AddUserModal from "./AddUserModal";
import UsersTable from "./UsersTable";

export default async function ManageUsers() {
  const session = await getSession();

  // Authorize: Only super_admin or users with manage_users privilege
  if (session?.role !== "super_admin" && !session?.privileges?.includes("manage_users")) {
    redirect("/admin");
  }

  const [employees, roles] = await Promise.all([
    getAllEmployees(),
    getAllRoles()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif text-neutral-900">User Management</h1>
          <p className="mt-2 text-sm text-neutral-500 font-sans">
            Create and manage administrative and employee accounts with custom access roles.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 md:mr-16">
          <AddUserModal currentRole={session.role as UserRole} roles={roles} />
        </div>
      </div>

      <UsersTable
        users={employees}
        roles={roles}
        currentRole={session.role as UserRole}
        currentUserId={session.userId}
      />
    </div>
  );
}
