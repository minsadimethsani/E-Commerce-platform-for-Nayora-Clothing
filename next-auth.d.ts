import { DefaultSession } from "next-auth";
import { UserRole } from "@/lib/user-db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      privileges: string[];
      isFirstLogin?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: UserRole;
    privileges?: string[];
    isFirstLogin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    privileges?: string[];
    isFirstLogin?: boolean;
  }
}
