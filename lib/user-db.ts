import { db as firestoreDb } from "./firebase";
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, query, where, serverTimestamp } from "firebase/firestore";

export type UserRole = "super_admin" | "admin" | "employee" | "customer";

export interface User {
  id?: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  privileges?: string[]; // e.g. ["manage_products", "manage_orders"]
  isFirstLogin?: boolean;
  name?: string;
  createdAt?: any;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const usersRef = collection(firestoreDb, "users");
  const q = query(usersRef, where("email", "==", email.toLowerCase().trim()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const usersRef = collection(firestoreDb, "users");
  const q = query(usersRef, where("phone", "==", phone.trim()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const userDoc = doc(firestoreDb, "users", id);
  const snapshot = await getDoc(userDoc);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as User;
}

export async function createUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
  const usersRef = collection(firestoreDb, "users");
  const data = {
    ...user,
    email: user.email.toLowerCase().trim(),
    createdAt: serverTimestamp()
  };
  const docRef = await addDoc(usersRef, data);
  return { id: docRef.id, ...data };
}

export async function updateUser(id: string, updates: Partial<User>) {
  const userDoc = doc(firestoreDb, "users", id);
  await updateDoc(userDoc, updates);
}

export async function getAllEmployees(): Promise<User[]> {
  const usersRef = collection(firestoreDb, "users");
  const snapshot = await getDocs(usersRef);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as User))
    .filter(u => u.role === 'admin' || u.role === 'employee' || u.role === 'super_admin');
}
