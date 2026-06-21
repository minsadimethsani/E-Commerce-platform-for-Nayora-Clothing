"use client";

import { useActionState, useState, startTransition } from "react";
import { Plus, X, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { createRoleAction, updateRoleAction } from "./actions";
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

const MODULE_PERMISSIONS = [
  {
    value: "manage_products",
    label: "Products Management",
    description: "Allows viewing, adding, editing, and removing products in the catalog."
  },
  {
    value: "manage_inventory",
    label: "Inventory Management",
    description: "Allows monitoring and editing variant stock levels and SKU tracking."
  },
  {
    value: "manage_orders",
    label: "Orders Management",
    description: "Allows checking orders, modifying fulfillment statuses, and customer coordination."
  },
  {
    value: "manage_users",
    label: "User Management",
    description: "Allows managing administrative users and team access configurations."
  },
  {
    value: "manage_roles",
    label: "Role Management",
    description: "Allows creating, editing, and configuring permissions for user roles."
  }
];

function RoleModalContent({ onClose, role }: { onClose: () => void; role?: Role }) {
  const isEditing = !!role;
  const action = isEditing ? updateRoleAction.bind(null, role.id!) : createRoleAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions || []);

  const handleCheckboxChange = (value: string) => {
    setSelectedPermissions(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 transition-opacity backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => !isPending && onClose()}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full relative z-10">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-8 sm:pb-6">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4">
              <h3 className="text-xl leading-6 font-serif text-neutral-900 flex items-center gap-2" id="modal-title">
                <Shield className="w-5 h-5 text-neutral-700" />
                {isEditing ? "Edit Access Role" : "Create Access Role"}
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
                    <h4 className="text-lg font-medium text-green-900 mb-2">Role Saved Successfully!</h4>
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
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Role Name *</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      defaultValue={role?.name || ""}
                      placeholder="e.g. Sales Associate, Inventory Clerk"
                      className="mt-1 block w-full bg-white border border-neutral-300 rounded-md py-2.5 px-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#8C7162] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">Module Permissions</label>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {MODULE_PERMISSIONS.map((perm) => (
                        <div key={perm.value} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={`perm-${perm.value}`}
                              name="permissions"
                              value={perm.value}
                              type="checkbox"
                              checked={selectedPermissions.includes(perm.value)}
                              onChange={() => handleCheckboxChange(perm.value)}
                              className="h-4 w-4 text-neutral-900 focus:ring-neutral-800 border-neutral-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor={`perm-${perm.value}`} className="font-medium text-neutral-800 cursor-pointer">
                              {perm.label}
                            </label>
                            <p className="text-neutral-500 text-xs mt-0.5">{perm.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                    disabled={isPending}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-70"
                  >
                    {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Role"}
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

export default function RoleModal({ role, trigger }: { role?: Role; trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)} className="inline-block">
          {trigger}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Access Role
        </button>
      )}

      {isOpen && <RoleModalContent onClose={() => setIsOpen(false)} role={role} />}
    </>
  );
}
