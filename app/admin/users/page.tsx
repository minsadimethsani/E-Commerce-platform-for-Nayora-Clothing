import { getSession } from "@/lib/auth";
import { getAllEmployees } from "@/lib/user-db";
import { redirect } from "next/navigation";
import AddUserModal from "./AddUserModal";
import { UserRole } from "@/lib/user-db";

export default async function ManageUsers() {
  const session = await getSession();
  if (session?.role !== "super_admin" && session?.role !== "admin") {
    redirect("/admin");
  }

  const employees = await getAllEmployees();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif text-neutral-900">Manage Users</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Create and manage admin and employee accounts with specific privileges.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 md:mr-16">
          <AddUserModal currentRole={session.role as UserRole} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-xs uppercase tracking-widest font-semibold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Privileges</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {employees.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#2C241E] text-white flex items-center justify-center font-bold text-xs">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <span className="ml-3 font-medium text-neutral-900">{user.name || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#FAF9F6] text-[#2C241E] border border-[#2C241E]/10 capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {user.privileges && user.privileges.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {user.privileges.map(priv => (
                          <span key={priv} className="px-2 py-1 bg-neutral-100 text-xs rounded-md">
                            {priv.replace('manage_', '')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.isFirstLogin ? (
                      <span className="text-amber-600">Pending Setup</span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
