import { NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/lib/user-db";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const adminEmail = "mmethsani@gmail.com";
    const existingAdmin = await getUserByEmail(adminEmail);
    
    if (existingAdmin) {
      return NextResponse.json({ message: "Admin already exists", user: existingAdmin });
    }

    const passwordHash = await hashPassword("Methsani123#");
    
    const newAdmin = await createUser({
      email: adminEmail,
      passwordHash,
      role: "super_admin",
      isFirstLogin: false,
      name: "Methsani",
      privileges: []
    });

    return NextResponse.json({ message: "Super admin seeded successfully", user: newAdmin });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
