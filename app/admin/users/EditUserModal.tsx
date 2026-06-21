"use client";

import { useActionState, useState } from "react";
import { Edit2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { updateUserAction } from "./actions";
import { User, UserRole } from "@/lib/user-db";
import { Role } from "@/lib/role-db";

type State = {
  error?: string;
  success?: boolean;
  message?: string;
};

const initialState: State = {
  error: "",
  success: false,
  message: "",
};

function EditUserModalContent({ onClose, user, currentRole, roles }: { onClose: () => void; user: User; currentRole: UserRole; roles: Role[] }) {
  const action = updateUserAction.bind(null, user.id!);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [systemRole, setSystemRole] = useState<string>(user.role === "super_admin" ? "super_admin" : "custom");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 transition-opacity backdrop-blur-sm" 
          aria-hidden="true"
          onClick={() => !isPending && onClose()}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full relative z-10 font-sans">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-8 sm:pb-6">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4">
              <h3 className="text-xl leading-6 font-serif text-neutral-900" id="modal-title">
                Edit User Details
              </h3>
              <button 
                onClick={() => !isPending && onClose()}
                className="text-neutral-400 hover:text-neutral-500 transition-colors rounded-full p-1 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {state?.success ? (
              <div className="mb-6 p-6 rounded-md bg-green-50 border border-green-200">
                <div className="flex items-start">
                  <CheckCircle2 className="w-6 h-6 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-lg font-medium text-green-900 mb-2">User Updated Successfully!</h4>
                    <p className="text-sm text-green-800">{state.message}</p>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={onClose} className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors">
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form action={formAction}>
                {state?.error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-md text-sm flex items-center border border-red-200">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    {state.error}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      defaultValue={user.name || ""}
                      className="mt-1 block w-full bg-white border border-neutral-300 rounded-md py-2 px-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#8C7162] text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      defaultValue={user.email || ""}
                      className="mt-1 block w-full bg-white border border-neutral-300 rounded-md py-2 px-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#8C7162] text-sm"
                    />
                  </div>

                  {currentRole === "super_admin" && (
                    <div>
                      <label htmlFor="systemRole" className="block text-sm font-medium text-neutral-700">Role Classification *</label>
                      <select
                        id="systemRole"
                        name="systemRole"
                        value={systemRole}
                        onChange={(e) => setSystemRole(e.target.value)}
                        className="mt-1 block w-full bg-white border border-neutral-300 rounded-md py-2.5 px-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#8C7162] text-sm"
                      >
                        <option value="custom">Custom Access Role</option>
                        <option value="super_admin">Super Administrator</option>
                      </select>
                    </div>
                  )}

                  {systemRole === "custom" && (
                    <div>
                      <label htmlFor="roleId" className="block text-sm font-medium text-neutral-700">Access Role *</label>
                      {roles.length === 0 ? (
                        <div className="mt-1.5 p-3 rounded-md bg-amber-50 border border-amber-200 flex items-center text-amber-800 text-xs">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          No roles available. Please create a role under Role management first.
                        </div>
                      ) : (
                        <select
                          id="roleId"
                          name="roleId"
                          required={systemRole === "custom"}
                          defaultValue={user.roleId || ""}
                          className="mt-1 block w-full bg-white border border-neutral-300 rounded-md py-2.5 px-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#8C7162] text-sm"
                        >
                          <option value="">Select a role...</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-5 border-t border-neutral-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => !isPending && onClose()}
                    disabled={isPending}
                    className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || (systemRole === "custom" && roles.length === 0)}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-70"
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditUserModal({ user, currentRole, roles }: { user: User; currentRole: UserRole; roles: Role[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-all cursor-pointer inline-flex items-center"
        title="Edit User"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <EditUserModalContent 
          onClose={() => setIsOpen(false)} 
          user={user} 
          currentRole={currentRole} 
          roles={roles} 
        />
      )}
    </>
  );
}
