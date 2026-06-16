"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { Plus, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { createEmployeeAction } from "./actions";
import { UserRole } from "@/lib/user-db";

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

function AddUserModalContent({ onClose, currentRole }: { onClose: () => void, currentRole: UserRole }) {
  const [state, formAction, isPending] = useActionState(createEmployeeAction, initialState);

  // Close modal when explicitly requested or after copying temp password
  // (We don't close automatically so they can copy the password)

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
              <h3 className="text-xl leading-6 font-serif text-neutral-900" id="modal-title">
                Create New User
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
                    <h4 className="text-lg font-medium text-green-900 mb-2">User Created Successfully!</h4>
                    <p className="text-sm text-green-800 mb-4">Please securely share this temporary password with the user. They will be required to change it upon their first login.</p>
                    <div className="bg-white p-3 rounded border border-green-300 font-mono text-center text-lg select-all">
                      {state.message?.split(': ')[1] || "Password generated"}
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <button onClick={onClose} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Done
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
                      className="mt-1 block w-full bg-white border border-neutral-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#8C7162]"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      className="mt-1 block w-full bg-white border border-neutral-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#8C7162]"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-neutral-700">Role *</label>
                    <select
                      id="role"
                      name="role"
                      className="mt-1 block w-full bg-white border border-neutral-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#8C7162]"
                      defaultValue="employee"
                    >
                      <option value="employee">Employee</option>
                      {currentRole === "super_admin" && <option value="admin">Admin</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Privileges (for Employees)</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" name="privileges" value="manage_products" className="h-4 w-4 text-[#2C241E] focus:ring-[#8C7162] border-gray-300 rounded" />
                        <span className="ml-2 text-sm text-neutral-600">Manage Products</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="privileges" value="manage_orders" className="h-4 w-4 text-[#2C241E] focus:ring-[#8C7162] border-gray-300 rounded" />
                        <span className="ml-2 text-sm text-neutral-600">Manage Orders</span>
                      </label>
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
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#2C241E] hover:bg-[#8C7162] disabled:opacity-70"
                  >
                    {isPending ? "Creating..." : "Create User"}
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

export default function AddUserModal({ currentRole }: { currentRole: UserRole }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 transition-colors"
      >
        <Plus className="-ml-1 mr-2 h-5 w-5" />
        Add New User
      </button>

      {isOpen && <AddUserModalContent onClose={() => setIsOpen(false)} currentRole={currentRole} />}
    </>
  );
}
