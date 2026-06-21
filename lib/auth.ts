import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { UserRole } from "./user-db";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  privileges?: string[];
  isFirstLogin?: boolean;
}

/**
 * Maps the active NextAuth session to the application's legacy SessionPayload structure.
 * This ensures full compatibility across all Server Components, Layouts, and Pages.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const session = await auth();
  if (!session || !session.user) return null;
  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    role: session.user.role,
    privileges: session.user.privileges,
    isFirstLogin: session.user.isFirstLogin,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ==========================================
// DEPRECATED FUNCTIONS
// The functions below are deprecated and retained only for backward compatibility.
// Auth.js (NextAuth) automatically manages sessions, cookies, encryption, and decryption.
// ==========================================

export async function encrypt(_payload: SessionPayload) {
  console.warn("encrypt is deprecated, use Auth.js instead");
  return "";
}

export async function decrypt(_input: string): Promise<SessionPayload | null> {
  console.warn("decrypt is deprecated, use Auth.js instead");
  return null;
}

export async function createSession(_payload: SessionPayload) {
  console.warn("createSession is deprecated, use signIn from next-auth instead");
}

export async function updateSession(_payload: Partial<SessionPayload>) {
  console.warn("updateSession is deprecated, use next-auth session updates instead");
}


export async function destroySession() {
  console.warn("destroySession is deprecated, use signOut from next-auth instead");
}
