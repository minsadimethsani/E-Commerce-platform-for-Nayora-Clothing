import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, getUserByPhone } from "@/lib/user-db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const identifier = credentials.identifier as string;
        const password = credentials.password as string;

        if (!identifier || !password) {
          throw new Error("Please enter both email/phone and password.");
        }

        // Check email first, then phone
        let user = await getUserByEmail(identifier);
        if (!user) {
          user = await getUserByPhone(identifier);
        }

        if (!user) {
          throw new Error("Invalid credentials.");
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid credentials.");
        }

        return {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          role: user.role,
          privileges: user.privileges || [],
          isFirstLogin: user.isFirstLogin,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours (matching original jose session time)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.privileges = (user as any).privileges;
        token.isFirstLogin = (user as any).isFirstLogin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.privileges = token.privileges as string[];
        session.user.isFirstLogin = token.isFirstLogin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.AUTH_SECRET,
});
