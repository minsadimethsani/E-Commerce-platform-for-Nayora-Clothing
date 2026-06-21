"use client";

import { useTransition, useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { User, UserRole } from "@/lib/user-db";
import { Role } from "@/lib/role-db";
import { deleteUserAction } from "./actions";
import EditUserModal from "./EditUserModal";

export default function UsersTable({
  users,
  roles,
  currentRole,
  currentUserId,
}: {
  users: User[];
  roles: Role[];
  currentRole: UserRole;
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = (userId: string, email: string) => {
    if (userId === currentUserId) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm(`Are you sure you want to delete the user "${email}"?`)) return;

    setErrorMsg(null);
    startTransition(async () => {
      const res = await deleteUserAction(userId);
      if (res && res.error) {
        setErrorMsg(res.error);
      }
    });
  };

  const getRoleDisplayName = (user: User) => {
    if (user.role === "super_admin") return "Super Admin";
    if (user.roleId) {
      const matchedRole = roles.find((r) => r.id === user.roleId);
      return matchedRole ? matchedRole.name : "Custom Role (Deleted)";
    }
    return user.role.replace("_", " ");
  };

  return (
    <div className="space-y-4 font-sans">
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center shadow-sm">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <div>{errorMsg}</div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-xs uppercase tracking-widest font-semibold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Assigned Role</th>
                <th className="px-6 py-4">Permissions Cache</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-neutral-50 transition-colors ${isPending ? "opacity-70" : ""}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#2C241E] text-white flex items-center justify-center font-bold text-xs uppercase">
                        {user.name?.[0] || user.email[0]}
                      </div>
                      <span className="ml-3 font-semibold text-neutral-900">{user.name || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#FAF9F6] text-[#2C241E] border border-[#2C241E]/10 capitalize">
                      {getRoleDisplayName(user)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 max-w-xs">
                    {user.privileges && user.privileges.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {user.privileges.map((priv) => (
                          <span key={priv} className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs rounded-md capitalize">
                            {priv.replace("manage_", "").replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic text-xs">No permissions</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.isFirstLogin ? (
                      <span className="inline-flex items-center text-amber-600 text-xs font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                        Pending Setup
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-green-600 text-xs font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <EditUserModal
                        user={user}
                        currentRole={currentRole}
                        roles={roles}
                      />
                      <button
                        onClick={() => user.id && handleDelete(user.id, user.email)}
                        className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                        disabled={isPending || user.id === currentUserId}
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
