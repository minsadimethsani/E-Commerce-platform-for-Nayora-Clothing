import { db as firestoreDb } from "./firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from "firebase/firestore";
import { updateUser } from "./user-db";

export interface Role {
  id?: string;
  name: string;
  permissions: string[]; // e.g. ["manage_products", "manage_inventory", "manage_orders", "manage_users", "manage_roles"]
  isActive?: boolean;
  isAdmin?: boolean;
  granularPermissions?: Record<string, {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
  }>;
  createdAt?: any;
}

export async function getRoleById(id: string): Promise<Role | null> {
  try {
    const roleDoc = doc(firestoreDb, "roles", id);
    const snapshot = await getDoc(roleDoc);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Role;
  } catch (error) {
    console.error("Error getting role by id:", error);
    return null;
  }
}

export async function getAllRoles(): Promise<Role[]> {
  try {
    const rolesRef = collection(firestoreDb, "roles");
    const snapshot = await getDocs(rolesRef);
    const roles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
    
    // Sort roles by name
    roles.sort((a, b) => a.name.localeCompare(b.name));
    return roles;
  } catch (error) {
    console.error("Error getting all roles:", error);
    return [];
  }
}

export async function createRole(role: Omit<Role, "id" | "createdAt">): Promise<Role> {
  try {
    const rolesRef = collection(firestoreDb, "roles");
    const data = {
      ...role,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(rolesRef, data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
}

export async function updateRole(id: string, updates: Partial<Role>): Promise<void> {
  try {
    const roleDoc = doc(firestoreDb, "roles", id);
    await updateDoc(roleDoc, updates);
    
    // If permissions changed, propagate to all users with this roleId
    if (updates.permissions) {
      await syncUserPermissions(id, updates.permissions);
    }
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
}

export async function deleteRole(id: string): Promise<void> {
  try {
    // Check if any user is assigned to this role before deleting
    const usersRef = collection(firestoreDb, "users");
    const q = query(usersRef, where("roleId", "==", id));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error("Cannot delete role. There are users assigned to this role.");
    }
    
    const roleDoc = doc(firestoreDb, "roles", id);
    await deleteDoc(roleDoc);
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
}

async function syncUserPermissions(roleId: string, permissions: string[]): Promise<void> {
  try {
    const usersRef = collection(firestoreDb, "users");
    const q = query(usersRef, where("roleId", "==", roleId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;
    
    const promises = snapshot.docs.map(userDoc => {
      return updateUser(userDoc.id, { privileges: permissions });
    });
    
    await Promise.all(promises);
  } catch (error) {
    console.error("Error syncing user permissions:", error);
  }
}
