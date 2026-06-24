"use client";

import { useActionState, useState } from "react";
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

const SUBSYSTEMS = [
  { value: "products", label: "Products", description: "Manage product listings and details." },
  { value: "inventory", label: "Inventory", description: "Monitor variant stock levels and SKUs." },
  { value: "orders", label: "Orders", description: "Track fulfillment and coordinate customers." },
  { value: "users", label: "Users", description: "Manage dashboard administrative accounts." },
  { value: "roles", label: "Roles", description: "Configure system access roles and permissions." },
  { value: "branches", label: "Branches", description: "Coordinate store branches and location settings." }
];

interface RoleFormState {
  roleName: string;
  isActive: boolean;
  isAdmin: boolean;
  permissions: Record<string, {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
  }>;
}

const getInitialPermissions = (role?: Role) => {
  const base: Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean; export: boolean }> = {
    products: { create: false, read: false, update: false, delete: false, export: false },
    inventory: { create: false, read: false, update: false, delete: false, export: false },
    orders: { create: false, read: false, update: false, delete: false, export: false },
    users: { create: false, read: false, update: false, delete: false, export: false },
    roles: { create: false, read: false, update: false, delete: false, export: false },
    branches: { create: false, read: false, update: false, delete: false, export: false },
  };

  if (role?.granularPermissions) {
    return {
      ...base,
      ...role.granularPermissions
    };
  }

  // Fallback from legacy list of permissions
  if (role?.permissions) {
    role.permissions.forEach(perm => {
      if (perm.includes(":")) {
        const [module, action] = perm.split(":");
        if (module in base) {
          const mod = base[module];
          if (action in mod) {
            mod[action as keyof typeof mod] = true;
          }
        }
      } else if (perm.startsWith("manage_")) {
        const module = perm.replace("manage_", "");
        const moduleName = module === "products" ? "products" :
                           module === "inventory" ? "inventory" :
                           module === "orders" ? "orders" :
                           module === "users" ? "users" :
                           module === "roles" ? "roles" : "";
        if (moduleName && moduleName in base) {
          const mod = base[moduleName];
          mod.create = true;
          mod.read = true;
          mod.update = true;
          mod.delete = true;
          mod.export = true;
        }
      }
    });
  }

  return base;
};

function RoleModalContent({ onClose, role }: { onClose: () => void; role?: Role }) {
  const isEditing = !!role;
  const action = isEditing ? updateRoleAction.bind(null, role.id!) : createRoleAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  // Unified Form State
  const [formState, setFormState] = useState<RoleFormState>({
    roleName: role?.name || "",
    isActive: role?.isActive !== false,
    isAdmin: role?.isAdmin || false,
    permissions: getInitialPermissions(role),
  });

  const isRoleNameBlank = !formState.roleName.trim();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, roleName: e.target.value }));
  };

  const handleToggleActive = () => {
    setFormState(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleToggleAdmin = () => {
    setFormState(prev => ({ ...prev, isAdmin: !prev.isAdmin }));
  };

  const handleCheckboxChange = (moduleName: string, actionName: string) => {
    setFormState(prev => {
      const currentVal = prev.permissions[moduleName][actionName as "create" | "read" | "update" | "delete" | "export"];
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleName]: {
            ...prev.permissions[moduleName],
            [actionName]: !currentVal
          }
        }
      };
    });
  };

  const handleSelectAll = (moduleName: string) => {
    setFormState(prev => {
      const modulePerms = prev.permissions[moduleName];
      const allChecked = Object.values(modulePerms).every(val => val);
      
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleName]: {
            create: !allChecked,
            read: !allChecked,
            update: !allChecked,
            delete: !allChecked,
            export: !allChecked,
          }
        }
      };
    });
  };

  // Compile full permissions list (granular + legacy) for backend validation
  const getCompiledPermissions = () => {
    const arr: string[] = [];
    Object.entries(formState.permissions).forEach(([moduleName, modulePerms]) => {
      let hasAny = false;
      Object.entries(modulePerms).forEach(([actionName, isChecked]) => {
        if (isChecked) {
          arr.push(`${moduleName}:${actionName}`);
          hasAny = true;
        }
      });
      // Backward compatibility mapping to legacy role strings
      if (hasAny) {
        if (moduleName === "products") arr.push("manage_products");
        if (moduleName === "inventory") arr.push("manage_inventory");
        if (moduleName === "orders") arr.push("manage_orders");
        if (moduleName === "users") arr.push("manage_users");
        if (moduleName === "roles") arr.push("manage_roles");
      }
    });
    return arr;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-neutral-900 bg-opacity-50 transition-opacity backdrop-blur-sm"
        aria-hidden="true"
        onClick={() => !isPending && onClose()}
      ></div>

      {/* Modal card */}
      <div className="bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all max-w-2xl w-full relative z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold font-serif text-neutral-900 flex items-center gap-2" id="modal-title">
              <Shield className="w-5 h-5 text-neutral-800" />
              {isEditing ? "Edit Role" : "Add Role"}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              {isEditing ? "Modify access configuration for this system role." : "Create a new role for system users."}
            </p>
          </div>
          <button
            onClick={() => !isPending && onClose()}
            className="text-neutral-400 hover:text-neutral-600 transition-colors rounded-full p-1.5 hover:bg-neutral-100 focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {state?.success ? (
          <div className="p-8 flex-1 overflow-y-auto">
            <div className="p-6 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-start">
                <CheckCircle2 className="w-6 h-6 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-lg font-bold text-green-900 mb-2">Role Saved Successfully!</h4>
                  <p className="text-sm text-green-800">{state.message}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 text-right">
              <button onClick={onClose} className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-semibold cursor-pointer">
                Close
              </button>
            </div>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col flex-1 overflow-hidden">
            {/* Hidden State Transmission inputs */}
            <input type="hidden" name="name" value={formState.roleName} />
            <input type="hidden" name="isActive" value={formState.isActive ? "true" : "false"} />
            <input type="hidden" name="isAdmin" value={formState.isAdmin ? "true" : "false"} />
            <input type="hidden" name="granularPermissions" value={JSON.stringify(formState.permissions)} />
            {getCompiledPermissions().map(perm => (
              <input key={perm} type="hidden" name="permissions" value={perm} />
            ))}

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {state?.error && (
                <div className="p-4 bg-red-50 text-red-800 rounded-xl text-sm flex items-center border border-red-200 shadow-sm">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  {state.error}
                </div>
              )}

              {/* Role Name */}
              <div>
                <label htmlFor="roleName" className="block text-sm font-semibold text-neutral-800 mb-1.5">Role Name</label>
                <div className={`rounded-xl transition-all ${isRoleNameBlank ? 'ring-2 ring-red-500 border border-red-500 p-[1px]' : ''}`}>
                  <input
                    type="text"
                    id="roleName"
                    required
                    value={formState.roleName}
                    onChange={handleNameChange}
                    placeholder="Editor"
                    className="block w-full bg-white border border-neutral-300 rounded-xl py-2.5 px-4 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm font-sans transition-all"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                {/* Status Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-semibold text-neutral-800">Status</span>
                    <span className="block text-xs text-neutral-500 mt-0.5">Determine if this role is active</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleActive}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formState.isActive ? "bg-emerald-600" : "bg-neutral-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formState.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Admin Privileges Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-semibold text-neutral-800">Admin Privileges</span>
                    <span className="block text-xs text-neutral-500 mt-0.5">Grant admin level system access</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAdmin}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formState.isAdmin ? "bg-emerald-600" : "bg-neutral-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formState.isAdmin ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Granular Permissions */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-800">Permissions</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Select the features this role can access.</p>
                </div>

                {/* Units List */}
                <div className="space-y-4">
                  {SUBSYSTEMS.map((sub) => {
                    const modulePerms = formState.permissions[sub.value];
                    if (!modulePerms) return null;
                    const allChecked = Object.values(modulePerms).every(val => val);

                    return (
                      <div key={sub.value} className="border border-neutral-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                          <div>
                            <span className="text-sm font-bold text-neutral-800 capitalize">{sub.label}</span>
                            <span className="hidden md:inline-block text-xs text-neutral-400 ml-2 font-normal">{sub.description}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectAll(sub.value)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-semibold transition-colors cursor-pointer"
                          >
                            {allChecked ? "Deselect All" : "Select All"}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                          {Object.entries(modulePerms).map(([actionName, isChecked]) => (
                            <label
                              key={actionName}
                              className="flex items-center space-x-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer select-none transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(sub.value, actionName)}
                                className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                              />
                              <span className="capitalize">{actionName}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50/50">
              <button
                type="button"
                onClick={() => !isPending && onClose()}
                disabled={isPending}
                className="px-4 py-2 border border-neutral-300 rounded-xl text-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || isRoleNameBlank}
                className="px-5 py-2 bg-emerald-750 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Role"}
              </button>
            </div>
          </form>
        )}
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
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Role
        </button>
      )}

      {isOpen && <RoleModalContent onClose={() => setIsOpen(false)} role={role} />}
    </>
  );
}
